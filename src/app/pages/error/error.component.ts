import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-950 dark:to-surface-900 p-4">
      <div class="max-w-2xl w-full">
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden">
          
          <!-- Header with icon -->
          <div [ngClass]="getHeaderClass()" class="p-8 text-center">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-4">
              <i [class]="getIconClass()" class="text-6xl text-white"></i>
            </div>
            <h1 class="text-4xl font-bold text-white mb-2">{{ getTitle() }}</h1>
            <p class="text-xl text-white/90">Error {{ errorCode }}</p>
          </div>

          <!-- Content -->
          <div class="p-8">
            <div class="mb-6">
              <p class="text-lg text-surface-700 dark:text-surface-300 mb-4">
                {{ errorMessage }}
              </p>
              
              <div class="bg-surface-100 dark:bg-surface-900 rounded-lg p-4">
                <p class="text-sm text-surface-600 dark:text-surface-400">
                  <strong>What you can do:</strong>
                </p>
                <ul class="mt-2 space-y-2 text-sm text-surface-600 dark:text-surface-400">
                  <li class="flex items-start gap-2" *ngFor="let suggestion of getSuggestions()">
                    <i class="pi pi-check-circle text-primary-500 mt-0.5"></i>
                    <span>{{ suggestion }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3 justify-center">
              <button 
                pButton 
                label="Go Back" 
                icon="pi pi-arrow-left" 
                class="p-button-outlined"
                (click)="goBack()">
              </button>
              
              <button 
                pButton 
                label="Go to Marketplace" 
                icon="pi pi-home" 
                (click)="goToDashboard()">
              </button>

              <button 
                *ngIf="errorType === 'unauthorized'"
                pButton 
                label="Login" 
                icon="pi pi-sign-in" 
                class="p-button-success"
                (click)="goToLogin()">
              </button>

              <button 
                *ngIf="errorType === 'server-error'"
                pButton 
                label="Try Again" 
                icon="pi pi-refresh" 
                class="p-button-success"
                (click)="retry()">
              </button>
            </div>

            <!-- Additional info -->
            <div class="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
              <p class="text-xs text-surface-500 dark:text-surface-500 text-center">
                If this problem persists, please contact our support team with error code: 
                <strong class="text-surface-700 dark:text-surface-300">{{ errorCode }}</strong>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ErrorPageComponent implements OnInit {
  errorType: string = 'unknown';
  errorCode: string = '000';
  errorMessage: string = 'An unexpected error occurred.';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorType = params['type'] || 'unknown';
      this.errorCode = params['code'] || '000';
      this.errorMessage = params['message'] || 'An unexpected error occurred.';
    });
  }

  getHeaderClass(): string {
    switch (this.errorType) {
      case 'unauthorized':
        return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'server-error':
        return 'bg-gradient-to-br from-orange-500 to-orange-600';
      case 'not-found':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      default:
        return 'bg-gradient-to-br from-surface-500 to-surface-600';
    }
  }

  getIconClass(): string {
    switch (this.errorType) {
      case 'unauthorized':
        return 'pi pi-lock';
      case 'server-error':
        return 'pi pi-exclamation-triangle';
      case 'not-found':
        return 'pi pi-question-circle';
      default:
        return 'pi pi-times-circle';
    }
  }

  getTitle(): string {
    switch (this.errorType) {
      case 'unauthorized':
        return 'Access Denied';
      case 'server-error':
        return 'Server Error';
      case 'not-found':
        return 'Not Found';
      default:
        return 'Error';
    }
  }

  getSuggestions(): string[] {
    switch (this.errorType) {
      case 'unauthorized':
        return [
          'Check if you are logged in with the correct account',
          'Contact your administrator to request access',
          'Try logging out and logging back in',
          'Verify you have the necessary permissions'
        ];
      case 'server-error':
        return [
          'Wait a few moments and try again',
          'Check your internet connection',
          'Clear your browser cache and cookies',
          'Contact support if the problem continues'
        ];
      case 'not-found':
        return [
          'Check the URL for typos',
          'Use the search feature to find what you need',
          'Navigate from the home page',
          'Contact support if you believe this is an error'
        ];
      default:
        return [
          'Refresh the page',
          'Check your internet connection',
          'Contact support for assistance'
        ];
    }
  }

  goBack() {
    window.history.back();
  }

  goToDashboard() {
    this.router.navigate(['/marketplace']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  retry() {
    window.location.reload();
  }
}
