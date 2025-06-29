import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, switchMap, throwError, of } from 'rxjs';
import { AuthServices } from '../services/auth.services';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServices);

  const modifiedReq = req.clone({
    withCredentials: true
  });

  return next(modifiedReq).pipe(
    catchError(error => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            refreshTokenSubject.next(true);

            // Retry original request
            return next(modifiedReq);
          }),
          catchError((err) => {
            isRefreshing = false;
            refreshTokenSubject.next(null);
            console.error('Refresh token failed:', err);
            authService.logout();
            return throwError(() => err);
          })
        );
      } else if (error.status === 401) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
