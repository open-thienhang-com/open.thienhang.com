import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { InventoryService, AnalyticsService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-overview',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class InventoryOverviewComponent implements OnInit {
  stats = [
    { label: 'Total Products', value: '0', icon: 'pi pi-box', color: 'blue' },
    { label: 'Low Stock Items', value: '0', icon: 'pi pi-exclamation-triangle', color: 'orange' },
    { label: 'Out of Stock', value: '0', icon: 'pi pi-times-circle', color: 'red' },
    { label: 'Total Value', value: '$0', icon: 'pi pi-dollar', color: 'green' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.analyticsService.getInventoryAnalytics().subscribe(resp => {
      if (resp.success && resp.data) {
        const s = resp.data.summary;
        this.stats = [
          { label: 'Total Products', value: s.total_products.toString(), icon: 'pi pi-box', color: 'blue' },
          { label: 'Low Stock Items', value: s.low_stock_count.toString(), icon: 'pi pi-exclamation-triangle', color: 'orange' },
          { label: 'Out of Stock', value: s.out_of_stock_count.toString(), icon: 'pi pi-times-circle', color: 'red' },
          { label: 'Total Value', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(s.total_selling_value), icon: 'pi pi-dollar', color: 'green' }
        ];
      }
    });
  }
}
