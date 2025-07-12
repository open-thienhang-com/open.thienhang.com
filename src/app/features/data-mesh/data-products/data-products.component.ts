import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataProductServices, DataProduct } from '../../../core/services/data.product.services';
import { LoadingService } from '../../../core/services/loading.service';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
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
    SelectModule,
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
    InputGroupAddonModule
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
  
  filters = {
    domain: '',
    status: '',
    owner: ''
  };

  viewMode: 'grid' | 'table' = 'grid';
  
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
    'application': '�',
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
    'default': '�'
  };

  constructor(
    private dataProductServices: DataProductServices,
    private router: Router,
    private messageService: MessageService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadDataProducts();
    this.loadDomainOptions();
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

  loadDomainOptions(): void {
    // Extract unique domains from data products
    if (!Array.isArray(this.dataProducts)) {
      this.domainOptions = [{ label: 'All Domains', value: '' }];
      return;
    }
    
    const uniqueDomains = [...new Set(this.dataProducts.map(product => product.domain))];
    this.domainOptions = [
      { label: 'All Domains', value: '' },
      ...uniqueDomains.map(domain => ({
        label: this.formatDomainName(domain || ''),
        value: domain
      }))
    ];
  }

  formatDomainName(domainKey: string): string {
    return domainKey.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  onSearch(): void {
    this.currentPage = 0;
    this.first = 0;
    this.loadDataProducts();
  }

  onFilterChange(): void {
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

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      domain: '',
      status: '',
      owner: ''
    };
    this.currentPage = 0;
    this.first = 0;
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

  getDomainImage(domain: string): string {
    return this.domainImageMap[domain] || this.domainImageMap['default'];
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'draft':
        return 'info';
      case 'archived':
        return 'warning';
      default:
        return 'info';
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
    // Navigate to the APIs page for this product
    if (product.domain && product.id) {
      this.router.navigate(['/data-mesh/data-products', product.domain, product.id, 'apis']);
    } else {
      this.router.navigate(['/data-mesh/data-products', product.id, 'apis']);
    }
  }
}
