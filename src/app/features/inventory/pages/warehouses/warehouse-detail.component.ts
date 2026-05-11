import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WarehouseService, InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ButtonModule, CardModule, TagModule, TableModule,
    ProgressBarModule, SkeletonModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="warehouse-detail-page">
      <p-toast></p-toast>

      <!-- Back nav -->
      <div class="breadcrumb">
        <button pButton label="← Warehouses" class="p-button-text p-button-sm"
                (click)="router.navigate(['/inventory/warehouses'])"></button>
      </div>

      @if (loading) {
        <div class="skeleton-layout">
          <p-skeleton height="200px" borderRadius="16px"></p-skeleton>
          <p-skeleton height="300px" borderRadius="16px" styleClass="mt-4"></p-skeleton>
        </div>
      }

      @if (!loading && warehouse) {
        <!-- Info card -->
        <div class="info-card">
          <div class="info-header">
            <div>
              <h1 class="wh-title">{{ warehouse.warehouse_name || warehouse.name }}</h1>
              <p class="wh-type">{{ warehouse.warehouse_type || 'Standard Warehouse' }}</p>
            </div>
            <p-tag [value]="warehouse.is_enabled !== false ? 'Active' : 'Disabled'"
                   [severity]="warehouse.is_enabled !== false ? 'success' : 'danger'"
                   styleClass="status-tag"></p-tag>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label"><i class="pi pi-map-marker"></i> Address</span>
              <span class="info-value">{{ warehouse.warehouse_address || warehouse.address || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="pi pi-globe"></i> Province</span>
              <span class="info-value">{{ warehouse.province_name || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="pi pi-map"></i> Region</span>
              <span class="info-value">{{ warehouse.region_fullname || warehouse.region_shortname || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label"><i class="pi pi-tag"></i> Warehouse ID</span>
              <span class="info-value mono">{{ warehouse.warehouse_id || warehouse._id }}</span>
            </div>
          </div>

          <!-- Capacity bar (if capacity data available) -->
          @if (capacity) {
            <div class="capacity-section">
              <h3>Capacity Utilization</h3>
              <div class="capacity-bar-wrap">
                <p-progressBar [value]="capacity.volume_utilization_pct || 0"
                               [showValue]="true"></p-progressBar>
                <span class="capacity-label">Volume: {{ capacity.volume_utilization_pct || 0 }}%</span>
              </div>
            </div>
          }
        </div>

        <!-- Stocks table -->
        <div class="stocks-section">
          <h2 class="section-title"><i class="pi pi-box"></i> Stock in this Warehouse</h2>

          @if (stocksLoading) {
            <p-skeleton height="200px" borderRadius="12px"></p-skeleton>
          }

          @if (!stocksLoading && stocks.length > 0) {
            <p-table [value]="stocks" [paginator]="true" [rows]="10"
                     styleClass="p-datatable-sm" [rowHover]="true">
              <ng-template pTemplate="header">
                <tr>
                  <th>Product ID</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Bin Location</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-s>
                <tr>
                  <td class="mono">{{ s.product_id }}</td>
                  <td>{{ s.quantity_on_hand ?? '—' }}</td>
                  <td>{{ s.quantity_reserved ?? 0 }}</td>
                  <td>
                    <span [class]="s.quantity_available <= 0 ? 'qty-danger' : (s.quantity_available <= 10 ? 'qty-warning' : 'qty-ok')">
                      {{ s.quantity_available ?? '—' }}
                    </span>
                  </td>
                  <td>{{ s.bin_location || '—' }}</td>
                </tr>
              </ng-template>
            </p-table>
          }

          @if (!stocksLoading && stocks.length === 0) {
            <div class="empty-stocks">
              <i class="pi pi-inbox"></i>
              <p>No stock records for this warehouse.</p>
            </div>
          }
        </div>
      }

      @if (!loading && !warehouse) {
        <div class="not-found">
          <i class="pi pi-exclamation-triangle"></i>
          <h2>Warehouse not found</h2>
          <button pButton label="Back to Warehouses"
                  (click)="router.navigate(['/inventory/warehouses'])"></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .warehouse-detail-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .breadcrumb { margin-bottom: 16px; }
    .info-card { background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 1px 12px rgba(0,0,0,.07); margin-bottom: 24px; }
    .info-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .wh-title { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; }
    .wh-type { color: #64748b; margin: 4px 0 0; }
    .status-tag { font-size: 0.875rem; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 0.75rem; color: #94a3b8; font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .info-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; }
    .mono { font-family: monospace; font-size: 0.85rem; }
    .capacity-section { margin-top: 24px; }
    .capacity-bar-wrap { display: flex; flex-direction: column; gap: 8px; }
    .capacity-label { font-size: 0.85rem; color: #64748b; }
    .stocks-section { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 12px rgba(0,0,0,.07); }
    .section-title { font-size: 1.1rem; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .qty-ok { color: #22c55e; font-weight: 600; }
    .qty-warning { color: #f59e0b; font-weight: 600; }
    .qty-danger { color: #ef4444; font-weight: 600; }
    .empty-stocks { text-align: center; padding: 40px; color: #94a3b8; }
    .empty-stocks i { font-size: 2.5rem; display: block; margin-bottom: 12px; }
    .not-found { text-align: center; padding: 80px 24px; }
    .not-found i { font-size: 4rem; color: #f59e0b; display: block; margin-bottom: 16px; }
  `]
})
export class WarehouseDetailComponent implements OnInit {
  warehouse: any = null;
  capacity: any = null;
  stocks: any[] = [];
  loading = false;
  stocksLoading = false;

  constructor(
    private warehouseService: WarehouseService,
    private inventoryService: InventoryService,
    public router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadWarehouse(id);
      this.loadStocks(id);
    }
  }

  loadWarehouse(id: string) {
    this.loading = true;
    this.warehouseService.getWarehouse(id).subscribe({
      next: (res: any) => {
        this.warehouse = res.data || res;
        this.loading = false;
        // Try capacity (non-blocking)
        this.inventoryService.getWarehouseCapacity(id).subscribe({
          next: (cap: any) => { this.capacity = cap.data || cap; },
          error: () => {} // Capacity is optional
        });
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load warehouse' });
      }
    });
  }

  loadStocks(id: string) {
    this.stocksLoading = true;
    this.inventoryService.getWarehouseStocks(id).subscribe({
      next: (res: any) => {
        this.stocks = res.data || [];
        this.stocksLoading = false;
      },
      error: () => { this.stocksLoading = false; }
    });
  }
}
