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
      description: 'Order management and retail operations'
    },
    {
      key: 'inventory',
      label: 'Inventory Management',
      icon: 'pi pi-box',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Stock, products, and warehouse management'
    },
    {
      key: 'loyalty',
      label: 'Loyalty CRM',
      icon: 'pi pi-heart',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      description: 'Customer loyalty, rewards, and campaigns'
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
    }
  ];

  selectedApp: AppKey = 'all';

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
      planning: '/planning',
      blogger: '/blogger',
      hotel: '/hotel',
      admanager: '/ad-manager',
      chat: '/chat',
      files: '/files',
      travel: '/travel',
      settings: '/settings',
      notification: '/notification'
    };

    const target = routeForApp[key] || '/';
    this.router.navigate([target]);
  }
}
