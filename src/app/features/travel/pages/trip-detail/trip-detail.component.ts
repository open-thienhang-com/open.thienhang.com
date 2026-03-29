import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, forkJoin } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { Asset, BlogPost, BlogAuthor, TravelAnalytics } from '../../models/travel.model';
import { ItineraryTimelineComponent } from '../../components/itinerary-timeline/itinerary-timeline.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonModule, 
    CardModule, 
    SkeletonModule, 
    TagModule, 
    TooltipModule,
    ItineraryTimelineComponent
  ],
  template: `
    <div class="detail-container">
      <!-- Header Overlay (Floating) -->
      <div class="floating-header blur-effect">
        <div class="flex items-center gap-4">
          <p-button icon="pi pi-arrow-left" [rounded]="true" [text]="true" severity="secondary" (onClick)="navigateToList()"></p-button>
          <div class="h-8 w-px bg-gray-200"></div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 m-0 leading-tight truncate max-w-[300px]">{{ post?.title || 'Story Detail' }}</h1>
            <p class="text-xs text-gray-500 m-0 uppercase tracking-widest font-bold">{{ post?.category || 'General' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <p-tag *ngIf="post" [value]="post.status" [severity]="getStatusSeverity(post.status)" styleClass="text-[10px] uppercase font-bold px-2 py-1"></p-tag>
          <p-button icon="pi pi-share-alt" [rounded]="true" [text]="true" severity="secondary"></p-button>
        </div>
      </div>

      <div class="split-layout">
        <!-- Scrollable Content Pane -->
        <div class="content-pane scrollable-y">
          <!-- Hero Image -->
          <div class="hero-section h-[400px] w-full relative">
            <img [src]="post?.thumbnail || 'assets/placeholder-trip.jpg'" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-6 left-10 text-white">
              <div class="flex items-center gap-3 mb-2">
                <img [src]="post?.author?.avatar_url || 'assets/default-avatar.png'" class="w-10 h-10 rounded-full border-2 border-white/30" />
                <div>
                  <div class="text-sm font-bold">{{ post?.author?.name }}</div>
                  <div class="text-[10px] opacity-70">{{ formatDate(post?.published_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-10 max-w-4xl mx-auto">
            
            <!-- Quick Stats Row -->
            <div class="grid grid-cols-4 gap-4 mb-10">
              <div class="detail-stat-card">
                <span class="label">Views</span>
                <span class="value">{{ post?.view_count || 0 }}</span>
                <i class="pi pi-eye icon"></i>
              </div>
              <div class="detail-stat-card">
                <span class="label">Comments</span>
                <span class="value">{{ post?.comment_count || 0 }}</span>
                <i class="pi pi-comments icon"></i>
              </div>
              <div class="detail-stat-card">
                <span class="label">Likes</span>
                <span class="value">{{ post?.like_count || 0 }}</span>
                <i class="pi pi-heart icon"></i>
              </div>
              <div class="detail-stat-card">
                <span class="label">Engagement</span>
                <span class="value text-blue-600">{{ 12.5 }}%</span>
                <i class="pi pi-chart-line icon"></i>
              </div>
            </div>

            <!-- Blog Post Content Section -->
            <div class="mb-12">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Travel Story</h2>
              <p class="text-lg text-gray-700 leading-relaxed mb-8">{{ post?.summary }}</p>
              <div class="prose max-w-none text-gray-600 leading-loose" [innerHTML]="post?.content || 'Loading content...'">
              </div>
            </div>

            <!-- Related Trending Stories -->
            <div class="mb-12">
              <div class="section-header flex justify-between items-center mb-6">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 m-0">Trending Stories</h2>
                  <p class="text-sm text-gray-500">Popular destinations this week</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let trend of trending()" class="minimal-card scale-hover" (click)="router.navigate(['/travel', trend.id])">
                  <div class="flex items-center gap-3">
                    <img [src]="trend.thumbnail || 'assets/placeholder-trip.jpg'" class="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div class="text-sm font-bold truncate max-w-[150px]">{{ trend.title }}</div>
                      <div class="text-[10px] text-gray-400">{{ trend.view_count | number }} views</div>
                    </div>
                  </div>
                  <i class="pi pi-arrow-right text-gray-300"></i>
                </div>
              </div>
            </div>

            <!-- Comments Section stub -->
            <div class="mb-12">
              <h3 class="text-xl font-bold mb-6">Comments ({{ comments.length }})</h3>
              <div class="space-y-6">
                 <div *ngFor="let c of comments" class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
                    <div>
                      <div class="text-xs font-bold">{{ c.user?.name || 'Traveler' }}</div>
                      <p class="text-xs text-gray-600 mt-1">{{ c.content }}</p>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Sticky Map Pane -->
        <div class="map-pane">
          <div #detailMap class="full-map"></div>
          <div class="map-overlay blur-effect">
            <h4 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Destination Focus</h4>
            <div class="text-sm font-bold text-gray-900">{{ post?.title }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 64px); }
    .detail-container { height: 100%; overflow: hidden; position: relative; }
    
    .floating-header {
      position: absolute; top: 1.5rem; left: 1.5rem; right: calc(30% + 3rem);
      z-index: 100; padding: 0.75rem 1.25rem;
      border-radius: 1rem; border: 1px solid rgba(255,255,255,0.4);
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    }

    .split-layout { display: grid; grid-template-columns: 1fr 30%; height: 100%; }
    .content-pane { background: #fff; }
    .scrollable-y { overflow-y: auto; overflow-x: hidden; }

    .map-pane { position: relative; border-left: 1px solid #f1f5f9; }
    .full-map { width: 100%; height: 100%; background: #eef2ff; }
    .map-overlay {
      position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem;
      padding: 1rem; border-radius: 1rem;
      border: 1px solid rgba(255,255,255,0.4);
    }

    .blur-effect {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .detail-stat-card {
      background: #f8fafc; padding: 1.25rem; border-radius: 1rem;
      position: relative; border: 1px solid #f1f5f9;
    }
    .detail-stat-card .label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
    .detail-stat-card .value { font-size: 1.5rem; font-weight: 800; display: block; margin-top: 0.25rem; }
    .detail-stat-card .icon { position: absolute; top: 1.25rem; right: 1.25rem; font-size: 1.25rem; color: #e2e8f0; }

    .minimal-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem; border-radius: 0.75rem; background: #fff;
      border: 1px solid #f1f5f9;
    }

    @media (max-width: 1280px) {
      .split-layout { grid-template-columns: 1fr; }
      .map-pane { display: none; }
      .floating-header { right: 1.5rem; }
    }
  `]
})
export class TripDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private travelService = inject(TravelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('detailMap') detailMapRef?: ElementRef<HTMLDivElement>;

  postId = '';
  post: BlogPost | null = null;
  trending = this.travelService.trendingPosts;
  comments: any[] = [];
  loading = this.travelService.loading;

  private map: any;
  private L: any;
  private mapMarker: any;
  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.postId = id;
    this.reload();
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

  reload(): void {
    if (!this.postId) return;
    
    forkJoin({
      post: this.travelService.getTrip(this.postId),
      trending: this.travelService.getTrending(4),
      comments: this.travelService.getPostComments(this.postId)
    }).subscribe({
      next: (res) => {
        this.post = res.post;
        this.comments = res.comments;
        if (this.post?.title) this.updateMapFocus(this.post.title);
      },
      error: (err) => {
        console.error('Failed to load story detail:', err);
      }
    });
  }

  navigateToList(): void {
    this.router.navigate(['/travel']);
  }

  getStatusSeverity(status?: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toLowerCase()) {
      case 'published': return 'success';
      default: return 'secondary';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  private async initMap(): Promise<void> {
    if (this.map || !this.detailMapRef?.nativeElement) return;
    const leaflet = await import('leaflet');
    this.L = leaflet;
    this.map = leaflet.map(this.detailMapRef.nativeElement, { zoomControl: false }).setView([16, 108], 5);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    leaflet.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  private setupResizeObserver(): void {
    if (this.detailMapRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
      this.resizeObserver.observe(this.detailMapRef.nativeElement);
    }
  }

  private async updateMapFocus(keyword: string): Promise<void> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(keyword)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0 && this.map && this.L) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        this.map.setView([lat, lon], 12);
        if (this.mapMarker) this.map.removeLayer(this.mapMarker);
        this.mapMarker = this.L.circleMarker([lat, lon], {
          radius: 10, color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.8, weight: 3
        }).addTo(this.map);
      }
    } catch (e) {
      console.warn('Map focus failed:', e);
    }
  }
}
