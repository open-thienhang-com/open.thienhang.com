import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { InventoryService, AnalyticsService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, Button, TooltipModule, TagModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class InventoryOverviewComponent implements OnInit {

  stats = [
    { label: 'Total Products',  value: '—', icon: 'pi pi-box',                   color: 'bg-blue-100',   iconColor: 'text-blue-600',   desc: 'Total items currently in the catalog' },
    { label: 'Low Stock Items', value: '—', icon: 'pi pi-exclamation-triangle',   color: 'bg-orange-100', iconColor: 'text-orange-600', desc: 'Items below their reorder threshold' },
    { label: 'Out of Stock',    value: '—', icon: 'pi pi-times-circle',           color: 'bg-red-100',    iconColor: 'text-red-600',    desc: 'Items with zero available inventory' },
    { label: 'Total Value',     value: '—', icon: 'pi pi-dollar',                 color: 'bg-green-100',  iconColor: 'text-green-600',  desc: 'Total estimated value of current stock' },
  ];

  sections = [
    {
      label: 'Resources',
      icon: 'pi pi-database',
      desc: 'Foundation data layer that powers the entire system.',
      links: [
        { label: 'Products',       icon: 'pi pi-tag',      route: '../products',    desc: 'Manage product catalog'     },
        { label: 'Categories',     icon: 'pi pi-list',     route: '../categories',  desc: 'Organize product taxonomy'  },
        { label: 'Suppliers',      icon: 'pi pi-truck',    route: '../suppliers',   desc: 'Supply chain partners'      },
        { label: 'Partners',       icon: 'pi pi-users',    route: '../partners',    desc: 'Distributors & partners'    },
        { label: 'Delivery Points',  icon: 'pi pi-map-marker',  route: '/planning/delivery-points',    desc: 'Pickup & dropoff hubs' },
      ]
    },
    {
      label: 'Inventory',
      icon: 'pi pi-box',
      desc: 'Real-time tracking and analysis of physical goods.',
      links: [
        { label: 'Warehouses',     icon: 'pi pi-building', route: '../warehouses',  desc: 'Stock locations & levels'   },
        { label: 'Stock & Products', icon: 'pi pi-box',      route: '../products',    desc: 'Total quantities'           },
        { label: 'Stock Analytics',  icon: 'pi pi-chart-bar',route: '../analytics',   desc: 'Performance insights'       },
      ]
    },
    {
      label: 'Forecasting',
      icon: 'pi pi-chart-line',
      desc: 'Predictive intelligence for proactive decision making.',
      links: [
        { label: 'Demand Forecast', icon: 'pi pi-chart-bar',  route: '/planning/forecast/demand', desc: 'Predicting demand'     },
        { label: 'Hub Forecast',    icon: 'pi pi-building',   route: '/planning/forecast/hub',    desc: 'Hub capacity'          },
        { label: 'Trip Forecast',   icon: 'pi pi-map',        route: '/planning/forecast/trip',   desc: 'Trip requirements'     },
        { label: 'Truck Load',      icon: 'pi pi-box',        route: '/planning/forecast/truck',  desc: 'Load optimization'     },
      ]
    },
    {
      label: 'Fleet & Routes',
      icon: 'pi pi-directions',
      desc: 'Logistics coordination and automated planning.',
      links: [
        { label: 'Fleet Management', icon: 'pi pi-truck',       route: '/planning/fleet',              desc: 'Vehicle tracking'         },
        { label: 'Auto Planning',    icon: 'pi pi-cog',         route: '/planning/auto-planning',      desc: 'Route optimization'       },
      ]
    }
  ];

  stockLevels = [
    { label: 'In Stock',      percent: 0, colorClass: 'bg-green-500',  dotClass: 'bg-green-500', desc: 'Sufficient inventory levels' },
    { label: 'Low Stock',     percent: 0, colorClass: 'bg-orange-500', dotClass: 'bg-orange-500', desc: 'Approaching minimum threshold' },
    { label: 'Out of Stock',  percent: 0,  colorClass: 'bg-red-500',    dotClass: 'bg-red-500',   desc: 'No inventory available' },
  ];

  alerts: { product: string; message: string; severity: string; severityTag: string; icon: string; time: string; context: string }[] = [
    { product: 'iPhone 15 Pro',        message: 'Stock below reorder level (8 units)',   severity: 'critical', severityTag: 'danger',   icon: 'pi pi-exclamation-circle',  time: '2m ago', context: 'Critical reorder needed'  },
    { product: 'Samsung Galaxy S24',   message: 'Low stock warning — 15 units left',     severity: 'warning',  severityTag: 'warning',  icon: 'pi pi-exclamation-triangle',time: '18m ago', context: 'Monitor closely' },
    { product: 'Sony WH-1000XM5',      message: 'Restock received: +200 units',          severity: 'info',     severityTag: 'success',  icon: 'pi pi-check-circle',        time: '1h ago', context: 'OK'  },
    { product: 'AirPods Pro 2nd Gen',  message: 'Out of stock — supplier notified',      severity: 'critical', severityTag: 'danger',   icon: 'pi pi-times-circle',        time: '3h ago', context: 'Impacts sales'  },
  ];

  loading = true;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void { this.loadStats(); }

  loadStats(): void {
    this.loading = true;
    this.analyticsService.getInventoryAnalytics().subscribe({
      next: (resp) => {
        if (resp.success && resp.data) {
          const s = resp.data.summary;
          this.stats = [
            { label: 'Total Products',  value: s.total_products.toLocaleString(),
              icon: 'pi pi-box',                 color: 'bg-blue-100',   iconColor: 'text-blue-600', desc: 'Total items currently in the catalog' },
            { label: 'Low Stock Items', value: s.low_stock_count.toLocaleString(),
              icon: 'pi pi-exclamation-triangle', color: 'bg-orange-100', iconColor: 'text-orange-600', desc: 'Items below their reorder threshold' },
            { label: 'Out of Stock',    value: s.out_of_stock_count.toLocaleString(),
              icon: 'pi pi-times-circle',        color: 'bg-red-100',    iconColor: 'text-red-600', desc: 'Items with zero available inventory' },
            { label: 'Total Value',
              value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(s.total_selling_value),
              icon: 'pi pi-dollar',              color: 'bg-green-100',  iconColor: 'text-green-600', desc: 'Total estimated value of current stock' },
          ];
          const total = s.total_products || 1;
          const inStock = total - s.low_stock_count - s.out_of_stock_count;
          this.stockLevels = [
            { label: 'In Stock',     percent: Math.round((inStock / total) * 100),              colorClass: 'opacity-100',  dotClass: 'bg-green-500', desc: 'Items with sufficient stock for 7+ days'  },
            { label: 'Low Stock',    percent: Math.round((s.low_stock_count / total) * 100),    colorClass: 'opacity-100', dotClass: 'bg-orange-500', desc: 'Items below reorder point (ROP)' },
            { label: 'Out of Stock', percent: Math.round((s.out_of_stock_count / total) * 100), colorClass: 'opacity-100',    dotClass: 'bg-red-500', desc: 'Unavailable items (lost sales impact)'    },
          ];
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
