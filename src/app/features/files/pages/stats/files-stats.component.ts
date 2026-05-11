import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { FilesService } from '../../services/files.service';
import { FilesStatsSummary, FilesUsageStats } from '../../models/files.model';

@Component({
  selector: 'app-files-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TableModule, ChartModule, TagModule, SkeletonModule],
  template: `
    <div class="bg-gray-50 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 m-0">Storage Analytics</h1>
            <p class="text-gray-600 mt-2 mb-0">Provider distribution, file type split, growth and top uploaders</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <p-button label="Dashboard" icon="pi pi-home" severity="secondary" [outlined]="true" [routerLink]="['/files']"></p-button>
            <p-button label="Files" icon="pi pi-file" severity="secondary" [outlined]="true" [routerLink]="['/files/list']"></p-button>
            <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadStats()"></p-button>
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

      <ng-container *ngIf="!loading && summary && usage">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Total Files</p>
            <p class="text-3xl font-bold text-gray-900">{{ summary.total_files }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Total Storage</p>
            <p class="text-3xl font-bold text-blue-600">{{ formatBytes(summary.total_size) }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Weekly Growth</p>
            <p class="text-3xl font-bold text-green-600">{{ usage.storage_trends.weekly_growth }}%</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Monthly Growth</p>
            <p class="text-3xl font-bold text-orange-600">{{ usage.storage_trends.monthly_growth }}%</p>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Daily Upload Count</h2>
            <p-chart type="line" [data]="dailyUploadsChart" [options]="lineChartOptions"></p-chart>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Provider Storage Split</h2>
            <p-chart type="doughnut" [data]="providerChart" [options]="doughnutChartOptions"></p-chart>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 m-0">Storage by Provider</h2>
            </div>
            <p-table [value]="providerRows" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Provider</th>
                  <th>Files</th>
                  <th>Size</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr>
                  <td><p-tag [value]="row.provider" severity="info"></p-tag></td>
                  <td>{{ row.files }}</td>
                  <td>{{ formatBytes(row.size) }}</td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 m-0">Top Uploaders</h2>
            </div>
            <p-table [value]="usage.top_uploaders" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>User</th>
                  <th>Files</th>
                  <th>Size</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row>
                <tr>
                  <td>{{ row.user }}</td>
                  <td>{{ row.files }}</td>
                  <td>{{ formatBytes(row.size) }}</td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 m-0">File Types</h2>
          </div>
          <p-table [value]="fileTypeRows" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Size</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row>
              <tr>
                <td>{{ row.type }}</td>
                <td>{{ row.count }}</td>
                <td>{{ formatBytes(row.size) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </ng-container>
    </div>
  `
})
export class FilesStatsComponent implements OnInit {
  private filesService = inject(FilesService);

  loading = false;
  summary: FilesStatsSummary | null = null;
  usage: FilesUsageStats | null = null;

  providerRows: Array<{ provider: string; files: number; size: number }> = [];
  fileTypeRows: Array<{ type: string; count: number; size: number }> = [];

  dailyUploadsChart: any;
  providerChart: any;
  lineChartOptions: any;
  doughnutChartOptions: any;

  ngOnInit(): void {
    this.initChartOptions();
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    forkJoin({
      summary: this.filesService.getStatsSummary(),
      usage: this.filesService.getStatsUsage(),
    }).subscribe({
      next: ({ summary, usage }) => {
        this.summary = summary;
        this.usage = usage;
        this.buildRows();
        this.buildCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading files stats', err);
        this.loading = false;
      }
    });
  }

  buildRows(): void {
    if (!this.summary) return;

    this.providerRows = Object.entries(this.summary.storage_by_provider || {}).map(([provider, stat]) => ({
      provider,
      files: stat.files,
      size: stat.size,
    }));

    this.fileTypeRows = Object.entries(this.summary.file_types || {}).map(([type, stat]) => ({
      type,
      count: stat.count,
      size: stat.size,
    }));
  }

  buildCharts(): void {
    if (!this.summary || !this.usage) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const uploads = this.usage.daily_uploads || [];

    this.dailyUploadsChart = {
      labels: uploads.map((item) => item.date),
      datasets: [
        {
          label: 'Uploads',
          data: uploads.map((item) => item.count),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          backgroundColor: documentStyle.getPropertyValue('--blue-200'),
          tension: 0.35,
          fill: true,
        }
      ]
    };

    this.providerChart = {
      labels: this.providerRows.map((item) => item.provider),
      datasets: [
        {
          data: this.providerRows.map((item) => item.size),
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--cyan-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--orange-500')
          ]
        }
      ]
    };
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const borderColor = documentStyle.getPropertyValue('--surface-border');

    this.lineChartOptions = {
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

    this.doughnutChartOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      }
    };
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`;
  }
}
