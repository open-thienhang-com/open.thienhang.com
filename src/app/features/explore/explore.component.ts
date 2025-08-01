import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { DataAssetsService } from '../data-mesh-management/assets-tab/data-assets.service';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { TreeNode } from 'primeng/api';
import { forkJoin } from 'rxjs';

// Interface definitions based on API documentation
interface Asset {
  _id: string;
  kid?: string;
  name: string;
  type: string;
  subtype?: string;
  source?: string;
  location?: string;
  owner: string;
  sensitivity: string;
  classification?: string;
  status: string;
  tags: string[];
  description: string;
  created_at: string;
  updated_at: string;
  domain?: {
    domain_id: string;
    domain_name: string;
    domain_owner: string;
  };
  data_product?: {
    product_id: string;
    product_name: string;
    product_owner: string;
    version: string;
  };
  icon?: string;
  image?: string;
  freeAccess?: boolean;
}

interface FilterOptions {
  types: string[];
  owners: string[];
  tags: string[];
  status: string[];
  sensitivity: string[];
  domains: string[];
}

interface AssetStatistics {
  total: number;
  byType: { [key: string]: number };
  byStatus: { [key: string]: number };
  bySensitivity: { [key: string]: number };
  byDomain: { [key: string]: number };
}

interface DomainNode {
  id: string;
  name: string;
  types: { id: string; name: string; count?: number }[];
  children: DomainNode[];
}

@Component({
    selector: 'app-explore',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        TableModule,
        TagModule,
        TooltipModule,
        DropdownModule,
        InputTextModule,
        PaginatorModule,
        DialogModule,
        TreeModule,
        DataViewModule,
        OrderListModule
    ],
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
    // Asset data
    assets: Asset[] = [];
    totalRecords: number = 0;
    loadingAssets: boolean = false;
    errorAssets: string = '';

    // Filter options from API
    filterOptions: FilterOptions = {
        types: [],
        owners: [],
        tags: [],
        status: [],
        sensitivity: [],
        domains: []
    };

    // Filter values
    searchQuery: string = '';
    typeFilter: string = '';
    ownerFilter: string = '';
    statusFilter: string = '';
    sensitivityFilter: string = '';
    domainFilter: string = '';
    tagsFilter: string[] = [];

    // Pagination
    currentPage: number = 0;
    pageSize: number = 10;

    // View mode
    viewMode: 'list' | 'grid' | 'order' = 'grid';

    // Domain tree for sidebar
    domainTree: TreeNode[] = [];
    selectedDomain: TreeNode | null = null;

    // Statistics
    statistics: AssetStatistics | null = null;

    // Loading states
    loadingFilters: boolean = false;
    loadingTree: boolean = false;
    loadingStats: boolean = false;

    constructor(
        private dataAssetsService: DataAssetsService, 
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initializeComponent();
    }

    private initializeComponent(): void {
        // Load all initial data with individual error handling
        this.loadingFilters = true;
        this.loadingTree = true;
        this.loadingStats = true;

        // Load filters
        this.dataAssetsService.getFilterOptions().subscribe({
            next: (response) => {
                this.handleFiltersResponse(response);
                this.loadingFilters = false;
            },
            error: (error) => {
                console.warn('Failed to load filter options, using defaults:', error);
                this.filterOptions = this.getDefaultFilterOptions();
                this.loadingFilters = false;
            }
        });

        // Load domain tree
        this.dataAssetsService.getDomainsTree().subscribe({
            next: (response) => {
                this.handleTreeResponse(response);
                this.loadingTree = false;
            },
            error: (error) => {
                console.warn('Failed to load domain tree, using defaults:', error);
                this.domainTree = this.getDefaultDomainTree();
                this.loadingTree = false;
            }
        });

        // Load statistics
        this.dataAssetsService.getAssetStatistics().subscribe({
            next: (response) => {
                this.handleStatisticsResponse(response);
                this.loadingStats = false;
            },
            error: (error) => {
                console.warn('Failed to load statistics, using defaults:', error);
                this.statistics = this.getDefaultStatistics();
                this.loadingStats = false;
            }
        });

        // Always try to load assets regardless of other API failures
        this.fetchAssets();
    }

    private handleFiltersResponse(response: any): void {
        if (response?.data && Object.keys(response.data).length > 0) {
            this.filterOptions = response.data;
        } else {
            // Provide default filter options when API returns empty
            this.filterOptions = this.getDefaultFilterOptions();
        }
    }

    private getDefaultFilterOptions(): FilterOptions {
        return {
            types: ['database', 'table', 'mlmodel', 'dashboard', 'pipeline', 'api', 'file', 'container', 's3', 'topic', 'stream', 'cache', 'route', 'notebook'],
            owners: ['customer.team@company.com', 'sales.team@company.com', 'product.team@company.com', 'finance.team@company.com', 'data.team@company.com'],
            tags: ['customer', 'pii', 'gdpr', 'sales', 'product', 'finance', 'analytics', 'critical', 'public'],
            status: ['active', 'deprecated', 'archived'],
            sensitivity: ['low', 'medium', 'high'],
            domains: ['customer', 'sales', 'product', 'finance']
        };
    }

    private handleTreeResponse(response: any): void {
        if (response?.data?.domains && response.data.domains.length > 0) {
            this.domainTree = this.convertToTreeNodes(response.data.domains);
        } else {
            // Provide default domain tree when API returns empty or no data
            this.domainTree = this.getDefaultDomainTree();
        }
    }

    private getDefaultDomainTree(): TreeNode[] {
        const defaultDomains = [
            {
                id: 'customer',
                name: 'Customer Domain',
                types: [
                    { id: 'database', name: 'Database', count: 0 },
                    { id: 'table', name: 'Table', count: 0 },
                    { id: 'api', name: 'API', count: 0 }
                ],
                children: []
            },
            {
                id: 'sales',
                name: 'Sales Domain',
                types: [
                    { id: 'database', name: 'Database', count: 0 },
                    { id: 'dashboard', name: 'Dashboard', count: 0 },
                    { id: 'pipeline', name: 'Pipeline', count: 0 }
                ],
                children: []
            },
            {
                id: 'product',
                name: 'Product Domain',
                types: [
                    { id: 'table', name: 'Table', count: 0 },
                    { id: 'api', name: 'API', count: 0 },
                    { id: 'file', name: 'File', count: 0 }
                ],
                children: []
            },
            {
                id: 'finance',
                name: 'Finance Domain',
                types: [
                    { id: 'database', name: 'Database', count: 0 },
                    { id: 'mlmodel', name: 'ML Model', count: 0 },
                    { id: 'dashboard', name: 'Dashboard', count: 0 }
                ],
                children: []
            }
        ];
        return this.convertToTreeNodes(defaultDomains);
    }

    private handleStatisticsResponse(response: any): void {
        if (response?.data) {
            this.statistics = response.data;
        } else {
            // Provide default statistics when API returns empty
            this.statistics = this.getDefaultStatistics();
        }
    }

    private getDefaultStatistics(): AssetStatistics {
        return {
            total: 0,
            byType: {
                'database': 0,
                'table': 0,
                'mlmodel': 0,
                'dashboard': 0,
                'pipeline': 0,
                'api': 0
            },
            byStatus: {
                'active': 0,
                'deprecated': 0,
                'archived': 0
            },
            bySensitivity: {
                'high': 0,
                'medium': 0,
                'low': 0
            },
            byDomain: {
                'customer': 0,
                'sales': 0,
                'product': 0,
                'finance': 0
            }
        };
    }

    private convertToTreeNodes(domains: DomainNode[]): TreeNode[] {
        return domains.map(domain => ({
            label: `${domain.name} (${this.getTotalAssetsInDomain(domain)})`,
            key: domain.id,
            data: domain,
            icon: 'pi pi-folder',
            children: domain.types.map(type => ({
                label: `${type.name} (${type.count || 0})`,
                key: `${domain.id}_${type.id}`,
                data: { ...type, domainId: domain.id },
                icon: this.getTypeIcon(type.id),
                leaf: true
            }))
        }));
    }

    private getTotalAssetsInDomain(domain: DomainNode): number {
        return domain.types.reduce((sum, type) => sum + (type.count || 0), 0);
    }

    private getTypeIcon(type: string): string {
        switch (type) {
            case 'database': return 'pi pi-database';
            case 'table': return 'pi pi-table';
            case 'mlmodel': return 'pi pi-chart-line';
            case 'pipeline': return 'pi pi-directions';
            case 'dashboard': return 'pi pi-chart-bar';
            case 'api': return 'pi pi-globe';
            case 'file': return 'pi pi-file';
            case 'container': return 'pi pi-box';
            case 's3': return 'pi pi-cloud';
            case 'topic': return 'pi pi-telegram';
            case 'stream': return 'pi pi-bolt';
            default: return 'pi pi-file';
        }
    }

    fetchAssets(): void {
        this.loadingAssets = true;
        this.errorAssets = '';

        const params = this.buildQueryParams();

        this.dataAssetsService.getAssets(params).subscribe({
            next: (response) => {
                if (response?.data) {
                    this.assets = response.data.map((asset: any) => this.normalizeAsset(asset));
                    this.totalRecords = response.total || 0;
                } else {
                    this.assets = [];
                    this.totalRecords = 0;
                }
                this.loadingAssets = false;
            },
            error: (error) => {
                console.error('Error fetching assets:', error);
                this.errorAssets = 'Failed to load assets';
                this.assets = [];
                this.totalRecords = 0;
                this.loadingAssets = false;
            }
        });
    }

    private buildQueryParams(): any {
        const params: any = {
            limit: this.pageSize,
            offset: this.currentPage * this.pageSize
        };

        if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
        if (this.typeFilter) params.type = this.typeFilter;
        if (this.ownerFilter) params.owner = this.ownerFilter;
        if (this.statusFilter) params.status = this.statusFilter;
        if (this.sensitivityFilter) params.sensitivity = this.sensitivityFilter;
        if (this.domainFilter) params.domain = this.domainFilter;
        if (this.tagsFilter.length > 0) params.tags = this.tagsFilter.join(',');

        return params;
    }

    private normalizeAsset(asset: any): Asset {
        return {
            _id: asset._id || asset.id,
            kid: asset.kid,
            name: asset.name || 'No name',
            type: asset.type || 'N/A',
            subtype: asset.subtype || asset.db_type,
            source: asset.source,
            location: asset.location,
            owner: asset.owner || 'N/A',
            sensitivity: asset.sensitivity || 'N/A',
            classification: asset.classification,
            status: asset.status || 'N/A',
            tags: asset.tags || [],
            description: asset.description || 'No description',
            created_at: asset.created_at,
            updated_at: asset.updated_at || asset.updated || 'N/A',
            domain: asset.domain,
            data_product: asset.data_product,
            icon: asset.icon || this.getDefaultIcon(asset.type),
            image: asset.image || this.getDefaultImage(asset.type),
            freeAccess: asset.freeAccess || false
        };
    }

    private getDefaultIcon(type: string): string {
        return this.getTypeIcon(type);
    }

    private getDefaultImage(type: string): string {
        return `assets/images/${type}-placeholder.svg`;
    }
    // Event handlers
    onSearchChange(): void {
        this.currentPage = 0;
        this.fetchAssets();
    }

    onFilterChange(): void {
        this.currentPage = 0;
        this.fetchAssets();
    }

    onPageChange(event: any): void {
        this.currentPage = event.page;
        this.fetchAssets();
    }

    onViewModeChange(mode: 'list' | 'grid' | 'order'): void {
        this.viewMode = mode;
    }

    onDomainSelect(event: any): void {
        if (event.node) {
            const nodeData = event.node.data;
            if (nodeData.domainId) {
                // Type selected
                this.typeFilter = nodeData.id;
                this.domainFilter = nodeData.domainId;
            } else {
                // Domain selected
                this.domainFilter = nodeData.id;
                this.typeFilter = '';
            }
            this.onFilterChange();
        }
    }

    // Clear filters
    clearSearch(): void {
        this.searchQuery = '';
        this.onSearchChange();
    }

    clearTypeFilter(): void {
        this.typeFilter = '';
        this.onFilterChange();
    }

    clearOwnerFilter(): void {
        this.ownerFilter = '';
        this.onFilterChange();
    }

    clearDomainFilter(): void {
        this.domainFilter = '';
        this.selectedDomain = null;
        this.onFilterChange();
    }

    // Navigation
    openDetailPage(asset: Asset): void {
        if (asset && asset._id) {
            this.router.navigate(['/explore', asset._id]);
        }
    }

    // Helper methods for template
    getIconClass(type: string, subtype?: string): string {
        switch (type) {
            case 'database':
                switch (subtype) {
                    case 'mongodb': return 'pi pi-server text-green-500';
                    case 'postgres': return 'pi pi-database text-blue-700';
                    case 'mysql': return 'pi pi-database text-orange-500';
                    default: return 'pi pi-database text-blue-500';
                }
            case 'table': return 'pi pi-table text-blue-600';
            case 'mlmodel': return 'pi pi-chart-line text-purple-500';
            case 'pipeline': return 'pi pi-directions text-green-500';
            case 'dashboard': return 'pi pi-chart-bar text-orange-500';
            case 'api': return 'pi pi-globe text-indigo-500';
            case 'file': return 'pi pi-file text-gray-500';
            case 'container': return 'pi pi-box text-yellow-500';
            case 's3': return 'pi pi-cloud text-blue-400';
            case 'topic': return 'pi pi-telegram text-orange-500';
            case 'stream': return 'pi pi-bolt text-yellow-600';
            case 'cache': return 'pi pi-refresh text-red-500';
            case 'route': return 'pi pi-map text-purple-600';
            case 'notebook': return 'pi pi-book text-green-600';
            default: return 'pi pi-file text-gray-500';
        }
    }

    getSensitivityClass(sensitivity: string): string {
        switch (sensitivity.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'deprecated': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    }

    formatDate(dateString: string): string {
        if (!dateString || dateString === 'N/A') return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateString;
        }
    }

    // Get filtered assets for current view
    get filteredAssets(): Asset[] {
        return this.assets; // Assets are already filtered by API
    }

    // Type and owner options for dropdowns
    get typeOptions(): string[] {
        return ['', ...this.filterOptions.types];
    }

    get ownerOptions(): string[] {
        return ['', ...this.filterOptions.owners];
    }

    get statusOptions(): string[] {
        return ['', ...this.filterOptions.status];
    }

    get sensitivityOptions(): string[] {
        return ['', ...this.filterOptions.sensitivity];
    }

    get domainOptions(): string[] {
        return ['', ...this.filterOptions.domains];
    }
}
