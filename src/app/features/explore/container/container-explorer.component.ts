import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';

interface Container {
    id: string;
    name: string;
    type: string;
    region: string;
    status: 'active' | 'error' | 'inactive';
    size: string;
    usedSpace: number;
    totalSpace: number;
    files: number;
    lastAccessed: Date;
    created: Date;
    owner: string;
    permissions: string;
    public: boolean;
}

@Component({
    selector: 'app-container-explorer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        TableModule,
        TagModule,
        TooltipModule,
        DropdownModule,
        InputTextModule,
        DialogModule,
        ChipModule,
        ProgressBarModule,
        ToastModule,
        TabViewModule,
        RouterModule,
        ChartModule
    ],
    providers: [MessageService],
    template: `
    <div class="p-4 md:p-6">
      <div class="mb-6">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Storage Container Explorer</h1>
            <p class="text-gray-600 dark:text-gray-400">Browse and manage storage containers</p>
          </div>
          <button pButton label="Add New Container" icon="pi pi-plus" class="p-button-primary"></button>
        </div>
        
        <!-- Container Type Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="selectedContainerType === 's3'"
               [class.border-blue-500]="selectedContainerType === 's3'"
               (click)="filterByType('s3')">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <i class="pi pi-cloud text-2xl text-orange-500"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold">Amazon S3</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ getCountByType('s3') }} buckets</p>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-sm font-medium">{{ getTotalStorageByType('s3') }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">Total storage</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Capacity</span>
                <span>{{ getCapacityPercentByType('s3') }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div [style.width.%]="getCapacityPercentByType('s3')" 
                     [ngClass]="{
                       'bg-green-500': getCapacityPercentByType('s3') < 70,
                       'bg-yellow-500': getCapacityPercentByType('s3') >= 70 && getCapacityPercentByType('s3') < 90,
                       'bg-red-500': getCapacityPercentByType('s3') >= 90
                     }"
                     class="h-2 rounded-full">
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="selectedContainerType === 'gcs'"
               [class.border-blue-500]="selectedContainerType === 'gcs'"
               (click)="filterByType('gcs')">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <i class="pi pi-cloud text-2xl text-blue-500"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold">Google Cloud Storage</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ getCountByType('gcs') }} buckets</p>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-sm font-medium">{{ getTotalStorageByType('gcs') }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">Total storage</span>
              </div>
            </div>
            <div class="mt-2">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Capacity</span>
                <span>{{ getCapacityPercentByType('gcs') }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div [style.width.%]="getCapacityPercentByType('gcs')" 
                     [ngClass]="{
                       'bg-green-500': getCapacityPercentByType('gcs') < 70,
                       'bg-yellow-500': getCapacityPercentByType('gcs') >= 70 && getCapacityPercentByType('gcs') < 90,
                       'bg-red-500': getCapacityPercentByType('gcs') >= 90
                     }"
                     class="h-2 rounded-full">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Storage Usage Chart -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Storage Usage</h3>
          <div class="h-60">
            <p-chart type="bar" [data]="chartData" [options]="chartOptions"></p-chart>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                class="w-full" 
                placeholder="Search containers..." 
                [(ngModel)]="searchQuery"
                (input)="applyFilters()">
            </span>
          </div>
          <div class="w-full md:w-auto">
            <p-dropdown 
              [options]="regionOptions" 
              [(ngModel)]="selectedRegion" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Filter by region"
              (onChange)="applyFilters()">
            </p-dropdown>
          </div>
          <div class="w-full md:w-auto">
            <p-dropdown 
              [options]="statusOptions" 
              [(ngModel)]="selectedStatus" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Filter by status"
              (onChange)="applyFilters()">
            </p-dropdown>
          </div>
        </div>
      </div>

      <!-- Containers Table -->
      <p-card>
        <p-table [value]="filteredContainers" [paginator]="true" [rows]="10" styleClass="p-datatable-sm p-datatable-gridlines"
                 [rowsPerPageOptions]="[5,10,25]" [showCurrentPageReport]="true" responsiveLayout="stack" 
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Region</th>
              <th>Status</th>
              <th>Storage</th>
              <th>Objects</th>
              <th>Last Accessed</th>
              <th>Access</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-container>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i [class]="getIconClass(container.type)" class="text-lg"></i>
                  <span class="font-medium">{{ container.name }}</span>
                </div>
              </td>
              <td>{{ container.type.toUpperCase() }}</td>
              <td>{{ container.region }}</td>
              <td>
                <p-tag [severity]="getStatusSeverity(container.status)" [value]="container.status" [rounded]="true"></p-tag>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between text-xs">
                    <span>{{ container.usedSpace | number:'1.0-1' }} / {{ container.totalSpace | number:'1.0-1' }} GB</span>
                    <span>{{ (container.usedSpace / container.totalSpace * 100) | number:'1.0-0' }}%</span>
                  </div>
                  <p-progressBar [value]="container.usedSpace / container.totalSpace * 100" [showValue]="false" 
                                 [styleClass]="getCapacityClass(container.usedSpace / container.totalSpace * 100)"></p-progressBar>
                </div>
              </td>
              <td>{{ container.files | number }} files</td>
              <td>{{ container.lastAccessed | date:'short' }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <p-tag [severity]="container.public ? 'warning' : 'success'" 
                        [value]="container.public ? 'Public' : 'Private'" 
                        [rounded]="true"></p-tag>
                  <span class="text-xs text-gray-500">{{ container.permissions }}</span>
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Browse files"></button>
                  <button pButton icon="pi pi-cloud-upload" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Upload"></button>
                  <button pButton icon="pi pi-cog" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Settings"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center p-6">
                <div class="flex flex-col items-center">
                  <i class="pi pi-cloud text-5xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 mb-4">No storage containers found matching your criteria</p>
                  <button pButton label="Add New Container" icon="pi pi-plus" class="p-button-outlined"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
    styles: [`
    :host ::ng-deep .p-card {
      @apply shadow-none;
    }
    
    :host ::ng-deep .p-card .p-card-content {
      @apply p-0;
    }
    
    :host ::ng-deep .p-progressbar {
      @apply h-2;
    }
    
    :host ::ng-deep .progress-success .p-progressbar-value {
      @apply bg-green-500;
    }
    
    :host ::ng-deep .progress-warning .p-progressbar-value {
      @apply bg-yellow-500;
    }
    
    :host ::ng-deep .progress-danger .p-progressbar-value {
      @apply bg-red-500;
    }
    
    :host ::ng-deep .p-chart {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class ContainerExplorerComponent implements OnInit {
    containers: Container[] = [];
    filteredContainers: Container[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedContainerType: string | null = null;
    selectedRegion: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Active', value: 'active' },
        { label: 'Error', value: 'error' },
        { label: 'Inactive', value: 'inactive' }
    ];

    regionOptions = [
        { label: 'All Regions', value: null },
        { label: 'us-east-1', value: 'us-east-1' },
        { label: 'us-west-1', value: 'us-west-1' },
        { label: 'eu-west-1', value: 'eu-west-1' },
        { label: 'ap-southeast-1', value: 'ap-southeast-1' },
        { label: 'ap-northeast-1', value: 'ap-northeast-1' }
    ];

    chartData: any;
    chartOptions: any;

    constructor(private messageService: MessageService) { }

    ngOnInit() {
        this.loadMockData();
        this.filteredContainers = [...this.containers];
        this.prepareChartData();
    }

    loadMockData() {
        const containerTypes = ['s3', 'gcs'];
        const regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'];
        const statusOptions = ['active', 'error', 'inactive'];
        const permissionOptions = ['Read/Write', 'Read Only', 'Full Control'];
        const owners = ['Data Engineering', 'Analytics Team', 'ML Ops', 'Data Science', 'Platform Team', 'DevOps'];

        // Generate random containers
        for (let i = 1; i <= 20; i++) {
            const type = containerTypes[Math.floor(Math.random() * containerTypes.length)];
            const region = regions[Math.floor(Math.random() * regions.length)];
            const totalSpace = Math.floor(Math.random() * 1000) + 100; // 100-1100 GB
            const usedSpace = Math.floor(Math.random() * totalSpace); // 0-totalSpace GB
            const files = Math.floor(Math.random() * 1000000) + 1; // 1-1,000,000 files
            const isPublic = Math.random() > 0.7; // 30% chance of being public

            const lastAccessed = new Date();
            lastAccessed.setHours(lastAccessed.getHours() - Math.floor(Math.random() * 168)); // Within last week

            const created = new Date();
            created.setDate(created.getDate() - Math.floor(Math.random() * 365) - 30); // 1 month to 1 year ago

            this.containers.push({
                id: `container-${i}`,
                name: `${type}-bucket-${i}`,
                type,
                region,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'active' | 'error' | 'inactive',
                size: `${totalSpace} GB`,
                usedSpace,
                totalSpace,
                files,
                lastAccessed,
                created,
                owner: owners[Math.floor(Math.random() * owners.length)],
                permissions: permissionOptions[Math.floor(Math.random() * permissionOptions.length)],
                public: isPublic
            });
        }
    }

    prepareChartData() {
        // Storage usage by region chart
        const regionStorage: { [key: string]: { used: number, total: number } } = {};

        this.containers.forEach(container => {
            if (!regionStorage[container.region]) {
                regionStorage[container.region] = { used: 0, total: 0 };
            }
            regionStorage[container.region].used += container.usedSpace;
            regionStorage[container.region].total += container.totalSpace;
        });

        this.chartData = {
            labels: Object.keys(regionStorage),
            datasets: [
                {
                    label: 'Used Space (GB)',
                    data: Object.values(regionStorage).map(v => v.used),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Available Space (GB)',
                    data: Object.values(regionStorage).map(v => v.total - v.used),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            },
            maintainAspectRatio: false
        };
    }

    applyFilters() {
        this.filteredContainers = this.containers.filter(container => {
            // Apply container type filter
            if (this.selectedContainerType && container.type !== this.selectedContainerType) {
                return false;
            }

            // Apply region filter
            if (this.selectedRegion && container.region !== this.selectedRegion) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && container.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !container.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    filterByType(type: string | null) {
        this.selectedContainerType = type;
        this.applyFilters();
    }

    getCountByType(type: string | null): number {
        if (!type) {
            return this.containers.length;
        }
        return this.containers.filter(container => container.type === type).length;
    }

    getTotalStorageByType(type: string): string {
        const filteredContainers = this.containers.filter(container => container.type === type);
        const totalGB = filteredContainers.reduce((sum, container) => sum + container.totalSpace, 0);
        const usedGB = filteredContainers.reduce((sum, container) => sum + container.usedSpace, 0);

        return `${usedGB.toFixed(1)} / ${totalGB.toFixed(1)} GB`;
    }

    getCapacityPercentByType(type: string): number {
        const filteredContainers = this.containers.filter(container => container.type === type);
        if (filteredContainers.length === 0) return 0;

        const totalSpace = filteredContainers.reduce((sum, container) => sum + container.totalSpace, 0);
        const usedSpace = filteredContainers.reduce((sum, container) => sum + container.usedSpace, 0);

        return Math.round(usedSpace / totalSpace * 100);
    }

    getIconClass(type: string): string {
        switch (type) {
            case 's3': return 'pi pi-cloud text-orange-500';
            case 'gcs': return 'pi pi-cloud text-blue-500';
            default: return 'pi pi-cloud text-gray-500';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'error': return 'danger';
            case 'inactive': return 'warning';
            default: return 'info';
        }
    }

    getCapacityClass(percent: number): string {
        if (percent < 70) return 'progress-success';
        if (percent < 90) return 'progress-warning';
        return 'progress-danger';
    }
}
