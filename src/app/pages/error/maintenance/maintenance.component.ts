import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <div class="mb-8">
          <div class="mx-auto w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
            <i class="pi pi-wrench text-4xl text-orange-600 dark:text-orange-400"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Under Maintenance
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
            We're currently performing scheduled maintenance to improve our services. 
            Please check back in a few minutes.
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div class="flex items-center justify-center mb-4">
            <i class="pi pi-clock text-2xl text-blue-600 dark:text-blue-400 mr-3"></i>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              Estimated Completion
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-300">
            We'll be back online shortly. Thank you for your patience.
          </p>
        </div>

        <div class="space-y-4">
          <button 
            (click)="retryConnection()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
            <i class="pi pi-refresh mr-2"></i>
            Try Again
          </button>
          
          <div class="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="mailto:support@thienhang.com" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <i class="pi pi-envelope mr-1"></i>
              Contact Support
            </a>
            <a href="https://status.thienhang.com" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <i class="pi pi-info-circle mr-1"></i>
              System Status
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class MaintenanceComponent {
  constructor(private router: Router) {}

  retryConnection() {
    // Reload the page to retry the connection
    window.location.reload();
  }
}
