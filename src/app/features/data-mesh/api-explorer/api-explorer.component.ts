import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataMeshServices, ApiInfo } from '../../../core/services/data-mesh.services';
import { LoadingService } from '../../../core/services/loading.service';
import { LoadingComponent } from '../../../shared/component/loading/loading.component';
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
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-api-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
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
    TabViewModule,
    AccordionModule,
    PanelModule,
    TooltipModule,
    CheckboxModule
  ],
  templateUrl: './api-explorer.component.html',
  styleUrls: ['./api-explorer.component.scss'],
  providers: [MessageService]
})
export class ApiExplorerComponent implements OnInit {
  apis: ApiInfo[] = [];
  filteredApis: ApiInfo[] = [];
  groupedApis: { [key: string]: ApiInfo[] } = {};
  loading = false;
  searchTerm = '';
  
  filters = {
    domain: '',
    method: '',
    source: '',
    includeDynamic: true
  };

  viewMode: 'grouped' | 'table' = 'grouped';
  
  // Pagination
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  hasNext = false;

  // Filter options
  domainOptions: any[] = [];
  methodOptions = [
    { label: 'All Methods', value: '' },
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'PATCH', value: 'PATCH' }
  ];
  sourceOptions = [
    { label: 'All Sources', value: '' },
    { label: 'Config', value: 'config' },
    { label: 'Router', value: 'router' }
  ];

  constructor(
    private dataMeshServices: DataMeshServices,
    private messageService: MessageService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadApis();
    this.loadDomainOptions();
  }

  loadApis(): void {
    this.loading = true;
    this.loadingService.showPageLoading('Loading API endpoints...', 'data-flow');

    const params = {
      include_dynamic: this.filters.includeDynamic,
      size: this.pageSize,
      offset: this.currentPage * this.pageSize,
      domain: this.filters.domain || undefined
    };

    this.dataMeshServices.getApis(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.apis = response.data.apis;
          this.groupedApis = response.data.grouped_by_domain;
          this.totalRecords = response.total || 0;
          this.hasNext = response.data.pagination?.has_next || false;
          this.applyFilters();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.apis.length} API endpoints`
          });
        } else {
          this.handleError(response.message || 'Failed to load APIs');
        }
        this.loading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading APIs:', error);
        this.handleError('Failed to load APIs');
      }
    });
  }

  loadDomainOptions(): void {
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
        }
      },
      error: (error) => {
        console.error('Error loading domain options:', error);
      }
    });
  }

  formatDomainName(domainKey: string): string {
    return domainKey.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadApis();
  }

  applyFilters(): void {
    this.filteredApis = this.apis.filter(api => {
      const matchesSearch = !this.searchTerm || 
        api.path.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        api.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        api.data_product.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesMethod = !this.filters.method || api.method === this.filters.method;
      const matchesSource = !this.filters.source || api.source === this.filters.source;

      return matchesSearch && matchesMethod && matchesSource;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      domain: '',
      method: '',
      source: '',
      includeDynamic: true
    };
    this.currentPage = 0;
    this.loadApis();
  }

  setViewMode(mode: 'grouped' | 'table'): void {
    this.viewMode = mode;
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadApis();
  }

  handleError(message: string): void {
    this.apis = [];
    this.filteredApis = [];
    this.groupedApis = {};
    this.loading = false;
    this.loadingService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }

  getMethodSeverity(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET': return 'success';
      case 'POST': return 'info';
      case 'PUT': return 'warning';
      case 'DELETE': return 'danger';
      case 'PATCH': return 'secondary';
      default: return 'info';
    }
  }

  getSourceColor(source: string): string {
    switch (source.toLowerCase()) {
      case 'config': return '#3b82f6';
      case 'router': return '#10b981';
      default: return '#6b7280';
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'API endpoint copied to clipboard'
      });
    });
  }

  getDomainKeys(): string[] {
    return Object.keys(this.groupedApis);
  }

  trackByApiPath(index: number, api: ApiInfo): string {
    return api.full_path;
  }
}
