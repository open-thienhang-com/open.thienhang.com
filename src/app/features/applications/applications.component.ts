import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppSwitcherService, AppKey } from '../../core/services/app-switcher.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  apps: { key: AppKey; label: string; icon: string; gradient: string; description?: string; category?: string }[] = [
    {
      key: 'explore',
      label: 'Explore',
      icon: 'pi pi-compass',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
      description: 'Discover data products and explore assets'
    },
    {
      key: 'inventory',
      label: 'Inventory Management',
      icon: 'pi pi-box',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Stock, products, and warehouse management',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'loyalty',
      label: 'Loyalty CRM',
      icon: 'pi pi-heart',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      description: 'Customer loyalty, rewards, and campaigns',
      category: 'Retail & Supply Chain'
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
      description: 'Create and manage content for the blog'
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
      icon: 'pi pi-chart-bar',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      description: 'Manage advertising campaigns and placements'
    },
    {
      key: 'travel',
      label: 'Travel Explorer',
      icon: 'pi pi-globe',
      gradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
      description: 'Plan and manage global travel itineraries'
    },
    {
      key: 'chat',
      label: 'Chat & Collaboration',
      icon: 'pi pi-comments',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      description: 'Team chat, channels, and direct messaging'
    },
    {
      key: 'files',
      label: 'File Manager',
      icon: 'pi pi-folder',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
      description: 'Shared storage and document management'
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'pi pi-cog',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'System and workspace configurations'
    },
    {
      key: 'notification',
      label: 'Notification Service',
      icon: 'pi pi-bell',
      gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      description: 'Unified notification management system'
    },
    {
      key: 'planning',
      label: 'Planning',
      icon: 'pi pi-directions',
      gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
      description: 'Supply chain planning and route optimization',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'forecast',
      label: 'Forecast',
      icon: 'pi pi-chart-line',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      description: 'Demand signals and capacity forecasting',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'fleet' as AppKey,
      label: 'Fleet',
      icon: 'pi pi-truck',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
      description: 'Fleet tracking and vehicle management',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'warehouse' as AppKey,
      label: 'Warehouse',
      icon: 'pi pi-building',
      gradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
      description: 'Warehouse locations and delivery points management',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'retail-sales' as AppKey,
      label: 'Sales & Orders',
      icon: 'pi pi-send',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      description: 'Order management, transactions and payments',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'retail-products' as AppKey,
      label: 'Ecommerce',
      icon: 'pi pi-tag',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      description: 'Product catalog and ecommerce store management',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'retail-customers' as AppKey,
      label: 'Customer Management',
      icon: 'pi pi-users',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      description: 'Customers, loyalty members and campaigns',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'retail-omni' as AppKey,
      label: 'Omni-channel',
      icon: 'pi pi-comments',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
      description: 'Multi-channel retail communication and sales',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'retail-pos' as AppKey,
      label: 'Point of Sale',
      icon: 'pi pi-desktop',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      description: 'POS terminal and fresh retail operations',
      category: 'Retail & Supply Chain'
    },
    {
      key: 'retail-analytics' as AppKey,
      label: 'Store Analytics',
      icon: 'pi pi-chart-line',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      description: 'Sales analytics, reports and retail settings',
      category: 'Retail & Supply Chain'
    }
  ];

  selectedApp: AppKey = 'all';

  get categories(): string[] {
    return ['Retail & Supply Chain', 'Others', 'Data Governance'];
  }

  getAppsByCategory(category: string) {
    if (category === 'Retail & Supply Chain') {
      return this.apps.filter(app => app.category === 'Retail & Supply Chain');
    }
    if (category === 'Data Governance') {
      return this.apps.filter(app => ['explore', 'governance', 'settings'].includes(app.key));
    }
    return this.apps.filter(app => app.category !== 'Retail & Supply Chain' && !['explore', 'governance', 'settings'].includes(app.key));
  }

  constructor(
    private router: Router,
    private appSwitcher: AppSwitcherService
  ) {}

  ngOnInit(): void {
    this.selectedApp = this.appSwitcher.getCurrent();
  }

  selectApp(key: AppKey): void {
    this.appSwitcher.selectApp(key);
    this.selectedApp = key;

    const routeForApp: Record<AppKey, string> = {
      all: '/',
      explore: '/explore',
      retail: '/retail/fresh-retail',
      inventory: '/inventory/overview',
      loyalty: '/loyalty/overview',
      catalog: '/',
      governance: '/governance/policies',
      planning: '/planning/auto-planning',
      blogger: '/blogger',
      hotel: '/hotel',
      admanager: '/ad-manager',
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
    this.router.navigate([target]);
  }
}
