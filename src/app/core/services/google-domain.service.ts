import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../config/api-config';

export interface GoogleAuthUrlResponse {
  authorization_url: string;
  state: string;
  scopes: string[];
  redirect_uri: string;
}

export interface GoogleConnectResponse {
  status: string;
  credential_id: string;
  linked_account: string;
  granted_scopes: string[];
  expires_at: string;
  next_actions: string[];
}

export interface GoogleCredential {
  credential_id: string;
  google_account_email: string;
  scopes: string[];
  status: string;
  expires_at: string;
  has_refresh_token: boolean;
  access_token_masked?: string;
  refresh_token_masked?: string;
}

export interface GoogleCredentialsResponse {
  data: GoogleCredential[];
  total: number;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

export interface GoogleDriveFilesResponse {
  service: string;
  credential_id: string;
  data: {
    files: GoogleDriveFile[];
    nextPageToken?: string | null;
  };
}

export interface GoogleGmailProfileResponse {
  service: string;
  credential_id: string;
  data: {
    emailAddress: string;
    messagesTotal: number;
    threadsTotal: number;
  };
}

export interface GoogleIntegration {
  id: string;
  service: string;
  resource_name: string;
  project_id: string;
  region: string;
  owner: string;
  status: string;
  last_sync_at: string;
  metadata?: Record<string, unknown>;
}

export interface GoogleIntegrationListResponse {
  data: GoogleIntegration[];
  total: number;
  page: number;
  page_size: number;
}

export interface GoogleOverview {
  domain?: string;
  display_name?: string;
  purpose?: string;
  capabilities?: string[];
  oauth_enabled?: boolean;
  inventory_mode?: string;
}

export interface GoogleSummary {
  total_integrations?: number;
  healthy_integrations?: number;
  degraded_integrations?: number;
  projects?: number;
  services?: number;
  errors?: string[];
  [key: string]: unknown;
}

export interface GoogleServicesRollup {
  services?: Array<{
    service: string;
    total: number;
    healthy?: number;
    degraded?: number;
  }>;
  data?: Array<{
    service: string;
    total: number;
    healthy?: number;
    degraded?: number;
  }>;
}

export interface GoogleQuality {
  score: number;
  coverage?: number;
  issues?: number;
  last_reviewed_at?: string;
}

export interface GoogleCost {
  monthly_estimated_usd?: number;
  notes?: string[];
}

export interface GoogleFeatures {
  domain?: string;
  features: string[];
}

export interface GoogleVersion {
  domain?: string;
  version?: string;
  api_version?: string;
  status?: string;
  build_date?: string;
}

export interface GoogleIntegrationFilters {
  skip?: number;
  limit?: number;
  service?: string;
  project_id?: string;
  owner?: string;
  status?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDomainService {
  private readonly baseUrl = `${getApiBase()}/data-mesh/domains/google`;

  constructor(private readonly http: HttpClient) {}

  getAuthorizationUrl(): Observable<GoogleAuthUrlResponse> {
    return this.http.get<GoogleAuthUrlResponse>(`${this.baseUrl}/auth/google/url`);
  }

  exchangeCode(code: string, state: string): Observable<GoogleConnectResponse> {
    return this.http.post<GoogleConnectResponse>(`${this.baseUrl}/auth/google/exchange`, { code, state });
  }

  refreshCredential(credentialId: string): Observable<GoogleConnectResponse> {
    return this.http.post<GoogleConnectResponse>(`${this.baseUrl}/auth/google/refresh`, {
      credential_id: credentialId
    });
  }

  disconnectCredential(credentialId: string): Observable<{ status?: string }> {
    return this.http.delete<{ status?: string }>(`${this.baseUrl}/auth/google/disconnect`, {
      body: { credential_id: credentialId }
    });
  }

  getCredentials(): Observable<GoogleCredentialsResponse> {
    return this.http.get<GoogleCredentialsResponse>(`${this.baseUrl}/credentials`);
  }

  getDriveFiles(credentialId: string, pageSize = 20): Observable<GoogleDriveFilesResponse> {
    return this.http.get<GoogleDriveFilesResponse>(`${this.baseUrl}/drive/files`, {
      params: new HttpParams()
        .set('credential_id', credentialId)
        .set('page_size', pageSize)
    });
  }

  getGmailProfile(credentialId: string): Observable<GoogleGmailProfileResponse> {
    return this.http.get<GoogleGmailProfileResponse>(`${this.baseUrl}/gmail/profile`, {
      params: new HttpParams().set('credential_id', credentialId)
    });
  }

  getRootIntegrations(filters: GoogleIntegrationFilters = {}): Observable<GoogleIntegrationListResponse> {
    return this.http.get<GoogleIntegrationListResponse>(`${this.baseUrl}/`, {
      params: this.buildFilterParams(filters)
    });
  }

  getIntegrations(filters: GoogleIntegrationFilters = {}): Observable<GoogleIntegrationListResponse> {
    return this.http.get<GoogleIntegrationListResponse>(`${this.baseUrl}/integrations`, {
      params: this.buildFilterParams(filters)
    });
  }

  getIntegrationDetail(integrationId: string): Observable<GoogleIntegration> {
    return this.http.get<GoogleIntegration>(`${this.baseUrl}/integrations/${integrationId}`);
  }

  getOverview(): Observable<GoogleOverview> {
    return this.http.get<GoogleOverview>(`${this.baseUrl}/overview`);
  }

  getSummary(): Observable<GoogleSummary> {
    return this.http.get<GoogleSummary>(`${this.baseUrl}/summary`);
  }

  getServices(): Observable<GoogleServicesRollup> {
    return this.http.get<GoogleServicesRollup>(`${this.baseUrl}/services`);
  }

  getQuality(): Observable<GoogleQuality> {
    return this.http.get<GoogleQuality>(`${this.baseUrl}/quality`);
  }

  getCost(): Observable<GoogleCost> {
    return this.http.get<GoogleCost>(`${this.baseUrl}/cost`);
  }

  getFeatures(): Observable<GoogleFeatures> {
    return this.http.get<GoogleFeatures>(`${this.baseUrl}/features`);
  }

  getVersion(): Observable<GoogleVersion> {
    return this.http.get<GoogleVersion>(`${this.baseUrl}/version`);
  }

  private buildFilterParams(filters: GoogleIntegrationFilters): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, `${value}`);
      }
    });
    return params;
  }
}
