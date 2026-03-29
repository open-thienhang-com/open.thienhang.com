import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { WarehouseService } from '../../services/inventory.service';

interface WarehouseItem {
  id: string;
  warehouseId: number | null;
  name: string;
  location: string;
  address: string;
  district: string;
  city: string;
  region: string;
  type: string;
  wardCode: string;
  latitude: number | null;
  longitude: number | null;
  totalCapacity: number;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Component({
  selector: 'app-warehouses',
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
  templateUrl: './warehouses.component.html',
  providers: [MessageService]
})
export class WarehousesComponent implements OnInit {
  @ViewChild('locationDetailMap', { static: false }) locationDetailMapRef?: ElementRef<HTMLDivElement>;

  locations: WarehouseItem[] = [];
  filteredLocations: WarehouseItem[] = [];

  searchTerm = '';
  selectedStatus = '';

  loading = false;
  saving = false;
  showLocationDialog = false;
  dialogMode: 'create' | 'view' = 'create';

  editingLocation: WarehouseItem | null = null;
  detailMap: any = null;
  detailMarker: any = null;

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
    @Inject(PLATFORM_ID) private platformId: Object,
    private messageService: MessageService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  ngOnDestroy() {
    this.destroyLocationDetailMap();
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
        || location.district.toLowerCase().includes(keyword)
        || location.city.toLowerCase().includes(keyword)
        || location.region.toLowerCase().includes(keyword)
        || location.type.toLowerCase().includes(keyword)
        || String(location.warehouseId || '').includes(keyword);

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
      warehouseId: null,
      name: '',
      location: '',
      address: '',
      district: '',
      city: '',
      region: '',
      type: '',
      wardCode: '',
      latitude: null,
      longitude: null,
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
      warehouse_name: this.editingLocation.name.trim(),
      warehouse_address: this.editingLocation.address.trim(),
      province_name: this.editingLocation.city.trim(),
      district_name: this.editingLocation.district.trim(),
      region_shortname: this.editingLocation.location.trim() || this.editingLocation.region.trim(),
      warehouse_type: this.editingLocation.type.trim() || null,
      ward_code: this.editingLocation.wardCode.trim() || null,
      latitude: this.editingLocation.latitude,
      longitude: this.editingLocation.longitude,
      name: this.editingLocation.name.trim(),
      location: this.editingLocation.location.trim(),
      address: this.editingLocation.address.trim(),
      city: this.editingLocation.city.trim(),
      country: this.editingLocation.region.trim(),
      total_capacity: Number(this.editingLocation.totalCapacity || 0),
      is_active: this.editingLocation.isActive,
      is_enabled: this.editingLocation.isActive
    };

    if (!payload.warehouse_name || !payload.warehouse_address || !payload.province_name || !payload.district_name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Warehouse name, address, province, and district are required.'
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
    this.destroyLocationDetailMap();
    this.showLocationDialog = false;
    this.editingLocation = null;
  }

  hasValidCoordinates(location: WarehouseItem | null): boolean {
    return !!location
      && location.latitude != null
      && location.longitude != null
      && !Number.isNaN(location.latitude)
      && !Number.isNaN(location.longitude);
  }

  async onLocationDialogShow() {
    if (this.dialogMode !== 'view' || !this.hasValidCoordinates(this.editingLocation) || !isPlatformBrowser(this.platformId)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    await this.renderLocationDetailMap();
  }

  onLocationDialogHide() {
    this.destroyLocationDetailMap();
  }

  getActiveLocationsCount(): number {
    return this.locations.filter((loc) => loc.isActive).length;
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

  formatCoordinate(value: number | null): string {
    return value == null ? '-' : value.toFixed(6);
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
      warehouseId: raw?.warehouse_id != null ? Number(raw.warehouse_id) : null,
      name: String(raw?.warehouse_name || raw?.name || ''),
      location: String(raw?.region_shortname || raw?.location || ''),
      address: String(raw?.warehouse_address || raw?.address || ''),
      district: String(raw?.district_name || ''),
      city: String(raw?.province_name || raw?.city || ''),
      region: String(raw?.region_fullname || raw?.country || ''),
      type: String(raw?.warehouse_type || ''),
      wardCode: String(raw?.ward_code || ''),
      latitude: raw?.latitude != null ? Number(raw.latitude) : null,
      longitude: raw?.longitude != null ? Number(raw.longitude) : null,
      totalCapacity: Number(raw?.total_capacity || 0),
      isActive: raw?.is_enabled ?? raw?.is_active ?? true,
      createdAt: raw?.created_at ? new Date(raw.created_at) : null,
      updatedAt: raw?.last_updated_time
        ? new Date(raw.last_updated_time)
        : raw?.updated_at
          ? new Date(raw.updated_at)
          : null
    };
  }

  private async renderLocationDetailMap() {
    if (!this.locationDetailMapRef?.nativeElement || !this.editingLocation || !this.hasValidCoordinates(this.editingLocation)) {
      return;
    }

    const L = await import('leaflet');
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png'
    });

    const lat = Number(this.editingLocation.latitude);
    const lng = Number(this.editingLocation.longitude);

    if (!this.detailMap) {
      this.detailMap = L.map(this.locationDetailMapRef.nativeElement, {
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.detailMap);
    }

    if (this.detailMarker) {
      this.detailMap.removeLayer(this.detailMarker);
      this.detailMarker = null;
    }

    this.detailMarker = L.marker([lat, lng]).addTo(this.detailMap);
    this.detailMarker.bindPopup(`
      <div style="min-width: 220px;">
        <div style="font-weight: 700; margin-bottom: 6px;">${this.editingLocation.name}</div>
        <div><strong>Region:</strong> ${this.editingLocation.location || '-'}</div>
        <div><strong>Province:</strong> ${this.editingLocation.city || '-'}</div>
        <div><strong>District:</strong> ${this.editingLocation.district || '-'}</div>
      </div>
    `);
    this.detailMarker.openPopup();
    this.detailMap.setView([lat, lng], 15);
    setTimeout(() => this.detailMap?.invalidateSize(), 0);
  }

  private destroyLocationDetailMap() {
    if (this.detailMap) {
      this.detailMap.remove();
      this.detailMap = null;
      this.detailMarker = null;
    }
  }
}
