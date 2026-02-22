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
      description: ''
    },
    {
      key: 'loyalty',
      label: 'Loyalty Program',
      icon: 'pi pi-star',
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
      icon: 'pi pi-chart-bar',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      description: ''
    },
    {
      key: 'travel',
      label: 'Travel',
      icon: 'pi pi-globe',
      gradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
      description: 'Plan and manage your trips'
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: 'pi pi-comments',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      description: 'Team chat and discussions'
    },
    {
      key: 'files',
      label: 'Files',
      icon: 'pi pi-folder',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
      description: 'File storage and management'
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
      retail: '/retail',
      loyalty: '/retail/loyalty',
      catalog: '/',
      governance: '/governance/policies',
      planning: '/planning',
      blogger: '/blogger',
      hotel: '/hotel',
      admanager: '/ad-manager',
      chat: '/chat',
      files: '/files',
      travel: '/travel',
      settings: '/settings'
    };

    const target = routeForApp[key] || '/';
    this.router.navigate([target]);
  }
}
