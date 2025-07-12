import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <div class="mb-8">
          <div class="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <i class="pi pi-search text-4xl text-blue-600 dark:text-blue-400"></i>
          </div>
          <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div class="flex items-center justify-center mb-4">
            <i class="pi pi-lightbulb text-2xl text-yellow-600 dark:text-yellow-400 mr-3"></i>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              What you can do
            </span>
          </div>
          <ul class="text-left text-gray-600 dark:text-gray-300 space-y-2">
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2"></i>
              Check the URL for any typos
            </li>
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2"></i>
              Use the search function to find what you need
            </li>
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2"></i>
              Navigate back to the dashboard
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <button 
            (click)="goHome()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
            <i class="pi pi-home mr-2"></i>
            Go to Dashboard
          </button>
          
          <button 
            (click)="goBack()"
            class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
            <i class="pi pi-arrow-left mr-2"></i>
            Go Back
          </button>
          
          <div class="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a routerLink="/discovery/catalog" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <i class="pi pi-search mr-1"></i>
              Search Catalog
            </a>
            <a href="mailto:support@thienhang.com" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <i class="pi pi-envelope mr-1"></i>
              Contact Support
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
export class NotFoundComponent {
  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
