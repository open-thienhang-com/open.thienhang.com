import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataAssetsService {
  private baseUrl = 'https://api.thienhang.com/data-catalog/assets';

  constructor(private http: HttpClient) {}

  getAssets(type: string, size: number = 10, offset: number = 0, search: string = ''): Observable<any> {
    let url = `${this.baseUrl}?type=${type}&size=${size}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url);
  }

  getAssetsWithParams(params: any): Observable<any> {
    // Xây dựng query string từ params
    const query = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const url = query ? `${this.baseUrl}?${query}` : this.baseUrl;
    return this.http.get<any>(url);
  }

  getAssetById(id: string): Observable<any> {
    return this.http.get<any>(`https://api.thienhang.com/data-catalog/asset/${id}`);
  }
}
