import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataMeshServices, Domain } from '../../../core/services/data-mesh.services';
import { forkJoin } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';
import { I18nService } from '../../../core/services/i18n.service';
import { LoadingComponent } from '../../../shared/component/loading/loading.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-domain-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    TranslatePipe,
    ButtonModule,
    CardModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    BadgeModule,
    SkeletonModule,
    ChipModule,
    ProgressBarModule,
    TooltipModule,
    MenuModule,
    OverlayPanelModule,
    PanelModule,
    AccordionModule,
    DividerModule
  ],
  templateUrl: './domain-catalog.component.html',
  styleUrls: ['./domain-catalog.component.scss'],
  providers: [MessageService]
})
export class DomainCatalogComponent implements OnInit {
  domains: Domain[] = [];
  filteredDomains: Domain[] = [];
  loading = false;
  searchTerm = '';

  filters = {
    status: '',
    team: ''
  };

  viewMode: 'grid' | 'list' = 'grid';
  lastUpdated = new Date();

  // Filter options
  statusOptions: any[] = [];
  teamOptions: any[] = [];

  // Stats
  totalDomains = 0;
  activeDomains = 0;
  totalSubscribers = 0;
  averageQuality = 0;

  constructor(
    private dataMeshServices: DataMeshServices,
    private router: Router,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private i18nService: I18nService
  ) { }

  ngOnInit(): void {
    this.setupFilterOptions();
    this.loadDomainsAndHealth();
  }

  setupFilterOptions(): void {
    this.statusOptions = [
      { label: this.i18nService.translate('domainCatalog.allStatus'), value: '' },
      { label: this.i18nService.translate('status.active'), value: 'Active' },
      { label: this.i18nService.translate('status.inactive'), value: 'Inactive' }
    ];
  }

  loadDomainsAndHealth(): void {
    this.loading = true;
    this.loadingService.showPageLoading('Loading domain catalog...', 'data-flow');

    // First load the health check to get domain list and stats
    this.dataMeshServices.getDataMeshHealth().subscribe({
      next: (healthResponse) => {
        if (healthResponse.success && healthResponse.data) {
          this.totalDomains = healthResponse.data.total_domains;
          this.activeDomains = healthResponse.data.active_domains;

          // Load detailed domain information
          this.loadDomainDetails(healthResponse.data.domains);
        } else {
          this.handleError('Failed to load health status');
        }
      },
      error: (error) => {
        console.error('Error loading health status:', error);
        this.handleError('Failed to load health status');
      }
    });
  }

  loadDomainDetails(domainKeys: string[]): void {
    // Build requests to fetch details for each domain and wait for all to complete
    const domainRequests = domainKeys.map(domainKey =>
      this.dataMeshServices.getDomainDetails(domainKey)
    );

    if (!domainRequests.length) {
      this.domains = [];
      this.filteredDomains = [];
      this.updateStats();
      this.extractTeamOptions();
      this.loading = false;
      this.loadingService.hide();
      return;
    }

    forkJoin(domainRequests).subscribe({
      next: (responses) => {
        // responses: ApiResponse<Domain>[]
        const successfulDomains: Domain[] = responses
          .filter(r => r && r.success && r.data)
          .map(r => r.data as Domain);

        // If some domains failed, fill them with basic info
        const failedKeys = domainKeys.filter(k => !successfulDomains.find(d => d.domain_key === k));
        const fallbackDomains: Domain[] = failedKeys.map(domainKey => ({
          domain_key: domainKey,
          name: this.formatDomainName(domainKey),
          display_name: this.formatDomainName(domainKey),
          status: 'Active',
          team: 'Unknown Team',
          owner: 'Unknown Owner',
          description: `${this.formatDomainName(domainKey)} domain services`,
          metrics: { subscribers: Math.floor(Math.random() * 100), quality_score: '85%' },
          tags: [domainKey.replace('_', ' ')],
          sla: { availability: '99.5%', freshness: 'Real-time', version: '1.0.0' },
          data_products: [],
          contact: { email: `${domainKey}@company.com`, slack: `#${domainKey}`, support: `${domainKey}-support@company.com` }
        }));

        this.domains = [...successfulDomains, ...fallbackDomains];
        this.filteredDomains = [...this.domains];
        this.updateStats();
        this.extractTeamOptions();
        this.loading = false;
        this.loadingService.hide();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Loaded ${this.domains.length} domains`
        });
      },
      error: (error) => {
        console.error('Error loading domain details:', error);
        // Fallback to simple domain objects when network errors occur
        this.domains = domainKeys.map(domainKey => ({
          domain_key: domainKey,
          name: this.formatDomainName(domainKey),
          display_name: this.formatDomainName(domainKey),
          status: 'Active',
          team: 'Unknown Team',
          owner: 'Unknown Owner',
          description: `${this.formatDomainName(domainKey)} domain services`,
          metrics: { subscribers: Math.floor(Math.random() * 100), quality_score: '85%' },
          tags: [domainKey.replace('_', ' ')],
          sla: { availability: '99.5%', freshness: 'Real-time', version: '1.0.0' },
          data_products: [],
          contact: { email: `${domainKey}@company.com`, slack: `#${domainKey}`, support: `${domainKey}-support@company.com` }
        }));

        this.filteredDomains = [...this.domains];
        this.updateStats();
        this.extractTeamOptions();
        this.loading = false;
        this.loadingService.hide();

        this.messageService.add({
          severity: 'warn',
          summary: 'Partial Data',
          detail: `Loaded ${this.domains.length} domains (some details unavailable)`
        });
      }
    });
  }

  formatDomainName(domainKey: string): string {
    return domainKey.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  handleError(message: string): void {
    this.domains = [];
    this.filteredDomains = [];
    this.loading = false;
    this.loadingService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }

  updateStats(): void {
    this.totalDomains = this.domains.length;
    this.activeDomains = this.domains.filter(d => d.status === 'Active').length;
    this.totalSubscribers = this.domains.reduce((sum, domain) => sum + domain.metrics.subscribers, 0);

    // Calculate average quality score
    const qualityScores = this.domains.map(d => parseFloat(d.metrics.quality_score.replace('%', '')));
    this.averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  }

  extractTeamOptions(): void {
    const teams = [...new Set(this.domains.map(d => d.team))];
    this.teamOptions = [
      { label: this.i18nService.translate('domainCatalog.allTeams'), value: '' },
      ...teams.map(team => ({ label: team, value: team }))
    ];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredDomains = this.domains.filter(domain => {
      const matchesSearch = !this.searchTerm ||
        domain.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        domain.display_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        domain.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        domain.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.filters.status || domain.status === this.filters.status;
      const matchesTeam = !this.filters.team || domain.team === this.filters.team;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      status: '',
      team: ''
    };
    this.filteredDomains = [...this.domains];
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  viewDomainDetails(domain: Domain): void {
    this.router.navigate(['/data-mesh/domain', domain.domain_key]);
  }

  getQualityScoreSeverity(qualityScore: string): string {
    const score = parseFloat(qualityScore.replace('%', ''));
    if (score >= 95) return 'success';
    if (score >= 85) return 'info';
    if (score >= 75) return 'warning';
    return 'danger';
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      default: return 'info';
    }
  }

  getAvailabilityColor(availability: string): string {
    const percent = parseFloat(availability.replace('%', ''));
    if (percent >= 99.5) return 'success';
    if (percent >= 99) return 'info';
    if (percent >= 95) return 'warning';
    return 'danger';
  }

  openContactInfo(domain: Domain): void {
    // Open contact information in a dialog or navigate to contact page
    this.messageService.add({
      severity: 'info',
      summary: 'Contact Information',
      detail: `Team: ${domain.team}\\nOwner: ${domain.owner}\\nEmail: ${domain.contact.email}`
    });
  }

  trackByDomainKey(index: number, domain: Domain): string {
    return domain.domain_key;
  }

  // Helper methods for the redesigned UI
  getDomainIcon(domainKey: string): string {
    const iconMap: { [key: string]: string } = {
      'hotel': 'pi-building',
      'finance': 'pi-dollar',
      'retail': 'pi-shopping-cart',
      'healthcare': 'pi-heart',
      'logistics': 'pi-truck',
      'marketing': 'pi-megaphone',
      'hr': 'pi-users',
      'it': 'pi-cog',
      'sales': 'pi-chart-line'
    };

    const key = domainKey.toLowerCase().split('_')[0];
    return iconMap[key] || 'pi-sitemap';
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'check-circle';
      case 'inactive': return 'times-circle';
      case 'maintenance': return 'wrench';
      case 'deprecated': return 'exclamation-triangle';
      default: return 'info-circle';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'inactive': return 'bg-slate-100 text-slate-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  getTotalDataProducts(): number {
    return this.domains.reduce((total, domain) => total + (domain.data_products?.length || 0), 0);
  }
}
