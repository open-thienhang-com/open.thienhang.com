import { Injectable } from '@angular/core';
import { getApiBase } from '../config/api-config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './governance.services';

export interface UserProfile {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  job_title?: string;
  department?: string;
  organization?: string;
  location?: string;
  is_active?: boolean;
  last_login?: Date;
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  theme?: string;
  notifications?: {
    email?: boolean;
    web?: boolean;
    mobile?: boolean;
  };
  dashboard?: {
    widgets?: string[];
    layout?: any;
  };
  language?: string;
  timezone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileServices {
  private get baseUrl(): string {
    return getApiBase();
  }

  constructor(private http: HttpClient) { }

  getProfile(): Observable<ApiResponse<UserProfile>> {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.get<any>(url, { headers: { accept: 'application/json' } })
      .pipe(map(response => {
        const data = response?.data ?? response;
        return this.wrapResponse(data as UserProfile);
      }));
  }

  /** PATCH /authentication/me — update full_name / image */
  updateAccount(data: { full_name?: string; image?: string }): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.patch<any>(url, data)
      .pipe(map(response => this.wrapResponse(response?.data ?? response)));
  }

  /** PATCH /authentication/me/profile — update first_name / last_name / company */
  updateProfileDetails(data: { first_name?: string; last_name?: string; company?: string }): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/me/profile`;
    return this.http.patch<any>(url, data)
      .pipe(map(response => this.wrapResponse(response?.data ?? response)));
  }

  /** DELETE /authentication/me — delete own account */
  deleteAccount(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response?.data ?? response)));
  }

  /** GET /authentication/me/sessions */
  getSessions(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/me/sessions`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response?.data ?? response)));
  }

  /** DELETE /authentication/me/sessions — revoke ALL sessions */
  revokeAllSessions(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/me/sessions`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response?.data ?? response)));
  }

  /** DELETE /authentication/sessions/{sessionId} */
  revokeSession(sessionId: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/sessions/${sessionId}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response?.data ?? response)));
  }

  /** GET /authentication/me/permissions — full governance snapshot */
  getMyPermissions(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/me/permissions`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response?.data ?? response)));
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<ApiResponse<UserPreferences>> {
    const url = `${this.baseUrl}/profile/preferences`;
    return this.http.put<UserPreferences>(url, preferences)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getActivityLog(params?: any): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/profile/activity`;
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  updateAvatar(file: File): Observable<ApiResponse<any>> {
    const uploadUrl = `${this.baseUrl}/data-mesh/domains/files/upload/supabase`;
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<any>(uploadUrl, form).pipe(
      map(res => {
        const url = res?.url || res?.data?.url || null;
        return this.wrapResponse({ image: url });
      })
    );
  }

  enableTwoFactorAuth(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/profile/two-factor/enable`;
    return this.http.post<any>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  disableTwoFactorAuth(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/profile/two-factor/disable`;
    return this.http.post<any>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  verifyTwoFactorToken(token: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/profile/two-factor/verify`;
    return this.http.post<any>(url, { token })
      .pipe(map(response => this.wrapResponse(response)));
  }

  getNotificationSettings(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/profile/notifications/settings`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateNotificationSettings(settings: any): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/profile/notifications/settings`;
    return this.http.put<any>(url, settings)
      .pipe(map(response => this.wrapResponse(response)));
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
