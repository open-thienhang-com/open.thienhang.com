import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ChatAnalytics } from '../../models/chat.model';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-chat-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    DropdownModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    SkeletonModule
  ],
  template: `
    <div class="bg-gray-50 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-chart-bar text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Chat Analytics</h1>
              <p class="text-gray-600 m-0">Operational metrics and channel-level performance insights</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <p-dropdown [options]="periodOptions" [(ngModel)]="selectedPeriod" optionLabel="label" optionValue="value" class="w-11rem"></p-dropdown>
            <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadAnalytics()"></p-button>
            <p-button label="Dashboard" icon="pi pi-home" severity="secondary" [outlined]="true" [routerLink]="['/chat']" class="hidden sm:inline-flex"></p-button>
            <p-button label="Conversations" icon="pi pi-comments" severity="secondary" [outlined]="true" [routerLink]="['/chat/conversations']" class="hidden sm:inline-flex"></p-button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6" *ngIf="loading">
        <div class="space-y-4">
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
        </div>
      </div>

      <ng-container *ngIf="!loading && analytics">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Total Conversations</p>
            <p class="text-3xl font-bold text-gray-900">{{ analytics.overview.total_conversations }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Resolution Rate</p>
            <p class="text-3xl font-bold text-green-600">{{ analytics.overview.resolution_rate }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Avg Response Time</p>
            <p class="text-3xl font-bold text-orange-600">{{ analytics.overview.average_response_time }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">CSAT</p>
            <p class="text-3xl font-bold text-purple-600">{{ analytics.overview.customer_satisfaction }}/5</p>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Platform Distribution</h2>
            <p-chart type="doughnut" [data]="platformChartData" [options]="chartOptions"></p-chart>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Sentiment Analysis</h2>
            <p-chart type="bar" [data]="sentimentChartData" [options]="barChartOptions"></p-chart>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 m-0">Agent Performance</h2>
          </div>
          <p-table [value]="analytics.agent_performance" [paginator]="true" [rows]="8" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Agent</th>
                <th>Conversations</th>
                <th>Avg Response</th>
                <th>Satisfaction</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row>
              <tr>
                <td>{{ row.agent }}</td>
                <td>{{ row.conversations }}</td>
                <td>{{ row.avg_response_time }}</td>
                <td>
                  <p-tag [value]="row.satisfaction + '/5'" [severity]="getSatisfactionSeverity(row.satisfaction)"></p-tag>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </ng-container>
    </div>
  `
})
export class ChatAnalyticsComponent implements OnInit {
  private chatService = inject(ChatService);

  loading = false;
  analytics: ChatAnalytics | null = null;

  selectedPeriod = '7d';
  periodOptions = [
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' }
  ];

  platformChartData: any;
  sentimentChartData: any;
  chartOptions: any;
  barChartOptions: any;

  ngOnInit() {
    this.initChartOptions();
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.chatService.getAnalytics(this.selectedPeriod).subscribe({
      next: (res) => {
        this.analytics = res.data;
        this.setupCharts(res.data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading analytics', err);
        this.loading = false;
      }
    });
  }

  setupCharts(data: ChatAnalytics) {
    const documentStyle = getComputedStyle(document.documentElement);

    this.platformChartData = {
      labels: Object.keys(data.platform_distribution || {}).map((k) => this.toTitle(k)),
      datasets: [
        {
          data: Object.values(data.platform_distribution || {}),
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--cyan-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--orange-500'),
            documentStyle.getPropertyValue('--purple-500')
          ]
        }
      ]
    };

    this.sentimentChartData = {
      labels: Object.keys(data.sentiment_analysis || {}).map((k) => this.toTitle(k)),
      datasets: [
        {
          label: 'Sentiment',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          data: Object.values(data.sentiment_analysis || {})
        }
      ]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const borderColor = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      }
    };

    this.barChartOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: borderColor }
        },
        y: {
          ticks: { color: textColor },
          grid: { color: borderColor }
        }
      }
    };
  }

  getSatisfactionSeverity(score: number): 'success' | 'info' | 'warn' | 'danger' {
    if (score >= 4.5) return 'success';
    if (score >= 4.0) return 'info';
    if (score >= 3.0) return 'warn';
    return 'danger';
  }

  private toTitle(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }
}
