import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-offline',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      <div class="max-w-lg mx-auto">
        <!-- Icon -->
        <div class="mb-8 text-6xl">
          <i class="pi pi-wifi text-primary-500 animate-pulse"></i>
        </div>

        <!-- Title -->
        <h1 class="mb-4 text-4xl font-bold text-900 dark:text-50">
          {{ isOffline ? 'No Internet Connection' : 'Server Timeout' }}
        </h1>

        <!-- Message -->
        <p class="mb-8 text-lg text-700 dark:text-300">
          {{ isOffline ? 
            'Please check your internet connection and try again.' : 
            'The server is taking too long to respond. Please try again later.' 
          }}
        </p>

        <!-- Retry Button -->
        <div class="flex flex-col gap-2 sm:flex-row justify-center">
          <button pButton 
                  class="p-button-primary" 
                  [label]="'Retry Connection'"
                  (click)="retryConnection()">
          </button>
          
          <button pButton 
                  class="p-button-outlined" 
                  label="Go Back"
                  (click)="goBack()">
          </button>
        </div>

        <!-- Connection Status -->
        <div class="mt-8 flex items-center justify-center gap-2" *ngIf="isOffline">
          <span class="inline-block w-2 h-2 rounded-full animate-pulse"
                [ngClass]="isOffline ? 'bg-red-500' : 'bg-green-500'">
          </span>
          <span class="text-sm text-600 dark:text-400">
            {{ isOffline ? 'Offline' : 'Checking connection...' }}
          </span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `]
})
export class OfflineComponent implements OnInit {
    isOffline = !navigator.onLine;

    ngOnInit() {
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    updateOnlineStatus() {
        this.isOffline = !navigator.onLine;
    }

    retryConnection() {
        window.location.reload();
    }

    goBack() {
        window.history.back();
    }

    ngOnDestroy() {
        window.removeEventListener('online', () => this.updateOnlineStatus());
        window.removeEventListener('offline', () => this.updateOnlineStatus());
    }
}
