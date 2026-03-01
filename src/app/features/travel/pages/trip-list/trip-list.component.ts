import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { Trip } from '../../models/travel.model';

interface CheckpointPlace {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    InputTextModule
  ],
  template: `
    <div class="bg-gray-50 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-globe text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 m-0">Travel Planner</h1>
              <p class="text-gray-600 m-0 mt-1">Plan and manage all trips in one dashboard</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadTrips()" class="hidden sm:inline-flex"></p-button>
            <p-button label="Create Trip" icon="pi pi-plus" severity="primary" size="small" (onClick)="goToCreateTrip()" class="sm:hidden"></p-button>
            <p-button icon="pi pi-plus" severity="primary" [rounded]="true" (onClick)="goToCreateTrip()" class="hidden sm:inline-flex"></p-button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Trips</p>
              <p class="text-3xl font-bold text-gray-900 m-0">{{ trips.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-briefcase text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Draft</p>
              <p class="text-3xl font-bold text-gray-700 m-0">{{ countByStatus('draft') }}</p>
            </div>
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-pencil text-gray-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">In Progress</p>
              <p class="text-3xl font-bold text-orange-600 m-0">{{ countByStatus('in_progress') }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-clock text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-3xl font-bold text-green-600 m-0">{{ countByStatus('completed') }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
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

      <div *ngIf="!loading" class="trip-layout">
        <div class="bg-white rounded-lg shadow-sm p-3">
          <div *ngIf="trips.length; else emptyTrips" class="grid">
            <div class="col-12 md:col-6 xl:col-6 p-3" *ngFor="let trip of trips; trackBy: trackByTrip">
              <div class="bg-white border border-gray-200 rounded-lg h-full flex flex-column p-4 gap-3 hover:shadow-md transition-shadow">
                <div class="flex justify-content-between align-items-start gap-2 mb-1">
                  <h2 class="text-xl font-bold text-900 m-0 line-clamp-2 cursor-pointer" [pTooltip]="trip.title" (click)="openTrip(trip)">
                    {{ trip.title || 'Untitled trip' }}
                  </h2>
                  <p-tag [value]="trip.status || 'unknown'" [severity]="getStatusSeverity(trip.status)"></p-tag>
                </div>

                <div class="text-gray-600 grid gap-2">
                  <div><i class="pi pi-map-marker mr-2"></i>{{ trip.destination || 'No destination' }}</div>
                  <div><i class="pi pi-calendar mr-2"></i>{{ formatDateRange(trip.start_date, trip.end_date) }}</div>
                </div>

                <p class="text-700 line-clamp-3 mb-0">{{ trip.description || 'No description for this trip yet.' }}</p>

                <div class="planner-chip-row">
                  <span class="planner-chip">
                    <i class="pi pi-clock mr-1"></i>
                    {{ getTripDurationLabel(trip.start_date, trip.end_date) }}
                  </span>
                  <span class="planner-chip">
                    <i class="pi pi-user mr-1"></i>
                    {{ trip.people_count || 1 }} people
                  </span>
                </div>

                <div class="mt-auto flex justify-content-between align-items-center pt-2 border-top-1 border-200">
                  <small class="text-500">ID: {{ getTripId(trip) || '-' }}</small>
                  <div class="flex gap-2">
                    <button pButton label="Open" icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" (click)="openTrip(trip)"></button>
                    <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" (click)="deleteTrip(trip)"></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #emptyTrips>
            <div class="bg-white rounded-lg border border-gray-200 p-10 text-center">
              <h3 class="text-xl font-bold">No trips yet</h3>
              <p class="text-600">Create your first trip to start planning.</p>
            </div>
          </ng-template>
        </div>

        <aside class="checkpoint-sidebar bg-white rounded-lg shadow-sm p-4">
          <div class="checkpoint-head">
            <h3 class="m-0 text-xl font-bold text-900">Checkpoint</h3>
            <p class="m-0 text-600 text-sm mt-1">Search destinations, view map, and check destination details.</p>
          </div>

          <div class="checkpoint-search mt-3">
            <input
              pInputText
              type="text"
              [value]="searchQuery"
              (input)="searchQuery = ($any($event.target).value || '')"
              (keydown.enter)="searchPlaces()"
              placeholder="Search destination..." />
            <button pButton label="Search" icon="pi pi-search" [loading]="searching" (click)="searchPlaces()"></button>
          </div>

          <div class="checkpoint-results" *ngIf="searchResults.length">
            <button
              type="button"
              class="checkpoint-result-item"
              *ngFor="let place of searchResults; trackBy: trackByPlace"
              (click)="selectPlace(place)">
              <div class="result-title">{{ place.display_name }}</div>
              <div class="result-type">{{ place.type || place.class || 'place' }}</div>
            </button>
          </div>

          <div class="checkpoint-content">
            <div #checkpointMap class="checkpoint-map"></div>
            <div class="checkpoint-info">
              <div *ngIf="selectedPlace; else noSelectedPlace">
                <h4 class="m-0 text-base font-semibold text-900">{{ selectedPlace.display_name }}</h4>
                <p class="m-0 mt-2 text-700">Type: {{ selectedPlace.type || selectedPlace.class || '-' }}</p>
                <p class="m-0 mt-1 text-700">Lat: {{ selectedPlace.lat }}</p>
                <p class="m-0 mt-1 text-700">Lon: {{ selectedPlace.lon }}</p>
              </div>
              <ng-template #noSelectedPlace>
                <p class="m-0 text-600">No destination selected. Search and click one result to view details.</p>
              </ng-template>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .trip-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }
    .checkpoint-sidebar {
      position: sticky;
      top: 1rem;
    }
    .checkpoint-search {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.5rem;
    }
    .checkpoint-search input {
      width: 100%;
    }
    .checkpoint-results {
      margin-top: 0.5rem;
      display: grid;
      gap: 0.4rem;
      max-height: 180px;
      overflow: auto;
    }
    .checkpoint-result-item {
      border: 1px solid #e5e7eb;
      background: #f8fafc;
      border-radius: 0.5rem;
      text-align: left;
      padding: 0.5rem 0.6rem;
      cursor: pointer;
    }
    .result-title {
      font-size: 0.78rem;
      color: #1f2937;
      line-height: 1.35;
    }
    .result-type {
      margin-top: 0.2rem;
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
    }
    .checkpoint-content {
      margin-top: 0.75rem;
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 0.75rem;
      min-height: 280px;
    }
    .checkpoint-map {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      min-height: 280px;
      background: #eef2ff;
    }
    .checkpoint-info {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 0.75rem;
      background: #f8fafc;
    }
    .planner-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .planner-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.3rem 0.6rem;
      border-radius: 999px;
      font-size: 0.78rem;
      color: #0c4a6e;
      background: #e0f2fe;
    }
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
    @media (min-width: 1280px) {
      .trip-layout {
        grid-template-columns: minmax(0, 2fr) minmax(360px, 1fr);
      }
    }
    @media (max-width: 1024px) {
      .checkpoint-content {
        grid-template-columns: 1fr;
      }
      .checkpoint-sidebar {
        position: static;
      }
    }
  `]
})
export class TripListComponent implements OnInit, AfterViewInit, OnDestroy {
  private travelService = inject(TravelService);
  private router = inject(Router);

  @ViewChild('checkpointMap') checkpointMapRef?: ElementRef<HTMLDivElement>;

  trips: Trip[] = [];
  loading = false;

  searchQuery = '';
  searching = false;
  searchResults: CheckpointPlace[] = [];
  selectedPlace: CheckpointPlace | null = null;

  private map: any;
  private L: any;
  private mapMarker: any;

  ngOnInit(): void {
    this.loadTrips();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
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

  goToCreateTrip(): void {
    this.router.navigate(['/travel/new']);
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
    return trip.trip_id || trip.id || trip._id || null;
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
      case 'draft':
        return 'secondary';
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

  countByStatus(status: Trip['status']): number {
    const normalized = (status || '').toLowerCase().replace(' ', '_');
    return this.trips.filter((trip) => (trip.status || '').toLowerCase().replace(' ', '_') === normalized).length;
  }

  getTripDurationLabel(start?: string, end?: string): string {
    if (!start || !end) {
      return 'Flexible schedule';
    }
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return 'Flexible schedule';
    }
    const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff} days` : '1 day';
  }

  trackByTrip = (_: number, trip: Trip): string => this.getTripId(trip) || trip.title || String(_);
  trackByPlace = (_: number, place: CheckpointPlace): string => `${place.lat},${place.lon},${place.display_name}`;

  async searchPlaces(): Promise<void> {
    const keyword = this.searchQuery.trim();
    if (!keyword || this.searching) {
      return;
    }

    this.searching = true;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&q=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      this.searchResults = Array.isArray(data) ? data : [];
      if (this.searchResults.length) {
        this.selectPlace(this.searchResults[0]);
      }
    } catch (error) {
      console.error('Search places failed:', error);
      this.searchResults = [];
    } finally {
      this.searching = false;
    }
  }

  selectPlace(place: CheckpointPlace): void {
    this.selectedPlace = place;

    if (!this.map || !this.L) {
      return;
    }

    const lat = Number(place.lat);
    const lon = Number(place.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return;
    }

    this.map.setView([lat, lon], 13);
    if (this.mapMarker) {
      this.map.removeLayer(this.mapMarker);
    }

    this.mapMarker = this.L.circleMarker([lat, lon], {
      radius: 8,
      color: '#0ea5e9',
      fillColor: '#38bdf8',
      fillOpacity: 0.9,
      weight: 2
    }).addTo(this.map);
  }

  private async initMap(): Promise<void> {
    if (this.map || !this.checkpointMapRef?.nativeElement) {
      return;
    }

    const leaflet = await import('leaflet');
    this.L = leaflet;
    this.map = leaflet.map(this.checkpointMapRef.nativeElement, {
      zoomControl: true
    }).setView([16.0471, 108.2068], 6);

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);
  }
}
