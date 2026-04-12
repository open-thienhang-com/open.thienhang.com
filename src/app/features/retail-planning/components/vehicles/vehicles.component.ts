import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Vehicle, VehicleCreateRequest } from '../../models/vehicle.model';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    BadgeModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    AutoCompleteModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  searchTerm = '';
  selectedStatus: string | null = null;
  loading = false;
  showFilters = false;

  // Warehouse Search
  suggestedWarehouses: any[] = [];
  selectedWarehouse: any = null;

  showVehicleDialog = false;
  editingVehicle: Vehicle | null = null;

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  vehicleTypeOptions = [
    { label: 'Truck', value: 'truck' },
    { label: 'Van', value: 'van' },
    { label: 'Motorbike', value: 'motorbike' },
    { label: 'Refrigerated', value: 'refrigerated' }
  ];

  constructor(
    private vehicleService: VehicleService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.listVehicles(0, 100).subscribe({
      next: (res) => {
        this.vehicles = res.data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vehicles'
        });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredVehicles = this.vehicles.filter(v => {
      const matchesSearch = !term || 
        v.vehicle_code.toLowerCase().includes(term) ||
        v.license_plate.toLowerCase().includes(term) ||
        v.driver_name?.toLowerCase().includes(term);
      
      const matchesStatus = !this.selectedStatus || v.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.applyFilters();
  }

  getStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'info';
    }
  }

  createVehicle(): void {
    this.editingVehicle = this.createEmptyVehicle();
    this.selectedWarehouse = null;
    this.showVehicleDialog = true;
  }

  editVehicle(vehicle: Vehicle): void {
    this.editingVehicle = { ...vehicle };
    this.selectedWarehouse = vehicle.warehouse_id;
    this.showVehicleDialog = true;
  }

  saveVehicle(): void {
    if (!this.editingVehicle) return;

    if (!this.editingVehicle.vehicle_code || !this.editingVehicle.license_plate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Code and License Plate are required'
      });
      return;
    }

    if (this.editingVehicle._id) {
      this.vehicleService.updateVehicle(this.editingVehicle._id, this.editingVehicle).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Vehicle updated' });
          this.showVehicleDialog = false;
          this.loadVehicles();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' })
      });
    } else {
      const payload: VehicleCreateRequest = { ...this.editingVehicle };
      delete (payload as any)._id;
      
      this.vehicleService.createVehicle(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Vehicle created' });
          this.showVehicleDialog = false;
          this.loadVehicles();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Creation failed' })
      });
    }
  }

  deleteVehicle(event: Event, vehicle: Vehicle): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete vehicle ${vehicle.license_plate}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.vehicleService.deleteVehicle(vehicle._id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Vehicle deleted' });
            this.loadVehicles();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
        });
      }
    });
  }

  searchWarehouses(event: any): void {
    const query = event.query;
    this.vehicleService.searchWarehouses(query).subscribe({
      next: (res) => {
        this.suggestedWarehouses = res.data || [];
      }
    });
  }

  onWarehouseSelect(event: any): void {
    if (this.editingVehicle && event.value) {
      this.editingVehicle.warehouse_id = String(event.value.warehouse_id || event.value._id);
    }
  }

  refreshData(): void {
    this.loadVehicles();
  }

  getTotalVehicles(): number {
    return this.vehicles.length;
  }

  getActiveVehicles(): number {
    return this.vehicles.filter(v => v.status === 'active' || v.is_active).length;
  }

  getTotalPayload(): number {
    return this.vehicles.reduce((sum, v) => sum + (v.max_weight || 0), 0);
  }

  private createEmptyVehicle(): Vehicle {
    return {
      _id: '',
      vehicle_code: '',
      license_plate: '',
      vehicle_type: 'truck',
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
