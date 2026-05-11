import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Truck, TruckPayload, TruckService } from '../../services/truck.service';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './fleet.component.html',
  styleUrl: './fleet.component.css',
})
export class FleetComponent implements OnInit {
  trucks: Truck[] = [];
  filteredTrucks: Truck[] = [];
  total = 0;
  loading = false;
  saving = false;
  showFilters = false;
  showDialog = false;
  editingTruck: Truck | null = null;

  searchTerm = '';
  selectedStatus: string | null = null;
  selectedType: string | null = null;

  form: TruckPayload = this.emptyForm();

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
  ];

  typeOptions = [
    { label: 'All Types', value: null },
    { label: 'Truck', value: 'truck' },
    { label: 'Van', value: 'van' },
    { label: 'Motorbike', value: 'motorbike' },
  ];

  formStatusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
  ];

  constructor(
    private truckService: TruckService,
    private messageService: MessageService,
    private confirmService: ConfirmationService,
  ) {}

  ngOnInit() { this.load(); }

  get activeCount() { return this.trucks.filter(t => t.is_active).length; }
  get inactiveCount() { return this.trucks.filter(t => !t.is_active).length; }
  get totalWeight() { return this.trucks.reduce((s, t) => s + Number(t.max_weight || 0), 0); }
  get totalVolume() { return this.trucks.reduce((s, t) => s + Number(t.max_volume || 0), 0); }

  get dialogTitle() { return this.editingTruck ? 'Edit Truck' : 'Add Truck'; }

  load() {
    this.loading = true;
    this.truckService.listTrucks(0, 100).subscribe({
      next: r => {
        this.trucks = Array.isArray(r?.data) ? r.data : [];
        this.total = Number(r?.total ?? this.trucks.length);
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to load trucks' });
      }
    });
  }

  applyFilters() {
    const kw = this.searchTerm.trim().toLowerCase();
    this.filteredTrucks = this.trucks.filter(t => {
      if (this.selectedStatus && t.status !== this.selectedStatus) return false;
      if (this.selectedType && t.vehicle_type !== this.selectedType) return false;
      if (kw && ![t.vehicle_code, t.license_plate, t.vehicle_type, t.warehouse_id, t.driver_name, t.driver_phone].filter(Boolean).join(' ').toLowerCase().includes(kw)) return false;
      return true;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedType = null;
    this.applyFilters();
  }

  openCreate() {
    this.editingTruck = null;
    this.form = this.emptyForm();
    this.showDialog = true;
  }

  openEdit(truck: Truck) {
    this.editingTruck = truck;
    this.form = {
      vehicle_code: truck.vehicle_code,
      license_plate: truck.license_plate,
      vehicle_type: truck.vehicle_type,
      status: truck.status,
      warehouse_id: truck.warehouse_id,
      driver_name: truck.driver_name,
      driver_phone: truck.driver_phone,
      max_weight: truck.max_weight,
      max_volume: truck.max_volume,
      is_active: truck.is_active,
    };
    this.showDialog = true;
  }

  save() {
    if (!this.form.vehicle_code || !this.form.license_plate || !this.form.vehicle_type || !this.form.warehouse_id) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Vehicle code, license plate, type and warehouse are required.' });
      return;
    }
    this.saving = true;
    const req = this.editingTruck
      ? this.truckService.updateTruck(this.editingTruck._id, this.form)
      : this.truckService.createTruck(this.form);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.showDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: `Truck ${this.editingTruck ? 'updated' : 'created'} successfully.` });
        this.load();
      },
      error: err => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Save failed' });
      }
    });
  }

  confirmDelete(event: Event, truck: Truck) {
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: `Delete truck ${truck.vehicle_code}? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.truckService.deleteTruck(truck._id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Truck removed.' });
            this.load();
          },
          error: err => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Delete failed' })
        });
      }
    });
  }

  statusSeverity(truck: Truck): 'success' | 'warn' | 'danger' | 'secondary' {
    if (!truck.is_active) return 'secondary';
    if (truck.status === 'active') return 'success';
    if (truck.status === 'maintenance') return 'warn';
    return 'danger';
  }

  statusLabel(truck: Truck) {
    return truck.is_active ? truck.status : 'inactive';
  }

  fmt(n: number) { return new Intl.NumberFormat('en-US').format(Number(n || 0)); }
  fmtDate(v?: string) { return v ? new Date(v).toLocaleString('en-GB') : '—'; }

  private emptyForm(): TruckPayload {
    return { vehicle_code: '', license_plate: '', vehicle_type: '', status: 'active', warehouse_id: '', driver_name: '', driver_phone: '', max_weight: 0, max_volume: 0, is_active: true };
  }
}
