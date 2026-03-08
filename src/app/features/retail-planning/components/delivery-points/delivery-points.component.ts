import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
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
import { WarehouseService } from '../../../retail/services/retail.service';

interface DeliveryPointItem {
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
  selector: 'app-delivery-points',
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
  templateUrl: './delivery-points.component.html',
  styleUrl: './delivery-points.component.css',
  providers: [MessageService]
})
export class DeliveryPointsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('deliveryPointsMap', { static: false }) mapContainerRef!: ElementRef<HTMLDivElement>;

  deliveryPoints: DeliveryPointItem[] = [];
  filteredDeliveryPoints: DeliveryPointItem[] = [];
  selectedDeliveryPoint: DeliveryPointItem | null = null;

  searchTerm = '';
  selectedStatus = '';

  loading = false;
  saving = false;
  showDeliveryPointDialog = false;
  dialogMode: 'create' | 'view' = 'create';

  editingDeliveryPoint: DeliveryPointItem | null = null;

  map: any = null;
  selectedMarker: any = null;
  mapLoaded = false;
  private readonly VIETNAM_CENTER: [number, number] = [16.5, 106.0];
  private readonly DEFAULT_ZOOM = 6;

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
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.loadDeliveryPoints();
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
    await this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  loadDeliveryPoints(): void {
    this.loading = true;
    this.warehouseService.listWarehouses(0, 50).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp?.data) ? resp.data : [];
        this.deliveryPoints = data.map((item: any) => this.mapWarehouse(item));
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.deliveryPoints = [];
        this.filteredDeliveryPoints = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load delivery points'
        });
      }
    });
  }

  applyFilters(): void {
    const keyword = this.searchTerm.trim().toLowerCase();
    this.filteredDeliveryPoints = this.deliveryPoints.filter((item) => {
      const matchesSearch = !keyword
        || item.name.toLowerCase().includes(keyword)
        || item.location.toLowerCase().includes(keyword)
        || item.address.toLowerCase().includes(keyword)
        || item.district.toLowerCase().includes(keyword)
        || item.city.toLowerCase().includes(keyword)
        || item.region.toLowerCase().includes(keyword)
        || item.type.toLowerCase().includes(keyword)
        || String(item.warehouseId || '').includes(keyword);

      const statusKey = item.isActive ? 'active' : 'inactive';
      const matchesStatus = !this.selectedStatus || statusKey === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  async focusDeliveryPoint(item: DeliveryPointItem): Promise<void> {
    this.selectedDeliveryPoint = item;
    await this.renderSelectedPointOnMap(item);
  }

  createDeliveryPoint(): void {
    this.dialogMode = 'create';
    this.editingDeliveryPoint = {
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
    this.showDeliveryPointDialog = true;
  }

  viewDeliveryPoint(item: DeliveryPointItem): void {
    this.dialogMode = 'view';
    this.saving = true;
    this.warehouseService.getWarehouse(item.id).subscribe({
      next: async (resp: any) => {
        this.editingDeliveryPoint = this.mapWarehouse(resp?.data || item);
        this.showDeliveryPointDialog = true;
        this.saving = false;
        await this.focusDeliveryPoint(this.editingDeliveryPoint);
      },
      error: async () => {
        this.editingDeliveryPoint = { ...item };
        this.showDeliveryPointDialog = true;
        this.saving = false;
        await this.focusDeliveryPoint(item);
      }
    });
  }

  saveDeliveryPoint(): void {
    if (!this.editingDeliveryPoint || this.dialogMode !== 'create') {
      this.showDeliveryPointDialog = false;
      return;
    }

    const payload = {
      warehouse_name: this.editingDeliveryPoint.name.trim(),
      warehouse_address: this.editingDeliveryPoint.address.trim(),
      province_name: this.editingDeliveryPoint.city.trim(),
      district_name: this.editingDeliveryPoint.district.trim(),
      region_shortname: this.editingDeliveryPoint.location.trim() || this.editingDeliveryPoint.region.trim(),
      warehouse_type: this.editingDeliveryPoint.type.trim() || null,
      ward_code: this.editingDeliveryPoint.wardCode.trim() || null,
      latitude: this.editingDeliveryPoint.latitude,
      longitude: this.editingDeliveryPoint.longitude,
      name: this.editingDeliveryPoint.name.trim(),
      location: this.editingDeliveryPoint.location.trim(),
      address: this.editingDeliveryPoint.address.trim(),
      city: this.editingDeliveryPoint.city.trim(),
      country: this.editingDeliveryPoint.region.trim(),
      total_capacity: Number(this.editingDeliveryPoint.totalCapacity || 0),
      is_active: this.editingDeliveryPoint.isActive,
      is_enabled: this.editingDeliveryPoint.isActive
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
        this.showDeliveryPointDialog = false;
        this.editingDeliveryPoint = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Delivery point created successfully'
        });
        this.loadDeliveryPoints();
      },
      error: (err: any) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Create Failed',
          detail: err?.error?.message || 'Failed to create delivery point'
        });
      }
    });
  }

  cancelEdit(): void {
    this.showDeliveryPointDialog = false;
    this.editingDeliveryPoint = null;
  }

  getActiveDeliveryPointsCount(): number {
    return this.deliveryPoints.filter((item) => item.isActive).length;
  }

  getTotalCapacity(): number {
    return this.deliveryPoints.reduce((total, item) => total + item.totalCapacity, 0);
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

  hasValidCoordinates(item: DeliveryPointItem | null): boolean {
    return !!item && item.latitude != null && item.longitude != null && !isNaN(item.latitude) && !isNaN(item.longitude);
  }

  private async initMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.mapContainerRef?.nativeElement || this.map) return;

    try {
      const L = await import('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        iconUrl: 'assets/leaflet/marker-icon.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png'
      });

      this.map = L.map(this.mapContainerRef.nativeElement, {
        zoomControl: true,
        attributionControl: true
      }).setView(this.VIETNAM_CENTER, this.DEFAULT_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.mapLoaded = true;
      this.cdr.detectChanges();
      setTimeout(() => this.map?.invalidateSize(), 0);
    } catch (error) {
      console.error('[DeliveryPoints] Failed to initialize map', error);
    }
  }

  private async renderSelectedPointOnMap(item: DeliveryPointItem): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.map) {
      await this.initMap();
    }
    if (!this.map) return;

    const lat = item.latitude;
    const lng = item.longitude;

    if (this.selectedMarker) {
      this.map.removeLayer(this.selectedMarker);
      this.selectedMarker = null;
    }

    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Coordinates',
        detail: `Delivery point "${item.name}" does not have valid coordinates.`
      });
      this.map.setView(this.VIETNAM_CENTER, this.DEFAULT_ZOOM);
      return;
    }

    const L = await import('leaflet');
    this.selectedMarker = L.marker([lat, lng]).addTo(this.map);
    this.selectedMarker.bindPopup(`
      <div style="min-width: 220px;">
        <div style="font-weight: 700; margin-bottom: 6px;">${item.name}</div>
        <div><strong>Region:</strong> ${item.location || '-'}</div>
        <div><strong>Province:</strong> ${item.city || '-'}</div>
        <div><strong>District:</strong> ${item.district || '-'}</div>
        <div><strong>Address:</strong> ${item.address || '-'}</div>
      </div>
    `);
    this.selectedMarker.openPopup();
    this.map.setView([lat, lng], 15);
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private mapWarehouse(raw: any): DeliveryPointItem {
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
}
