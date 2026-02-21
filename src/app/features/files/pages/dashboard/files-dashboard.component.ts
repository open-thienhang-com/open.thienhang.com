import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { FilesService } from '../../services/files.service';
import {
  FilesVersion,
  FilesOverview,
  FilesQuality,
  FilesCost,
  FilesFeatures,
  FilesSummary,
} from '../../models/files.model';

@Component({
  selector: 'app-files-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, SkeletonModule],
  template: `
    <div class="bg-gray-50 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-folder text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">File Management</h1>
              <p class="text-gray-600 m-0">Storage overview, quality, cost and platform capabilities</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadDashboard()"></p-button>
            <p-button label="Files" icon="pi pi-file" severity="secondary" [outlined]="true" [routerLink]="['/files/list']"></p-button>
            <p-button label="Stats" icon="pi pi-chart-bar" severity="secondary" [outlined]="true" [routerLink]="['/files/stats']"></p-button>
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

      <ng-container *ngIf="!loading && summary && overview && quality && cost && features && version">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Total Files</p>
            <p class="text-3xl font-bold text-gray-900">{{ summary.total_files }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Total Size</p>
            <p class="text-3xl font-bold text-blue-600">{{ summary.total_size_gb | number:'1.2-2' }} GB</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Quality Score</p>
            <p class="text-3xl font-bold text-green-600">{{ summary.quality_score }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm font-medium text-gray-600">Monthly Cost</p>
            <p class="text-3xl font-bold text-orange-600">{{ summary.monthly_cost | currency: cost.currency }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6 xl:col-span-2">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Domain Overview</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-500">Domain:</span> <span class="font-medium text-gray-900">{{ overview.domain }}</span></div>
              <div><span class="text-gray-500">Status:</span> <p-tag [value]="summary.status" [severity]="summary.status === 'Active' ? 'success' : 'warn'"></p-tag></div>
              <div><span class="text-gray-500">Health:</span> <span class="font-medium text-gray-900">{{ summary.health }}</span></div>
              <div><span class="text-gray-500">Uptime:</span> <span class="font-medium text-gray-900">{{ summary.uptime }}</span></div>
              <div><span class="text-gray-500">Providers:</span> <span class="font-medium text-gray-900">{{ overview.providers.join(', ') }}</span></div>
              <div><span class="text-gray-500">Adapter:</span> <span class="font-medium text-gray-900">{{ version.adapter }} v{{ version.version }}</span></div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Quality Metrics</h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span>Availability</span><span class="font-medium">{{ quality.metrics.availability }}%</span></div>
              <div class="flex justify-between"><span>Reliability</span><span class="font-medium">{{ quality.metrics.reliability }}%</span></div>
              <div class="flex justify-between"><span>Performance</span><span class="font-medium">{{ quality.metrics.performance }}%</span></div>
              <div class="flex justify-between"><span>Security</span><span class="font-medium">{{ quality.metrics.security }}%</span></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Capabilities</h2>
            <div class="flex flex-wrap gap-2 mb-4">
              <p-tag *ngFor="let feature of features.core_features" [value]="feature" severity="info"></p-tag>
            </div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Security</h3>
            <div class="flex flex-wrap gap-2">
              <p-tag *ngFor="let item of features.security" [value]="item" severity="success"></p-tag>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Cost Breakdown</h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span>Storage</span><span>{{ cost.breakdown.storage | currency: cost.currency }}</span></div>
              <div class="flex justify-between"><span>Bandwidth</span><span>{{ cost.breakdown.bandwidth | currency: cost.currency }}</span></div>
              <div class="flex justify-between"><span>Compute</span><span>{{ cost.breakdown.compute | currency: cost.currency }}</span></div>
              <div class="flex justify-between"><span>Backup</span><span>{{ cost.breakdown.backup | currency: cost.currency }}</span></div>
              <div class="flex justify-between border-t border-gray-200 pt-3 font-semibold"><span>Total</span><span>{{ cost.monthly_cost | currency: cost.currency }}</span></div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class FilesDashboardComponent implements OnInit {
  private filesService = inject(FilesService);

  loading = false;
  version: FilesVersion | null = null;
  overview: FilesOverview | null = null;
  quality: FilesQuality | null = null;
  cost: FilesCost | null = null;
  features: FilesFeatures | null = null;
  summary: FilesSummary | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    forkJoin({
      version: this.filesService.getVersion(),
      overview: this.filesService.getOverview(),
      quality: this.filesService.getQuality(),
      cost: this.filesService.getCost(),
      features: this.filesService.getFeatures(),
      summary: this.filesService.getSummary(),
    }).subscribe({
      next: ({ version, overview, quality, cost, features, summary }) => {
        this.version = version;
        this.overview = overview;
        this.quality = quality;
        this.cost = cost;
        this.features = features;
        this.summary = summary;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading files dashboard', err);
        this.loading = false;
      }
    });
  }
}
