import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DataViewModule } from 'primeng/dataview';
import { TooltipModule } from 'primeng/tooltip';
import { TravelService } from '../../services/travel.service';
import { Trip } from '../../models/travel.model';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    DataViewModule,
    TooltipModule
  ],
  template: `
    <div class="surface-ground px-4 py-5 md:px-6 lg:px-8 min-h-screen">
      <!-- Header Section -->
      <div class="flex flex-column md:flex-row md:align-items-center justify-content-between mb-5 gap-3">
        <div>
          <h1 class="text-3xl font-bold text-900 mt-0 mb-2">My Trips</h1>
          <p class="text-600 text-lg mt-0 mb-0">Manage and plan your upcoming adventures</p>
        </div>
        <button
          pButton
          label="New Trip"
          icon="pi pi-plus"
          class="p-button-primary p-button-rounded shadow-2"
          (click)="navigateToDetail('new')">
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="grid">
        <div class="col-12 md:col-6 lg:col-4 p-3" *ngFor="let i of [1,2,3,4,5,6]">
          <div class="surface-card border-round shadow-2 p-4">
            <p-skeleton height="200px" styleClass="mb-3 border-round"></p-skeleton>
            <div class="flex justify-content-between align-items-center mb-3">
              <p-skeleton width="6rem" height="1.5rem"></p-skeleton>
              <p-skeleton width="4rem" height="1.5rem"></p-skeleton>
            </div>
            <p-skeleton width="80%" height="1rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="60%" height="1rem"></p-skeleton>
          </div>
        </div>
      </div>

      <!-- Trips Grid -->
      <p-dataView *ngIf="!loading" [value]="trips" layout="grid" [paginator]="true" [rows]="9">
        <ng-template let-trip pTemplate="gridItem">
          <div class="col-12 md:col-6 lg:col-4 p-3">
            <div
              class="trip-card surface-card border-round shadow-2 h-full flex flex-column cursor-pointer transition-all transition-duration-200 hover:shadow-4"
              (click)="navigateToDetail(trip.id)">

              <!-- Cover Image -->
              <div class="relative h-15rem w-full">
                <img
                  [src]="trip.coverImage"
                  [alt]="trip.title"
                  class="w-full h-full object-cover border-round-top"
                  style="object-position: center;">
                <div class="absolute top-0 right-0 m-3">
                  <p-tag
                    [value]="trip.status"
                    [severity]="getStatusSeverity(trip.status)"
                    styleClass="text-sm font-semibold shadow-1">
                  </p-tag>
                </div>
              </div>

              <!-- Content -->
              <div class="p-4 flex-grow-1 flex flex-column">
                <div class="flex justify-content-between align-items-start mb-2">
                  <h2 class="text-xl font-bold text-900 mt-0 mb-1 line-clamp-1" [pTooltip]="trip.title" tooltipPosition="top">{{ trip.title }}</h2>
                </div>

                <div class="flex align-items-center text-600 mb-3">
                  <i class="pi pi-map-marker text-primary mr-2"></i>
                  <span class="font-medium line-clamp-1">{{ trip.destination }}</span>
                </div>

                <div class="mt-auto pt-3 border-top-1 surface-border flex align-items-center justify-content-between text-sm text-500">
                  <div class="flex align-items-center">
                    <i class="pi pi-calendar mr-2"></i>
                    <span>{{ trip.startDate | date:'mediumDate' }}</span>
                  </div>
                  <div class="flex align-items-center" *ngIf="trip.itinerary?.length">
                    <i class="pi pi-list mr-2"></i>
                    <span>{{ trip.itinerary.length }} Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-template>

        <!-- Empty State -->
        <ng-template pTemplate="empty">
          <div class="flex flex-column align-items-center justify-content-center p-6 text-center surface-card border-round shadow-1 m-3">
            <div class="bg-blue-50 border-circle p-4 mb-4">
              <i class="pi pi-compass text-blue-500 text-5xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-900 mb-2">No trips found</h3>
            <p class="text-600 mb-4 max-w-20rem">You haven't planned any trips yet. Start your next adventure today!</p>
            <button
              pButton
              label="Create First Trip"
              icon="pi pi-plus"
              class="p-button-primary"
              (click)="navigateToDetail('new')">
            </button>
          </div>
        </ng-template>
      </p-dataView>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .trip-card:hover {
      transform: translateY(-4px);
    }

    /* PrimeFlex utility overrides/polyfills if PrimeFlex is not fully loaded */
    .h-15rem { height: 15rem; }
    .object-cover { object-fit: cover; }
    .border-round-top { border-top-left-radius: var(--border-radius); border-top-right-radius: var(--border-radius); }
    .shadow-4 { box-shadow: 0 4px 10px rgba(0,0,0,0.03), 0 0 2px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.12); }
  `]
})
export class TripListComponent implements OnInit {
  private travelService = inject(TravelService);
  private router = inject(Router);

  trips: Trip[] = [];
  loading = false;

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    this.loading = true;
    this.travelService.getTrips().subscribe(data => {
      this.trips = data;
      this.loading = false;
    });
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/travel', id]);
  }

  getStatusSeverity(status: 'Upcoming' | 'In Progress' | 'Completed'): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'Upcoming': return 'info';
      case 'In Progress': return 'warning';
      case 'Completed': return 'success';
      default: return 'info';
    }
  }
}
