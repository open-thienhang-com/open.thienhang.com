import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './governance.services';

export interface DataContract {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  consumer?: string;
  terms?: any;
  status?: string;
  version?: string;
  expiration_date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Domain {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  team?: string;
  data_products?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LineageNode {
  id: string;
  name: string;
  type: string;
  metadata?: any;
}

export interface LineageEdge {
  source: string;
  target: string;
  type: string;
  metadata?: any;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export interface QualityMetric {
  id: string;
  name: string;
  entity_id: string;
  entity_type: string;
  score: number;
  details?: any;
  timestamp: Date;
}

export interface QualityRule {
  id: string;
  name: string;
  description?: string;
  rule_type: string;
  entity_types: string[];
  parameters?: any;
  severity: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SchemaRegistryItem {
  id: string;
  name: string;
  namespace?: string;
  version: string;
  schema_type: string;
  schema: any;
  owner?: string;
  status?: string;
  compatibility?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DataMeshServices {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) { }

  // Data Contracts
  getDataContracts(params?: any): Observable<ApiResponse<DataContract[]>> {
    const url = `${this.baseUrl}/data-mesh/contracts`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<DataContract[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getDataContract(id: string): Observable<ApiResponse<DataContract>> {
    const url = `${this.baseUrl}/data-mesh/contract/${id}`;
    return this.http.get<DataContract>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createDataContract(data: Partial<DataContract>): Observable<ApiResponse<DataContract>> {
    const url = `${this.baseUrl}/data-mesh/contract`;
    return this.http.post<DataContract>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateDataContract(id: string, data: Partial<DataContract>): Observable<ApiResponse<DataContract>> {
    const url = `${this.baseUrl}/data-mesh/contract/${id}`;
    return this.http.put<DataContract>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteDataContract(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/contract/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  validateDataContract(data: any): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/contract/validate`;
    return this.http.post<any>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Domain Catalog
  getDomains(params?: any): Observable<ApiResponse<Domain[]>> {
    const url = `${this.baseUrl}/data-mesh/domains`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Domain[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getDomain(id: string): Observable<ApiResponse<Domain>> {
    const url = `${this.baseUrl}/data-mesh/domain/${id}`;
    return this.http.get<Domain>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createDomain(data: Partial<Domain>): Observable<ApiResponse<Domain>> {
    const url = `${this.baseUrl}/data-mesh/domain`;
    return this.http.post<Domain>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateDomain(id: string, data: Partial<Domain>): Observable<ApiResponse<Domain>> {
    const url = `${this.baseUrl}/data-mesh/domain/${id}`;
    return this.http.put<Domain>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteDomain(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/domain/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getDomainDataProducts(domainId: string): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/data-mesh/domain/${domainId}/data-products`;
    return this.http.get<any[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getDomainMetrics(domainId: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/domain/${domainId}/metrics`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Data Lineage
  getDataLineage(params?: any): Observable<ApiResponse<LineageGraph>> {
    const url = `${this.baseUrl}/data-mesh/lineage`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<LineageGraph>(url, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  getEntityLineage(entityId: string, entityType: string): Observable<ApiResponse<LineageGraph>> {
    const url = `${this.baseUrl}/data-mesh/lineage/${entityType}/${entityId}`;
    return this.http.get<LineageGraph>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getUpstreamLineage(entityId: string, entityType: string): Observable<ApiResponse<LineageGraph>> {
    const url = `${this.baseUrl}/data-mesh/lineage/${entityType}/${entityId}/upstream`;
    return this.http.get<LineageGraph>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getDownstreamLineage(entityId: string, entityType: string): Observable<ApiResponse<LineageGraph>> {
    const url = `${this.baseUrl}/data-mesh/lineage/${entityType}/${entityId}/downstream`;
    return this.http.get<LineageGraph>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Quality Metrics
  getQualityMetrics(params?: any): Observable<ApiResponse<QualityMetric[]>> {
    const url = `${this.baseUrl}/data-mesh/quality/metrics`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<QualityMetric[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getQualityRules(): Observable<ApiResponse<QualityRule[]>> {
    const url = `${this.baseUrl}/data-mesh/quality/rules`;
    return this.http.get<QualityRule[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  createQualityRule(data: Partial<QualityRule>): Observable<ApiResponse<QualityRule>> {
    const url = `${this.baseUrl}/data-mesh/quality/rule`;
    return this.http.post<QualityRule>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateQualityRule(id: string, data: Partial<QualityRule>): Observable<ApiResponse<QualityRule>> {
    const url = `${this.baseUrl}/data-mesh/quality/rule/${id}`;
    return this.http.put<QualityRule>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteQualityRule(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/quality/rule/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  runQualityCheck(entityId: string, entityType: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/quality/check`;
    return this.http.post<any>(url, { entityId, entityType })
      .pipe(map(response => this.wrapResponse(response)));
  }

  getQualityHistory(entityId: string, entityType: string): Observable<ApiResponse<QualityMetric[]>> {
    const url = `${this.baseUrl}/data-mesh/quality/history/${entityType}/${entityId}`;
    return this.http.get<QualityMetric[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  // Schema Registry
  getSchemas(params?: any): Observable<ApiResponse<SchemaRegistryItem[]>> {
    const url = `${this.baseUrl}/data-mesh/schema-registry`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<SchemaRegistryItem[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getSchema(id: string): Observable<ApiResponse<SchemaRegistryItem>> {
    const url = `${this.baseUrl}/data-mesh/schema-registry/${id}`;
    return this.http.get<SchemaRegistryItem>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  registerSchema(data: Partial<SchemaRegistryItem>): Observable<ApiResponse<SchemaRegistryItem>> {
    const url = `${this.baseUrl}/data-mesh/schema-registry`;
    return this.http.post<SchemaRegistryItem>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateSchema(id: string, data: Partial<SchemaRegistryItem>): Observable<ApiResponse<SchemaRegistryItem>> {
    const url = `${this.baseUrl}/data-mesh/schema-registry/${id}`;
    return this.http.put<SchemaRegistryItem>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteSchema(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/schema-registry/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  validateSchema(data: any): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/data-mesh/schema-registry/validate`;
    return this.http.post<any>(url, data)
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
