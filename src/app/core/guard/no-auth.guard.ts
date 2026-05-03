import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServices } from '../services/auth.services';

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthServices);
  const router = inject(Router);

  // Allow through if not logged in, OR if logged in but unverified (needs to reach /verify)
  if (auth.isLoggedIn() && auth.isVerified()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
