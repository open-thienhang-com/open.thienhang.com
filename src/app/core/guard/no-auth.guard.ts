import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServices } from '../services/auth.services';

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthServices);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
