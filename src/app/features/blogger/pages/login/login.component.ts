import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BloggerAuthService } from '../../services/blogger-auth.service';

@Component({
    selector: 'app-blogger-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ToastModule],
    providers: [MessageService],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <p-card class="w-full max-w-md">
        <ng-template pTemplate="header">
          <div class="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 rounded-t-lg">
            <div class="flex items-center justify-center gap-3">
              <i class="pi pi-pencil text-white text-3xl"></i>
              <h1 class="text-white text-2xl font-bold">Blogger</h1>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="content">
          <div class="space-y-6">
            <!-- Icon -->
            <div class="text-center">
              <i class="pi pi-lock text-5xl text-emerald-600"></i>
            </div>

            <!-- Title & Description -->
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Blogger Management</h2>
              <p class="text-gray-600">
                Authorize access to manage your blog posts and authors
              </p>
            </div>

            <!-- Features List -->
            <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-200 space-y-2">
              <div class="flex items-center gap-2">
                <i class="pi pi-check text-emerald-600 font-bold"></i>
                <span class="text-gray-700">View blog posts</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-check text-emerald-600 font-bold"></i>
                <span class="text-gray-700">Manage authors</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-check text-emerald-600 font-bold"></i>
                <span class="text-gray-700">Analyze content</span>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="text-center p-4">
              <i class="pi pi-spin pi-spinner text-3xl text-emerald-600"></i>
              <p class="text-gray-600 mt-2">Authorizing...</p>
            </div>

            <!-- Login Button -->
            <button 
              *ngIf="!loading"
              pButton 
              type="button" 
              label="Authorize with OAuth"
              icon="pi pi-sign-in"
              (click)="login()"
              class="w-full p-button-lg"
              styleClass="bg-gradient-to-r from-emerald-500 to-teal-500 border-0 hover:from-emerald-600 hover:to-teal-600"
            ></button>

            <!-- Info Text -->
            <p class="text-xs text-gray-500 text-center">
              Secure connection. Your data is protected with OAuth 2.0
            </p>
          </div>
        </ng-template>
      </p-card>

      <!-- Toast Messages -->
      <p-toast position="top-right"></p-toast>
    </div>
  `,
    styles: [`
    :host ::ng-deep {
      .p-card {
        border: none;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      }

      .p-button {
        font-weight: 600;
        padding: 1rem 1.5rem;
      }

      .p-card-content {
        padding: 2rem;
      }
    }
  `]
})
export class BloggerLoginComponent {
    private authService = inject(BloggerAuthService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    loading = false;

    login() {
        this.loading = true;

        this.authService.login().subscribe({
            next: (response) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Authorization successful. Redirecting...',
                    life: 2000
                });

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/blogger']);
                }, 2000);
            },
            error: (error) => {
                this.loading = false;
                console.error('OAuth login failed:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Authorization Failed',
                    detail: 'Failed to authorize. Please try again.',
                    life: 3000
                });
            }
        });
    }
}
