import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { finalize, forkJoin } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { Asset, Booking, BudgetItem, ItineraryItem, Trip, TripNotification } from '../../models/travel.model';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, SkeletonModule, TagModule],
  template: `
    <div class="p-4 md:p-6">
      <div class="flex justify-content-between align-items-center mb-4">
        <button pButton icon="pi pi-arrow-left" label="Back to Trips" class="p-button-text" (click)="navigateToList()"></button>
        <button pButton icon="pi pi-refresh" label="Refresh" class="p-button-outlined" (click)="reload()"></button>
      </div>

      <div *ngIf="loading">
        <p-skeleton height="3rem" styleClass="mb-3"></p-skeleton>
        <p-skeleton height="2rem" styleClass="mb-5"></p-skeleton>
        <p-skeleton height="18rem"></p-skeleton>
      </div>

      <div *ngIf="!loading && !trip" class="surface-card border-round shadow-1 p-5 text-center">
        <h3 class="m-0 mb-2">Trip not found</h3>
        <p class="m-0 text-600">Trip ID: {{ tripId }}</p>
      </div>

      <div *ngIf="!loading && trip" class="grid">
        <div class="col-12">
          <div class="surface-card border-round shadow-2 p-4">
            <div class="flex justify-content-between align-items-start gap-3">
              <div>
                <h1 class="text-2xl font-bold mt-0 mb-2">{{ trip.title }}</h1>
                <p class="text-600 mt-0 mb-2"><i class="pi pi-map-marker mr-2"></i>{{ trip.destination || '-' }}</p>
                <p class="text-700 mb-0">{{ trip.description || 'No description' }}</p>
              </div>
              <p-tag [value]="trip.status || 'unknown'" [severity]="getStatusSeverity(trip.status)"></p-tag>
            </div>
          </div>
        </div>

        <div class="col-12 lg:col-6">
          <p-card>
            <ng-template pTemplate="title">
              <div class="flex justify-content-between align-items-center">
                <span>Itinerary ({{ itinerary.length }})</span>
                <button pButton icon="pi pi-plus" class="p-button-text p-button-sm" (click)="createItineraryItem()"></button>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="list-block" *ngFor="let item of itinerary">
                <div class="flex justify-content-between gap-2">
                  <div>
                    <div class="font-semibold">{{ item.title }}</div>
                    <small class="text-600">{{ item.date || '-' }} {{ item.time || '' }}</small>
                    <div class="text-700">{{ item.description || '-' }}</div>
                  </div>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteItineraryItem(item)"></button>
                </div>
              </div>
              <div *ngIf="!itinerary.length" class="text-600">No itinerary items.</div>
            </ng-template>
          </p-card>
        </div>

        <div class="col-12 lg:col-6">
          <p-card>
            <ng-template pTemplate="title">
              <div class="flex justify-content-between align-items-center">
                <span>Bookings ({{ bookings.length }})</span>
                <button pButton icon="pi pi-plus" class="p-button-text p-button-sm" (click)="createBooking()"></button>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="list-block" *ngFor="let item of bookings">
                <div class="flex justify-content-between gap-2">
                  <div>
                    <div class="font-semibold">{{ item.type || 'Booking' }} - {{ item.provider || '-' }}</div>
                    <small class="text-600">{{ item.reference_code || '-' }}</small>
                    <div class="text-700">{{ item.amount || 0 }} {{ item.currency || '' }}</div>
                  </div>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteBooking(item)"></button>
                </div>
              </div>
              <div *ngIf="!bookings.length" class="text-600">No bookings.</div>
            </ng-template>
          </p-card>
        </div>

        <div class="col-12 lg:col-6">
          <p-card>
            <ng-template pTemplate="title">
              <div class="flex justify-content-between align-items-center">
                <span>Budget Items ({{ budgets.length }})</span>
                <button pButton icon="pi pi-plus" class="p-button-text p-button-sm" (click)="createBudgetItem()"></button>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="list-block" *ngFor="let item of budgets">
                <div class="flex justify-content-between gap-2">
                  <div>
                    <div class="font-semibold">{{ item.title || item.category || 'Budget item' }}</div>
                    <small class="text-600">Planned: {{ item.planned_amount || 0 }} {{ item.currency || '' }}</small>
                    <div class="text-700">Actual: {{ item.actual_amount || 0 }} {{ item.currency || '' }}</div>
                  </div>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteBudgetItem(item)"></button>
                </div>
              </div>
              <div *ngIf="!budgets.length" class="text-600">No budget items.</div>
            </ng-template>
          </p-card>
        </div>

        <div class="col-12 lg:col-6">
          <p-card>
            <ng-template pTemplate="title">
              <div class="flex justify-content-between align-items-center">
                <span>Notifications ({{ notifications.length }})</span>
                <button pButton icon="pi pi-plus" class="p-button-text p-button-sm" (click)="createNotification()"></button>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="list-block" *ngFor="let item of notifications">
                <div class="flex justify-content-between gap-2">
                  <div>
                    <div class="font-semibold">{{ item.title || item.type || 'Notification' }}</div>
                    <small class="text-600">{{ item.channel || '-' }} - {{ item.status || 'pending' }}</small>
                    <div class="text-700">{{ item.message || '-' }}</div>
                  </div>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteNotification(item)"></button>
                </div>
              </div>
              <div *ngIf="!notifications.length" class="text-600">No notifications.</div>
            </ng-template>
          </p-card>
        </div>

        <div class="col-12">
          <p-card>
            <ng-template pTemplate="title">
              <div class="flex justify-content-between align-items-center">
                <span>Data Catalog Assets (domain=travel)</span>
                <button pButton icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="loadAssets()"></button>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="list-block" *ngFor="let asset of assets">
                <div class="flex justify-content-between gap-2">
                  <div>
                    <div class="font-semibold">{{ asset.name || asset.asset_id || asset.id }}</div>
                    <small class="text-600">{{ asset.type || '-' }} - {{ asset.status || '-' }}</small>
                    <div class="text-700">{{ asset.description || '-' }}</div>
                  </div>
                </div>
              </div>
              <div *ngIf="!assets.length" class="text-600">No assets found for domain travel.</div>
            </ng-template>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-block {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--surface-border);
    }
    .list-block:last-child {
      border-bottom: none;
    }
  `]
})
export class TripDetailComponent implements OnInit {
  private travelService = inject(TravelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tripId = '';
  trip: Trip | null = null;
  itinerary: ItineraryItem[] = [];
  bookings: Booking[] = [];
  budgets: BudgetItem[] = [];
  notifications: TripNotification[] = [];
  assets: Asset[] = [];
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.tripId = id;
    this.reload();
  }

  reload(): void {
    if (!this.tripId) {
      return;
    }
    this.loading = true;
    forkJoin({
      trip: this.travelService.getTrip(this.tripId),
      itinerary: this.travelService.listItineraryItems(this.tripId),
      bookings: this.travelService.listBookings(this.tripId),
      budgets: this.travelService.listBudgetItems(this.tripId),
      notifications: this.travelService.listNotifications(this.tripId)
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.trip = res.trip;
          this.itinerary = res.itinerary;
          this.bookings = res.bookings;
          this.budgets = res.budgets;
          this.notifications = res.notifications;
          this.loadAssets();
        },
        error: (err) => {
          console.error('Failed to load trip detail:', err);
          this.trip = null;
          this.itinerary = [];
          this.bookings = [];
          this.budgets = [];
          this.notifications = [];
        }
      });
  }

  loadAssets(): void {
    this.travelService.listAssets({ domain: 'travel', limit: 20 }).subscribe({
      next: (assets) => (this.assets = assets),
      error: (err) => {
        console.error('Failed to load assets:', err);
        this.assets = [];
      }
    });
  }

  createItineraryItem(): void {
    const title = window.prompt('Itinerary title');
    if (!title || !this.tripId) {
      return;
    }
    const date = window.prompt('Date (YYYY-MM-DD, optional)') || undefined;
    const time = window.prompt('Time (HH:mm, optional)') || undefined;
    const description = window.prompt('Description (optional)') || undefined;
    this.travelService.createItineraryItem(this.tripId, { title, date, time, description }).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Create itinerary failed:', err)
    });
  }

  deleteItineraryItem(item: ItineraryItem): void {
    const id = item.item_id || item.id;
    if (!id || !window.confirm('Delete itinerary item?')) {
      return;
    }
    this.travelService.deleteItineraryItem(id).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Delete itinerary failed:', err)
    });
  }

  createBooking(): void {
    const type = window.prompt('Booking type (flight/hotel/train...)');
    if (!type || !this.tripId) {
      return;
    }
    const provider = window.prompt('Provider (optional)') || undefined;
    const amountRaw = window.prompt('Amount (optional)') || '';
    const amount = amountRaw ? Number(amountRaw) : undefined;
    this.travelService.createBooking(this.tripId, { type, provider, amount }).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Create booking failed:', err)
    });
  }

  deleteBooking(item: Booking): void {
    const id = item.booking_id || item.id;
    if (!id || !window.confirm('Delete booking?')) {
      return;
    }
    this.travelService.deleteBooking(id).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Delete booking failed:', err)
    });
  }

  createBudgetItem(): void {
    const title = window.prompt('Budget item title');
    if (!title || !this.tripId) {
      return;
    }
    const plannedRaw = window.prompt('Planned amount (optional)') || '';
    const actualRaw = window.prompt('Actual amount (optional)') || '';
    const planned_amount = plannedRaw ? Number(plannedRaw) : undefined;
    const actual_amount = actualRaw ? Number(actualRaw) : undefined;
    this.travelService.createBudgetItem(this.tripId, { title, planned_amount, actual_amount, currency: 'USD' }).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Create budget item failed:', err)
    });
  }

  deleteBudgetItem(item: BudgetItem): void {
    const id = item.item_id || item.id;
    if (!id || !window.confirm('Delete budget item?')) {
      return;
    }
    this.travelService.deleteBudgetItem(id).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Delete budget item failed:', err)
    });
  }

  createNotification(): void {
    const title = window.prompt('Notification title');
    if (!title || !this.tripId) {
      return;
    }
    const message = window.prompt('Message (optional)') || undefined;
    this.travelService.createNotification(this.tripId, { title, message, channel: 'in_app' }).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Create notification failed:', err)
    });
  }

  deleteNotification(item: TripNotification): void {
    const id = item.notification_id || item.id;
    if (!id || !window.confirm('Delete notification?')) {
      return;
    }
    this.travelService.deleteNotification(id).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('Delete notification failed:', err)
    });
  }

  navigateToList(): void {
    this.router.navigate(['/travel']);
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
}
