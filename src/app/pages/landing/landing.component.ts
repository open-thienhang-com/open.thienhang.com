import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  currentYear = new Date().getFullYear();

  modules = [
    {
      icon: 'pi pi-box',
      title: 'Multi-tenant Inventory Management',
      description: 'Real-time inventory tracking across decentralized warehouses with automated Expiry Date Tracking and intelligent stock alerts to minimize fresh produce waste',
      route: '/inventory',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: 'pi pi-shopping-cart',
      title: 'Sales & Commerce Operations',
      description: 'High-performance Point-of-Sale (POS) transactions and online order lifecycle management with seamless integration between physical stores and e-commerce channels',
      route: '/retail',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    {
      icon: 'pi pi-chart-line',
      title: 'Demand Forecasting & Analytics',
      description: 'Python FastAPI backend ingesting historical sales and weather data to generate accurate 7-day demand predictions, optimizing fresh goods procurement',
      route: '/inventory/forecast/demand',
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    {
      icon: 'pi pi-shield',
      title: 'Governance & Multi-tenant Isolation',
      description: 'Strict data isolation between retail tenants with robust Role-Based Access Control (RBAC) ensuring sensitive financial and inventory data for authorized personnel only',
      route: '/governance/policies',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  techStack = [
    { name: 'Angular 19', category: 'Frontend' },
    { name: 'PrimeNG', category: 'UI' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'Redis', category: 'Cache' },
    { name: 'scikit-learn', category: 'ML' },
    { name: 'Casbin RBAC', category: 'Auth' },
    { name: 'Docker', category: 'DevOps' },
  ];
}
