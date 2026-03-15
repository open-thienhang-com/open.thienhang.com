import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DatabricksCost,
  DatabricksDomainService,
  DatabricksFeatures,
  DatabricksHealth,
  DatabricksJob,
  DatabricksListResponse,
  DatabricksModel,
  DatabricksOverview,
  DatabricksQuality,
  DatabricksSqlAsset,
  DatabricksSummary,
  DatabricksVersion,
  DatabricksWorkspace
} from '../../../core/services/databricks-domain.service';

type WarehouseSection = 'overview' | 'workspaces' | 'sql-assets' | 'jobs' | 'models' | 'governance';

interface SidebarSection {
  key: WarehouseSection;
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
  selector: 'app-data-warehouse-explorer',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  templateUrl: './data-warehouse-explorer.component.html',
  styleUrls: ['./data-warehouse-explorer.component.scss']
})
export class DataWarehouseExplorerComponent implements OnInit {
  readonly sections: SidebarSection[] = [
    { key: 'overview', label: 'Overview', icon: 'pi pi-home', description: 'Workspace status, summary, and live mode posture' },
    { key: 'workspaces', label: 'Workspaces', icon: 'pi pi-building', description: 'Connected Databricks workspaces and sync status' },
    { key: 'sql-assets', label: 'SQL Assets', icon: 'pi pi-database', description: 'Warehouses and SQL catalog inventory' },
    { key: 'jobs', label: 'Jobs', icon: 'pi pi-sliders-h', description: 'Databricks workflows, schedules, and run state' },
    { key: 'models', label: 'ML Models', icon: 'pi pi-sparkles', description: 'MLflow model registry metadata and fallback state' },
    { key: 'governance', label: 'Governance', icon: 'pi pi-shield', description: 'Quality, cost, features, and build metadata' }
  ];

  activeSection: WarehouseSection = 'overview';
  selectedWorkspaceId = '';
  globalLoading = true;
  private readonly loadedSections = new Set<WarehouseSection>();

  overviewState = this.createState<DatabricksOverview | null>(null);
  summaryState = this.createState<DatabricksSummary | null>(null);
  healthState = this.createState<DatabricksHealth | null>(null);
  qualityState = this.createState<DatabricksQuality | null>(null);
  costState = this.createState<DatabricksCost | null>(null);
  featuresState = this.createState<DatabricksFeatures | null>(null);
  versionState = this.createState<DatabricksVersion | null>(null);
  workspacesState = this.createState<DatabricksListResponse<DatabricksWorkspace> | null>(null);
  workspacesRootState = this.createState<DatabricksListResponse<DatabricksWorkspace> | null>(null);
  workspaceDetailState = this.createState<DatabricksWorkspace | null>(null);
  sqlAssetsState = this.createState<DatabricksListResponse<DatabricksSqlAsset> | null>(null);
  jobsState = this.createState<DatabricksListResponse<DatabricksJob> | null>(null);
  modelsState = this.createState<DatabricksListResponse<DatabricksModel> | null>(null);

  constructor(private readonly databricksService: DatabricksDomainService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  switchSection(section: WarehouseSection): void {
    this.activeSection = section;
    this.loadSectionData(section);
  }

  loadDashboard(force = true): void {
    this.globalLoading = true;

    forkJoin({
      summary: this.databricksService.getSummary().pipe(catchError(error => of({ __error: error } as const))),
      health: this.databricksService.getHealth().pipe(catchError(error => of({ __error: error } as const)))
    }).subscribe(result => {
      this.applyState(this.summaryState, result.summary);
      this.applyState(this.healthState, result.health);
      this.loadSectionData(this.activeSection, force);
    });
  }

  selectWorkspace(workspaceId: string): void {
    if (!workspaceId) return;

    this.selectedWorkspaceId = workspaceId;
    this.workspaceDetailState.loading = true;
    this.workspaceDetailState.error = '';

    this.databricksService.getWorkspaceDetail(workspaceId).subscribe({
      next: data => {
        this.workspaceDetailState = {
          loading: false,
          data,
          error: ''
        };
        this.globalLoading = false;
      },
      error: error => {
        this.workspaceDetailState = {
          loading: false,
          data: null,
          error: this.getErrorMessage(error)
        };
        this.globalLoading = false;
      }
    });
  }

  get activeSectionMeta(): SidebarSection {
    return this.sections.find(section => section.key === this.activeSection) || this.sections[0];
  }

  get summaryCards() {
    const summary = this.summaryState.data;
    const quality = this.qualityState.data;
    const health = this.healthState.data;

    return [
      { label: 'Connected workspaces', value: summary ? `${summary.connected_workspaces}/${summary.total_workspaces}` : '-', caption: 'Active Databricks workspace connections', icon: 'pi pi-building', tone: 'blue' },
      { label: 'SQL assets', value: summary ? `${summary.sql_assets}` : '-', caption: 'Warehouses and catalog objects discovered', icon: 'pi pi-database', tone: 'orange' },
      { label: 'Jobs + models', value: summary ? `${summary.jobs + summary.models}` : '-', caption: 'Workflow and ML inventory combined', icon: 'pi pi-sparkles', tone: 'emerald' },
      { label: 'Health', value: health ? health.status : '-', caption: quality ? `Quality score ${quality.score}` : 'Health status from live integration', icon: 'pi pi-shield', tone: 'purple' }
    ];
  }

  get allErrors(): string[] {
    const errors = new Set<string>();
    [
      this.summaryState.data?.errors,
      this.healthState.data?.errors,
      this.workspacesState.data?.errors,
      this.workspacesRootState.data?.errors,
      this.sqlAssetsState.data?.errors,
      this.jobsState.data?.errors,
      this.modelsState.data?.errors
    ].forEach(list => (list || []).forEach(item => errors.add(item)));

    return Array.from(errors);
  }

  get cloudBreakdown(): Array<{ key: string; value: number }> {
    return Object.entries(this.summaryState.data?.clouds || {}).map(([key, value]) => ({ key, value }));
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
      case 'live':
      case 'production':
      case 'online':
      case 'active':
        return 'success';
      case 'warning':
      case 'staging':
      case 'degraded':
      case 'stopped':
        return 'warn';
      case 'offline':
      case 'error':
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

  trackById(index: number, item: { id: string }): string {
    return item.id || `${index}`;
  }

  private createState<T>(data: T): SectionResource<T> {
    return { loading: true, data, error: '' };
  }

  private loadSectionData(section: WarehouseSection, force = false): void {
    if (!force && this.loadedSections.has(section)) {
      this.globalLoading = false;
      return;
    }

    switch (section) {
      case 'overview':
        this.overviewState.loading = true;
        this.overviewState.error = '';
        this.qualityState.loading = true;
        this.qualityState.error = '';
        this.costState.loading = true;
        this.costState.error = '';
        this.featuresState.loading = true;
        this.featuresState.error = '';

        forkJoin({
          overview: this.databricksService.getOverview().pipe(catchError(error => of({ __error: error } as const))),
          quality: this.databricksService.getQuality().pipe(catchError(error => of({ __error: error } as const))),
          cost: this.databricksService.getCost().pipe(catchError(error => of({ __error: error } as const))),
          features: this.databricksService.getFeatures().pipe(catchError(error => of({ __error: error } as const)))
        }).subscribe(result => {
          this.applyState(this.overviewState, result.overview);
          this.applyState(this.qualityState, result.quality);
          this.applyState(this.costState, result.cost);
          this.applyState(this.featuresState, result.features);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;

      case 'workspaces':
        this.workspacesState.loading = true;
        this.workspacesState.error = '';
        this.workspacesRootState.loading = true;
        this.workspacesRootState.error = '';
        this.workspaceDetailState.loading = true;
        this.workspaceDetailState.error = '';

        forkJoin({
          workspaces: this.databricksService.getWorkspaces().pipe(catchError(error => of({ __error: error } as const))),
          workspacesRoot: this.databricksService.getRootWorkspaces().pipe(catchError(error => of({ __error: error } as const)))
        }).subscribe(result => {
          this.applyState(this.workspacesState, result.workspaces);
          this.applyState(this.workspacesRootState, result.workspacesRoot);

          const targetWorkspaceId = this.selectedWorkspaceId || this.workspacesState.data?.data?.[0]?.id || '';
          if (targetWorkspaceId) {
            this.selectWorkspace(targetWorkspaceId);
          } else {
            this.workspaceDetailState = {
              loading: false,
              data: null,
              error: ''
            };
            this.globalLoading = false;
          }

          this.loadedSections.add(section);
        });
        break;

      case 'sql-assets':
        this.sqlAssetsState.loading = true;
        this.sqlAssetsState.error = '';

        this.databricksService.getSqlAssets().pipe(catchError(error => of({ __error: error } as const))).subscribe(result => {
          this.applyState(this.sqlAssetsState, result);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;

      case 'jobs':
        this.jobsState.loading = true;
        this.jobsState.error = '';

        this.databricksService.getJobs().pipe(catchError(error => of({ __error: error } as const))).subscribe(result => {
          this.applyState(this.jobsState, result);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;

      case 'models':
        this.modelsState.loading = true;
        this.modelsState.error = '';

        this.databricksService.getModels().pipe(catchError(error => of({ __error: error } as const))).subscribe(result => {
          this.applyState(this.modelsState, result);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;

      case 'governance':
        this.qualityState.loading = true;
        this.qualityState.error = '';
        this.costState.loading = true;
        this.costState.error = '';
        this.featuresState.loading = true;
        this.featuresState.error = '';
        this.versionState.loading = true;
        this.versionState.error = '';

        forkJoin({
          quality: this.databricksService.getQuality().pipe(catchError(error => of({ __error: error } as const))),
          cost: this.databricksService.getCost().pipe(catchError(error => of({ __error: error } as const))),
          features: this.databricksService.getFeatures().pipe(catchError(error => of({ __error: error } as const))),
          version: this.databricksService.getVersion().pipe(catchError(error => of({ __error: error } as const)))
        }).subscribe(result => {
          this.applyState(this.qualityState, result.quality);
          this.applyState(this.costState, result.cost);
          this.applyState(this.featuresState, result.features);
          this.applyState(this.versionState, result.version);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;
    }
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
      return error.error?.message || error.message || `HTTP ${error.status}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unable to load Databricks data.';
  }
}
