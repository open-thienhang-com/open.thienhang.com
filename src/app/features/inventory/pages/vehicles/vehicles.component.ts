import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { VehicleService } from '../../services/inventory.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, TableModule, InputTextModule, DropdownModule,
    TagModule, CardModule, SkeletonModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="vehicles-page">
      <p-toast></p-toast>

      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title"><i class="pi pi-truck"></i> Fleet</h1>
          <span class="page-subtitle">{{ total }} vehicles total</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText [(ngModel)]="keyword" placeholder="Search vehicles..."
                 (input)="onSearch()" class="search-input" />
        </span>
        <p-dropdown [options]="statusOptions" [(ngModel)]="selectedStatus" placeholder="All Status"
                    (onChange)="load()" [showClear]="true" optionLabel="label" optionValue="value"
                    styleClass="status-filter"></p-dropdown>
        <button pButton icon="pi pi-refresh" class="p-button-outlined" (click)="load()" title="Refresh"></button>
      </div>

      @if (loading) {
        <div class="skeleton-rows">
          @for (i of [1,2,3,4,5]; track i) {
            <p-skeleton height="52px" borderRadius="8px"></p-skeleton>
          }
        </div>
      }

      @if (!loading && vehicles.length > 0) {
        <p-table [value]="vehicles" [paginator]="true" [rows]="15" [rowHover]="true"
                 styleClass="p-datatable-sm vehicles-table" [tableStyle]="{'min-width': '60rem'}">
          <ng-template pTemplate="header">
            <tr>
              <th>Code</th>
              <th>License Plate</th>
              <th>Type</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Max Weight</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-v>
            <tr>
              <td><span class="mono">{{ v.vehicle_code || '—' }}</span></td>
              <td><strong>{{ v.license_plate || '—' }}</strong></td>
              <td>{{ v.vehicle_type || '—' }}</td>
              <td>
                <div>{{ v.driver_name || '—' }}</div>
                @if (v.driver_phone) { <div class="small-text">{{ v.driver_phone }}</div> }
              </td>
              <td><p-tag [value]="v.status || 'unknown'" [severity]="getStatusSeverity(v.status)"></p-tag></td>
              <td>{{ v.max_weight ? (v.max_weight + ' kg') : '—' }}</td>
              <td>
                <button pButton icon="pi pi-eye" class="p-button-sm p-button-text"
                        title="View" (click)="viewVehicle(v)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }

      @if (!loading && vehicles.length === 0) {
        <div class="empty-state">
          <i class="pi pi-truck empty-icon"></i>
          <h3>No vehicles found</h3>
          <p>{{ keyword || selectedStatus ? 'Try adjusting your filters.' : 'No vehicles are registered yet.' }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .vehicles-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 10px; }
    .page-title i { color: #6366f1; }
    .page-subtitle { color: #64748b; font-size: 0.875rem; margin-top: 4px; display: block; }
    .filter-bar { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; flex-wrap: wrap; }
    .search-input { width: 280px; }
    .status-filter { min-width: 160px; }
    .mono { font-family: monospace; font-size: 0.85rem; color: #64748b; }
    .small-text { font-size: 0.75rem; color: #94a3b8; }
    .skeleton-rows { display: flex; flex-direction: column; gap: 8px; }
    .empty-state { text-align: center; padding: 80px 24px; }
    .empty-icon { font-size: 4rem; color: #cbd5e1; display: block; margin-bottom: 16px; }
    .empty-state h3 { color: #374151; margin-bottom: 8px; }
    .empty-state p { color: #9ca3af; }
  `]
})
export class VehiclesComponent implements OnInit {
  vehicles: any[] = [];
  loading = false;
  total = 0;
  keyword = '';
  selectedStatus = '';
  private searchTimer: any;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Busy', value: 'busy' },
  ];

  constructor(
    private vehicleService: VehicleService,
    public router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.vehicleService.listVehicles(0, 50, this.selectedStatus || undefined, undefined, this.keyword || undefined).subscribe({
      next: (res: any) => {
        this.vehicles = res.data || [];
        this.total = res.total || this.vehicles.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vehicles' });
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 400);
  }

  viewVehicle(v: any) {
    this.router.navigate(['/inventory/fleet', v._id || v.id]);
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'danger';
      case 'busy': return 'info';
      default: return 'secondary';
    }
  }
}
