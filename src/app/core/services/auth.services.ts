import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap, map } from 'rxjs';
import { ApiResponse } from './governance.services';
import { UserProfile } from './profile.services';

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignUpRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  terms_accepted?: boolean;
}

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  user?: UserProfile;
  expires_at?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface SetNewPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private baseUrl = 'https://api.thienhang.com';
  private userSubject = new BehaviorSubject<UserProfile | null>(null);

  constructor(private http: HttpClient) {
    if (this.isLoggedIn()) {
      this.getCurrentUser().subscribe();
    }
  }

  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    const url = `${this.baseUrl}/authentication/login`;
    return this.http.post<AuthResponse>(url, data)
      .pipe(
        tap(response => {
          if (this.isWrappedResponse(response)) {
            if (response.data?.user) {
              this.userSubject.next(response.data.user);
              localStorage.setItem('isLoggedIn', 'true');
            }
          } else if (response) {
            // Handle unwrapped response
            localStorage.setItem('isLoggedIn', 'true');
          }
        }),
        map(response => this.wrapResponse(response))
      );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const url = `${this.baseUrl}/authentication/refresh-token`;
    return this.http.post<AuthResponse>(url, null)
      .pipe(map(response => this.wrapResponse(response)));
  }

  logout(): Observable<ApiResponse<any>> {
    localStorage.removeItem('isLoggedIn');
    this.userSubject.next(null);
    const url = `${this.baseUrl}/authentication/logout`;
    return this.http.post<any>(url, null)
      .pipe(map(response => this.wrapResponse(response)));
  }

  signUp(data: SignUpRequest): Observable<ApiResponse<AuthResponse>> {
    const url = `${this.baseUrl}/authentication/register`;
    return this.http.post<AuthResponse>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getCurrentUser(): Observable<ApiResponse<UserProfile | null>> {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.get<UserProfile>(url).pipe(
      tap(response => {
        const userData = this.isWrappedResponse(response) ? response.data : response;
        localStorage.setItem('isLoggedIn', 'true');
        this.userSubject.next(userData);
      }),
      catchError(() => {
        localStorage.removeItem('isLoggedIn');
        this.userSubject.next(null);
        return of({ data: null, success: false, message: 'Failed to get user data' } as ApiResponse<null>);
      }),
      map(response => this.wrapResponse(response as any))
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/forgot-password`;
    return this.http.post<any>(url, { email })
      .pipe(map(response => this.wrapResponse(response)));
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/reset-password`;
    return this.http.post<any>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  setNewPassword(data: SetNewPasswordRequest): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/set-password`;
    return this.http.post<any>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  verifyEmail(token: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/verify-email`;
    return this.http.post<any>(url, { token })
      .pipe(map(response => this.wrapResponse(response)));
  }

  resendVerificationEmail(email: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/resend-verification`;
    return this.http.post<any>(url, { email })
      .pipe(map(response => this.wrapResponse(response)));
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getUser(): Observable<UserProfile | null> {
    return this.userSubject.asObservable();
  }

  // Helper to check if a response is already wrapped in our ApiResponse format
  private isWrappedResponse(response: any): response is ApiResponse<any> {
    return response && 'data' in response && 'success' in response;
  }

  // Helper method to wrap a single object response to match the API response format
  private wrapResponse<T>(data: T): ApiResponse<T> {
    if (this.isWrappedResponse(data)) {
      return data as unknown as ApiResponse<T>;
    }
    return { data, success: true };
  }
}
