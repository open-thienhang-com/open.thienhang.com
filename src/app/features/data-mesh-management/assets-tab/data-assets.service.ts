import { Injectable } from '@angular/core';
import { getApiBase } from '../../../core/config/api-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataAssetsService {
  private baseUrl = `${getApiBase()}/data-catalog`;

  constructor(private http: HttpClient) {}

  // Get assets list with filtering, search, and pagination
  getAssets(params: any = {}): Observable<any> {
    const query = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const url = query ? `${this.baseUrl}/assets?${query}` : `${this.baseUrl}/assets`;
    return this.http.get<any>(url);
  }

  // Legacy method for backward compatibility
  getAssetsWithParams(params: any): Observable<any> {
    return this.getAssets(params);
  }

  // Get asset by ID
  getAssetById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/asset/${id}`);
  }

  // Get domains tree for navigation
  getDomainsTree(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/domains-tree`);
  }

  // Get filter options
  getFilterOptions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/assets/filters`);
  }

  // Get asset statistics
  getAssetStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/assets/statistics`);
  }

  // Get assets by domain
  getAssetsByDomain(domainId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/assets/by-domain/${domainId}`);
  }

  // Get assets by data product
  getAssetsByProduct(productId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/assets/by-product/${productId}`);
  }

  // Create new asset
  createAsset(asset: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/asset`, asset);
  }

  // Update asset
  updateAsset(id: string, asset: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/asset/${id}`, asset);
  }

  // Delete asset
  deleteAsset(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/asset/${id}`);
  }

  // Bulk operations
  bulkAction(action: string, ids: string[], data?: any): Observable<any> {
    const payload = { action, ids, ...data };
    return this.http.post<any>(`${this.baseUrl}/assets/bulk-action`, payload);
  }
}
