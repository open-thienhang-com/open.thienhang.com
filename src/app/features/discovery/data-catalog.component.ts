import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { TreeModule } from 'primeng/tree';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';

interface DataAsset {
    id: string;
    name: string;
    type: 'table' | 'view' | 'api' | 'file' | 'stream';
    domain: string;
    description: string;
    owner: string;
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    tags: string[];
    createdDate: Date;
    lastModified: Date;
    size: string;
    records: number;
    usage: number;
    quality: number;
    columns: {
        name: string;
        type: string;
        description: string;
        nullable: boolean;
        isPrimaryKey: boolean;
    }[];
    lineage: {
        upstream: string[];
        downstream: string[];
    };
    sla: {
        availability: number;
        responseTime: number;
        dataFreshness: number;
    };
}

@Component({
    selector: 'app-data-catalog',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TableModule,
        TagModule,
        BadgeModule,
        DialogModule,
        TabViewModule,
        TreeModule,
        FormsModule
    ],
    template: `
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Data Catalog</h1>
              <p class="text-surface-600 dark:text-surface-400 mt-1">Discover and explore data assets across your organization</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Register Asset" icon="pi pi-plus" class="p-button-primary"></button>
              <button pButton label="Bulk Import" icon="pi pi-upload" class="p-button-outlined"></button>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <p-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-surface-900 dark:text-surface-50">2,847</div>
              <div class="text-sm text-surface-600 dark:text-surface-400">Total Assets</div>
            </div>
          </p-card>
          <p-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">1,234</div>
              <div class="text-sm text-surface-600 dark:text-surface-400">Tables</div>
            </div>
          </p-card>
          <p-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">456</div>
              <div class="text-sm text-surface-600 dark:text-surface-400">APIs</div>
            </div>
          </p-card>
          <p-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">789</div>
              <div class="text-sm text-surface-600 dark:text-surface-400">Files</div>
            </div>
          </p-card>
          <p-card>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">368</div>
              <div class="text-sm text-surface-600 dark:text-surface-400">Streams</div>
            </div>
          </p-card>
        </div>

        <!-- Search and Filters -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div class="lg:col-span-3">
            <p-card>
              <div class="flex flex-wrap gap-4">
                <div class="flex-1 min-w-80">
                  <input 
                    pInputText 
                    placeholder="Search data assets, schemas, tables..." 
                    [(ngModel)]="searchTerm"
                    class="w-full">
                </div>
                <p-dropdown 
                  [options]="domainOptions" 
                  [(ngModel)]="selectedDomain"
                  placeholder="Domain"
                  class="w-40">
                </p-dropdown>
                <p-dropdown 
                  [options]="typeOptions" 
                  [(ngModel)]="selectedType"
                  placeholder="Type"
                  class="w-32">
                </p-dropdown>
                <p-dropdown 
                  [options]="classificationOptions" 
                  [(ngModel)]="selectedClassification"
                  placeholder="Classification"
                  class="w-40">
                </p-dropdown>
                <button pButton icon="pi pi-filter-slash" class="p-button-outlined" (click)="clearFilters()"></button>
              </div>
            </p-card>
          </div>
          
          <!-- Domain Tree -->
          <div class="lg:col-span-1">
            <p-card>
              <ng-template pTemplate="header">
                <div class="flex items-center gap-2 p-4">
                  <i class="pi pi-sitemap text-primary-500"></i>
                  <h3 class="text-lg font-semibold">Domain Structure</h3>
                </div>
              </ng-template>
              
              <p-tree 
                [value]="domainTree" 
                selectionMode="single" 
                [(selection)]="selectedDomainNode"
                (onNodeSelect)="onDomainSelect($event)">
              </p-tree>
            </p-card>
          </div>
        </div>

        <!-- Data Assets Table -->
        <p-card>
          <ng-template pTemplate="header">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-2">
                <i class="pi pi-database text-primary-500"></i>
                <h3 class="text-lg font-semibold">Data Assets</h3>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-surface-600 dark:text-surface-400">
                  {{filteredAssets.length}} assets found
                </span>
              </div>
            </div>
          </ng-template>
          
          <p-table 
            [value]="filteredAssets" 
            [paginator]="true" 
            [rows]="10" 
            [rowsPerPageOptions]="[10, 25, 50]"
            [sortField]="'name'" 
            [sortOrder]="1">
            
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name">
                  Name <p-sortIcon field="name"></p-sortIcon>
                </th>
                <th pSortableColumn="type">
                  Type <p-sortIcon field="type"></p-sortIcon>
                </th>
                <th pSortableColumn="domain">
                  Domain <p-sortIcon field="domain"></p-sortIcon>
                </th>
                <th pSortableColumn="owner">
                  Owner <p-sortIcon field="owner"></p-sortIcon>
                </th>
                <th>Classification</th>
                <th>Tags</th>
                <th pSortableColumn="quality">
                  Quality <p-sortIcon field="quality"></p-sortIcon>
                </th>
                <th pSortableColumn="usage">
                  Usage <p-sortIcon field="usage"></p-sortIcon>
                </th>
                <th>Actions</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-asset>
              <tr>
                <td>
                  <div class="flex items-center gap-2">
                    <i [class]="getTypeIcon(asset.type)" class="text-primary-500"></i>
                    <div>
                      <div class="font-medium">{{asset.name}}</div>
                      <div class="text-sm text-surface-600 dark:text-surface-400">
                        {{asset.description | slice:0:50}}{{asset.description.length > 50 ? '...' : ''}}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <p-tag [value]="asset.type" [severity]="getTypeSeverity(asset.type)"></p-tag>
                </td>
                <td>{{asset.domain}}</td>
                <td>{{asset.owner}}</td>
                <td>
                  <p-tag 
                    [value]="asset.classification" 
                    [severity]="getClassificationSeverity(asset.classification)">
                  </p-tag>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <p-tag 
                      *ngFor="let tag of asset.tags.slice(0, 2)" 
                      [value]="tag" 
                      severity="secondary"
                      class="text-xs">
                    </p-tag>
                    <span *ngIf="asset.tags.length > 2" class="text-xs text-surface-500 dark:text-surface-400">
                      +{{asset.tags.length - 2}} more
                    </span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full transition-all duration-300"
                        [style.width.%]="asset.quality"
                        [ngClass]="getQualityColorClass(asset.quality)">
                      </div>
                    </div>
                    <span class="text-sm">{{asset.quality}}%</span>
                  </div>
                </td>
                <td>
                  <p-badge [value]="asset.usage" severity="info"></p-badge>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button 
                      pButton 
                      icon="pi pi-eye" 
                      class="p-button-sm p-button-text"
                      (click)="viewAsset(asset)">
                    </button>
                    <button 
                      pButton 
                      icon="pi pi-share-alt" 
                      class="p-button-sm p-button-text"
                      (click)="viewLineage(asset)">
                    </button>
                    <button 
                      pButton 
                      icon="pi pi-cog" 
                      class="p-button-sm p-button-text"
                      (click)="editAsset(asset)">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <!-- Asset Detail Dialog -->
        <p-dialog 
          [(visible)]="showAssetDetail" 
          [modal]="true" 
          [draggable]="false"
          [resizable]="false"
          [style]="{width: '90vw', maxWidth: '1200px'}"
          header="Asset Details">
          
          <div *ngIf="selectedAsset">
            <p-tabView>
              <p-tabPanel header="Overview" leftIcon="pi pi-info-circle">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 class="font-semibold mb-3">Basic Information</h4>
                    <div class="space-y-2">
                      <div><strong>Name:</strong> {{selectedAsset.name}}</div>
                      <div><strong>Type:</strong> {{selectedAsset.type}}</div>
                      <div><strong>Domain:</strong> {{selectedAsset.domain}}</div>
                      <div><strong>Owner:</strong> {{selectedAsset.owner}}</div>
                      <div><strong>Classification:</strong> {{selectedAsset.classification}}</div>
                      <div><strong>Size:</strong> {{selectedAsset.size}}</div>
                      <div><strong>Records:</strong> {{selectedAsset.records | number}}</div>
                    </div>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-3">Metadata</h4>
                    <div class="space-y-2">
                      <div><strong>Created:</strong> {{selectedAsset.createdDate | date:'medium'}}</div>
                      <div><strong>Last Modified:</strong> {{selectedAsset.lastModified | date:'medium'}}</div>
                      <div><strong>Usage Count:</strong> {{selectedAsset.usage}}</div>
                      <div><strong>Quality Score:</strong> {{selectedAsset.quality}}%</div>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6">
                  <h4 class="font-semibold mb-3">Description</h4>
                  <p class="text-surface-600 dark:text-surface-400">{{selectedAsset.description}}</p>
                </div>
                
                <div class="mt-6">
                  <h4 class="font-semibold mb-3">Tags</h4>
                  <div class="flex flex-wrap gap-2">
                    <p-tag 
                      *ngFor="let tag of selectedAsset.tags" 
                      [value]="tag" 
                      severity="secondary">
                    </p-tag>
                  </div>
                </div>
              </p-tabPanel>
              
              <p-tabPanel header="Schema" leftIcon="pi pi-table">
                <p-table [value]="selectedAsset.columns">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Column Name</th>
                      <th>Data Type</th>
                      <th>Description</th>
                      <th>Nullable</th>
                      <th>Primary Key</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-column>
                    <tr>
                      <td>
                        <span class="font-medium">{{column.name}}</span>
                      </td>
                      <td>
                        <p-tag [value]="column.type" severity="info"></p-tag>
                      </td>
                      <td>{{column.description}}</td>
                      <td>
                        <i [class]="column.nullable ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
                      </td>
                      <td>
                        <i [class]="column.isPrimaryKey ? 'pi pi-key text-yellow-500' : 'pi pi-minus text-surface-400'"></i>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </p-tabPanel>
              
              <p-tabPanel header="Lineage" leftIcon="pi pi-share-alt">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 class="font-semibold mb-3">Upstream Dependencies</h4>
                    <div class="space-y-2">
                      <div *ngFor="let upstream of selectedAsset.lineage.upstream" 
                           class="flex items-center gap-2 p-2 border border-surface-200 dark:border-surface-700 rounded">
                        <i class="pi pi-arrow-right text-blue-500"></i>
                        <span>{{upstream}}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-3">Downstream Dependencies</h4>
                    <div class="space-y-2">
                      <div *ngFor="let downstream of selectedAsset.lineage.downstream" 
                           class="flex items-center gap-2 p-2 border border-surface-200 dark:border-surface-700 rounded">
                        <i class="pi pi-arrow-left text-green-500"></i>
                        <span>{{downstream}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </p-tabPanel>
              
              <p-tabPanel header="SLA" leftIcon="pi pi-clock">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">{{selectedAsset.sla.availability}}%</div>
                    <div class="text-sm text-surface-600 dark:text-surface-400">Availability</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">{{selectedAsset.sla.responseTime}}ms</div>
                    <div class="text-sm text-surface-600 dark:text-surface-400">Response Time</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">{{selectedAsset.sla.dataFreshness}}min</div>
                    <div class="text-sm text-surface-600 dark:text-surface-400">Data Freshness</div>
                  </div>
                </div>
              </p-tabPanel>
            </p-tabView>
          </div>
        </p-dialog>
      </div>
    </div>
  `,
    styles: [`
    :host ::ng-deep {
      .p-datatable .p-datatable-tbody > tr > td {
        vertical-align: top;
      }
      
      .p-tree .p-tree-container .p-treenode .p-treenode-content {
        padding: 0.5rem;
      }
      
      .p-dialog .p-dialog-content {
        padding: 1.5rem;
      }
    }
  `]
})
export class DataCatalogComponent implements OnInit {
    searchTerm = '';
    selectedDomain: any;
    selectedType: any;
    selectedClassification: any;
    selectedDomainNode: TreeNode | null = null;
    showAssetDetail = false;
    selectedAsset: DataAsset | null = null;

    domainOptions = [
        { label: 'All Domains', value: null },
        { label: 'Customer', value: 'customer' },
        { label: 'Product', value: 'product' },
        { label: 'Order', value: 'order' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'Finance', value: 'finance' }
    ];

    typeOptions = [
        { label: 'All Types', value: null },
        { label: 'Table', value: 'table' },
        { label: 'View', value: 'view' },
        { label: 'API', value: 'api' },
        { label: 'File', value: 'file' },
        { label: 'Stream', value: 'stream' }
    ];

    classificationOptions = [
        { label: 'All Classifications', value: null },
        { label: 'Public', value: 'public' },
        { label: 'Internal', value: 'internal' },
        { label: 'Confidential', value: 'confidential' },
        { label: 'Restricted', value: 'restricted' }
    ];

    domainTree: TreeNode[] = [
        {
            label: 'Customer Domain',
            icon: 'pi pi-users',
            expanded: true,
            children: [
                { label: 'Customer Profiles', icon: 'pi pi-user' },
                { label: 'Customer Preferences', icon: 'pi pi-cog' },
                { label: 'Customer Interactions', icon: 'pi pi-comments' }
            ]
        },
        {
            label: 'Product Domain',
            icon: 'pi pi-shopping-cart',
            children: [
                { label: 'Product Catalog', icon: 'pi pi-list' },
                { label: 'Inventory', icon: 'pi pi-box' },
                { label: 'Pricing', icon: 'pi pi-dollar' }
            ]
        },
        {
            label: 'Order Domain',
            icon: 'pi pi-receipt',
            children: [
                { label: 'Order Transactions', icon: 'pi pi-file' },
                { label: 'Payment Processing', icon: 'pi pi-credit-card' },
                { label: 'Shipping', icon: 'pi pi-truck' }
            ]
        }
    ];

    dataAssets: DataAsset[] = [
        {
            id: '1',
            name: 'customers_main',
            type: 'table',
            domain: 'customer',
            description: 'Main customer table containing profile information, contact details, and account status',
            owner: 'Data Engineering Team',
            classification: 'confidential',
            tags: ['customer', 'profile', 'pii', 'gdpr'],
            createdDate: new Date('2023-01-15'),
            lastModified: new Date('2024-01-15'),
            size: '2.3 GB',
            records: 1250000,
            usage: 45,
            quality: 95,
            columns: [
                { name: 'customer_id', type: 'VARCHAR(36)', description: 'Unique customer identifier', nullable: false, isPrimaryKey: true },
                { name: 'first_name', type: 'VARCHAR(50)', description: 'Customer first name', nullable: false, isPrimaryKey: false },
                { name: 'last_name', type: 'VARCHAR(50)', description: 'Customer last name', nullable: false, isPrimaryKey: false },
                { name: 'email', type: 'VARCHAR(100)', description: 'Customer email address', nullable: false, isPrimaryKey: false },
                { name: 'phone', type: 'VARCHAR(20)', description: 'Customer phone number', nullable: true, isPrimaryKey: false },
                { name: 'created_at', type: 'TIMESTAMP', description: 'Record creation timestamp', nullable: false, isPrimaryKey: false }
            ],
            lineage: {
                upstream: ['customer_raw', 'customer_staging'],
                downstream: ['customer_analytics', 'customer_reporting']
            },
            sla: {
                availability: 99.9,
                responseTime: 150,
                dataFreshness: 15
            }
        },
        {
            id: '2',
            name: 'product_catalog_api',
            type: 'api',
            domain: 'product',
            description: 'REST API providing access to product catalog data including specifications, pricing, and availability',
            owner: 'Product Team',
            classification: 'internal',
            tags: ['product', 'api', 'catalog', 'pricing'],
            createdDate: new Date('2023-03-20'),
            lastModified: new Date('2024-01-10'),
            size: 'N/A',
            records: 0,
            usage: 128,
            quality: 92,
            columns: [
                { name: 'product_id', type: 'STRING', description: 'Product identifier', nullable: false, isPrimaryKey: true },
                { name: 'name', type: 'STRING', description: 'Product name', nullable: false, isPrimaryKey: false },
                { name: 'description', type: 'TEXT', description: 'Product description', nullable: true, isPrimaryKey: false },
                { name: 'price', type: 'DECIMAL', description: 'Product price', nullable: false, isPrimaryKey: false },
                { name: 'category', type: 'STRING', description: 'Product category', nullable: false, isPrimaryKey: false }
            ],
            lineage: {
                upstream: ['product_master', 'pricing_engine'],
                downstream: ['product_recommendations', 'order_processing']
            },
            sla: {
                availability: 99.5,
                responseTime: 200,
                dataFreshness: 30
            }
        },
        {
            id: '3',
            name: 'order_events_stream',
            type: 'stream',
            domain: 'order',
            description: 'Real-time stream of order events including creation, updates, and status changes',
            owner: 'Order Management Team',
            classification: 'internal',
            tags: ['order', 'events', 'realtime', 'kafka'],
            createdDate: new Date('2023-05-10'),
            lastModified: new Date('2024-01-14'),
            size: '850 MB/day',
            records: 500000,
            usage: 32,
            quality: 88,
            columns: [
                { name: 'event_id', type: 'STRING', description: 'Event identifier', nullable: false, isPrimaryKey: true },
                { name: 'order_id', type: 'STRING', description: 'Order identifier', nullable: false, isPrimaryKey: false },
                { name: 'event_type', type: 'STRING', description: 'Type of order event', nullable: false, isPrimaryKey: false },
                { name: 'timestamp', type: 'TIMESTAMP', description: 'Event timestamp', nullable: false, isPrimaryKey: false },
                { name: 'payload', type: 'JSON', description: 'Event payload data', nullable: true, isPrimaryKey: false }
            ],
            lineage: {
                upstream: ['order_service', 'payment_service'],
                downstream: ['order_analytics', 'notification_service']
            },
            sla: {
                availability: 99.8,
                responseTime: 50,
                dataFreshness: 1
            }
        },
        {
            id: '4',
            name: 'analytics_dashboard_view',
            type: 'view',
            domain: 'analytics',
            description: 'Aggregated view combining customer, product, and order data for business analytics dashboard',
            owner: 'Analytics Team',
            classification: 'internal',
            tags: ['analytics', 'dashboard', 'aggregated', 'kpi'],
            createdDate: new Date('2023-07-01'),
            lastModified: new Date('2024-01-12'),
            size: '1.2 GB',
            records: 850000,
            usage: 78,
            quality: 91,
            columns: [
                { name: 'customer_segment', type: 'STRING', description: 'Customer segment classification', nullable: false, isPrimaryKey: false },
                { name: 'product_category', type: 'STRING', description: 'Product category', nullable: false, isPrimaryKey: false },
                { name: 'order_count', type: 'INTEGER', description: 'Number of orders', nullable: false, isPrimaryKey: false },
                { name: 'revenue', type: 'DECIMAL', description: 'Total revenue', nullable: false, isPrimaryKey: false },
                { name: 'period', type: 'DATE', description: 'Reporting period', nullable: false, isPrimaryKey: false }
            ],
            lineage: {
                upstream: ['customers_main', 'product_catalog_api', 'order_events_stream'],
                downstream: ['executive_dashboard', 'sales_reports']
            },
            sla: {
                availability: 99.0,
                responseTime: 300,
                dataFreshness: 60
            }
        },
        {
            id: '5',
            name: 'customer_export_files',
            type: 'file',
            domain: 'customer',
            description: 'Daily export files containing customer data in CSV format for external partners',
            owner: 'Data Engineering Team',
            classification: 'restricted',
            tags: ['customer', 'export', 'csv', 'partners'],
            createdDate: new Date('2023-08-15'),
            lastModified: new Date('2024-01-15'),
            size: '500 MB',
            records: 350000,
            usage: 12,
            quality: 94,
            columns: [
                { name: 'customer_id', type: 'STRING', description: 'Customer identifier', nullable: false, isPrimaryKey: true },
                { name: 'name', type: 'STRING', description: 'Customer full name', nullable: false, isPrimaryKey: false },
                { name: 'email', type: 'STRING', description: 'Customer email', nullable: false, isPrimaryKey: false },
                { name: 'registration_date', type: 'DATE', description: 'Customer registration date', nullable: false, isPrimaryKey: false },
                { name: 'status', type: 'STRING', description: 'Customer status', nullable: false, isPrimaryKey: false }
            ],
            lineage: {
                upstream: ['customers_main'],
                downstream: ['partner_systems']
            },
            sla: {
                availability: 99.9,
                responseTime: 0,
                dataFreshness: 1440
            }
        }
    ];

    get filteredAssets() {
        return this.dataAssets.filter(asset => {
            const matchesSearch = !this.searchTerm ||
                asset.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                asset.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                asset.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

            const matchesDomain = !this.selectedDomain || asset.domain === this.selectedDomain;
            const matchesType = !this.selectedType || asset.type === this.selectedType;
            const matchesClassification = !this.selectedClassification || asset.classification === this.selectedClassification;

            return matchesSearch && matchesDomain && matchesType && matchesClassification;
        });
    }

    ngOnInit() {
        // Initialize component
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedDomain = null;
        this.selectedType = null;
        this.selectedClassification = null;
        this.selectedDomainNode = null;
    }

    onDomainSelect(event: any) {
        console.log('Domain selected:', event);
    }

    getTypeIcon(type: string): string {
        switch (type) {
            case 'table': return 'pi pi-table';
            case 'view': return 'pi pi-eye';
            case 'api': return 'pi pi-cloud';
            case 'file': return 'pi pi-file';
            case 'stream': return 'pi pi-broadcast';
            default: return 'pi pi-database';
        }
    }

    getTypeSeverity(type: string): string {
        switch (type) {
            case 'table': return 'info';
            case 'view': return 'success';
            case 'api': return 'warning';
            case 'file': return 'secondary';
            case 'stream': return 'danger';
            default: return 'secondary';
        }
    }

    getClassificationSeverity(classification: string): string {
        switch (classification) {
            case 'public': return 'success';
            case 'internal': return 'info';
            case 'confidential': return 'warning';
            case 'restricted': return 'danger';
            default: return 'secondary';
        }
    }

    getQualityColorClass(quality: number): string {
        if (quality >= 90) return 'bg-green-500';
        if (quality >= 80) return 'bg-yellow-500';
        if (quality >= 70) return 'bg-orange-500';
        return 'bg-red-500';
    }

    viewAsset(asset: DataAsset) {
        this.selectedAsset = asset;
        this.showAssetDetail = true;
    }

    viewLineage(asset: DataAsset) {
        console.log('View lineage for:', asset);
    }

    editAsset(asset: DataAsset) {
        console.log('Edit asset:', asset);
    }
}
