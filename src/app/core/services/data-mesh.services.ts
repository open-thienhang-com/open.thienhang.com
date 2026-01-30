import { Injectable } from '@angular/core';
import { getApiBase } from '../config/api-config';
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

// Updated interfaces to match the new API structure
export interface DataProduct {
  name: string;
  description: string;
  endpoints_count?: number;
  endpoints?: ApiEndpoint[];
}

export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  full_path: string;
}

export interface DomainMetrics {
  subscribers: number;
  quality_score: string;
}

export interface DomainSLA {
  availability: string;
  freshness: string;
  version: string;
}

export interface DomainContact {
  email: string;
  slack: string;
  support: string;
}

export interface Domain {
  domain_key: string;
  name: string;
  display_name: string;
  status: string;
  team: string;
  owner: string;
  description: string;
  metrics: DomainMetrics;
  tags: string[];
  sla: DomainSLA;
  data_products: DataProduct[];
  contact: DomainContact;
}

export interface DomainCatalogResponse {
  data: Domain[];
  message: string;
  total: number;
}

export interface DomainsListResponse {
  data: string[];
  message: string;
  total: number;
}

export interface DomainDetailsResponse {
  data: Domain;
  message: string;
  total: number;
}

// New interfaces for data products
export interface DataProductSummary {
  id: string;
  name: string;
  domain: string;
  description: string;
  owner: any;
}

export interface DataProductDetail {
  id: string;
  kid: string | null;
  name: string;
  description: string;
  domain: string;
  owner: {
    _id: string | null;
    kid: string;
    first_name: string;
    email: string;
    company: string;
    last_name: string;
  };
  teams: any[];
  purpose: string;
  consumers: any;
  input_ports: any;
  output_ports: any;
  assets: any[];
  policies: any[];
  permissions: any[];
  tags: any[];
  quality_metrics: any;
  lifecycle: any;
  cost: any;
  discoverability: any;
  documentation: any;
  apis: any[];
  swagger: string;
  openapi: string;
  created_at: string;
  updated_at: string;
}

export interface DataProductsResponse {
  data: DataProductSummary[];
  message: string;
  total: number;
}

export interface DataProductsByDomainResponse {
  data: DataProductSummary[];
  message: string;
  total: number;
}

// New interfaces for APIs
export interface ApiInfo {
  domain: string;
  data_product: string;
  path: string;
  method: string;
  description: string;
  full_path: string;
  source: string;
}

export interface ApiResponse_DataMesh {
  data: {
    apis: ApiInfo[];
    grouped_by_domain: { [key: string]: ApiInfo[] };
    pagination: {
      offset: number;
      limit: number;
      total: number;
      has_next: boolean;
    };
  };
  message: string;
  total: number;
}

// Health check interface
export interface DataMeshHealth {
  platform_status: string;
  total_domains: number;
  active_domains: number;
  domains: string[];
  timestamp: string;
}

export interface DataMeshHealthResponse {
  data: DataMeshHealth;
  message: string;
  total: number;
}

// ...existing interfaces...

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
  private baseUrl = getApiBase();

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

  // Domain Catalog - Updated for new API structure
  getDomainCatalog(params?: any): Observable<ApiResponse<Domain[]>> {
    // Call the /data-mesh/catalog endpoint
    const url = `${this.baseUrl}/data-mesh/catalog`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<DomainCatalogResponse>(url, { params: httpParams })
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            total: response.total,
            success: true,
            message: response.message
          };
        }
        return {
          data: [],
          success: false,
          message: 'Failed to retrieve domain catalog'
        };
      }));
  }

  // Get list of domain names only
  getDomainsList(): Observable<ApiResponse<string[]>> {
    const url = `${this.baseUrl}/data-mesh/domains`;
    return this.http.get<DomainsListResponse>(url)
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            total: response.total,
            success: true,
            message: response.message
          };
        }
        return {
          data: [],
          success: false,
          message: 'Failed to retrieve domains list'
        };
      }));
  }

  // Get detailed information about a specific domain
  getDomainDetails(domainKey: string): Observable<ApiResponse<Domain>> {
    const url = `${this.baseUrl}/data-mesh/domains/${domainKey}`;
    return this.http.get<DomainDetailsResponse>(url)
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            success: true,
            message: response.message
          };
        }
        return {
          data: null as any,
          success: false,
          message: `Failed to retrieve domain ${domainKey}`
        };
      }));
  }

  // Get data products for a specific domain
  getDomainDataProducts(domainKey: string): Observable<ApiResponse<DataProduct[]>> {
    const url = `${this.baseUrl}/data-mesh/domains/${domainKey}/data-products`;
    return this.http.get<{ data: DataProduct[], message: string, total: number }>(url)
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            total: response.total,
            success: true,
            message: response.message
          };
        }
        return {
          data: [],
          success: false,
          message: `Failed to get data products for domain ${domainKey}`
        };
      }));
  }

  // Data Products APIs
  getDataProducts(params?: { size?: number; offset?: number; domain?: string }): Observable<ApiResponse<DataProductSummary[]>> {
    const url = `${this.baseUrl}/data-mesh/data-products`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<DataProductsResponse>(url, { params: httpParams })
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            total: response.total,
            success: true,
            message: response.message
          };
        }
        return {
          data: [],
          success: false,
          message: 'Failed to retrieve data products'
        };
      }));
  }

  // Get data products by domain
  getDataProductsByDomain(domain: string): Observable<ApiResponse<DataProductSummary[]>> {
    const url = `${this.baseUrl}/data-mesh/data-products/${domain}`;
    return this.http.get<DataProductsByDomainResponse>(url)
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            total: response.total,
            success: true,
            message: response.message
          };
        }
        return {
          data: [],
          success: false,
          message: `Failed to retrieve data products for domain ${domain}`
        };
      }));
  }

  // Get specific data product details
  getDataProductDetails(domain: string, id: string): Observable<ApiResponse<DataProductDetail>> {
    const url = `${this.baseUrl}/data-mesh/data-products/${domain}/${id}`;
    return this.http.get<DataProductDetail>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Get specific data product details by name (for the new hotel endpoint)
  getDataProductDetailsByName(name: string): Observable<ApiResponse<DataProductDetail>> {
    const url = `${this.baseUrl}/data-mesh/data-products/${name}`;
    return this.http.get<DataProductDetail>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Get all APIs with pagination and filtering
  getApis(params?: {
    include_dynamic?: boolean;
    size?: number;
    offset?: number;
    domain?: string;
    search?: string;
  }): Observable<ApiResponse<ApiResponse_DataMesh['data']>> {
    const url = `${this.baseUrl}/data-mesh/apis`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse_DataMesh>(url, { params: httpParams })
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            total: response.total,
            success: true,
            message: response.message
          };
        }
        return {
          data: null as any,
          success: false,
          message: 'Failed to retrieve APIs'
        };
      }));
  }

  // Health check
  getDataMeshHealth(): Observable<ApiResponse<DataMeshHealth>> {
    const url = `${this.baseUrl}/data-mesh/health`;
    return this.http.get<DataMeshHealthResponse>(url)
      .pipe(map(response => {
        if (response && response.data) {
          return {
            data: response.data,
            success: true,
            message: response.message
          };
        }
        return {
          data: null as any,
          success: false,
          message: 'Failed to retrieve health status'
        };
      }));
  }

  // Legacy methods for backward compatibility
  getDomains(params?: any): Observable<ApiResponse<Domain[]>> {
    return this.getDomainCatalog(params);
  }

  getDomain(domainKey: string): Observable<ApiResponse<Domain>> {
    return this.getDomainDetails(domainKey);
  }

  getDomainByKey(domainKey: string): Observable<ApiResponse<Domain>> {
    return this.getDomainDetails(domainKey);
  }

  // Domain statistics and metrics
  getDomainMetrics(domainKey: string): Observable<ApiResponse<DomainMetrics>> {
    return this.getDomainDetails(domainKey).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            data: response.data.metrics,
            success: true,
            message: `Metrics for domain ${domainKey} retrieved`
          };
        }
        return {
          data: null as any,
          success: false,
          message: `Failed to get metrics for domain ${domainKey}`
        };
      })
    );
  }

  getDomainSLA(domainKey: string): Observable<ApiResponse<DomainSLA>> {
    return this.getDomainDetails(domainKey).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            data: response.data.sla,
            success: true,
            message: `SLA for domain ${domainKey} retrieved`
          };
        }
        return {
          data: null as any,
          success: false,
          message: `Failed to get SLA for domain ${domainKey}`
        };
      })
    );
  }

  // Search and filter domains
  searchDomains(searchTerm: string): Observable<ApiResponse<Domain[]>> {
    return this.getDomainCatalog().pipe(
      map(response => {
        if (response.success && response.data) {
          const filteredDomains = response.data.filter(domain =>
            domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            domain.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            domain.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            domain.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          return {
            data: filteredDomains,
            success: true,
            message: `Found ${filteredDomains.length} domains matching "${searchTerm}"`
          };
        }
        return response;
      })
    );
  }

  filterDomainsByStatus(status: string): Observable<ApiResponse<Domain[]>> {
    return this.getDomainCatalog().pipe(
      map(response => {
        if (response.success && response.data) {
          const filteredDomains = response.data.filter(domain =>
            domain.status.toLowerCase() === status.toLowerCase()
          );
          return {
            data: filteredDomains,
            success: true,
            message: `Found ${filteredDomains.length} domains with status "${status}"`
          };
        }
        return response;
      })
    );
  }

  filterDomainsByTeam(team: string): Observable<ApiResponse<Domain[]>> {
    return this.getDomainCatalog().pipe(
      map(response => {
        if (response.success && response.data) {
          const filteredDomains = response.data.filter(domain =>
            domain.team.toLowerCase().includes(team.toLowerCase())
          );
          return {
            data: filteredDomains,
            success: true,
            message: `Found ${filteredDomains.length} domains for team "${team}"`
          };
        }
        return response;
      })
    );
  }

  // Search APIs
  searchApis(searchTerm: string, params?: { include_dynamic?: boolean; size?: number; offset?: number }): Observable<ApiResponse<ApiResponse_DataMesh['data']>> {
    const searchParams = {
      ...params,
      search: searchTerm
    };
    return this.getApis(searchParams);
  }

  // Filter APIs by domain
  getApisByDomain(domain: string, params?: { include_dynamic?: boolean; size?: number; offset?: number }): Observable<ApiResponse<ApiInfo[]>> {
    return this.getApis({ ...params, domain }).pipe(
      map(response => {
        if (response.success && response.data) {
          const domainApis = response.data.grouped_by_domain[domain] || [];
          return {
            data: domainApis,
            success: true,
            message: `Found ${domainApis.length} APIs for domain ${domain}`
          };
        }
        return {
          data: [],
          success: false,
          message: `Failed to get APIs for domain ${domain}`
        };
      })
    );
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
