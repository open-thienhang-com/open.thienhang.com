import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { BloggerAuthService } from '../services/blogger-auth.service';

export const bloggerAuthGuard: CanActivateFn = () => {
    const authService = inject(BloggerAuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/blogger/login']);
    return false;
};
