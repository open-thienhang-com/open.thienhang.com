import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, of } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import {
  ApiListResponse,
  Asset,
  AssetCreate,
  AssetUpdate,
  Trip,
  BlogPost,
  BlogAuthor,
  TravelAnalytics,
  UploadResult
} from '../models/travel.model';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private http = inject(HttpClient);

  // Signals for state management
  posts = signal<BlogPost[]>([]);
  trendingPosts = signal<BlogPost[]>([]);
  authors = signal<BlogAuthor[]>([]);
  analytics = signal<TravelAnalytics | null>(null);
  selectedPost = signal<BlogPost | null>(null);
  loading = signal<boolean>(false);

  // Legacy compatibility signals
  trips = signal<Trip[]>([]);
  selectedTripId = signal<string | null>(null);

  private get apiBase(): string {
    return getApiBase();
  }

  private get bloggerBaseUrl(): string {
    return `${this.apiBase}/data-mesh/domains/blogger`;
  }

  private get uploadsBaseUrl(): string {
    return `${this.apiBase}/data-mesh/domains/uploads`;
  }

  private get assetsBaseUrl(): string {
    return `${this.apiBase}/data-catalog`;
  }

  // --- Blogger Domain (Travel Stories/Destinations) ---

  listTrips(params?: { category?: string; tag?: string; author_id?: string; limit?: number; offset?: number }): Observable<BlogPost[]> {
    this.loading.set(true);
    let httpParams = new HttpParams()
      .set('limit', String(params?.limit || 20))
      .set('offset', String(params?.offset || 0));

    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.tag) httpParams = httpParams.set('tag', params.tag);
    if (params?.author_id) httpParams = httpParams.set('author_id', params.author_id);

    return this.http
      .get<ApiListResponse<BlogPost>>(`${this.bloggerBaseUrl}/posts`, { params: httpParams })
      .pipe(
        map((res) => this.unwrapList<BlogPost>(res)),
        tap((posts) => {
          this.posts.set(posts);
          // Legacy support
          this.trips.set(posts.map(p => this.mapPostToTrip(p)));
          this.loading.set(false);
        })
      );
  }

  getTrip(postId: string): Observable<BlogPost | null> {
    this.loading.set(true);
    return this.http
      .get<any>(`${this.bloggerBaseUrl}/posts/${postId}`)
      .pipe(
        map((res) => this.unwrapOne<BlogPost>(res)),
        tap((post) => {
          this.selectedPost.set(post);
          if (post) {
            this.selectedTripId.set(post.id);
          }
          this.loading.set(false);
        })
      );
  }

  getTrending(limit: number = 5): Observable<BlogPost[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http
      .get<ApiListResponse<BlogPost>>(`${this.bloggerBaseUrl}/posts/trending`, { params })
      .pipe(
        map((res) => this.unwrapList<BlogPost>(res)),
        tap((posts) => this.trendingPosts.set(posts))
      );
  }

  getAnalytics(): Observable<TravelAnalytics | null> {
    return this.http
      .get<any>(`${this.bloggerBaseUrl}/analytics`)
      .pipe(
        map((res) => this.unwrapOne<TravelAnalytics>(res)),
        tap((data) => this.analytics.set(data))
      );
  }

  getAuthors(): Observable<BlogAuthor[]> {
    return this.http
      .get<ApiListResponse<BlogAuthor>>(`${this.bloggerBaseUrl}/authors`)
      .pipe(
        map((res) => this.unwrapList<BlogAuthor>(res)),
        tap((authors) => this.authors.set(authors))
      );
  }

  getPostAnalytics(postId: string): Observable<any> {
    return this.http.get(`${this.bloggerBaseUrl}/posts/${postId}/analytics`);
  }

  getPostComments(postId: string): Observable<any[]> {
    return this.http
      .get<ApiListResponse<any>>(`${this.bloggerBaseUrl}/posts/${postId}/comments`)
      .pipe(map((res) => this.unwrapList<any>(res)));
  }

  // --- Uploads Domain ---

  uploadMedia(file: File, provider: 'imgur' | 'supabase' | 'gcs' = 'imgur'): Observable<UploadResult | null> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<any>(`${this.uploadsBaseUrl}/${provider}`, formData)
      .pipe(map((res) => this.unwrapOne<UploadResult>(res)));
  }

  // --- Legacy Compatibility / Stub Methods ---

  createTrip(payload: any): Observable<BlogPost | null> {
    return of(null).pipe(tap(() => this.listTrips().subscribe()));
  }

  updateTrip(tripId: string, payload: any): Observable<BlogPost | null> {
    return of(null).pipe(tap(() => this.listTrips().subscribe()));
  }

  deleteTrip(tripId: string): Observable<any> {
    return of({ success: true }).pipe(
      tap(() => {
        this.listTrips().subscribe();
        if (this.selectedTripId() === tripId) {
          this.selectedTripId.set(null);
        }
      })
    );
  }

  // --- Helpers & Adapters ---

  private mapPostToTrip(post: BlogPost): Trip {
    return {
      id: post.id,
      title: post.title,
      description: post.summary,
      cover_image: post.thumbnail,
      status: post.status,
      created_at: post.published_at
    };
  }

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

  private toHttpParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  // Assets Legacy
  listAssets(params?: any): Observable<Asset[]> {
    return this.http.get<any>(`${this.assetsBaseUrl}/assets`, { params: this.toHttpParams(params) })
      .pipe(map(res => this.unwrapList<Asset>(res)));
  }

  getAsset(id: string): Observable<Asset | null> {
    return this.http.get<any>(`${this.assetsBaseUrl}/asset/${id}`).pipe(map(res => this.unwrapOne<Asset>(res)));
  }
}
