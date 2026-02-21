import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DataViewModule } from 'primeng/dataview';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { Trip } from '../../models/travel.model';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    DataViewModule,
    TooltipModule
  ],
  template: `
    <div class="surface-ground px-4 py-5 md:px-6 lg:px-8 min-h-screen">
      <div class="flex flex-column md:flex-row md:align-items-center justify-content-between mb-5 gap-3">
        <div>
          <h1 class="text-3xl font-bold text-900 mt-0 mb-2">Travel Trips</h1>
          <p class="text-600 text-lg mt-0 mb-0">Data source: <code>/data-mesh/domains/travel/trips</code></p>
        </div>
        <div class="flex gap-2">
          <button pButton label="Refresh" icon="pi pi-refresh" class="p-button-outlined" (click)="loadTrips()"></button>
          <button pButton label="New Trip" icon="pi pi-plus" (click)="createTripQuick()"></button>
        </div>
      </div>

      <div *ngIf="loading" class="grid">
        <div class="col-12 md:col-6 lg:col-4 p-3" *ngFor="let i of [1,2,3,4,5,6]">
          <div class="surface-card border-round shadow-2 p-4">
            <p-skeleton height="120px" styleClass="mb-3 border-round"></p-skeleton>
            <p-skeleton width="70%" height="1rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="50%" height="1rem"></p-skeleton>
          </div>
        </div>
      </div>

      <p-dataView *ngIf="!loading" [value]="trips" layout="grid" [paginator]="true" [rows]="9">
        <ng-template pTemplate="gridItem" let-trip>
          <div class="col-12 md:col-6 lg:col-4 p-3">
            <div class="surface-card border-round shadow-2 h-full flex flex-column p-4 gap-3">
              <div class="flex justify-content-between align-items-start gap-2">
                <h2 class="text-xl font-bold text-900 m-0 line-clamp-2 cursor-pointer" [pTooltip]="trip.title" (click)="openTrip(trip)">
                  {{ trip.title || 'Untitled trip' }}
                </h2>
                <p-tag [value]="trip.status || 'unknown'" [severity]="getStatusSeverity(trip.status)"></p-tag>
              </div>

              <div class="text-600">
                <div><i class="pi pi-map-marker mr-2"></i>{{ trip.destination || '-' }}</div>
                <div><i class="pi pi-calendar mr-2"></i>{{ formatDateRange(trip.start_date, trip.end_date) }}</div>
              </div>

              <p class="text-700 line-clamp-3 mb-0">{{ trip.description || 'No description' }}</p>

              <div class="mt-auto flex justify-content-between align-items-center">
                <small class="text-500">ID: {{ getTripId(trip) || '-' }}</small>
                <div class="flex gap-2">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text" (click)="openTrip(trip)"></button>
                  <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteTrip(trip)"></button>
                </div>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="empty">
          <div class="surface-card border-round shadow-1 p-6 text-center">
            <h3 class="text-xl font-bold">No trips found</h3>
            <p class="text-600">Create your first trip to start using Travel domain APIs.</p>
          </div>
        </ng-template>
      </p-dataView>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TripListComponent implements OnInit {
  private travelService = inject(TravelService);
  private router = inject(Router);

  trips: Trip[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;
    this.travelService.listTrips()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.trips = data;
        },
        error: (err) => {
          console.error('Failed to load trips:', err);
          this.trips = [];
        }
      });
  }

  openTrip(trip: Trip): void {
    const id = this.getTripId(trip);
    if (!id) {
      return;
    }
    this.router.navigate(['/travel', id]);
  }

  createTripQuick(): void {
    const title = window.prompt('Trip title');
    if (!title) {
      return;
    }
    const destination = window.prompt('Destination (optional)') || undefined;
    const start_date = window.prompt('Start date (YYYY-MM-DD, optional)') || undefined;
    const end_date = window.prompt('End date (YYYY-MM-DD, optional)') || undefined;

    this.travelService.createTrip({ title, destination, start_date, end_date, status: 'upcoming' }).subscribe({
      next: (created) => {
        const createdId = created ? this.getTripId(created) : null;
        if (createdId) {
          this.router.navigate(['/travel', createdId]);
          return;
        }
        this.loadTrips();
      },
      error: (err) => {
        console.error('Create trip failed:', err);
      }
    });
  }

  deleteTrip(trip: Trip): void {
    const id = this.getTripId(trip);
    if (!id) {
      return;
    }
    if (!window.confirm(`Delete trip "${trip.title}"?`)) {
      return;
    }
    this.travelService.deleteTrip(id).subscribe({
      next: () => this.loadTrips(),
      error: (err) => console.error('Delete trip failed:', err)
    });
  }

  getTripId(trip: Trip): string | null {
    return trip.trip_id || trip.id || null;
  }

  getStatusSeverity(status?: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'in progress':
        return 'warning';
      case 'upcoming':
        return 'info';
      default:
        return 'secondary';
    }
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start && !end) {
      return '-';
    }
    if (start && end) {
      return `${start} -> ${end}`;
    }
    return start || end || '-';
  }
}
