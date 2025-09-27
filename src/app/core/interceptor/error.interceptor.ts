import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthServices } from '../services/auth.services';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthServices,
    private toastService: ToastService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 0:
        // Network error or API not accessible
        this.router.navigate(['/maintenance']);
        this.toastService.error(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection.',
          true
        );
        break;
      
      case 401:
        // Unauthorized - invalid token or session expired
        this.handleUnauthorized();
        break;
      
      case 403:
        // Forbidden - insufficient permissions
        this.router.navigate(['/forbidden']);
        this.toastService.error(
          'Access Denied',
          'You don\'t have permission to access this resource.'
        );
        break;
      
      case 404:
        // Not found - handled by individual components or router
        this.router.navigate(['/not-found']);
        break;
      
      case 408:
        // Request timeout
        this.toastService.error(
          'Request Timeout',
          'The request took too long to complete. Please try again.'
        );
        break;
      
      case 429:
        // Too many requests
        this.toastService.warning(
          'Rate Limit Exceeded',
          'Too many requests. Please wait a moment before trying again.'
        );
        break;
      
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors - show maintenance page
        this.router.navigate(['/maintenance']);
        this.toastService.error(
          'Server Error',
          'The server is experiencing issues. Please try again later.',
          true
        );
        break;
      
      default:
        // Other errors - log and show generic error
        console.error('HTTP Error:', error);
        this.showGenericError(error);
        break;
    }
  }

  private handleUnauthorized(): void {
    // Clear any stored authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Clear user data in auth service
    this.authService.logout().subscribe();
    
    // Show notification
    this.toastService.warning(
      'Session Expired',
      'Your session has expired. Please log in again.'
    );
    
    // Redirect to login with return URL
    const returnUrl = this.router.url;
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl } 
    });
  }

  private showGenericError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.toastService.error('Error', errorMessage);
  }
}
