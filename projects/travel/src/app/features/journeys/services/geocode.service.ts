import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Trip records only store a free-text `destination`/`location`, no lat/lng — this
 * calls the public OSM Nominatim service (same approach as map.thienhang.com) to
 * resolve a place name to coordinates for the journey map. Nominatim's usage policy
 * caps this at ~1 req/sec and disallows heavy/production traffic; swap for a paid
 * provider or self-hosted Nominatim before this sees real load.
 */
@Injectable({ providedIn: 'root' })
export class GeocodeService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<GeocodeResult[]> {
    const params = new URLSearchParams({
      format: 'json',
      addressdetails: '0',
      limit: '3',
      q: query,
    });
    return this.http.get<NominatimResult[]>(`${this.baseUrl}?${params.toString()}`).pipe(
      map((results) =>
        results.map((r) => ({
          displayName: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        }))
      )
    );
  }
}
