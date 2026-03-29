import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, of } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import { ApiListResponse, UploadResult, BlogPost, BlogAuthor, TravelAnalytics } from '../models/travel.model';

// --- Real Travel API Response Shape ---
export interface TripApiItem {
  _id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  destination: string;
  budget: number;
  people_count: number;
  timezone: string;
  status: string;
  detail_image_urls: string[];
  thumbnail_image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface ItineraryApiItem {
  _id: string;
  trip_id: string;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  category?: string;
  order?: number;
  created_at?: string;
}

export interface TravelApiListResponse<T> {
  data: T[];
  message: string;
  total: number;
}

export interface TravelApiDetailResponse<T> {
  data: T;
  message: string;
  total?: number;
}

export interface TripCreatePayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  destination: string;
  budget?: number;
  people_count?: number;
  timezone?: string;
}

export interface ItineraryCreatePayload {
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  category?: string;
  order?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private http = inject(HttpClient);

  // ─── Signals ───
  trips = signal<TripApiItem[]>([]);
  selectedTrip = signal<TripApiItem | null>(null);
  itineraryItems = signal<ItineraryApiItem[]>([]);
  loading = signal<boolean>(false);
  total = signal<number>(0);

  // Legacy Blogger signals (kept for blog-based travel list)
  posts = signal<BlogPost[]>([]);
  trendingPosts = signal<BlogPost[]>([]);
  authors = signal<BlogAuthor[]>([]);
  analytics = signal<TravelAnalytics | null>(null);
  selectedPost = signal<BlogPost | null>(null);

  private get apiBase(): string { return getApiBase(); }

  private get travelBase(): string {
    return `${this.apiBase}/data-mesh/domains/travel`;
  }

  private get bloggerBase(): string {
    return `${this.apiBase}/data-mesh/domains/blogger`;
  }

  private get uploadsBase(): string {
    return `${this.apiBase}/data-mesh/domains/uploads`;
  }

  // ─────────────────────────────────────────────────────────
  // REAL TRAVEL DOMAIN ENDPOINTS
  // ─────────────────────────────────────────────────────────

  /** GET /data-mesh/domains/travel/trips */
  listTrips(params?: { limit?: number; offset?: number; status?: string }): Observable<TripApiItem[]> {
    this.loading.set(true);
    let httpParams = new HttpParams()
      .set('limit', String(params?.limit ?? 20))
      .set('offset', String(params?.offset ?? 0));
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http
      .get<TravelApiListResponse<TripApiItem>>(`${this.travelBase}/trips`, { params: httpParams })
      .pipe(
        map(res => res?.data ?? []),
        tap(items => {
          this.trips.set(items);
          this.total.set(items.length);
          this.loading.set(false);
        })
      );
  }

  /** GET /data-mesh/domains/travel/trips/{trip_id} */
  getTrip(tripId: string): Observable<TripApiItem | null> {
    this.loading.set(true);
    return this.http
      .get<TravelApiDetailResponse<TripApiItem>>(`${this.travelBase}/trips/${tripId}`)
      .pipe(
        map(res => res?.data ?? null),
        tap(trip => {
          this.selectedTrip.set(trip);
          this.loading.set(false);
        })
      );
  }

  /** POST /data-mesh/domains/travel/trips */
  createTrip(payload: TripCreatePayload): Observable<TripApiItem | null> {
    return this.http
      .post<TravelApiDetailResponse<TripApiItem>>(`${this.travelBase}/trips`, payload)
      .pipe(
        map(res => res?.data ?? null),
        tap(() => this.listTrips().subscribe())
      );
  }

  /** PATCH/PUT /data-mesh/domains/travel/trips/{trip_id} */
  updateTrip(tripId: string, payload: Partial<TripCreatePayload>): Observable<TripApiItem | null> {
    return this.http
      .put<TravelApiDetailResponse<TripApiItem>>(`${this.travelBase}/trips/${tripId}`, payload)
      .pipe(
        map(res => res?.data ?? null),
        tap(() => this.listTrips().subscribe())
      );
  }

  /** DELETE /data-mesh/domains/travel/trips/{trip_id} */
  deleteTrip(tripId: string): Observable<any> {
    return this.http
      .delete(`${this.travelBase}/trips/${tripId}`)
      .pipe(tap(() => this.listTrips().subscribe()));
  }

  /** GET /data-mesh/domains/travel/trips/{trip_id}/itinerary */
  getItinerary(
    tripId: string,
    params?: { limit?: number; offset?: number }
  ): Observable<ItineraryApiItem[]> {
    let httpParams = new HttpParams()
      .set('limit', String(params?.limit ?? 50))
      .set('offset', String(params?.offset ?? 0));

    return this.http
      .get<TravelApiListResponse<ItineraryApiItem>>(
        `${this.travelBase}/trips/${tripId}/itinerary`,
        { params: httpParams }
      )
      .pipe(
        map(res => res?.data ?? []),
        tap(items => this.itineraryItems.set(items))
      );
  }

  /** POST /data-mesh/domains/travel/trips/{trip_id}/itinerary */
  addItineraryItem(tripId: string, payload: ItineraryCreatePayload): Observable<ItineraryApiItem | null> {
    return this.http
      .post<TravelApiDetailResponse<ItineraryApiItem>>(
        `${this.travelBase}/trips/${tripId}/itinerary`,
        payload
      )
      .pipe(
        map(res => res?.data ?? null),
        tap(() => this.getItinerary(tripId).subscribe())
      );
  }

  // ─────────────────────────────────────────────────────────
  // UPLOADS DOMAIN
  // ─────────────────────────────────────────────────────────

  uploadMedia(file: File, provider: 'imgur' | 'supabase' | 'gcs' | 'imgbb' = 'imgur'): Observable<UploadResult | null> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<any>(`${this.uploadsBase}/${provider}`, formData)
      .pipe(map(res => this.unwrapOne<UploadResult>(res)));
  }

  // ─────────────────────────────────────────────────────────
  // LEGACY BLOGGER DOMAIN (kept for travel blog posts / stories)
  // ─────────────────────────────────────────────────────────

  listBlogPosts(params?: { limit?: number; offset?: number; category?: string; tag?: string }): Observable<BlogPost[]> {
    let httpParams = new HttpParams()
      .set('limit', String(params?.limit ?? 10))
      .set('offset', String(params?.offset ?? 0));
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.tag) httpParams = httpParams.set('tag', params.tag);

    return this.http
      .get<ApiListResponse<BlogPost>>(`${this.bloggerBase}/posts`, { params: httpParams })
      .pipe(
        map(res => this.unwrapList<BlogPost>(res)),
        tap(posts => this.posts.set(posts))
      );
  }

  getBlogPost(postId: string): Observable<BlogPost | null> {
    return this.http.get<any>(`${this.bloggerBase}/posts/${postId}`)
      .pipe(map(res => this.unwrapOne<BlogPost>(res)));
  }

  getTrending(limit = 5): Observable<BlogPost[]> {
    return this.http
      .get<ApiListResponse<BlogPost>>(`${this.bloggerBase}/posts/trending`, {
        params: new HttpParams().set('limit', String(limit))
      })
      .pipe(
        map(res => this.unwrapList<BlogPost>(res)),
        tap(posts => this.trendingPosts.set(posts))
      );
  }

  getPostComments(postId: string): Observable<any[]> {
    return this.http
      .get<ApiListResponse<any>>(`${this.bloggerBase}/posts/${postId}/comments`)
      .pipe(map(res => this.unwrapList<any>(res)));
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  private unwrapList<T>(response: any): T[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  }

  private unwrapOne<T>(response: any): T | null {
    if (response?.data?.data) return response.data.data as T;
    if (response?.data && !Array.isArray(response.data)) return response.data as T;
    if (response && !Array.isArray(response)) return response as T;
    return null;
  }
}
