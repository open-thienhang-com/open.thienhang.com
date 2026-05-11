import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthServices } from '../services/auth.services';

const PUBLIC_PATHS = [
  '/authentication/login',
  '/authentication/register',
  '/authentication/refresh-token',
  '/authentication/forgot-password',
  '/authentication/reset-password',
  '/authentication/set-password',
  '/authentication/verify-email',
  '/authentication/resend-verification',
  '/authentication/verify-token',
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authServices: AuthServices, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isPublic = PUBLIC_PATHS.some(p => req.url.includes(p));
    const token = localStorage.getItem('access_token');

    let authReq = req;
    if (token && !isPublic) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !isPublic) {
          return this.handle401(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(t => t !== null),
        take(1),
        switchMap(token =>
          next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
        )
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authServices.refreshToken().pipe(
      switchMap(res => {
        this.isRefreshing = false;
        const newToken = localStorage.getItem('access_token');
        this.refreshTokenSubject.next(newToken);
        return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
      }),
      catchError(err => {
        this.isRefreshing = false;
        this.authServices.clearSession();
        this.router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  }
}
