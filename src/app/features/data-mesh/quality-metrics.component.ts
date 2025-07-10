import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';

interface QualityMetric {
    id: string;
    name: string;
    dataset: string;
    type: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity';
    score: number;
    threshold: number;
    status: 'healthy' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    lastCheck: Date;
    issues: number;
    description: string;
    rules: string[];
}

@Component({
    selector: 'app-quality-metrics',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ChartModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        ProgressBarModule,
        BadgeModule,
        DataViewModule,
        TagModule,
        FormsModule
    ],
    template: `
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Data Quality Metrics</h1>
              <p class="text-surface-600 dark:text-surface-400 mt-1">Monitor and maintain data quality across your mesh</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Run Quality Check" icon="pi pi-play" class="p-button-primary"></button>
              <button pButton label="Export Report" icon="pi pi-download" class="p-button-outlined"></button>
            </div>
          </div>
        </div>

        <!-- Quality Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-check-circle text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">92%</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">Overall Quality Score</p>
              </div>
            </div>
          </p-card>

          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-database text-blue-600 dark:text-blue-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">156</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">Datasets Monitored</p>
              </div>
            </div>
          </p-card>

          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-exclamation-triangle text-orange-600 dark:text-orange-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">23</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">Active Issues</p>
              </div>
            </div>
          </p-card>

          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-cog text-purple-600 dark:text-purple-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">247</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">Quality Rules</p>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Quality Trends Chart -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <p-card>
            <ng-template pTemplate="header">
              <div class="flex items-center gap-2 p-4">
                <i class="pi pi-chart-line text-primary-500"></i>
                <h3 class="text-lg font-semibold">Quality Trends</h3>
              </div>
            </ng-template>
            
            <p-chart type="line" [data]="qualityTrendData" [options]="chartOptions"></p-chart>
          </p-card>

          <p-card>
            <ng-template pTemplate="header">
              <div class="flex items-center gap-2 p-4">
                <i class="pi pi-chart-pie text-primary-500"></i>
                <h3 class="text-lg font-semibold">Quality Distribution</h3>
              </div>
            </ng-template>
            
            <p-chart type="doughnut" [data]="qualityDistributionData" [options]="doughnutOptions"></p-chart>
          </p-card>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex-1 min-w-64">
            <input 
              pInputText 
              placeholder="Search metrics..." 
              [(ngModel)]="searchTerm"
              class="w-full">
          </div>
          <p-dropdown 
            [options]="typeOptions" 
            [(ngModel)]="selectedType"
            placeholder="Filter by Type"
            class="w-48">
          </p-dropdown>
          <p-dropdown 
            [options]="statusOptions" 
            [(ngModel)]="selectedStatus"
            placeholder="Filter by Status"
            class="w-48">
          </p-dropdown>
        </div>

        <!-- Quality Metrics List -->
        <p-card>
          <ng-template pTemplate="header">
            <div class="flex items-center gap-2 p-4">
              <i class="pi pi-list text-primary-500"></i>
              <h3 class="text-lg font-semibold">Quality Metrics</h3>
            </div>
          </ng-template>
          
          <p-dataView [value]="filteredMetrics" layout="grid">
            <ng-template pTemplate="grid" let-metric>
              <div class="col-12 md:col-6 lg:col-4 p-2">
                <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-surface-900 dark:text-surface-50">{{metric.name}}</h4>
                    <p-tag 
                      [value]="metric.status" 
                      [severity]="getStatusSeverity(metric.status)"
                      [icon]="getStatusIcon(metric.status)">
                    </p-tag>
                  </div>
                  
                  <p class="text-sm text-surface-600 dark:text-surface-400 mb-3">{{metric.dataset}}</p>
                  
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium">Quality Score</span>
                      <span class="text-sm font-bold">{{metric.score}}%</span>
                    </div>
                    <p-progressBar 
                      [value]="metric.score" 
                      [style]="{'height': '8px'}"
                      [styleClass]="getProgressBarClass(metric.score)">
                    </p-progressBar>
                  </div>
                  
                  <div class="flex items-center gap-2 mb-3">
                    <p-badge 
                      [value]="metric.type" 
                      [severity]="getTypeSeverity(metric.type)">
                    </p-badge>
                    <span class="text-xs text-surface-500 dark:text-surface-400">
                      {{metric.issues}} issues
                    </span>
                  </div>
                  
                  <div class="text-xs text-surface-500 dark:text-surface-400 mb-3">
                    Last check: {{metric.lastCheck | date:'short'}}
                  </div>
                  
                  <div class="flex gap-2">
                    <button pButton 
                            label="View Details" 
                            icon="pi pi-eye" 
                            class="p-button-sm p-button-outlined flex-1"
                            (click)="viewMetricDetails(metric)">
                    </button>
                    <button pButton 
                            icon="pi pi-play" 
                            class="p-button-sm p-button-text"
                            (click)="runQualityCheck(metric)">
                    </button>
                  </div>
                </div>
              </div>
            </ng-template>
          </p-dataView>
        </p-card>
      </div>
    </div>
  `,
    styles: [`
    :host ::ng-deep {
      .p-progressbar {
        border-radius: 4px;
        overflow: hidden;
      }
      
      .p-progressbar.success .p-progressbar-value {
        background: #10b981;
      }
      
      .p-progressbar.warning .p-progressbar-value {
        background: #f59e0b;
      }
      
      .p-progressbar.danger .p-progressbar-value {
        background: #ef4444;
      }
      
      .p-chart canvas {
        max-height: 300px;
      }
    }
  `]
})
export class QualityMetricsComponent implements OnInit {
    searchTerm = '';
    selectedType: any;
    selectedStatus: any;

    typeOptions = [
        { label: 'All Types', value: null },
        { label: 'Completeness', value: 'completeness' },
        { label: 'Accuracy', value: 'accuracy' },
        { label: 'Consistency', value: 'consistency' },
        { label: 'Timeliness', value: 'timeliness' },
        { label: 'Validity', value: 'validity' }
    ];

    statusOptions = [
        { label: 'All Status', value: null },
        { label: 'Healthy', value: 'healthy' },
        { label: 'Warning', value: 'warning' },
        { label: 'Critical', value: 'critical' }
    ];

    qualityMetrics: QualityMetric[] = [
        {
            id: '1',
            name: 'Customer Email Completeness',
            dataset: 'customers.main',
            type: 'completeness',
            score: 95,
            threshold: 90,
            status: 'healthy',
            trend: 'up',
            lastCheck: new Date('2024-01-15T10:30:00'),
            issues: 2,
            description: 'Checks for missing email addresses in customer records',
            rules: ['email_not_null', 'email_format_valid']
        },
        {
            id: '2',
            name: 'Product Price Accuracy',
            dataset: 'products.catalog',
            type: 'accuracy',
            score: 87,
            threshold: 85,
            status: 'warning',
            trend: 'down',
            lastCheck: new Date('2024-01-15T09:15:00'),
            issues: 8,
            description: 'Validates product pricing against external sources',
            rules: ['price_range_check', 'currency_validation']
        },
        {
            id: '3',
            name: 'Order Date Consistency',
            dataset: 'orders.transactions',
            type: 'consistency',
            score: 92,
            threshold: 88,
            status: 'healthy',
            trend: 'stable',
            lastCheck: new Date('2024-01-15T11:00:00'),
            issues: 3,
            description: 'Ensures order dates are consistent across systems',
            rules: ['date_format_check', 'chronological_order']
        },
        {
            id: '4',
            name: 'Inventory Timeliness',
            dataset: 'inventory.stock',
            type: 'timeliness',
            score: 78,
            threshold: 80,
            status: 'critical',
            trend: 'down',
            lastCheck: new Date('2024-01-15T08:45:00'),
            issues: 15,
            description: 'Monitors data freshness for inventory updates',
            rules: ['update_frequency', 'data_age_check']
        },
        {
            id: '5',
            name: 'User Profile Validity',
            dataset: 'users.profiles',
            type: 'validity',
            score: 94,
            threshold: 90,
            status: 'healthy',
            trend: 'up',
            lastCheck: new Date('2024-01-15T10:00:00'),
            issues: 1,
            description: 'Validates user profile data formats and values',
            rules: ['phone_format', 'age_range_check', 'country_code_valid']
        },
        {
            id: '6',
            name: 'Transaction Amount Accuracy',
            dataset: 'transactions.payments',
            type: 'accuracy',
            score: 89,
            threshold: 85,
            status: 'warning',
            trend: 'stable',
            lastCheck: new Date('2024-01-15T09:30:00'),
            issues: 6,
            description: 'Verifies transaction amounts match external records',
            rules: ['amount_precision', 'currency_conversion']
        }
    ];

    qualityTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Overall Quality Score',
                data: [88, 90, 87, 92, 91, 92],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            },
            {
                label: 'Issues Count',
                data: [45, 38, 52, 28, 33, 23],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    };

    qualityDistributionData = {
        labels: ['Healthy', 'Warning', 'Critical'],
        datasets: [
            {
                data: [65, 25, 10],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }
        ]
    };

    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Quality Score (%)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Issues Count'
                },
                grid: {
                    drawOnChartArea: false,
                },
            }
        }
    };

    doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    get filteredMetrics() {
        return this.qualityMetrics.filter(metric => {
            const matchesSearch = !this.searchTerm ||
                metric.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                metric.dataset.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesType = !this.selectedType || metric.type === this.selectedType;
            const matchesStatus = !this.selectedStatus || metric.status === this.selectedStatus;

            return matchesSearch && matchesType && matchesStatus;
        });
    }

    ngOnInit() {
        // Initialize component
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'danger';
            default: return 'secondary';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'healthy': return 'pi pi-check';
            case 'warning': return 'pi pi-exclamation-triangle';
            case 'critical': return 'pi pi-times-circle';
            default: return 'pi pi-info-circle';
        }
    }

    getTypeSeverity(type: string): string {
        switch (type) {
            case 'completeness': return 'info';
            case 'accuracy': return 'success';
            case 'consistency': return 'warning';
            case 'timeliness': return 'danger';
            case 'validity': return 'secondary';
            default: return 'secondary';
        }
    }

    getProgressBarClass(score: number): string {
        if (score >= 90) return 'success';
        if (score >= 80) return 'warning';
        return 'danger';
    }

    viewMetricDetails(metric: QualityMetric) {
        console.log('View metric details:', metric);
    }

    runQualityCheck(metric: QualityMetric) {
        console.log('Run quality check for:', metric);
    }
}
