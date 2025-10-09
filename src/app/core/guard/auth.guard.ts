import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthServices } from '../services/auth.services';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthServices);
  const router = inject(Router);

  // Use local flag to decide authentication without calling /authentication/me
  if (auth.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
