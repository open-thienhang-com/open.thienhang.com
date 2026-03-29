import { Injectable, signal, inject, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TravelService } from '../../services/travel.service';
import { Trip, BlogPost } from '../../models/travel.model';

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
    InputTextModule,
    FormsModule
  ],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="explorer-container">
      <!-- Main Content: Split Pane -->
      <div class="split-pane">
        
        <!-- Left Pane: Map (Immersive) -->
        <div class="map-pane">
          <div #checkpointMap class="full-map"></div>
          
          <!-- Floating Command Palette / Search -->
          <div class="floating-search-box blur-effect">
            <div class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                pInputText 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keydown.enter)="searchPlaces()"
                placeholder="Search destinations..." 
                class="w-full border-none bg-transparent focus:shadow-none" />
            </div>
            <p-button icon="pi pi-directions" [loading]="searching" (onClick)="searchPlaces()" severity="primary" [rounded]="true" [text]="true"></p-button>
          </div>

          <!-- Map Overlay: Selected Place Info -->
          <div class="selected-place-card blur-effect" *ngIf="selectedPlace">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-sm font-bold text-gray-900 m-0">{{ selectedPlace.display_name }}</h4>
                <p class="text-xs text-gray-500 m-0 mt-1 uppercase tracking-wider">{{ selectedPlace.type || selectedPlace.class }}</p>
              </div>
              <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" size="small" (onClick)="selectedPlace = null"></p-button>
            </div>
          </div>
        </div>

        <!-- Right Pane: List & Stats (Glassmorphic) -->
        <div class="list-pane border-left border-200">
          <div class="pane-header p-4 flex justify-between items-center border-bottom border-200">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 m-0">Travel Explorer</h1>
              <p class="text-gray-500 text-sm m-0">Discover and manage your journeys</p>
            </div>
            <p-button icon="pi pi-plus" label="New Trip" severity="primary" [rounded]="true" size="small" (onClick)="goToCreateTrip()"></p-button>
          </div>

          <div class="pane-scrollable p-4">
            <!-- Category Filters -->
            <div class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                *ngFor="let cat of categories"
                (click)="filterByCategory(cat)"
                class="px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap"
                [class.bg-blue-600]="selectedCategory() === cat"
                [class.text-white]="selectedCategory() === cat"
                [class.border-blue-600]="selectedCategory() === cat"
                [class.bg-white]="selectedCategory() !== cat"
                [class.text-gray-500]="selectedCategory() !== cat"
                [class.border-gray-200]="selectedCategory() !== cat">
                {{ cat | uppercase }}
              </button>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="stat-mini-card bg-blue-50">
                <span class="text-xs text-blue-600 font-bold uppercase">Total Stories</span>
                <span class="text-xl font-bold block">{{ posts().length }}</span>
              </div>
              <div class="stat-mini-card bg-purple-50">
                <span class="text-xs text-purple-600 font-bold uppercase">Views</span>
                <span class="text-xl font-bold block">{{ 1240 | number }}</span>
              </div>
            </div>

            <!-- Loading Skeleton -->
            <div *ngIf="loading()" class="space-y-4">
              <div *ngFor="let i of [1,2,3]" class="p-4 border border-200 rounded-xl">
                <p-skeleton width="80%" height="1.5rem" styleClass="mb-3"></p-skeleton>
                <div class="flex gap-2">
                  <p-skeleton width="40" height="40" shape="circle"></p-skeleton>
                  <p-skeleton width="40%" height="1rem"></p-skeleton>
                </div>
              </div>
            </div>

            <!-- Post Cards -->
            <div *ngIf="!loading()" class="space-y-4" [@listAnimation]="posts().length">
              <div *ngFor="let post of posts(); trackBy: trackByPost" 
                   class="trip-card group flex gap-4 p-3" 
                   (click)="selectTrip(post)">
                <div class="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img [src]="post.thumbnail || 'assets/placeholder-trip.jpg'" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <h3 class="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {{ post.title }}
                    </h3>
                  </div>
                  <p class="text-xs text-gray-500 line-clamp-2 mt-1">{{ post.summary }}</p>
                  <div class="flex items-center gap-3 mt-3">
                    <div class="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <i class="pi pi-user text-[8px]"></i>
                      <span class="truncate">{{ post.author?.name }}</span>
                    </div>
                    <div class="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                      <i class="pi pi-eye text-[8px]"></i>
                      <span>{{ post.view_count || 0 }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col justify-between items-end">
                   <p-tag [value]="post.status" [severity]="getStatusSeverity(post.status)" styleClass="text-[8px] uppercase font-black px-2 py-0.5 rounded-sm"></p-tag>
                   <p-button icon="pi pi-arrow-up-right" [rounded]="true" [text]="true" size="small" (onClick)="openTrip(post)"></p-button>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="posts().length === 0" class="text-center py-10 glass-card mx-2">
                <i class="pi pi-compass text-4xl text-blue-200 mb-3 block"></i>
                <p class="text-gray-500 font-medium">No stories found in {{ selectedCategory() }}</p>
                <p-button label="Clear Filters" [link]="true" size="small" (onClick)="filterByCategory('travel')"></p-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 64px); }
    .explorer-container { height: 100%; overflow: hidden; }
    .split-pane { display: grid; grid-template-columns: 1fr 400px; height: 100%; }
    .map-pane { position: relative; height: 100%; background: #eef2ff; }
    .full-map { width: 100%; height: 100%; }
    .floating-search-box { position: absolute; top: 1.5rem; left: 1.5rem; right: 1.5rem; max-width: 400px; z-index: 1000; padding: 0.5rem 1rem; border-radius: 999px; display: flex; align-items: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.4); }
    .selected-place-card { position: absolute; bottom: 1.5rem; left: 1.5rem; width: 320px; z-index: 1000; padding: 1rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.4); }
    .blur-effect { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
    .list-pane { display: flex; flex-direction: column; background: #fff; }
    .pane-scrollable { flex: 1; overflow-y: auto; }
    .stat-mini-card { padding: 0.75rem; border-radius: 0.75rem; }
    .trip-card { padding: 1rem; border-radius: 1rem; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .trip-card:hover { border-color: #e2e8f0; background: #f8fafc; transform: translateY(-1px); }
    .trip-card.active { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 4px 6px -1px rgba(59,130,246,0.1); }
    @media (max-width: 1024px) { .split-pane { grid-template-columns: 1fr; } .list-pane { height: 50%; } .map-pane { height: 50%; } }
  `]
})
export class TripListComponent implements OnInit, AfterViewInit, OnDestroy {
  private travelService = inject(TravelService);
  private router = inject(Router);

  @ViewChild('checkpointMap') checkpointMapRef?: ElementRef<HTMLDivElement>;

  posts = this.travelService.posts;
  loading = this.travelService.loading;
  categories = ['travel', 'adventure', 'nature', 'city', 'culture'];
  selectedCategory = signal<string>('travel');

  searchQuery = '';
  searching = false;
  searchResults: CheckpointPlace[] = [];
  selectedPlace: CheckpointPlace | null = null;

  private map: any;
  private L: any;
  private mapMarker: any;
  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.travelService.listTrips({ category: this.selectedCategory() }).subscribe();
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    this.loadPosts();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initMap();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.resizeObserver?.disconnect();
  }

  selectTrip(post: any): void {
    const id = post.id;
    if (id) {
      this.travelService.selectedPost.set(post);
      if (post.title) {
        this.searchQuery = post.title;
        this.searchPlaces();
      }
    }
  }

  openTrip(post: any): void {
    if (post.id) this.router.navigate(['/travel', post.id]);
  }

  goToCreateTrip(): void {
    this.router.navigate(['/travel/new']);
  }

  getStatusSeverity(status?: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toLowerCase()) {
      case 'published': return 'success';
      case 'draft': return 'secondary';
      default: return 'info';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  trackByPost = (_: number, post: any): string => post.id || String(_);
  trackByPlace = (_: number, place: CheckpointPlace): string => `${place.lat},${place.lon},${place.display_name}`;

  async searchPlaces(): Promise<void> {
    const keyword = this.searchQuery.trim();
    if (!keyword || this.searching) return;

    this.searching = true;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&q=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      this.searchResults = Array.isArray(data) ? data : [];
      if (this.searchResults.length) this.selectPlace(this.searchResults[0]);
    } catch (error) {
      console.error('Search places failed:', error);
      this.searchResults = [];
    } finally {
      this.searching = false;
    }
  }

  selectPlace(place: CheckpointPlace): void {
    this.selectedPlace = place;
    if (!this.map || !this.L) return;

    const lat = Number(place.lat);
    const lon = Number(place.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    this.map.setView([lat, lon], 13);
    if (this.mapMarker) this.map.removeLayer(this.mapMarker);

    this.mapMarker = this.L.circleMarker([lat, lon], {
      radius: 8,
      color: '#3b82f6',
      fillColor: '#60a5fa',
      fillOpacity: 0.9,
      weight: 2
    }).addTo(this.map);
  }

  private setupResizeObserver(): void {
    if (this.checkpointMapRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
      this.resizeObserver.observe(this.checkpointMapRef.nativeElement);
    }
  }

  private async initMap(): Promise<void> {
    if (this.map || !this.checkpointMapRef?.nativeElement) return;

    const leaflet = await import('leaflet');
    this.L = leaflet;
    this.map = leaflet.map(this.checkpointMapRef.nativeElement, {
      zoomControl: false
    }).setView([16.0471, 108.2068], 6);

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    leaflet.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }
}
