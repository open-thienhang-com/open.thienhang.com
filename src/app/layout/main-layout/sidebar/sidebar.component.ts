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
    TooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0px', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    trigger('workspaceChange', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-8px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateX(-6px)' })),
      ]),
    ]),
  ],

})
export class SidebarComponent implements OnInit, OnChanges {
  menu: MenuItem[];
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();
  appKey: AppKey = 'all';

  visibleGroups: any[] = [];
  // Used to force Angular to re-evaluate the list and play transition
  workspaceToggleKey = 0;

  // Info dialog properties
  infoDialogVisible = false;
  selectedInfo: MenuInfo | null = null;

  // marketplaceExpanded removed — Marketplace is now a standalone app with its own overview page

  sidebarGroups = [
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
        // Data Exploration moved out to top-level menu
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
      icon: 'pi pi-search',
      expanded: false,
      items: [
        {
          label: 'Data Exploration',
          icon: 'pi pi-search',
          children: [
            { label: 'Database', url: '/explore/database', icon: 'pi pi-database' },
            { label: 'Pipelines', url: '/explore/pipelines', icon: 'pi pi-sliders-h' },
            { label: 'Topics', url: '/explore/topics', icon: 'pi pi-tags' },
            { label: 'ML Models', url: '/explore/ml-models', icon: 'pi pi-brain' },
            { label: 'Container', url: '/explore/container', icon: 'pi pi-box' },
            { label: 'Search', url: '/explore/search', icon: 'pi pi-search' }
          ]
        }
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
        { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' },
        { label: 'Contracts', url: '/data-contracts', icon: 'pi pi-file-check' }
      ]
    }
  ];

  constructor(private router: Router, private appSwitcher: AppSwitcherService) { }

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
          { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' },
          { label: 'Contracts', url: '/data-contracts', icon: 'pi pi-file-check' }
        ]
      },
      // Settings removed from global sidebar to make it a standalone app (top-right selector)
    ];

    // Initialize app selection
    this.appKey = this.appSwitcher.getCurrent();
    this.computeVisibleGroups();

    this.appSwitcher.currentApp$.subscribe(key => {
      this.appKey = key;
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
    return item?.label + '::' + index + '::' + this.workspaceToggleKey;
  }

  computeVisibleGroups() {
    if (!this.sidebarGroups || this.appKey === 'all') {
      this.visibleGroups = this.orderGroupsForApp(this.sidebarGroups, this.appKey);
      return;
    }

    const key = this.appKey;
    // Special-case: for Catalog app, show only Data Exploration, Data Mesh and Observability
    if (key === 'catalog') {
      const byLabel = (lbl: string) => this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes(lbl));

      // Data Exploration -> the 'Data Catalog' group in our config
      const dataExploration = byLabel('data catalog') || byLabel('catalog') || null;

      // Find the 'Explore' group and extract its child groups 'Data Mesh' and 'Observability'
      const exploreGroup = byLabel('explore') || null;
      let dataMeshGroup = null as any;
      let observabilityGroup = null as any;
      if (exploreGroup && exploreGroup.items) {
        const dm = exploreGroup.items.find((it: any) => (it.label || '').toLowerCase().includes('data mesh') || (it.label || '').toLowerCase().includes('data-mesh') || (it.label || '').toLowerCase().includes('data mesh'));
        const obs = exploreGroup.items.find((it: any) => (it.label || '').toLowerCase().includes('observability') || (it.label || '').toLowerCase().includes('observe'));
        if (dm) {
          const dmItems = (dm as any).children ?? (dm as any).items ?? [];
          dataMeshGroup = { label: dm.label, icon: dm.icon || 'pi pi-sitemap', expanded: false, items: dmItems };
        }
        if (obs) {
          const obsItems = (obs as any).children ?? (obs as any).items ?? [];
          observabilityGroup = { label: obs.label, icon: obs.icon || 'pi pi-eye', expanded: false, items: obsItems };
        }
      }

      const groups: any[] = [];
      if (dataExploration) groups.push(dataExploration);
      if (dataMeshGroup) groups.push(dataMeshGroup);
      if (observabilityGroup) groups.push(observabilityGroup);

      this.visibleGroups = this.orderGroupsForApp(groups, key);
      this.workspaceToggleKey++;
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
      this.workspaceToggleKey++;
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
      this.workspaceToggleKey++;
      return;
    }

    // Special-case: for Governance app - flatten all governance items (no collapse/expand, just show all items)
    if (key === 'governance') {
      const governanceGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('governance'));
      if (governanceGroup && governanceGroup.items) {
        // Flatten all items into a single group with expanded = true (no collapse needed)
        const flatGroup = {
          label: 'Governance',
          icon: 'pi pi-shield',
          expanded: true,
          items: governanceGroup.items
        };
        this.visibleGroups = [flatGroup];
        this.workspaceToggleKey++;
        return;
      }
    }

    const filtered = this.sidebarGroups.filter(g => {
      const label = (g.label || '').toLowerCase();
      if (key === 'governance') return label.includes('governance');
      return true;
    });

    this.visibleGroups = this.orderGroupsForApp(filtered, key);

    // Flip a small key so Angular treats the list as changed and plays animation
    this.workspaceToggleKey++;
  }

  // Derive an AppKey from a router URL (handles deep links like /governance/policies/123)
  deriveAppFromUrl(url: string): AppKey | null {
    if (!url) return null;
    const p = url.split('?')[0].toLowerCase();
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
