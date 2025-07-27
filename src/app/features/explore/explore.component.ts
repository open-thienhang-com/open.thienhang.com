import { Component } from '@angular/core';
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
import { SidebarTreeComponent } from '../data-mesh-management/sidebar-tree/sidebar-tree.component';
import { DataAssetsService } from '../data-mesh-management/assets-tab/data-assets.service';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';

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
        SidebarTreeComponent,
        DialogModule,
        TreeModule,
        DataViewModule,
        OrderListModule
    ],
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.scss']
})
export class ExploreComponent {
    dataSources = [
        {
            id: 1,
            name: 'MongoDB Production',
            type: 'database',
            subtype: 'mongodb',
            status: 'online',
            lastSynced: '2025-07-10T12:30:45Z',
            owner: 'Data Platform Team',
            assets: 42,
            health: 98
        },
        {
            id: 2,
            name: 'Postgres Analytics',
            type: 'database',
            subtype: 'postgres',
            status: 'online',
            lastSynced: '2025-07-10T10:15:22Z',
            owner: 'Data Analytics Team',
            assets: 124,
            health: 95
        },
        {
            id: 3,
            name: 'Trino Data Warehouse',
            type: 'database',
            subtype: 'trino',
            status: 'online',
            lastSynced: '2025-07-09T23:45:12Z',
            owner: 'Data Engineering',
            assets: 87,
            health: 100
        },
        {
            id: 4,
            name: 'Daily ETL Pipeline',
            type: 'pipeline',
            subtype: 'airflow',
            status: 'online',
            lastSynced: '2025-07-10T05:00:00Z',
            owner: 'ETL Team',
            assets: 17,
            health: 92
        },
        {
            id: 5,
            name: 'Events Streaming Platform',
            type: 'topic',
            subtype: 'kafka',
            status: 'warning',
            lastSynced: '2025-07-10T11:12:33Z',
            owner: 'Streaming Team',
            assets: 28,
            health: 86
        },
        {
            id: 6,
            name: 'Customer Prediction Model',
            type: 'mlmodel',
            subtype: 'tensorflow',
            status: 'online',
            lastSynced: '2025-07-10T09:30:45Z',
            owner: 'Data Science Team',
            assets: 3,
            health: 99
        },
        {
            id: 7,
            name: 'Media Storage',
            type: 'container',
            subtype: 's3',
            status: 'online',
            lastSynced: '2025-07-10T08:22:18Z',
            owner: 'Infrastructure Team',
            assets: 10432,
            health: 100
        },
        {
            id: 8,
            name: 'Product Catalog Search',
            type: 'search',
            subtype: 'elasticsearch',
            status: 'offline',
            lastSynced: '2025-07-08T14:55:10Z',
            owner: 'Search Team',
            assets: 1,
            health: 0
        },
        {
            id: 9,
            name: 'NLP Service',
            type: 'api',
            subtype: 'openai',
            status: 'online',
            lastSynced: '2025-07-10T13:05:27Z',
            owner: 'AI Team',
            assets: 5,
            health: 97
        }
    ];

    typeOptions = [
        { label: 'All Types', value: null },
        { label: 'Database', value: 'database' },
        { label: 'Pipeline', value: 'pipeline' },
        { label: 'Topic', value: 'topic' },
        { label: 'ML Model', value: 'mlmodel' },
        { label: 'Container', value: 'container' },
        { label: 'Search Index', value: 'search' },
        { label: 'API', value: 'api' }
    ];

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Online', value: 'online' },
        { label: 'Warning', value: 'warning' },
        { label: 'Offline', value: 'offline' }
    ];

    ownerOptions = [
        { label: 'All Owners', value: null },
        ...Array.from(new Set(this.dataSources.map(ds => ds.owner))).map(owner => ({ label: owner, value: owner }))
    ];

    alphabet: string[] = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    selectedLetter: string | null = null;
    selectedType: string | null = null;
    selectedStatus: string | null = null;
    selectedOwner: string | null = null;
    searchQuery: string = '';
    detailModalVisible: boolean = false;
    selectedSource: any = null;

    typeFilter: string | null = null;
    ownerFilter: string | null = null;
    filterChips: { type?: string; owner?: string; search?: string }[] = [];

    typeFilterQuery: string = '';
    typePageFirst: number = 0;

    minHealth: number | null = null;
    lastSyncedAfter: string | null = null;
    assetPageFirst: number = 0;

    statusFilterQuery: string = '';
    tagFilterQuery: string = '';
    tagOptions: any[] = [
        { label: 'All Tags', value: null },
        { label: 'PII', value: 'pii' },
        { label: 'Finance', value: 'finance' },
        { label: 'Customer', value: 'customer' },
        { label: 'Critical', value: 'critical' }
    ];
    selectedAssets: any[] = [];

    assetGroups = [
        {
            name: 'database',
            label: 'Database',
            icon: 'pi pi-database text-blue-500',
            count: this.dataSources.filter(ds => ds.type === 'database').length,
            expanded: false,
            children: [
                { name: 'mongodb', label: 'MongoDB', icon: 'pi pi-server text-green-500', count: this.dataSources.filter(ds => ds.subtype === 'mongodb').length },
                { name: 'postgres', label: 'Postgres', icon: 'pi pi-server text-blue-700', count: this.dataSources.filter(ds => ds.subtype === 'postgres').length },
                { name: 'trino', label: 'Trino', icon: 'pi pi-server text-purple-500', count: this.dataSources.filter(ds => ds.subtype === 'trino').length }
            ]
        },
        {
            name: 'pipeline',
            label: 'Pipeline',
            icon: 'pi pi-directions text-green-500',
            count: this.dataSources.filter(ds => ds.type === 'pipeline').length,
            expanded: false,
            children: [
                { name: 'airflow', label: 'Airflow', icon: 'pi pi-send text-blue-500', count: this.dataSources.filter(ds => ds.subtype === 'airflow').length }
            ]
        },
        {
            name: 'topic',
            label: 'Topic',
            icon: 'pi pi-telegram text-orange-500',
            count: this.dataSources.filter(ds => ds.type === 'topic').length,
            expanded: false,
            children: [
                { name: 'kafka', label: 'Kafka', icon: 'pi pi-bolt text-yellow-500', count: this.dataSources.filter(ds => ds.subtype === 'kafka').length }
            ]
        },
        {
            name: 'mlmodel',
            label: 'ML Model',
            icon: 'pi pi-chart-line text-purple-500',
            count: this.dataSources.filter(ds => ds.type === 'mlmodel').length,
            expanded: false,
            children: [
                { name: 'tensorflow', label: 'TensorFlow', icon: 'pi pi-cog text-orange-500', count: this.dataSources.filter(ds => ds.subtype === 'tensorflow').length }
            ]
        },
        {
            name: 'container',
            label: 'Container',
            icon: 'pi pi-box text-yellow-500',
            count: this.dataSources.filter(ds => ds.type === 'container').length,
            expanded: false,
            children: [
                { name: 's3', label: 'S3', icon: 'pi pi-cloud text-blue-400', count: this.dataSources.filter(ds => ds.subtype === 's3').length }
            ]
        },
        {
            name: 'search',
            label: 'Search Index',
            icon: 'pi pi-search text-red-500',
            count: this.dataSources.filter(ds => ds.type === 'search').length,
            expanded: false,
            children: [
                { name: 'elasticsearch', label: 'Elasticsearch', icon: 'pi pi-search text-orange-500', count: this.dataSources.filter(ds => ds.subtype === 'elasticsearch').length }
            ]
        },
        {
            name: 'api',
            label: 'API',
            icon: 'pi pi-globe text-indigo-500',
            count: this.dataSources.filter(ds => ds.type === 'api').length,
            expanded: false,
            children: [
                { name: 'openai', label: 'OpenAI', icon: 'pi pi-star text-blue-500', count: this.dataSources.filter(ds => ds.subtype === 'openai').length }
            ]
        }
    ];
    selectedGroup: string | null = null;
    selectedSubGroup: string | null = null;

    activeTab: string = 'catalog';

    loadingAssets: boolean = false;
    errorAssets: string = '';
    assets: any[] = [];
    totalRecords: number = 0;

    page: number = 0;

    viewMode: 'list' | 'grid' | 'order' = 'grid';

    sidebarOpen: boolean = true;

    domainTree: any[] = [];
    selectedDomain: any = null;

    constructor(private dataAssetsService: DataAssetsService, private router: Router) {}

    ngOnInit() {
        this.domainTree = this.assetGroups.map(group => ({
            label: group.label,
            key: group.name,
            icon: group.icon,
            children: group.children.map(child => ({
                label: child.label,
                key: child.name,
                icon: child.icon
            }))
        }));
        this.fetchAssets();
    }

    // Helper: Build API params from all active filters
    buildApiParams(): any {
        const params: any = { size: 10, offset: this.page * 10 };
        if (this.selectedType) params.type = this.selectedType;
        if (this.selectedStatus) params.status = this.selectedStatus;
        if (this.selectedOwner) params.owner = this.selectedOwner;
        if (this.selectedLetter) params.letter = this.selectedLetter;
        if (this.searchQuery) params.search = this.searchQuery;
        if (this.selectedGroup) params.group = this.selectedGroup;
        if (this.selectedSubGroup) params.subtype = this.selectedSubGroup;
        return params;
    }

    // Unified fetch with all filters
    fetchAssetsWithFilters() {
        this.loadingAssets = true;
        this.errorAssets = '';
        const params = this.buildApiParams();
        this.dataAssetsService.getAssetsWithParams(params).subscribe({
            next: (res) => {
                this.assets = res?.data || [];
                this.totalRecords = res?.total || 0;
                this.loadingAssets = false;
            },
            error: () => {
                this.errorAssets = 'Không thể tải dữ liệu.';
                this.loadingAssets = false;
            }
        });
    }

    // Fix: Only send valid type to API
    fetchAssets(type?: string, size: number = 10, offset: number = 0, search: string = '') {
        this.loadingAssets = true;
        this.errorAssets = '';
        // Nếu type không truyền thì gọi API không có type
        const params: any = { size, offset };
        if (search) params.search = search;
        if (type) params.type = type;
        this.dataAssetsService.getAssetsWithParams(params).subscribe({
            next: (res) => {
                this.assets = res?.data || [];
                this.totalRecords = res?.total || 0;
                this.loadingAssets = false;
            },
            error: () => {
                this.errorAssets = 'Không thể tải dữ liệu.';
                this.loadingAssets = false;
            }
        });
    }

    onPageChange(event: any) {
        this.page = event.page || 0;
        this.fetchAssetsWithFilters();
    }

    onSearchChange() {
        this.page = 0;
        this.fetchAssetsWithFilters();
    }

    onAssetTypeChange(type: string) {
        this.selectedType = type;
        this.page = 0;
        this.fetchAssetsWithFilters();
    }

    onStatusChange(status: string) {
        this.selectedStatus = status;
        this.page = 0;
        this.fetchAssetsWithFilters();
    }

    onOwnerChange(owner: string) {
        this.selectedOwner = owner;
        this.page = 0;
        this.fetchAssetsWithFilters();
    }

    filterByLetter(letter: string | null) {
        this.selectedLetter = letter;
        this.page = 0;
        this.fetchAssetsWithFilters();
    }

    selectGroup(groupName: string) {
        this.selectedGroup = groupName;
        this.selectedSubGroup = null;
        this.page = 0;
        this.fetchAssetsWithFilters();
    }
    selectSubGroup(subGroupName: string) {
        this.selectedSubGroup = subGroupName;
        this.page = 0;
        this.fetchAssetsWithFilters();
    }
    // Remove filter chip
    removeFilterChip(filter: string) {
        switch (filter) {
            case 'type': this.selectedType = null; break;
            case 'status': this.selectedStatus = null; break;
            case 'owner': this.selectedOwner = null; break;
            case 'letter': this.selectedLetter = null; break;
            case 'group': this.selectedGroup = null; break;
            case 'subtype': this.selectedSubGroup = null; break;
        }
        this.page = 0;
        this.fetchAssetsWithFilters();
    }

    // Called by filter dropdowns in template
    onFilterChange() {
        this.selectedType = this.typeFilter;
        this.selectedOwner = this.ownerFilter;
        this.page = 0;
        this.fetchAssetsWithFilters();
    }

    onDomainSelect(event: any) {
        if (event.node) {
            if (event.node.children && event.node.children.length) {
                this.selectGroup(event.node.key);
            } else {
                this.selectSubGroup(event.node.key);
            }
        }
    }

    // Update all 'table' references to 'list' for viewMode
    onViewModeChange(mode: 'list' | 'grid' | 'order') {
        this.viewMode = mode;
    }

    // Use filteredAssets for UI display
    get filteredAssets() {
        return this.assets.filter(asset => {
            if (this.typeFilter && asset.type !== this.typeFilter) return false;
            if (this.ownerFilter && asset.owner !== this.ownerFilter) return false;
            if (this.searchQuery && !asset.name.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
            return true;
        });
    }

    // Remove modal logic
    // openDetailModal(source: any) {
    //     this.selectedSource = source;
    //     this.detailModalVisible = true;
    // }
    // Instead, navigate to detail page
    openDetailPage(asset: any) {
        if (asset && asset._id) {
            this.router.navigate(['/explore', asset._id]);
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'online': return 'success';
            case 'warning': return 'warning';
            case 'offline': return 'danger';
            default: return 'info';
        }
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    getIconClass(type: string, subtype: string): string {
        switch (type) {
            case 'database':
                return 'pi pi-database text-blue-500';
            case 'pipeline':
                return 'pi pi-directions text-green-500';
            case 'topic':
                return 'pi pi-telegram text-orange-500';
            case 'mlmodel':
                return 'pi pi-chart-line text-purple-500';
            case 'container':
                return 'pi pi-box text-yellow-500';
            case 'search':
                return 'pi pi-search text-red-500';
            case 'api':
                return 'pi pi-globe text-indigo-500';
            default:
                return 'pi pi-server text-gray-500';
        }
    }

    getHealthClass(health: number): string {
        if (health >= 95) return 'text-green-500';
        if (health >= 80) return 'text-yellow-500';
        if (health > 0) return 'text-orange-500';
        return 'text-red-500';
    }

    // Bulk selection logic (stub)
    clearSelection() {
        this.selectedAssets = [];
    }
}
