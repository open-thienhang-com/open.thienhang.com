import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {AuthServices} from '../services/auth.services';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthServices);
  const router = inject(Router);

  return auth.getCurrentUser().pipe(
    map(user => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
