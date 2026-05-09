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
      
      <!-- Background Ambient Glows -->
      <div class="ambient-glows">
        <div class="glow-orb orb-green"></div>
        <div class="glow-orb orb-indigo"></div>
        <div class="glow-dots"></div>
      </div>

      <!-- Hero Header Section -->
      <section class="feature-hero">
        <div class="hero-main-content">
          <div class="hero-header-copy">
            <div class="hero-badge-container">
              <div class="hero-badge leafy-badge">
                <i [class]="config.icon"></i>
              </div>
              <span class="badge-tag">Operational Workspace</span>
            </div>
            
            <p class="feature-eyebrow">Enterprise Supply Chain Platform</p>
            <h1 class="feature-title">{{ config.title }}</h1>
            <p class="feature-subtitle">{{ config.subtitle }}</p>
          </div>

          <!-- Quick Fact Cards -->
          <div class="hero-intro-grid">
            <article class="hero-intro-card">
              <div class="intro-card-icon"><i class="pi pi-map-marker"></i></div>
              <div class="intro-card-text">
                <span class="hero-intro-label">Vietnam Target Market</span>
                <strong>Fresh food households & local chains</strong>
                <p>Tailored specifically for the dynamic logistics and retail landscape of Vietnam.</p>
              </div>
            </article>
            <article class="hero-intro-card">
              <div class="intro-card-icon"><i class="pi pi-bolt"></i></div>
              <div class="intro-card-text">
                <span class="hero-intro-label">Primary Outcome</span>
                <strong>Waste reduction & high availability</strong>
                <p>Keep shelves optimized daily with smart replenishment and predictive logistics.</p>
              </div>
            </article>
          </div>
        </div>

        <!-- Right Visual Operations Console -->
        <div class="feature-hero-aside">
          <div class="live-console-card">
            <div class="console-header">
              <div class="console-status">
                <span class="status-pulse-dot"></span>
                <span>OPERATIONAL CONSOLE</span>
              </div>
              <p-tag severity="success" value="Ready"></p-tag>
            </div>
            
            <div class="console-visual-display" *ngIf="isFreshRetail">
              <div class="display-main-metric">
                <span class="metric-desc">Fulfillment Accuracy</span>
                <span class="metric-num">98.4<span class="metric-unit">%</span></span>
                <span class="metric-change"><i class="pi pi-arrow-up-right"></i> +2.1% this week</span>
              </div>

              <!-- Animated Wave/Graph Line -->
              <div class="display-graph">
                <div class="graph-bar" style="height: 40%"></div>
                <div class="graph-bar" style="height: 55%"></div>
                <div class="graph-bar" style="height: 45%"></div>
                <div class="graph-bar" style="height: 70%"></div>
                <div class="graph-bar animated-bar" style="height: 85%"></div>
                <div class="graph-bar" style="height: 65%"></div>
                <div class="graph-bar" style="height: 75%"></div>
                <div class="graph-bar animated-bar" style="height: 90%"></div>
              </div>
            </div>

            <!-- Operational Signals Info -->
            <div class="console-rows">
              <div class="console-row">
                <span class="row-label"><i class="pi pi-shield"></i> Isolation Level</span>
                <span class="row-value badge-glass">Strict Tenant Isolation</span>
              </div>
              <div class="console-row">
                <span class="row-label"><i class="pi pi-chart-bar"></i> Forecast Signal</span>
                <span class="row-value badge-glass">Sales + Customer Chat</span>
              </div>
              <div class="console-row">
                <span class="row-label"><i class="pi pi-send"></i> Replenishment</span>
                <span class="row-value badge-glass">Auto Route Planning</span>
              </div>
            </div>

            <div class="console-actions">
              <button pButton type="button" class="p-button-sm btn-premium-gradient" (click)="switchSection('modules')">
                <i class="pi pi-th-large"></i> Explore Modules
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Performance Indicators Row -->
      <section class="feature-summary-grid">
        <article class="summary-card" *ngFor="let stat of config.stats; let i = index">
          <div class="summary-card-inner">
            <div class="summary-icon-wrap" [style.--glow-color]="config.accent">
              <i [class]="i === 0 ? 'pi pi-users' : i === 1 ? 'pi pi-star' : i === 2 ? 'pi pi-chart-line' : 'pi pi-shield'"></i>
            </div>
            <div class="summary-content">
              <p class="summary-label">{{ stat.label }}</p>
              <h3 class="summary-value">{{ stat.value }}</h3>
              <p class="summary-caption" *ngIf="stat.trend">
                <span class="trend-bullet"></span> {{ stat.trend }}
              </p>
            </div>
          </div>
        </article>
      </section>

      <!-- Content Workspace Tabs and Panel -->
      <section class="feature-panel">
        <div class="feature-panel-header">
          <div class="panel-header-text">
            <p class="panel-eyebrow">Interactive Control Surface</p>
            <h2 class="panel-title">{{ activeSectionMeta.label }}</h2>
            <p class="panel-subtitle">{{ activeSectionMeta.description }}</p>
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
        </div>

        <div class="feature-panel-content">
          <!-- SECTION 1: OVERVIEW -->
          <ng-container *ngIf="activeSection === 'overview'">
            <div class="feature-overview-layout">
              <div class="feature-overview-main">
                
                <!-- Main Narrative Card -->
                <article class="flat-card narrative-card">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-shop"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">System Overview & Value Chain</h3>
                      <p class="card-subtitle">Strategic positioning for local fresh produce operations</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <p class="narrative-text">{{ config.subtitle }}</p>
                    
                    <div class="highlight-grid" *ngIf="config.highlights?.length">
                      <div class="highlight-item" *ngFor="let highlight of config.highlights">
                        <i class="pi pi-check highlight-icon"></i>
                        <span class="highlight-label">{{ highlight.label }}</span>
                        <strong class="highlight-value">{{ highlight.value }}</strong>
                      </div>
                    </div>
                  </div>
                </article>

                <!-- Vietnam Fresh Retail Story / Visual Loop -->
                <article class="flat-card visual-story-card" *ngIf="isFreshRetail">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-globe"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Supply Chain Integration Flow</h3>
                      <p class="card-subtitle">A digital pipeline connecting operations from fields to storefronts</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="story-visual-grid">
                      <div class="story-image story-image-field">
                        <div class="story-image-overlay">
                          <i class="pi pi-sun"></i>
                          <span>Seasonal and weather changes shift market demand hourly.</span>
                        </div>
                      </div>
                      <div class="story-image story-image-ops">
                        <div class="story-image-overlay">
                          <i class="pi pi-truck"></i>
                          <span>Warehouses, delivery points, and trucks stay connected.</span>
                        </div>
                      </div>
                      <div class="story-chip-row">
                        <span class="story-chip"><i class="pi pi-apple"></i> Perishable Assortment</span>
                        <span class="story-chip"><i class="pi pi-bolt"></i> Real-time Sync</span>
                        <span class="story-chip"><i class="pi pi-map-marker"></i> Local Delivery Flow</span>
                      </div>
                    </div>
                  </div>
                </article>

                <!-- Core Capability List -->
                <article class="flat-card" *ngIf="config.sections?.length">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-th-large"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Platform Capability Stack</h3>
                      <p class="card-subtitle">Key architectural layers powering the platform</p>
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

              <!-- Sidebar Sidebar Checklist / Outcomes -->
              <aside class="feature-overview-side">
                <article class="flat-card side-outcome-card">
                  <div class="card-header">
                    <div class="card-icon accent-icon">
                      <i class="pi pi-star"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Expected Outcomes</h3>
                      <p class="card-subtitle">Key improvements after integration</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="pill-list-single">
                      <span class="feature-pill" *ngFor="let item of config.checklist">
                        <i class="pi pi-check-circle pill-icon"></i>
                        <span>{{ item }}</span>
                      </span>
                    </div>
                  </div>
                </article>

                <article class="flat-card feature-side-note">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-compass"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Technical Mandate</h3>
                      <p class="card-subtitle">Operational guidelines</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <p class="narrative-text">
                      Maintain unified control over inventory, replenishment signals, and dispatch routes in a single, high-performance operational dashboard.
                    </p>
                  </div>
                </article>
              </aside>
            </div>
          </ng-container>

          <!-- SECTION 2: MODULES WORKSPACE -->
          <ng-container *ngIf="activeSection === 'modules'">
            <div class="module-grid">
              <article class="module-card" *ngFor="let action of config.actions">
                <div class="module-card-header">
                  <div class="module-icon">
                    <i [class]="action.icon"></i>
                  </div>
                  <div class="module-copy">
                    <h3>{{ action.label }}</h3>
                    <p>{{ action.description }}</p>
                  </div>
                </div>
                <div class="module-card-footer">
                  <button pButton type="button" class="p-button-sm btn-card-action">
                    Open Workspace <i class="pi pi-arrow-right"></i>
                  </button>
                </div>
              </article>
            </div>
          </ng-container>

          <!-- SECTION 3: READINESS AND GO-LIVE -->
          <ng-container *ngIf="activeSection === 'readiness'">
            <div class="feature-readiness-layout">
              <article class="flat-card">
                <div class="card-header">
                  <div class="card-icon">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <div class="card-title-group">
                    <h3 class="card-title">Deployment Readiness</h3>
                    <p class="card-subtitle">Operational checklist before live commercial launch</p>
                  </div>
                </div>
                <div class="card-body">
                  <div class="checklist">
                    <div class="check-item" *ngFor="let item of config.checklist">
                      <div class="check-item-icon-wrap">
                        <i class="pi pi-check"></i>
                      </div>
                      <div class="check-item-content">
                        <strong>{{ item }}</strong>
                        <span>Validated and active on primary tenant.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <div class="readiness-side">
                <article class="flat-card progress-glow-card">
                  <div class="card-header">
                    <div class="card-icon bg-success-glow">
                      <i class="pi pi-chart-bar"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Go-Live Progress</h3>
                      <p class="card-subtitle">Cumulative score across setup items</p>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="progress-wrap">
                      <div class="progress-meta">
                        <span>COMPLETENESS RATE</span>
                        <strong>{{ readinessScore }}%</strong>
                      </div>
                      <div class="custom-progress-bar">
                        <div class="progress-fill" [style.width.%]="readinessScore"></div>
                      </div>
                    </div>
                  </div>
                </article>

                <article class="flat-card readiness-highlight">
                  <div class="card-header">
                    <div class="card-icon">
                      <i class="pi pi-shield"></i>
                    </div>
                    <div class="card-title-group">
                      <h3 class="card-title">Production Stability</h3>
                    </div>
                  </div>
                  <div class="card-body">
                    <p class="narrative-text">
                      Ensuring total security isolation and reliable high-performance metrics under high concurrent transaction volume in Vietnam stores.
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
    :host { display: block; background: #fafbfe; }
    
    /* Ambient Glow Styles */
    .feature-page-shell {
      position: relative;
      padding: 2.2rem;
      display: grid;
      gap: 1.8rem;
      min-height: calc(100vh - 4rem);
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .ambient-glows {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.45;
    }

    .orb-green {
      top: -10%;
      right: -5%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #34d399 0%, rgba(16, 185, 129, 0) 70%);
    }

    .orb-indigo {
      bottom: 10%;
      left: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, #6366f1 0%, rgba(99, 102, 241, 0) 70%);
    }

    .glow-dots {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(16, 185, 129, 0.08) 1.2px, transparent 1.2px);
      background-size: 28px 28px;
    }

    /* Embedded Mode Override */
    .feature-page-embedded {
      padding: 0;
      min-height: auto;
      background: transparent;
    }

    /* ─── Hero Header ─── */
    .feature-hero {
      position: relative;
      z-index: 1;
      border-radius: 24px;
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      align-items: center;
      gap: 3rem;
      box-shadow: 
        0 4px 30px rgba(0, 0, 0, 0.03),
        inset 0 1px 1px rgba(255, 255, 255, 0.6);
    }

    .hero-main-content {
      display: grid;
      gap: 2rem;
    }

    .hero-badge-container {
      display: inline-flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 0.4rem;
    }

    .hero-badge {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      color: #fff;
      font-size: 1.2rem;
    }

    .leafy-badge {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.25);
    }

    .badge-tag {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #059669;
      background: rgba(16, 185, 129, 0.08);
      padding: 6px 14px;
      border-radius: 100px;
      border: 1px solid rgba(16, 185, 129, 0.15);
    }

    .feature-eyebrow {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #64748b;
    }

    .feature-title {
      margin: 0.4rem 0 0.6rem;
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .feature-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.65;
      max-width: 38rem;
    }

    /* Fact cards in hero */
    .hero-intro-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
    }

    .hero-intro-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.2rem;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(226, 232, 240, 0.8);
      backdrop-filter: blur(10px);
      transition: all 0.25s ease;
    }

    .hero-intro-card:hover {
      transform: translateY(-2px);
      border-color: rgba(16, 185, 129, 0.3);
      background: rgba(255, 255, 255, 0.8);
    }

    .intro-card-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.08);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .intro-card-text {
      display: grid;
      gap: 0.2rem;
    }

    .hero-intro-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      font-weight: 700;
    }

    .hero-intro-card strong {
      font-size: 0.88rem;
      color: #1e293b;
      font-weight: 700;
    }

    .hero-intro-card p {
      margin: 0;
      font-size: 0.78rem;
      color: #64748b;
      line-height: 1.5;
    }

    /* Operational Console on Right Side */
    .live-console-card {
      background: linear-gradient(135deg, #022c22 0%, #064e3b 100%);
      border-radius: 20px;
      padding: 1.8rem;
      color: #f0fdf4;
      display: grid;
      gap: 1.5rem;
      box-shadow: 
        0 20px 40px rgba(2, 44, 34, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .console-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #34d399;
    }

    .status-pulse-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: statusPulse 2s infinite;
    }

    @keyframes statusPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }

    .console-visual-display {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 14px;
      padding: 1.2rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .display-main-metric {
      display: grid;
      gap: 0.1rem;
    }

    .metric-desc {
      font-size: 0.72rem;
      color: #a7f3d0;
      text-transform: uppercase;
      font-weight: 600;
    }

    .metric-num {
      font-size: 2.2rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
    }

    .metric-unit {
      font-size: 1.1rem;
      color: #34d399;
      font-weight: 700;
    }

    .metric-change {
      font-size: 0.75rem;
      color: #34d399;
      margin-top: 0.3rem;
      font-weight: 600;
    }

    .display-graph {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 60px;
    }

    .graph-bar {
      width: 6px;
      background: rgba(52, 211, 153, 0.3);
      border-radius: 2px;
      transition: height 0.3s ease;
    }

    .animated-bar {
      background: #34d399;
      animation: graphFloat 2.5s infinite ease-in-out alternate;
    }

    @keyframes graphFloat {
      0% { transform: scaleY(0.9); }
      100% { transform: scaleY(1.1); }
    }

    .console-rows {
      display: grid;
      gap: 0.8rem;
    }

    .console-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .console-row:last-child {
      border: none;
      padding: 0;
    }

    .row-label {
      font-size: 0.8rem;
      color: #a7f3d0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .row-label i {
      color: #34d399;
    }

    .row-value {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge-glass {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 4px 10px;
      border-radius: 6px;
    }

    .console-actions {
      display: grid;
    }

    .btn-premium-gradient {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white !important;
      border: none !important;
      font-weight: 700 !important;
      padding: 10px 18px !important;
      border-radius: 12px !important;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
      transition: all 0.25s ease !important;
    }

    .btn-premium-gradient:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4) !important;
    }

    /* ─── Metric Cards ─── */
    .feature-summary-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .summary-card {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 20px;
      padding: 1.3rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .summary-card:hover {
      transform: translateY(-3px);
      border-color: rgba(16, 185, 129, 0.25);
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.08);
    }

    .summary-card-inner {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .summary-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(16, 185, 129, 0.08);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
      position: relative;
    }

    .summary-icon-wrap::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 14px;
      border: 1px solid rgba(16, 185, 129, 0.15);
      opacity: 0.5;
    }

    .summary-content {
      display: grid;
      gap: 0.15rem;
    }

    .summary-label {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    .summary-value {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 800;
      color: #0f172a;
    }

    .summary-caption {
      margin: 0;
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .trend-bullet {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #10b981;
    }

    /* ─── Tabs Panel and Control Surface ─── */
    .feature-panel {
      position: relative;
      z-index: 1;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
    }

    .feature-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      border-bottom: 1px solid rgba(226, 232, 240, 0.6);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .panel-header-text {
      display: grid;
      gap: 0.2rem;
    }

    .panel-eyebrow {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }

    .panel-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
    }

    .panel-subtitle {
      margin: 0;
      font-size: 0.82rem;
      color: #64748b;
    }

    /* Modern Tabs Switcher */
    .feature-tabs {
      display: flex;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    .feature-tab {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .feature-tab:hover {
      color: #1e293b;
    }

    .feature-tab.active {
      background: #ffffff;
      color: #059669;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    /* Generic Flat Card Design */
    .flat-card {
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-radius: 20px;
      padding: 1.5rem;
      transition: all 0.25s ease;
    }

    .flat-card:hover {
      border-color: rgba(16, 185, 129, 0.2);
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.02);
    }

    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.08);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .card-icon.accent-icon {
      background: rgba(99, 102, 241, 0.08);
      color: #4f46e5;
    }

    .card-title-group {
      display: grid;
      gap: 0.15rem;
    }

    .card-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
    }

    .card-subtitle {
      margin: 0;
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .card-body {
      margin-top: 1.2rem;
    }

    .narrative-text {
      margin: 0;
      font-size: 0.88rem;
      color: #475569;
      line-height: 1.6;
    }

    /* Content Layout Grids */
    .feature-overview-layout {
      display: grid;
      grid-template-columns: 1.4fr 0.8fr;
      gap: 1.5rem;
    }

    .feature-overview-main,
    .feature-overview-side,
    .readiness-side {
      display: grid;
      gap: 1.5rem;
    }

    /* Checklist / Highlighting */
    .highlight-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1.2rem;
    }

    .highlight-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem 1.2rem;
      border-radius: 14px;
      background: rgba(248, 250, 252, 0.6);
      border: 1px solid #f1f5f9;
    }

    .highlight-icon {
      font-size: 0.8rem;
      color: #10b981;
      margin-bottom: 0.2rem;
    }

    .highlight-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      font-weight: 700;
    }

    .highlight-value {
      font-size: 0.88rem;
      color: #1e293b;
      font-weight: 700;
    }

    /* Premium Pill Outcomes list */
    .pill-list-single {
      display: grid;
      gap: 0.8rem;
    }

    .feature-pill {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      padding: 1rem;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid #f1f5f9;
      transition: all 0.2s ease;
    }

    .feature-pill:hover {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(99, 102, 241, 0.2);
    }

    .pill-icon {
      color: #4f46e5;
      font-size: 1rem;
      margin-top: 2px;
    }

    .feature-pill span {
      font-size: 0.85rem;
      color: #334155;
      font-weight: 600;
      line-height: 1.4;
    }

    /* Vietnam Story Grid style */
    .visual-story-card {
      overflow: hidden;
    }

    .story-visual-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1rem;
    }

    .story-image {
      min-height: 13rem;
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    .story-image-field {
      background:
        linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(4, 120, 87, 0.65)),
        radial-gradient(circle at 20% 20%, rgba(252, 211, 77, 0.6) 0%, transparent 40%),
        linear-gradient(180deg, #a7f3d0 0%, #34d399 50%, #047857 100%);
    }

    .story-image-ops {
      background:
        linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(67, 56, 202, 0.65)),
        radial-gradient(circle at 80% 20%, rgba(167, 243, 208, 0.6) 0%, transparent 40%),
        linear-gradient(180deg, #c7d2fe 0%, #818cf8 50%, #4338ca 100%);
    }

    .story-image-overlay {
      position: absolute;
      inset: auto 0 0 0;
      padding: 1.2rem;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.75) 100%);
      color: #ffffff;
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.8rem;
      line-height: 1.4;
      font-weight: 500;
    }

    .story-image-overlay i {
      font-size: 1rem;
      color: #34d399;
      margin-top: 1px;
    }

    .story-chip-row {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 0.4rem;
    }

    .story-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 6px 14px;
      border-radius: 100px;
      background: #f1f5f9;
      border: 1px solid rgba(226, 232, 240, 0.8);
      color: #475569;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .story-chip i {
      color: #059669;
    }

    /* Capability Stack grid */
    .feature-sections-compact {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .section-item {
      padding: 1.2rem;
      border-radius: 16px;
      background: rgba(248, 250, 252, 0.6);
      border: 1px solid #f1f5f9;
      display: grid;
      gap: 0.4rem;
    }

    .section-item h4 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
    }

    .section-item p {
      margin: 0;
      font-size: 0.78rem;
      color: #64748b;
      line-height: 1.5;
    }

    /* Support Side Note style */
    .feature-side-note {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%);
      border: 1px solid rgba(16, 185, 129, 0.1);
    }

    /* ─── SECTION 2: MODULES ─── */
    .module-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .module-card {
      background: rgba(255, 255, 255, 0.65);
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .module-card:hover {
      transform: translateY(-4px);
      border-color: rgba(16, 185, 129, 0.3);
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.08);
      background: rgba(255, 255, 255, 0.9);
    }

    .module-card-header {
      display: flex;
      align-items: flex-start;
      gap: 1.1rem;
    }

    .module-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(16, 185, 129, 0.08);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .module-copy {
      display: grid;
      gap: 0.3rem;
    }

    .module-copy h3 {
      margin: 0;
      font-size: 0.96rem;
      font-weight: 700;
      color: #0f172a;
    }

    .module-copy p {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
      line-height: 1.5;
    }

    .module-card-footer {
      margin-top: 1.5rem;
      display: grid;
    }

    .btn-card-action {
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid #e2e8f0 !important;
      font-weight: 600 !important;
      padding: 8px 14px !important;
      border-radius: 10px !important;
      transition: all 0.2s ease !important;
    }

    .module-card:hover .btn-card-action {
      border-color: rgba(16, 185, 129, 0.3) !important;
      background: rgba(16, 185, 129, 0.04) !important;
      color: #059669 !important;
    }

    /* ─── SECTION 3: READINESS ─── */
    .feature-readiness-layout {
      display: grid;
      grid-template-columns: 1.3fr 0.8fr;
      gap: 1.5rem;
    }

    .checklist {
      display: grid;
      gap: 1rem;
    }

    .check-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.2rem;
      border-radius: 16px;
      background: rgba(248, 250, 252, 0.6);
      border: 1px solid #f1f5f9;
      transition: all 0.25s ease;
    }

    .check-item:hover {
      background: #ffffff;
      border-color: rgba(16, 185, 129, 0.25);
    }

    .check-item-icon-wrap {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .check-item-content {
      display: grid;
      gap: 0.15rem;
    }

    .check-item-content strong {
      font-size: 0.88rem;
      color: #1e293b;
      font-weight: 700;
    }

    .check-item-content span {
      font-size: 0.78rem;
      color: #64748b;
    }

    /* Custom progress bar styles */
    .progress-glow-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.8) 100%);
    }

    .progress-wrap {
      display: grid;
      gap: 0.6rem;
    }

    .custom-progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 100px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 100px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .bg-success-glow {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }

    .readiness-highlight {
      background: rgba(248, 250, 252, 0.65);
    }

    /* ─── Responsive Adjustments ─── */
    @media (max-width: 1200px) {
      .feature-hero {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .feature-hero-aside {
        max-width: 500px;
        margin: 0 auto;
        width: 100%;
      }
      .feature-overview-layout,
      .feature-readiness-layout {
        grid-template-columns: 1fr;
      }
      .feature-summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .module-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .feature-panel-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.2rem;
      }
      .feature-tabs {
        width: 100%;
        overflow-x: auto;
      }
      .feature-tab {
        flex: 1;
        justify-content: center;
      }
    }

    @media (max-width: 640px) {
      .feature-page-shell {
        padding: 1rem;
        gap: 1rem;
      }
      .feature-hero {
        padding: 1.5rem;
      }
      .hero-intro-grid {
        grid-template-columns: 1fr;
      }
      .feature-summary-grid {
        grid-template-columns: 1fr;
      }
      .module-grid {
        grid-template-columns: 1fr;
      }
      .feature-sections-compact {
        grid-template-columns: 1fr;
      }
      .story-visual-grid {
        grid-template-columns: 1fr;
      }
      .feature-panel {
        padding: 1.2rem;
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
