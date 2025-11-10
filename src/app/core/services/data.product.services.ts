import { Injectable } from '@angular/core';
import { getApiBase } from '../config/api-config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './governance.services';

export interface DataProduct {
  id: string;
  kid?: string | null;
  name: string;
  description?: string;
  domain?: string;
  owner?: {
    _id?: string | null;
    kid?: string;
    first_name?: string;
    email?: string;
    company?: string;
    last_name?: string;
  };
  teams?: any[];
  purpose?: string;
  consumers?: any;
  input_ports?: any;
  output_ports?: any;
  assets?: any[];
  policies?: any[];
  permissions?: any[];
  tags?: string[];
  quality_metrics?: any;
  lifecycle?: any;
  cost?: any;
  discoverability?: any;
  documentation?: any;
  apis?: any[];
  swagger?: string;
  openapi?: string;
  status?: string;
  type?: string;
  version?: string;
  schema?: any;
  api_endpoint?: string;
  metrics?: any;
  created_at?: string;
  updated_at?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DataProductSubscription {
  id: string;
  productId: string;
  userId: string;
  status: string;
  createdAt: Date;
}

export interface DataProductMetrics {
  id: string;
  productId: string;
  views: number;
  subscriptions: number;
  usage: any;
  quality: any;
  period: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataProductServices {
  private baseUrl = getApiBase();

  constructor(private http: HttpClient) { }

  // Data Products
  getDataProducts(params?: any): Observable<ApiResponse<DataProduct[]>> {
    const url = `${this.baseUrl}/data-mesh/data-products`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(url, { params: httpParams })
      .pipe(
        map(response => {
          // Handle the actual API response structure
          if (response && response.data && Array.isArray(response.data)) {
            return {
              data: response.data,
              total: response.total || response.data.length,
              success: true,
              message: response.message
            };
          } else {
            return {
              data: [],
              total: 0,
              success: false,
              message: response?.message || 'No data found'
            };
          }
        })
      );
  }

  getDataProductDetail(id: string, domain?: string): Observable<ApiResponse<DataProduct>> {
    const url = domain
      ? `${this.baseUrl}/data-mesh/data-products/${domain}/${id}`
      : `${this.baseUrl}/data-mesh/data-products/${id}`;
    return this.http.get<DataProduct>(url)
      .pipe(
        map(response => {
          // Handle the actual API response structure
          if (response) {
            return {
              data: response,
              success: true,
              message: 'Data product loaded successfully'
            };
          } else {
            return {
              data: null,
              success: false,
              message: 'Data product not found'
            };
          }
        })
      );
  }

  createDataProduct(data: DataProduct): Observable<ApiResponse<DataProduct>> {
    const url = `${this.baseUrl}/data-product`;
    return this.http.post<DataProduct>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateDataProduct(id: string, data: Partial<DataProduct>): Observable<ApiResponse<DataProduct>> {
    const url = `${this.baseUrl}/data-product/${id}`;
    return this.http.put<DataProduct>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteDataProduct(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-product/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  subscribeToProduct(productId: string): Observable<ApiResponse<DataProductSubscription>> {
    const url = `${this.baseUrl}/data-product/${productId}/subscribe`;
    return this.http.post<DataProductSubscription>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  unsubscribeFromProduct(productId: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-product/${productId}/unsubscribe`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getProductSubscribers(productId: string): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/data-product/${productId}/subscribers`;
    return this.http.get<any[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getProductMetrics(productId: string): Observable<ApiResponse<DataProductMetrics>> {
    const url = `${this.baseUrl}/data-product/${productId}/metrics`;
    return this.http.get<DataProductMetrics>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getProductSchema(productId: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-product/${productId}/schema`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getProductAPI(productId: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-product/${productId}/api`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  validateProductSchema(productId: string, schema: any): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-product/${productId}/validate-schema`;
    return this.http.post<any>(url, schema)
      .pipe(map(response => this.wrapResponse(response)));
  }

  publishProduct(productId: string): Observable<ApiResponse<DataProduct>> {
    const url = `${this.baseUrl}/data-product/${productId}/publish`;
    return this.http.post<DataProduct>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  archiveProduct(productId: string): Observable<ApiResponse<DataProduct>> {
    const url = `${this.baseUrl}/data-product/${productId}/archive`;
    return this.http.post<DataProduct>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Helper method to build HttpParams from object
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value.toString());
            });
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }
    return httpParams;
  }

  // Helper method to wrap a single object response to match the API response format
  private wrapResponse<T>(data: T): ApiResponse<T> {
    return { data, success: true };
  }

  // Helper method to wrap an array response to match the API response format
  private wrapArrayResponse<T>(data: T[]): ApiResponse<T[]> {
    return {
      data: data || [],
      total: Array.isArray(data) ? data.length : 0,
      success: true
    };
  }
}
