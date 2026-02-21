import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import {
  ApiListResponse,
  Asset,
  AssetCreate,
  AssetUpdate,
  Booking,
  BookingCreate,
  BookingUpdate,
  BudgetItem,
  BudgetItemCreate,
  BudgetItemUpdate,
  ItineraryItem,
  ItineraryItemCreate,
  ItineraryItemUpdate,
  NotificationCreate,
  NotificationUpdate,
  Trip,
  TripCreate,
  TripNotification,
  TripUpdate
} from '../models/travel.model';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private http = inject(HttpClient);

  private get apiBase(): string {
    return getApiBase();
  }

  private get travelBaseUrl(): string {
    return `${this.apiBase}/data-mesh/domains/travel`;
  }

  private get assetsBaseUrl(): string {
    return `${this.apiBase}/data-catalog`;
  }

  // Trips
  listTrips(limit: number = 20, offset: number = 0): Observable<Trip[]> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));

    return this.http
      .get<ApiListResponse<Trip> | Trip[]>(`${this.travelBaseUrl}/trips`, { params })
      .pipe(map((res) => this.unwrapList<Trip>(res).map((trip) => this.normalizeTrip(trip))));
  }

  getTrip(tripId: string): Observable<Trip | null> {
    return this.http
      .get<any>(`${this.travelBaseUrl}/trips/${tripId}`)
      .pipe(map((res) => {
        const trip = this.unwrapOne<Trip>(res);
        return trip ? this.normalizeTrip(trip) : null;
      }));
  }

  createTrip(payload: TripCreate): Observable<Trip | null> {
    const body = this.normalizeTripPayload(payload);
    return this.http
      .post<any>(`${this.travelBaseUrl}/trips`, body)
      .pipe(map((res) => {
        const trip = this.unwrapOne<Trip>(res);
        return trip ? this.normalizeTrip(trip) : null;
      }));
  }

  updateTrip(tripId: string, payload: TripUpdate): Observable<Trip | null> {
    const body = this.normalizeTripPayload(payload);
    return this.http
      .put<any>(`${this.travelBaseUrl}/trips/${tripId}`, body)
      .pipe(map((res) => {
        const trip = this.unwrapOne<Trip>(res);
        return trip ? this.normalizeTrip(trip) : null;
      }));
  }

  deleteTrip(tripId: string): Observable<any> {
    return this.http.delete(`${this.travelBaseUrl}/trips/${tripId}`);
  }

  // Itinerary
  listItineraryItems(tripId: string): Observable<ItineraryItem[]> {
    return this.http
      .get<ApiListResponse<ItineraryItem> | ItineraryItem[]>(`${this.travelBaseUrl}/trips/${tripId}/itinerary`)
      .pipe(map((res) => this.unwrapList<ItineraryItem>(res)));
  }

  createItineraryItem(tripId: string, payload: ItineraryItemCreate): Observable<ItineraryItem | null> {
    return this.http
      .post<any>(`${this.travelBaseUrl}/trips/${tripId}/itinerary`, payload)
      .pipe(map((res) => this.unwrapOne<ItineraryItem>(res)));
  }

  updateItineraryItem(itemId: string, payload: ItineraryItemUpdate): Observable<ItineraryItem | null> {
    return this.http
      .put<any>(`${this.travelBaseUrl}/itinerary/${itemId}`, payload)
      .pipe(map((res) => this.unwrapOne<ItineraryItem>(res)));
  }

  deleteItineraryItem(itemId: string): Observable<any> {
    return this.http.delete(`${this.travelBaseUrl}/itinerary/${itemId}`);
  }

  // Bookings
  listBookings(tripId: string): Observable<Booking[]> {
    return this.http
      .get<ApiListResponse<Booking> | Booking[]>(`${this.travelBaseUrl}/trips/${tripId}/bookings`)
      .pipe(map((res) => this.unwrapList<Booking>(res)));
  }

  createBooking(tripId: string, payload: BookingCreate): Observable<Booking | null> {
    return this.http
      .post<any>(`${this.travelBaseUrl}/trips/${tripId}/bookings`, payload)
      .pipe(map((res) => this.unwrapOne<Booking>(res)));
  }

  updateBooking(bookingId: string, payload: BookingUpdate): Observable<Booking | null> {
    return this.http
      .put<any>(`${this.travelBaseUrl}/bookings/${bookingId}`, payload)
      .pipe(map((res) => this.unwrapOne<Booking>(res)));
  }

  deleteBooking(bookingId: string): Observable<any> {
    return this.http.delete(`${this.travelBaseUrl}/bookings/${bookingId}`);
  }

  // Budgets
  listBudgetItems(tripId: string): Observable<BudgetItem[]> {
    return this.http
      .get<ApiListResponse<BudgetItem> | BudgetItem[]>(`${this.travelBaseUrl}/trips/${tripId}/budgets`)
      .pipe(map((res) => this.unwrapList<BudgetItem>(res)));
  }

  createBudgetItem(tripId: string, payload: BudgetItemCreate): Observable<BudgetItem | null> {
    return this.http
      .post<any>(`${this.travelBaseUrl}/trips/${tripId}/budgets`, payload)
      .pipe(map((res) => this.unwrapOne<BudgetItem>(res)));
  }

  updateBudgetItem(itemId: string, payload: BudgetItemUpdate): Observable<BudgetItem | null> {
    return this.http
      .put<any>(`${this.travelBaseUrl}/budgets/${itemId}`, payload)
      .pipe(map((res) => this.unwrapOne<BudgetItem>(res)));
  }

  deleteBudgetItem(itemId: string): Observable<any> {
    return this.http.delete(`${this.travelBaseUrl}/budgets/${itemId}`);
  }

  // Notifications
  listNotifications(tripId: string): Observable<TripNotification[]> {
    return this.http
      .get<ApiListResponse<TripNotification> | TripNotification[]>(`${this.travelBaseUrl}/trips/${tripId}/notifications`)
      .pipe(map((res) => this.unwrapList<TripNotification>(res)));
  }

  createNotification(tripId: string, payload: NotificationCreate): Observable<TripNotification | null> {
    return this.http
      .post<any>(`${this.travelBaseUrl}/trips/${tripId}/notifications`, payload)
      .pipe(map((res) => this.unwrapOne<TripNotification>(res)));
  }

  updateNotification(notificationId: string, payload: NotificationUpdate): Observable<TripNotification | null> {
    return this.http
      .put<any>(`${this.travelBaseUrl}/notifications/${notificationId}`, payload)
      .pipe(map((res) => this.unwrapOne<TripNotification>(res)));
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.travelBaseUrl}/notifications/${notificationId}`);
  }

  // Data Catalog Assets
  listAssets(params?: Record<string, string | number | boolean | undefined>): Observable<Asset[]> {
    const httpParams = this.toHttpParams(params);
    return this.http
      .get<ApiListResponse<Asset> | Asset[]>(`${this.assetsBaseUrl}/assets`, { params: httpParams })
      .pipe(map((res) => this.unwrapList<Asset>(res)));
  }

  createAsset(payload: AssetCreate): Observable<Asset | null> {
    return this.http
      .post<any>(`${this.assetsBaseUrl}/asset`, payload)
      .pipe(map((res) => this.unwrapOne<Asset>(res)));
  }

  getAsset(assetId: string): Observable<Asset | null> {
    return this.http
      .get<any>(`${this.assetsBaseUrl}/asset/${assetId}`)
      .pipe(map((res) => this.unwrapOne<Asset>(res)));
  }

  updateAsset(assetId: string, payload: AssetUpdate): Observable<Asset | null> {
    return this.http
      .patch<any>(`${this.assetsBaseUrl}/asset/${assetId}`, payload)
      .pipe(map((res) => this.unwrapOne<Asset>(res)));
  }

  deleteAsset(assetId: string): Observable<any> {
    return this.http.delete(`${this.assetsBaseUrl}/asset/${assetId}`);
  }

  getAssetAccess(assetId: string): Observable<any> {
    return this.http.get(`${this.assetsBaseUrl}/asset/${assetId}/access`);
  }

  updateAssetAccess(assetId: string, payload: any): Observable<any> {
    return this.http.patch(`${this.assetsBaseUrl}/asset/${assetId}/access`, payload);
  }

  getAssetAudit(assetId: string): Observable<any> {
    return this.http.get(`${this.assetsBaseUrl}/asset/${assetId}/audit`);
  }

  approveAsset(assetId: string, payload: any = {}): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/approve`, payload);
  }

  rejectAsset(assetId: string, payload: any = {}): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/reject`, payload);
  }

  updateAssetMetadata(assetId: string, payload: any): Observable<any> {
    return this.http.patch(`${this.assetsBaseUrl}/asset/${assetId}/metadata`, payload);
  }

  searchAssets(params?: Record<string, string | number | boolean | undefined>): Observable<Asset[]> {
    const httpParams = this.toHttpParams(params);
    return this.http
      .get<ApiListResponse<Asset> | Asset[]>(`${this.assetsBaseUrl}/asset/search`, { params: httpParams })
      .pipe(map((res) => this.unwrapList<Asset>(res)));
  }

  getAssetLineage(assetId: string): Observable<any> {
    return this.http.get(`${this.assetsBaseUrl}/asset/${assetId}/lineage`);
  }

  checkAssetQuality(assetId: string, payload: any = {}): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/quality/check`, payload);
  }

  backupAsset(assetId: string, payload: any = {}): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/backup`, payload);
  }

  restoreAsset(assetId: string, payload: any = {}): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/restore`, payload);
  }

  updateAssetDocumentation(assetId: string, payload: any): Observable<any> {
    return this.http.patch(`${this.assetsBaseUrl}/asset/${assetId}/documentation`, payload);
  }

  sendAssetAlert(assetId: string, payload: any): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/alert`, payload);
  }

  uploadAssetImage(assetId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/image`, formData);
  }

  updateAssetTags(assetId: string, payload: any): Observable<any> {
    return this.http.patch(`${this.assetsBaseUrl}/asset/${assetId}/tags`, payload);
  }

  getAssetVersions(assetId: string): Observable<any> {
    return this.http.get(`${this.assetsBaseUrl}/asset/${assetId}/versions`);
  }

  rollbackAssetVersion(assetId: string, payload: any): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/asset/${assetId}/rollback`, payload);
  }

  bulkAssetsAction(payload: any): Observable<any> {
    return this.http.post(`${this.assetsBaseUrl}/assets/bulk-action`, payload);
  }

  getAssetsFilters(): Observable<any> {
    return this.http.get(`${this.assetsBaseUrl}/assets/filters`);
  }

  getAssetsStatistics(): Observable<any> {
    return this.http.get(`${this.assetsBaseUrl}/assets/statistics`);
  }

  getDomainsTree(): Observable<any> {
    return this.http.get(`${this.assetsBaseUrl}/domains-tree`);
  }

  private unwrapList<T>(response: ApiListResponse<T> | T[] | any): T[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }
    return [];
  }

  private unwrapOne<T>(response: any): T | null {
    if (response?.data?.data) {
      return response.data.data as T;
    }
    if (response?.data && !Array.isArray(response.data)) {
      return response.data as T;
    }
    if (response && !Array.isArray(response)) {
      return response as T;
    }
    return null;
  }

  private toHttpParams(params?: Record<string, string | number | boolean | undefined>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  private normalizeTripPayload(payload: Partial<TripCreate | TripUpdate>): Record<string, unknown> {
    const body: any = { ...payload };
    if (body.title && !body.name) {
      body.name = body.title;
    }
    delete body.title;
    return body;
  }

  private normalizeTrip(raw: any): Trip {
    const normalized: Trip = {
      ...raw,
      _id: raw?._id,
      id: raw?.id || raw?.trip_id || raw?._id,
      trip_id: raw?.trip_id || raw?.id || raw?._id,
      name: raw?.name || raw?.title || '',
      title: raw?.title || raw?.name || 'Untitled trip'
    };
    return normalized;
  }
}
