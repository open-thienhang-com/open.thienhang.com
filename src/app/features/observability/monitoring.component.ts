import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TimelineModule } from 'primeng/timeline';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

interface MonitoringMetric {
    id: string;
    name: string;
    service: string;
    type: 'availability' | 'latency' | 'throughput' | 'error_rate' | 'data_quality';
    value: number;
    unit: string;
    status: 'healthy' | 'warning' | 'critical';
    threshold: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: Date;
    description: string;
}

interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    service: string;
    timestamp: Date;
    status: 'active' | 'acknowledged' | 'resolved';
    assignee?: string;
}

@Component({
    selector: 'app-monitoring',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ChartModule,
        ButtonModule,
        TableModule,
        TagModule,
        BadgeModule,
        DropdownModule,
        InputTextModule,
        TimelineModule,
        DialogModule,
        FormsModule
    ],
    template: `
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Monitoring Dashboard</h1>
              <p class="text-surface-600 dark:text-surface-400 mt-1">Real-time monitoring and alerting for your data mesh</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Create Alert" icon="pi pi-bell" class="p-button-primary"></button>
              <button pButton label="Export Report" icon="pi pi-download" class="p-button-outlined"></button>
            </div>
          </div>
        </div>

        <!-- System Health Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-check-circle text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">99.9%</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">System Uptime</p>
              </div>
            </div>
          </p-card>

          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-clock text-blue-600 dark:text-blue-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">127ms</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">Avg Response Time</p>
              </div>
            </div>
          </p-card>

          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-chart-line text-purple-600 dark:text-purple-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">2.3M</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">Requests/Hour</p>
              </div>
            </div>
          </p-card>

          <p-card>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-surface-900 dark:text-surface-50">3</h3>
                <p class="text-sm text-surface-600 dark:text-surface-400">Active Alerts</p>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Monitoring Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <p-card>
            <ng-template pTemplate="header">
              <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-2">
                  <i class="pi pi-chart-line text-primary-500"></i>
                  <h3 class="text-lg font-semibold">System Performance</h3>
                </div>
                <p-dropdown 
                  [options]="timeRangeOptions" 
                  [(ngModel)]="selectedTimeRange"
                  class="w-32">
                </p-dropdown>
              </div>
            </ng-template>
            
            <p-chart type="line" [data]="performanceData" [options]="chartOptions" height="300"></p-chart>
          </p-card>

          <p-card>
            <ng-template pTemplate="header">
              <div class="flex items-center gap-2 p-4">
                <i class="pi pi-chart-bar text-primary-500"></i>
                <h3 class="text-lg font-semibold">Service Health</h3>
              </div>
            </ng-template>
            
            <p-chart type="bar" [data]="serviceHealthData" [options]="barChartOptions" height="300"></p-chart>
          </p-card>
        </div>

        <!-- Alerts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div class="lg:col-span-2">
            <p-card>
              <ng-template pTemplate="header">
                <div class="flex items-center justify-between p-4">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-bell text-primary-500"></i>
                    <h3 class="text-lg font-semibold">Active Alerts</h3>
                  </div>
                  <div class="flex gap-2">
                    <p-dropdown 
                      [options]="alertSeverityOptions" 
                      [(ngModel)]="selectedSeverity"
                      placeholder="Filter by Severity"
                      class="w-40">
                    </p-dropdown>
                    <p-dropdown 
                      [options]="alertStatusOptions" 
                      [(ngModel)]="selectedAlertStatus"
                      placeholder="Filter by Status"
                      class="w-40">
                    </p-dropdown>
                  </div>
                </div>
              </ng-template>
              
              <p-table [value]="filteredAlerts" [rows]="10" [paginator]="true">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Alert</th>
                    <th>Service</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-alert>
                  <tr>
                    <td>
                      <div>
                        <div class="font-medium">{{alert.title}}</div>
                        <div class="text-sm text-surface-600 dark:text-surface-400">
                          {{alert.description | slice:0:60}}{{alert.description.length > 60 ? '...' : ''}}
                        </div>
                      </div>
                    </td>
                    <td>{{alert.service}}</td>
                    <td>
                      <p-tag 
                        [value]="alert.severity" 
                        [severity]="getSeverityColor(alert.severity)"
                        [icon]="getSeverityIcon(alert.severity)">
                      </p-tag>
                    </td>
                    <td>
                      <p-badge 
                        [value]="alert.status" 
                        [severity]="getStatusColor(alert.status)">
                      </p-badge>
                    </td>
                    <td>{{alert.timestamp | date:'short'}}</td>
                    <td>
                      <div class="flex gap-1">
                        <button 
                          pButton 
                          icon="pi pi-eye" 
                          class="p-button-sm p-button-text"
                          (click)="viewAlert(alert)">
                        </button>
                        <button 
                          pButton 
                          icon="pi pi-check" 
                          class="p-button-sm p-button-text"
                          (click)="acknowledgeAlert(alert)">
                        </button>
                        <button 
                          pButton 
                          icon="pi pi-times" 
                          class="p-button-sm p-button-text"
                          (click)="resolveAlert(alert)">
                        </button>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>

          <!-- Alert Timeline -->
          <div class="lg:col-span-1">
            <p-card>
              <ng-template pTemplate="header">
                <div class="flex items-center gap-2 p-4">
                  <i class="pi pi-clock text-primary-500"></i>
                  <h3 class="text-lg font-semibold">Recent Activity</h3>
                </div>
              </ng-template>
              
              <p-timeline [value]="alertTimeline" layout="vertical">
                <ng-template pTemplate="marker" let-event>
                  <span class="flex w-6 h-6 items-center justify-center text-white rounded-full z-10 shadow-sm"
                        [style.background-color]="event.color">
                    <i [class]="event.icon" class="text-xs"></i>
                  </span>
                </ng-template>
                
                <ng-template pTemplate="content" let-event>
                  <div class="pl-3">
                    <h6 class="font-medium text-sm">{{event.title}}</h6>
                    <p class="text-xs text-surface-600 dark:text-surface-400 mt-1">{{event.description}}</p>
                    <small class="text-surface-500 dark:text-surface-500">{{event.timestamp | date:'short'}}</small>
                  </div>
                </ng-template>
              </p-timeline>
            </p-card>
          </div>
        </div>

        <!-- Metrics Overview -->
        <p-card>
          <ng-template pTemplate="header">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-2">
                <i class="pi pi-chart-pie text-primary-500"></i>
                <h3 class="text-lg font-semibold">Key Metrics</h3>
              </div>
              <div class="flex gap-2">
                <input 
                  pInputText 
                  placeholder="Search metrics..." 
                  [(ngModel)]="searchTerm"
                  class="w-64">
                <p-dropdown 
                  [options]="metricTypeOptions" 
                  [(ngModel)]="selectedMetricType"
                  placeholder="Filter by Type"
                  class="w-40">
                </p-dropdown>
              </div>
            </div>
          </ng-template>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let metric of filteredMetrics" 
                 class="border border-surface-200 dark:border-surface-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-surface-900 dark:text-surface-50">{{metric.name}}</h4>
                <p-tag 
                  [value]="metric.status" 
                  [severity]="getMetricStatusColor(metric.status)"
                  [icon]="getMetricStatusIcon(metric.status)">
                </p-tag>
              </div>
              
              <div class="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">
                {{metric.value}}{{metric.unit}}
              </div>
              
              <div class="text-sm text-surface-600 dark:text-surface-400 mb-2">
                {{metric.service}} • {{metric.type}}
              </div>
              
              <div class="text-xs text-surface-500 dark:text-surface-500">
                Updated: {{metric.lastUpdated | date:'short'}}
              </div>
              
              <div class="mt-3 flex items-center gap-2">
                <span class="text-xs">Threshold: {{metric.threshold}}{{metric.unit}}</span>
                <div class="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-300"
                    [style.width.%]="(metric.value / metric.threshold) * 100"
                    [ngClass]="getMetricBarColor(metric.status)">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </p-card>

        <!-- Alert Detail Dialog -->
        <p-dialog 
          [(visible)]="showAlertDetail" 
          [modal]="true" 
          [draggable]="false"
          [resizable]="false"
          [style]="{width: '600px'}"
          header="Alert Details">
          
          <div *ngIf="selectedAlert" class="space-y-4">
            <div class="flex items-center gap-3">
              <i [class]="getSeverityIcon(selectedAlert.severity)" 
                 [ngClass]="getSeverityIconColor(selectedAlert.severity)"
                 class="text-2xl"></i>
              <div>
                <h3 class="text-lg font-semibold">{{selectedAlert.title}}</h3>
                <p class="text-surface-600 dark:text-surface-400">{{selectedAlert.service}}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Severity</label>
                <p-tag 
                  [value]="selectedAlert.severity" 
                  [severity]="getSeverityColor(selectedAlert.severity)">
                </p-tag>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Status</label>
                <p-badge 
                  [value]="selectedAlert.status" 
                  [severity]="getStatusColor(selectedAlert.status)">
                </p-badge>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <p class="text-surface-600 dark:text-surface-400">{{selectedAlert.description}}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Timestamp</label>
              <p class="text-surface-600 dark:text-surface-400">{{selectedAlert.timestamp | date:'full'}}</p>
            </div>
            
            <div *ngIf="selectedAlert.assignee">
              <label class="block text-sm font-medium mb-1">Assignee</label>
              <p class="text-surface-600 dark:text-surface-400">{{selectedAlert.assignee}}</p>
            </div>
            
            <div class="flex justify-end gap-2">
              <button pButton label="Acknowledge" class="p-button-outlined" (click)="acknowledgeAlert(selectedAlert)"></button>
              <button pButton label="Resolve" class="p-button-primary" (click)="resolveAlert(selectedAlert)"></button>
            </div>
          </div>
        </p-dialog>
      </div>
    </div>
  `,
    styles: [`
    :host ::ng-deep {
      .p-timeline-event-content {
        padding: 0.5rem 0;
      }
      
      .p-timeline-event-marker {
        border: 2px solid var(--surface-0);
      }
      
      .p-chart canvas {
        max-height: 300px;
      }
    }
  `]
})
export class MonitoringComponent implements OnInit {
    selectedTimeRange = '1h';
    selectedSeverity: any;
    selectedAlertStatus: any;
    selectedMetricType: any;
    searchTerm = '';
    showAlertDetail = false;
    selectedAlert: Alert | null = null;

    timeRangeOptions = [
        { label: '1 Hour', value: '1h' },
        { label: '6 Hours', value: '6h' },
        { label: '24 Hours', value: '24h' },
        { label: '7 Days', value: '7d' },
        { label: '30 Days', value: '30d' }
    ];

    alertSeverityOptions = [
        { label: 'All Severities', value: null },
        { label: 'Critical', value: 'critical' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' }
    ];

    alertStatusOptions = [
        { label: 'All Status', value: null },
        { label: 'Active', value: 'active' },
        { label: 'Acknowledged', value: 'acknowledged' },
        { label: 'Resolved', value: 'resolved' }
    ];

    metricTypeOptions = [
        { label: 'All Types', value: null },
        { label: 'Availability', value: 'availability' },
        { label: 'Latency', value: 'latency' },
        { label: 'Throughput', value: 'throughput' },
        { label: 'Error Rate', value: 'error_rate' },
        { label: 'Data Quality', value: 'data_quality' }
    ];

    performanceData = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
            {
                label: 'Response Time (ms)',
                data: [120, 135, 145, 127, 132, 128],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            },
            {
                label: 'Error Rate (%)',
                data: [0.5, 0.8, 1.2, 0.6, 0.7, 0.4],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    };

    serviceHealthData = {
        labels: ['API Gateway', 'Data Pipeline', 'Analytics', 'Storage', 'Monitoring'],
        datasets: [
            {
                label: 'Uptime (%)',
                data: [99.9, 99.5, 99.8, 99.95, 99.7],
                backgroundColor: ['#10b981', '#f59e0b', '#10b981', '#10b981', '#10b981']
            }
        ]
    };

    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Response Time (ms)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Error Rate (%)'
                },
                grid: {
                    drawOnChartArea: false,
                },
            }
        }
    };

    barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Uptime (%)'
                }
            }
        }
    };

    alerts: Alert[] = [
        {
            id: '1',
            title: 'High Response Time',
            description: 'API Gateway response time exceeded 200ms threshold for the last 5 minutes',
            severity: 'warning',
            service: 'API Gateway',
            timestamp: new Date('2024-01-15T10:30:00'),
            status: 'active'
        },
        {
            id: '2',
            title: 'Data Pipeline Failure',
            description: 'Customer data pipeline failed during processing step 3',
            severity: 'critical',
            service: 'Data Pipeline',
            timestamp: new Date('2024-01-15T09:45:00'),
            status: 'acknowledged',
            assignee: 'John Doe'
        },
        {
            id: '3',
            title: 'Storage Capacity Warning',
            description: 'Data warehouse storage usage exceeded 85% capacity',
            severity: 'warning',
            service: 'Storage',
            timestamp: new Date('2024-01-15T08:15:00'),
            status: 'active'
        }
    ];

    monitoringMetrics: MonitoringMetric[] = [
        {
            id: '1',
            name: 'API Availability',
            service: 'API Gateway',
            type: 'availability',
            value: 99.9,
            unit: '%',
            status: 'healthy',
            threshold: 99.5,
            trend: 'stable',
            lastUpdated: new Date('2024-01-15T10:30:00'),
            description: 'API Gateway uptime percentage'
        },
        {
            id: '2',
            name: 'Response Time',
            service: 'API Gateway',
            type: 'latency',
            value: 127,
            unit: 'ms',
            status: 'healthy',
            threshold: 200,
            trend: 'down',
            lastUpdated: new Date('2024-01-15T10:30:00'),
            description: 'Average API response time'
        },
        {
            id: '3',
            name: 'Throughput',
            service: 'Data Pipeline',
            type: 'throughput',
            value: 2300,
            unit: '/hour',
            status: 'healthy',
            threshold: 2000,
            trend: 'up',
            lastUpdated: new Date('2024-01-15T10:29:00'),
            description: 'Data processing throughput'
        },
        {
            id: '4',
            name: 'Error Rate',
            service: 'Analytics',
            type: 'error_rate',
            value: 0.8,
            unit: '%',
            status: 'warning',
            threshold: 1.0,
            trend: 'up',
            lastUpdated: new Date('2024-01-15T10:28:00'),
            description: 'Analytics service error rate'
        },
        {
            id: '5',
            name: 'Data Quality Score',
            service: 'Data Pipeline',
            type: 'data_quality',
            value: 94,
            unit: '%',
            status: 'healthy',
            threshold: 90,
            trend: 'stable',
            lastUpdated: new Date('2024-01-15T10:25:00'),
            description: 'Overall data quality score'
        }
    ];

    alertTimeline = [
        {
            title: 'Alert Resolved',
            description: 'Database connection issue resolved',
            timestamp: new Date('2024-01-15T10:15:00'),
            icon: 'pi pi-check',
            color: '#10b981'
        },
        {
            title: 'Alert Acknowledged',
            description: 'High memory usage alert acknowledged',
            timestamp: new Date('2024-01-15T09:45:00'),
            icon: 'pi pi-info-circle',
            color: '#3b82f6'
        },
        {
            title: 'Critical Alert',
            description: 'Data pipeline failure detected',
            timestamp: new Date('2024-01-15T09:30:00'),
            icon: 'pi pi-exclamation-triangle',
            color: '#ef4444'
        },
        {
            title: 'System Healthy',
            description: 'All systems operating normally',
            timestamp: new Date('2024-01-15T08:00:00'),
            icon: 'pi pi-check-circle',
            color: '#10b981'
        }
    ];

    get filteredAlerts() {
        return this.alerts.filter(alert => {
            const matchesSeverity = !this.selectedSeverity || alert.severity === this.selectedSeverity;
            const matchesStatus = !this.selectedAlertStatus || alert.status === this.selectedAlertStatus;
            return matchesSeverity && matchesStatus;
        });
    }

    get filteredMetrics() {
        return this.monitoringMetrics.filter(metric => {
            const matchesSearch = !this.searchTerm ||
                metric.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                metric.service.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesType = !this.selectedMetricType || metric.type === this.selectedMetricType;
            return matchesSearch && matchesType;
        });
    }

    ngOnInit() {
        // Initialize component
    }

    getSeverityColor(severity: string): string {
        switch (severity) {
            case 'critical': return 'danger';
            case 'error': return 'danger';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'secondary';
        }
    }

    getSeverityIcon(severity: string): string {
        switch (severity) {
            case 'critical': return 'pi pi-times-circle';
            case 'error': return 'pi pi-exclamation-triangle';
            case 'warning': return 'pi pi-exclamation-triangle';
            case 'info': return 'pi pi-info-circle';
            default: return 'pi pi-circle';
        }
    }

    getSeverityIconColor(severity: string): string {
        switch (severity) {
            case 'critical': return 'text-red-600';
            case 'error': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            case 'info': return 'text-blue-500';
            default: return 'text-surface-500';
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'active': return 'danger';
            case 'acknowledged': return 'warning';
            case 'resolved': return 'success';
            default: return 'secondary';
        }
    }

    getMetricStatusColor(status: string): string {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'danger';
            default: return 'secondary';
        }
    }

    getMetricStatusIcon(status: string): string {
        switch (status) {
            case 'healthy': return 'pi pi-check';
            case 'warning': return 'pi pi-exclamation-triangle';
            case 'critical': return 'pi pi-times-circle';
            default: return 'pi pi-circle';
        }
    }

    getMetricBarColor(status: string): string {
        switch (status) {
            case 'healthy': return 'bg-green-500';
            case 'warning': return 'bg-yellow-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-surface-400';
        }
    }

    viewAlert(alert: Alert) {
        this.selectedAlert = alert;
        this.showAlertDetail = true;
    }

    acknowledgeAlert(alert: Alert) {
        alert.status = 'acknowledged';
        this.showAlertDetail = false;
    }

    resolveAlert(alert: Alert) {
        alert.status = 'resolved';
        this.showAlertDetail = false;
    }
}
