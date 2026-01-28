import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

export interface ApiResponse<T = any> {
    ok: boolean;
    status: number;
    data: T;
    message?: string;
}

export interface ApiError {
    status: number;
    message: string;
    error?: string;
    data?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly defaultTimeout = 30000; // 30 seconds
    private readonly authToken = 'ZCXb4Thq56HgXlQC4IKS4EcghaYt6xxmIoHdazBJgVBRAwYqbLhx9rE3QTuzIqpo';

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfigService
    ) { }

    /**
     * Get authorization headers
     */
    private getAuthHeaders(): HttpHeaders {
        const headersObj: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        const token = this.authToken;
        if (token) {
            // Use Bearer scheme by default
            headersObj['Authorization'] = `Bearer ${token}`;
        }

        return new HttpHeaders(headersObj);
    }

    /**
     * Get current API host from config service
     */
    getHost(): string {
        return this.apiConfig.getHost();
    }

    /**
     * Build full URL from path
     */
    private getUrl(path: string): string {
        const host = this.getHost();
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        return host + cleanPath;
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let apiError: ApiError;

        if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
            // Client-side error
            apiError = {
                status: 0,
                message: 'Network error',
                error: 'NETWORK_ERROR'
            };
        } else {
            // Server-side error
            apiError = {
                status: error.status,
                message: error.error?.message || error.message || 'Server error',
                error: error.error?.error || 'SERVER_ERROR',
                data: error.error
            };
        }

        console.error('[API Error]', apiError);
        return throwError(() => apiError);
    }

    /**
     * Transform response to match v2 API format
     */
    private transformResponse<T>(response: any): ApiResponse<T> {
        return {
            ok: true,
            status: 200,
            data: response,
            message: 'Success'
        };
    }

    /**
     * GET request
     */
    get<T = any>(path: string, params?: Record<string, any>): Observable<ApiResponse<T>> {
        const url = this.getUrl(path);
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }

        console.log(`[API] GET ${url}`, params);

        return this.http.get<T>(url, {
            params: httpParams,
            headers: this.getAuthHeaders()
        }).pipe(
            map(response => this.transformResponse<T>(response)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * POST request
     */
    post<T = any>(path: string, body?: any): Observable<ApiResponse<T>> {
        const url = this.getUrl(path);

        console.log(`[API] POST ${url}`, body);

        return this.http.post<T>(url, body, { headers: this.getAuthHeaders() }).pipe(
            map(response => this.transformResponse<T>(response)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * PUT request
     */
    put<T = any>(path: string, body?: any): Observable<ApiResponse<T>> {
        const url = this.getUrl(path);

        console.log(`[API] PUT ${url}`, body);

        return this.http.put<T>(url, body, { headers: this.getAuthHeaders() }).pipe(
            map(response => this.transformResponse<T>(response)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * DELETE request
     */
    delete<T = any>(path: string, body?: any): Observable<ApiResponse<T>> {
        const url = this.getUrl(path);

        console.log(`[API] DELETE ${url}`, body);

        return this.http.delete<T>(url, {
            headers: this.getAuthHeaders(),
            body: body
        }).pipe(
            map(response => this.transformResponse<T>(response)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * PATCH request
     */
    patch<T = any>(path: string, body?: any): Observable<ApiResponse<T>> {
        const url = this.getUrl(path);

        console.log(`[API] PATCH ${url}`, body);

        return this.http.patch<T>(url, body, { headers: this.getAuthHeaders() }).pipe(
            map(response => this.transformResponse<T>(response)),
            catchError(err => this.handleError(err))
        );
    }

    /**
     * Upload file
     */
    upload<T = any>(path: string, formData: FormData): Observable<ApiResponse<T>> {
        const url = this.getUrl(path);

        console.log(`[API] UPLOAD ${url}`);

        // For file uploads, don't set Content-Type header - let browser set it with boundary
        const uploadHeadersObj: Record<string, string> = {};
        const token = this.authToken;
        if (token) {
            uploadHeadersObj['Authorization'] = `Bearer ${token}`;
        }

        return this.http.post<T>(url, formData, { headers: new HttpHeaders(uploadHeadersObj) }).pipe(
            map(response => this.transformResponse<T>(response)),
            catchError(err => this.handleError(err))
        );
    }
}