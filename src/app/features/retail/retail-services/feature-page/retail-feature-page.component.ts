import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
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

interface RetailFeatureHighlight {
  label: string;
  value: string;
}

interface RetailFeatureSection {
  title: string;
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
  highlights?: RetailFeatureHighlight[];
  sections?: RetailFeatureSection[];
  readinessScore?: number;
}

interface FeatureWorkspaceSection {
  key: 'overview' | 'modules' | 'readiness';
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-retail-feature-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, ProgressBarModule],
  template: `
    <div class="feature-page-shell" [style.--accent]="config.accent" [class.feature-page-embedded]="embedded">
      <section class="feature-hero">
        <div class="feature-hero-main">
          <div class="feature-hero-copy">
            <div class="feature-hero-badge leafy-badge">
              <i [class]="config.icon"></i>
            </div>
            <div>
              <p class="feature-eyebrow">Retail product workspace</p>
              <h1 class="feature-title">{{ config.title }}</h1>
              <p class="feature-subtitle">{{ config.subtitle }}</p>
            </div>
          </div>

          <div class="hero-intro-grid">
            <article class="hero-intro-card">
              <span class="hero-intro-label">Designed for</span>
              <strong>Fresh food retailers in Vietnam</strong>
              <p>Daily stock, demand, and fulfillment kept in one operational system.</p>
            </article>
            <article class="hero-intro-card">
              <span class="hero-intro-label">Main outcome</span>
              <strong>Less spoilage, better availability</strong>
              <p>Use better signals before replenishment and delivery decisions are made.</p>
            </article>
          </div>
        </div>

        <div class="feature-hero-aside">
          <div class="feature-hero-visual" *ngIf="isFreshRetail">
            <div class="hero-visual-panel hero-visual-market">
              <div class="visual-kicker">
                <i class="pi pi-shopping-basket"></i>
                <span>Fresh goods flow</span>
              </div>
              <div class="visual-orbs">
                <span class="orb orb-lg"></span>
                <span class="orb orb-md"></span>
                <span class="orb orb-sm"></span>
              </div>
              <div class="visual-metric-row">
                <div class="visual-metric-card">
                  <i class="pi pi-box"></i>
                  <div>
                    <strong>Inventory</strong>
                    <span>Real-time stock</span>
                  </div>
                </div>
                <div class="visual-metric-card">
                  <i class="pi pi-chart-line"></i>
                  <div>
                    <strong>Forecast</strong>
                    <span>Demand signals</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="hero-visual-stack">
              <div class="hero-mini-card">
                <i class="pi pi-comments"></i>
                <span>Omni-channel demand</span>
              </div>
              <div class="hero-mini-card">
                <i class="pi pi-send"></i>
                <span>Auto planning routes</span>
              </div>
              <div class="hero-mini-card">
                <i class="pi pi-shield"></i>
                <span>Tenant isolation</span>
              </div>
            </div>
          </div>

          <div class="feature-hero-actions">
            <p-tag severity="success" value="Product Ready"></p-tag>
            <button pButton type="button" class="p-button-sm p-button-outlined" (click)="switchSection('modules')">
              View Modules
            </button>
          </div>
        </div>
      </section>

      <section class="feature-summary-grid">
        <article class="summary-card" *ngFor="let stat of config.stats">
          <div>
            <p class="summary-label">{{ stat.label }}</p>
            <h3 class="summary-value">{{ stat.value }}</h3>
            <p class="summary-caption" *ngIf="stat.trend">{{ stat.trend }}</p>
          </div>
        </article>
      </section>

      <section class="feature-panel">
        <div class="feature-panel-header">
          <div>
            <p class="panel-eyebrow">Product module</p>
            <h2 class="panel-title">{{ activeSectionMeta.label }}</h2>
            <p class="panel-subtitle">{{ activeSectionMeta.description }}</p>
          </div>
          <div class="panel-chip">
            <i [class]="activeSectionMeta.icon"></i>
            <span>{{ config.title }}</span>
          </div>
        </div>

        <nav class="feature-tabs">
          <button
            *ngFor="let section of workspaceSections"
            type="button"
            class="feature-tab"
            [class.active]="activeSection === section.key"
            (click)="switchSection(section.key)">
            <i [class]="section.icon"></i>
            <span>{{ section.label }}</span>
          </button>
        </nav>

        <div class="feature-panel-content">
          <ng-container *ngIf="activeSection === 'overview'">
            <div class="feature-overview-layout">
              <div class="feature-overview-main">
                <article class="flat-card narrative-card">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-shop"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Product Overview</h3>
                      <p class="card-subtitle">Positioning for daily fresh retail operations</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <p class="narrative-text">{{ config.subtitle }}</p>
                    <div class="highlight-grid" *ngIf="config.highlights?.length">
                      <div class="highlight-item" *ngFor="let highlight of config.highlights">
                        <i class="pi pi-leaf highlight-icon"></i>
                        <span class="highlight-label">{{ highlight.label }}</span>
                        <strong class="highlight-value">{{ highlight.value }}</strong>
                      </div>
                    </div>
                  </div>
                </article>

                <article class="flat-card visual-story-card" *ngIf="isFreshRetail">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-images"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Fresh Retail Story</h3>
                      <p class="card-subtitle">A greener visual explanation of the product value chain</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="story-visual-grid">
                      <div class="story-image story-image-field">
                        <div class="story-image-overlay">
                          <i class="pi pi-sun"></i>
                          <span>Seasonality and weather shape demand every day.</span>
                        </div>
                      </div>
                      <div class="story-image story-image-ops">
                        <div class="story-image-overlay">
                          <i class="pi pi-warehouse"></i>
                          <span>Warehouses, inventory, and vehicles stay connected in one platform.</span>
                        </div>
                      </div>
                      <div class="story-chip-row">
                        <span class="story-chip"><i class="pi pi-apple"></i> Daily fresh assortment</span>
                        <span class="story-chip"><i class="pi pi-bolt"></i> Faster replenishment</span>
                        <span class="story-chip"><i class="pi pi-map-marker"></i> Local delivery readiness</span>
                      </div>
                    </div>
                  </div>
                </article>

                <article class="flat-card" *ngIf="config.sections?.length">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-th-large"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Capability Stack</h3>
                      <p class="card-subtitle">How the product is organized end to end</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="section-list feature-sections-compact">
                      <div class="section-item" *ngFor="let section of config.sections">
                        <div class="section-item-header">
                          <h4>{{ section.title }}</h4>
                        </div>
                        <p>{{ section.description }}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <aside class="feature-overview-side">
                <article class="flat-card">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-sparkles"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Core Outcomes</h3>
                      <p class="card-subtitle">What this product is designed to improve</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="pill-list pill-list-single">
                      <span class="feature-pill" *ngFor="let item of config.checklist">{{ item }}</span>
                    </div>
                  </div>
                </article>

                <article class="flat-card feature-side-note">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-compass"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Platform Direction</h3>
                      <p class="card-subtitle">How this product should feel in operation</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <p class="narrative-text">
                      Keep inventory, demand, and fulfillment in one operational surface for fresh goods.
                    </p>
                  </div>
                </article>
              </aside>
            </div>
          </ng-container>

          <ng-container *ngIf="activeSection === 'modules'">
            <div class="module-grid">
              <article class="module-card" *ngFor="let action of config.actions">
                <div class="card-header">
                  <div class="module-icon">
                    <i [class]="action.icon"></i>
                  </div>
                  <div class="module-copy">
                    <h3>{{ action.label }}</h3>
                    <p>{{ action.description }}</p>
                  </div>
                </div>
                <div class="card-body">
                  <button pButton type="button" class="p-button-sm p-button-text">
                    Open
                  </button>
                </div>
              </article>
            </div>
          </ng-container>

          <ng-container *ngIf="activeSection === 'readiness'">
            <div class="feature-readiness-layout">
              <article class="flat-card">
                <div class="card-header">
                  <div class="card-icon">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <div class="card-title-group">
                    <h3 class="card-title">Readiness Checklist</h3>
                    <p class="card-subtitle">Suggested setup before scaling operations</p>
                  </div>
                </div>
                <div class="card-body">
                  <div class="checklist">
                    <div class="check-item" *ngFor="let item of config.checklist">
                      <i class="pi pi-check-circle"></i>
                      <span>{{ item }}</span>
                    </div>
                  </div>
                </div>
              </article>

              <div class="readiness-side">
                <article class="flat-card">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-chart-bar"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Go-live Progress</h3>
                      <p class="card-subtitle">Current setup completeness across product areas</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="progress-wrap">
                      <div class="progress-meta">
                        <span>Completion</span>
                        <strong>{{ readinessScore }}%</strong>
                      </div>
                      <p-progressBar [value]="readinessScore"></p-progressBar>
                    </div>
                  </div>
                </article>

                <article class="flat-card readiness-highlight">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-leaf"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Operational Focus</h3>
                      <p class="card-subtitle">The product should stay practical, not decorative</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <p class="narrative-text">
                      Prioritize daily retail decisions: what to stock, what to replenish, what to deliver, and where demand is moving next.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </ng-container>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .feature-page-shell {
      padding: 1.5rem;
      display: grid;
      gap: 1.25rem;
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 12%, #ffffff) 0%, transparent 28%),
        linear-gradient(180deg, #f6fbf7 0%, #eef7f1 100%);
      min-height: calc(100vh - 4rem);
    }
    .feature-page-embedded {
      padding: 0;
      min-height: auto;
      background: transparent;
    }
    .feature-hero {
      --accent: #2563eb;
      border-radius: 28px;
      padding: 1.6rem;
      background:
        radial-gradient(circle at top left, rgba(187, 247, 208, 0.88) 0%, rgba(187, 247, 208, 0) 28%),
        linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, #ffffff) 0%, #ffffff 68%);
      border: 1px solid color-mix(in srgb, var(--accent) 25%, #e5e7eb);
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      gap: 1.5rem;
      box-shadow: 0 20px 48px rgba(21, 128, 61, 0.08);
    }
    .feature-hero-main {
      flex: 1 1 50%;
      display: grid;
      gap: 1.1rem;
    }
    .feature-hero-copy {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .feature-hero-badge {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      display: grid;
      place-items: center;
      background: var(--accent);
      color: #fff;
      font-size: 1.35rem;
    }
    .leafy-badge {
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24), 0 16px 28px rgba(21, 128, 61, 0.24);
      background: linear-gradient(135deg, #15803d 0%, #22c55e 100%);
    }
    .feature-eyebrow {
      margin: 0 0 0.3rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.72rem;
      color: color-mix(in srgb, var(--accent) 68%, #1f2937);
      font-weight: 700;
    }
    .feature-title {
      margin: 0;
      font-size: 1.8rem;
      color: #111827;
    }
    .feature-subtitle {
      margin: 0.4rem 0 0;
      color: #4b5563;
      max-width: 42rem;
      line-height: 1.7;
    }
    .hero-intro-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.9rem;
    }
    .hero-intro-card {
      padding: 1rem 1.05rem;
      border-radius: 18px;
      border: 1px solid rgba(34, 197, 94, 0.14);
      background: rgba(255, 255, 255, 0.82);
      display: grid;
      gap: 0.3rem;
    }
    .hero-intro-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #15803d;
      font-weight: 700;
    }
    .hero-intro-card strong {
      color: #14532d;
      font-size: 0.96rem;
    }
    .hero-intro-card p {
      margin: 0;
      color: #64748b;
      line-height: 1.55;
      font-size: 0.88rem;
    }
    .feature-hero-aside {
      width: min(40rem, 48%);
      display: grid;
      gap: 0.9rem;
    }
    .feature-hero-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: flex-end;
    }
    .feature-hero-visual {
      display: flex;
      align-items: stretch;
      gap: 0.9rem;
      min-width: 0;
    }
    .hero-visual-panel,
    .hero-mini-card {
      border: 1px solid rgba(21, 128, 61, 0.12);
      background: rgba(255, 255, 255, 0.74);
      box-shadow: 0 16px 34px rgba(21, 128, 61, 0.08);
      backdrop-filter: blur(10px);
    }
    .hero-visual-market {
      flex: 1;
      border-radius: 22px;
      padding: 1rem;
      position: relative;
      overflow: hidden;
      min-height: 12rem;
    }
    .visual-kicker {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.7rem;
      border-radius: 999px;
      background: rgba(240, 253, 244, 0.92);
      color: #166534;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .visual-orbs {
      position: absolute;
      inset: auto -0.75rem -0.75rem auto;
      width: 11rem;
      height: 11rem;
    }
    .orb {
      position: absolute;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(34, 197, 94, 0.45));
      filter: blur(0.2px);
    }
    .orb-lg {
      width: 7.5rem;
      height: 7.5rem;
      right: 0;
      bottom: 0;
    }
    .orb-md {
      width: 4.5rem;
      height: 4.5rem;
      right: 5.2rem;
      bottom: 4.5rem;
    }
    .orb-sm {
      width: 2.4rem;
      height: 2.4rem;
      right: 2.8rem;
      bottom: 7.8rem;
    }
    .visual-metric-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      margin-top: 2.25rem;
      position: relative;
      z-index: 1;
    }
    .visual-metric-card {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 0.8rem;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid rgba(34, 197, 94, 0.12);
    }
    .visual-metric-card i {
      width: 2rem;
      height: 2rem;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: rgba(220, 252, 231, 0.95);
      color: #15803d;
    }
    .visual-metric-card strong,
    .hero-mini-card span {
      display: block;
      color: #14532d;
      font-size: 0.88rem;
      font-weight: 700;
    }
    .visual-metric-card span {
      display: block;
      color: #4b5563;
      font-size: 0.75rem;
      margin-top: 0.15rem;
    }
    .hero-visual-stack {
      display: grid;
      gap: 0.7rem;
      width: 11rem;
    }
    .hero-mini-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.8rem 0.9rem;
      border-radius: 18px;
    }
    .hero-mini-card i {
      color: #16a34a;
      font-size: 1rem;
    }
    .feature-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.9rem;
    }
    .summary-card {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 253, 244, 0.94) 100%);
      border: 1px solid rgba(34, 197, 94, 0.14);
      border-radius: 20px;
      padding: 1.1rem 1.15rem;
      box-shadow: 0 10px 30px rgba(21, 128, 61, 0.08);
    }
    .summary-label { color: #64748b; font-size: 0.82rem; margin: 0; }
    .summary-value { color: #0f172a; font-size: 1.45rem; font-weight: 700; margin: 0.3rem 0 0; }
    .summary-caption { color: #15803d; font-size: 0.82rem; margin: 0.2rem 0 0; }
    .feature-panel,
    .flat-card,
    .module-card {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%);
      border: 1px solid rgba(34, 197, 94, 0.12);
      border-radius: 20px;
      box-shadow: 0 16px 36px rgba(21, 128, 61, 0.07);
    }
    .panel-eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
    }
    .panel-title {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }
    .feature-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
      padding: 0.35rem;
      border-radius: 18px;
      background: #f7fbf8;
      border: 1px solid rgba(34, 197, 94, 0.12);
    }
    .feature-tab {
      border: 1px solid transparent;
      background: transparent;
      color: #475569;
      border-radius: 14px;
      padding: 0.8rem 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      cursor: pointer;
      font-weight: 600;
      transition: 0.2s ease;
    }
    .feature-tab.active {
      background: #ffffff;
      color: #166534;
      border-color: rgba(34, 197, 94, 0.18);
      box-shadow: 0 10px 24px rgba(21, 128, 61, 0.08);
    }
    .card-icon,
    .card-icon,
    .module-icon,
    .feature-sidebar-note-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 14px;
      display: grid;
      place-items: center;
      background: color-mix(in srgb, var(--accent) 12%, #f8fafc);
      color: color-mix(in srgb, var(--accent) 70%, #0f172a);
      flex: 0 0 auto;
    }
    .panel-subtitle,
    .card-subtitle,
    .feature-sidebar-note-text,
    .narrative-text,
    .module-copy p,
    .section-item p {
      margin: 0;
      color: #64748b;
      line-height: 1.6;
    }
    .feature-panel {
      padding: 1.4rem;
    }
    .feature-panel-header,
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .panel-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      border-radius: 999px;
      padding: 0.55rem 0.8rem;
      background: #f8fafc;
      color: #334155;
      font-size: 0.86rem;
      font-weight: 600;
      border: 1px solid #e2e8f0;
    }
    .feature-panel-content {
      display: grid;
      gap: 1.1rem;
      margin-top: 1.2rem;
    }
    .feature-overview-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.85fr);
      gap: 1rem;
      align-items: start;
    }
    .feature-overview-main,
    .feature-overview-side,
    .readiness-side {
      display: grid;
      gap: 1rem;
    }
    .feature-readiness-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.85fr);
      gap: 1rem;
    }
    .flat-card {
      padding: 1.2rem;
    }
    .card-title-group {
      display: grid;
      gap: 0.2rem;
      flex: 1;
    }
    .card-title {
      margin: 0;
      color: #0f172a;
      font-size: 1.05rem;
    }
    .card-body {
      margin-top: 1rem;
    }
    .highlight-grid,
    .section-list,
    .module-grid,
    .pill-list,
    .checklist {
      display: grid;
      gap: 0.75rem;
    }
    .highlight-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-top: 1rem;
    }
    .highlight-item,
    .section-item {
      border-radius: 16px;
      border: 1px solid rgba(34, 197, 94, 0.14);
      background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%);
      padding: 0.9rem 1rem;
      position: relative;
    }
    .highlight-icon {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      color: #22c55e;
    }
    .highlight-label {
      display: block;
      color: #64748b;
      font-size: 0.78rem;
      margin-bottom: 0.25rem;
    }
    .highlight-value {
      color: #0f172a;
      font-size: 0.95rem;
    }
    .pill-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .pill-list-single {
      grid-template-columns: 1fr;
    }
    .feature-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.7rem 0.85rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 11%, #ffffff);
      color: #0f172a;
      border: 1px solid color-mix(in srgb, var(--accent) 18%, #bbf7d0);
      font-size: 0.88rem;
      font-weight: 600;
    }
    .visual-story-card {
      overflow: hidden;
    }
    .story-visual-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 0.9rem;
    }
    .story-image {
      min-height: 13rem;
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      background-size: cover;
      background-position: center;
      border: 1px solid rgba(34, 197, 94, 0.14);
    }
    .story-image-field {
      background:
        linear-gradient(160deg, rgba(22, 163, 74, 0.18), rgba(21, 128, 61, 0.62)),
        radial-gradient(circle at 25% 25%, rgba(253, 224, 71, 0.8), rgba(253, 224, 71, 0) 24%),
        linear-gradient(180deg, #bbf7d0 0%, #86efac 36%, #4ade80 72%, #166534 100%);
    }
    .story-image-ops {
      background:
        linear-gradient(160deg, rgba(20, 83, 45, 0.18), rgba(22, 101, 52, 0.74)),
        radial-gradient(circle at 70% 28%, rgba(110, 231, 183, 0.9), rgba(110, 231, 183, 0) 20%),
        linear-gradient(160deg, #dcfce7 0%, #86efac 46%, #16a34a 100%);
    }
    .story-image-overlay {
      position: absolute;
      inset: auto 0 0 0;
      padding: 1rem;
      background: linear-gradient(180deg, rgba(20, 83, 45, 0) 0%, rgba(20, 83, 45, 0.82) 100%);
      color: #f0fdf4;
      display: grid;
      gap: 0.4rem;
    }
    .story-image-overlay i {
      font-size: 1.1rem;
    }
    .story-chip-row {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .story-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.65rem 0.85rem;
      border-radius: 999px;
      background: rgba(240, 253, 244, 0.96);
      border: 1px solid rgba(34, 197, 94, 0.16);
      color: #166534;
      font-weight: 600;
    }
    .section-item-header h4,
    .module-copy h3 {
      margin: 0;
      color: #0f172a;
    }
    .module-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .module-card {
      padding: 1.1rem;
      display: grid;
      gap: 0.9rem;
      align-content: start;
    }
    .module-copy {
      display: grid;
      gap: 0.3rem;
    }
    .feature-sections-compact {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .feature-side-note {
      background:
        radial-gradient(circle at top right, rgba(187, 247, 208, 0.45) 0%, rgba(187, 247, 208, 0) 30%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 253, 244, 0.92) 100%);
    }
    .readiness-highlight {
      background:
        linear-gradient(145deg, rgba(240, 253, 244, 0.98) 0%, rgba(220, 252, 231, 0.96) 100%);
    }
    .checklist {
      margin-bottom: 0;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      color: #0f172a;
      font-size: 0.92rem;
      padding: 0.8rem 0.9rem;
      border-radius: 14px;
      background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%);
      border: 1px solid rgba(34, 197, 94, 0.14);
    }
    .check-item i { color: #10b981; }
    .progress-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.7rem;
      color: #374151;
      font-size: 0.86rem;
    }
    @media (max-width: 1100px) {
      .feature-hero {
        flex-direction: column;
      }
      .feature-hero-aside,
      .feature-hero-visual {
        width: 100%;
      }
      .feature-overview-layout,
      .feature-readiness-layout,
      .module-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 900px) {
      .hero-intro-grid,
      .feature-summary-grid,
      .feature-sections-compact,
      .pill-list,
      .highlight-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 640px) {
      .feature-hero,
      .feature-hero-visual,
      .feature-panel-header,
      .card-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .feature-hero-actions,
      .feature-tabs {
        width: 100%;
      }
      .feature-summary-grid,
      .hero-intro-grid,
      .feature-sections-compact,
      .pill-list,
      .highlight-grid,
      .story-visual-grid,
      .visual-metric-row {
        grid-template-columns: 1fr;
      }
      .hero-visual-stack {
        width: 100%;
      }
      .feature-page-shell,
      .feature-panel,
      .flat-card,
      .module-card {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class RetailFeaturePageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  @Input() configInput?: Partial<RetailFeatureConfig> | null;
  @Input() embedded = false;

  workspaceSections: FeatureWorkspaceSection[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'pi pi-home',
      description: 'Product positioning and business outcomes'
    },
    {
      key: 'modules',
      label: 'Modules',
      icon: 'pi pi-th-large',
      description: 'Core workflows available in the platform'
    },
    {
      key: 'readiness',
      label: 'Readiness',
      icon: 'pi pi-check-square',
      description: 'Setup checklist before scaling operations'
    }
  ];
  activeSection: FeatureWorkspaceSection['key'] = 'overview';

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
    checklist: ['Configuration', 'Validation', 'Policy', 'Monitoring'],
    highlights: [
      { label: 'Deployment model', value: 'Shared platform, isolated tenants' },
      { label: 'Primary use case', value: 'Operational control and planning' }
    ],
    sections: [
      { title: 'Data foundation', description: 'Collect and normalize the operational data needed to run the module.' },
      { title: 'Execution surface', description: 'Give users one governed place to review, act, and monitor change.' }
    ],
    readinessScore: 100
  };

  get activeSectionMeta(): FeatureWorkspaceSection {
    return this.workspaceSections.find(section => section.key === this.activeSection) || this.workspaceSections[0];
  }

  get readinessScore(): number {
    return this.config.readinessScore ?? 100;
  }

  get isFreshRetail(): boolean {
    return this.config.title.toLowerCase().includes('fresh retail');
  }

  switchSection(sectionKey: FeatureWorkspaceSection['key']): void {
    this.activeSection = sectionKey;
  }

  ngOnInit(): void {
    const routeConfig = this.route.snapshot.data['featureConfig'] as Partial<RetailFeatureConfig> | undefined;
    const sourceConfig = this.configInput || routeConfig;
    if (sourceConfig) {
      this.config = {
        ...this.config,
        ...sourceConfig,
        stats: sourceConfig.stats || this.config.stats,
        actions: sourceConfig.actions || this.config.actions,
        checklist: sourceConfig.checklist || this.config.checklist,
        highlights: sourceConfig.highlights || this.config.highlights,
        sections: sourceConfig.sections || this.config.sections
      };
    }
  }
}
