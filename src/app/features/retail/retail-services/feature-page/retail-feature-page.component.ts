import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

interface RetailFeatureStat {
  label: string;
  value: string;
  trend?: string;
}

interface RetailFeatureAction {
  label: string;
  icon: string;
  description: string;
}

interface RetailFeatureConfig {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  stats: RetailFeatureStat[];
  actions: RetailFeatureAction[];
  checklist: string[];
}

@Component({
  selector: 'app-retail-feature-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, ProgressBarModule],
  template: `
    <div class="feature-page">
      <div class="hero" [style.--accent]="config.accent">
        <div class="hero-left">
          <div class="icon-wrap">
            <i [class]="config.icon"></i>
          </div>
          <div>
            <h1>{{ config.title }}</h1>
            <p>{{ config.subtitle }}</p>
          </div>
        </div>
        <div class="hero-right">
          <p-tag severity="success" value="Ready"></p-tag>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat" *ngFor="let stat of config.stats">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" *ngIf="stat.trend">{{ stat.trend }}</div>
        </div>
      </div>

      <div class="content-grid">
        <p-card>
          <ng-template pTemplate="title">Quick Actions</ng-template>
          <ng-template pTemplate="subtitle">Common workflows for this module</ng-template>
          <ng-template pTemplate="content">
            <div class="action-list">
              <button pButton class="action-item" *ngFor="let action of config.actions">
                <div class="action-main">
                  <i [class]="action.icon"></i>
                  <span>{{ action.label }}</span>
                </div>
                <small>{{ action.description }}</small>
              </button>
            </div>
          </ng-template>
        </p-card>

        <p-card>
          <ng-template pTemplate="title">Readiness Checklist</ng-template>
          <ng-template pTemplate="subtitle">Suggested setup to go live</ng-template>
          <ng-template pTemplate="content">
            <div class="checklist">
              <div class="check-item" *ngFor="let item of config.checklist; let i = index">
                <i class="pi pi-check-circle"></i>
                <span>{{ item }}</span>
              </div>
            </div>
            <div class="progress-wrap">
              <div class="progress-meta">
                <span>Completion</span>
                <strong>100%</strong>
              </div>
              <p-progressBar [value]="100"></p-progressBar>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .feature-page {
      padding: 1.25rem;
      display: grid;
      gap: 1rem;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      min-height: calc(100vh - 4rem);
    }
    .hero {
      --accent: #2563eb;
      border-radius: 16px;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, #ffffff) 0%, #ffffff 65%);
      border: 1px solid color-mix(in srgb, var(--accent) 25%, #e5e7eb);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .hero-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: var(--accent);
      color: #fff;
      font-size: 1.1rem;
    }
    .hero h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #111827;
    }
    .hero p {
      margin: 0.25rem 0 0;
      color: #4b5563;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.75rem;
    }
    .stat {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 0.85rem;
    }
    .stat-label { color: #6b7280; font-size: 0.82rem; }
    .stat-value { color: #111827; font-size: 1.35rem; font-weight: 700; margin-top: 0.2rem; }
    .stat-trend { color: #059669; font-size: 0.8rem; margin-top: 0.15rem; }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .action-list { display: grid; gap: 0.65rem; }
    .action-item {
      width: 100%;
      justify-content: flex-start;
      text-align: left;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      padding: 0.7rem 0.8rem;
    }
    .action-main {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }
    .action-item small { color: #6b7280; font-size: 0.8rem; }
    .checklist { display: grid; gap: 0.55rem; margin-bottom: 0.9rem; }
    .check-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: #111827;
      font-size: 0.92rem;
    }
    .check-item i { color: #10b981; }
    .progress-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.45rem;
      color: #374151;
      font-size: 0.86rem;
    }
    @media (max-width: 900px) {
      .stats-grid, .content-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 640px) {
      .hero {
        flex-direction: column;
        align-items: flex-start;
      }
      .stats-grid, .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RetailFeaturePageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  config: RetailFeatureConfig = {
    title: 'Retail Module',
    subtitle: 'Operational dashboard and workflows',
    icon: 'pi pi-briefcase',
    accent: '#2563eb',
    stats: [
      { label: 'Total Records', value: '0' },
      { label: 'Processed Today', value: '0' },
      { label: 'Success Rate', value: '0%' },
      { label: 'Open Tasks', value: '0' }
    ],
    actions: [
      { label: 'Create', icon: 'pi pi-plus', description: 'Create a new record' },
      { label: 'Review', icon: 'pi pi-search', description: 'Review pending items' },
      { label: 'Export', icon: 'pi pi-download', description: 'Export latest data' }
    ],
    checklist: ['Configuration', 'Validation', 'Policy', 'Monitoring']
  };

  ngOnInit(): void {
    const routeConfig = this.route.snapshot.data['featureConfig'] as Partial<RetailFeatureConfig> | undefined;
    if (routeConfig) {
      this.config = {
        ...this.config,
        ...routeConfig,
        stats: routeConfig.stats || this.config.stats,
        actions: routeConfig.actions || this.config.actions,
        checklist: routeConfig.checklist || this.config.checklist
      };
    }
  }
}
