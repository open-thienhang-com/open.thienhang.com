import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getApiBase } from '../config/api-config';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap, map, finalize } from 'rxjs';
import { ApiResponse } from './governance.services';
import { UserProfile } from './profile.services';
import { LoadingService } from './loading.service';
import * as XLSX from 'xlsx';

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
  private get baseUrl(): string {
    return getApiBase();
  }
  private userSubject = new BehaviorSubject<UserProfile | null>(null);

  pendingVerificationEmail: string = '';
  pendingResetEmail: string = '';

  constructor(private http: HttpClient, private loadingService: LoadingService, private router: Router) {
    // Initialize user from sessionStorage if present
    try {
      const raw = sessionStorage.getItem('currentUser');
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        const normalized = this.normalizeUser(parsed);
        this.userSubject.next(normalized as UserProfile);
      }
    } catch (e) {
      // ignore parse/storage errors
    }
  }

  login(data: LoginRequest): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/login`;
    return this.http.post<any>(url, data)
      .pipe(
        tap(response => {
          // API returns Token shape directly (has access_token) — not wrapped in ApiResponse
          const isTokenShape = response && ('access_token' in response);
          if (isTokenShape || this.isWrappedResponse(response)) {
            // Only grant isLoggedIn for verified accounts — unverified must go through OTP
            const isVerified = response.is_verified !== false;
            if (isVerified) {
              localStorage.setItem('isLoggedIn', 'true');
            }
            if (response.data?.user) {
              this.userSubject.next(response.data.user);
            }
          }
        }),
        map(response => {
          // Normalize Token shape into ApiResponse so callers get consistent .success + .data
          if (response && 'access_token' in response && !this.isWrappedResponse(response)) {
            return { success: true, data: response } as ApiResponse<any>;
          }
          return this.wrapResponse(response);
        })
      );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const url = `${this.baseUrl}/authentication/refresh-token`;
    return this.http.post<AuthResponse>(url, null)
      .pipe(map(response => this.wrapResponse(response)));
  }

  logout(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/logout`;
    const headers = new HttpHeaders({ accept: 'application/json' });

    // Send empty body as in curl -d '' and include accept header
    return this.http.post<any>(url, '', { headers })
      .pipe(
        map(response => this.wrapResponse(response)),
        catchError((err) => {
          // Convert error into ApiResponse shape so callers get a consistent object
          return of({ data: null, success: false, message: err?.message || 'Logout failed' } as ApiResponse<null>);
        }),
        finalize(() => {
          // Clear client-side session state regardless of request result
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userVerified');
          try { sessionStorage.removeItem('currentUser'); } catch (e) { }
          this.userSubject.next(null);
        })
      );
  }

  signUp(data: SignUpRequest): Observable<ApiResponse<AuthResponse>> {
    const url = `${this.baseUrl}/authentication/register`;
    return this.http.post<AuthResponse>(url, data)
      .pipe(
        tap(response => {
          if (response) this.pendingVerificationEmail = data.email;
        }),
        map(response => this.wrapResponse(response))
      );
  }

  getCurrentUser(): Observable<ApiResponse<UserProfile | null>> {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.get<UserProfile>(url).pipe(
      tap(response => {
        let userData: any = this.isWrappedResponse(response) ? response.data : response;
        // Some APIs wrap user under `user` key (e.g., { data: { user: {...} } })
        if (userData && userData.user) userData = userData.user;

        // Normalize user (ensure identify present)
        const normalized = this.normalizeUser(userData || {});

        // Persist into sessionStorage so it survives page refresh for this session
        try {
          sessionStorage.setItem('currentUser', JSON.stringify(normalized));
        } catch (e) {
          // ignore session storage errors
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userVerified', String((userData as any)?.is_verified !== false));
        this.userSubject.next(normalized as UserProfile);
      }),
      catchError((err: HttpErrorResponse) => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userVerified');
        try { sessionStorage.removeItem('currentUser'); } catch (e) { }
        this.userSubject.next(null);
        // 403 = email not verified — redirect to verify page instead of login
        if (err?.status === 403) {
          this.router.navigate(['/verify']);
          return of({ data: null, success: false, message: 'Email not verified' } as ApiResponse<null>);
        }
        return of({ data: null, success: false, message: 'Failed to get user data' } as ApiResponse<null>);
      }),
      map(response => this.wrapResponse(response as any))
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/forgot-password`;
    return this.http.post<any>(url, { email })
      .pipe(
        tap(response => {
          if (response) this.pendingResetEmail = email;
        }),
        map(response => this.wrapResponse(response))
      );
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/forgot-password`;
    return this.http.post<any>(url, { email: data.email })
      .pipe(
        tap(response => {
          if (response) this.pendingResetEmail = data.email;
        }),
        map(response => this.wrapResponse(response))
      );
  }

  setNewPassword(data: SetNewPasswordRequest): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/set-password`;
    return this.http.post<any>(url, { otp: data.token, password: data.password })
      .pipe(map(response => this.wrapResponse(response)));
  }

  verifyEmail(email: string, otp: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/verify-email`;
    return this.http.post<any>(url, { email, otp })
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

  isVerified(): boolean {
    return localStorage.getItem('userVerified') !== 'false';
  }

  getUser(): Observable<UserProfile | null> {
    return this.userSubject.asObservable();
  }

  // Excel export functionality
  exportUsersToExcel(users: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Auto-size columns
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    const columnWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 0;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length;
          if (cellLength > maxWidth) {
            maxWidth = cellLength;
          }
        }
      }
      columnWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    }
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // Import users from Excel
  importUsersFromExcel(file: File): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const users = XLSX.utils.sheet_to_json(worksheet);

          // Validate and process users
          const validUsers = users.filter((user: any) => user.email && user.password);

          if (validUsers.length === 0) {
            observer.next({ data: null, success: false, message: 'No valid users found in Excel file' });
            return;
          }

          // Send bulk create request
          const url = `${this.baseUrl}/authentication/bulk-register`;
          this.http.post<any>(url, { users: validUsers }).subscribe({
            next: (response) => {
              observer.next(this.wrapResponse(response));
            },
            error: (error) => {
              observer.next({ data: null, success: false, message: error.message });
            }
          });
        } catch (error) {
          observer.next({ data: null, success: false, message: 'Error reading Excel file' });
        }
      };
      reader.readAsBinaryString(file);
    });
  }

  // Session management
  extendSession(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/extend-session`;
    return this.http.post<any>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  checkSessionStatus(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/session-status`;
    return this.http.get<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Two-factor authentication
  enableTwoFactor(): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/enable-2fa`;
    return this.http.post<any>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  verifyTwoFactor(code: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/authentication/verify-2fa`;
    return this.http.post<any>(url, { code })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Helper to check if a response is already wrapped in our ApiResponse format
  private isWrappedResponse(response: any): response is ApiResponse<any> {
    // Backend SuccessResponse may not have 'success' field but usually has 'data' and 'message'
    return response && 'data' in response && ('success' in response || 'message' in response || 'total' in response);
  }

  // Normalize user object returned from different API shapes so templates can rely on fields
  private normalizeUser(user: any): any {
    if (!user) return {};
    const u: any = { ...user };

    // identify: support various possible keys from backend
    u.identify = u.identify || u.tid || u.id || u.identifier || u.identification || u.user_id || u.userId || '';

    // first_name + last_name preservation (from split of full_name or direct)
    u.first_name = u.first_name || u.firstName || u.full_name?.split(' ')[0] || '';
    u.last_name = u.last_name || u.lastName || u.full_name?.split(' ').slice(1).join(' ') || '';

    // full_name normalization - build from first_name + last_name if not available
    if (!u.full_name && !u.fullName) {
      if (u.first_name || u.last_name) {
        u.full_name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
      } else if (u.name) {
        u.full_name = u.name;
      } else if (u.email) {
        // Use email username as fallback
        u.full_name = u.email.split('@')[0];
      } else {
        u.full_name = 'Anonymous User';
      }
    } else {
      u.full_name = u.full_name || u.fullName;
    }

    // avatar normalization
    u.avatar = u.avatar || u.image || u.avatarUrl || u.avatar_url || u.photo || u.picture || '';

    // email normalization
    u.email = u.email || u.email_address || u.username || '';

    console.log('Normalized user:', u);
    return u;
  }

  // Helper method to wrap a single object response to match the API response format
  private wrapResponse<T>(data: T): ApiResponse<T> {
    if (this.isWrappedResponse(data)) {
      return data as unknown as ApiResponse<T>;
    }
    return { data, success: true };
  }

  // Helper method to wrap API calls with loading
  wrapWithLoading<T>(
    observable: Observable<T>,
    message: string = 'Loading...',
    type: 'default' | 'dots' | 'spinner' | 'pulse' | 'bounce' | 'wave' | 'bars' | 'data-flow' | 'cat-running' | 'dog-running' | 'rabbit-hopping' | 'penguin-walking' | 'hamster-wheel' | 'fox-trotting' = 'pulse'
  ): Observable<T> {
    return this.loadingService.wrapWithLoading(observable, {
      message,
      type,
      size: 'medium'
    });
  }
}
