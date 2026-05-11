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
    const payload: any = {};
    if (filter.page && filter.size) {
      payload.offset = (filter.page - 1) * filter.size;
      payload.limit = filter.size;
    } else {
      if (filter.offset !== undefined) payload.offset = filter.offset;
      if (filter.limit !== undefined) payload.limit = filter.limit;
    }
    if (filter.message_id) payload.message_id = filter.message_id;
    if (filter.recipient) payload.recipient = filter.recipient;
    if (filter.channel) payload.channel = filter.channel;
    if (filter.status) payload.status = filter.status;
    if (filter.event_type) payload.event_type = filter.event_type;
    if (filter.from_time) payload.from_time = filter.from_time;
    if (filter.to_time) payload.to_time = filter.to_time;

    return this.http.post<any>(`${this.getBaseUrl()}/notifications/audit/list`, payload, { 
      headers: this.getHeaders()
    }).pipe(
      map(resp => this.normalizeResponse<ListAuditResponse>(resp))
    );
  }

  exportAuditLogs(filter: AuditQueryFilter = {}): Observable<Blob> {
    const payload: any = {};
    if (filter.message_id) payload.message_id = filter.message_id;
    if (filter.recipient) payload.recipient = filter.recipient;
    if (filter.channel) payload.channel = filter.channel;
    if (filter.status) payload.status = filter.status;
    if (filter.event_type) payload.event_type = filter.event_type;
    if (filter.from_time) payload.from_time = filter.from_time;
    if (filter.to_time) payload.to_time = filter.to_time;

    return this.http.post(`${this.getBaseUrl()}/notifications/audit/export`, payload, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }


  sendNotification(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.getBaseUrl()}/notifications`, payload, { headers: this.getHeaders() }).pipe(
      map(resp => this.normalizeResponse<any>(resp))
    );
  }

  getCircuitBreakers(): Observable<ApiResponse<any[]>> {
    return this.http.post<any>(`${this.getBaseUrl()}/reliability/circuit-breakers/list`, {}, { headers: this.getHeaders() }).pipe(
      map(resp => this.normalizeResponse<any[]>(resp))
    );
  }

  getDeadLetterQueue(): Observable<ApiResponse<any[]>> {
    return this.http.post<any>(`${this.getBaseUrl()}/reliability/dead-letter-queue/list`, {}, { headers: this.getHeaders() }).pipe(
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
