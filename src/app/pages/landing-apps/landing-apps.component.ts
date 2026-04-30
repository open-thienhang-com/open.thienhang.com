import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface LandingApp {
  key: string;
  label: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
}

@Component({
  selector: 'app-landing-apps',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-apps.component.html',
  styleUrls: ['./landing-apps.component.scss'],
})
export class LandingAppsComponent {
  apps: LandingApp[] = [
    {
      key: 'retail',
      label: 'Retail Service',
      description: 'POS, inventory, and e-commerce for retail stores.',
      icon: 'pi pi-shopping-bag',
      route: '/retail',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      key: 'governance',
      label: 'Governance',
      description: 'Permissions, teams, policies & compliance for data.',
      icon: 'pi pi-shield',
      route: '/governance/policies',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      key: 'planning',
      label: 'Planning',
      description: 'Operations & logistics planning.',
      icon: 'pi pi-truck',
      route: '/planning',
      gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    },
    {
      key: 'marketplace',
      label: 'Marketplace',
      description: 'Data products & data discovery for the organization.',
      icon: 'pi pi-shopping-cart',
      route: '/marketplace',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      key: 'blogger',
      label: 'Blogger',
      description: 'Content management, articles, and publishing.',
      icon: 'pi pi-pencil',
      route: '/blogger',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      key: 'hotel',
      label: 'Hotel',
      description: 'Room booking, hotel management & operations.',
      icon: 'pi pi-building',
      route: '/hotel',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      key: 'admanager',
      label: 'Ad Manager',
      description: 'Ad campaign management & reporting.',
      icon: 'pi pi-bullhorn',
      route: '/ad-manager',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    {
      key: 'settings',
      label: 'Settings',
      description: 'System configuration & workspace preferences.',
      icon: 'pi pi-cog',
      route: '/profile',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
      key: 'notification',
      label: 'Notification Service',
      description: 'Template management, multi-channel messaging, and performance monitoring.',
      icon: 'pi pi-bell',
      route: '/notification',
      gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    },
  ];
}

