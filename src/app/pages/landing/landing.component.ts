import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { API_MODULES } from '../../features/applications/api-modules.data';
import { ApiModuleData, ModuleType } from '../../features/applications/api-module.model';

interface AppCard extends ApiModuleData {
  route: string;
  gradient: string;
  accent: string;
  tagline: string;
}

interface PlatformApp {
  name: string;
  category: string;
  route: string;
  icon: string;
  tagline: string;
  description: string;
  gradient: string;
  accent: string;
}

/** Front-end experience apps that live outside the API catalog (Data Mesh, platform tooling). */
const PLATFORM_APPS: Array<Omit<PlatformApp, 'gradient' | 'accent'> & { from: string; to: string }> = [
  {
    name: 'Data Products', category: 'Data Mesh', route: '/data-mesh/data-products', icon: 'pi pi-shopping-cart',
    tagline: 'Discover & subscribe to data products',
    description: 'Browse governed, domain-owned data products with schemas, SLAs, ownership and subscription workflows.',
    from: '#6366f1', to: '#8b5cf6',
  },
  {
    name: 'Marketplace', category: 'Data Mesh', route: '/marketplace', icon: 'pi pi-shopping-bag',
    tagline: 'Internal data & service marketplace',
    description: 'A self-serve storefront where teams publish and consume data assets, APIs and services across domains.',
    from: '#ec4899', to: '#f43f5e',
  },
  {
    name: 'Domain Catalog', category: 'Data Mesh', route: '/data-mesh/catalogs', icon: 'pi pi-sitemap',
    tagline: 'Explore data domains & ownership',
    description: 'Navigate the mesh of data domains — owners, products, contracts and the assets each domain exposes.',
    from: '#14b8a6', to: '#06b6d4',
  },
  {
    name: 'Data Catalog', category: 'Discovery', route: '/discovery/catalog', icon: 'pi pi-book',
    tagline: 'Search the enterprise data catalog',
    description: 'Full-text discovery across tables, datasets and assets with metadata, tags and lineage.',
    from: '#0ea5e9', to: '#3b82f6',
  },
  {
    name: 'Data Sources', category: 'Explore', route: '/explore', icon: 'pi pi-database',
    tagline: 'Connect databases, warehouses & more',
    description: 'Unified explorer for databases, data warehouses, pipelines, topics, ML models and containers.',
    from: '#22c55e', to: '#84cc16',
  },
  {
    name: 'Data Assets', category: 'Data Mesh', route: '/data-mesh/assets', icon: 'pi pi-box',
    tagline: 'Catalog of assets with lineage',
    description: 'Inventory of physical and logical data assets — tables, dashboards, APIs and pipelines with lineage.',
    from: '#a855f7', to: '#d946ef',
  },
  {
    name: 'Data Contracts', category: 'Data Mesh', route: '/data-mesh/contracts', icon: 'pi pi-file-check',
    tagline: 'Govern producer–consumer contracts',
    description: 'Define and enforce schema, quality and SLA contracts between data producers and consumers.',
    from: '#f59e0b', to: '#f97316',
  },
  {
    name: 'Observability', category: 'Platform', route: '/observability', icon: 'pi pi-chart-line',
    tagline: 'Metrics, alerts & audit logs',
    description: 'Monitor platform health with live metrics, alerting and a unified audit log across every module.',
    from: '#ef4444', to: '#ec4899',
  },
];

/** Presentation layer: marketing route + brand gradient + short tagline per module. */
const PRESENTATION: Record<string, { route: string; from: string; to: string; tagline: string }> = {
  authentication: { route: '/login', from: '#6366f1', to: '#3b82f6', tagline: 'Secure identity, sessions & OAuth2' },
  governance: { route: '/governance/policies', from: '#8b5cf6', to: '#7c3aed', tagline: 'Multi-tenant RBAC & data mesh' },
  retail: { route: '/retail', from: '#ec4899', to: '#f43f5e', tagline: 'Commerce, inventory & logistics' },
  hotel: { route: '/hotel', from: '#f59e0b', to: '#f97316', tagline: 'Properties, rooms & bookings' },
  blogger: { route: '/blogger', from: '#f43f5e', to: '#d946ef', tagline: 'Content & publishing workflow' },
  cmc: { route: '/cmc', from: '#06b6d4', to: '#0ea5e9', tagline: 'Omnichannel customer messaging' },
  travel: { route: '/travel', from: '#10b981', to: '#14b8a6', tagline: 'Tours, destinations & itineraries' },
  chat: { route: '/applications', from: '#0ea5e9', to: '#6366f1', tagline: 'Real-time messaging — coming soon' },
  pipeline: { route: '/applications', from: '#14b8a6', to: '#06b6d4', tagline: 'ETL orchestration & data flows' },
  model: { route: '/applications', from: '#a855f7', to: '#6366f1', tagline: 'ML model registry & monitoring' },
  uploads: { route: '/files', from: '#84cc16', to: '#22c55e', tagline: 'File storage on GCS & S3' },
  databricks: { route: '/applications', from: '#ef4444', to: '#f97316', tagline: 'Jobs, clusters & notebooks' },
  dockerhub: { route: '/applications', from: '#3b82f6', to: '#06b6d4', tagline: 'Container registry management' },
  facebook: { route: '/ad-manager', from: '#1877f2', to: '#3b82f6', tagline: 'Messenger, Graph API & OAuth' },
  google: { route: '/applications', from: '#ea4335', to: '#fbbc05', tagline: 'Drive, Sheets & OAuth2' },
};

const FALLBACK = { route: '/applications', from: '#64748b', to: '#94a3b8', tagline: 'Explore the API surface' };

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();

  readonly apps: AppCard[] = API_MODULES.map(m => {
    const p = PRESENTATION[m.key] ?? FALLBACK;
    return {
      ...m,
      route: p.route,
      gradient: `linear-gradient(135deg, ${p.from} 0%, ${p.to} 100%)`,
      accent: p.from,
      tagline: p.tagline,
    };
  });

  readonly filters: { key: 'all' | ModuleType; label: string; icon: string }[] = [
    { key: 'all', label: 'All apps', icon: 'pi pi-th-large' },
    { key: 'Platform', label: 'Platform', icon: 'pi pi-server' },
    { key: 'Domain Adapter', label: 'Domain adapters', icon: 'pi pi-box' },
  ];
  activeFilter: 'all' | ModuleType = 'all';

  readonly platformApps: PlatformApp[] = PLATFORM_APPS.map(a => ({
    name: a.name,
    category: a.category,
    route: a.route,
    icon: a.icon,
    tagline: a.tagline,
    description: a.description,
    gradient: `linear-gradient(135deg, ${a.from} 0%, ${a.to} 100%)`,
    accent: a.from,
  }));

  readonly totalApps = API_MODULES.length + PLATFORM_APPS.length;
  readonly totalEndpoints = API_MODULES.reduce((s, m) => s + m.endpoints.length, 0);
  readonly totalFeatures = API_MODULES.reduce((s, m) => s + m.features.length, 0);
  readonly platformCount = API_MODULES.filter(m => m.type === 'Platform').length;

  /** Icons floating in the hero background. */
  readonly orbitIcons = this.apps.slice(0, 12).map(a => ({ icon: a.icon, accent: a.accent }));

  get visibleApps(): AppCard[] {
    return this.activeFilter === 'all'
      ? this.apps
      : this.apps.filter(a => a.type === this.activeFilter);
  }

  setFilter(key: 'all' | ModuleType): void {
    this.activeFilter = key;
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'stable': return 'Stable';
      case 'minimal': return 'Preview';
      case 'planned': return 'Planned';
      default: return status;
    }
  }

  trackByKey = (_: number, a: AppCard) => a.key;

  private observer?: IntersectionObserver;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    this.host.nativeElement
      .querySelectorAll('[data-reveal]')
      .forEach(el => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
