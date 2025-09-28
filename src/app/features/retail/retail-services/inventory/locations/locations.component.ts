import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'store' | 'office' | 'external';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  manager?: string;
  capacity: number;
  currentStock: number;
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
  contactPhone?: string;
  operatingHours?: string;
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
    InputTextarea,
    CardModule,
    BadgeModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class LocationsComponent implements OnInit {
  showLocationDialog = false;
  editingLocation: Location | null = null;

  // Filters
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';

  // Data
  locations: Location[] = [];
  filteredLocations: Location[] = [];

  typeOptions = [
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Store', value: 'store' },
    { label: 'Office', value: 'office' },
    { label: 'External', value: 'external' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    // Mock data - replace with actual API call
    this.locations = [
      {
        id: '1',
        name: 'Main Warehouse',
        type: 'warehouse',
        address: '123 Industrial Blvd',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA',
        manager: 'John Smith',
        capacity: 10000,
        currentStock: 7500,
        status: 'active',
        description: 'Primary storage facility',
        contactPhone: '+1-555-0123',
        operatingHours: 'Mon-Fri 8AM-6PM'
      },
      {
        id: '2',
        name: 'Downtown Store',
        type: 'store',
        address: '456 Main Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA',
        manager: 'Sarah Johnson',
        capacity: 2000,
        currentStock: 1800,
        status: 'active',
        description: 'Retail storefront',
        contactPhone: '+1-555-0456',
        operatingHours: 'Mon-Sat 9AM-9PM, Sun 10AM-6PM'
      },
      {
        id: '3',
        name: 'Distribution Center',
        type: 'warehouse',
        address: '789 Logistics Way',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703',
        country: 'USA',
        manager: 'Mike Wilson',
        capacity: 15000,
        currentStock: 12000,
        status: 'maintenance',
        description: 'Secondary distribution facility',
        contactPhone: '+1-555-0789',
        operatingHours: '24/7'
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredLocations = this.locations.filter(location => {
      const matchesSearch = !this.searchTerm ||
        location.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.city.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = !this.selectedType || location.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || location.status === this.selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onTypeChange() {
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  createLocation() {
    this.editingLocation = {
      id: '',
      name: '',
      type: 'warehouse',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      capacity: 0,
      currentStock: 0,
      status: 'active'
    };
    this.showLocationDialog = true;
  }

  editLocation(location: Location) {
    this.editingLocation = { ...location };
    this.showLocationDialog = true;
  }

  saveLocation() {
    if (!this.editingLocation) return;

    if (this.editingLocation.id) {
      // Update existing
      const index = this.locations.findIndex(l => l.id === this.editingLocation!.id);
      if (index !== -1) {
        this.locations[index] = { ...this.editingLocation! };
      }
    } else {
      // Add new
      this.editingLocation.id = Date.now().toString();
      this.locations.unshift({ ...this.editingLocation! });
    }

    this.applyFilters();
    this.showLocationDialog = false;
    this.editingLocation = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Location saved successfully'
    });
  }

  cancelEdit() {
    this.showLocationDialog = false;
    this.editingLocation = null;
  }

  deleteLocation(location: Location) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete location "${location.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.locations = this.locations.filter(l => l.id !== location.id);
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Location deleted successfully'
        });
      }
    });
  }

  getActiveLocationsCount(): number {
    return this.locations.filter(loc => loc.status === 'active').length;
  }

  getMaintenanceLocationsCount(): number {
    return this.locations.filter(loc => loc.status === 'maintenance').length;
  }

  getTotalCapacity(): number {
    return this.locations.reduce((total, loc) => total + loc.capacity, 0);
  }

  getTypeSeverity(type: string): string {
    switch (type) {
      case 'warehouse': return 'info';
      case 'store': return 'success';
      case 'office': return 'warning';
      case 'external': return 'danger';
      default: return 'info';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'info';
    }
  }

  getCapacityUtilization(location: Location): number {
    return location.capacity > 0 ? (location.currentStock / location.capacity) * 100 : 0;
  }

  getCapacityStatus(location: Location): string {
    const utilization = this.getCapacityUtilization(location);
    if (utilization >= 90) return 'critical';
    if (utilization >= 75) return 'high';
    if (utilization >= 50) return 'medium';
    return 'low';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  exportLocations() {
    // Implement export functionality
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
}
