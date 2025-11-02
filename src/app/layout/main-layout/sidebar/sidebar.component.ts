import { Component, EventEmitter, Input, Output, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AppSwitcherService, AppKey } from '../../../core/services/app-switcher.service';
import { AuthServices } from '../../../core/services/auth.services';

// PrimeNG imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    DialogModule,
    ButtonModule,
    DividerModule,
    TooltipModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [],

})
export class SidebarComponent implements OnInit, OnChanges {
  menu: MenuItem[];
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();
  appKey: AppKey = 'all';

  visibleGroups: any[] = [];

  // Info dialog properties
  infoDialogVisible = false;
  selectedInfo: MenuInfo | null = null;

  // App matrix dialog
  showAppMatrix = false;
  apps: { key: AppKey; label: string; icon: string }[] = [
    { key: 'all', label: 'All Apps', icon: 'pi pi-th-large' },
    { key: 'retail', label: 'Retail Service', icon: 'pi pi-shopping-bag' },
    { key: 'catalog', label: 'Data Catalog', icon: 'pi pi-search' },
    { key: 'governance', label: 'Governance', icon: 'pi pi-shield' },
    { key: 'marketplace', label: 'Marketplace', icon: 'pi pi-shopping-cart' },
    { key: 'blogger', label: 'Blogger', icon: 'pi pi-pencil' },
    { key: 'hotel', label: 'Hotel', icon: 'pi pi-building' },
    { key: 'admanager', label: 'Ad Manager', icon: 'pi pi-bullhorn' },
    { key: 'settings', label: 'Settings', icon: 'pi pi-cog' }
  ];

  selectedApp: AppKey = 'all';
  private _workspaceHighlight = false;

  // marketplaceExpanded removed — Marketplace is now a standalone app with its own overview page

  sidebarGroups = [
    // Overview group removed per request (Dashboard & Search moved/removed)
    {
      label: 'Data Exploration',
      icon: 'pi pi-compass',
      expanded: false,
      items: [
        { label: 'Database Explorer', url: '/explore/database', icon: 'pi pi-database' },
        { label: 'Pipelines', url: '/explore/pipelines', icon: 'pi pi-sliders-h' },
        { label: 'Topics & Events', url: '/explore/topics', icon: 'pi pi-tags' },
        { label: 'ML Models', url: '/explore/ml-models', icon: 'pi pi-brain' },
        { label: 'Containers', url: '/explore/container', icon: 'pi pi-box' },
        { label: 'Advanced Search', url: '/explore/search', icon: 'pi pi-search' },
        { label: 'Asset Details', url: '/explore/asset-detail', icon: 'pi pi-info-circle' }
      ]
    },
    {
      label: 'Explore',
      icon: 'pi pi-compass',
      expanded: false,
      items: [
        {
          label: 'Data Mesh',
          icon: 'pi pi-sitemap',
          children: [
            { label: 'Data Products', url: '/data-mesh/data-products', icon: 'pi pi-shopping-cart' },
            { label: 'Domains', url: '/data-mesh/domains', icon: 'pi pi-book' },
            { label: 'API Explorer', url: '/data-mesh/api-explorer', icon: 'pi pi-code' },
            { label: 'Lineage', url: '/data-mesh/lineage', icon: 'pi pi-share-alt' },
            { label: 'Quality Metrics', url: '/data-mesh/quality', icon: 'pi pi-chart-bar' }
          ]
        },
        {
          label: 'Observability',
          icon: 'pi pi-eye',
          children: [
            { label: 'Monitoring', url: '/observability/monitoring', icon: 'pi pi-chart-line' },
            { label: 'Alerts', url: '/observability/alert', icon: 'pi pi-bell' },
            { label: 'Metrics', url: '/observability/metrics', icon: 'pi pi-chart-bar' },
            { label: 'Audit Log', url: '/observability/audit-log', icon: 'pi pi-file' }
          ]
        }
      ]
    },
    {
      label: 'Data Catalog',
      icon: 'pi pi-database',
      expanded: false,
      items: [
        {
          label: 'Overview',
          icon: 'pi pi-home',
          url: '/discovery/data-catalog'
        },
        {
          label: 'Browse Assets',
          icon: 'pi pi-list',
          children: [
            { label: 'All Assets', url: '/discovery/data-catalog?view=all', icon: 'pi pi-th-large' },
            { label: 'Tables & Views', url: '/discovery/data-catalog?type=table', icon: 'pi pi-table' },
            { label: 'APIs', url: '/discovery/data-catalog?type=api', icon: 'pi pi-code' },
            { label: 'Files', url: '/discovery/data-catalog?type=file', icon: 'pi pi-file' },
            { label: 'Streams', url: '/discovery/data-catalog?type=stream', icon: 'pi pi-cloud' }
          ]
        },
        {
          label: 'By Domain',
          icon: 'pi pi-sitemap',
          children: [
            { label: 'Customer', url: '/discovery/data-catalog?domain=customer', icon: 'pi pi-users' },
            { label: 'Product', url: '/discovery/data-catalog?domain=product', icon: 'pi pi-shopping-cart' },
            { label: 'Order', url: '/discovery/data-catalog?domain=order', icon: 'pi pi-shopping-bag' },
            { label: 'Analytics', url: '/discovery/data-catalog?domain=analytics', icon: 'pi pi-chart-bar' }
          ]
        },
        {
          label: 'Data Quality',
          icon: 'pi pi-shield',
          children: [
            { label: 'Quality Score', url: '/discovery/quality/score', icon: 'pi pi-star' },
            { label: 'Data Profiling', url: '/discovery/quality/profiling', icon: 'pi pi-chart-line' },
            { label: 'Validation Rules', url: '/discovery/quality/rules', icon: 'pi pi-check-square' },
            { label: 'Issues & Alerts', url: '/discovery/quality/issues', icon: 'pi pi-exclamation-triangle' }
          ]
        },
        {
          label: 'Data Lineage',
          icon: 'pi pi-share-alt',
          children: [
            { label: 'Lineage Graph', url: '/discovery/lineage/graph', icon: 'pi pi-sitemap' },
            { label: 'Impact Analysis', url: '/discovery/lineage/impact', icon: 'pi pi-bolt' },
            { label: 'Dependency Map', url: '/discovery/lineage/dependencies', icon: 'pi pi-link' }
          ]
        },
        {
          label: 'Metadata',
          icon: 'pi pi-info-circle',
          children: [
            { label: 'Business Glossary', url: '/discovery/metadata/glossary', icon: 'pi pi-book' },
            { label: 'Tags & Labels', url: '/discovery/metadata/tags', icon: 'pi pi-tag' },
            { label: 'Classifications', url: '/discovery/metadata/classifications', icon: 'pi pi-lock' },
            { label: 'Owners & Stewards', url: '/discovery/metadata/owners', icon: 'pi pi-user' }
          ]
        },
        {
          label: 'Search & Discovery',
          icon: 'pi pi-search',
          children: [
            { label: 'Advanced Search', url: '/discovery/search/advanced', icon: 'pi pi-filter' },
            { label: 'Recently Accessed', url: '/discovery/search/recent', icon: 'pi pi-clock' },
            { label: 'Popular Assets', url: '/discovery/search/popular', icon: 'pi pi-star-fill' },
            { label: 'Recommendations', url: '/discovery/search/recommendations', icon: 'pi pi-thumbs-up' }
          ]
        }
      ]
    },
    {
      label: 'Governance',
      icon: 'pi pi-shield',
      expanded: false,
      items: [
        { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
        { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
        { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' },
        { label: 'Roles', url: '/governance/roles', icon: 'pi pi-id-card' },
        { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
        { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
        { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' }
      ]
    },
    {
      label: 'Retail Services',
      icon: 'pi pi-shopping-bag',
      expanded: false,
      items: [
        {
          label: 'Inventory Management',
          icon: 'pi pi-box',
          children: [
            { label: 'Overview', url: '/retail/inventory/overview', icon: 'pi pi-chart-bar' },
            { label: 'Product Catalog', url: '/retail/inventory/product-catalog', icon: 'pi pi-list' },
            { label: 'Products', url: '/retail/inventory/products', icon: 'pi pi-shopping-cart' },
            { label: 'Movements', url: '/retail/inventory/movements', icon: 'pi pi-exchange' },
            { label: 'Locations', url: '/retail/inventory/locations', icon: 'pi pi-map-marker' },
            { label: 'Reports', url: '/retail/inventory/reports', icon: 'pi pi-chart-line' }
          ]
        },
        {
          label: 'Point of Sale',
          icon: 'pi pi-credit-card',
          children: [
            { label: 'POS Terminal', url: '/retail/pos', icon: 'pi pi-desktop' },
            { label: 'Transactions', url: '/retail/transactions', icon: 'pi pi-receipt' },
            { label: 'Cash Management', url: '/retail/cash', icon: 'pi pi-money-bill' }
          ]
        },
        {
          label: 'E-commerce',
          icon: 'pi pi-globe',
          children: [
            { label: 'Online Store', url: '/retail/ecommerce', icon: 'pi pi-shopping-bag' },
            { label: 'Orders', url: '/retail/orders', icon: 'pi pi-shopping-cart' },
            { label: 'Customers', url: '/retail/customers', icon: 'pi pi-users' }
          ]
        },
        {
          label: 'Analytics',
          icon: 'pi pi-chart-bar',
          children: [
            { label: 'Sales Analytics', url: '/retail/analytics', icon: 'pi pi-chart-line' },
            { label: 'Customer Insights', url: '/retail/insights', icon: 'pi pi-users' },
            { label: 'Performance', url: '/retail/performance', icon: 'pi pi-trophy' }
          ]
        },
        {
          label: 'Loyalty Program',
          icon: 'pi pi-star',
          children: [
            { label: 'Members', url: '/retail/loyalty', icon: 'pi pi-users' },
            { label: 'Rewards', url: '/retail/rewards', icon: 'pi pi-gift' },
            { label: 'Campaigns', url: '/retail/campaigns', icon: 'pi pi-megaphone' }
          ]
        }
      ]
    }
  ];

  constructor(private router: Router, private appSwitcher: AppSwitcherService, private authServices: AuthServices) { }

  get workspaceLabel(): string {
    const app = this.apps.find(a => a.key === this.selectedApp);
    return app ? app.label : 'All Apps';
  }

  get workspaceHighlight(): boolean {
    return this._workspaceHighlight;
  }

  private playWorkspaceHighlight() {
    this._workspaceHighlight = true;
    setTimeout(() => (this._workspaceHighlight = false), 600);
  }

  ngOnInit() {
    // Initialize primary menu structure
    this.menu = [
      {
        label: 'Data Mesh Management',
        icon: 'pi pi-sitemap',
        type: 'item',
        expanded: true,
        children: [
          {
            label: 'Data Products',
            icon: 'pi pi-shopping-cart',
            expanded: false,
            children: [
              { label: 'Catalog', url: '/data-mesh/data-products/catalog', icon: 'pi pi-list' },
              { label: 'Discovery', url: '/data-mesh/data-products/discovery', icon: 'pi pi-search' },
              { label: 'Assets', url: '/data-mesh/data-products/assets', icon: 'pi pi-database' },
              { label: 'Lineage', url: '/data-mesh/data-products/lineage', icon: 'pi pi-share-alt' },
              { label: 'Policies', url: '/data-mesh/data-products/policies', icon: 'pi pi-lock' },
              { label: 'Monitoring', url: '/data-mesh/data-products/monitoring', icon: 'pi pi-chart-line' }
            ]
          },
          {
            label: 'Data Domains',
            icon: 'pi pi-book',
            expanded: false,
            children: [
              { label: 'Catalog', url: '/data-mesh/domains/catalog', icon: 'pi pi-list' },
              { label: 'Discovery', url: '/data-mesh/domains/discovery', icon: 'pi pi-search' },
              { label: 'Assets', url: '/data-mesh/domains/assets', icon: 'pi pi-database' },
              { label: 'Lineage', url: '/data-mesh/domains/lineage', icon: 'pi pi-share-alt' },
              { label: 'Policies', url: '/data-mesh/domains/policies', icon: 'pi pi-lock' },
              { label: 'Monitoring', url: '/data-mesh/domains/monitoring', icon: 'pi pi-chart-line' }
            ]
          },
          {
            label: 'Observability',
            icon: 'pi pi-eye',
            expanded: false,
            children: [
              { label: 'Monitoring', url: '/observability/monitoring', icon: 'pi pi-chart-line' },
              { label: 'Audit Log', url: '/observability/audit-log', icon: 'pi pi-file' },
              { label: 'Metrics', url: '/observability/metrics', icon: 'pi pi-chart-bar' },
              { label: 'Alerts', url: '/observability/alert', icon: 'pi pi-bell' }
            ]
          }
        ]
      },
      {
        label: 'Governance',
        icon: 'pi pi-shield',
        type: 'item',
        expanded: false,
        children: [
          { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
          { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
          { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' },
          { label: 'Roles', url: '/governance/roles', icon: 'pi pi-id-card' },
          { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
          { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
          { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' }
        ]
      },
      // Settings removed from global sidebar to make it a standalone app (top-right selector)
    ];

    // Initialize app selection
    this.appKey = this.appSwitcher.getCurrent();
    this.selectedApp = this.appKey;
    this.computeVisibleGroups();

    this.appSwitcher.currentApp$.subscribe(key => {
      this.appKey = key;
      this.selectedApp = key;
      this.playWorkspaceHighlight();
      this.computeVisibleGroups();
    });

    // If user navigates directly via URL, derive the appKey from the route and apply it so sidebar isn't empty
    const initialKey = this.deriveAppFromUrl(this.router.url || '');
    if (initialKey && initialKey !== this.appKey) {
      this.appKey = initialKey;
      this.appSwitcher.selectApp(initialKey);
      this.computeVisibleGroups();
    }

    // Update appKey on navigation so deep links and direct URLs correctly show sidebar groups
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((ev: any) => {
      const url = ev.urlAfterRedirects || ev.url || '';
      const derived = this.deriveAppFromUrl(url);
      if (derived && derived !== this.appKey) {
        this.appKey = derived;
        this.appSwitcher.selectApp(derived);
        this.computeVisibleGroups();
      }
    });
  }

  trackByGroup(index: number, item: any) {
    return item?.label + '::' + index;
  }

  trackByItem(index: number, item: any) {
    return item?.label + '::' + index;
  }

  // Helper: Check if group has items
  hasItems(group: any): boolean {
    return group?.items && group.items.length > 0;
  }

  // Helper: Toggle group expansion
  toggleGroup(group: any): void {
    if (this.collapsed || !this.hasItems(group)) return;
    group.expanded = !group.expanded;
    // ensure flattened items exist to avoid recomputing in template
    if (!(group as any)._flattened) {
      (group as any)._flattened = this.getFlattenedItems(group.items || []);
    }
  }

  // Helper: Flatten nested menu items to single level
  getFlattenedItems(items: any[]): any[] {
    if (!items || items.length === 0) return [];

    const flattened: any[] = [];

    items.forEach(item => {
      // If item has children, add them directly (flatten one level)
      if (item.children && item.children.length > 0) {
        item.children.forEach((child: any) => {
          flattened.push({
            ...child,
            label: child.label,
            icon: child.icon || 'pi pi-circle-fill',
            url: child.url
          });
        });
      } else if (item.url) {
        // Direct item with URL
        flattened.push({
          ...item,
          icon: item.icon || 'pi pi-circle-fill'
        });
      }
    });

    return flattened;
  }

  computeVisibleGroups() {
    // Treat a missing or 'all' appKey as the unified sidebar view
    if (!this.sidebarGroups || !this.appKey || this.appKey === 'all') {
      this.visibleGroups = this.orderGroupsForApp(this.sidebarGroups || [], 'all');
      // Đóng tất cả groups mặc định để sidebar không quá dài
      this.visibleGroups.forEach(g => {
        g.expanded = false;
        // precompute flattened items to avoid heavy template calls
        (g as any)._flattened = this.getFlattenedItems(g.items || []);
      });
      return;
    }

    const key = this.appKey;
    // Special-case: for Catalog app, show Data Catalog and Data Exploration groups
    if (key === 'catalog') {
      const byLabel = (lbl: string) => this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes(lbl));

      const dataCatalog = byLabel('data catalog') || null;
      const dataExploration = byLabel('data exploration') || null;

      const groups: any[] = [];
      if (dataCatalog) groups.push(dataCatalog);
      if (dataExploration) groups.push(dataExploration);

      this.visibleGroups = this.orderGroupsForApp(groups, key);
      // Đóng tất cả groups mặc định
      this.visibleGroups.forEach(g => {
        g.expanded = false;
        (g as any)._flattened = this.getFlattenedItems(g.items || []);
      });
      return;
    }

    // Special-case: for Retail app, show only Retail Overview + Inventory Management + Point of Sale + E-commerce + Analytics + Loyalty Program
    if (key === 'retail') {
      const retailGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('retail'));
      const groups: any[] = [];

      if (retailGroup) {
        // Keep Inventory Management subgroup (already has children)
        const inv = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('inventory'));
        if (inv) groups.push({ label: inv.label, icon: inv.icon || 'pi pi-box', expanded: false, items: ((inv as any).children ?? (inv as any).items ?? []) });

        // Point of Sale
        const pos = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('point of sale') || (it.label || '').toLowerCase().includes('pos'));
        if (pos) groups.push({ label: pos.label, icon: pos.icon || 'pi pi-credit-card', expanded: false, items: ((pos as any).children ?? (pos as any).items ?? []) });

        // E-commerce
        const eco = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('e-commerce') || (it.label || '').toLowerCase().includes('ecommerce'));
        if (eco) groups.push({ label: eco.label, icon: eco.icon || 'pi pi-globe', expanded: false, items: ((eco as any).children ?? (eco as any).items ?? []) });

        // Analytics
        const an = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('analytics'));
        if (an) groups.push({ label: an.label, icon: an.icon || 'pi pi-chart-bar', expanded: false, items: ((an as any).children ?? (an as any).items ?? []) });

        // Loyalty Program
        const loy = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('loyalty'));
        if (loy) groups.push({ label: loy.label, icon: loy.icon || 'pi pi-star', expanded: false, items: ((loy as any).children ?? (loy as any).items ?? []) });
      }

      // Prepend a Retail Overview quick link as its own group
      groups.unshift({ label: 'Retail Overview', icon: 'pi pi-shopping-bag', expanded: false, items: [{ label: 'Overview', url: '/retail', icon: 'pi pi-chart-bar' }] });

      this.visibleGroups = this.orderGroupsForApp(groups, key);
      // Đóng tất cả groups mặc định
      this.visibleGroups.forEach(g => {
        g.expanded = false;
        (g as any)._flattened = this.getFlattenedItems((g as any).items || []);
      });
      return;
    }

    // Special-case: for Hotel or Blogger apps - show groups/items that mention hotel/blogger
    if (key === 'hotel' || key === 'blogger') {
      const needle = key === 'hotel' ? 'hotel' : 'blog';
      const groups: any[] = [];

      this.sidebarGroups.forEach(g => {
        const gl = (g.label || '').toLowerCase();
        if (gl.includes(needle) || gl.includes('blogger')) {
          groups.push(g);
          return;
        }

        // check items and children for matches
        const matchedItems: any[] = [];
        (g.items || []).forEach((it: any) => {
          const label = (it.label || '').toLowerCase();
          const url = (it.url || '').toLowerCase();
          if (label.includes(needle) || label.includes('blogger') || url.includes('/' + needle)) {
            matchedItems.push(it);
            return;
          }
          if (it.children) {
            const matchedChildren = (it.children as any[]).filter((c: any) => {
              const cl = (c.label || '').toLowerCase();
              const cu = (c.url || '').toLowerCase();
              return cl.includes(needle) || cl.includes('blogger') || cu.includes('/' + needle);
            });
            if (matchedChildren.length) {
              const copy = { label: it.label, icon: it.icon, expanded: false, children: matchedChildren };
              matchedItems.push(copy as any);
            }
          }
        });

        if (matchedItems.length) {
          groups.push({ label: g.label, icon: g.icon, expanded: false, items: matchedItems });
        }
      });

      // If nothing matched, keep sidebar empty for these apps per request
      this.visibleGroups = this.orderGroupsForApp(groups, key);
      // Đóng tất cả groups mặc định
      this.visibleGroups.forEach(g => g.expanded = false);
      return;
    }

    // Special-case: for Governance app - keep the Governance group as a single top-level group
    // with its items nested underneath (do NOT flatten items to root). This ensures the
    // Governance menu header remains and its submenus appear under it.
    if (key === 'governance') {
      const governanceGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('governance'));
      if (governanceGroup) {
        // Keep a single Governance parent group - đóng mặc định, user sẽ click để mở
        // Clone the object to avoid mutating the original sidebarGroups state.
        const copy = {
          label: governanceGroup.label,
          icon: governanceGroup.icon,
          expanded: false,
          items: governanceGroup.items || []
        } as any;

        this.visibleGroups = this.orderGroupsForApp([copy], key);
        this.visibleGroups.forEach(g => (g as any)._flattened = this.getFlattenedItems((g as any).items || []));
        return;
      }
    }

    const filtered = this.sidebarGroups.filter(g => {
      const label = (g.label || '').toLowerCase();
      if (key === 'governance') return label.includes('governance');
      return true;
    });

    this.visibleGroups = this.orderGroupsForApp(filtered, key);
    // Đóng tất cả groups mặc định
    this.visibleGroups.forEach(g => {
      g.expanded = false;
      (g as any)._flattened = this.getFlattenedItems((g as any).items || []);
    });
  }

  // Derive an AppKey from a router URL (handles deep links like /governance/policies/123)
  deriveAppFromUrl(url: string): AppKey | null {
    if (!url) return null;
    const p = url.split('?')[0].toLowerCase();
    // Treat root path as the 'all' application so the unified sidebar is shown
    if (p === '/' || p === '') return 'all';
    if (p.startsWith('/governance')) return 'governance';
    if (p.startsWith('/retail')) return 'retail';
    if (p.startsWith('/discovery') || p.startsWith('/explore') || p.startsWith('/data-catalog') || p.startsWith('/explore')) return 'catalog';
    if (p.startsWith('/marketplace')) return 'marketplace';
    if (p.startsWith('/blogger') || p.startsWith('/posts') || p.startsWith('/blog')) return 'blogger';
    if (p.startsWith('/hotel')) return 'hotel';
    if (p.startsWith('/ad-manager') || p.startsWith('/admanager') || p.startsWith('/ads')) return 'admanager';
    if (p.startsWith('/settings')) return 'settings';
    // default: nothing to force
    return null;
  }

  orderGroupsForApp(groups: any[], key: AppKey) {
    // Simple prioritization map: which group labels should appear first per app
    const priorityMap: Record<AppKey, string[]> = {
      retail: ['retail', 'marketplace'],
      catalog: ['data catalog', 'explore', 'data', 'catalog'],
      blogger: ['blog', 'blogger', 'posts'],
      hotel: ['hotel', 'rooms', 'bookings', 'management'],
      admanager: ['ad', 'ads', 'advert', 'campaign', 'admanager'],
      governance: ['governance'],
      marketplace: [],
      settings: [],
      all: []
    };

    const priorities = priorityMap[key] || [];

    return groups.slice().sort((a, b) => {
      const al = (a.label || '').toLowerCase();
      const bl = (b.label || '').toLowerCase();

      const ai = priorities.findIndex(p => al.includes(p));
      const bi = priorities.findIndex(p => bl.includes(p));

      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }



  ngOnChanges(changes: any) {
    // Khi sidebar bị thu gọn, tự động collapse tất cả menu groups
    if (changes.collapsed && changes.collapsed.currentValue === true) {
      this.sidebarGroups.forEach(group => {
        group.expanded = false;
      });
    }
  }

  toggleItem(item: MenuItem, event?: Event): void {
    // Toggle expanded state only for items with children
    if (item.children) {
      item.expanded = !item.expanded;
    }
    // Prevent event bubbling if event is provided
    event?.stopPropagation();
  }

  handleMenuClick(event: Event, item: MenuItem): void {
    // Prevent event bubbling to avoid conflicts
    event.preventDefault();
    event.stopPropagation();

    if (item.children && !this.collapsed) {
      // Toggle submenu for items with children when not collapsed
      this.toggleItem(item, event);
    } else if (item.url) {
      // Navigate for direct menu items
      this.navigateTo(item.url);
    }
  }

  navigateTo(url?: string): void {
    if (url) {
      // Split URL and query params
      const [basePath, queryString] = url.split('?');
      const queryParams = this.getQueryParams(url);

      this.router.navigate([basePath], { queryParams });

      // Close sidebar on mobile after navigation
      if (window.innerWidth < 1024) {
        this.toggle.emit();
      }
    }
  }

  getQueryParams(url: string): any {
    if (!url || !url.includes('?')) {
      return {};
    }

    const queryString = url.split('?')[1];
    const params: any = {};

    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = value;
    });

    return params;
  }

  showInfo(event: Event, item: MenuItem): void {
    event.preventDefault();
    event.stopPropagation();

    if (item.info) {
      this.selectedInfo = item.info;
      this.infoDialogVisible = true;
    }
  }

  hideInfo(): void {
    this.infoDialogVisible = false;
    this.selectedInfo = null;
  }

  openAppMatrix(): void {
    this.showAppMatrix = true;
  }

  closeAppMatrix(): void {
    this.showAppMatrix = false;
  }

  // Surface Profile action from current user component
  openProfile(): void {
    // Try to resolve user identity from /me and navigate to a user-specific profile route
    try {
      this.authServices.getCurrentUser().subscribe((resp: any) => {
        const user = resp?.data || resp;
        if (user) {
          const slug = (user.identify || user.username || user.email || user.full_name || user.fullName || '') as string;
          // Prefer a short username-like value
          const short = slug && typeof slug === 'string'
            ? encodeURIComponent((slug.split('@')[0] || slug).toString().trim().replace(/\s+/g, '-').toLowerCase())
            : '';
          if (short) {
            try { this.router.navigate([`/profile/${short}`]); return; } catch (e) { /* ignore */ }
          }
        }
        // fallback to generic profile route
        try { this.router.navigate(['/profile']); } catch (e) { /* safe fallback */ }
      });
    } catch (e) {
      try { this.router.navigate(['/profile']); } catch (err) { /* safe fallback */ }
    }
  }

  // Surface Logout action from current user component
  doLogout(): void {
    // Prefer real logout call when available so session is cleared
    try {
      if (this.authServices && typeof this.authServices.logout === 'function') {
        this.authServices.logout().subscribe(() => this.router.navigate(['/login']));
        return;
      }
    } catch (e) {
      // fall through to navigation-only fallback
    }

    try { this.router.navigate(['/login']); } catch (e) { /* safe fallback */ }
  }

  selectAppKey(key: AppKey): void {
    this.appSwitcher.selectApp(key);
    this.selectedApp = key;
    // navigate to the corresponding dashboard / root for the selected app
    const routeForApp: Record<AppKey, string> = {
      all: '/dashboard',
      retail: '/retail',
      catalog: '/discovery/data-catalog',
      governance: '/governance/policies',
      marketplace: '/marketplace',
      blogger: '/blogger',
      hotel: '/hotel',
      admanager: '/ad-manager',
      settings: '/settings'
    };

    const target = routeForApp[key] || '/dashboard';
    try {
      this.router.navigate([target]);
    } catch (e) {
      // ignore in non-browser env or during server-side rendering
    }

    this.closeAppMatrix();
  }
}

interface MenuItem {
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  expanded?: boolean;
  badge?: string;
  info?: MenuInfo;
  highlighted?: boolean;
  type?: 'separator' | 'item';
}

interface MenuInfo {
  title: string;
  description: string;
  features: string[];
  usage: string;
  tips?: string[];
}
