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

interface SearchIndex {
    id: string;
    name: string;
    type: string;
    version: string;
    status: 'healthy' | 'degraded' | 'offline';
    documents: number;
    size: string;
    queryPerSecond: number;
    avgResponseTime: number;
    lastUpdated: Date;
    created: Date;
    owner: string;
    cluster: string;
    shards: number;
    replicas: number;
}

@Component({
    selector: 'app-search-explorer',
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
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Search Indexes Explorer</h1>
            <p class="text-gray-600 dark:text-gray-400">Manage and monitor search indexes</p>
          </div>
          <button pButton label="Add New Index" icon="pi pi-plus" class="p-button-primary"></button>
        </div>
        
        <!-- Index Overview -->
        <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow mb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <i class="pi pi-filter text-2xl text-red-500"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold">Elasticsearch</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ indexes.length }} indexes across {{ getClusters().length }} clusters</p>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-4">
                <div class="flex flex-col items-center">
                  <span class="text-2xl font-bold">{{ getTotalDocuments() | number }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">Documents</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-2xl font-bold">{{ getTotalSize() }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">Total Size</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-2xl font-bold">{{ getTotalQPS() | number:'1.0-0' }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">Queries/sec</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Performance Chart -->
          <div class="h-60 mt-6">
            <p-chart type="line" [data]="performanceChartData" [options]="performanceChartOptions"></p-chart>
          </div>
        </div>
        
        <!-- Cluster Health -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div *ngFor="let cluster of getClusters()" 
               class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold">{{ cluster }}</h3>
              <p-tag [severity]="getClusterHealthSeverity(cluster)" 
                     [value]="getClusterHealth(cluster)" 
                     [rounded]="true"></p-tag>
            </div>
            <div class="flex items-center justify-between text-sm mb-2">
              <span>Indexes: {{ getIndexesInCluster(cluster).length }}</span>
              <span>Documents: {{ getDocumentsInCluster(cluster) | number }}</span>
            </div>
            <div class="flex items-center justify-between text-sm mb-2">
              <span>Shards: {{ getTotalShardsInCluster(cluster) }}</span>
              <span>Replicas: {{ getAvgReplicasInCluster(cluster) }}</span>
            </div>
            <div class="mt-auto">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Query Load</span>
                <span>{{ getClusterLoad(cluster) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div [style.width.%]="getClusterLoad(cluster)" 
                     [ngClass]="{
                       'bg-green-500': getClusterLoad(cluster) < 70,
                       'bg-yellow-500': getClusterLoad(cluster) >= 70 && getClusterLoad(cluster) < 90,
                       'bg-red-500': getClusterLoad(cluster) >= 90
                     }"
                     class="h-2 rounded-full">
                </div>
              </div>
            </div>
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
                placeholder="Search indexes..." 
                [(ngModel)]="searchQuery"
                (input)="applyFilters()">
            </span>
          </div>
          <div class="w-full md:w-auto">
            <p-dropdown 
              [options]="clusterOptions" 
              [(ngModel)]="selectedCluster" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Filter by cluster"
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

      <!-- Indexes Table -->
      <p-card>
        <p-table [value]="filteredIndexes" [paginator]="true" [rows]="10" styleClass="p-datatable-sm p-datatable-gridlines"
                 [rowsPerPageOptions]="[5,10,25]" [showCurrentPageReport]="true" responsiveLayout="stack" 
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Cluster</th>
              <th>Status</th>
              <th>Documents</th>
              <th>Size</th>
              <th>Performance</th>
              <th>Configuration</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-index>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i class="pi pi-filter text-lg text-red-500"></i>
                  <div>
                    <div class="font-medium">{{ index.name }}</div>
                    <div class="text-xs text-gray-500">v{{ index.version }}</div>
                  </div>
                </div>
              </td>
              <td>{{ index.cluster }}</td>
              <td>
                <p-tag [severity]="getStatusSeverity(index.status)" [value]="index.status" [rounded]="true"></p-tag>
              </td>
              <td>{{ index.documents | number }}</td>
              <td>{{ index.size }}</td>
              <td>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between text-xs">
                    <span>QPS:</span>
                    <span class="font-medium">{{ index.queryPerSecond | number:'1.0-1' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span>Response time:</span>
                    <span class="font-medium">{{ index.avgResponseTime | number:'1.0-0' }} ms</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between text-xs">
                    <span>Shards:</span>
                    <span class="font-medium">{{ index.shards }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span>Replicas:</span>
                    <span class="font-medium">{{ index.replicas }}</span>
                  </div>
                </div>
              </td>
              <td>{{ index.lastUpdated | date:'short' }}</td>
              <td>
                <div class="flex gap-2">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="View details"></button>
                  <button pButton icon="pi pi-refresh" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Refresh"></button>
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
                  <i class="pi pi-filter text-5xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 mb-4">No search indexes found matching your criteria</p>
                  <button pButton label="Add New Index" icon="pi pi-plus" class="p-button-outlined"></button>
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
    
    :host ::ng-deep .p-chart {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class SearchExplorerComponent implements OnInit {
    indexes: SearchIndex[] = [];
    filteredIndexes: SearchIndex[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedCluster: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Healthy', value: 'healthy' },
        { label: 'Degraded', value: 'degraded' },
        { label: 'Offline', value: 'offline' }
    ];

    clusterOptions: { label: string, value: string }[] = [];

    performanceChartData: any;
    performanceChartOptions: any;

    constructor(private messageService: MessageService) { }

    ngOnInit() {
        this.loadMockData();
        this.filteredIndexes = [...this.indexes];
        this.updateClusterOptions();
        this.prepareChartData();
    }

    loadMockData() {
        const clusters = ['prod-es-cluster', 'staging-es-cluster', 'dev-es-cluster'];
        const statusOptions = ['healthy', 'degraded', 'offline'];
        const owners = ['Search Team', 'Data Engineering', 'Platform Team'];

        // Generate random indexes
        for (let i = 1; i <= 15; i++) {
            const cluster = clusters[Math.floor(Math.random() * clusters.length)];
            const documents = Math.floor(Math.random() * 10000000) + 1000; // 1K-10M documents
            const sizeGB = (documents * 0.0001).toFixed(2); // Rough estimation
            const queryPerSecond = Math.floor(Math.random() * 1000) + 1; // 1-1000 QPS
            const avgResponseTime = Math.floor(Math.random() * 500) + 10; // 10-500ms
            const shards = Math.pow(2, Math.floor(Math.random() * 4)); // 1, 2, 4, 8
            const replicas = Math.floor(Math.random() * 3); // 0, 1, 2

            const lastUpdated = new Date();
            lastUpdated.setHours(lastUpdated.getHours() - Math.floor(Math.random() * 72));

            const created = new Date();
            created.setDate(created.getDate() - Math.floor(Math.random() * 365));

            this.indexes.push({
                id: `index-${i}`,
                name: `elasticsearch-index-${i}`,
                type: 'elasticsearch',
                version: `7.${Math.floor(Math.random() * 10) + 10}.0`,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'healthy' | 'degraded' | 'offline',
                documents,
                size: `${sizeGB} GB`,
                queryPerSecond,
                avgResponseTime,
                lastUpdated,
                created,
                owner: owners[Math.floor(Math.random() * owners.length)],
                cluster,
                shards,
                replicas
            });
        }
    }

    updateClusterOptions() {
        const clusters = this.getClusters();
        this.clusterOptions = [
            { label: 'All Clusters', value: null },
            ...clusters.map(cluster => ({ label: cluster, value: cluster }))
        ];
    }

    prepareChartData() {
        // Mock performance data for the last 24 hours
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const qpsData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 500) + 200);
        const responseTimeData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 200) + 50);

        this.performanceChartData = {
            labels: hours,
            datasets: [
                {
                    label: 'Queries Per Second',
                    data: qpsData,
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Response Time (ms)',
                    data: responseTimeData,
                    fill: false,
                    borderColor: '#FFA726',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };

        this.performanceChartOptions = {
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 12
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    title: {
                        display: true,
                        text: 'QPS'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    title: {
                        display: true,
                        text: 'Response Time (ms)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            maintainAspectRatio: false
        };
    }

    applyFilters() {
        this.filteredIndexes = this.indexes.filter(index => {
            // Apply cluster filter
            if (this.selectedCluster && index.cluster !== this.selectedCluster) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && index.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !index.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    getClusters(): string[] {
        return Array.from(new Set(this.indexes.map(index => index.cluster))).sort();
    }

    getIndexesInCluster(cluster: string): SearchIndex[] {
        return this.indexes.filter(index => index.cluster === cluster);
    }

    getDocumentsInCluster(cluster: string): number {
        return this.getIndexesInCluster(cluster).reduce((sum, index) => sum + index.documents, 0);
    }

    getTotalShardsInCluster(cluster: string): number {
        return this.getIndexesInCluster(cluster).reduce((sum, index) => sum + index.shards, 0);
    }

    getAvgReplicasInCluster(cluster: string): number {
        const indexes = this.getIndexesInCluster(cluster);
        if (indexes.length === 0) return 0;

        const totalReplicas = indexes.reduce((sum, index) => sum + index.replicas, 0);
        return parseFloat((totalReplicas / indexes.length).toFixed(1));
    }

    getClusterHealth(cluster: string): string {
        const indexes = this.getIndexesInCluster(cluster);
        if (indexes.length === 0) return 'unknown';

        const healthyCount = indexes.filter(index => index.status === 'healthy').length;
        const degradedCount = indexes.filter(index => index.status === 'degraded').length;

        if (healthyCount === indexes.length) return 'healthy';
        if (degradedCount > 0 || healthyCount > 0) return 'degraded';
        return 'offline';
    }

    getClusterHealthSeverity(cluster: string): string {
        const health = this.getClusterHealth(cluster);
        return this.getStatusSeverity(health as any);
    }

    getClusterLoad(cluster: string): number {
        return Math.floor(Math.random() * 100);
    }

    getTotalDocuments(): number {
        return this.indexes.reduce((sum, index) => sum + index.documents, 0);
    }

    getTotalSize(): string {
        const totalSizeGB = this.indexes.reduce((sum, index) => {
            const sizeMatch = index.size.match(/(\d+\.?\d*)/);
            return sum + (sizeMatch ? parseFloat(sizeMatch[0]) : 0);
        }, 0);

        return `${totalSizeGB.toFixed(2)} GB`;
    }

    getTotalQPS(): number {
        return this.indexes.reduce((sum, index) => sum + index.queryPerSecond, 0);
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'healthy': return 'success';
            case 'degraded': return 'warning';
            case 'offline': return 'danger';
            default: return 'info';
        }
    }
}
