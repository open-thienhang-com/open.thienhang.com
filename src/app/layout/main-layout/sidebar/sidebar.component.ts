import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule
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
export class SidebarComponent {
  menu: MenuItem[];
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  constructor(private router: Router) { }

  ngOnInit() {
    this.menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-objects-column',
        url: '/dashboard'
      },
      {
        label: 'Data Products',
        icon: 'pi pi-database',
        url: '/data-product'
      },
      {
        label: 'Data Mesh',
        icon: 'pi pi-sitemap',
        children: [
          { label: 'Data Contracts', icon: 'pi pi-file-check', url: '/data-contracts' },
          { label: 'Domain Catalog', icon: 'pi pi-book', url: '/domains' },
          { label: 'Lineage Explorer', icon: 'pi pi-share-alt', url: '/data-mesh/lineage' },
          { label: 'Quality Metrics', icon: 'pi pi-chart-bar', url: '/data-mesh/quality' },
        ],
        expanded: false
      },
      {
        label: 'Governance',
        icon: 'pi pi-shield',
        children: [
          { label: 'Policies', icon: 'pi pi-file-text', url: '/governance/policies' },
          { label: 'Assets', icon: 'pi pi-box', url: '/governance/assets' },
          { label: 'Permissions', icon: 'pi pi-key', url: '/governance/permissions' },
          { label: 'Roles', icon: 'pi pi-users', url: '/governance/roles' },
          { label: 'Accounts', icon: 'pi pi-user', url: '/governance/accounts' },
          { label: 'Users', icon: 'pi pi-user-plus', url: '/governance/users' },
          { label: 'Teams', icon: 'pi pi-users', url: '/governance/teams' },
        ],
        expanded: false
      },
      {
        label: 'Discovery',
        icon: 'pi pi-search',
        children: [
          { label: 'Data Catalog', icon: 'pi pi-list', url: '/discovery/catalog' },
          { label: 'Schema Registry', icon: 'pi pi-code', url: '/schema-registry' },
          { label: 'API Explorer', icon: 'pi pi-globe', url: '/api-explorer' },
        ],
        expanded: false
      },
      {
        label: 'Explore',
        icon: 'pi pi-compass',
        children: [
          {
            label: 'Database',
            icon: 'pi pi-database',
            url: '/explore/database',
            badge: '8',
          },
          {
            label: 'Pipelines',
            icon: 'pi pi-directions',
            url: '/explore/pipelines',
            badge: '3',
          },
          {
            label: 'Topics',
            icon: 'pi pi-telegram',
            url: '/explore/topics',
            badge: '2',
          },
          {
            label: 'ML Models',
            icon: 'pi pi-chart-line',
            url: '/explore/ml-models',
            badge: '5'
          },
          {
            label: 'Container',
            icon: 'pi pi-box',
            url: '/explore/container',
            badge: '2',
          },
          {
            label: 'Search Indexes',
            icon: 'pi pi-search',
            url: '/explore/search',
            badge: '1',
          },
          {
            label: 'APIs',
            icon: 'pi pi-globe',
            url: '/explore/apis',
            badge: '4',
          }
        ],
        expanded: false
      },
      {
        label: 'Observability',
        icon: 'pi pi-eye',
        children: [
          { label: 'Monitoring', icon: 'pi pi-chart-line', url: '/observability/monitoring' },
          { label: 'Alerting', icon: 'pi pi-bell', url: '/alerting' },
          { label: 'Audit Logs', icon: 'pi pi-history', url: '/audit-logs' },
        ],
        expanded: false
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        children: [
          { label: 'User Profile', icon: 'pi pi-user', url: '/profile' },
          { label: 'Preferences', icon: 'pi pi-sliders-h', url: '/settings' },
          { label: 'Security', icon: 'pi pi-shield', url: '/settings?tab=security' },
          { label: 'Notifications', icon: 'pi pi-bell', url: '/settings?tab=notifications' },
        ],
        expanded: false
      },
    ];
  }

  toggleItem(item: MenuItem): void {
    // Nếu item có thuộc tính expanded, chỉ cần toggle
    if ('expanded' in item) {
      item.expanded = !item.expanded;
    } else {
      // Nếu item chưa có thuộc tính expanded, thêm vào và set giá trị true
      item.expanded = true;
    }

    // Ngăn sự kiện click lan tỏa lên parent
    event?.stopPropagation();
  }

  handleMenuClick(event: Event, item: MenuItem): void {
    // Prevent event bubbling to avoid conflicts
    event.preventDefault();
    event.stopPropagation();

    if (item.children && !this.collapsed) {
      // Toggle submenu for items with children
      this.toggleItem(item);
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
}

interface MenuItem {
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  expanded?: boolean;
  badge?: string;
}
