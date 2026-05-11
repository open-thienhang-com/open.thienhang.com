import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppBaseComponent } from '../../core/base/app-base.component';
import { DataProdItemComponent } from './data-prod-item/data-prod-item.component';
import { DataProdDetailComponent } from './data-prod-detail/data-prod-detail.component';
import { DataProductServices } from '../../core/services/data.product.services';

// PrimeNG Imports
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-data-product',
  imports: [
    CommonModule,
    FormsModule,
    DataProdItemComponent,
    DataProdDetailComponent,
    Button,
    InputTextModule,
    DropdownModule,
    SelectButtonModule,
    PaginatorModule,
    DialogModule
  ],
  templateUrl: './data-product.component.html',
  standalone: true,
})
export class DataProductComponent extends AppBaseComponent implements OnInit {
  dataProds: any[] = [];
  filteredProducts: any[] = [];
  selectedProduct: any = null;
  showDetailModal: boolean = false;
  isModalOpening: boolean = false; // Prevent rapid clicking

  // Stats
  totalProducts: number = 0;
  activeProducts: number = 0;
  totalSubscribers: number = 0;
  domains: number = 0;

  // Search and Filters
  searchTerm: string = '';
  selectedDomain: any = null;
  selectedStatus: any = null;
  viewMode: string = 'grid';

  // Pagination
  itemsPerPage: number = 12;
  totalRecords: number = 0;
  currentPage: number = 0;

  // Dropdown Options
  domainOptions = [
    { label: 'Customer Analytics', value: 'customer' },
    { label: 'Sales Intelligence', value: 'sales' },
    { label: 'Marketing Insights', value: 'marketing' },
    { label: 'Financial Reporting', value: 'finance' },
    { label: 'Operations Data', value: 'operations' },
    { label: 'Product Analytics', value: 'product' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Development', value: 'development' },
    { label: 'Deprecated', value: 'deprecated' },
    { label: 'Beta', value: 'beta' }
  ];

  viewModeOptions = [
    { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' },
    { label: 'List', value: 'list', icon: 'pi pi-list' }
  ];

  constructor(private injector: Injector, private dataProdServices: DataProductServices) {
    super(injector);
  }

  ngOnInit() {
    this.loadDataProducts();
    this.calculateStats();
  }

  loadDataProducts() {
    // Mock data for demonstration - replace with actual service call
    const mockProducts = [
      {
        id: '1',
        name: 'Customer 360 Analytics',
        description: 'Comprehensive customer data aggregated from all touchpoints including CRM, support, and marketing interactions.',
        domain: 'customer',
        status: 'active',
        team: 'Customer Analytics Team',
        owner: 'Sarah Johnson',
        version: '2.1.0',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-25T14:30:00Z',
        subscribers: 45,
        sla: '99.9%',
        freshness: 'Real-time',
        quality_score: 98,
        tags: ['Customer', 'Analytics', 'Real-time', 'High-Quality'],
        metrics: {
          monthly_queries: 12500,
          data_volume: '2.5TB',
          avg_response_time: '150ms'
        },
        schema: {
          tables: 8,
          columns: 156,
          last_updated: '2024-01-25T14:30:00Z'
        },
        apis: [
          { name: 'Customer Profile API', endpoint: '/api/v2/customers/{id}/profile' },
          { name: 'Customer Journey API', endpoint: '/api/v2/customers/{id}/journey' }
        ]
      },
      {
        id: '2',
        name: 'Sales Performance Dashboard',
        description: 'Real-time sales metrics, forecasting data, and performance analytics across all regions and products.',
        domain: 'sales',
        status: 'active',
        team: 'Sales Intelligence',
        owner: 'Michael Chen',
        version: '1.8.2',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-24T16:15:00Z',
        subscribers: 32,
        sla: '99.5%',
        freshness: 'Hourly',
        quality_score: 95,
        tags: ['Sales', 'Dashboard', 'Forecasting', 'Regional'],
        metrics: {
          monthly_queries: 8900,
          data_volume: '1.2TB',
          avg_response_time: '200ms'
        },
        schema: {
          tables: 12,
          columns: 89,
          last_updated: '2024-01-24T16:15:00Z'
        },
        apis: [
          { name: 'Sales Metrics API', endpoint: '/api/v1/sales/metrics' },
          { name: 'Forecast API', endpoint: '/api/v1/sales/forecast' }
        ]
      },
      {
        id: '3',
        name: 'Marketing Campaign Analytics',
        description: 'Multi-channel marketing campaign performance, attribution modeling, and customer acquisition metrics.',
        domain: 'marketing',
        status: 'beta',
        team: 'Marketing Data Science',
        owner: 'Emily Rodriguez',
        version: '3.0.0-beta',
        created_at: '2024-01-20T11:30:00Z',
        updated_at: '2024-01-26T10:45:00Z',
        subscribers: 18,
        sla: '99.0%',
        freshness: 'Daily',
        quality_score: 92,
        tags: ['Marketing', 'Attribution', 'Multi-channel', 'Beta'],
        metrics: {
          monthly_queries: 5600,
          data_volume: '800GB',
          avg_response_time: '300ms'
        },
        schema: {
          tables: 6,
          columns: 67,
          last_updated: '2024-01-26T10:45:00Z'
        },
        apis: [
          { name: 'Campaign API', endpoint: '/api/v3/marketing/campaigns' },
          { name: 'Attribution API', endpoint: '/api/v3/marketing/attribution' }
        ]
      },
      {
        id: '4',
        name: 'Financial Reporting Suite',
        description: 'Comprehensive financial data including P&L, balance sheets, cash flow, and regulatory reporting datasets.',
        domain: 'finance',
        status: 'active',
        team: 'Finance Technology',
        owner: 'David Kim',
        version: '4.2.1',
        created_at: '2023-12-01T08:00:00Z',
        updated_at: '2024-01-23T12:00:00Z',
        subscribers: 67,
        sla: '99.8%',
        freshness: 'Daily',
        quality_score: 99,
        tags: ['Finance', 'Reporting', 'Regulatory', 'Critical'],
        metrics: {
          monthly_queries: 15600,
          data_volume: '3.8TB',
          avg_response_time: '120ms'
        },
        schema: {
          tables: 24,
          columns: 298,
          last_updated: '2024-01-23T12:00:00Z'
        },
        apis: [
          { name: 'Financial Reports API', endpoint: '/api/v4/finance/reports' },
          { name: 'Regulatory API', endpoint: '/api/v4/finance/regulatory' }
        ]
      },
      {
        id: '5',
        name: 'Supply Chain Insights',
        description: 'End-to-end supply chain visibility including inventory, logistics, supplier performance, and demand forecasting.',
        domain: 'operations',
        status: 'active',
        team: 'Operations Analytics',
        owner: 'Lisa Wang',
        version: '2.5.3',
        created_at: '2024-01-05T07:30:00Z',
        updated_at: '2024-01-25T09:20:00Z',
        subscribers: 28,
        sla: '99.2%',
        freshness: 'Real-time',
        quality_score: 96,
        tags: ['Supply Chain', 'Logistics', 'Forecasting', 'Real-time'],
        metrics: {
          monthly_queries: 9800,
          data_volume: '1.8TB',
          avg_response_time: '180ms'
        },
        schema: {
          tables: 15,
          columns: 178,
          last_updated: '2024-01-25T09:20:00Z'
        },
        apis: [
          { name: 'Inventory API', endpoint: '/api/v2/operations/inventory' },
          { name: 'Logistics API', endpoint: '/api/v2/operations/logistics' }
        ]
      },
      {
        id: '6',
        name: 'Product Usage Analytics',
        description: 'User behavior, feature adoption, engagement metrics, and product performance analytics across all platforms.',
        domain: 'product',
        status: 'development',
        team: 'Product Analytics',
        owner: 'Alex Thompson',
        version: '1.0.0-dev',
        created_at: '2024-01-22T13:00:00Z',
        updated_at: '2024-01-26T15:30:00Z',
        subscribers: 12,
        sla: '95.0%',
        freshness: 'Near real-time',
        quality_score: 88,
        tags: ['Product', 'Usage', 'Engagement', 'Development'],
        metrics: {
          monthly_queries: 3400,
          data_volume: '650GB',
          avg_response_time: '250ms'
        },
        schema: {
          tables: 10,
          columns: 124,
          last_updated: '2024-01-26T15:30:00Z'
        },
        apis: [
          { name: 'Usage Analytics API', endpoint: '/api/v1/product/usage' },
          { name: 'Engagement API', endpoint: '/api/v1/product/engagement' }
        ]
      }
    ];

    // Simulate API response
    setTimeout(() => {
      this.dataProds = mockProducts;
      this.filteredProducts = [...this.dataProds];
      this.totalRecords = this.dataProds.length;
      this.filterProducts();
      this.calculateStats();
    }, 500);

    // Uncomment for actual API call:
    // this.dataProdServices.getDataProducts({}).subscribe(res => {
    //   this.dataProds = res.data;
    //   this.filteredProducts = [...this.dataProds];
    //   this.totalRecords = this.dataProds.length;
    //   this.filterProducts();
    // });
  }

  calculateStats() {
    this.totalProducts = this.dataProds.length;
    this.activeProducts = this.dataProds.filter(p => p.status === 'active').length;
    this.totalSubscribers = this.dataProds.reduce((sum, p) => sum + (p.subscribers || 0), 0);
    this.domains = [...new Set(this.dataProds.map(p => p.domain))].length;
  }

  filterProducts() {
    this.filteredProducts = this.dataProds.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesDomain = !this.selectedDomain || product.domain === this.selectedDomain;
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;

      return matchesSearch && matchesDomain && matchesStatus;
    });

    this.totalRecords = this.filteredProducts.length;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDomain = null;
    this.selectedStatus = null;
    this.filterProducts();
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.itemsPerPage = event.rows;
    // Implement pagination logic here
  }

  trackByProduct(index: number, product: any): any {
    return product.id;
  }

  // Action Methods
  showCatalog() {
    console.log('Show product catalog');
    // Implement catalog view
  }

  createProduct() {
    console.log('Create new data product');
    // Implement product creation
  }

  viewProductDetail(product: any) {
    // Prevent rapid clicking and modal conflicts
    if (this.isModalOpening || this.showDetailModal) {
      return;
    }
    
    this.isModalOpening = true;
    
    // Ensure clean state before opening new modal
    this.closeDetailModal();
    
    // Set the selected product and show modal
    setTimeout(() => {
      this.selectedProduct = product;
      this.showDetailModal = true;
      this.isModalOpening = false;
    }, 50); // Small delay to ensure previous modal is fully closed
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.isModalOpening = false;
    // Clear the selected product after a short delay to prevent flickering
    setTimeout(() => {
      this.selectedProduct = null;
    }, 300);
  }

  subscribeToProduct(product: any) {
    console.log('Subscribe to product:', product.name);
    // Implement subscription logic
    product.subscribers = (product.subscribers || 0) + 1;
    this.calculateStats();
    this.showSuccess(`Successfully subscribed to ${product.name}`);
  }

  unsubscribeFromProduct(product: any) {
    console.log('Unsubscribe from product:', product.name);
    // Implement unsubscription logic
    product.subscribers = Math.max((product.subscribers || 0) - 1, 0);
    this.calculateStats();
    this.showSuccess(`Successfully unsubscribed from ${product.name}`);
  }
}
