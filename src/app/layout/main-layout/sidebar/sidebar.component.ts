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
import { I18nService } from '../../../core/services/i18n.service';
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
  i18nService = inject(I18nService);

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
  currentLanguage = computed(() => this.i18nService.getCurrentLanguage());
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
      key: 'retail',
      label: 'Retail Service',
      icon: 'pi pi-shopping-bag',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: ''
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
      key: 'settings',
      label: 'Settings',
      icon: 'pi pi-cog',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: ''
    }
  ];

  selectedApp: AppKey = 'all';
  private _workspaceHighlight = false;

  // Return only the real apps (no placeholders)
  appMatrix(): Array<any> {
    return this.apps;
  }

  sidebarGroups = [
    // Overview group removed per request (Dashboard & Search moved/removed)
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
            { label: 'Catalogs', url: '/data-mesh/catalogs', icon: 'pi pi-book' }
          ]
        },
        { label: 'Database Explorer', url: '/explore/database', icon: 'pi pi-database' },
        { label: 'Pipelines', url: '/explore/pipelines', icon: 'pi pi-sliders-h' },
        { label: 'Topics & Events', url: '/explore/topics', icon: 'pi pi-tags' },
        { label: 'ML Models', url: '/explore/ml-models', icon: 'pi pi-brain' },
        { label: 'Containers', url: '/explore/container', icon: 'pi pi-box' },
        { label: 'Advanced Search', url: '/explore/search', icon: 'pi pi-search' }
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
        },
        {
          label: 'Planning & Forecasting',
          icon: 'pi pi-truck',
          children: [
            { label: 'Auto Planning', url: '/planning/auto-planning', icon: 'pi pi-cog' },
            { label: 'Stochastic', url: '/planning/stochastic', icon: 'pi pi-chart-pie' },
            { label: 'Fleet', url: '/planning/fleet', icon: 'pi pi-truck' },
            { label: 'Experiment', url: '/planning/experiment', icon: 'pi pi-flask' }
          ]
        }
      ]
    },
    {
      label: 'Experiment',
      icon: 'pi pi-flask',
      expanded: false,
      items: [
        { label: 'Notebook', url: '/planning/experiment', icon: 'pi pi-book' }
      ]
    },
    {
      label: 'Hotel Management',
      icon: 'pi pi-building',
      expanded: false,
      items: [
        // 1. Dashboard - Overview
        { label: 'Dashboard', url: '/hotel', icon: 'pi pi-home' },
        
        // 2. Property Management - Quản lý tài sản
        {
          label: 'Property Management',
          icon: 'pi pi-building',
          children: [
            { label: 'Apartments', url: '/hotel/apartments', icon: 'pi pi-home' },
            { label: 'Rooms', url: '/hotel/rooms', icon: 'pi pi-door-open' }
          ]
        },
        
        // 3. Reservations & Bookings - Đặt phòng và lịch
        {
          label: 'Reservations & Bookings',
          icon: 'pi pi-calendar',
          children: [
            { label: 'Bookings', url: '/hotel/bookings', icon: 'pi pi-calendar-check' },
            { label: 'Calendar', url: '/hotel/calendar', icon: 'pi pi-calendar' },
            { label: 'Check-in', url: '/hotel/checkin', icon: 'pi pi-sign-in' }
          ]
        },
        
        // 4. Guest Services - Dịch vụ khách hàng
        {
          label: 'Guest Services',
          icon: 'pi pi-users',
          children: [
            { label: 'Guests', url: '/hotel/guests', icon: 'pi pi-user' },
            { label: 'Reviews', url: '/hotel/reviews', icon: 'pi pi-star' },
            { label: 'Ratings', url: '/hotel/ratings', icon: 'pi pi-star-fill' },
            { label: 'Support', url: '/hotel/support', icon: 'pi pi-comments' }
          ]
        },
        
        // 5. Operations - Vận hành
        {
          label: 'Operations',
          icon: 'pi pi-cog',
          children: [
            { label: 'Maintenance', url: '/hotel/maintenance', icon: 'pi pi-wrench' },
            { label: 'Inventory', url: '/hotel/inventory', icon: 'pi pi-box' },
            { label: 'Staff', url: '/hotel/staff', icon: 'pi pi-id-card' }
          ]
        },
        
        // 6. Analytics & Reports - Phân tích và báo cáo
        {
          label: 'Analytics & Reports',
          icon: 'pi pi-chart-bar',
          children: [
            { label: 'Dashboard', url: '/hotel/analytics/dashboard', icon: 'pi pi-chart-pie' },
            { label: 'Revenue', url: '/hotel/analytics/revenue', icon: 'pi pi-dollar' },
            { label: 'Occupancy', url: '/hotel/analytics/occupancy', icon: 'pi pi-chart-line' },
            { label: 'Customers', url: '/hotel/analytics/customers', icon: 'pi pi-users' }
          ]
        },
        
        // 7. Settings - Cài đặt (cuối cùng)
        { label: 'Settings', url: '/hotel/settings', icon: 'pi pi-cog' }
      ]
    }
  ];

  constructor(private router: Router, private appSwitcher: AppSwitcherService, private authServices: AuthServices) {
    this.themeState.set({ ...this.loadthemeState() });

    effect(() => {
      const state = this.themeState();
      this.savethemeState(state);
      this.handleDarkModeTransition(state);
    });
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

    // Load current user info
    this.authServices.getCurrentUser().subscribe({
      next: (resp: any) => {
        // Response structure from log: { data: { full_name, email, identify, ... }, message, total }
        // The actual user info is inside resp.data.data or resp.data
        let userData: any = resp;

        console.log('Raw response:', resp);

        // Unwrap ApiResponse wrapper
        if (userData?.data) {
          userData = userData.data;
          console.log('After first unwrap:', userData);
        }

        // If still wrapped in another data layer
        if (userData?.data && typeof userData.data === 'object') {
          userData = userData.data;
          console.log('After second unwrap:', userData);
        }

        // Check for user wrapper
        if (userData?.user) {
          userData = userData.user;
        }

        console.log('Final user data:', userData);
        console.log('full_name:', userData?.full_name);
        this.currentUser.set(userData);
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
      }
    });

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
      'cash': 'pi pi-money-bill',
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
      'experiment': 'pi pi-flask',
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
      // If item has children, add them directly (flatten one level)
      if (item.children && item.children.length > 0) {
        item.children.forEach((child: any) => {
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

    // Treat a missing or 'all' appKey as the unified sidebar view
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

    // Special-case: for Planning app - redirect to Retail (Planning is now merged into Retail)
    if (key === 'planning') {
      // Redirect to Retail instead
      this.appKey = 'retail';
      this.computeVisibleGroups();
      return;
    }

    // Special-case: for Retail app, show Inventory, POS, E-commerce, Analytics, Loyalty, and Planning
    if (key === 'retail') {
      const retailGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('retail'));
      const groups: any[] = [];

      if (retailGroup) {
        // Keep Inventory Management subgroup
        const inv = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('inventory'));
        if (inv) groups.push({ label: inv.label, icon: inv.icon || this.getIconForMenuItem(inv), expanded: false, items: ((inv as any).children ?? (inv as any).items ?? []) });

        // Point of Sale
        const pos = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('point of sale') || (it.label || '').toLowerCase().includes('pos'));
        if (pos) groups.push({ label: pos.label, icon: pos.icon || this.getIconForMenuItem(pos), expanded: false, items: ((pos as any).children ?? (pos as any).items ?? []) });

        // E-commerce
        const eco = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('e-commerce') || (it.label || '').toLowerCase().includes('ecommerce'));
        if (eco) groups.push({ label: eco.label, icon: eco.icon || this.getIconForMenuItem(eco), expanded: false, items: ((eco as any).children ?? (eco as any).items ?? []) });

        // Analytics
        const an = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('analytics'));
        if (an) groups.push({ label: an.label, icon: an.icon || this.getIconForMenuItem(an), expanded: false, items: ((an as any).children ?? (an as any).items ?? []) });

        // Loyalty Program
        const loy = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('loyalty'));
        if (loy) groups.push({ label: loy.label, icon: loy.icon || this.getIconForMenuItem(loy), expanded: false, items: ((loy as any).children ?? (loy as any).items ?? []) });

        // Planning & Forecasting
        const planning = (retailGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('planning'));
        if (planning) groups.push({ label: planning.label, icon: planning.icon || this.getIconForMenuItem(planning), expanded: false, items: ((planning as any).children ?? (planning as any).items ?? []) });
      }

      // Prepend a Retail Overview quick link as its own group
      groups.unshift({ label: 'Retail Overview', icon: 'pi pi-shopping-bag', expanded: false, items: [{ label: 'Overview', url: '/retail', icon: 'pi pi-chart-bar' }] });

      this.visibleGroups = this.orderGroupsForApp(groups, key);
      // Close all groups by default
      this.visibleGroups.forEach(g => {
        g.expanded = false;
        (g as any)._flattened = this.getFlattenedItems((g as any).items || []);
      });
      return;
    }

    // Special-case: for Hotel app - show Hotel Management groups similar to Retail
    if (key === 'hotel') {
      const hotelGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('hotel'));
      const groups: any[] = [];

      if (hotelGroup) {
        // 1. Dashboard (first - standalone item)
        const dashboardItem = hotelGroup.items?.find((it: any) => it.url === '/hotel' && !it.children);
        if (dashboardItem) {
          groups.push({ 
            label: '', 
            icon: '', 
            expanded: true, 
            _noHeader: true,
            _isStandalone: true,
            items: [dashboardItem],
            _flattened: [dashboardItem]
          });
        }

        // 2. Property Management subgroup
        const property = (hotelGroup.items || []).find((it: any) => (it.label || '').toLowerCase().includes('property'));
        if (property) {
          groups.push({ 
            label: property.label, 
            icon: property.icon || this.getIconForMenuItem(property), 
            expanded: false, 
            items: ((property as any).children ?? (property as any).items ?? []) 
          });
        }

        // 3. Reservations & Bookings subgroup
        const reservations = (hotelGroup.items || []).find((it: any) => 
          (it.label || '').toLowerCase().includes('reservation') || 
          (it.label || '').toLowerCase().includes('booking')
        );
        if (reservations) {
          groups.push({ 
            label: reservations.label, 
            icon: reservations.icon || this.getIconForMenuItem(reservations), 
            expanded: false, 
            items: ((reservations as any).children ?? (reservations as any).items ?? []) 
          });
        }

        // 4. Guest Services subgroup
        const guestServices = (hotelGroup.items || []).find((it: any) => 
          (it.label || '').toLowerCase().includes('guest') || 
          (it.label || '').toLowerCase().includes('service')
        );
        if (guestServices) {
          groups.push({ 
            label: guestServices.label, 
            icon: guestServices.icon || this.getIconForMenuItem(guestServices), 
            expanded: false, 
            items: ((guestServices as any).children ?? (guestServices as any).items ?? []) 
          });
        }

        // 5. Operations subgroup
        const operations = (hotelGroup.items || []).find((it: any) => 
          (it.label || '').toLowerCase().includes('operation') || 
          (it.label || '').toLowerCase().includes('maintenance')
        );
        if (operations) {
          groups.push({ 
            label: operations.label, 
            icon: operations.icon || this.getIconForMenuItem(operations), 
            expanded: false, 
            items: ((operations as any).children ?? (operations as any).items ?? []) 
          });
        }

        // 6. Analytics & Reports subgroup
        const analytics = (hotelGroup.items || []).find((it: any) => 
          (it.label || '').toLowerCase().includes('analytics') || 
          (it.label || '').toLowerCase().includes('report')
        );
        if (analytics) {
          groups.push({ 
            label: analytics.label, 
            icon: analytics.icon || this.getIconForMenuItem(analytics), 
            expanded: false, 
            items: ((analytics as any).children ?? (analytics as any).items ?? []) 
          });
        }

        // 7. Settings (last - standalone item)
        const settingsItem = hotelGroup.items?.find((it: any) => 
          it.url === '/hotel/settings' && !it.children
        );
        if (settingsItem) {
          groups.push({ 
            label: '', 
            icon: '', 
            expanded: false, 
            _noHeader: true,
            _isStandalone: true,
            items: [settingsItem],
            _flattened: [settingsItem]
          });
        }
      }

      // Don't reorder - keep the exact order we set (Dashboard first, Settings last)
      this.visibleGroups = groups;
      // Close all groups by default (except Dashboard which should be expanded)
      this.visibleGroups.forEach(g => {
        // Keep Dashboard expanded if it's standalone
        if ((g as any)._isStandalone && (g as any).items?.[0]?.url === '/hotel') {
          g.expanded = true;
        } else {
          g.expanded = false;
        }
        (g as any)._flattened = this.getFlattenedItems((g as any).items || []);
      });
      return;
    }

    // Special-case: for Blogger app - show groups/items that mention blogger
    if (key === 'blogger') {
      const needle = 'blog';
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
      // Close all groups by default
      this.visibleGroups.forEach(g => g.expanded = false);
      return;
    }

    // Special-case: for Governance app - render its child menu items directly (no parent header)
    if (key === 'governance') {
      const governanceGroup = this.sidebarGroups.find(g => (g.label || '').toLowerCase().includes('governance'));
      if (governanceGroup) {
        // Promote children into a pseudo-group without header
        const items: any[] = this.getFlattenedItems(governanceGroup.items || []);
        const pseudo = { label: '', icon: '', expanded: false, _noHeader: true, items } as any;
        pseudo._flattened = items;

        this.visibleGroups = [pseudo];
        this.visibleGroups.forEach(g => (g as any)._flattened = (g as any)._flattened || this.getFlattenedItems((g as any).items || []));
        return;
      }
    }

    const filtered = this.sidebarGroups.filter(g => {
      const label = (g.label || '').toLowerCase();
      if (key === 'governance') return label.includes('governance');
      return true;
    });

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
    if (p === '/' || p === '') return 'all';
    if (p.startsWith('/governance')) return 'governance';
    if (p.startsWith('/retail')) return 'retail';
    if (p.startsWith('/planning')) return 'planning';
    if (p.startsWith('/discovery') || p.startsWith('/explore') || p.startsWith('/data-catalog')) return 'all';
    if (p.startsWith('/blogger') || p.startsWith('/posts') || p.startsWith('/blog')) return 'blogger';
    if (p.startsWith('/hotel')) return 'hotel';
    if (p.startsWith('/ad-manager') || p.startsWith('/admanager') || p.startsWith('/ads')) return 'admanager';
    if (p.startsWith('/settings')) return 'settings';
    // Marketplace removed - routes to root now
    // default: nothing to force
    return null;
  }

  orderGroupsForApp(groups: any[], key: AppKey) {
    // Simple prioritization map: which group labels should appear first per app
    const priorityMap: Record<AppKey, string[]> = {
      retail: ['retail'],
      catalog: [],
      planning: ['planning'],
      blogger: ['blog', 'blogger', 'posts'],
      hotel: ['hotel', 'rooms', 'bookings', 'management'],
      admanager: ['ad', 'ads', 'advert', 'campaign', 'admanager'],
      governance: ['governance'],
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
      retail: '/retail',
      catalog: '/',
      governance: '/governance/policies',
      planning: '/planning',
      blogger: '/blogger',
      hotel: '/hotel',
      admanager: '/ad-manager',
      settings: '/settings'
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

  changeLanguage(lang: string): void {
    this.i18nService.setLanguage(lang);
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
      if ((document as any).startViewTransition) {
        this.startViewTransition(state);
      } else {
        this.toggleDarkMode(state);
        this.onTransitionEnd();
      }
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
