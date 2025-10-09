import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

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
  ],

})
export class SidebarComponent implements OnChanges {
  menu: MenuItem[];
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  // Info dialog properties
  infoDialogVisible = false;
  selectedInfo: MenuInfo | null = null;

  marketplaceExpanded = false;

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
            { label: 'Reports', url: '/retail/inventory/reports', icon: 'pi pi-chart-line' },
            { label: 'Settings', url: '/retail/inventory/settings', icon: 'pi pi-cog' }
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
        { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' },
        { label: 'Roles', url: '/governance/roles', icon: 'pi pi-users' },
        { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
        { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
        { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
        { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
        { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' },
        { label: 'Contracts', url: '/data-contracts', icon: 'pi pi-file-check' }
      ]
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
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
          { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' },
          { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
          { label: 'Roles', url: '/governance/roles', icon: 'pi pi-users' },
          { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
          { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
          { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
          { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' },
          { label: 'Contracts', url: '/data-contracts', icon: 'pi pi-file-check' }
        ]
      },
      { label: 'Settings', url: '/settings', icon: 'pi pi-cog' }
    ];
  }

  ngOnChanges(changes: any) {
    // Khi sidebar bị thu gọn, tự động collapse tất cả menu groups
    if (changes.collapsed && changes.collapsed.currentValue === true) {
      this.sidebarGroups.forEach(group => {
        group.expanded = false;
      });
      this.marketplaceExpanded = false;
    }
  }

  toggleMarketplace() {
    this.marketplaceExpanded = !this.marketplaceExpanded;
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
