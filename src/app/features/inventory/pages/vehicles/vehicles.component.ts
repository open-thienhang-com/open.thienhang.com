import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VehicleService, InventoryService } from '../../services/inventory.service';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, TableModule, InputTextModule, DropdownModule,
    TagModule, CardModule, SkeletonModule, ToastModule,
    PaginatorModule, ConfirmDialogModule, ToolbarModule,
    TooltipModule, BadgeModule
  ],
  templateUrl: './vehicles.component.html',
  providers: [MessageService, ConfirmationService]
})
export class VehiclesComponent implements OnInit {
  vehicles: any[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 0;
  pageSize = 20;

  keyword = '';
  selectedStatus = '';
  selectedWarehouse = '';
  private searchTimer: any;

  // UI State
  viewMode: 'list' | 'card' = 'list';
  showFilters = false;

  stats = { total: 0, active: 0, busy: 0, maintenance: 0 };

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Busy', value: 'busy' },
  ];

  warehouseOptions: { label: string; value: string }[] = [];

  constructor(
    private vehicleService: VehicleService,
    private inventoryService: InventoryService,
    public router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadVehicles();
    this.loadWarehouses();
  }

  loadVehicles(): void {
    this.loading = true;
    const skip = this.currentPage * this.pageSize;
    this.vehicleService.listVehicles(
      skip,
      this.pageSize,
      this.selectedStatus || undefined,
      this.selectedWarehouse || undefined,
      this.keyword || undefined
    ).subscribe({
      next: (res: any) => {
        this.vehicles = res.data || [];
        this.totalRecords = res.total || this.vehicles.length;
        this.updateStats();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vehicles' });
      }
    });
  }

  loadWarehouses(): void {
    this.inventoryService.getAllWarehouses().subscribe({
      next: (res: any) => {
        const warehouses = res.data || res || [];
        this.warehouseOptions = warehouses.map((w: any) => ({
          label: w.name || w.location || 'Warehouse',
          value: w.id || w._id
        }));
      },
      error: () => {
        // Silently fail — warehouse filter simply won't be populated
      }
    });
  }

  updateStats(): void {
    this.stats.total = this.totalRecords;
    this.stats.active = this.vehicles.filter(v => v.status === 'active').length;
    this.stats.busy = this.vehicles.filter(v => v.status === 'busy').length;
    this.stats.maintenance = this.vehicles.filter(v => v.status === 'maintenance').length;
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadVehicles();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadVehicles();
  }

  onStatusFilter(): void {
    this.currentPage = 0;
    this.loadVehicles();
  }

  onWarehouseFilter(): void {
    this.currentPage = 0;
    this.loadVehicles();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  refreshData(): void {
    this.loadVehicles();
  }

  applyFilters(): void {
    this.onSearch();
  }

  clearFilters(): void {
    this.keyword = '';
    this.selectedStatus = '';
    this.selectedWarehouse = '';
    this.onSearch();
  }

  viewVehicle(v: any): void {
    this.router.navigate(['/inventory/fleet', v._id || v.id]);
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'danger';
      case 'busy': return 'info';
      default: return 'secondary';
    }
  }
}
