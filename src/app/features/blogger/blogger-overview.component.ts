import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';

import {
  BloggerService,
  BloggerOverview,
  BloggerVersion,
  BloggerQuality,
  BloggerCost,
  BloggerFeaturesResponse
} from './services/blogger.service';

@Component({
  selector: 'app-blogger-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TabViewModule,
    TagModule,
    ProgressBarModule,
    ChartModule,
    TableModule,
    ToastModule,
    SkeletonModule
  ],
  providers: [MessageService],
  template: `
    <div class="blogger-overview-container p-4 md:p-6">
      <p-toast position="top-right"></p-toast>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-color">Blogger Domain Overview</h1>
        <p class="text-color-secondary">A comprehensive look at the Blogger domain</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="stat-card">
            <p class="text-sm text-color-secondary">Total Authors</p>
            <p class="text-3xl font-bold text-primary-500 mt-2">
                <ng-container *ngIf="!loadingOverview; else skeletonText">{{ overview?.total_authors ?? '--' }}</ng-container>
            </p>
        </p-card>
        <p-card styleClass="stat-card">
            <p class="text-sm text-color-secondary">Total Posts</p>
            <p class="text-3xl font-bold text-primary-500 mt-2">
                <ng-container *ngIf="!loadingQuality; else skeletonText">{{ quality?.metrics.total_posts ?? '--' }}</ng-container>
            </p>
        </p-card>
        <p-card styleClass="stat-card">
            <p class="text-sm text-color-secondary">Quality Score</p>
            <p class="text-3xl font-bold text-primary-500 mt-2">
                <ng-container *ngIf="!loadingQuality; else skeletonText">{{ quality?.overall_score ?? '--' }}%</ng-container>
            </p>
        </p-card>
        <p-card styleClass="stat-card">
            <p class="text-sm text-color-secondary">Monthly Cost</p>
            <p class="text-3xl font-bold text-primary-500 mt-2">
                <ng-container *ngIf="!loadingCost; else skeletonText">{{ cost?.total_monthly_cost | currency:cost?.currency:'symbol':'1.0-0' ?? '--' }}</ng-container>
            </p>
        </p-card>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
            <p-card styleClass="ui-card">
                <ng-template pTemplate="title">Domain Overview</ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loadingOverview" class="p-4"><p-skeleton width="100%" height="100px"></p-skeleton></div>
                    <div *ngIf="overviewError" class="error-box">{{ overviewError }}</div>
                    <div *ngIf="overview && !loadingOverview" class="space-y-4">
                        <p class="text-color-secondary">{{ overview.description }}</p>
                        <div>
                            <h4 class="font-semibold mb-2">Capabilities</h4>
                            <div class="flex flex-wrap gap-2">
                                <p-tag *ngFor="let cap of overview.capabilities" [value]="cap" severity="info"></p-tag>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <p-card styleClass="ui-card">
                <ng-template pTemplate="title">Domain Features</ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loadingFeatures" class="p-4"><p-skeleton width="100%" height="150px"></p-skeleton></div>
                    <div *ngIf="featuresError" class="error-box">{{ featuresError }}</div>
                    <div *ngIf="features && !loadingFeatures">
                        <p-table [value]="features.features" responsiveLayout="scroll" styleClass="p-datatable-sm">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Feature</th>
                                    <th>Description</th>
                                    <th class="text-center">Status</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-feature>
                                <tr>
                                    <td class="font-semibold">{{ feature.name }}</td>
                                    <td>{{ feature.description }}</td>
                                    <td class="text-center">
                                        <p-tag [value]="feature.status" [severity]="feature.status === 'active' ? 'success' : 'warning'"></p-tag>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </ng-template>
            </p-card>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
            <p-card styleClass="ui-card">
                <ng-template pTemplate="title">Quality Metrics</ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loadingQuality" class="p-4"><p-skeleton width="100%" height="120px"></p-skeleton></div>
                    <div *ngIf="qualityError" class="error-box">{{ qualityError }}</div>
                    <div *ngIf="quality && !loadingQuality" class="space-y-3">
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Overall Score</span>
                                <span class="text-sm font-bold">{{ quality.overall_score }}%</span>
                            </div>
                            <p-progressBar [value]="quality.overall_score" [showValue]="false"></p-progressBar>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Freshness</span>
                                <span class="text-sm font-bold">{{ quality.data_freshness }}%</span>
                            </div>
                            <p-progressBar [value]="quality.data_freshness" [showValue]="false"></p-progressBar>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">Completeness</span>
                                <span class="text-sm font-bold">{{ quality.data_completeness }}%</span>
                            </div>
                            <p-progressBar [value]="quality.data_completeness" [showValue]="false"></p-progressBar>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <p-card styleClass="ui-card">
                <ng-template pTemplate="title">Cost Breakdown</ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loadingCost" class="p-4"><p-skeleton width="100%" height="180px"></p-skeleton></div>
                    <div *ngIf="costError" class="error-box">{{ costError }}</div>
                    <div *ngIf="cost && !loadingCost">
                        <p-chart type="doughnut" [data]="costChartData" [options]="costChartOptions"></p-chart>
                    </div>
                </ng-template>
            </p-card>

            <p-card styleClass="ui-card">
                <ng-template pTemplate="title">Version Info</ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loadingVersion" class="p-4"><p-skeleton width="100%" height="80px"></p-skeleton></div>
                    <div *ngIf="versionError" class="error-box">{{ versionError }}</div>
                    <div *ngIf="version && !loadingVersion" class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="font-semibold">Version:</span>
                            <span>{{ version.version }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold">API Version:</span>
                            <span>{{ version.api_version }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold">Status:</span>
                            <p-tag [value]="version.status" [severity]="version.status === 'stable' ? 'success' : 'info'"></p-tag>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-semibold">Build Date:</span>
                            <span>{{ version.build_date | date:'short' }}</span>
                        </div>
                    </div>
                </ng-template>
            </p-card>
        </div>
      </div>
    </div>
    <ng-template #skeletonText><p-skeleton width="4rem" height="1.5rem"></p-skeleton></ng-template>
  `,
  styles: [`
    :host {
        display: block;
        background-color: var(--surface-ground);
        min-height: 100%;
    }
    .blogger-overview-container {
        max-width: 1600px;
        margin: 0 auto;
    }
    .stat-card {
        border: 1px solid var(--surface-border);
        box-shadow: none;
    }
    .stat-card:hover {
        border-color: var(--primary-color);
        box-shadow: var(--card-shadow);
    }
    .ui-card {
        border: 1px solid var(--surface-border);
        box-shadow: var(--card-shadow);
        border-radius: var(--border-radius);
    }
    .error-box {
        text-align: center;
        padding: 1rem;
        background-color: var(--red-50);
        color: var(--red-700);
        border: 1px solid var(--red-200);
        border-radius: var(--border-radius);
    }
    :host ::ng-deep {
        .p-card-title {
            font-size: 1.125rem;
            font-weight: 600;
        }
        .p-card-content {
            padding-top: 0;
        }
        .p-progressbar {
            height: 0.5rem;
        }
    }
  `]
})
export class BloggerOverviewComponent implements OnInit {
  private bloggerService = inject(BloggerService);
  private messageService = inject(MessageService);

  overview: BloggerOverview | null = null;
  loadingOverview = false;
  overviewError: string | null = null;

  version: BloggerVersion | null = null;
  loadingVersion = false;
  versionError: string | null = null;

  quality: BloggerQuality | null = null;
  loadingQuality = false;
  qualityError: string | null = null;

  cost: BloggerCost | null = null;
  loadingCost = false;
  costError: string | null = null;

  features: BloggerFeaturesResponse['data'] | null = null;
  loadingFeatures = false;
  featuresError: string | null = null;

  costChartData: any;
  costChartOptions: any;

  ngOnInit() {
    this.loadAllData();
    this.initChartOptions();
  }

  loadAllData() {
    this.loadOverview();
    this.loadVersion();
    this.loadQuality();
    this.loadCost();
    this.loadFeatures();
  }

  loadOverview() {
    this.loadingOverview = true;
    this.overviewError = null;
    this.bloggerService.getBloggerOverview().subscribe({
      next: (res) => { this.overview = res.data; this.loadingOverview = false; },
      error: (err) => { this.overviewError = 'Failed to load overview data.'; this.loadingOverview = false; }
    });
  }

  loadVersion() {
    this.loadingVersion = true;
    this.versionError = null;
    this.bloggerService.getBloggerVersion().subscribe({
      next: (res) => { this.version = res.data; this.loadingVersion = false; },
      error: (err) => { this.versionError = 'Failed to load version data.'; this.loadingVersion = false; }
    });
  }

  loadQuality() {
    this.loadingQuality = true;
    this.qualityError = null;
    this.bloggerService.getBloggerQuality().subscribe({
      next: (res) => { this.quality = res.data; this.loadingQuality = false; },
      error: (err) => { this.qualityError = 'Failed to load quality data.'; this.loadingQuality = false; }
    });
  }

  loadCost() {
    this.loadingCost = true;
    this.costError = null;
    this.bloggerService.getBloggerCost().subscribe({
      next: (res) => {
        this.cost = res.data;
        this.setupCostChart(res.data);
        this.loadingCost = false;
      },
      error: (err) => { this.costError = 'Failed to load cost data.'; this.loadingCost = false; }
    });
  }

  loadFeatures() {
    this.loadingFeatures = true;
    this.featuresError = null;
    this.bloggerService.getBloggerFeatures().subscribe({
      next: (res) => { this.features = res.data; this.loadingFeatures = false; },
      error: (err) => { this.featuresError = 'Failed to load features data.'; this.loadingFeatures = false; }
    });
  }

  setupCostChart(costData: BloggerCost) {
    const documentStyle = getComputedStyle(document.documentElement);
    const labels = Object.keys(costData.cost_breakdown);
    const data = Object.values(costData.cost_breakdown);

    this.costChartData = {
        labels: labels.map(l => l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
        datasets: [{
            data: data,
            backgroundColor: [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--cyan-500'),
                documentStyle.getPropertyValue('--pink-500'),
                documentStyle.getPropertyValue('--indigo-500'),
            ],
            hoverBackgroundColor: [
                documentStyle.getPropertyValue('--blue-400'),
                documentStyle.getPropertyValue('--green-400'),
                documentStyle.getPropertyValue('--yellow-400'),
                documentStyle.getPropertyValue('--cyan-400'),
                documentStyle.getPropertyValue('--pink-400'),
                documentStyle.getPropertyValue('--indigo-400'),
            ]
        }]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    this.costChartOptions = {
        plugins: {
            legend: {
                labels: { color: textColor },
                position: 'bottom'
            }
        }
    };
  }
}
