import { Injectable } from '@angular/core';
import { getApiBase } from '../config/api-config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './governance.services';

export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  tags?: string[];
  owner?: string;
  source?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiInfo {
  id: string;
  name: string;
  description?: string;
  version?: string;
  baseUrl?: string;
  documentation?: string;
  owner?: string;
  status?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: string;
  connection_details?: any;
  owner?: string;
  status?: string;
  last_scanned?: Date;
  tables?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TableSchema {
  name: string;
  description?: string;
  columns: SchemaColumn[];
  primary_key?: string[];
  foreign_keys?: SchemaForeignKey[];
  indexes?: SchemaIndex[];
}

export interface SchemaColumn {
  name: string;
  type: string;
  description?: string;
  nullable?: boolean;
  default_value?: any;
  metadata?: any;
}

export interface SchemaForeignKey {
  columns: string[];
  referenced_table: string;
  referenced_columns: string[];
  on_update?: string;
  on_delete?: string;
}

export interface SchemaIndex {
  name: string;
  columns: string[];
  is_unique?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DiscoveryServices {
  private baseUrl = getApiBase();

  constructor(private http: HttpClient) { }

  // Data Catalog
  getCatalogItems(params?: any): Observable<ApiResponse<CatalogItem[]>> {
    const url = `${this.baseUrl}/discovery/catalog`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<CatalogItem[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getCatalogItem(id: string): Observable<ApiResponse<CatalogItem>> {
    const url = `${this.baseUrl}/discovery/catalog/${id}`;
    return this.http.get<CatalogItem>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  searchCatalog(query: string, filters?: any): Observable<ApiResponse<CatalogItem[]>> {
    const url = `${this.baseUrl}/discovery/catalog/search`;
    let httpParams = new HttpParams().set('q', query);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          httpParams = httpParams.set(key, filters[key]);
        }
      });
    }
    return this.http.get<CatalogItem[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  addToCatalog(data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    const url = `${this.baseUrl}/discovery/catalog`;
    return this.http.post<CatalogItem>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateCatalogItem(id: string, data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    const url = `${this.baseUrl}/discovery/catalog/${id}`;
    return this.http.put<CatalogItem>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeCatalogItem(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/discovery/catalog/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getCatalogTags(): Observable<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/discovery/catalog/tags`;
    return this.http.get<string[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getCatalogCategories(): Observable<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/discovery/catalog/categories`;
    return this.http.get<string[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  // API Explorer
  getAPIs(params?: any): Observable<ApiResponse<ApiInfo[]>> {
    const url = `${this.baseUrl}/discovery/apis`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiInfo[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAPI(id: string): Observable<ApiResponse<ApiInfo>> {
    const url = `${this.baseUrl}/discovery/api/${id}`;
    return this.http.get<ApiInfo>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getAPIDocumentation(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/discovery/api/${id}/docs`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getAPISpec(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/discovery/api/${id}/spec`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  testAPIEndpoint(id: string, endpoint: string, method: string, data?: any): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/discovery/api/${id}/test`;
    return this.http.post<any>(url, { endpoint, method, data })
      .pipe(map(response => this.wrapResponse(response)));
  }

  registerAPI(data: Partial<ApiInfo>): Observable<ApiResponse<ApiInfo>> {
    const url = `${this.baseUrl}/discovery/api`;
    return this.http.post<ApiInfo>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAPI(id: string, data: Partial<ApiInfo>): Observable<ApiResponse<ApiInfo>> {
    const url = `${this.baseUrl}/discovery/api/${id}`;
    return this.http.put<ApiInfo>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAPI(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/discovery/api/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Data Source Discovery
  getDataSources(params?: any): Observable<ApiResponse<DataSource[]>> {
    const url = `${this.baseUrl}/discovery/data-sources`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<DataSource[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getDataSource(id: string): Observable<ApiResponse<DataSource>> {
    const url = `${this.baseUrl}/discovery/data-source/${id}`;
    return this.http.get<DataSource>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  scanDataSource(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/discovery/data-source/${id}/scan`;
    return this.http.post<any>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  getDataSourceTables(id: string): Observable<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/discovery/data-source/${id}/tables`;
    return this.http.get<string[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getTableSchema(dataSourceId: string, tableName: string): Observable<ApiResponse<TableSchema>> {
    const url = `${this.baseUrl}/discovery/data-source/${dataSourceId}/table/${tableName}/schema`;
    return this.http.get<TableSchema>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  previewTableData(dataSourceId: string, tableName: string, limit: number = 100): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/discovery/data-source/${dataSourceId}/table/${tableName}/preview`;
    return this.http.get<any[]>(url, { params: { limit: limit.toString() } })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  // Search
  globalSearch(query: string, entityTypes?: string[]): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/discovery/search`;
    let httpParams = new HttpParams().set('q', query);
    if (entityTypes && entityTypes.length > 0) {
      httpParams = httpParams.set('types', entityTypes.join(','));
    }
    return this.http.get<any[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getSuggestions(query: string): Observable<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/discovery/search/suggestions`;
    return this.http.get<string[]>(url, { params: { q: query } })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getPopularSearches(): Observable<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/discovery/search/popular`;
    return this.http.get<string[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
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
