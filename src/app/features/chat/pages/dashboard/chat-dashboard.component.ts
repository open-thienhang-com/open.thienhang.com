import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { ChatSummary, ChatAnalytics } from '../../models/chat.model';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-chat-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    TableModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    DropdownModule
  ],
  template: `
    <div class="bg-gray-50 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-comments text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Chat Management</h1>
              <p class="text-gray-600 m-0">Track conversations, agent response, and platform performance</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <p-button
              icon="pi pi-refresh"
              severity="info"
              [outlined]="true"
              [rounded]="true"
              pTooltip="Refresh"
              (onClick)="loadData()"
              class="hidden sm:inline-flex">
            </p-button>
            <p-button
              icon="pi pi-filter"
              severity="secondary"
              [outlined]="!showFilters"
              [rounded]="true"
              pTooltip="Toggle Filters"
              (onClick)="showFilters = !showFilters"
              class="hidden sm:inline-flex">
            </p-button>
            <p-button
              icon="pi pi-comments"
              severity="secondary"
              [outlined]="true"
              [rounded]="true"
              pTooltip="Conversations"
              (onClick)="navigateTo('conversations')"
              class="hidden sm:inline-flex">
            </p-button>
            <p-button
              icon="pi pi-chart-bar"
              severity="secondary"
              [outlined]="true"
              [rounded]="true"
              pTooltip="Analytics"
              (onClick)="navigateTo('analytics')"
              class="hidden sm:inline-flex">
            </p-button>
            <p-button
              label="Refresh"
              icon="pi pi-refresh"
              severity="primary"
              size="small"
              (onClick)="loadData()"
              class="sm:hidden">
            </p-button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6" *ngIf="summary && analytics">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Conversations</p>
              <p class="text-3xl font-bold text-gray-900">{{ summary.summary.total_conversations }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-comments text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Conversations</p>
              <p class="text-3xl font-bold text-green-600">{{ summary.summary.active_conversations }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-bolt text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Avg Response</p>
              <p class="text-3xl font-bold text-orange-600">{{ summary.summary.avg_response_time }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-clock text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Satisfaction</p>
              <p class="text-3xl font-bold text-purple-600">{{ summary.summary.customer_satisfaction }}/5</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-star text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-6" *ngIf="showFilters">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Period</label>
            <p-dropdown
              [options]="periodOptions"
              [(ngModel)]="selectedPeriod"
              optionLabel="label"
              optionValue="value"
              placeholder="Select period"
              class="w-full">
            </p-dropdown>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <p-button label="Apply" icon="pi pi-check" severity="primary" (onClick)="applyFilters()"></p-button>
          <p-button label="Reset" icon="pi pi-filter-slash" [outlined]="true" severity="secondary" (onClick)="resetFilters()"></p-button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6" *ngIf="loading">
        <div class="space-y-4">
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
        </div>
      </div>

      <div *ngIf="!loading && summary && analytics" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 m-0">Recent Activities</h2>
            <p-tag value="{{ summary.recent_activities.length }} events" severity="info"></p-tag>
          </div>

          <p-table [value]="summary.recent_activities" [paginator]="true" [rows]="6" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Type</th>
                <th>User/Agent</th>
                <th>Platform</th>
                <th>Time</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-activity>
              <tr>
                <td>
                  <p-tag [value]="formatActivityType(activity.type)" [severity]="getActivitySeverity(activity.type)"></p-tag>
                </td>
                <td>
                  <span class="text-sm text-gray-700">{{ activity.user || activity.agent || 'System' }}</span>
                </td>
                <td>
                  <span class="text-sm text-gray-700">{{ activity.platform || 'N/A' }}</span>
                </td>
                <td>
                  <span class="text-sm text-gray-500">{{ activity.timestamp | date:'short' }}</span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Platform Distribution</h2>
          <p-chart type="doughnut" [data]="chartData" [options]="chartOptions" styleClass="w-full"></p-chart>

          <div class="mt-5 space-y-2">
            <div class="flex justify-between items-center" *ngFor="let item of platformDistributionEntries">
              <span class="text-sm text-gray-700">{{ item.label }}</span>
              <p-tag [value]="item.value + '%'" severity="secondary"></p-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [':host { display: block; }']
})
export class ChatDashboardComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);

  summary: ChatSummary | null = null;
  analytics: ChatAnalytics | null = null;
  loading = false;
  showFilters = false;

  selectedPeriod = '7d';
  periodOptions = [
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' }
  ];

  chartData: any;
  chartOptions: any;
  platformDistributionEntries: { label: string; value: number }[] = [];

  ngOnInit() {
    this.initChartOptions();
    this.loadData();
  }

  loadData() {
    this.loading = true;

    forkJoin({
      summary: this.chatService.getSummary(),
      analytics: this.chatService.getAnalytics(this.selectedPeriod)
    }).subscribe({
      next: ({ summary, analytics }) => {
        this.summary = summary.data;
        this.analytics = analytics.data;
        this.setupChart(analytics.data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading chat dashboard', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.loadData();
  }

  resetFilters() {
    this.selectedPeriod = '7d';
    this.loadData();
  }

  setupChart(data: ChatAnalytics) {
    const documentStyle = getComputedStyle(document.documentElement);
    const platformData = data.platform_distribution || {};

    this.platformDistributionEntries = Object.entries(platformData).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: Number(value)
    }));

    this.chartData = {
      labels: this.platformDistributionEntries.map(item => item.label),
      datasets: [
        {
          data: this.platformDistributionEntries.map(item => item.value),
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--cyan-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--orange-500'),
            documentStyle.getPropertyValue('--purple-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--cyan-400'),
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--orange-400'),
            documentStyle.getPropertyValue('--purple-400')
          ]
        }
      ]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    };
  }

  navigateTo(path: string) {
    this.router.navigate(['/chat', path]);
  }

  getActivitySeverity(type: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (type) {
      case 'conversation_resolved':
        return 'success';
      case 'new_conversation':
        return 'info';
      case 'agent_assigned':
        return 'warn';
      default:
        return 'danger';
    }
  }

  formatActivityType(type: string): string {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
