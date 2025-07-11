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
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { RouterModule } from '@angular/router';

interface MLModel {
    id: string;
    name: string;
    type: string;
    framework: string;
    version: string;
    status: 'production' | 'staging' | 'development' | 'archived';
    accuracy: number;
    f1Score: number;
    lastTrained: Date;
    lastDeployed: Date | null;
    owner: string;
    inputs: number;
    outputs: number;
    tags: string[];
    size: string;
}

@Component({
    selector: 'app-ml-models-explorer',
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
        ChartModule,
        ProgressBarModule,
        ToastModule,
        RadioButtonModule,
        TabViewModule,
        RouterModule
    ],
    providers: [MessageService],
    template: `
    <div class="p-4 md:p-6">
      <div class="mb-6">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">ML Models Explorer</h1>
            <p class="text-gray-600 dark:text-gray-400">Browse and manage machine learning models</p>
          </div>
          <button pButton label="Add New Model" icon="pi pi-plus" class="p-button-primary"></button>
        </div>
        
        <!-- ML Model Type Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer"
               [class.border-2]="selectedModelType === 'classification'"
               [class.border-blue-500]="selectedModelType === 'classification'"
               (click)="filterByType('classification')">
            <i class="pi pi-chart-line text-3xl mb-2 text-blue-500"></i>
            <h3 class="text-sm font-semibold">Classification</h3>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {{ getCountByType('classification') }} models
            </span>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer"
               [class.border-2]="selectedModelType === 'regression'"
               [class.border-blue-500]="selectedModelType === 'regression'"
               (click)="filterByType('regression')">
            <i class="pi pi-chart-line text-3xl mb-2 text-green-500"></i>
            <h3 class="text-sm font-semibold">Regression</h3>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {{ getCountByType('regression') }} models
            </span>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer"
               [class.border-2]="selectedModelType === 'clustering'"
               [class.border-blue-500]="selectedModelType === 'clustering'"
               (click)="filterByType('clustering')">
            <i class="pi pi-chart-line text-3xl mb-2 text-purple-500"></i>
            <h3 class="text-sm font-semibold">Clustering</h3>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {{ getCountByType('clustering') }} models
            </span>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer"
               [class.border-2]="selectedModelType === 'nlp'"
               [class.border-blue-500]="selectedModelType === 'nlp'"
               (click)="filterByType('nlp')">
            <i class="pi pi-chart-line text-3xl mb-2 text-red-500"></i>
            <h3 class="text-sm font-semibold">NLP</h3>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {{ getCountByType('nlp') }} models
            </span>
          </div>
        </div>
        
        <!-- Framework Distribution Chart -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Model Distribution</h3>
            <div class="h-60">
              <p-chart type="bar" [data]="chartData" [options]="chartOptions"></p-chart>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Status Distribution</h3>
            <div class="h-60">
              <p-chart type="pie" [data]="pieData" [options]="pieOptions"></p-chart>
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
                placeholder="Search models..." 
                [(ngModel)]="searchQuery"
                (input)="applyFilters()">
            </span>
          </div>
          <div class="w-full md:w-auto">
            <p-dropdown 
              [options]="frameworkOptions" 
              [(ngModel)]="selectedFramework" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Filter by framework"
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

      <!-- ML Models Table -->
      <p-card>
        <p-table [value]="filteredModels" [paginator]="true" [rows]="10" styleClass="p-datatable-sm p-datatable-gridlines"
                 [rowsPerPageOptions]="[5,10,25]" [showCurrentPageReport]="true" responsiveLayout="stack" 
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Framework</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Last Trained</th>
              <th>Owner</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-model>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i [class]="getIconClass(model.type)" class="text-lg"></i>
                  <div>
                    <div class="font-medium">{{ model.name }}</div>
                    <div class="text-xs text-gray-500">v{{ model.version }}</div>
                  </div>
                </div>
              </td>
              <td>{{ model.type | titlecase }}</td>
              <td>{{ model.framework }}</td>
              <td>
                <p-tag [severity]="getStatusSeverity(model.status)" [value]="model.status" [rounded]="true"></p-tag>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between text-xs">
                    <span>Accuracy:</span>
                    <span class="font-medium">{{ model.accuracy }}%</span>
                  </div>
                  <p-progressBar [value]="model.accuracy" [showValue]="false" [style]="{'height': '6px'}"></p-progressBar>
                  <div class="flex items-center justify-between text-xs">
                    <span>F1 Score:</span>
                    <span class="font-medium">{{ model.f1Score }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="flex flex-col">
                  <span>{{ model.lastTrained | date:'short' }}</span>
                  <span class="text-xs text-gray-500" *ngIf="model.lastDeployed">
                    Deployed: {{ model.lastDeployed | date:'short' }}
                  </span>
                </div>
              </td>
              <td>{{ model.owner }}</td>
              <td>{{ model.size }}</td>
              <td>
                <div class="flex gap-2">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="View details"></button>
                  <button pButton icon="pi pi-bolt" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Deploy"></button>
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
                  <i class="pi pi-chart-line text-5xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 mb-4">No ML models found matching your criteria</p>
                  <button pButton label="Add New Model" icon="pi pi-plus" class="p-button-outlined"></button>
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
    
    :host ::ng-deep .p-progressbar-value {
      @apply bg-blue-500;
    }
    
    :host ::ng-deep .p-chart {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class MLModelsExplorerComponent implements OnInit {
    models: MLModel[] = [];
    filteredModels: MLModel[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedModelType: string | null = null;
    selectedFramework: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Production', value: 'production' },
        { label: 'Staging', value: 'staging' },
        { label: 'Development', value: 'development' },
        { label: 'Archived', value: 'archived' }
    ];

    frameworkOptions = [
        { label: 'All Frameworks', value: null },
        { label: 'TensorFlow', value: 'TensorFlow' },
        { label: 'PyTorch', value: 'PyTorch' },
        { label: 'Scikit-learn', value: 'Scikit-learn' },
        { label: 'Hugging Face', value: 'Hugging Face' },
        { label: 'XGBoost', value: 'XGBoost' }
    ];

    chartData: any;
    chartOptions: any;
    pieData: any;
    pieOptions: any;

    constructor(private messageService: MessageService) { }

    ngOnInit() {
        this.loadMockData();
        this.filteredModels = [...this.models];
        this.prepareChartData();
    }

    loadMockData() {
        const modelTypes = ['classification', 'regression', 'clustering', 'nlp'];
        const frameworks = ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face', 'XGBoost'];
        const statusOptions = ['production', 'staging', 'development', 'archived'];
        const owners = ['Data Science', 'ML Ops', 'Analytics Team', 'Research'];

        // Generate random models
        for (let i = 1; i <= 30; i++) {
            const type = modelTypes[Math.floor(Math.random() * modelTypes.length)];
            const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
            const version = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'production' | 'staging' | 'development' | 'archived';

            const accuracy = Math.floor(Math.random() * 30) + 70; // 70-99%
            const f1Score = (Math.random() * 0.3 + 0.7).toFixed(2); // 0.70-0.99

            const lastTrained = new Date();
            lastTrained.setDate(lastTrained.getDate() - Math.floor(Math.random() * 90));

            let lastDeployed: Date | null = null;
            if (status === 'production' || status === 'staging') {
                lastDeployed = new Date(lastTrained);
                lastDeployed.setDate(lastDeployed.getDate() + Math.floor(Math.random() * 7) + 1);
            }

            const inputs = Math.floor(Math.random() * 100) + 1;
            const outputs = Math.floor(Math.random() * 10) + 1;

            const sizeMB = Math.floor(Math.random() * 1000) + 1;

            this.models.push({
                id: `model-${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)}-Model-${i}`,
                type,
                framework,
                version,
                status,
                accuracy,
                f1Score: parseFloat(f1Score),
                lastTrained,
                lastDeployed,
                owner: owners[Math.floor(Math.random() * owners.length)],
                inputs,
                outputs,
                tags: this.getRandomTags(),
                size: `${sizeMB} MB`
            });
        }
    }

    getRandomTags(): string[] {
        const allTags = ['classification', 'regression', 'nlp', 'production', 'experimental', 'high-accuracy', 'low-latency', 'ensemble'];
        const numTags = Math.floor(Math.random() * 4) + 1;
        const tags: string[] = [];

        for (let i = 0; i < numTags; i++) {
            const tag = allTags[Math.floor(Math.random() * allTags.length)];
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        }

        return tags;
    }

    prepareChartData() {
        // Framework distribution chart
        const frameworkCounts: { [key: string]: number } = {};
        this.models.forEach(model => {
            frameworkCounts[model.framework] = (frameworkCounts[model.framework] || 0) + 1;
        });

        this.chartData = {
            labels: Object.keys(frameworkCounts),
            datasets: [
                {
                    label: 'Number of Models',
                    data: Object.values(frameworkCounts),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            maintainAspectRatio: false
        };

        // Status distribution pie chart
        const statusCounts: { [key: string]: number } = {};
        this.models.forEach(model => {
            statusCounts[model.status] = (statusCounts[model.status] || 0) + 1;
        });

        this.pieData = {
            labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            datasets: [
                {
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    hoverBackgroundColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ]
                }
            ]
        };

        this.pieOptions = {
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            maintainAspectRatio: false
        };
    }

    applyFilters() {
        this.filteredModels = this.models.filter(model => {
            // Apply model type filter
            if (this.selectedModelType && model.type !== this.selectedModelType) {
                return false;
            }

            // Apply framework filter
            if (this.selectedFramework && model.framework !== this.selectedFramework) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && model.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !model.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    filterByType(type: string | null) {
        this.selectedModelType = type;
        this.applyFilters();
    }

    getCountByType(type: string | null): number {
        if (!type) {
            return this.models.length;
        }
        return this.models.filter(model => model.type === type).length;
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'classification': return 'pi pi-chart-line text-blue-500';
            case 'regression': return 'pi pi-chart-line text-green-500';
            case 'clustering': return 'pi pi-chart-line text-purple-500';
            case 'nlp': return 'pi pi-chart-line text-red-500';
            default: return 'pi pi-chart-line text-gray-500';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'production': return 'success';
            case 'staging': return 'warning';
            case 'development': return 'info';
            case 'archived': return 'danger';
            default: return 'info';
        }
    }
}
