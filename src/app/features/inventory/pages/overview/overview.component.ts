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
    { label: 'Total Products',  value: '—', icon: 'pi pi-box',                   color: 'bg-blue-100',   iconColor: 'text-blue-600'   },
    { label: 'Low Stock Items', value: '—', icon: 'pi pi-exclamation-triangle',   color: 'bg-orange-100', iconColor: 'text-orange-600' },
    { label: 'Out of Stock',    value: '—', icon: 'pi pi-times-circle',           color: 'bg-red-100',    iconColor: 'text-red-600'    },
    { label: 'Total Value',     value: '—', icon: 'pi pi-dollar',                 color: 'bg-green-100',  iconColor: 'text-green-600'  },
  ];

  sections = [
    {
      label: 'Stock & Products',
      icon: 'pi pi-box',
      links: [
        { label: 'Products',       icon: 'pi pi-tag',      route: '../products',    desc: 'Manage product catalog'     },
        { label: 'Categories',     icon: 'pi pi-list',     route: '../categories',  desc: 'Organize product taxonomy'  },
        { label: 'Warehouses',     icon: 'pi pi-building', route: '../warehouses',  desc: 'Stock locations'            },
        { label: 'Suppliers',      icon: 'pi pi-truck',    route: '../suppliers',   desc: 'Supply chain partners'      },
        { label: 'Partners',       icon: 'pi pi-users',    route: '../partners',    desc: 'Distributors & partners'    },
        { label: 'Analytics',      icon: 'pi pi-chart-bar',route: '../analytics',   desc: 'Performance insights'       },
      ]
    },
    {
      label: 'Fleet & Warehouse',
      icon: 'pi pi-truck',
      links: [
        { label: 'Fleet Management', icon: 'pi pi-truck',       route: '/planning/fleet',              desc: 'Vehicle tracking'         },
        { label: 'Delivery Points',  icon: 'pi pi-map-marker',  route: '/planning/delivery-points',    desc: 'Warehouse locations'      },
      ]
    },
    {
      label: 'Forecast',
      icon: 'pi pi-chart-line',
      links: [
        { label: 'Demand Forecast', icon: 'pi pi-chart-bar',  route: '/planning/forecast/demand', desc: 'Demand signals'     },
        { label: 'Truck Load',      icon: 'pi pi-box',        route: '/planning/forecast/truck',  desc: 'Load forecasting'   },
        { label: 'Trip Forecast',   icon: 'pi pi-map',        route: '/planning/forecast/trip',   desc: 'Trip planning'      },
        { label: 'Hub Forecast',    icon: 'pi pi-building',   route: '/planning/forecast/hub',    desc: 'Hub capacity'       },
      ]
    }
  ];

  stockLevels = [
    { label: 'In Stock',      percent: 85, colorClass: 'bg-green-500',  dotClass: 'bg-green-500'  },
    { label: 'Low Stock',     percent: 12, colorClass: 'bg-orange-500', dotClass: 'bg-orange-500' },
    { label: 'Out of Stock',  percent: 3,  colorClass: 'bg-red-500',    dotClass: 'bg-red-500'    },
  ];

  alerts: { product: string; message: string; severity: string; severityTag: string; icon: string; time: string }[] = [
    { product: 'iPhone 15 Pro',        message: 'Stock below reorder level (8 units)',   severity: 'critical', severityTag: 'danger',   icon: 'pi pi-exclamation-circle',  time: '2m ago'  },
    { product: 'Samsung Galaxy S24',   message: 'Low stock warning — 15 units left',     severity: 'warning',  severityTag: 'warning',  icon: 'pi pi-exclamation-triangle',time: '18m ago' },
    { product: 'Sony WH-1000XM5',      message: 'Restock received: +200 units',          severity: 'info',     severityTag: 'success',  icon: 'pi pi-check-circle',        time: '1h ago'  },
    { product: 'AirPods Pro 2nd Gen',  message: 'Out of stock — supplier notified',      severity: 'critical', severityTag: 'danger',   icon: 'pi pi-times-circle',        time: '3h ago'  },
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void { this.loadStats(); }

  loadStats(): void {
    this.analyticsService.getInventoryAnalytics().subscribe(resp => {
      if (resp.success && resp.data) {
        const s = resp.data.summary;
        this.stats = [
          { label: 'Total Products',  value: s.total_products.toLocaleString(),
            icon: 'pi pi-box',                 color: 'bg-blue-100',   iconColor: 'text-blue-600'   },
          { label: 'Low Stock Items', value: s.low_stock_count.toLocaleString(),
            icon: 'pi pi-exclamation-triangle', color: 'bg-orange-100', iconColor: 'text-orange-600' },
          { label: 'Out of Stock',    value: s.out_of_stock_count.toLocaleString(),
            icon: 'pi pi-times-circle',        color: 'bg-red-100',    iconColor: 'text-red-600'    },
          { label: 'Total Value',
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(s.total_selling_value),
            icon: 'pi pi-dollar',              color: 'bg-green-100',  iconColor: 'text-green-600'  },
        ];
        const total = s.total_products || 1;
        const inStock = total - s.low_stock_count - s.out_of_stock_count;
        this.stockLevels = [
          { label: 'In Stock',     percent: Math.round((inStock / total) * 100),              colorClass: 'bg-green-500',  dotClass: 'bg-green-500'  },
          { label: 'Low Stock',    percent: Math.round((s.low_stock_count / total) * 100),    colorClass: 'bg-orange-500', dotClass: 'bg-orange-500' },
          { label: 'Out of Stock', percent: Math.round((s.out_of_stock_count / total) * 100), colorClass: 'bg-red-500',    dotClass: 'bg-red-500'    },
        ];
      }
    });
  }
}
