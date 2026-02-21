import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthServices } from '../services/auth.services';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

const AUTH_BYPASS_PATHS = [
  '/authentication/login',
  '/authentication/refresh-token',
  '/authentication/logout',
  '/authentication/register',
  '/authentication/forgot-password',
  '/authentication/reset-password',
  '/authentication/set-password',
  '/authentication/verify-email',
  '/authentication/resend-verification'
];

function shouldBypassRefresh(url: string): boolean {
  return AUTH_BYPASS_PATHS.some(path => url.includes(path));
}

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServices);

  const modifiedReq = req.clone({
    withCredentials: true
  });

  return next(modifiedReq).pipe(
    catchError(error => {
      if (error.status !== 401 || shouldBypassRefresh(modifiedReq.url)) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            refreshTokenSubject.next(true);
            return next(modifiedReq);
          }),
          catchError((err) => {
            isRefreshing = false;
            refreshTokenSubject.next(false);
            return throwError(() => err);
          })
        );
      }

      return refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1),
        switchMap((result) => {
          if (result) {
            return next(modifiedReq);
          }
          return throwError(() => error);
        })
      );
    })
  );
};
