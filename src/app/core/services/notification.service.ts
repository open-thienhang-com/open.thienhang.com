import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './governance.services';

export interface NotificationTemplate {
  id: string;
  code: string;
  locale: string;
  channel: string;
  subject?: string;
  body: string;
  description?: string;
  version: number;
  is_builtin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListTemplatesResponse {
  list: NotificationTemplate[];
  total: number;
  page: number;
  size: number;
}

export interface AuditLog {
  id: string;
  notification_id: string;
  recipient: string;
  channel: string;
  status: string;
  event_type: string;
  message?: string;
  error_details?: string;
  metadata?: any;
  created_at: string;
}

export interface ListAuditResponse {
  list: AuditLog[];
  total: number;
}

export interface AuditQueryFilter {
  message_id?: string;
  recipient?: string;
  channel?: string;
  status?: string;
  event_type?: string;
  from_time?: string;
  to_time?: string;
  offset?: number;
  limit?: number;
  page?: number;     // Convenience for UI
  size?: number;     // Convenience for UI
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEYS = {
    URL: 'notification_api_url',
    TOKEN: 'notification_api_token'
  };

  private defaultUrl = 'http://localhost:8082/notification';
  private defaultToken = 'local-token';

  constructor(private http: HttpClient) { }

  getBaseUrl(): string {
    return localStorage.getItem(this.STORAGE_KEYS.URL) || this.defaultUrl;
  }

  setBaseUrl(url: string): void {
    localStorage.setItem(this.STORAGE_KEYS.URL, url);
  }

  getAuthToken(): string {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN) || this.defaultToken;
  }

  setAuthToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
  }

  private getHeaders() {
    return {
      'Authorization': this.getAuthToken()
    };
  }

  getTemplates(params: any = {}): Observable<ApiResponse<ListTemplatesResponse>> {
    return this.http.post<any>(`${this.getBaseUrl()}/templates/list`, params, { headers: this.getHeaders() }).pipe(
      map(resp => this.normalizeResponse<ListTemplatesResponse>(resp))
    );
  }

  getTemplate(code: string, locale: string, channel: string): Observable<ApiResponse<NotificationTemplate>> {
    const payload = { code, locale, channel };
    return this.http.post<any>(`${this.getBaseUrl()}/templates/get`, payload, { headers: this.getHeaders() }).pipe(
      map(resp => {
        const normalized = this.normalizeResponse<any>(resp);
        return {
          ...normalized,
          data: normalized.data?.template || normalized.data
        };
      })
    );
  }

  createTemplate(template: any): Observable<ApiResponse<NotificationTemplate>> {
    return this.http.post<any>(`${this.getBaseUrl()}/templates/create`, template, { headers: this.getHeaders() }).pipe(
      map(resp => {
        const normalized = this.normalizeResponse<any>(resp);
        return {
          ...normalized,
          data: normalized.data?.template || normalized.data
        };
      })
    );
  }

  updateTemplate(template: any): Observable<ApiResponse<NotificationTemplate>> {
    return this.http.post<any>(`${this.getBaseUrl()}/templates/update`, template, { headers: this.getHeaders() }).pipe(
      map(resp => {
        const normalized = this.normalizeResponse<any>(resp);
        return {
          ...normalized,
          data: normalized.data?.template || normalized.data
        };
      })
    );
  }

  previewTemplate(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.getBaseUrl()}/templates/preview`, payload, { headers: this.getHeaders() }).pipe(
      map(resp => this.normalizeResponse<any>(resp))
    );
  }

  getAuditLogs(filter: AuditQueryFilter = {}): Observable<ApiResponse<ListAuditResponse>> {
    const params: any = {};
    if (filter.page && filter.size) {
      params.offset = (filter.page - 1) * filter.size;
      params.limit = filter.size;
    } else {
      if (filter.offset !== undefined) params.offset = filter.offset;
      if (filter.limit !== undefined) params.limit = filter.limit;
    }
    if (filter.message_id) params.message_id = filter.message_id;
    if (filter.recipient) params.recipient = filter.recipient;
    if (filter.channel) params.channel = filter.channel;
    if (filter.status) params.status = filter.status;
    if (filter.event_type) params.event_type = filter.event_type;
    if (filter.from_time) params.from_time = filter.from_time;
    if (filter.to_time) params.to_time = filter.to_time;

    return this.http.get<any>(`${this.getBaseUrl()}/notifications/audit`, { 
      headers: this.getHeaders(),
      params: params
    }).pipe(
      map(resp => this.normalizeResponse<ListAuditResponse>(resp))
    );
  }

  getExportAuditUrl(filter: AuditQueryFilter = {}): string {
    const baseUrl = this.getBaseUrl();
    const queryParts: string[] = [];
    if (filter.message_id) queryParts.push(`message_id=${filter.message_id}`);
    if (filter.recipient) queryParts.push(`recipient=${filter.recipient}`);
    if (filter.channel) queryParts.push(`channel=${filter.channel}`);
    if (filter.status) queryParts.push(`status=${filter.status}`);
    if (filter.event_type) queryParts.push(`event_type=${filter.event_type}`);
    if (filter.from_time) queryParts.push(`from_time=${filter.from_time}`);
    if (filter.to_time) queryParts.push(`to_time=${filter.to_time}`);
    
    // Auth token is usually passed in header, but for simple location.href it might need query param 
    // or the backend must allow it (or use a temporary token). 
    // Backend controller currently uses Middleware which checks Authorization header.
    // For browser download, we might need a different approach or the user handles it.
    // We'll provide the URL and the component can decide how to fetch.
    return `${baseUrl}/notifications/audit/export?${queryParts.join('&')}`;
  }

  sendNotification(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.getBaseUrl()}/notifications`, payload, { headers: this.getHeaders() }).pipe(
      map(resp => this.normalizeResponse<any>(resp))
    );
  }

  getCircuitBreakers(): Observable<ApiResponse<any[]>> {
    return this.http.get<any>(`${this.getBaseUrl()}/reliability/circuit-breakers`, { headers: this.getHeaders() }).pipe(
      map(resp => this.normalizeResponse<any[]>(resp))
    );
  }

  getDeadLetterQueue(): Observable<ApiResponse<any[]>> {
    return this.http.get<any>(`${this.getBaseUrl()}/reliability/dead-letter-queue`, { headers: this.getHeaders() }).pipe(
      map(resp => this.normalizeResponse<any[]>(resp))
    );
  }

  private normalizeResponse<T>(resp: any): ApiResponse<T> {
    // If response is already in { data: T, ... } format
    if (resp && resp.data !== undefined) {
      return {
        data: resp.data,
        total: resp.total || resp.data?.total,
        success: resp.status === '200' || resp.success === true,
        message: resp.message
      };
    }
    // If response is the data itself
    return {
      data: resp as T,
      success: true
    };
  }
}
