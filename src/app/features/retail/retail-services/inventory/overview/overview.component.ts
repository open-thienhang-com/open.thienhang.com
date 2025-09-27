import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  product: string;
  currentStock: number;
  threshold: number;
  location: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface StockMovement {
  id: string;
  product: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  location: string;
  timestamp: Date;
  user: string;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  recentMovements: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    ProgressBarModule,
    ChartModule,
    TableModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  inventoryStats: InventoryStats = {
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringItems: 0,
    recentMovements: 0
  };

  alerts: InventoryAlert[] = [];
  recentMovements: StockMovement[] = [];
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.loadInventoryStats();
    this.loadAlerts();
    this.loadRecentMovements();
    this.initChart();
  }

  loadInventoryStats() {
    // Mock data - replace with actual API call
    this.inventoryStats = {
      totalProducts: 2450,
      totalValue: 1250000,
      lowStockItems: 23,
      outOfStockItems: 8,
      expiringItems: 15,
      recentMovements: 45
    };
  }

  loadAlerts() {
    // Mock data - replace with actual API call
    this.alerts = [
      {
        id: '1',
        type: 'out_of_stock',
        product: 'Wireless Headphones Pro',
        currentStock: 0,
        threshold: 5,
        location: 'Main Warehouse',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: '2',
        type: 'low_stock',
        product: 'Bluetooth Speaker',
        currentStock: 3,
        threshold: 10,
        location: 'Main Warehouse',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        id: '3',
        type: 'expiring',
        product: 'Organic Milk 1L',
        currentStock: 25,
        threshold: 30,
        location: 'Cold Storage',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
      },
      {
        id: '4',
        type: 'overstock',
        product: 'USB Cables 2m',
        currentStock: 150,
        threshold: 50,
        location: 'Electronics Section',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
      }
    ];
  }

  loadRecentMovements() {
    // Mock data - replace with actual API call
    this.recentMovements = [
      {
        id: 'MOV-001',
        product: 'Gaming Mouse RGB',
        type: 'out',
        quantity: 5,
        reason: 'Sale',
        location: 'Main Warehouse',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        user: 'John Smith'
      },
      {
        id: 'MOV-002',
        product: 'Mechanical Keyboard',
        type: 'in',
        quantity: 20,
        reason: 'Purchase Order #1234',
        location: 'Main Warehouse',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        user: 'Sarah Johnson'
      },
      {
        id: 'MOV-003',
        product: 'Monitor 27"',
        type: 'adjustment',
        quantity: -2,
        reason: 'Damaged goods',
        location: 'Electronics Section',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
        user: 'Mike Davis'
      }
    ];
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['Electronics', 'Clothing', 'Food', 'Home', 'Sports', 'Books'],
      datasets: [
        {
          label: 'Current Stock',
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4'
          ],
          borderColor: [
            '#2563eb',
            '#059669',
            '#d97706',
            '#dc2626',
            '#7c3aed',
            '#0891b2'
          ],
          data: [450, 320, 280, 180, 120, 90]
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
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  getAlertSeverity(type: string): string {
    switch (type) {
      case 'out_of_stock':
      case 'expiring':
        return 'danger';
      case 'low_stock':
        return 'warning';
      case 'overstock':
        return 'info';
      default:
        return 'info';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'out_of_stock':
        return 'pi pi-exclamation-triangle';
      case 'low_stock':
        return 'pi pi-exclamation-circle';
      case 'expiring':
        return 'pi pi-clock';
      case 'overstock':
        return 'pi pi-info-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  getMovementIcon(type: string): string {
    switch (type) {
      case 'in':
        return 'pi pi-plus-circle';
      case 'out':
        return 'pi pi-minus-circle';
      case 'adjustment':
        return 'pi pi-pencil';
      default:
        return 'pi pi-circle';
    }
  }

  getMovementSeverity(type: string): string {
    switch (type) {
      case 'in':
        return 'success';
      case 'out':
        return 'warning';
      case 'adjustment':
        return 'info';
      default:
        return 'info';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ago`;
    }
  }

  refreshData() {
    this.loadInventoryStats();
    this.loadAlerts();
    this.loadRecentMovements();
  }
}
