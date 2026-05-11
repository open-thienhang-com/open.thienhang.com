import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { WarehouseService } from '../../services/inventory.service';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, TableModule, InputTextModule,
    CardModule, BadgeModule, TagModule, ToastModule, SkeletonModule
  ],
  providers: [MessageService],
  template: `
    <div class="warehouses-page">
      <p-toast></p-toast>

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title"><i class="pi pi-building"></i> Warehouses</h1>
          <span class="page-subtitle">{{ total }} warehouses total</span>
        </div>
        <div class="header-actions">
          <button pButton label="Add Warehouse" icon="pi pi-plus"
                  (click)="router.navigate(['/inventory/warehouses/create'])"></button>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText [(ngModel)]="keyword" placeholder="Search warehouses..."
                 (input)="onSearch()" class="search-input" />
        </span>
        <button pButton icon="pi pi-refresh" class="p-button-outlined" (click)="load()" title="Refresh"></button>
      </div>

      <!-- Skeleton loader -->
      @if (loading) {
        <div class="skeleton-grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton-card">
              <p-skeleton height="120px" borderRadius="12px"></p-skeleton>
            </div>
          }
        </div>
      }

      <!-- Warehouse table -->
      @if (!loading && warehouses.length > 0) {
        <p-table [value]="warehouses" [paginator]="true" [rows]="10"
                 [rowHover]="true" styleClass="p-datatable-sm warehouse-table"
                 [tableStyle]="{'min-width': '60rem'}">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Type</th>
              <th>Region</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-wh>
            <tr>
              <td>
                <div class="wh-name">{{ wh.warehouse_name || wh.name || '—' }}</div>
                <div class="wh-id">ID: {{ wh.warehouse_id || wh._id }}</div>
              </td>
              <td>{{ wh.warehouse_address || wh.address || '—' }}</td>
              <td><p-tag [value]="wh.warehouse_type || 'Standard'" severity="info"></p-tag></td>
              <td>{{ wh.region_shortname || wh.city || wh.country || '—' }}</td>
              <td>
                <p-tag [value]="wh.is_enabled !== false ? 'Active' : 'Disabled'"
                       [severity]="wh.is_enabled !== false ? 'success' : 'danger'"></p-tag>
              </td>
              <td>
                <button pButton icon="pi pi-eye" class="p-button-sm p-button-text"
                        title="View" (click)="viewWarehouse(wh)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }

      <!-- Empty state -->
      @if (!loading && warehouses.length === 0) {
        <div class="empty-state">
          <i class="pi pi-building empty-icon"></i>
          <h3>No warehouses found</h3>
          <p>{{ keyword ? 'Try adjusting your search.' : 'Create your first warehouse to get started.' }}</p>
          <button pButton label="Add Warehouse" icon="pi pi-plus"
                  (click)="router.navigate(['/inventory/warehouses/create'])"></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .warehouses-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 10px; }
    .page-title i { color: #6366f1; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin-top: 4px; display: block; }
    .search-bar { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
    .search-input { width: 320px; }
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .wh-name { font-weight: 600; color: #1e293b; }
    .wh-id { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
    .empty-state { text-align: center; padding: 80px 24px; }
    .empty-icon { font-size: 4rem; color: #cbd5e1; display: block; margin-bottom: 16px; }
    .empty-state h3 { color: #374151; margin-bottom: 8px; }
    .empty-state p { color: #9ca3af; margin-bottom: 24px; }
  `]
})
export class WarehousesComponent implements OnInit {
  warehouses: any[] = [];
  loading = false;
  total = 0;
  keyword = '';
  private searchTimer: any;

  constructor(
    private warehouseService: WarehouseService,
    public router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.warehouseService.listWarehouses(0, 50, this.keyword || undefined).subscribe({
      next: (res: any) => {
        this.warehouses = res.data || [];
        this.total = res.total || this.warehouses.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load warehouses' });
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 400);
  }

  viewWarehouse(wh: any) {
    const id = wh._id || wh.warehouse_id;
    this.router.navigate(['/inventory/warehouses', id]);
  }
}
