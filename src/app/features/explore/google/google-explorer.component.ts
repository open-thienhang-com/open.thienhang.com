import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import {
  GoogleAuthUrlResponse,
  GoogleConnectResponse,
  GoogleCost,
  GoogleCredential,
  GoogleCredentialsResponse,
  GoogleDomainService,
  GoogleDriveFilesResponse,
  GoogleFeatures,
  GoogleGmailProfileResponse,
  GoogleIntegration,
  GoogleIntegrationListResponse,
  GoogleOverview,
  GoogleQuality,
  GoogleServicesRollup,
  GoogleSummary,
  GoogleVersion
} from '../../../core/services/google-domain.service';

type GoogleSection = 'connect' | 'credentials' | 'services' | 'inventory' | 'governance' | 'scripts';
type OAuthUiState = 'idle' | 'creating_auth_url' | 'redirecting_to_google' | 'processing_callback' | 'connected' | 'error';

interface SidebarSection {
  key: GoogleSection;
  label: string;
  icon: string;
  description: string;
}

interface SectionResource<T> {
  loading: boolean;
  data: T;
  error: string;
}

@Component({
  selector: 'app-google-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule
  ],
  templateUrl: './google-explorer.component.html',
  styleUrls: ['./google-explorer.component.scss']
})
export class GoogleExplorerComponent implements OnInit {
  readonly sections: SidebarSection[] = [
    { key: 'connect', label: 'Connect', icon: 'pi pi-google', description: 'OAuth consent flow and callback handling' },
    { key: 'credentials', label: 'Credentials', icon: 'pi pi-id-card', description: 'Connected Google accounts and token status' },
    { key: 'services', label: 'Drive + Gmail', icon: 'pi pi-envelope', description: 'Inspect Drive files and Gmail profile by credential' },
    { key: 'inventory', label: 'Inventory', icon: 'pi pi-table', description: 'Read-only Google integrations inventory and detail' },
    { key: 'governance', label: 'Governance', icon: 'pi pi-shield', description: 'Quality, cost, features, and service rollup' },
    { key: 'scripts', label: 'Developer Tools', icon: 'pi pi-code', description: 'CLI snippets and automation scripts' }
  ];

  readonly cliSnippets = [
    { label: 'List Integrations', desc: 'Fetch all Google integrations', command: 'curl "http://localhost:8080/data-mesh/domains/google/integrations?skip=0&limit=20"' },
    { label: 'Summary', desc: 'Get Google domain health and totals', command: 'curl "http://localhost:8080/data-mesh/domains/google/summary"' },
    { label: 'Quality Score', desc: 'Get data quality metrics', command: 'curl "http://localhost:8080/data-mesh/domains/google/quality"' },
    { label: 'OAuth Credentials', desc: 'List connected Google accounts', command: 'curl "http://localhost:8080/data-mesh/domains/google/credentials"' }
  ];

  readonly automationScript = `#!/bin/bash
# Sync Google Cloud Projects
PROJECTS=("project-a" "project-b")
API_BASE="http://localhost:8080/data-mesh/domains/google"

for PRJ in "\${PROJECTS[@]}"; do
  echo "Syncing project $PRJ..."
  curl -X GET "$API_BASE/integrations?project_id=$PRJ"
done`;

  activeSection: GoogleSection = 'connect';
  globalLoading = true;
  oauthState: OAuthUiState = 'idle';
  oauthMessage = '';
  selectedCredentialId = '';
  selectedServiceView: 'drive' | 'gmail' = 'drive';

  serviceFilter = '';
  projectFilter = '';
  ownerFilter = '';
  statusFilter = '';
  searchFilter = '';

  private readonly loadedSections = new Set<GoogleSection>();

  overviewState = this.createState<GoogleOverview | null>(null);
  summaryState = this.createState<GoogleSummary | null>(null);
  authConfigState = this.createState<GoogleAuthUrlResponse | null>(null);
  connectionState = this.createState<GoogleConnectResponse | null>(null);
  credentialsState = this.createState<GoogleCredentialsResponse | null>(null);
  driveState = this.createState<GoogleDriveFilesResponse | null>(null);
  gmailState = this.createState<GoogleGmailProfileResponse | null>(null);
  integrationsState = this.createState<GoogleIntegrationListResponse | null>(null);
  rootIntegrationsState = this.createState<GoogleIntegrationListResponse | null>(null);
  integrationDetailState = this.createState<GoogleIntegration | null>(null);
  servicesState = this.createState<GoogleServicesRollup | null>(null);
  qualityState = this.createState<GoogleQuality | null>(null);
  costState = this.createState<GoogleCost | null>(null);
  featuresState = this.createState<GoogleFeatures | null>(null);
  versionState = this.createState<GoogleVersion | null>(null);

  constructor(
    private readonly googleService: GoogleDomainService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        this.oauthState = 'error';
        this.oauthMessage = 'Google connection was cancelled or rejected.';
        this.loadDashboard();
        return;
      }

      if (code && state) {
        this.processCallback(code, state);
        return;
      }

      this.loadDashboard();
    });
  }

  switchSection(section: GoogleSection): void {
    this.activeSection = section;
    this.loadSectionData(section);
  }

  loadDashboard(force = true): void {
    this.globalLoading = true;
    forkJoin({
      overview: this.googleService.getOverview().pipe(catchError(error => of({ __error: error } as const))),
      summary: this.googleService.getSummary().pipe(catchError(error => of({ __error: error } as const)))
    }).subscribe(result => {
      this.applyState(this.overviewState, result.overview);
      this.applyState(this.summaryState, result.summary);
      this.loadSectionData(this.activeSection, force);
    });
  }

  createAuthUrl(): void {
    this.oauthState = 'creating_auth_url';
    this.authConfigState.loading = true;
    this.authConfigState.error = '';

    this.googleService.getAuthorizationUrl().subscribe({
      next: data => {
        this.authConfigState = { loading: false, data, error: '' };
        this.oauthState = 'idle';
      },
      error: error => {
        this.authConfigState = { loading: false, data: null, error: this.getErrorMessage(error) };
        this.oauthState = 'error';
        this.oauthMessage = this.authConfigState.error;
      }
    });
  }

  startGoogleConnect(): void {
    this.oauthState = 'creating_auth_url';
    this.oauthMessage = '';

    this.googleService.getAuthorizationUrl().subscribe({
      next: data => {
        this.authConfigState = { loading: false, data, error: '' };
        this.oauthState = 'redirecting_to_google';
        window.location.href = data.authorization_url;
      },
      error: error => {
        this.oauthState = 'error';
        this.oauthMessage = this.getErrorMessage(error);
        this.authConfigState = { loading: false, data: null, error: this.oauthMessage };
      }
    });
  }

  refreshCredential(credentialId: string): void {
    this.globalLoading = true;
    this.googleService.refreshCredential(credentialId).subscribe({
      next: data => {
        this.connectionState = { loading: false, data, error: '' };
        this.oauthState = 'connected';
        this.oauthMessage = `Credential ${credentialId} refreshed successfully.`;
        this.loadCredentials(true);
      },
      error: error => {
        this.globalLoading = false;
        this.oauthMessage = this.getErrorMessage(error);
      }
    });
  }

  disconnectCredential(credentialId: string): void {
    this.globalLoading = true;
    this.googleService.disconnectCredential(credentialId).subscribe({
      next: () => {
        if (this.selectedCredentialId === credentialId) {
          this.selectedCredentialId = '';
          this.driveState = this.createState<GoogleDriveFilesResponse | null>(null);
          this.gmailState = this.createState<GoogleGmailProfileResponse | null>(null);
          this.driveState.loading = false;
          this.gmailState.loading = false;
        }
        this.oauthMessage = `Credential ${credentialId} disconnected.`;
        this.loadCredentials(true);
      },
      error: error => {
        this.globalLoading = false;
        this.oauthMessage = this.getErrorMessage(error);
      }
    });
  }

  openDriveForCredential(credentialId: string): void {
    this.selectedCredentialId = credentialId;
    this.selectedServiceView = 'drive';
    this.activeSection = 'services';
    this.loadSectionData('services', true);
  }

  openGmailForCredential(credentialId: string): void {
    this.selectedCredentialId = credentialId;
    this.selectedServiceView = 'gmail';
    this.activeSection = 'services';
    this.loadSectionData('services', true);
  }

  loadInventory(force = false): void {
    this.globalLoading = true;
    this.integrationsState.loading = true;
    this.rootIntegrationsState.loading = true;
    this.integrationsState.error = '';
    this.rootIntegrationsState.error = '';

    const filters = {
      skip: 0,
      limit: 20,
      service: this.serviceFilter,
      project_id: this.projectFilter,
      owner: this.ownerFilter,
      status: this.statusFilter,
      search: this.searchFilter
    };

    forkJoin({
      integrations: this.googleService.getIntegrations(filters).pipe(catchError(error => of({ __error: error } as const))),
      root: this.googleService.getRootIntegrations(filters).pipe(catchError(error => of({ __error: error } as const)))
    }).subscribe(result => {
      this.applyState(this.integrationsState, result.integrations);
      this.applyState(this.rootIntegrationsState, result.root);
      this.loadedSections.add('inventory');

      const initialIntegrationId = this.integrationDetailState.data?.id || this.integrationsState.data?.data?.[0]?.id;
      if (initialIntegrationId) {
        this.selectIntegration(initialIntegrationId);
      } else {
        this.integrationDetailState = { loading: false, data: null, error: '' };
        this.globalLoading = false;
      }

      if (!force) {
        this.loadedSections.add('inventory');
      }
    });
  }

  selectIntegration(integrationId: string): void {
    this.integrationDetailState.loading = true;
    this.integrationDetailState.error = '';

    this.googleService.getIntegrationDetail(integrationId).subscribe({
      next: data => {
        this.integrationDetailState = { loading: false, data, error: '' };
        this.globalLoading = false;
      },
      error: error => {
        this.integrationDetailState = { loading: false, data: null, error: this.getErrorMessage(error) };
        this.globalLoading = false;
      }
    });
  }

  clearInventoryFilters(): void {
    this.serviceFilter = '';
    this.projectFilter = '';
    this.ownerFilter = '';
    this.statusFilter = '';
    this.searchFilter = '';
    this.loadInventory(true);
  }

  get activeSectionMeta(): SidebarSection {
    return this.sections.find(section => section.key === this.activeSection) || this.sections[0];
  }

  get summaryCards(): Array<{ label: string; value: string; caption: string; icon: string; tone: string }> {
    return [
      { label: 'Total integrations', value: `${this.readNumber('total_integrations')}`, caption: 'Inventory records tracked by the Google domain', icon: 'pi pi-table', tone: 'blue' },
      { label: 'Healthy', value: `${this.readNumber('healthy_integrations')}`, caption: 'Integrations currently marked healthy', icon: 'pi pi-check-circle', tone: 'emerald' },
      { label: 'Degraded', value: `${this.readNumber('degraded_integrations')}`, caption: 'Integrations needing follow-up or refresh', icon: 'pi pi-exclamation-triangle', tone: 'orange' },
      { label: 'Projects', value: `${this.readNumber('projects')}`, caption: 'Google Cloud projects referenced in inventory', icon: 'pi pi-folder-open', tone: 'purple' }
    ];
  }

  get serviceOptions(): Array<{ label: string; value: string }> {
    const values = new Set<string>();
    (this.integrationsState.data?.data || []).forEach(item => values.add(item.service));
    return [{ label: 'All services', value: '' }, ...Array.from(values).sort().map(value => ({ label: value, value }))];
  }

  get statusOptions(): Array<{ label: string; value: string }> {
    const values = new Set<string>();
    (this.integrationsState.data?.data || []).forEach(item => values.add(item.status));
    return [{ label: 'All statuses', value: '' }, ...Array.from(values).sort().map(value => ({ label: value, value }))];
  }

  get credentialOptions(): Array<{ label: string; value: string }> {
    return (this.credentialsState.data?.data || []).map(item => ({
      label: item.google_account_email,
      value: item.credential_id
    }));
  }

  get rootIntegrationTotal(): number {
    return this.rootIntegrationsState.data?.total || 0;
  }

  get integrationTotal(): number {
    return this.integrationsState.data?.total || 0;
  }

  get rollupItems(): Array<{ service: string; total: number; healthy?: number; degraded?: number }> {
    return this.servicesState.data?.services || this.servicesState.data?.data || [];
  }

  get monthlyCostLabel(): string {
    const amount = this.costState.data?.monthly_estimated_usd;
    return typeof amount === 'number' ? `$${amount.toLocaleString()}` : '-';
  }

  get coveragePercent(): string {
    const coverage = this.qualityState.data?.coverage;
    return typeof coverage === 'number' ? `${Math.round(coverage * 100)}%` : '-';
  }

  getSeverity(status?: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    switch ((status || '').toLowerCase()) {
      case 'connected':
      case 'active':
      case 'healthy':
      case 'connected_ok':
      case 'success':
        return 'success';
      case 'warning':
      case 'degraded':
      case 'expiring':
      case 'processing':
      case 'creating_auth_url':
      case 'redirecting_to_google':
      case 'processing_callback':
        return 'warn';
      case 'offline':
      case 'error':
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  }

  formatDate(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  metadataEntries(metadata?: Record<string, unknown>): Array<{ key: string; value: string }> {
    return Object.entries(metadata || {}).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }));
  }

  trackByCredential(index: number, item: GoogleCredential): string {
    return item.credential_id || `${index}`;
  }

  trackByIntegration(index: number, item: GoogleIntegration): string {
    return item.id || `${index}`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // In a real app, we'd show a toast here.
      console.log('Copied to clipboard');
    });
  }

  reloadServices(view: 'drive' | 'gmail'): void {
    this.selectedServiceView = view;
    this.loadSectionData('services', true);
  }

  costNotes(cost: GoogleCost | null | undefined): string[] {
    return cost?.notes || [];
  }

  fallbackText(value?: string | null, fallback = '-'): string {
    return value || fallback;
  }

  numberOrFallback(value?: number | null): number | string {
    return typeof value === 'number' ? value : '-';
  }

  private processCallback(code: string, state: string): void {
    this.globalLoading = true;
    this.oauthState = 'processing_callback';
    this.oauthMessage = '';

    this.googleService.exchangeCode(code, state).subscribe({
      next: data => {
        this.connectionState = { loading: false, data, error: '' };
        this.selectedCredentialId = data.credential_id;
        this.oauthState = 'connected';
        this.oauthMessage = `Connected ${data.linked_account}`;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
        this.activeSection = 'credentials';
        this.loadDashboard();
        this.loadCredentials(true);
      },
      error: error => {
        this.connectionState = { loading: false, data: null, error: this.getErrorMessage(error) };
        this.oauthState = 'error';
        this.oauthMessage = this.connectionState.error;
        this.globalLoading = false;
      }
    });
  }

  private loadCredentials(force = false): void {
    this.credentialsState.loading = true;
    this.credentialsState.error = '';

    this.googleService.getCredentials().subscribe({
      next: data => {
        this.credentialsState = { loading: false, data, error: '' };
        if (!this.selectedCredentialId) {
          this.selectedCredentialId = data.data?.[0]?.credential_id || '';
        }
        this.loadedSections.add('credentials');
        if (this.activeSection !== 'services') {
          this.globalLoading = false;
        } else {
          this.loadServiceData(force);
        }
      },
      error: error => {
        this.credentialsState = { loading: false, data: null, error: this.getErrorMessage(error) };
        this.globalLoading = false;
      }
    });
  }

  private loadServiceData(_force = false): void {
    if (!this.selectedCredentialId) {
      this.globalLoading = false;
      return;
    }

    if (this.selectedServiceView === 'drive') {
      this.driveState.loading = true;
      this.driveState.error = '';
      this.googleService.getDriveFiles(this.selectedCredentialId).subscribe({
        next: data => {
          this.driveState = { loading: false, data, error: '' };
          this.loadedSections.add('services');
          this.globalLoading = false;
        },
        error: error => {
          this.driveState = { loading: false, data: null, error: this.getErrorMessage(error) };
          this.globalLoading = false;
        }
      });
      return;
    }

    this.gmailState.loading = true;
    this.gmailState.error = '';
    this.googleService.getGmailProfile(this.selectedCredentialId).subscribe({
      next: data => {
        this.gmailState = { loading: false, data, error: '' };
        this.loadedSections.add('services');
        this.globalLoading = false;
      },
      error: error => {
        this.gmailState = { loading: false, data: null, error: this.getErrorMessage(error) };
        this.globalLoading = false;
      }
    });
  }

  loadSectionData(section: GoogleSection, force = false): void {
    if (!force && this.loadedSections.has(section)) {
      this.globalLoading = false;
      return;
    }

    switch (section) {
      case 'connect':
        if (!this.authConfigState.data && !this.authConfigState.loading) {
          this.createAuthUrl();
        } else {
          this.globalLoading = false;
        }
        this.loadedSections.add(section);
        break;
      case 'credentials':
        this.globalLoading = true;
        this.loadCredentials(force);
        break;
      case 'services':
        this.globalLoading = true;
        if (!this.credentialsState.data?.data?.length || force) {
          this.loadCredentials(force);
        } else {
          if (!this.selectedCredentialId) {
            this.selectedCredentialId = this.credentialsState.data.data[0]?.credential_id || '';
          }
          this.loadServiceData(force);
        }
        break;
      case 'inventory':
        this.loadInventory(force);
        break;
      case 'governance':
        this.globalLoading = true;
        this.qualityState.loading = true;
        this.costState.loading = true;
        this.featuresState.loading = true;
        this.versionState.loading = true;
        this.servicesState.loading = true;

        forkJoin({
          quality: this.googleService.getQuality().pipe(catchError(error => of({ __error: error } as const))),
          cost: this.googleService.getCost().pipe(catchError(error => of({ __error: error } as const))),
          features: this.googleService.getFeatures().pipe(catchError(error => of({ __error: error } as const))),
          version: this.googleService.getVersion().pipe(catchError(error => of({ __error: error } as const))),
          services: this.googleService.getServices().pipe(catchError(error => of({ __error: error } as const)))
        }).subscribe(result => {
          this.applyState(this.qualityState, result.quality);
          this.applyState(this.costState, result.cost);
          this.applyState(this.featuresState, result.features);
          this.applyState(this.versionState, result.version);
          this.applyState(this.servicesState, result.services);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;
    }
  }

  private readNumber(key: string): number | string {
    const value = this.summaryState.data?.[key];
    return typeof value === 'number' ? value : '-';
  }

  private createState<T>(data: T): SectionResource<T> {
    return { loading: false, data, error: '' };
  }

  private applyState<T>(state: SectionResource<T>, result: T | { __error: unknown }): void {
    if (this.hasError(result)) {
      state.loading = false;
      state.error = this.getErrorMessage(result.__error);
      return;
    }

    state.loading = false;
    state.error = '';
    state.data = result;
  }

  private hasError<T>(value: T | { __error: unknown }): value is { __error: unknown } {
    return !!value && typeof value === 'object' && '__error' in value;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          return 'Google authorization request is invalid.';
        case 404:
          return 'Requested Google resource was not found.';
        case 502:
          return 'Google service is temporarily unavailable. Please try again.';
        default:
          return error.error?.message || error.message || `HTTP ${error.status}`;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unable to load Google integration data.';
  }
}
