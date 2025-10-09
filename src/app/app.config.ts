import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/lara';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { credentialsInterceptor } from './core/interceptor/with-credentials.interceptor';
import { AuthServices } from './core/services/auth.services';
import { TimeoutInterceptor } from './core/interceptor/timeout.interceptor';
import { ErrorInterceptor } from './core/interceptor/error.interceptor';

export function initApp(): () => Promise<void> {
  // No-op initializer: do not call /authentication/me during app bootstrap
  return () => Promise.resolve();
}

// @ts-ignore
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([credentialsInterceptor])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.p-dark' } },
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
  ],
};
