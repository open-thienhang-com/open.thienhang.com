import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { AnalyticsService } from '../../services/inventory.service';
import { AnalyticsData, AnalyticsProduct, StockAlert, AlertSeverity } from '../../models/inventory.models';

@Component({
  selector: 'app-inventory-analytics',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    Button, TableModule, TagModule, TooltipModule,
    InputTextModule, ProgressBarModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  analyticsData: AnalyticsData | null = null;
  loading = true;
  isTableLoading = false;
  searchTerm = '';

  stats = [
    { label: 'Total Products',   value: '—', sub: 'SKUs tracked',       icon: 'pi pi-box',                  color: 'bg-blue-100',   iconColor: 'text-blue-600'   },
    { label: 'Total Stock Value', value: '—', sub: 'Selling value',      icon: 'pi pi-dollar',               color: 'bg-green-100',  iconColor: 'text-green-600'  },
    { label: 'Low Stock Items',   value: '—', sub: 'Need reorder',       icon: 'pi pi-exclamation-triangle', color: 'bg-orange-100', iconColor: 'text-orange-600' },
    { label: 'Out of Stock',      value: '—', sub: 'Critical items',     icon: 'pi pi-times-circle',         color: 'bg-red-100',    iconColor: 'text-red-600'    },
  ];

  get products(): AnalyticsProduct[] {
    return this.analyticsData?.data || [];
  }

  get alerts(): StockAlert[] {
    return this.analyticsData?.alerts || [];
  }

  get filteredProducts(): AnalyticsProduct[] {
    if (!this.searchTerm.trim()) return this.products;
    const q = this.searchTerm.toLowerCase();
    return this.products.filter(p =>
      p.product_name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.isTableLoading = true;
    this.analyticsService.getInventoryAnalytics().subscribe({
      next: (resp) => {
        if (resp.success && resp.data) {
          this.analyticsData = resp.data;
          const s = resp.data.summary;
          this.stats = [
            { label: 'Total Products',   value: s.total_products.toLocaleString(),   sub: 'SKUs tracked',
              icon: 'pi pi-box',                  color: 'bg-blue-100',   iconColor: 'text-blue-600'   },
            { label: 'Total Stock Value',
              value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(s.total_selling_value),
              sub: 'Selling value',
              icon: 'pi pi-dollar',               color: 'bg-green-100',  iconColor: 'text-green-600'  },
            { label: 'Low Stock Items',  value: s.low_stock_count.toLocaleString(),  sub: 'Need reorder',
              icon: 'pi pi-exclamation-triangle', color: 'bg-orange-100', iconColor: 'text-orange-600' },
            { label: 'Out of Stock',     value: s.out_of_stock_count.toLocaleString(), sub: 'Critical items',
              icon: 'pi pi-times-circle',         color: 'bg-red-100',    iconColor: 'text-red-600'    },
          ];
        }
        this.loading = false;
        this.isTableLoading = false;
      },
      error: () => {
        this.loading = false;
        this.isTableLoading = false;
      }
    });
  }

  getAlertSeverityTag(severity: string): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'danger';
      case AlertSeverity.WARNING:  return 'warning';
      default:                     return 'info';
    }
  }

  getAlertSeverityLabel(severity: string): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'Critical';
      case AlertSeverity.WARNING:  return 'Warning';
      default:                     return 'Info';
    }
  }

  getAlertTypeLabel(type: string): string {
    switch (type) {
      case 'low_stock':   return 'Low Stock';
      case 'out_of_stock':return 'Out of Stock';
      case 'overstock':   return 'Overstock';
      case 'expired':     return 'Expired';
      default:            return type;
    }
  }

  getMarginClass(margin: number): string {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 15) return 'text-orange-600';
    return 'text-red-600';
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
