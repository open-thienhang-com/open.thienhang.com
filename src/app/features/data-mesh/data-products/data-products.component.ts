import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataProductServices, DataProduct } from '../../../core/services/data.product.services';
import { DataMeshServices } from '../../../core/services/data-mesh.services';
import { LoadingService } from '../../../core/services/loading.service';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-data-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    BadgeModule,
    ChipModule,
    TableModule,
    PaginatorModule,
    ProgressBarModule,
    TooltipModule,
    DividerModule,
    SkeletonModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToolbarModule,
    DialogModule
  ],
  templateUrl: './data-products.component.html',
  styleUrls: ['./data-products.component.scss'],
  providers: [MessageService]
})
export class DataProductsComponent implements OnInit {
  dataProducts: DataProduct[] = [];
  filteredProducts: DataProduct[] = [];
  loading = false;
  searchTerm = '';
  viewMode: 'grid' | 'table' = 'grid';
  showFilters: boolean = false;
  isSimpleView: boolean = false;

  filters = {
    domain: '',
    status: '',
    owner: ''
  };

  // Pagination
  totalRecords = 0;
  pageSize = 12;
  currentPage = 0;
  first = 0;

  // Filter options
  domainOptions: any[] = [];
  statusOptions: any[] = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' }
  ];

  // Domain images mapping
  domainImageMap: { [key: string]: string } = {
    'application': '📱',
    'hotel': '🏨',
    'device_detector': '📱',
    'finance': '💰',
    'healthcare': '🏥',
    'education': '🎓',
    'retail': '🛍️',
    'logistics': '🚚',
    'manufacturing': '🏭',
    'energy': '⚡',
    'food': '🍕',
    'travel': '✈️',
    'sports': '⚽',
    'music': '🎵',
    'media': '📺',
    'gaming': '🎮',
    'social': '👥',
    'analytics': '📊',
    'security': '🔒',
    'iot': '🔌',
    'ai': '🤖',
    'ml': '🧠',
    'blockchain': '⛓️',
    'cloud': '☁️',
    'mobile': '📱',
    'web': '🌐',
    'api': '🔗',
    'database': '🗄️',
    'default': '📱'
  };

  selectedDomain: string | null = null;
  
  // Product Detail Dialog
  showProductDetailsDialog = false;
  selectedProductForDetails: DataProduct | null = null;

  constructor(
    private dataProductServices: DataProductServices,
    private dataMeshServices: DataMeshServices,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    // Load domain options first
    this.loadDomainOptions();

    // Check if domain parameter exists in route
    this.route.params.subscribe(params => {
      if (params['domain']) {
        this.selectedDomain = params['domain'];
        this.filters.domain = params['domain'];
        this.loadDataProductsByDomain(params['domain']);
      } else {
        // Clear domain filter if no domain in route
        this.selectedDomain = null;
        this.filters.domain = '';
        this.loadDataProducts();
      }
    });
  }

  loadDataProducts(): void {
    this.loading = true;
    this.loadingService.showPageLoading('Loading data products...', 'data-flow');

    const params = {
      size: this.pageSize,
      offset: this.currentPage * this.pageSize,
      domain: this.filters.domain || undefined,
      status: this.filters.status || undefined,
      search: this.searchTerm || undefined
    };

    this.dataProductServices.getDataProducts(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataProducts = Array.isArray(response.data) ? response.data : [];
          this.totalRecords = response.total || this.dataProducts.length;
          this.applyFilters();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.dataProducts.length} data products`,
            life: 3000
          });
        } else {
          this.handleError(response.message || 'Failed to load data products');
        }
        this.loading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading data products:', error);
        this.handleError('Failed to load data products');
      }
    });
  }

  loadDataProductsByDomain(domain: string): void {
    this.loading = true;
    this.loadingService.showPageLoading(`Loading data products for ${domain}...`, 'data-flow');

    this.dataProductServices.getDataProductsByDomain(domain).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataProducts = Array.isArray(response.data) ? response.data : [];
          this.totalRecords = response.total || this.dataProducts.length;
          this.filteredProducts = [...this.dataProducts];
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.dataProducts.length} data products for ${domain}`,
            life: 3000
          });
        } else {
          this.handleError(response.message || `Failed to load data products for ${domain}`);
        }
        this.loading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error(`Error loading data products for ${domain}:`, error);
        this.handleError(`Failed to load data products for ${domain}`);
      }
    });
  }

  loadDomainOptions(): void {
    // Load domains from API
    this.dataMeshServices.getDomainsList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.domainOptions = [
            { label: 'All Domains', value: '' },
            ...response.data.map(domain => ({
              label: this.formatDomainName(domain),
              value: domain
            }))
          ];

          // If domain is selected from route, set it in filter
          if (this.selectedDomain) {
            const domainOption = this.domainOptions.find(opt => opt.value === this.selectedDomain);
            if (domainOption) {
              this.filters.domain = this.selectedDomain;
            }
          }
        } else {
          this.domainOptions = [{ label: 'All Domains', value: '' }];
        }
      },
      error: (error) => {
        console.error('Error loading domains:', error);
        this.domainOptions = [{ label: 'All Domains', value: '' }];
      }
    });
  }

  formatDomainName(domainKey: string): string {
    if (!domainKey) return '';
    return domainKey.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  onFilterChange(): void {
    // When domain filter changes, navigate to the domain-specific route
    if (this.filters.domain && this.filters.domain.trim() !== '') {
      // Navigate to domain-specific route
      this.router.navigate(['/data-mesh/data-products', this.filters.domain]);
    } else {
      // Navigate back to all data products
      this.router.navigate(['/data-mesh/data-products']);
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  toggleSimpleView(): void {
    this.isSimpleView = !this.isSimpleView;
  }

  onSearch(): void {
    this.currentPage = 0;
    this.first = 0;
    this.loadDataProducts();
  }

  applyFilters(): void {
    if (!Array.isArray(this.dataProducts)) {
      this.filteredProducts = [];
      return;
    }

    this.filteredProducts = this.dataProducts.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (product.domain && product.domain.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesDomain = !this.filters.domain || product.domain === this.filters.domain;
      const matchesStatus = !this.filters.status || product.status === this.filters.status;

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }

  // Getter methods for template logic
  get isSearchActive(): boolean {
    return !!this.searchTerm && this.searchTerm.trim().length > 0;
  }

  get isFiltersActive(): boolean {
    return !!this.filters.domain || !!this.filters.status || !!this.filters.owner;
  }

  get hasSearchOrFilters(): boolean {
    return this.isSearchActive || this.isFiltersActive;
  }

  get activeProductsCount(): number {
    return this.dataProducts.filter(product => (product.status || 'active').toLowerCase() === 'active').length;
  }

  get visibleProductsCount(): number {
    return this.dataProducts.length;
  }

  get domainCount(): number {
    const domains = new Set(
      this.dataProducts
        .map(product => product.domain)
        .filter((domain): domain is string => !!domain)
    );
    return domains.size;
  }

  get activeFilterCount(): number {
    return (this.searchTerm ? 1 : 0)
      + (this.filters.domain ? 1 : 0)
      + (this.filters.status ? 1 : 0)
      + (this.filters.owner ? 1 : 0);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      domain: '',
      status: '',
      owner: ''
    };
    this.currentPage = 0;
    this.first = 0;
    this.router.navigate(['/data-mesh/data-products']);
  }

  refreshProducts(): void {
    if (this.selectedDomain) {
      this.loadDataProductsByDomain(this.selectedDomain);
      return;
    }
    this.loadDataProducts();
  }

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.first = event.first;
    this.loadDataProducts();
  }

  viewProductDetails(product: DataProduct): void {
    // Navigate to the data product detail page
    if (product.domain && product.id) {
      this.router.navigate(['/data-mesh/data-products', product.domain, product.id]);
    } else {
      this.router.navigate(['/data-mesh/data-products', product.id]);
    }
  }

  openProductQuickView(product: DataProduct): void {
    this.selectedProductForDetails = product;
    this.showProductDetailsDialog = true;
  }

  openProductApplication(product: DataProduct): void {
    const routeMap: { [key: string]: string } = {
      retail: '/retail/fresh-retail',
      hotel: '/hotel',
      blogger: '/blogger',
      travel: '/travel',
      logistics: '/planning/fleet',
      finance: '/applications',
      application: '/applications'
    };

    const targetRoute = routeMap[product.domain || ''] || '/applications';
    this.router.navigateByUrl(targetRoute);
  }

  subscribeToProduct(product: DataProduct): void {
    this.dataProductServices.subscribeToProduct(product.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Successfully subscribed to ${product.name}`,
            life: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error subscribing to product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to subscribe to product',
          life: 3000
        });
      }
    });
  }

  handleError(message: string): void {
    this.dataProducts = [];
    this.filteredProducts = [];
    this.loading = false;
    this.loadingService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  getDomainDisplayName(domain: string): string {
    return this.formatDomainName(domain);
  }

  getDomainImagePath(domain: string): string {
    const imageMap: { [key: string]: string } = {
      application: 'assets/data-products/default.svg',
      hotel: 'assets/data-products/hotel.svg',
      device_detector: 'assets/data-products/default.svg',
      finance: 'assets/data-products/finance.svg',
      healthcare: 'assets/data-products/finance.svg',
      education: 'assets/data-products/default.svg',
      retail: 'assets/data-products/retail.svg',
      logistics: 'assets/data-products/logistics.svg',
      manufacturing: 'assets/data-products/logistics.svg',
      energy: 'assets/data-products/finance.svg',
      food: 'assets/data-products/retail.svg',
      travel: 'assets/data-products/travel.svg',
      sports: 'assets/data-products/default.svg',
      music: 'assets/data-products/blogger.svg',
      media: 'assets/data-products/blogger.svg',
      gaming: 'assets/data-products/default.svg',
      social: 'assets/data-products/blogger.svg',
      analytics: 'assets/data-products/finance.svg',
      security: 'assets/data-products/finance.svg',
      iot: 'assets/data-products/logistics.svg',
      ai: 'assets/data-products/default.svg',
      ml: 'assets/data-products/default.svg',
      blockchain: 'assets/data-products/finance.svg',
      cloud: 'assets/data-products/default.svg',
      mobile: 'assets/data-products/default.svg',
      web: 'assets/data-products/default.svg',
      api: 'assets/data-products/default.svg',
      database: 'assets/data-products/default.svg',
      blogger: 'assets/data-products/blogger.svg'
    };

    return imageMap[domain] || 'assets/data-products/default.svg';
  }

  getDomainImage(domain: string): string {
    return this.domainImageMap[domain] || this.domainImageMap['default'];
  }

  getProductGradient(domain: string | undefined): string {
    const gradients: { [key: string]: string } = {
      'hotel': 'linear-gradient(135deg, #8965e0 0%, #bc61da 100%)',
      'application': 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)',
      'finance': 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
      'retail': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      'healthcare': 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
      'logistics': 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      'blogger': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return gradients[domain || 'default'] || gradients['default'];
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'draft': return 'info';
      case 'archived': return 'warning';
      default: return 'info';
    }
  }

  trackByProductId(index: number, product: DataProduct): string {
    return product.id;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewProductApis(product: DataProduct): void {
    if (product.domain && product.id) {
      this.router.navigate(['/data-mesh/data-products', product.domain, product.id, 'apis']);
    } else {
      this.router.navigate(['/data-mesh/data-products', product.id, 'apis']);
    }
  }
}
