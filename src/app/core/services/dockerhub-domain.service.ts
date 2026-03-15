import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../config/api-config';

export interface DockerHubListResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  source: 'live' | 'sample' | string;
  errors?: string[];
}

export interface DockerHubImage {
  id: string;
  namespace: string;
  repository: string;
  tag: string;
  owner: string;
  visibility: string;
  architecture: string;
  status: string;
  last_pushed_at: string;
  pull_count: number;
  metadata: {
    digest: string;
    size_mb: number;
    base_image: string;
    vulnerabilities: number;
  };
}

export interface DockerHubNamespace {
  namespace: string;
  repositories: number;
  tags: number;
  images: number;
}

export interface DockerHubSummary {
  total_images: number;
  healthy_images: number;
  degraded_images: number;
  namespaces: number;
  repositories: number;
  visibilities: {
    private: number;
    public: number;
  };
  source?: string;
}

export interface DockerHubOverview {
  domain: string;
  display_name: string;
  purpose: string;
  capabilities: string[];
}

export interface DockerHubQuality {
  score: number;
  coverage: number;
  issues: number;
  last_reviewed_at: string;
}

export interface DockerHubCost {
  monthly_estimated_usd: number;
  notes: string[];
}

export interface DockerHubFeatures {
  domain: string;
  features: string[];
}

export interface DockerHubVersion {
  domain: string;
  version: string;
  api_version: string;
  status: string;
  build_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class DockerHubDomainService {
  private readonly baseUrl = `${getApiBase()}/data-mesh/domains/dockerhub`;

  constructor(private readonly http: HttpClient) {}

  getOverview(): Observable<DockerHubOverview> {
    return this.http.get<DockerHubOverview>(`${this.baseUrl}/overview`);
  }

  getSummary(): Observable<DockerHubSummary> {
    return this.http.get<DockerHubSummary>(`${this.baseUrl}/summary`);
  }

  getQuality(): Observable<DockerHubQuality> {
    return this.http.get<DockerHubQuality>(`${this.baseUrl}/quality`);
  }

  getCost(): Observable<DockerHubCost> {
    return this.http.get<DockerHubCost>(`${this.baseUrl}/cost`);
  }

  getFeatures(): Observable<DockerHubFeatures> {
    return this.http.get<DockerHubFeatures>(`${this.baseUrl}/features`);
  }

  getVersion(): Observable<DockerHubVersion> {
    return this.http.get<DockerHubVersion>(`${this.baseUrl}/version`);
  }

  getNamespaces(): Observable<{ data: DockerHubNamespace[]; total: number }> {
    return this.http.get<{ data: DockerHubNamespace[]; total: number }>(`${this.baseUrl}/namespaces`);
  }

  getImages(params: any = {}): Observable<DockerHubListResponse<DockerHubImage>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<DockerHubListResponse<DockerHubImage>>(`${this.baseUrl}/images`, { params: httpParams });
  }

  getImageDetail(id: string): Observable<DockerHubImage> {
    return this.http.get<DockerHubImage>(`${this.baseUrl}/images/${id}`);
  }
}
