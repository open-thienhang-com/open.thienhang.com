import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../config/api-config';

export interface DatabricksListResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  source: 'live' | 'sample' | string;
  errors?: string[];
}

export interface DatabricksWorkspace {
  id: string;
  workspace_name: string;
  cloud: string;
  region: string;
  workspace_url_masked: string;
  owner: string;
  status: string;
  catalog_enabled: boolean;
  last_sync_at: string;
}

export interface DatabricksSqlAsset {
  id: string;
  asset_type: string;
  warehouse_name: string;
  catalog: string;
  schema_name: string;
  object_name: string;
  owner: string;
  status: string;
}

export interface DatabricksJob {
  id: string;
  name: string;
  owner: string;
  schedule: string;
  state: string;
  task_count: number;
  last_run_at: string;
}

export interface DatabricksModel {
  id: string;
  name: string;
  stage: string;
  version: string;
  owner: string;
  registry: string;
  updated_at: string;
}

export interface DatabricksOverview {
  domain: string;
  display_name: string;
  purpose: string;
  capabilities: string[];
  live_mode_enabled: boolean;
}

export interface DatabricksSummary {
  total_workspaces: number;
  connected_workspaces: number;
  sql_assets: number;
  jobs: number;
  models: number;
  clouds: Record<string, number>;
  source: string;
  errors?: string[];
}

export interface DatabricksHealth {
  status: string;
  configured: boolean;
  errors?: string[];
}

export interface DatabricksQuality {
  score: number;
  coverage: number;
  issues: number;
  last_reviewed_at: string;
}

export interface DatabricksCost {
  monthly_estimated_usd: number;
  notes: string[];
}

export interface DatabricksFeatures {
  domain: string;
  features: string[];
}

export interface DatabricksVersion {
  domain: string;
  version: string;
  api_version: string;
  status: string;
  build_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabricksDomainService {
  private readonly baseUrl = `${getApiBase()}/data-mesh/domains/databricks`;

  constructor(private readonly http: HttpClient) {}

  getOverview(): Observable<DatabricksOverview> {
    return this.http.get<DatabricksOverview>(`${this.baseUrl}/overview`);
  }

  getSummary(): Observable<DatabricksSummary> {
    return this.http.get<DatabricksSummary>(`${this.baseUrl}/summary`);
  }

  getHealth(): Observable<DatabricksHealth> {
    return this.http.get<DatabricksHealth>(`${this.baseUrl}/health`);
  }

  getQuality(): Observable<DatabricksQuality> {
    return this.http.get<DatabricksQuality>(`${this.baseUrl}/quality`);
  }

  getCost(): Observable<DatabricksCost> {
    return this.http.get<DatabricksCost>(`${this.baseUrl}/cost`);
  }

  getFeatures(): Observable<DatabricksFeatures> {
    return this.http.get<DatabricksFeatures>(`${this.baseUrl}/features`);
  }

  getVersion(): Observable<DatabricksVersion> {
    return this.http.get<DatabricksVersion>(`${this.baseUrl}/version`);
  }

  getRootWorkspaces(skip = 0, limit = 20): Observable<DatabricksListResponse<DatabricksWorkspace>> {
    return this.http.get<DatabricksListResponse<DatabricksWorkspace>>(`${this.baseUrl}/`, {
      params: this.buildPaginationParams(skip, limit)
    });
  }

  getWorkspaces(skip = 0, limit = 20): Observable<DatabricksListResponse<DatabricksWorkspace>> {
    return this.http.get<DatabricksListResponse<DatabricksWorkspace>>(`${this.baseUrl}/workspaces`, {
      params: this.buildPaginationParams(skip, limit)
    });
  }

  getWorkspaceDetail(id: string): Observable<DatabricksWorkspace> {
    return this.http.get<DatabricksWorkspace>(`${this.baseUrl}/workspaces/${id}`);
  }

  getSqlAssets(skip = 0, limit = 20): Observable<DatabricksListResponse<DatabricksSqlAsset>> {
    return this.http.get<DatabricksListResponse<DatabricksSqlAsset>>(`${this.baseUrl}/sql-assets`, {
      params: this.buildPaginationParams(skip, limit)
    });
  }

  getJobs(skip = 0, limit = 20): Observable<DatabricksListResponse<DatabricksJob>> {
    return this.http.get<DatabricksListResponse<DatabricksJob>>(`${this.baseUrl}/jobs`, {
      params: this.buildPaginationParams(skip, limit)
    });
  }

  getModels(skip = 0, limit = 20): Observable<DatabricksListResponse<DatabricksModel>> {
    return this.http.get<DatabricksListResponse<DatabricksModel>>(`${this.baseUrl}/models`, {
      params: this.buildPaginationParams(skip, limit)
    });
  }

  private buildPaginationParams(skip: number, limit: number): HttpParams {
    return new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
  }
}
