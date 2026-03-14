import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Truck, TruckService } from '../../services/truck.service';

type TruckForm = Omit<Truck, '_id' | 'created_at' | 'updated_at'>;

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fleet.component.html',
  styleUrl: './fleet.component.css',
})
export class FleetComponent implements OnInit {
  trucks: Truck[] = [];
  total = 0;
  loading = false;
  saving = false;
  detailLoading = false;
  error: string | null = null;
  createDialogVisible = false;
  detailDialogVisible = false;
  selectedTruck: Truck | null = null;
  searchTerm = '';

  form: TruckForm = this.createEmptyForm();

  constructor(
    private truckService: TruckService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrucks();
  }

  get pageTitle(): string {
    return this.isForecastRoute ? 'Truck Forecast Workspace' : 'Fleet Management';
  }

  get pageSubtitle(): string {
    return this.isForecastRoute
      ? 'Review truck inventory, driver assignments, and carrying capacity used for forecast planning.'
      : 'Manage retail trucks, driver assignments, and capacity in one operational workspace.';
  }

  get isForecastRoute(): boolean {
    return this.router.url.includes('/planning/forecast/truck');
  }

  get filteredTrucks(): Truck[] {
    const keyword = this.searchTerm.trim().toLowerCase();
    if (!keyword) {
      return this.trucks;
    }

    return this.trucks.filter((truck) =>
      [
        truck.vehicle_code,
        truck.license_plate,
        truck.vehicle_type,
        truck.status,
        truck.warehouse_id,
        truck.driver_name,
        truck.driver_phone
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }

  get activeTruckCount(): number {
    return this.trucks.filter((truck) => truck.is_active).length;
  }

  get totalWeightCapacity(): number {
    return this.trucks.reduce((sum, truck) => sum + Number(truck.max_weight || 0), 0);
  }

  get totalVolumeCapacity(): number {
    return this.trucks.reduce((sum, truck) => sum + Number(truck.max_volume || 0), 0);
  }

  loadTrucks(): void {
    this.loading = true;
    this.error = null;

    this.truckService.listTrucks(0, 20).subscribe({
      next: (response) => {
        this.trucks = Array.isArray(response?.data) ? response.data : [];
        this.total = Number(response?.total || this.trucks.length);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.trucks = [];
        this.total = 0;
        this.error = error?.error?.message || error?.message || 'Failed to load trucks';
      }
    });
  }

  openCreateDialog(): void {
    this.form = this.createEmptyForm();
    this.createDialogVisible = true;
  }

  closeCreateDialog(): void {
    this.createDialogVisible = false;
    this.saving = false;
    this.form = this.createEmptyForm();
  }

  saveTruck(): void {
    if (!this.form.vehicle_code || !this.form.license_plate || !this.form.vehicle_type || !this.form.warehouse_id) {
      this.error = 'Vehicle code, license plate, vehicle type, and warehouse ID are required.';
      return;
    }

    this.saving = true;
    this.error = null;

    this.truckService.createTruck(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.createDialogVisible = false;
        this.form = this.createEmptyForm();
        this.loadTrucks();
      },
      error: (error) => {
        this.saving = false;
        this.error = error?.error?.message || error?.message || 'Failed to create truck';
      }
    });
  }

  openTruckDetail(truck: Truck): void {
    this.detailDialogVisible = true;
    this.detailLoading = true;
    this.selectedTruck = null;

    this.truckService.getTruck(truck._id).subscribe({
      next: (response) => {
        this.selectedTruck = response?.data || truck;
        this.detailLoading = false;
      },
      error: () => {
        this.selectedTruck = truck;
        this.detailLoading = false;
      }
    });
  }

  closeTruckDetail(): void {
    this.detailDialogVisible = false;
    this.detailLoading = false;
    this.selectedTruck = null;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(Number(value || 0));
  }

  formatDate(value?: string): string {
    return value ? new Date(value).toLocaleString('en-GB') : '-';
  }

  getStatusClass(status: string, isActive: boolean): string {
    if (!isActive) {
      return 'fleet-status fleet-status--inactive';
    }
    return status === 'active' ? 'fleet-status fleet-status--active' : 'fleet-status fleet-status--idle';
  }

  private createEmptyForm(): TruckForm {
    return {
      vehicle_code: '',
      license_plate: '',
      vehicle_type: '',
      status: 'active',
      warehouse_id: '',
      driver_name: '',
      driver_phone: '',
      max_weight: 0,
      max_volume: 0,
      is_active: true
    };
  }
}
