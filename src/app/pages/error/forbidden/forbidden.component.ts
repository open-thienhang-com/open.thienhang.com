import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <div class="mb-8">
          <div class="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
            <i class="pi pi-ban text-4xl text-red-600 dark:text-red-400"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
            You don't have permission to access this resource. 
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div class="flex items-center justify-center mb-4">
            <i class="pi pi-shield text-2xl text-amber-600 dark:text-amber-400 mr-3"></i>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              Security Notice
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-300">
            This action requires additional permissions. Your account may need to be upgraded or you may need to request access.
          </p>
        </div>

        <div class="space-y-4">
          <button 
            (click)="goBack()"
            class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
            <i class="pi pi-arrow-left mr-2"></i>
            Go Back
          </button>
          
          <button 
            (click)="goHome()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
            <i class="pi pi-home mr-2"></i>
            Go to Marketplace
          </button>
          
          <div class="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="mailto:support@thienhang.com" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <i class="pi pi-envelope mr-1"></i>
              Request Access
            </a>
            <a href="/help" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <i class="pi pi-question-circle mr-1"></i>
              Help Center
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
export class ForbiddenComponent {
  constructor(private router: Router) { }

  goBack() {
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/marketplace']);
  }
}
