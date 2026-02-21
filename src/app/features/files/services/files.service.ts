import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import {
  FilesVersion,
  FilesOverview,
  FilesQuality,
  FilesCost,
  FilesFeatures,
  FilesSummary,
  FilesListResponse,
  ManagedFile,
  FilesStatsSummary,
  FilesUsageStats,
  FileUploadResponse,
} from '../models/files.model';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private http = inject(HttpClient);
  private apiBase = getApiBase();
  private filesBaseUrl = `${this.apiBase}/data-mesh/domains/files`;

  getVersion(): Observable<FilesVersion> {
    return this.http.get<FilesVersion>(`${this.filesBaseUrl}/version`);
  }

  getOverview(): Observable<FilesOverview> {
    return this.http.get<FilesOverview>(`${this.filesBaseUrl}/overview`);
  }

  getQuality(): Observable<FilesQuality> {
    return this.http.get<FilesQuality>(`${this.filesBaseUrl}/quality`);
  }

  getCost(): Observable<FilesCost> {
    return this.http.get<FilesCost>(`${this.filesBaseUrl}/cost`);
  }

  getFeatures(): Observable<FilesFeatures> {
    return this.http.get<FilesFeatures>(`${this.filesBaseUrl}/features`);
  }

  getSummary(): Observable<FilesSummary> {
    return this.http.get<FilesSummary>(`${this.filesBaseUrl}/summary`);
  }

  getFiles(limit: number = 10, offset: number = 0): Observable<FilesListResponse> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));
    return this.http.get<FilesListResponse>(`${this.filesBaseUrl}/`, { params });
  }

  getFileDetail(id: string): Observable<ManagedFile> {
    return this.http.get<ManagedFile>(`${this.filesBaseUrl}/${id}`);
  }

  getStatsSummary(): Observable<FilesStatsSummary> {
    return this.http.get<FilesStatsSummary>(`${this.filesBaseUrl}/stats/summary`);
  }

  getStatsUsage(): Observable<FilesUsageStats> {
    return this.http.get<FilesUsageStats>(`${this.filesBaseUrl}/stats/usage`);
  }

  uploadFile(provider: 'local' | 'supabase' | 'imagekit', file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<FileUploadResponse>(`${this.filesBaseUrl}/upload/${provider}`, formData);
  }
}
