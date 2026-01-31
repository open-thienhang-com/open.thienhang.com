import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataMeshServices, Domain } from '../../../core/services/data-mesh.services';
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
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';

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
    TooltipModule,
    DividerModule,
    DialogModule
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

  // Filter options
  statusOptions: any[] = [];

  // Dialog
  selectedDomain: Domain | null = null;
  showDetailDialog = false;
  loadingDetail = false;

  // APIs Dialog
  showApisDialog = false;
  loadingApis = false;
  selectedDomainForApis: Domain | null = null;
  domainApis: any[] = [];
  filteredApis: any[] = [];
  apiSearchTerm = '';
  totalApiCount = 0;

  constructor(
    private dataMeshServices: DataMeshServices,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private i18nService: I18nService,
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
    
    // Extract unique teams from domains for filter
    if (this.domains.length > 0) {
      const uniqueTeams = [...new Set(this.domains.map(d => d.team).filter(t => t && t.trim() !== ''))];
      // You can add team filter dropdown if needed
    }
  }

  loadDomainsList(): void {
    this.loading = true;
    this.loadingService.showPageLoading('Loading domains...', 'data-flow');

    this.dataMeshServices.getDomainCatalog().subscribe({
      next: (response) => {
        console.log('Domains loaded:', response.data);
        if (response.success && response.data) {
          // Use full domain data from API response
          this.domains = response.data;
          this.filteredDomains = [...this.domains];
          this.loading = false;
          this.loadingService.hide();

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.domains.length} domains`
          });
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

  loadDomainDetails(domainKey: string): void {
    this.loadingDetail = true;

    this.dataMeshServices.getDomainDetails(domainKey).subscribe({
      next: (response) => {
        console.log('Domain details loaded:', response.data);
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

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'inactive': return 'bg-slate-100 text-slate-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  showDomainApis(domain: Domain): void {
    this.selectedDomainForApis = domain;
    this.loadApis(domain.domain_key);
  }

  viewDomainDataProducts(domain: Domain): void {
    this.router.navigate(['/data-mesh/data-products', domain.domain_key]);
  }

  loadApis(domainKey: string): void {
    this.loadingApis = true;
    this.showApisDialog = true;

    this.dataMeshServices.getApisByDomain(domainKey, { include_dynamic: true, size: 10, offset: 0 }).subscribe({
      next: (response) => {
        if (response.success && response.data && Array.isArray(response.data)) {
          this.domainApis = response.data;
          this.filteredApis = [...this.domainApis];
          this.totalApiCount = this.domainApis.length;
          this.loadingApis = false;
        } else {
          this.loadingApis = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load APIs'
          });
        }
      },
      error: (error) => {
        console.error('Error loading APIs:', error);
        this.loadingApis = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load APIs'
        });
      }
    });
  }

  filterApis(): void {
    if (!this.apiSearchTerm) {
      this.filteredApis = [...this.domainApis];
    } else {
      const term = this.apiSearchTerm.toLowerCase();
      this.filteredApis = this.domainApis.filter(api =>
        api.path.toLowerCase().includes(term) ||
        api.description.toLowerCase().includes(term) ||
        api.method.toLowerCase().includes(term) ||
        api.data_product.toLowerCase().includes(term)
      );
    }
  }

  closeApisDialog(): void {
    this.showApisDialog = false;
    this.selectedDomainForApis = null;
    this.domainApis = [];
    this.filteredApis = [];
    this.apiSearchTerm = '';
  }
}
