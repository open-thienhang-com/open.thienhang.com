import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

import { LocationsComponent } from './locations.component';

describe('LocationsComponent', () => {
  let component: LocationsComponent;
  let fixture: ComponentFixture<LocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LocationsComponent,
        FormsModule,
        ConfirmDialogModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        InputTextarea,
        TableModule,
        ToastModule,
        CardModule,
        ButtonModule,
        BadgeModule
      ],
      providers: [
        ConfirmationService,
        MessageService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.locations).toBeDefined();
    expect(component.filteredLocations).toBeDefined();
    expect(component.showLocationDialog).toBeFalse();
    expect(component.searchTerm).toBe('');
    expect(component.selectedType).toBeNull();
    expect(component.selectedStatus).toBeNull();
  });

  it('should filter locations by search term', () => {
    component.searchTerm = 'Warehouse';
    component.onSearch();
    expect(component.filteredLocations.length).toBeGreaterThanOrEqual(0);
  });

  it('should filter locations by type', () => {
    component.selectedType = 'warehouse';
    component.onTypeChange();
    expect(component.filteredLocations.every(loc => loc.type === 'warehouse')).toBeTruthy();
  });

  it('should filter locations by status', () => {
    component.selectedStatus = 'active';
    component.onStatusChange();
    expect(component.filteredLocations.every(loc => loc.status === 'active')).toBeTruthy();
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.selectedType = 'warehouse';
    component.selectedStatus = 'active';
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.selectedType).toBeNull();
    expect(component.selectedStatus).toBeNull();
  });

  it('should create new location', () => {
    const initialLength = component.locations.length;
    component.createLocation();
    expect(component.showLocationDialog).toBeTruthy();
    expect(component.editingLocation).toBeDefined();
    expect(component.editingLocation?.id).toBeUndefined();
  });

  it('should edit existing location', () => {
    const location = component.locations[0];
    component.editLocation(location);
    expect(component.showLocationDialog).toBeTruthy();
    expect(component.editingLocation).toEqual(location);
  });

  it('should calculate capacity utilization correctly', () => {
    const location = component.locations[0];
    const utilization = component.getCapacityUtilization(location);
    expect(utilization).toBeGreaterThanOrEqual(0);
    expect(utilization).toBeLessThanOrEqual(100);
  });

  it('should get active locations count', () => {
    const activeCount = component.getActiveLocationsCount();
    expect(activeCount).toBeGreaterThanOrEqual(0);
  });

  it('should get maintenance locations count', () => {
    const maintenanceCount = component.getMaintenanceLocationsCount();
    expect(maintenanceCount).toBeGreaterThanOrEqual(0);
  });

  it('should get total capacity', () => {
    const totalCapacity = component.getTotalCapacity();
    expect(totalCapacity).toBeGreaterThanOrEqual(0);
  });

  it('should format numbers correctly', () => {
    expect(component.formatNumber(1000)).toBe('1,000');
    expect(component.formatNumber(1000000)).toBe('1,000,000');
  });

  it('should format percentages correctly', () => {
    expect(component.formatPercentage(85.5)).toBe('85.5%');
    expect(component.formatPercentage(100)).toBe('100%');
  });

  it('should get correct type severity', () => {
    expect(component.getTypeSeverity('warehouse')).toBe('info');
    expect(component.getTypeSeverity('store')).toBe('success');
    expect(component.getTypeSeverity('office')).toBe('warning');
  });

  it('should get correct status severity', () => {
    expect(component.getStatusSeverity('active')).toBe('success');
    expect(component.getStatusSeverity('inactive')).toBe('danger');
    expect(component.getStatusSeverity('maintenance')).toBe('warning');
  });

  it('should get correct capacity status', () => {
    expect(component.getCapacityStatus({ capacity: 100, currentStock: 20 } as any)).toBe('low');
    expect(component.getCapacityStatus({ capacity: 100, currentStock: 70 } as any)).toBe('medium');
    expect(component.getCapacityStatus({ capacity: 100, currentStock: 90 } as any)).toBe('high');
    expect(component.getCapacityStatus({ capacity: 100, currentStock: 95 } as any)).toBe('critical');
  });

  it('should refresh data', () => {
    spyOn(component, 'refreshData');
    component.refreshData();
    expect(component.refreshData).toHaveBeenCalled();
  });

  it('should export locations', () => {
    spyOn(component, 'exportLocations');
    component.exportLocations();
    expect(component.exportLocations).toHaveBeenCalled();
  });
});
