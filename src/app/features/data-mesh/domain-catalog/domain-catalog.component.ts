import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataMeshServices, Domain } from '../../../core/services/data-mesh.services';
import { LoadingService } from '../../../core/services/loading.service';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface DomainStats {
  totalDomains: number;
  activeDomains: number;
  totalDataProducts: number;
  totalApis: number;
}

@Component({
  selector: 'app-domain-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    SkeletonModule,
    DialogModule,
    ConfirmDialogModule
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
  viewMode: 'list' | 'card' = 'list';
  showFilters: boolean = false;

  filters = {
    status: '',
    team: ''
  };

  // Filter options
  statusOptions: any[] = [];
  teamOptions: any[] = [];

  // Stats
  stats: DomainStats = {
    totalDomains: 0,
    activeDomains: 0,
    totalDataProducts: 0,
    totalApis: 0
  };

  // Dialog
  selectedDomain: Domain | null = null;
  showDetailDialog = false;
  loadingDetail = false;

  constructor(
    private dataMeshServices: DataMeshServices,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setupFilterOptions();
    this.loadDomainsList();
  }

  setupFilterOptions(): void {
    this.statusOptions = [
      { label: 'All Status', value: '' },
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' }
    ];
  }

  loadDomainsList(): void {
    this.loading = true;
    this.loadingService.showPageLoading('Loading domains...', 'data-flow');

    this.dataMeshServices.getDomainCatalog().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.domains = response.data;
          this.filteredDomains = [...this.domains];
          this.updateStats();
          this.extractTeams();
          this.loading = false;
          this.loadingService.hide();
        } else {
          this.handleError('Failed to load domains catalog');
        }
      },
      error: (error) => {
        console.error('Error loading domains catalog:', error);
        this.handleError('Failed to load domains catalog');
      }
    });
  }

  updateStats(): void {
    this.stats.totalDomains = this.domains.length;
    this.stats.activeDomains = this.domains.filter(d => d.status === 'Active').length;
    this.stats.totalDataProducts = this.domains.reduce((acc, curr) => acc + (curr.data_products?.length || 0), 0);
    this.stats.totalApis = this.domains.reduce((acc, curr) => acc + this.getDomainApiCount(curr), 0);
  }

  extractTeams(): void {
    if (this.domains.length > 0) {
      const uniqueTeams = [...new Set(this.domains.map(d => d.team).filter(t => t && t.trim() !== ''))];
      this.teamOptions = [
        { label: 'All Teams', value: '' },
        ...uniqueTeams.map(team => ({ label: team, value: team }))
      ];
    }
  }

  loadDomainDetails(domainKey: string): void {
    this.loadingDetail = true;

    this.dataMeshServices.getDomainDetails(domainKey).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedDomain = response.data;
          this.loadingDetail = false;
          this.showDetailDialog = true;
        } else {
          this.loadingDetail = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load domain details'
          });
        }
      },
      error: (error) => {
        console.error('Error loading domain details:', error);
        this.loadingDetail = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load domain details'
        });
      }
    });
  }

  showDomainDetails(domain: Domain): void {
    this.loadDomainDetails(domain.domain_key);
  }

  viewDomainDetails(domain: Domain): void {
    this.router.navigate(['/data-mesh/catalogs', domain.domain_key]);
  }

  closeDomainDetails(): void {
    this.showDetailDialog = false;
    this.selectedDomain = null;
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

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
  }

  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  refreshDomains(): void {
    this.loadDomainsList();
  }

  applyFilters(): void {
    this.filteredDomains = this.domains.filter(domain => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm ||
        domain.name.toLowerCase().includes(searchLower) ||
        domain.display_name.toLowerCase().includes(searchLower) ||
        domain.description.toLowerCase().includes(searchLower) ||
        domain.domain_key.toLowerCase().includes(searchLower) ||
        (domain.tags && domain.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        (domain.team && domain.team.toLowerCase().includes(searchLower)) ||
        (domain.owner && domain.owner.toLowerCase().includes(searchLower));

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

  trackByDomainKey(index: number, domain: Domain): string {
    return domain.domain_key;
  }

  getDomainIcon(domainKey: string): string {
    const iconMap: { [key: string]: string } = {
      'application': 'pi-desktop',
      'hotel': 'pi-building',
      'blogger': 'pi-pencil',
      'chat': 'pi-comments',
      'files': 'pi-folder',
      'inventory': 'pi-box',
      'base': 'pi-database'
    };

    return iconMap[domainKey.toLowerCase()] || 'pi-sitemap';
  }

  getDomainGradient(domain: string | undefined): string {
    const gradients: { [key: string]: string } = {
      'hotel': 'radial-gradient(circle at top left, #4f46e5, #818cf8)',
      'application': 'radial-gradient(circle at top left, #0ea5e9, #38bdf8)',
      'finance': 'radial-gradient(circle at top left, #059669, #34d399)',
      'retail': 'radial-gradient(circle at top left, #d946ef, #f0abfc)',
      'healthcare': 'radial-gradient(circle at top left, #f43f5e, #fb7185)',
      'logistics': 'radial-gradient(circle at top left, #f59e0b, #fbbf24)',
      'blogger': 'radial-gradient(circle at top left, #ec4899, #f472b6)',
      'files': 'radial-gradient(circle at top left, #6366f1, #818cf8)',
      'default': 'radial-gradient(circle at top left, #475569, #94a3b8)'
    };
    return gradients[domain || 'default'] || gradients['default'];
  }


  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      default: return 'info';
    }
  }

  getDomainDataProductsCount(domain: Domain): number {
    return domain.data_products?.length || 0;
  }

  getDomainApiCount(domain: Domain): number {
    return (domain.data_products || []).reduce((total, product) => total + (product.endpoints_count || 0), 0);
  }

  exportDomains(): void {
    const rows = this.filteredDomains.map(domain => ({
      domain_key: domain.domain_key,
      display_name: domain.display_name,
      status: domain.status,
      owner: domain.owner,
      team: domain.team,
      data_products: this.getDomainDataProductsCount(domain),
      apis: this.getDomainApiCount(domain)
    }));

    const headers = Object.keys(rows[0] || {
      domain_key: '',
      display_name: '',
      status: '',
      owner: '',
      team: '',
      data_products: '',
      apis: ''
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(header => `"${String((row as any)[header] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'domain-catalog.csv';
    link.click();
    URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Export ready',
      detail: `Exported ${this.filteredDomains.length} domains`
    });
  }

  viewDomainDataProducts(domain: Domain): void {
    this.router.navigate(['/data-mesh/data-products', domain.domain_key]);
  }
}
