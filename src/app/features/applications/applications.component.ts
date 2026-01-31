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
      icon: 'pi pi-chart-bar',
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
    this.router.navigate([target]);
  }
}
