import {
  Component, EventEmitter, Input, Output,
  OnChanges, OnInit, computed, inject,
  PLATFORM_ID, signal, ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AppSwitcherService, AppKey } from '../../../core/services/app-switcher.service';
import { AuthServices } from '../../../core/services/auth.services';
import { SidebarPermissionService } from '../../../core/services/sidebar-permission.service';
import { SidebarThemeService } from '../../../core/services/sidebar-theme.service';
import { MenuItem, VisibleGroup } from '../../models/menu-item';
import { sidebarGroups as configGroups, menu as fullMenu } from '../../menu-config';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StyleClassModule } from 'primeng/styleclass';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { OverlayPanelModule } from 'primeng/overlaypanel';

// Sub-components
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';
import { SidebarFooterComponent } from './sidebar-footer/sidebar-footer.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DialogModule,
    ButtonModule,
    TooltipModule,
    SelectButtonModule,
    StyleClassModule,
    ToggleSwitchModule,
    OverlayPanelModule,
    SidebarNavComponent,
    SidebarFooterComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnChanges {

  // ── Inputs / Outputs ────────────────────────────────────────────────────────
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  @ViewChild('userSwitcherPanel') userSwitcherPanel: any;

  // ── Services ────────────────────────────────────────────────────────────────
  private platformId = inject(PLATFORM_ID);
  readonly sidebarTheme = inject(SidebarThemeService);

  // ── State ────────────────────────────────────────────────────────────────────
  menu: MenuItem[] = [];
  visibleGroups: VisibleGroup[] = [];
  sidebarGroups: any[] = configGroups;
  appKey: AppKey = 'all';
  selectedApp: AppKey = 'all';

  currentUser = signal<any>(null);
  accountUsers = signal<any[]>([]);
  userSwitcherLoading = signal(false);

  showAppMatrix = false;
  private _workspaceHighlight = false;

  // ── Computed user helpers ──────────────────────────────────────────────────
  userFullName = computed(() => {
    const u = this.currentUser();
    const first = u?.first_name || u?.firstName || '';
    const last = u?.last_name || u?.lastName || '';
    if (first || last) return `${first} ${last}`.trim();
    return u?.full_name || u?.fullName || u?.name || u?.email?.split('@')[0] || 'User';
  });

  tenantLabel = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    const display = u.tenant_display_name || u.tenantDisplayName;
    if (display) return display;
    const id: string = u.tenant_id || u.tenantId || '';
    if (!id || id === '*' || id === 'system') return 'System';
    return id.length > 14 ? id.substring(0, 12) + '…' : id;
  });

  private readonly HIDDEN_GROUP_LABELS = ['ad manager', 'blogger', 'file', 'travel', 'hotel', 'explore'];

  // ── App matrix ─────────────────────────────────────────────────────────────
  apps: { key: AppKey; label: string; icon: string; color: string }[] = [
    { key: 'applications', label: 'Applications', icon: 'pi pi-th-large', color: '#0ea5e9' },
    { key: 'retail', label: 'Sales', icon: 'pi pi-shopping-bag', color: '#f97316' },
    { key: 'inventory', label: 'Inventory', icon: 'pi pi-box', color: '#10b981' },
    { key: 'governance', label: 'Governance', icon: 'pi pi-shield', color: '#8b5cf6' },
    { key: 'loyalty', label: 'Customers', icon: 'pi pi-users', color: '#3b82f6' },
    { key: 'support', label: 'Support', icon: 'pi pi-comments', color: '#06b6d4' },
    { key: 'planning', label: 'Planning', icon: 'pi pi-map', color: '#14b8a6' },
    { key: 'map', label: 'Map', icon: 'pi pi-map-marker', color: '#22c55e' },
    { key: 'hotel', label: 'Hotel', icon: 'pi pi-building', color: '#f59e0b' },
    { key: 'blogger', label: 'Blogger', icon: 'pi pi-pencil', color: '#ec4899' },
    { key: 'admanager', label: 'Ad Manager', icon: 'pi pi-megaphone', color: '#ef4444' },
    { key: 'explore', label: 'Data Mesh', icon: 'pi pi-sitemap', color: '#6366f1' },
    { key: 'files', label: 'Files', icon: 'pi pi-folder', color: '#84cc16' },
    { key: 'settings', label: 'Settings', icon: 'pi pi-cog', color: '#64748b' },
  ];

  get workspaceLabel(): string {
    if (!this.selectedApp || this.selectedApp === 'all') return 'All Apps';
    return this.apps.find(a => a.key === this.selectedApp)?.label ?? 'All Apps';
  }

  get workspaceHighlight(): boolean { return this._workspaceHighlight; }
  get isLoggedIn(): boolean { return this.authServices.isLoggedIn(); }

  appMatrix() { return this.apps; }

  constructor(
    private router: Router,
    private appSwitcher: AppSwitcherService,
    private authServices: AuthServices,
    private sidebarPermSvc: SidebarPermissionService,
  ) { }

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit() {
    // Restore user from session cache
    try {
      const cached = sessionStorage.getItem('currentUser');
      if (cached) {
        const u = JSON.parse(cached);
        if (u && Object.keys(u).length) this.currentUser.set(u);
      }
    } catch { }

    // Subscribe to user changes
    this.authServices.getUser().subscribe(user => {
      if (user) {
        this.currentUser.set(user);
        const userId = (user as any).identify || (user as any).id || '';
        const tenantId = this._extractTenantFromJwt() || (user as any).tenant_id || 'system';
        if (userId) {
          this.sidebarPermSvc.loadPermissions(userId, tenantId).subscribe(() => this.computeVisibleGroups());
        }
      }
    });

    // Roles may resolve after the permission map loads — recompute so admins
    // immediately get full sidebar visibility once their roles arrive.
    this.authServices.getRoles().subscribe(() => this.computeVisibleGroups());

    if (this.authServices.isLoggedIn() && !this.currentUser()) {
      this.authServices.getCurrentUser().subscribe();
    }

    // Bootstrap governance menu structure
    this.menu = [
      {
        label: 'Governance', icon: 'pi pi-shield', type: 'item', casbinPath: '/governance/*', expanded: false,
        children: [
          { label: 'Overview', url: '/governance/proposal', icon: 'pi pi-th-large', casbinPath: '/governance/*' },
          {
            label: 'Identity', icon: 'pi pi-id-card', expanded: false,
            children: [
              { label: 'Tenants', url: '/governance/tenants', icon: 'pi pi-sitemap', casbinPath: '/governance/tenant*' },
              { label: 'Users', url: '/governance/users', icon: 'pi pi-user', casbinPath: '/governance/user*' },
              { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building', casbinPath: '/governance/account*' },
              { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users', casbinPath: '/governance/team*' },
              { label: 'Branches', url: '/governance/branches', icon: 'pi pi-sitemap', casbinPath: '/governance/branch*' },
            ]
          },
          {
            label: 'Access Control', icon: 'pi pi-lock', expanded: false,
            children: [
              { label: 'Roles', url: '/governance/roles', icon: 'pi pi-tag', casbinPath: '/governance/role*' },
              { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key', casbinPath: '/governance/permission*' },
              { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock', casbinPath: '/governance/polic*' },
              { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database', casbinPath: '/governance/asset*' },
              { label: 'Entitlements', url: '/governance/entitlements', icon: 'pi pi-key', casbinPath: '/governance/entitlement*' },
            ]
          },
          {
            label: 'RBAC & Admin', icon: 'pi pi-cog', expanded: false,
            children: [
              { label: 'RBAC Engine', url: '/governance/casbin', icon: 'pi pi-shield', casbinPath: '/governance/casbin*' },
              { label: 'Admin Tools', url: '/governance/admin', icon: 'pi pi-wrench', casbinPath: '/governance/admin*' },
            ]
          },
        ]
      },
    ];

    // App switcher init
    this.appKey = this.appSwitcher.getCurrent();
    this.selectedApp = this.appKey;
    this.computeVisibleGroups();

    this.appSwitcher.currentApp$.subscribe(key => {
      this.appKey = key;
      this.selectedApp = key;
      this._workspaceHighlight = true;
      setTimeout(() => (this._workspaceHighlight = false), 600);
      this.computeVisibleGroups();
    });

    // Derive app from initial URL
    const initialKey = this.deriveAppFromUrl(this.router.url || '');
    if (initialKey && initialKey !== this.appKey) {
      this.appKey = initialKey;
      this.appSwitcher.selectApp(initialKey);
      this.computeVisibleGroups();
    }

    // Derive app on navigation
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((ev: any) => {
      const url = ev.urlAfterRedirects || ev.url || '';
      const derived = this.deriveAppFromUrl(url);
      if (derived && derived !== this.appKey) {
        this.appKey = derived;
        this.appSwitcher.selectApp(derived);
        this.computeVisibleGroups();
      }
    });
  }

  ngOnChanges(changes: any) {
    if (changes.collapsed?.currentValue === true) {
      this.sidebarGroups.forEach(g => (g.expanded = false));
    }
  }

  // ── Menu helpers ────────────────────────────────────────────────────────────
  getPath(url?: string): string {
    if (!url) return '';
    const i = url.indexOf('?');
    return i === -1 ? url : url.substring(0, i);
  }

  getQueryParams(url?: string): Record<string, string> {
    if (!url?.includes('?')) return {};
    const params: Record<string, string> = {};
    url.split('?')[1].split('&').forEach(p => {
      const [k, v] = p.split('=');
      if (k) params[k] = v ?? '';
    });
    return params;
  }

  private getIconForMenuItem(item: any): string {
    if (item.icon) return item.icon;
    const label = (item.label || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    const map: Record<string, string> = {
      dashboard: 'pi pi-home', overview: 'pi pi-chart-bar', catalog: 'pi pi-list',
      discovery: 'pi pi-search', assets: 'pi pi-database', lineage: 'pi pi-share-alt',
      policies: 'pi pi-lock', monitoring: 'pi pi-chart-line', permissions: 'pi pi-key',
      teams: 'pi pi-users', roles: 'pi pi-id-card', accounts: 'pi pi-building',
      users: 'pi pi-user', products: 'pi pi-shopping-cart', apartments: 'pi pi-home',
      rooms: 'pi pi-door-open', bookings: 'pi pi-calendar-check', calendar: 'pi pi-calendar',
      guests: 'pi pi-user', reviews: 'pi pi-star', support: 'pi pi-comments',
      maintenance: 'pi pi-wrench', inventory: 'pi pi-box', staff: 'pi pi-id-card',
      customers: 'pi pi-users', settings: 'pi pi-cog', database: 'pi pi-database',
      pipelines: 'pi pi-sliders-h', topics: 'pi pi-tags', container: 'pi pi-box',
      search: 'pi pi-search', api: 'pi pi-code', explorer: 'pi pi-compass',
      suppliers: 'pi pi-truck', transactions: 'pi pi-receipt', orders: 'pi pi-shopping-cart',
      analytics: 'pi pi-chart-bar', members: 'pi pi-users', rewards: 'pi pi-gift',
      campaigns: 'pi pi-megaphone', planning: 'pi pi-truck', fleet: 'pi pi-truck',
    };
    for (const [k, v] of Object.entries(map)) {
      if (label.includes(k) || url.includes(k)) return v;
    }
    return 'pi pi-circle-fill';
  }

  getFlattenedItems(items: any[]): any[] {
    if (!items?.length) return [];
    const result: any[] = [];
    for (const item of items) {
      const children = item.children || item.items;
      if (children?.length) {
        for (const child of children) {
          result.push({ ...child, icon: this.getIconForMenuItem(child) });
        }
      } else if (item.url) {
        result.push({ ...item, icon: this.getIconForMenuItem(item) });
      }
    }
    return result;
  }

  // Config-driven group builder — filters by hidden flag and casbinPath before rendering
  private buildGroupsFromChildren(children: any[]): VisibleGroup[] {
    const groups: VisibleGroup[] = [];
    for (const item of children) {
      if (item.hidden) continue;
      // Skip if casbinPath is explicitly denied
      if (item.casbinPath && !this.sidebarPermSvc.isAllowed(item.casbinPath)) continue;

      if (item.url && !item.children?.length && !item.items?.length) {
        groups.push({ expanded: true, _noHeader: true, _isStandalone: true, items: [item], _flattened: [{ ...item, icon: this.getIconForMenuItem(item) }] });
      } else if (item.children?.length || item.items?.length) {
        const src = item.children || item.items || [];
        groups.push({ label: item.label, icon: item.icon, casbinPath: item.casbinPath, expanded: true, items: src, _flattened: this.getFlattenedItems(src) });
      }
    }
    return groups;
  }

  // ── Compute Visible Groups ─────────────────────────────────────────────────
  computeVisibleGroups() {
    const uniqueGroups = new Map<string, any>();
    [...(this.menu || []), ...(fullMenu || []), ...(configGroups || [])].forEach(g => {
      if (g?.label && !g.hidden && !uniqueGroups.has(g.label)) uniqueGroups.set(g.label, g);
    });
    this.sidebarGroups = Array.from(uniqueGroups.values()).map(g => ({
      label: g.label, icon: g.icon, casbinPath: (g as any).casbinPath,
      items: (g as any).children || (g as any).items || []
    }));

    const key = this.appKey;

    // ── All apps view ────────────────────────────────────────────────────────
    if (!key || key === 'all' || key === 'applications') {
      const allGroups = this.sidebarGroups.filter(g => {
        if (!g?.label) return false;
        const lbl = g.label.toLowerCase();
        if (this.HIDDEN_GROUP_LABELS.some(h => lbl.includes(h))) return false;
        if (g.casbinPath && !this.sidebarPermSvc.isAllowed(g.casbinPath)) return false;
        return true;
      });
      this.visibleGroups = this.orderGroupsForApp(allGroups, 'all');
      this.visibleGroups.forEach(g => { g.expanded = false; (g as any)._flattened = this.getFlattenedItems((g as any).items || []); });
      return;
    }

    // ── Retail ───────────────────────────────────────────────────────────────
    if (key === 'retail' || key === 'retail-sales' || key === 'retail-products' || key === 'retail-pos') {
      if (!this.sidebarPermSvc.isAllowed('/retail/*')) { this.visibleGroups = []; return; }
      const g = fullMenu.find(x => x.label?.toLowerCase().includes('sales & commerce'));
      if (g) {
        const src = (g as any).children || (g as any).items || [];
        this.visibleGroups = [{ expanded: true, _noHeader: true, items: src, _flattened: this.getFlattenedItems(src) }];
      } else this.visibleGroups = [];
      return;
    }

    // ── Inventory / Fleet / Forecast ─────────────────────────────────────────
    if (['inventory', 'fleet', 'warehouse', 'forecast'].includes(key)) {
      const g = fullMenu.find(x => x.label?.toLowerCase().includes('inventory'));
      this.visibleGroups = g ? this.buildGroupsFromChildren((g as any).children || []) : [];
      return;
    }

    // ── Planning ─────────────────────────────────────────────────────────────
    if (key === 'planning' || key === 'auto-planning') {
      const g = fullMenu.find(x => x.label?.toLowerCase().includes('retail planning'));
      if (g) {
        const src = (g as any).children || (g as any).items || [];
        this.visibleGroups = [{ expanded: false, _noHeader: true, items: src, _flattened: this.getFlattenedItems(src) }];
      } else this.visibleGroups = [];
      return;
    }

    // ── Loyalty / CRM ─────────────────────────────────────────────────────────
    if (key === 'loyalty' || key === 'retail-customers') {
      if (!this.sidebarPermSvc.isAllowed('/loyalty/*')) { this.visibleGroups = []; return; }
      const g = fullMenu.find(x => x.label?.toLowerCase().includes('customer'));
      if (g) {
        const src = (g as any).children || (g as any).items || [];
        this.visibleGroups = [{ expanded: true, _noHeader: true, items: src, _flattened: this.getFlattenedItems(src) }];
      } else this.visibleGroups = [];
      return;
    }

    // ── Retail sub-handlers ───────────────────────────────────────────────────
    if (key === 'retail-omni') {
      this._retailSubGroup('omni-channel');
      return;
    }
    if (key === 'orders') { this._retailSubGroup('order management'); return; }
    if (key === 'transactions') { this._retailSubGroup('transactions'); return; }

    // ── Hotel ─────────────────────────────────────────────────────────────────
    if (key === 'hotel') {
      const g = fullMenu.find(x => x.label?.toLowerCase().includes('hotel'));
      if (g) {
        this.visibleGroups = ((g as any).children || []).map((s: any) => ({
          label: s.label, icon: s.icon, expanded: true,
          items: s.children || s.items || [],
          _flattened: this.getFlattenedItems(s.children || s.items || [])
        }));
      } else this.visibleGroups = [];
      return;
    }

    // ── Governance ────────────────────────────────────────────────────────────
    if (key === 'governance') {
      if (!this.sidebarPermSvc.isAllowed('/governance/*')) { this.visibleGroups = []; return; }
      const g = this.sidebarGroups.find(x => x.label?.toLowerCase().includes('governance'));
      if (!g) { this.visibleGroups = []; return; }
      const groups: VisibleGroup[] = [];
      for (const item of (g.items || [])) {
        if (item.casbinPath && !this.sidebarPermSvc.isAllowed(item.casbinPath)) continue;
        if (item.url && !item.children && !item.items) {
          groups.push({ expanded: true, _noHeader: true, _isStandalone: true, items: [item], _flattened: [{ ...item, icon: this.getIconForMenuItem(item) }] });
        } else if (item.children || item.items) {
          const allowed = (item.children || item.items || []).filter((c: any) => !c.casbinPath || this.sidebarPermSvc.isAllowed(c.casbinPath));
          if (allowed.length) groups.push({ label: item.label, icon: item.icon, expanded: true, items: allowed, _flattened: this.getFlattenedItems(allowed) });
        }
      }
      this.visibleGroups = groups;
      return;
    }

    // ── Support / Chat / CMC ──────────────────────────────────────────────────
    if (key === 'chat' || key === 'support') {
      if (!this.sidebarPermSvc.isAllowed('/cmc/*')) { this.visibleGroups = []; return; }
      const g = fullMenu.find(x => x.label?.toLowerCase().includes('support'));
      if (g) {
        this.visibleGroups = this.buildGroupsFromChildren((g as any).children || []);
      } else this.visibleGroups = [];
      return;
    }

    // ── Single-section apps ───────────────────────────────────────────────────
    const singleSectionApps: Partial<Record<AppKey, string>> = {
      blogger: 'blogger', explore: 'explore', admanager: 'ad manager',
      files: 'file', travel: 'travel', notification: 'notification',
      map: 'map',
    };
    const singleLabel = singleSectionApps[key];
    if (singleLabel) {
      const g = [...this.sidebarGroups, ...fullMenu].find(x => x.label?.toLowerCase().includes(singleLabel));
      if (g) {
        const src = (g as any).children || (g as any).items || [];
        this.visibleGroups = [{ expanded: true, _noHeader: true, items: src, _flattened: this.getFlattenedItems(src) }];
      } else this.visibleGroups = [];
      return;
    }

    // Fallback
    const filtered = this.sidebarGroups.filter(() => true);
    this.visibleGroups = this.orderGroupsForApp(filtered, key);
    this.visibleGroups.forEach(g => { g.expanded = false; (g as any)._flattened = this.getFlattenedItems((g as any).items || []); });
  }

  private _retailSubGroup(subLabel: string) {
    const retailGroup = fullMenu.find(g => {
      const l = (g.label || '').toLowerCase();
      return l.includes('retail operations') || l.includes('sales & commerce') || l.includes('sales');
    });
    const sub = ((retailGroup as any)?.children || []).find((it: any) => it.label?.toLowerCase().includes(subLabel));
    if (sub) {
      const src = sub.children || sub.items || [];
      this.visibleGroups = [{ expanded: false, _noHeader: true, items: src, _flattened: this.getFlattenedItems(src) }];
    } else {
      this.visibleGroups = [];
    }
  }

  // ── URL → AppKey ────────────────────────────────────────────────────────────
  deriveAppFromUrl(url: string): AppKey | null {
    if (!url) return null;
    const p = url.split('?')[0].toLowerCase();
    if (p === '/' || p === '') return 'all';
    if (p === '/applications' || p.startsWith('/applications/')) return 'applications';
    if (p === '/map' || p.startsWith('/map/')) return 'map';
    if (p.startsWith('/governance')) return 'governance';
    if (p.startsWith('/retail/loyalty') || p.startsWith('/retail/rewards') || p.startsWith('/retail/campaigns') || p.startsWith('/retail/customers')) return 'loyalty';
    if (p.startsWith('/retail/omni-channel')) return 'support';
    if (p.startsWith('/retail/orders') || p.startsWith('/retail/transactions') || p.startsWith('/retail/payment') || p.startsWith('/retail/products') || p.startsWith('/retail/ecommerce') || p.startsWith('/retail/pos') || p.startsWith('/retail/fresh-retail') || p.startsWith('/retail/settings')) return 'retail-sales';
    if (p.startsWith('/retail')) return 'retail';
    if (p.startsWith('/inventory')) return 'inventory';
    if (p.startsWith('/loyalty')) return 'loyalty';
    if (p.startsWith('/discovery') || p.startsWith('/explore') || p.startsWith('/data-catalog') || p.startsWith('/data-mesh') || p.startsWith('/marketplace') || p.startsWith('/observability')) return 'explore';
    if (p.startsWith('/blogger') || p.startsWith('/posts') || p.startsWith('/blog')) return 'blogger';
    if (p.startsWith('/hotel')) return 'hotel';
    if (p.startsWith('/ad-manager') || p.startsWith('/admanager') || p.startsWith('/ads')) return 'admanager';
    if (p.startsWith('/files')) return 'files';
    if (p.startsWith('/travel')) return 'travel';
    if (p.startsWith('/settings')) return 'settings';
    if (p.startsWith('/planning')) return 'inventory';
    if (p.startsWith('/cmc')) return 'support';
    return null;
  }

  orderGroupsForApp(groups: any[], key: AppKey) {
    const priorityMap: Partial<Record<AppKey, string[]>> = {
      retail: ['Sales & Commerce'], inventory: ['Inventory Management'], loyalty: ['CRM & Customers'],
      governance: ['governance'], explore: ['explore', 'data mesh'],
    };
    const priorities = priorityMap[key] || [];
    return groups.slice().sort((a, b) => {
      const ai = priorities.findIndex(p => (a.label || '').toLowerCase().includes(p));
      const bi = priorities.findIndex(p => (b.label || '').toLowerCase().includes(p));
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }

  // ── JWT helper ──────────────────────────────────────────────────────────────
  private _extractTenantFromJwt(): string | null {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1])).tenant_id || null;
    } catch { return null; }
  }

  // ── App switcher ────────────────────────────────────────────────────────────
  openAppMatrix() { this.showAppMatrix = true; }
  closeAppMatrix() { this.showAppMatrix = false; }

  selectAppKey(key: AppKey): void {
    this.appSwitcher.selectApp(key);
    this.selectedApp = key;
    const routes: Partial<Record<AppKey, string>> = {
      all: '/', explore: '/explore', retail: '/retail/fresh-retail', inventory: '/inventory/overview',
      loyalty: '/loyalty/overview', governance: '/governance/policies', planning: '/inventory/overview',
      blogger: '/blogger', hotel: '/hotel', admanager: '/ad-manager', support: '/cmc/workspace',
      chat: '/chat', files: '/files', travel: '/travel', settings: '/settings',
      notification: '/notification', 'auto-planning': '/planning/auto-planning',
      warehouse: '/planning/delivery-points', 'delivery-points': '/planning/delivery-points',
      fleet: '/planning/fleet', orders: '/retail/orders', transactions: '/retail/transactions',
      'retail-sales': '/retail/orders', 'retail-products': '/retail/products',
      'retail-customers': '/retail/customers', 'retail-omni': '/retail/omni-channel',
      'retail-pos': '/retail/pos', applications: '/applications', map: '/map/address-extraction',
    };
    try { this.router.navigate([routes[key] || '/']); } catch { }
    this.closeAppMatrix();
  }

  // ── User switcher ───────────────────────────────────────────────────────────
  isActiveUser(user: any): boolean {
    const cur = this.currentUser();
    return !!(cur && user && (cur.id === user.id || cur.identify === user.id || (cur as any).user_id === user.id));
  }

  loadAccountUsers(): void {
    this.userSwitcherLoading.set(true);
    this.authServices.getAccountUsers().subscribe({
      next: (resp: any) => {
        this.accountUsers.set(Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.data?.data) ? resp.data.data : []));
        this.userSwitcherLoading.set(false);
      },
      error: () => { this.accountUsers.set([]); this.userSwitcherLoading.set(false); }
    });
  }

  doSwitchUser(userId: string): void {
    this.userSwitcherLoading.set(true);
    this.authServices.switchUser(userId).subscribe({
      next: () => { this.userSwitcherLoading.set(false); this.authServices.getCurrentUser().subscribe(); this.loadAccountUsers(); },
      error: () => this.userSwitcherLoading.set(false)
    });
  }

  onUserSwitcherOpen(event: MouseEvent): void {
    this.loadAccountUsers();
    this.userSwitcherPanel?.toggle(event);
  }

  // ── Auth actions ────────────────────────────────────────────────────────────
  openProfile(): void {
    try {
      this.authServices.getCurrentUser().subscribe((resp: any) => {
        const user = resp?.data || resp;
        const slug = user?.identify || user?.username || user?.email || user?.full_name || '';
        const short = slug ? encodeURIComponent((slug.split('@')[0] || slug).toString().trim().replace(/\s+/g, '-').toLowerCase()) : '';
        try { this.router.navigate(short ? [`/profile/${short}`] : ['/profile']); } catch { }
      });
    } catch { try { this.router.navigate(['/profile']); } catch { } }
  }

  doLogout(): void {
    this.currentUser.set(null);
    this.visibleGroups = [];
    this.accountUsers.set([]);
    try { sessionStorage.removeItem('currentUser'); } catch { }
    this.sidebarPermSvc.clear();
    try { this.router.navigate(['/logout']); } catch { }
  }
}
