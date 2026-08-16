import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, tap } from 'rxjs';

import { getApiBase } from '../../../core/config/api-config';
import { BudgetItem, ItineraryItem, Trip, TripDetail } from '../models/journey.model';

@Injectable({ providedIn: 'root' })
export class JourneyService {
  private http = inject(HttpClient);

  trips = signal<Trip[]>([]);
  loading = signal<boolean>(false);
  total = signal<number>(0);

  private get travelBase(): string {
    return `${getApiBase()}/data-mesh/domains/travel`;
  }

  /**
   * GET /data-mesh/domains/travel/trips
   * The API has no server-side status/destination filter — callers filter the
   * returned list client-side (see HomeComponent/JourneyListComponent).
   */
  listTrips(params?: { limit?: number; offset?: number }): Observable<Trip[]> {
    this.loading.set(true);
    const httpParams = new HttpParams()
      .set('limit', String(params?.limit ?? 100))
      .set('offset', String(params?.offset ?? 0));

    return this.http.get<any>(`${this.travelBase}/trips`, { params: httpParams }).pipe(
      map((res) => this.unwrapList<Trip>(res).map((t) => this.withId(t))),
      tap((trips) => {
        this.trips.set(trips);
        this.total.set(trips.length);
        this.loading.set(false);
      })
    );
  }

  /** GET /data-mesh/domains/travel/trips/{id} */
  getTrip(id: string): Observable<Trip | null> {
    return this.http.get<any>(`${this.travelBase}/trips/${id}`).pipe(
      map((res) => {
        const trip = this.unwrapOne<Trip>(res);
        return trip ? this.withId(trip) : null;
      })
    );
  }

  /** GET /data-mesh/domains/travel/trips/{id}/itinerary */
  getItinerary(id: string): Observable<ItineraryItem[]> {
    return this.http
      .get<any>(`${this.travelBase}/trips/${id}/itinerary`, { params: new HttpParams().set('limit', '100') })
      .pipe(map((res) => this.unwrapList<ItineraryItem>(res).map((i) => this.withId(i))));
  }

  /** GET /data-mesh/domains/travel/trips/{id}/budgets */
  getBudgetItems(id: string): Observable<BudgetItem[]> {
    return this.http
      .get<any>(`${this.travelBase}/trips/${id}/budgets`, { params: new HttpParams().set('limit', '100') })
      .pipe(map((res) => this.unwrapList<BudgetItem>(res).map((b) => this.withId(b))));
  }

  /**
   * Combines trip + itinerary + budget items for the Journey Detail page.
   * `/trips/{id}/detail` exists on the API but currently 500s server-side, so this
   * fans out to the three confirmed-working endpoints instead.
   */
  getTripDetail(id: string): Observable<TripDetail | null> {
    return forkJoin({
      trip: this.getTrip(id),
      itinerary: this.getItinerary(id),
      budget_items: this.getBudgetItems(id),
    }).pipe(map(({ trip, itinerary, budget_items }) => (trip ? { ...trip, itinerary, budget_items } : null)));
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

  /** The API serializes Mongo documents with `_id`; normalize to `id` for the frontend. */
  private withId<T extends { id?: string; _id?: string }>(item: T): T {
    return { ...item, id: item.id ?? item._id };
  }
}
