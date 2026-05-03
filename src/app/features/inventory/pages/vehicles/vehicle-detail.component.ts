import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { VehicleService } from '../../services/inventory.service';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TagModule, SkeletonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="vehicle-detail-page">
      <p-toast></p-toast>

      <div class="breadcrumb">
        <button pButton label="← Fleet" class="p-button-text p-button-sm"
                (click)="router.navigate(['/inventory/fleet'])"></button>
      </div>

      @if (loading) {
        <p-skeleton height="280px" borderRadius="16px"></p-skeleton>
      }

      @if (!loading && vehicle) {
        <div class="detail-card">
          <div class="detail-header">
            <div>
              <h1 class="vehicle-title">{{ vehicle.license_plate || vehicle.vehicle_code }}</h1>
              <p class="vehicle-code">{{ vehicle.vehicle_code }} · {{ vehicle.vehicle_type || 'Vehicle' }}</p>
            </div>
            <p-tag [value]="vehicle.status || 'unknown'"
                   [severity]="getStatusSeverity(vehicle.status)"></p-tag>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label"><i class="pi pi-id-card"></i> License Plate</span>
              <span class="detail-value">{{ vehicle.license_plate || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="pi pi-user"></i> Driver</span>
              <span class="detail-value">{{ vehicle.driver_name || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="pi pi-phone"></i> Driver Phone</span>
              <span class="detail-value">{{ vehicle.driver_phone || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="pi pi-building"></i> Warehouse</span>
              <span class="detail-value">{{ vehicle.warehouse_id || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="pi pi-arrow-up"></i> Max Weight</span>
              <span class="detail-value">{{ vehicle.max_weight ? (vehicle.max_weight + ' kg') : '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="pi pi-box"></i> Max Volume</span>
              <span class="detail-value">{{ vehicle.max_volume ? (vehicle.max_volume + ' m³') : '—' }}</span>
            </div>
          </div>
        </div>
      }

      @if (!loading && !vehicle) {
        <div class="not-found">
          <i class="pi pi-exclamation-triangle"></i>
          <h2>Vehicle not found</h2>
          <button pButton label="Back to Fleet" (click)="router.navigate(['/inventory/fleet'])"></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .vehicle-detail-page { padding: 24px; max-width: 960px; margin: 0 auto; }
    .breadcrumb { margin-bottom: 16px; }
    .detail-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 12px rgba(0,0,0,.07); }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .vehicle-title { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0; }
    .vehicle-code { color: #64748b; font-family: monospace; margin: 4px 0 0; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-size: 0.75rem; color: #94a3b8; font-weight: 500; display: flex; align-items: center; gap: 6px; }
    .detail-value { font-size: 0.95rem; color: #1e293b; font-weight: 600; }
    .not-found { text-align: center; padding: 80px 24px; }
    .not-found i { font-size: 4rem; color: #f59e0b; display: block; margin-bottom: 16px; }
  `]
})
export class VehicleDetailComponent implements OnInit {
  vehicle: any = null;
  loading = false;

  constructor(
    private vehicleService: VehicleService,
    public router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.vehicleService.getVehicle(id).subscribe({
        next: (res: any) => { this.vehicle = res.data || res; this.loading = false; },
        error: () => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Vehicle not found' });
        }
      });
    }
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
