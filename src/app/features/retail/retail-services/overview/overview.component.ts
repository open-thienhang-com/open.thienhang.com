import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-retail-overview-doc',
  standalone: true,
  imports: [CommonModule, RouterModule, Button, TooltipModule, Tag],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class RetailOverviewDocComponent implements OnInit {

  loading = true;

  stats = [
    { label: 'Gross Revenue',  value: '$128,450', icon: 'pi pi-dollar', color: 'bg-blue-100',   iconColor: 'text-blue-600',   desc: 'Total sales value before deductions' },
    { label: 'Total Orders',   value: '1,240',    icon: 'pi pi-shopping-cart', color: 'bg-indigo-100', iconColor: 'text-indigo-600', desc: 'Total number of orders processed' },
    { label: 'Active Customers', value: '856',    icon: 'pi pi-users', color: 'bg-purple-100', iconColor: 'text-purple-600', desc: 'Customers with at least one order this month' },
    { label: 'Avg. Order Value', value: '$103.50', icon: 'pi pi-chart-line', color: 'bg-emerald-100', iconColor: 'text-emerald-600', desc: 'Average revenue generated per order' },
  ];

  sections = [
    {
      label: 'Channels',
      icon: 'pi pi-share-alt',
      desc: 'Primary sales touchpoints and distribution networks.',
      links: [
        { label: 'POS Systems',    icon: 'pi pi-shopping-cart', route: '../pos',          desc: 'In-store retail terminals' },
        { label: 'E-commerce',     icon: 'pi pi-globe',         route: '../ecommerce',    desc: 'Online storefront & sales' },
        { label: 'Fresh Retail',   icon: 'pi pi-apple',         route: '../fresh-retail', desc: 'Perishable goods management' },
      ]
    },
    {
      label: 'Operations',
      icon: 'pi pi-cog',
      desc: 'Core workflow management for order processing.',
      links: [
        { label: 'Orders',         icon: 'pi pi-list',          route: '../orders',       desc: 'Full order lifecycle'      },
        { label: 'Transactions',   icon: 'pi pi-history',       route: '../transactions', desc: 'Financial records'         },
        { label: 'Omni-channel',   icon: 'pi pi-sync',          route: '../omni-channel', desc: 'Unified sales coordination' },
      ]
    },
    {
      label: 'Resources',
      icon: 'pi pi-database',
      desc: 'Essential data assets powering the retail suite.',
      links: [
        { label: 'Customers',      icon: 'pi pi-users',         route: '../customers',    desc: 'CRM & contact management'  },
        { label: 'Products',       icon: 'pi pi-box',           route: '../products',     desc: 'Retail product catalog'    },
        { label: 'Payments',       icon: 'pi pi-credit-card',   route: '../payment',      desc: 'Gateways & settlements'    },
      ]
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      desc: 'Performance tracking and customer behavioral insights.',
      links: [
        { label: 'Sales Analytics', icon: 'pi pi-chart-line',    route: '../analytics',   desc: 'Revenue performance'       },
        { label: 'Insights',       icon: 'pi pi-search-plus',   route: '../analytics',   desc: 'Customer segments'          },
      ]
    }
  ];

  orderHealth = [
    { label: 'Fulfilled',     percent: 88, colorClass: 'bg-emerald-500',  dotClass: 'bg-emerald-500', desc: 'Orders completed and delivered' },
    { label: 'Processing',    percent: 9,  colorClass: 'bg-blue-500',     dotClass: 'bg-blue-500',    desc: 'Orders currently being prepared' },
    { label: 'On Hold',       percent: 3,  colorClass: 'bg-orange-500',   dotClass: 'bg-orange-500',  desc: 'Orders requiring intervention' },
  ];

  alerts = [
    { id: '1', product: 'Order #8942', message: 'Payment authorization failed', severity: 'critical', severityTag: 'danger', icon: 'pi pi-times-circle', time: '5m ago', context: 'Action Required' },
    { id: '2', product: 'E-commerce',  message: 'Traffic spike detected (+40%)', severity: 'info',     severityTag: 'info',   icon: 'pi pi-info-circle',  time: '12m ago', context: 'Monitoring' },
    { id: '3', product: 'Fresh Store', message: 'POS Terminal 04 offline',       severity: 'warning',  severityTag: 'warning', icon: 'pi pi-exclamation-triangle', time: '1h ago', context: 'Check Connectivity' },
  ];

  ngOnInit(): void {
    // Simulate data loading
    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  loadStats(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }
}
