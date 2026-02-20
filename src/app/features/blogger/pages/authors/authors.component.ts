import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BloggerService, Author, AuthorsResponse } from '../../services/blogger.service';

@Component({
    selector: 'app-blogger-authors',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        CardModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
    <div class="container mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Authors Management</h2>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center p-8">
        <div class="spinner"></div>
        <span class="ml-4">Loading authors...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="p-4 bg-red-50 border border-red-200 rounded">
        <p class="text-red-800">{{ error }}</p>
        <button 
          (click)="loadAuthors()" 
          class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>

      <!-- Data Table -->
      <p-table 
        *ngIf="!loading && !error"
        [value]="authors"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['display_name', 'id']"
        class="p-datatable-striped"
        [loading]="loading"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="display_name">
              Name <p-sortIcon field="display_name"></p-sortIcon>
            </th>
            <th pSortableColumn="id">
              ID <p-sortIcon field="id"></p-sortIcon>
            </th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-author>
          <tr>
            <td class="font-medium">
              <a [href]="author.url" target="_blank" class="text-blue-600 hover:text-blue-800">
                {{ author.display_name }}
              </a>
            </td>
            <td class="text-sm text-gray-600">{{ author.id }}</td>
            <td>
              <img 
                *ngIf="author.image" 
                [src]="'https:' + author.image" 
                alt="{{ author.display_name }}"
                class="w-10 h-10 rounded-full"
              />
              <span *ngIf="!author.image" class="text-gray-400">No image</span>
            </td>
            <td>
              <button 
                pButton 
                icon="pi pi-eye" 
                class="p-button-rounded p-button-info"
                (click)="viewAuthor(author)"
                pTooltip="View Details"
                tooltipPosition="top"
              ></button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4" class="text-center p-4">No authors found</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Info Dialog -->
      <p-dialog 
        [visible]="displayDialog" 
        [header]="selectedAuthor?.display_name"
        [modal]="true"
        [style]="{width: '50vw'}"
        (onHide)="displayDialog = false"
      >
        <div *ngIf="selectedAuthor" class="space-y-4">
          <div class="flex justify-center">
            <img 
              *ngIf="selectedAuthor.image"
              [src]="'https:' + selectedAuthor.image"
              alt="{{ selectedAuthor.display_name }}"
              class="w-24 h-24 rounded-full"
            />
          </div>
          <div>
            <label class="font-semibold">Display Name:</label>
            <p>{{ selectedAuthor.display_name }}</p>
          </div>
          <div>
            <label class="font-semibold">Author ID:</label>
            <p class="font-mono text-sm">{{ selectedAuthor.id }}</p>
          </div>
          <div>
            <label class="font-semibold">Profile URL:</label>
            <a [href]="selectedAuthor.url" target="_blank" class="text-blue-600 hover:text-blue-800 block">
              {{ selectedAuthor.url }}
            </a>
          </div>
        </div>
      </p-dialog>

      <!-- Toast Messages -->
      <p-toast position="top-right"></p-toast>
    </div>
  `,
    styles: [`
    .container {
      max-width: 1200px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    :host ::ng-deep {
      .p-datatable .p-datatable-thead > tr > th {
        background-color: #f8f9fa;
        color: #333;
        font-weight: 600;
      }

      .p-datatable .p-datatable-tbody > tr:hover {
        background-color: #f5f5f5;
      }
    }
  `]
})
export class BloggerAuthorsComponent implements OnInit {
    private bloggerService = inject(BloggerService);
    private messageService = inject(MessageService);

    authors: Author[] = [];
    loading = false;
    error: string | null = null;
    displayDialog = false;
    selectedAuthor: Author | null = null;
    total = 0;
    offset = 0;
    limit = 10;

    ngOnInit() {
        this.loadAuthors();
    }

    loadAuthors() {
        this.loading = true;
        this.error = null;

        this.bloggerService.getAuthors(this.limit, this.offset).subscribe({
            next: (response: AuthorsResponse) => {
                this.authors = response.data;
                this.total = response.total;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading authors:', error);
                this.error = 'Failed to load authors. Please try again.';
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load authors'
                });
            }
        });
    }

    viewAuthor(author: Author) {
        this.selectedAuthor = author;
        this.displayDialog = true;
    }
}
