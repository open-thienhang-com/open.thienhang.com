import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { isPublicAuthPath } from './auth.interceptor';

/**
 * Global 401/403 escalation handler.
 *
 * - **401 on a protected endpoint** → clear local session state and redirect
 *   to `/login`. AuthInterceptor's refresh-token path runs first; this only
 *   fires when refresh itself fails (or wasn't attempted, e.g. a 401 from a
 *   route that bypassed AuthInterceptor).
 * - **401 on an auth-public endpoint** (`/login`, `/verify-magic-token`, etc.)
 *   → do NOT redirect. Those callers carry structured codes
 *   (`ACCOUNT_NOT_VERIFIED`, `INVALID_CREDENTIALS`) that the service-level
 *   handlers translate into a more useful UX (e.g. nav to `/verify` with email
 *   pre-filled). A blanket redirect to `/login` here would race and overwrite
 *   that navigation.
 * - **403 on any endpoint** → redirect to `/forbidden?from=<current-url>` so
 *   the user can bounce back. Skipped if we're already on `/forbidden` or any
 *   auth screen (to avoid a redirect loop on the login form itself).
 */
@Injectable()
export class Auth401Interceptor implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: any) => {
                if (err instanceof HttpErrorResponse) {
                    const isPublic = isPublicAuthPath(req.url);

                    if (err.status === 401 && !isPublic) {
                        this.clearSessionArtifacts();
                        const returnUrl = this.router.url || '/';
                        this.safeNavigate('/login', { replaceUrl: true, queryParams: returnUrl !== '/login' && returnUrl !== '/' ? { returnUrl } : undefined });
                    } else if (err.status === 403) {
                        this.handleForbidden();
                    }
                }

                return throwError(() => err);
            })
        );
    }

    private handleForbidden(): void {
        const current = this.router.url || '/';
        // Don't bounce auth pages or the forbidden page itself.
        if (current.startsWith('/forbidden') ||
            current.startsWith('/login') ||
            current.startsWith('/register') ||
            current.startsWith('/verify') ||
            current.startsWith('/forgot-password') ||
            current.startsWith('/reset-password')) {
            return;
        }
        this.safeNavigate('/forbidden', { queryParams: { from: current } });
    }

    private clearSessionArtifacts(): void {
        try {
            const tokenKeys = ['auth_token', 'access_token', 'token', 'id_token', 'isLoggedIn', 'userVerified'];
            tokenKeys.forEach(k => localStorage.removeItem(k));

            const cookies = document.cookie ? document.cookie.split(';').map(c => c.split('=')[0].trim()) : [];
            cookies.forEach(name => {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
            });
            try { sessionStorage.removeItem('currentUser'); } catch { /* ignore */ }
        } catch (e) {
            console.warn('Auth401Interceptor cleanup failed', e);
        }
    }

    private safeNavigate(path: string, extras?: { replaceUrl?: boolean; queryParams?: any }): void {
        try {
            this.router.navigate([path], extras);
        } catch (e) {
            try {
                const qp = extras?.queryParams
                    ? '?' + Object.entries(extras.queryParams)
                        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                        .join('&')
                    : '';
                window.location.href = path + qp;
            } catch { /* ignore */ }
        }
    }
}
