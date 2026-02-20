import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { getApiBase } from '../../../core/config/api-config';

export interface BloggerAuthResponse {
    message: string;
    data?: {
        access_token?: string;
        token_type?: string;
        expires_in?: number;
        [key: string]: any;
    };
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class BloggerAuthService {
    private http = inject(HttpClient);
    private apiBase = getApiBase();
    private readonly STORAGE_KEY = 'blogger_auth_token';
    private readonly EXPIRY_KEY = 'blogger_auth_expiry';

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor() {
        // Check if token is still valid on service initialization
        if (this.hasValidToken()) {
            this.isAuthenticatedSubject.next(true);
        }
    }

    /**
     * Perform OAuth login for Blogger
     */
    login(): Observable<BloggerAuthResponse> {
        return this.http.post<BloggerAuthResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/oauth/login`,
            {}
        ).pipe(
            tap(response => {
                console.log('OAuth login response:', response);
                // Extract token from response
                const token = response.data?.access_token || response.access_token;
                const expiresIn = response.data?.expires_in || response.expires_in || 3600;

                if (token) {
                    // Store token and expiry time
                    localStorage.setItem(this.STORAGE_KEY, token);
                    const expiryTime = new Date().getTime() + (expiresIn * 1000);
                    localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());

                    this.isAuthenticatedSubject.next(true);
                }
            })
        );
    }

    /**
     * Logout and clear stored token
     */
    logout(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.EXPIRY_KEY);
        this.isAuthenticatedSubject.next(false);
    }

    /**
     * Get stored token
     */
    getToken(): string | null {
        if (this.hasValidToken()) {
            return localStorage.getItem(this.STORAGE_KEY);
        }
        // Token expired, clear it
        this.logout();
        return null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.hasValidToken();
    }

    /**
     * Check if token exists and is not expired
     */
    private hasValidToken(): boolean {
        const token = localStorage.getItem(this.STORAGE_KEY);
        const expiry = localStorage.getItem(this.EXPIRY_KEY);

        if (!token || !expiry) {
            return false;
        }

        const expiryTime = parseInt(expiry, 10);
        const currentTime = new Date().getTime();

        if (currentTime > expiryTime) {
            // Token expired
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.EXPIRY_KEY);
            return false;
        }

        return true;
    }
}
