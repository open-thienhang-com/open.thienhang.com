import { Component, EventEmitter, Input, Output, OnChanges, OnInit, computed, effect, inject, PLATFORM_ID, signal, ElementRef } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { MenuItem, MenuInfo } from '../../models/menu-item';
import { $t, updatePreset, updateSurfacePalette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';
import Material from '@primeng/themes/material';
import Nora from '@primeng/themes/nora';
import { PrimeNG } from 'primeng/config';

// PrimeNG imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StyleClassModule } from 'primeng/styleclass';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SearchResultsComponent } from '../../../shared/components/search-results/search-results.component';
import { sidebarGroups as configGroups, menu as fullMenu } from '../../menu-config';

const presets = {
  Aura,
  Material,
  Lara,
  Nora
};

export interface ThemeState {
  preset?: string;
  primary?: string;
  surface?: string;
  darkTheme?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DialogModule,
    ButtonModule,
    DividerModule,
    TooltipModule,
    InputTextModule,
    SelectButtonModule,
    StyleClassModule,
    ToggleSwitchModule,
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

  // Theme & Settings
  private readonly STORAGE_KEY = 'themeSwitcherState';
  document = inject(DOCUMENT);
  private elementRef = inject(ElementRef);
  platformId = inject(PLATFORM_ID);
  config: PrimeNG = inject(PrimeNG);

  // User info from API
  currentUser = signal<any>(null);
  userFullName = computed(() => {
    const user = this.currentUser();
    return user?.full_name || user?.fullName || user?.name || user?.email?.split('@')[0] || 'User';
  });
  userEmail = computed(() => this.currentUser()?.email || '');
  userIdentify = computed(() => this.currentUser()?.identify || '');

  // Theme state
  themeState = signal<ThemeState>(null);
  theme = computed(() => (this.themeState()?.darkTheme ? 'dark' : 'light'));
  selectedPreset = computed(() => this.themeState().preset);
  selectedSurfaceColor = computed(() => this.themeState().surface);
  selectedPrimaryColor = computed(() => this.themeState().primary);
  iconClass = computed(() => this.themeState().darkTheme ? 'pi-sun' : 'pi-moon');
  transitionComplete = signal<boolean>(false);

  presets = Object.keys(presets);

  primaryColors = computed(() => {
    const presetPalette = presets[this.themeState().preset].primitive;
    const colors = [
      'emerald', 'green', 'lime', 'orange', 'amber', 'yellow',
      'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
      'purple', 'fuchsia', 'pink', 'rose',
    ];
    const palettes = [{ name: 'noir', palette: {} }];
    colors.forEach((color) => {
      palettes.push({ name: color, palette: presetPalette[color] });
    });
    return palettes;
  });

  surfaces = [
    {
      name: 'slate',
      palette: {
        0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
        300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569',
        700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
      },
    },
    {
      name: 'gray',
      palette: {
        0: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb',
        300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563',
        700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712',
      },
    },
    {
      name: 'zinc',
      palette: {
        0: '#ffffff', 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7',
        300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b',
        700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b',
      },
    },
    {
      name: 'neutral',
      palette: {
        0: '#ffffff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5',
        300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252',
        700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a',
      },
    },
    {
      name: 'stone',
      palette: {
        0: '#ffffff', 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4',
        300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e',
        700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09',
      },
    },
    {
      name: 'soho',
      palette: {
        0: '#ffffff', 50: '#ececec', 100: '#dedfdf', 200: '#c4c4c6',
        300: '#adaeb0', 400: '#97979b', 500: '#7f8084', 600: '#6a6b70',
        700: '#55565b', 800: '#3f4046', 900: '#2c2c34', 950: '#16161d',
      },
    },
    {
      name: 'viva',
      palette: {
        0: '#ffffff', 50: '#f3f3f3', 100: '#e7e7e8', 200: '#cfd0d0',
        300: '#b7b8b9', 400: '#9fa1a1', 500: '#87898a', 600: '#6e7173',
        700: '#565a5b', 800: '#3e4244', 900: '#262b2c', 950: '#0e1315',
      },
    },
    {
      name: 'ocean',
      palette: {
        0: '#ffffff', 50: '#fbfcfc', 100: '#F7F9F8', 200: '#EFF3F2',
        300: '#DADEDD', 400: '#B1B7B6', 500: '#828787', 600: '#5F7274',
        700: '#415B61', 800: '#29444E', 900: '#183240', 950: '#0c1920',
      },
    },
  ];

  get ripple() {
    return this.config.ripple();
  }

  set ripple(value: boolean) {
    this.config.ripple.set(value);
  }

  // App matrix dialog
  showAppMatrix = false;
  apps: { key: AppKey; label: string; icon: string; gradient: string; description?: string }[] = [
    {
      key: 'explore',
      label: 'Explore',
      icon: 'pi pi-compass',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
      description: 'Discover data products and explore assets'
    },
    {
      key: 'retail',
      label: 'Retail Service',
      icon: 'pi pi-shopping-bag',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: ''
    },
    {
      key: 'loyalty',
      label: 'CRM & Customers',
      icon: 'pi pi-users',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      description: 'Customer management, loyalty rewards and campaigns'
    },
    {
      key: 'governance',
      label: 'Governance',
      icon: 'pi pi-shield',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: ''
    },
    {
      key: 'blogger',
      label: 'Blogger',
      icon: 'pi pi-pencil',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: ''
    },
    {
      key: 'hotel',
      label: 'Hotel',
      icon: 'pi pi-building',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: ''
    },
    {
      key: 'admanager',
      label: 'Ad Manager',
      icon: 'pi pi-bullhorn',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      description: ''
    },
    {
      key: 'support',
      label: 'Support',
      icon: 'pi pi-headphones',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #6d28d9 100%)',
      description: 'Omni-channel inbox, team chat, and notification management'
    },
    {
      key: 'inventory',
      label: 'Inventory Management',
      icon: 'pi pi-box',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Stock, products, warehouses, fleet and forecasting'
    },
    {
      key: 'files',
      label: 'Files',
      icon: 'pi pi-folder',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
      description: 'File storage and management'
    },
    {
      key: 'travel',
      label: 'Travel',
      icon: 'pi pi-globe',
      gradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
      description: 'Plan and manage your trips'
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'pi pi-cog',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: ''
    },
  ];

  selectedApp: AppKey = 'all';
  private _workspaceHighlight = false;

  // Return only the real apps (no placeholders)
  appMatrix(): Array<any> {
    return this.apps;
  }

  sidebarGroups = configGroups;

  constructor(private router: Router, private appSwitcher: AppSwitcherService, private authServices: AuthServices) {
    this.themeState.set({ ...this.loadthemeState() });

    effect(() => {
      const state = this.themeState();
      this.savethemeState(state);
      this.handleDarkModeTransition(state);
    });
  }

  get isLoggedIn(): boolean {
    return this.authServices.isLoggedIn();
  }

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
    // Initialize theme
    if (isPlatformBrowser(this.platformId)) {
      this.onPresetChange(this.themeState().preset);
    }

    // Do not auto-call /authentication/me here to avoid hard redirects on environments
    // that don't expose authentication endpoints (e.g. local travel API).
    try {
      const raw = sessionStorage.getItem('currentUser');
      if (raw) {
        this.currentUser.set(JSON.parse(raw));
      }
    } catch (err) {
      console.warn('Failed to restore user from session storage:', err);
    }

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
              { label: 'Catalog', url: '/data-mesh/catalogs/catalog', icon: 'pi pi-list' },
              { label: 'Discovery', url: '/data-mesh/catalogs/discovery', icon: 'pi pi-search' },
              { label: 'Assets', url: '/data-mesh/catalogs/assets', icon: 'pi pi-database' },
              { label: 'Lineage', url: '/data-mesh/catalogs/lineage', icon: 'pi pi-share-alt' },
              { label: 'Policies', url: '/data-mesh/catalogs/policies', icon: 'pi pi-lock' },
              { label: 'Monitoring', url: '/data-mesh/catalogs/monitoring', icon: 'pi pi-chart-line' }
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

  // Helper to extract path part from a URL that may contain query string
  getPath(url?: string): string {
    if (!url) return '';
    const idx = url.indexOf('?');
    return idx === -1 ? url : url.substring(0, idx);
  }


  // Helper: Check if group has items
  hasItems(group: any): boolean {
    // For pseudo-groups (_noHeader), we always consider them as having items if _flattened is present
    if (group?._noHeader) {
      return !!(group._flattened && group._flattened.length > 0);
    }
    // Check both items and _flattened to handle groups with nested children
    if (group?._flattened && group._flattened.length > 0) return true;
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

  // Helper: Get icon for menu item based on label or URL
  private getIconForMenuItem(item: any): string {
    if (item.icon) return item.icon;

    const label = (item.label || '').toLowerCase();
    const url = (item.url || '').toLowerCase();

    // Icon mapping based on label keywords
    const iconMap: { [key: string]: string } = {
      'dashboard': 'pi pi-home',
      'overview': 'pi pi-chart-bar',
      'catalog': 'pi pi-list',
      'discovery': 'pi pi-search',
      'assets': 'pi pi-database',
      'lineage': 'pi pi-share-alt',
      'policies': 'pi pi-lock',
      'monitoring': 'pi pi-chart-line',
      'permissions': 'pi pi-key',
      'teams': 'pi pi-users',
      'roles': 'pi pi-id-card',
      'accounts': 'pi pi-building',
      'users': 'pi pi-user',
      'products': 'pi pi-shopping-cart',
      'apartments': 'pi pi-home',
      'rooms': 'pi pi-door-open',
      'bookings': 'pi pi-calendar-check',
      'calendar': 'pi pi-calendar',
      'check-in': 'pi pi-sign-in',
      'guests': 'pi pi-user',
      'reviews': 'pi pi-star',
      'ratings': 'pi pi-star-fill',
      'support': 'pi pi-comments',
      'maintenance': 'pi pi-wrench',
      'inventory': 'pi pi-box',
      'staff': 'pi pi-id-card',
      'revenue': 'pi pi-dollar',
      'occupancy': 'pi pi-chart-line',
      'customers': 'pi pi-users',
      'settings': 'pi pi-cog',
      'database': 'pi pi-database',
      'pipelines': 'pi pi-sliders-h',
      'topics': 'pi pi-tags',
      'models': 'pi pi-brain',
      'container': 'pi pi-box',
      'search': 'pi pi-search',
      'domains': 'pi pi-book',
      'api': 'pi pi-code',
      'explorer': 'pi pi-compass',
      'suppliers': 'pi pi-truck',
      'locations': 'pi pi-map-marker',
      'reports': 'pi pi-chart-line',
      'movements': 'pi pi-exchange',
      'transactions': 'pi pi-receipt',
      'orders': 'pi pi-shopping-cart',
      'analytics': 'pi pi-chart-bar',
      'insights': 'pi pi-users',
      'performance': 'pi pi-trophy',
      'members': 'pi pi-users',
      'rewards': 'pi pi-gift',
      'campaigns': 'pi pi-megaphone',
      'planning': 'pi pi-truck',
      'stochastic': 'pi pi-chart-pie',
      'fleet': 'pi pi-truck',
      'notebook': 'pi pi-book'
    };

    // Check label first
    for (const [key, icon] of Object.entries(iconMap)) {
      if (label.includes(key)) {
        return icon;
      }
    }

    // Check URL as fallback
    for (const [key, icon] of Object.entries(iconMap)) {
      if (url.includes(key)) {
        return icon;
      }
    }

    // Default fallback
    return 'pi pi-circle-fill';
  }

  // Helper: Flatten nested menu items to single level
  getFlattenedItems(items: any[]): any[] {
    if (!items || items.length === 0) return [];

    const flattened: any[] = [];

    items.forEach(item => {
      // If item has children/items, add them directly (flatten one level)
      const children = item.children || item.items;
      if (children && children.length > 0) {
        children.forEach((child: any) => {
          flattened.push({
            ...child,
            label: child.label,
            icon: this.getIconForMenuItem(child),
            url: child.url
          });
        });
      } else if (item.url) {
        // Direct item with URL
        flattened.push({
          ...item,
          icon: this.getIconForMenuItem(item)
        });
      }
    });

    return flattened;
  }

  computeVisibleGroups() {
    // Deduplicate groups by label
    const uniqueGroups = new Map<string, any>();
    [...(this.menu || []), ...(fullMenu || []), ...(configGroups || [])].forEach(g => {
      if (g && g.label && !uniqueGroups.has(g.label)) {
        uniqueGroups.set(g.label, g);
      }
    });

    this.sidebarGroups = Array.from(uniqueGroups.values()).map(g => ({
       label: g.label,
       icon: g.icon,
       items: (g as any).children || (g as any).items || []
    }));

    if (!this.sidebarGroups || !this.appKey || this.appKey === 'all') {
      // Ensure all groups are included - no filtering
      const allGroups = (this.sidebarGroups || []).filter(g => g && g.label);
      this.visibleGroups = this.orderGroupsForApp(allGroups, 'all');
      // Close all groups by default to keep sidebar compact
      this.visibleGroups.forEach(g => {
        g.expanded = false;
        // precompute flattened items to avoid heavy template calls
        // This ensures groups with nested children are properly flattened
        (g as any)._flattened = this.getFlattenedItems(g.items || []);
      });
      return;
    }

    const key = this.appKey;

    // Special-case: for Retail app, show business sections in a fixed order.
    if (key === 'retail') {
      const retailGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('sales & commerce'));
      const groups: any[] = [];

      if (retailGroup) {
        const businessOrder = [
          'sales & orders',
          'ecommerce',
          'omni-channel',
          'point of sale',
        ];

        businessOrder.forEach(keyPart => {
          const section = ((retailGroup as any).children || (retailGroup as any).items || []).find((it: any) => (it.label || '').toLowerCase().includes(keyPart));
          if (section) {
            groups.push({
              label: section.label,
              icon: section.icon,
              items: (section as any).children || (section as any).items || [],
              expanded: true,
              _noHeader: false
            });
          }
        });
      }

      this.visibleGroups = this.orderGroupsForApp(groups, key);
      const currentUrl = this.router.url;
      // Ensure all retail groups have their flattened items computed
      this.visibleGroups.forEach(g => {
        if (g.items && (!g._flattened || g._flattened.length === 0)) {
          g._flattened = this.getFlattenedItems(g.items);
        }
        // Auto-expand if current route is within this group
        if ((g as any)._flattened && (g as any)._flattened.some((item: any) => this.getPath(item.url) === this.getPath(currentUrl))) {
          g.expanded = true;
        }
      });
      return;
    }

    if (key === 'planning') {
      const planningGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('retail planning'));
      if (planningGroup) {
        const sourceItems = (planningGroup as any).children || (planningGroup as any).items || [];
        const flattened = this.getFlattenedItems(sourceItems);
        const groups = [{
          label: '',
          icon: '',
          items: sourceItems,
          expanded: false,
          _noHeader: true,
          _flattened: flattened
        } as any];
        this.visibleGroups = groups;
        return;
      }
    }

    if (key === 'inventory' || key === 'fleet' || key === 'warehouse' || key === 'forecast') {
      const invGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('inventory management'));
      if (invGroup) {
        const subGroupLabels = ['stock & products', 'fleet & warehouse', 'forecast', 'planning'];
        const currentUrl = this.router.url;
        const groups: any[] = subGroupLabels.map(subLabel => {
          const sub = ((invGroup as any).children || []).find((it: any) =>
            (it.label || '').toLowerCase().includes(subLabel)
          );
          if (!sub) return null;
          const sourceItems = (sub as any).children || (sub as any).items || [];
          const flattened = this.getFlattenedItems(sourceItems);
          const matchesCurrent = flattened.some((item: any) =>
            this.getPath(item.url) === this.getPath(currentUrl)
          );
          return {
            label: sub.label,
            icon: sub.icon,
            expanded: true,
            items: sourceItems,
            _flattened: flattened
          };
        }).filter(Boolean);
        this.visibleGroups = groups;
      } else {
        this.visibleGroups = [];
      }
      return;
    }

    if (key === 'loyalty' || key === 'retail-customers') {
      const group = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('crm & customers'));
      if (group) {
        this.visibleGroups = [group];
        this.visibleGroups.forEach(g => {
          g.expanded = true;
          (g as any)._flattened = this.getFlattenedItems((g as any).items || []);
        });
      } else {
        this.visibleGroups = [];
      }
      return;
    }

    if (key === 'orders') {
      const retailGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('retail'));
      const group = ((retailGroup as any)?.children || (retailGroup as any)?.items || []).find((it: any) => (it.label || '').toLowerCase().includes('order management'));
      if (group) {
        const sourceItems = (group as any).children || (group as any).items || [];
        const flattened = this.getFlattenedItems(sourceItems);
        this.visibleGroups = [{
          label: '',
          icon: '',
          items: sourceItems,
          expanded: true,
          _noHeader: true,
          _flattened: flattened
        }];
      } else {
        this.visibleGroups = [];
      }
      return;
    }

    if (key === 'transactions') {
      const retailGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('retail'));
      const group = ((retailGroup as any)?.children || (retailGroup as any)?.items || []).find((it: any) => (it.label || '').toLowerCase().includes('transactions'));
      if (group) {
        const sourceItems = (group as any).children || (group as any).items || [];
        const flattened = this.getFlattenedItems(sourceItems);
        this.visibleGroups = [{
          label: '',
          icon: '',
          items: sourceItems,
          expanded: true,
          _noHeader: true,
          _flattened: flattened
        }];
      } else {
        this.visibleGroups = [];
      }
      return;
    }

    // Retail sub-app handlers: extract specific sub-group from 'Retail Operations'
    const retailSubGroupHandler = (subGroupLabel: string) => {
      const retailGroup = fullMenu.find(g => {
        const l = (g.label || '').toLowerCase();
        return l.includes('retail operations') || l.includes('sales & commerce') || l.includes('sales');
      });
      const group = ((retailGroup as any)?.children || []).find((it: any) =>
        (it.label || '').toLowerCase().includes(subGroupLabel.toLowerCase())
      );
      if (group) {
        // Promote children into a pseudo-group without header to match Governance
        const sourceItems = (group as any).children || (group as any).items || [];
        const flattened = this.getFlattenedItems(sourceItems);
        const pseudo = { 
          label: '', 
          icon: '', 
          expanded: false, 
          _noHeader: true, 
          items: sourceItems,
          _flattened: flattened 
        } as any;
        
        this.visibleGroups = [pseudo];
      } else {
        this.visibleGroups = [];
      }
    };

    if (key === 'retail-sales' || key === 'retail-products' || key === 'retail-pos' || key === 'retail-analytics') {
      const salesGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('sales & commerce'));
      if (salesGroup) {
        const children = (salesGroup as any)?.children || [];
        const subGroupLabels = ['sales & orders', 'ecommerce', 'point of sale', 'analytics'];
        const groups: any[] = [];
        subGroupLabels.forEach(subLabel => {
          const sub = children.find((it: any) => (it.label || '').toLowerCase().includes(subLabel));
          if (sub) {
            const sourceItems = (sub as any).children || (sub as any).items || [];
            const flattened = this.getFlattenedItems(sourceItems);
            groups.push({
              label: sub.label,
              icon: sub.icon,
              expanded: true,
              items: sourceItems,
              _flattened: flattened
            });
          }
        });
        this.visibleGroups = groups;
      } else {
        this.visibleGroups = [];
      }
      return;
    }
    if (key === 'retail-omni') { retailSubGroupHandler('omni-channel'); return; }

    if (key === 'hotel') {
      const hotelGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('hotel'));
      if (hotelGroup) {
        const groups = ((hotelGroup as any).children || (hotelGroup as any).items || []).map((section: any) => ({
          label: section.label,
          icon: section.icon,
          items: (section as any).children || (section as any).items || [],
          expanded: true,
          _flattened: this.getFlattenedItems((section as any).children || (section as any).items || [])
        }));
        this.visibleGroups = groups;
      } else {
        this.visibleGroups = [];
      }
      return;
    }

    // Special-case: for Notification app - promote submodules to top-level groups
    if (key === 'notification') {
      const notificationGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('notification'));
      const groups: any[] = [];

      if (notificationGroup) {
        // 1. Overview (standalone)
        const overviewItem = (notificationGroup as any).items?.find((it: any) => it.url === '/notification' && !it.children);
        if (overviewItem) {
          groups.push({
            label: '',
            icon: '',
            expanded: true,
            _noHeader: true,
            _isStandalone: true,
            items: [overviewItem],
            _flattened: [overviewItem]
          });
        }

        // 2. Templates subgroup
        const templates = ((notificationGroup as any).items || []).find((it: any) => (it.label || '').toLowerCase().includes('template'));
        if (templates) {
          groups.push({
            label: templates.label,
            icon: templates.icon || 'pi pi-copy',
            expanded: true,
            items: ((templates as any).children ?? (templates as any).items ?? [])
          });
        }

        // 3. Monitoring subgroup
        const monitoring = ((notificationGroup as any).items || []).find((it: any) => (it.label || '').toLowerCase().includes('monitoring'));
        if (monitoring) {
          groups.push({
            label: monitoring.label,
            icon: monitoring.icon || 'pi pi-chart-line',
            expanded: false,
            items: ((monitoring as any).children ?? (monitoring as any).items ?? [])
          });
        }

        // 4. Development subgroup
        const development = ((notificationGroup as any).items || []).find((it: any) => (it.label || '').toLowerCase().includes('development'));
        if (development) {
          groups.push({
            label: development.label,
            icon: development.icon || 'pi pi-code',
            expanded: false,
            items: ((development as any).children ?? (development as any).items ?? [])
          });
        }
      }

      this.visibleGroups = groups;
      const currentUrl = this.router.url;
      this.visibleGroups.forEach(g => {
        if (!(g as any)._flattened) {
          (g as any)._flattened = this.getFlattenedItems((g as any).items || []);
        }
        // Auto-expand if current route is within this group
        if ((g as any)._flattened && (g as any)._flattened.some((item: any) => this.getPath(item.url) === this.getPath(currentUrl))) {
          g.expanded = true;
        }
      });
      return;
    }

    // Special-case: for Blogger app - render its child menu items directly (no parent header)
    if (key === 'blogger') {
      const bloggerGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('blogger'));
      if (bloggerGroup) {
        const sourceItems = (bloggerGroup as any).children || (bloggerGroup as any).items || [];
        const flattened = this.getFlattenedItems(sourceItems);
        const pseudo = { label: '', icon: '', expanded: true, _noHeader: true, items: sourceItems, _flattened: flattened } as any;

        this.visibleGroups = [pseudo];
      } else {
        this.visibleGroups = [];
      }
      return;
    }
    // Special-case: for Explore app - render its child menu items directly (no parent header)
    if (key === 'explore') {
      const exploreGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase() === 'explore');
      if (exploreGroup) {
        const items: any[] = this.getFlattenedItems((exploreGroup as any).items || []);
        const pseudo = { label: '', icon: '', expanded: false, _noHeader: true, items } as any;
        pseudo._flattened = items;

        this.visibleGroups = [pseudo];
        this.visibleGroups.forEach(g => (g as any)._flattened = (g as any)._flattened || this.getFlattenedItems((g as any).items || []));
      } else {
        this.visibleGroups = [];
      }
      return;
    }
    // Special-case: for Support app (Chat + Notification + Omni-channel merged)
    if (key === 'chat' || key === 'support') {
      const groups: any[] = [];

      // 1. Chat & Collaboration group
      const chatGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('chat'));
      if (chatGroup) {
        const sourceItems = (chatGroup as any).children || (chatGroup as any).items || [];
        groups.push({
          label: 'Chat & Messaging',
          icon: 'pi pi-comments',
          expanded: true,
          items: sourceItems,
          _flattened: this.getFlattenedItems(sourceItems)
        });
      }

      // 2. Notification Center group (sub-groups: Templates, Monitoring, Development)
      const notifGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('notification'));
      if (notifGroup) {
        const notifItems = (notifGroup as any).items || [];
        // Overview standalone
        const overviewItem = notifItems.find((it: any) => it.url === '/notification' && !it.children);
        // Sub-groups
        const templates = notifItems.find((it: any) => (it.label || '').toLowerCase().includes('template'));
        const monitoring = notifItems.find((it: any) => (it.label || '').toLowerCase().includes('monitoring'));
        const development = notifItems.find((it: any) => (it.label || '').toLowerCase().includes('development'));

        const notifFlatItems: any[] = [];
        if (overviewItem) notifFlatItems.push(overviewItem);
        [templates, monitoring, development].forEach(sub => {
          if (sub) {
            const children = (sub as any).children ?? (sub as any).items ?? [];
            children.forEach((c: any) => notifFlatItems.push(c));
          }
        });

        groups.push({
          label: 'Notifications',
          icon: 'pi pi-bell',
          expanded: false,
          items: notifFlatItems,
          _flattened: notifFlatItems.map((it: any) => ({ ...it, icon: this.getIconForMenuItem(it) }))
        });
      }

      // 3. Omni-channel standalone item
      groups.push({
        label: 'Omni-channel',
        icon: 'pi pi-share-alt',
        expanded: true,
        _noHeader: false,
        items: [{ label: 'Channels Overview', url: '/retail/omni-channel', icon: 'pi pi-share-alt' }],
        _flattened: [{ label: 'Channels Overview', url: '/retail/omni-channel', icon: 'pi pi-share-alt' }]
      });

      const currentUrl = this.router.url;
      groups.forEach(g => {
        if (g._flattened?.some((item: any) => this.getPath(item.url) === this.getPath(currentUrl))) {
          g.expanded = true;
        }
      });

      this.visibleGroups = groups;
      return;
    }
    // Special-case: for Ad Manager app - render its child menu items directly (no parent header)
    if (key === 'admanager') {
      const adGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('ad manager'));
      if (adGroup) {
        const sourceItems = (adGroup as any).children || (adGroup as any).items || [];
        const flattened = this.getFlattenedItems(sourceItems);
        const pseudo = { label: '', icon: '', expanded: true, _noHeader: true, items: sourceItems, _flattened: flattened } as any;

        this.visibleGroups = [pseudo];
      } else {
        this.visibleGroups = [];
      }
      return;
    }
    if (key === 'travel') {
      const travelGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase() === 'travel explorer');
      if (travelGroup) {
        const items: any[] = this.getFlattenedItems((travelGroup as any).items || []);
        const pseudo = { label: '', icon: '', expanded: true, _noHeader: true, items } as any;
        pseudo._flattened = items;
        this.visibleGroups = [pseudo];
      } else {
        this.visibleGroups = [];
      }
      return;
    }

    // Special-case: for Governance app - render its child menu items directly (no parent header)
    if (key === 'governance') {
      const governanceGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('governance'));
      if (governanceGroup) {
        // Promote children into a pseudo-group without header
        const items: any[] = this.getFlattenedItems((governanceGroup as any).items || []);
        const pseudo = { label: '', icon: '', expanded: false, _noHeader: true, items } as any;
        pseudo._flattened = items;

        this.visibleGroups = [pseudo];
        this.visibleGroups.forEach(g => (g as any)._flattened = (g as any)._flattened || this.getFlattenedItems((g as any).items || []));
        return;
      }
    }
    // Special-case: for Files app - render its child menu items directly (no parent header)
    if (key === 'files') {
      const filesGroup = fullMenu.find(g => (g.label || '').toLowerCase().includes('file'));
      if (filesGroup) {
        const sourceItems = (filesGroup as any).children || (filesGroup as any).items || [];
        const flattened = this.getFlattenedItems(sourceItems);
        const pseudo = { label: '', icon: '', expanded: true, _noHeader: true, items: sourceItems, _flattened: flattened } as any;

        this.visibleGroups = [pseudo];
      } else {
        this.visibleGroups = [];
      }
      return;
    }

    const filtered = this.sidebarGroups.filter(g => true);

    this.visibleGroups = this.orderGroupsForApp(filtered, key);
    // Close all groups by default
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
    if (p === '/' || p === '' || p === '/applications') return 'all';
    if (p.startsWith('/governance')) return 'governance';
    if (p.startsWith('/retail/loyalty') || p.startsWith('/retail/rewards') || p.startsWith('/retail/campaigns')) return 'loyalty';
    if (p.startsWith('/retail/customers')) return 'loyalty';
    if (p.startsWith('/retail/omni-channel')) return 'support';
    if (p.startsWith('/retail/orders')) return 'retail-sales';
    if (p.startsWith('/retail/transactions')) return 'retail-sales';
    if (p.startsWith('/retail/payment')) return 'retail-sales';
    if (p.startsWith('/retail/products')) return 'retail-sales';
    if (p.startsWith('/retail/ecommerce')) return 'retail-sales';
    if (p.startsWith('/retail/pos')) return 'retail-sales';
    if (p.startsWith('/retail/fresh-retail')) return 'retail-sales';
    if (p.startsWith('/retail/analytics')) return 'retail-sales';
    if (p.startsWith('/retail/settings')) return 'retail-sales';
    if (p.startsWith('/retail')) return 'retail';
    if (p.startsWith('/inventory')) return 'inventory';
    if (p.startsWith('/loyalty')) return 'loyalty';
    if (p.startsWith('/discovery') || p.startsWith('/explore') || p.startsWith('/data-catalog') || p.startsWith('/data-mesh')) return 'explore';
    if (p.startsWith('/blogger') || p.startsWith('/posts') || p.startsWith('/blog')) return 'blogger';
    if (p.startsWith('/hotel')) return 'hotel';
    if (p.startsWith('/ad-manager') || p.startsWith('/admanager') || p.startsWith('/ads')) return 'admanager';
    if (p.startsWith('/files')) return 'files';
    if (p.startsWith('/travel')) return 'travel';
    if (p.startsWith('/settings')) return 'settings';
    if (p.startsWith('/planning/forecast')) return 'inventory';
    if (p.startsWith('/planning/delivery-points')) return 'inventory';
    if (p.startsWith('/planning/fleet')) return 'inventory';
    if (p.startsWith('/planning')) return 'inventory';
    // Marketplace removed - routes to root now
    // default: nothing to force
    return null;
  }

  orderGroupsForApp(groups: any[], key: AppKey) {
    // Simple prioritization map: which group labels should appear first per app
    const priorityMap: Record<AppKey, string[]> = {
      retail: ['Sales & Commerce'],
      inventory: ['Inventory Management'],
      loyalty: ['CRM & Customers'],
      catalog: [],
      explore: ['explore', 'data mesh'],
      chat: [],
      support: ['chat', 'notification', 'omni'],
      warehouse: ['inventory management'],
      planning: ['planning'],
      blogger: ['blog', 'blogger', 'posts'],
      hotel: ['hotel', 'rooms', 'bookings', 'management'],
      admanager: ['ad', 'ads', 'advert', 'campaign', 'admanager'],
      files: ['file', 'storage'],
      governance: ['governance'],
      travel: ['travel'],
      settings: [],
      notification: ['notification'],
      all: [],
      'auto-planning': ['planning'],
      'delivery-points': ['planning'],
      fleet: ['inventory management'],
      demand: ['inventory management'],
      truck: ['inventory management'],
      trip: ['inventory management'],
      hub: ['inventory management'],
      forecast: ['inventory management'],
      orders: ['order management'],
      transactions: ['transactions'],
      'retail-sales': ['sales & commerce', 'sales & orders'],
      'retail-products': ['sales & commerce'],
      'retail-customers': ['crm & customers'],
      'retail-omni': ['omni-channel'],
      'retail-pos': ['sales & commerce'],
      'retail-analytics': ['sales & commerce']
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
    // When sidebar is collapsed, automatically collapse all menu groups
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
    this.router.navigate(['/applications']);
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
      all: '/',
      explore: '/explore',
      retail: '/retail/fresh-retail',
      inventory: '/inventory/overview',
      loyalty: '/loyalty/overview',
      catalog: '/',
      governance: '/governance/policies',
      planning: '/inventory/overview',
      blogger: '/blogger',
      hotel: '/hotel',
      admanager: '/ad-manager',
      support: '/chat',
      chat: '/chat',
      files: '/files',
      travel: '/travel',
      settings: '/settings',
      notification: '/notification',
      'auto-planning': '/planning/auto-planning',
      'warehouse': '/planning/delivery-points',
      'delivery-points': '/planning/delivery-points',
      fleet: '/planning/fleet',
      demand: '/planning/forecast/demand',
      truck: '/planning/forecast/truck',
      trip: '/planning/forecast/trip',
      hub: '/planning/forecast/hub',
      forecast: '/planning/forecast/demand',
      orders: '/retail/orders',
      transactions: '/retail/transactions',
      'retail-sales': '/retail/orders',
      'retail-products': '/retail/products',
      'retail-customers': '/retail/customers',
      'retail-omni': '/retail/omni-channel',
      'retail-pos': '/retail/pos',
      'retail-analytics': '/retail/analytics'
    };

    const target = routeForApp[key] || '/';
    try {
      this.router.navigate([target]);
    } catch (e) {
      // ignore in non-browser env or during server-side rendering
    }

    this.closeAppMatrix();
  }

  // Theme & Settings Methods
  onThemeToggler(): void {
    this.themeState.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  updateColors(event: any, type: string, color: any): void {
    if (type === 'primary') {
      this.themeState.update((state) => ({ ...state, primary: color.name }));
    } else if (type === 'surface') {
      this.themeState.update((state) => ({ ...state, surface: color.name }));
    }
    this.applyTheme(type, color);
    event.stopPropagation();
  }

  applyTheme(type: string, color: any): void {
    if (type === 'primary') {
      updatePreset(this.getPresetExt());
    } else if (type === 'surface') {
      updateSurfacePalette(color.palette);
    }
  }

  onPresetChange(event: any): void {
    this.themeState.update((state) => ({ ...state, preset: event }));
    const preset = presets[event];
    const surfacePalette = this.surfaces.find(
      (s) => s.name === this.selectedSurfaceColor()
    )?.palette;
    if (this.themeState().preset === 'Material') {
      this.document.body.classList.add('material');
      this.config.ripple.set(true);
    } else {
      this.document.body.classList.remove('material');
      this.config.ripple.set(false);
    }
    $t()
      .preset(preset)
      .preset(this.getPresetExt())
      .surfacePalette(surfacePalette)
      .use({ useDefaultOptions: true });
  }

  getPresetExt(): any {
    const color = this.primaryColors().find(
      (c) => c.name === this.selectedPrimaryColor()
    );

    if (color.name === 'noir') {
      return {
        semantic: {
          primary: {
            50: '{surface.50}', 100: '{surface.100}', 200: '{surface.200}',
            300: '{surface.300}', 400: '{surface.400}', 500: '{surface.500}',
            600: '{surface.600}', 700: '{surface.700}', 800: '{surface.800}',
            900: '{surface.900}', 950: '{surface.950}',
          },
          colorScheme: {
            light: {
              primary: {
                color: '{primary.950}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.800}',
                activeColor: '{primary.700}',
              },
              highlight: {
                background: '{primary.950}',
                focusBackground: '{primary.700}',
                color: '#ffffff',
                focusColor: '#ffffff',
              },
            },
            dark: {
              primary: {
                color: '{primary.50}',
                contrastColor: '{primary.950}',
                hoverColor: '{primary.200}',
                activeColor: '{primary.300}',
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.300}',
                color: '{primary.950}',
                focusColor: '{primary.950}',
              },
            },
          },
        },
      };
    } else {
      if (this.themeState().preset === 'Nora') {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: '{primary.600}',
                  contrastColor: '#ffffff',
                  hoverColor: '{primary.700}',
                  activeColor: '{primary.800}',
                },
                highlight: {
                  background: '{primary.600}',
                  focusBackground: '{primary.700}',
                  color: '#ffffff',
                  focusColor: '#ffffff',
                },
              },
              dark: {
                primary: {
                  color: '{primary.500}',
                  contrastColor: '{surface.900}',
                  hoverColor: '{primary.400}',
                  activeColor: '{primary.300}',
                },
                highlight: {
                  background: '{primary.500}',
                  focusBackground: '{primary.400}',
                  color: '{surface.900}',
                  focusColor: '{surface.900}',
                },
              },
            },
          },
        };
      } else if (this.themeState().preset === 'Material') {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: '{primary.500}',
                  contrastColor: '#ffffff',
                  hoverColor: '{primary.400}',
                  activeColor: '{primary.300}',
                },
                highlight: {
                  background: 'color-mix(in srgb, {primary.color}, transparent 88%)',
                  focusBackground: 'color-mix(in srgb, {primary.color}, transparent 76%)',
                  color: '{primary.700}',
                  focusColor: '{primary.800}',
                },
              },
              dark: {
                primary: {
                  color: '{primary.400}',
                  contrastColor: '{surface.900}',
                  hoverColor: '{primary.300}',
                  activeColor: '{primary.200}',
                },
                highlight: {
                  background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                  focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                  color: 'rgba(255,255,255,.87)',
                  focusColor: 'rgba(255,255,255,.87)',
                },
              },
            },
          },
        };
      } else {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: '{primary.500}',
                  contrastColor: '#ffffff',
                  hoverColor: '{primary.600}',
                  activeColor: '{primary.700}',
                },
                highlight: {
                  background: '{primary.50}',
                  focusBackground: '{primary.100}',
                  color: '{primary.700}',
                  focusColor: '{primary.800}',
                },
              },
              dark: {
                primary: {
                  color: '{primary.400}',
                  contrastColor: '{surface.900}',
                  hoverColor: '{primary.300}',
                  activeColor: '{primary.200}',
                },
                highlight: {
                  background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                  focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                  color: 'rgba(255,255,255,.87)',
                  focusColor: 'rgba(255,255,255,.87)',
                },
              },
            },
          },
        };
      }
    }
  }

  startViewTransition(state: ThemeState): void {
    if (!(document as any).startViewTransition) {
      this.toggleDarkMode(state);
      this.onTransitionEnd();
      return;
    }

    const transition = (document as any).startViewTransition(() => {
      this.toggleDarkMode(state);
    });
    transition.ready.then(() => this.onTransitionEnd());
  }

  toggleDarkMode(state: ThemeState): void {
    if (state.darkTheme) {
      this.document.documentElement.classList.add('p-dark');
    } else {
      this.document.documentElement.classList.remove('p-dark');
    }
  }

  onTransitionEnd(): void {
    this.transitionComplete.set(true);
    setTimeout(() => {
      this.transitionComplete.set(false);
    });
  }

  handleDarkModeTransition(state: ThemeState): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startViewTransition(state);
    }
  }

  loadthemeState(): any {
    if (isPlatformBrowser(this.platformId)) {
      const storedState = localStorage.getItem(this.STORAGE_KEY);
      if (storedState) {
        return JSON.parse(storedState);
      }
    }
    return {
      preset: 'Aura',
      primary: 'noir',
      surface: null,
      darkTheme: false,
    };
  }

  savethemeState(state: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    }
  }

}

