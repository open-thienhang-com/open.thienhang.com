import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { VehicleService } from '../../services/inventory.service';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ButtonModule, CardModule, TagModule, SkeletonModule,
    ToastModule, BadgeModule, TooltipModule
  ],
  templateUrl: './vehicle-detail.component.html',
  providers: [MessageService]
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

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'danger';
      case 'busy': return 'info';
      default: return 'secondary';
    }
  }
}
