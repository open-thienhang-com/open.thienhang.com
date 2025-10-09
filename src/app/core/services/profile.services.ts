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
  private baseUrl = getApiBase();

  constructor(private http: HttpClient) { }

  getProfile(): Observable<ApiResponse<UserProfile>> {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.get<UserProfile>(url, { headers: { accept: 'application/json' } })
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateProfile(data: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
    const url = `${this.baseUrl}/profile`;
    return this.http.put<UserProfile>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updatePassword(data: { current_password: string, new_password: string }): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/profile/password`;
    return this.http.put<any>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAvatar(file: File): Observable<ApiResponse<UserProfile>> {
    const url = `${this.baseUrl}/profile/avatar`;
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<UserProfile>(url, formData)
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeAvatar(): Observable<ApiResponse<UserProfile>> {
    const url = `${this.baseUrl}/profile/avatar`;
    return this.http.delete<UserProfile>(url)
      .pipe(map(response => this.wrapResponse(response)));
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

  getSessions(): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/profile/sessions`;
    return this.http.get<any[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  revokeSession(sessionId: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/profile/sessions/${sessionId}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
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
