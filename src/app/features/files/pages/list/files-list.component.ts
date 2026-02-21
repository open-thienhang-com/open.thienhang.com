import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { FilesService } from '../../services/files.service';
import { ManagedFile, FileUploadResponse } from '../../models/files.model';

@Component({
  selector: 'app-files-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    TableModule,
    TagModule,
    DropdownModule,
    InputTextModule,
    SkeletonModule
  ],
  template: `
    <div class="bg-gray-50 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 m-0">File Library</h1>
            <p class="text-gray-600 mt-2 mb-0">Browse files, inspect metadata, and upload to providers</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <p-button label="Dashboard" icon="pi pi-home" severity="secondary" [outlined]="true" [routerLink]="['/files']"></p-button>
            <p-button label="Stats" icon="pi pi-chart-bar" severity="secondary" [outlined]="true" [routerLink]="['/files/stats']"></p-button>
            <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadFiles()"></p-button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-4">Upload File</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Provider</label>
            <p-dropdown [options]="providerOptions" [(ngModel)]="selectedProvider" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select file</label>
            <input type="file" class="w-full border rounded-md p-2" (change)="onFileSelected($event)" />
          </div>
          <div class="md:col-span-1">
            <p-button label="Upload" icon="pi pi-upload" [disabled]="uploading || !selectedFile" [loading]="uploading" (onClick)="upload()" class="w-full"></p-button>
          </div>
        </div>
        <div class="mt-3 text-sm" *ngIf="uploadResult">
          <span class="text-green-600 font-medium">Upload success:</span>
          <span class="text-gray-700"> {{ uploadResult.name }} ({{ uploadResult.storage_provider }})</span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border border-green-100" *ngIf="uploadResult">
        <div class="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mt-0 mb-1">Latest Upload Result</h2>
            <p class="text-sm text-gray-500 m-0">Returned directly from upload API</p>
          </div>
          <p-tag [value]="uploadResult.status" [severity]="uploadResult.status === 'uploaded' ? 'success' : 'info'"></p-tag>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
          <div><span class="text-gray-500">ID:</span> <span class="font-medium text-gray-900">{{ uploadResult.id }}</span></div>
          <div><span class="text-gray-500">Name:</span> <span class="font-medium text-gray-900">{{ uploadResult.name }}</span></div>
          <div><span class="text-gray-500">Type:</span> <span class="font-medium text-gray-900">{{ uploadResult.type }}</span></div>
          <div><span class="text-gray-500">Size:</span> <span class="font-medium text-gray-900">{{ formatBytes(uploadResult.size) }}</span></div>
          <div><span class="text-gray-500">Provider:</span> <span class="font-medium text-gray-900">{{ uploadResult.storage_provider }}</span></div>
          <div><span class="text-gray-500">Upload Date:</span> <span class="font-medium text-gray-900">{{ uploadResult.upload_date | date:'medium' }}</span></div>
        </div>

        <div class="mt-4">
          <a [href]="uploadResult.url" target="_blank" rel="noopener" class="text-blue-600 text-sm font-medium">
            Open uploaded file
          </a>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input pInputText type="text" class="w-full" placeholder="Search by name/provider/uploader" [(ngModel)]="searchTerm" (input)="applyFilters()" />
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Provider</label>
            <p-dropdown [options]="providerFilterOptions" [(ngModel)]="selectedProviderFilter" optionLabel="label" optionValue="value" [showClear]="true" placeholder="All providers" (onChange)="applyFilters()" class="w-full"></p-dropdown>
          </div>
          <div class="flex items-end">
            <p-button label="Clear" icon="pi pi-filter-slash" severity="secondary" [outlined]="true" (onClick)="clearFilters()"></p-button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6" *ngIf="loading">
        <div class="space-y-4">
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden" *ngIf="!loading">
        <p-table [value]="filteredFiles" [paginator]="true" [rows]="10" [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} files" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Provider</th>
              <th>Size</th>
              <th>Uploaded By</th>
              <th>Upload Date</th>
              <th>Tags</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-file>
            <tr>
              <td>
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">{{ file.name }}</span>
                  <a [href]="file.url" target="_blank" rel="noopener" class="text-xs text-blue-600">Open file</a>
                </div>
              </td>
              <td><p-tag [value]="file.type" severity="info"></p-tag></td>
              <td><p-tag [value]="file.storage_provider" severity="success"></p-tag></td>
              <td>{{ formatBytes(file.size) }}</td>
              <td>{{ file.uploaded_by }}</td>
              <td>{{ file.upload_date | date:'short' }}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <p-tag *ngFor="let tag of file.tags" [value]="tag" severity="secondary"></p-tag>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class FilesListComponent implements OnInit {
  private filesService = inject(FilesService);

  loading = false;
  uploading = false;
  totalRecords = 0;

  files: ManagedFile[] = [];
  filteredFiles: ManagedFile[] = [];

  selectedFile: File | null = null;
  selectedProvider: 'local' | 'supabase' | 'imagekit' = 'supabase';
  uploadResult: FileUploadResponse | null = null;

  searchTerm = '';
  selectedProviderFilter: string | null = null;

  providerOptions = [
    { label: 'Local', value: 'local' },
    { label: 'Supabase', value: 'supabase' },
    { label: 'ImageKit', value: 'imagekit' }
  ];

  providerFilterOptions = [
    { label: 'Local', value: 'local' },
    { label: 'Supabase', value: 'supabase' },
    { label: 'ImageKit', value: 'imagekit' }
  ];

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.loading = true;
    this.filesService.getFiles(100, 0).subscribe({
      next: (res) => {
        this.files = res.files || [];
        this.totalRecords = res.total || this.files.length;
        this.syncProviderFilters();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading files', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length ? input.files[0] : null;
  }

  upload(): void {
    if (!this.selectedFile) return;
    this.uploading = true;

    this.filesService.uploadFile(this.selectedProvider, this.selectedFile).subscribe({
      next: (res) => {
        this.uploadResult = res;
        this.uploading = false;
        this.selectedFile = null;
        this.loadFiles();
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.uploading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredFiles = this.files.filter((file) => {
      const matchProvider = !this.selectedProviderFilter || file.storage_provider === this.selectedProviderFilter;
      const haystack = `${file.name} ${file.storage_provider} ${file.uploaded_by} ${file.type}`.toLowerCase();
      const matchSearch = !term || haystack.includes(term);
      return matchProvider && matchSearch;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedProviderFilter = null;
    this.applyFilters();
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, index);
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`;
  }

  private syncProviderFilters(): void {
    const providers = Array.from(new Set(this.files.map(file => file.storage_provider).filter(Boolean)));
    this.providerFilterOptions = providers.map((provider) => ({
      label: provider.charAt(0).toUpperCase() + provider.slice(1),
      value: provider
    }));
  }
}
