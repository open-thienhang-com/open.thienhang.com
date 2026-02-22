import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { WarehouseService } from '../../../services/retail.service';

interface WarehouseItem {
  id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  country: string;
  totalCapacity: number;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    ToastModule,
    BadgeModule
  ],
  templateUrl: './locations.component.html',
  providers: [MessageService]
})
export class LocationsComponent implements OnInit {
  locations: WarehouseItem[] = [];
  filteredLocations: WarehouseItem[] = [];

  searchTerm = '';
  selectedStatus = '';

  loading = false;
  saving = false;
  showLocationDialog = false;
  dialogMode: 'create' | 'view' = 'create';

  editingLocation: WarehouseItem | null = null;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  dialogStatusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private messageService: MessageService,
    private warehouseService: WarehouseService
  ) { }

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.loading = true;
    this.warehouseService.listWarehouses(0, 50).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp?.data) ? resp.data : [];
        this.locations = data.map((item: any) => this.mapWarehouse(item));
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.locations = [];
        this.filteredLocations = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load warehouses'
        });
      }
    });
  }

  applyFilters() {
    const keyword = this.searchTerm.trim().toLowerCase();
    this.filteredLocations = this.locations.filter((location) => {
      const matchesSearch = !keyword
        || location.name.toLowerCase().includes(keyword)
        || location.location.toLowerCase().includes(keyword)
        || location.address.toLowerCase().includes(keyword)
        || location.city.toLowerCase().includes(keyword)
        || location.country.toLowerCase().includes(keyword);

      const statusKey = location.isActive ? 'active' : 'inactive';
      const matchesStatus = !this.selectedStatus || statusKey === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  createLocation() {
    this.dialogMode = 'create';
    this.editingLocation = {
      id: '',
      name: '',
      location: '',
      address: '',
      city: '',
      country: '',
      totalCapacity: 0,
      isActive: true,
      createdAt: null,
      updatedAt: null
    };
    this.showLocationDialog = true;
  }

  viewLocation(location: WarehouseItem) {
    this.dialogMode = 'view';
    this.saving = true;
    this.warehouseService.getWarehouse(location.id).subscribe({
      next: (resp: any) => {
        this.editingLocation = this.mapWarehouse(resp?.data || location);
        this.showLocationDialog = true;
        this.saving = false;
      },
      error: () => {
        this.editingLocation = { ...location };
        this.showLocationDialog = true;
        this.saving = false;
      }
    });
  }

  saveLocation() {
    if (!this.editingLocation || this.dialogMode !== 'create') {
      this.showLocationDialog = false;
      return;
    }

    const payload = {
      name: this.editingLocation.name.trim(),
      location: this.editingLocation.location.trim(),
      address: this.editingLocation.address.trim(),
      city: this.editingLocation.city.trim(),
      country: this.editingLocation.country.trim(),
      total_capacity: Number(this.editingLocation.totalCapacity || 0),
      is_active: this.editingLocation.isActive
    };

    if (!payload.name || !payload.location || !payload.address || !payload.city || !payload.country) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name, location, address, city, and country are required.'
      });
      return;
    }

    this.saving = true;
    this.warehouseService.createWarehouse(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showLocationDialog = false;
        this.editingLocation = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Warehouse created successfully'
        });
        this.loadLocations();
      },
      error: (err: any) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Create Failed',
          detail: err?.error?.message || 'Failed to create warehouse'
        });
      }
    });
  }

  cancelEdit() {
    this.showLocationDialog = false;
    this.editingLocation = null;
  }

  getActiveLocationsCount(): number {
    return this.locations.filter(loc => loc.isActive).length;
  }

  getTotalCapacity(): number {
    return this.locations.reduce((total, loc) => total + loc.totalCapacity, 0);
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'active' : 'inactive';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value || 0);
  }

  exportLocations() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Export functionality will be implemented'
    });
  }

  refreshData() {
    this.loadLocations();
    this.messageService.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: 'Data refreshed successfully'
    });
  }

  private mapWarehouse(raw: any): WarehouseItem {
    return {
      id: String(raw?._id || raw?.id || ''),
      name: String(raw?.name || ''),
      location: String(raw?.location || ''),
      address: String(raw?.address || ''),
      city: String(raw?.city || ''),
      country: String(raw?.country || ''),
      totalCapacity: Number(raw?.total_capacity || 0),
      isActive: raw?.is_active !== false,
      createdAt: raw?.created_at ? new Date(raw.created_at) : null,
      updatedAt: raw?.updated_at ? new Date(raw.updated_at) : null
    };
  }
}
