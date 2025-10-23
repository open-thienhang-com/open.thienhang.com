import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class Auth401Interceptor implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: any) => {
                if (err instanceof HttpErrorResponse && err.status === 401) {
                    // Best-effort: clear local storage tokens and non-HttpOnly cookies
                    try {
                        // Remove common localStorage token keys if present
                        const tokenKeys = ['auth_token', 'access_token', 'token', 'id_token'];
                        tokenKeys.forEach(k => localStorage.removeItem(k));

                        // Best-effort cookie clear: set expired cookie for each cookie name
                        const cookies = document.cookie ? document.cookie.split(';').map(c => c.split('=')[0].trim()) : [];
                        cookies.forEach(name => {
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
                        });
                    } catch (e) {
                        // ignore errors (e.g., not available in some contexts)
                        console.warn('Auth401Interceptor cleanup failed', e);
                    }

                    // Navigate to login page; use replaceUrl to avoid back navigation to protected page
                    try {
                        this.router.navigate(['/auth/login'], { replaceUrl: true });
                    } catch (e) {
                        // If router not available for any reason, fallback to location assign
                        try { window.location.href = '/auth/login'; } catch (err) { /* ignore */ }
                    }
                }

                return throwError(() => err);
            })
        );
    }
}
