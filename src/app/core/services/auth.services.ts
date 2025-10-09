import { Injectable } from '@angular/core';
import { getApiBase } from '../config/api-config';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap, map } from 'rxjs';
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
  private baseUrl = getApiBase();
  private userSubject = new BehaviorSubject<UserProfile | null>(null);

  constructor(private http: HttpClient, private loadingService: LoadingService) {
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
        const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})];
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
    return response && 'data' in response && 'success' in response;
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
