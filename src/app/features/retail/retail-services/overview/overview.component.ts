import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';

interface ServiceStats {
  category: string;
  count: number;
  active: number;
  revenue: number;
  growth: number;
}

interface RecentActivity {
  id: string;
  action: string;
  service: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    ProgressBarModule,
    ChartModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  serviceStats: ServiceStats[] = [];
  recentActivities: RecentActivity[] = [];
  chartData: any;
  chartOptions: any;

  serviceCategories = [
    {
      key: 'payment',
      label: 'Payment Processing',
      icon: 'pi pi-credit-card',
      color: '#10b981',
      description: 'Secure payment processing and gateway management'
    },
    {
      key: 'inventory',
      label: 'Inventory Management',
      icon: 'pi pi-box',
      color: '#f59e0b',
      description: 'Real-time inventory tracking and management'
    },
    {
      key: 'analytics',
      label: 'Customer Analytics',
      icon: 'pi pi-chart-bar',
      color: '#8b5cf6',
      description: 'Advanced customer behavior and analytics'
    },
    {
      key: 'loyalty',
      label: 'Loyalty Programs',
      icon: 'pi pi-star',
      color: '#ec4899',
      description: 'Customer loyalty and rewards management'
    },
    {
      key: 'pos',
      label: 'POS Systems',
      icon: 'pi pi-shopping-cart',
      color: '#06b6d4',
      description: 'Point of sale and transaction management'
    },
    {
      key: 'ecommerce',
      label: 'E-commerce',
      icon: 'pi pi-globe',
      color: '#3b82f6',
      description: 'Online retail and marketplace solutions'
    }
  ];

  ngOnInit() {
    this.loadServiceStats();
    this.loadRecentActivities();
    this.initChart();
  }

  loadServiceStats() {
    // Mock data - replace with actual API call
    this.serviceStats = [
      { category: 'Payment Processing', count: 3, active: 3, revenue: 899, growth: 12.5 },
      { category: 'Inventory Management', count: 2, active: 2, revenue: 399, growth: 8.3 },
      { category: 'Customer Analytics', count: 1, active: 1, revenue: 399, growth: 15.2 },
      { category: 'Loyalty Programs', count: 1, active: 0, revenue: 249, growth: -2.1 },
      { category: 'POS Systems', count: 1, active: 1, revenue: 349, growth: 22.4 },
      { category: 'E-commerce', count: 0, active: 0, revenue: 0, growth: 0 }
    ];
  }

  loadRecentActivities() {
    // Mock data - replace with actual API call
    this.recentActivities = [
      {
        id: '1',
        action: 'Service Updated',
        service: 'Advanced Payment Gateway',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'success'
      },
      {
        id: '2',
        action: 'New Service Added',
        service: 'Smart Inventory Tracker',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'success'
      },
      {
        id: '3',
        action: 'Service Maintenance',
        service: 'Loyalty Program Manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        status: 'warning'
      },
      {
        id: '4',
        action: 'Payment Failed',
        service: 'Cloud POS System',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        status: 'error'
      }
    ];
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['Payment', 'Inventory', 'Analytics', 'Loyalty', 'POS', 'E-commerce'],
      datasets: [
        {
          label: 'Active Services',
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
            '#ec4899',
            '#06b6d4',
            '#3b82f6'
          ],
          borderColor: [
            '#059669',
            '#d97706',
            '#7c3aed',
            '#db2777',
            '#0891b2',
            '#2563eb'
          ],
          data: [3, 2, 1, 0, 1, 0]
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          grid: {
            color: surfaceBorder
          },
          ticks: {
            color: textColorSecondary,
            stepSize: 1
          },
          pointLabels: {
            color: textColorSecondary
          }
        }
      }
    };
  }

  getTotalServices(): number {
    return this.serviceStats.reduce((sum, stat) => sum + stat.count, 0);
  }

  getActiveServices(): number {
    return this.serviceStats.reduce((sum, stat) => sum + stat.active, 0);
  }

  getTotalRevenue(): number {
    return this.serviceStats.reduce((sum, stat) => sum + stat.revenue, 0);
  }

  getAverageGrowth(): number {
    const totalGrowth = this.serviceStats.reduce((sum, stat) => sum + stat.growth, 0);
    return totalGrowth / this.serviceStats.length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      default: return 'info';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return 'pi pi-check-circle';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'error': return 'pi pi-times-circle';
      default: return 'pi pi-info-circle';
    }
  }

  getCategoryCount(categoryKey: string): number {
    const stat = this.serviceStats.find(s => s.category.toLowerCase().includes(categoryKey));
    return stat ? stat.count : 0;
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }
}
