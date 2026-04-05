import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { GoogleDomainService, GoogleCredential, GoogleDriveFile } from '../../../../core/services/google-domain.service';

type OAuthUiState = 'idle' | 'creating_auth_url' | 'redirecting_to_google' | 'processing_callback' | 'connected' | 'error';
type ViewMode = 'list' | 'card';

@Component({
  selector: 'app-files-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ButtonModule, 
    TagModule, 
    SkeletonModule, 
    TableModule, 
    InputTextModule, 
    MessageModule,
    TooltipModule,
    DropdownModule,
    CardModule
  ],
  template: `
    <div class="min-h-screen bg-[#f4f7f6] p-4 lg:p-8">
      <!-- Header Section -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 ring-4 ring-indigo-50">
              <i class="pi pi-folder-open text-indigo-600 text-3xl font-bold"></i>
            </div>
            <div>
              <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">File Management</h1>
              <div class="flex items-center gap-2">
                <p-tag severity="info" [value]="'Google Drive'" styleClass="bg-blue-50 text-blue-700 border-none font-bold px-3"></p-tag>
                <span class="text-gray-400 text-sm">•</span>
                <p class="text-gray-500 text-sm font-medium m-0">Browsing and managing cloud data assets</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button pButton icon="pi pi-list" 
                class="view-toggle-btn" 
                [class.active]="viewMode() === 'list'"
                (click)="viewMode.set('list')"
                pTooltip="List View">
              </button>
              <button pButton icon="pi pi-th-large" 
                class="view-toggle-btn" 
                [class.active]="viewMode() === 'card'"
                (click)="viewMode.set('card')"
                pTooltip="Card View">
              </button>
            </div>
            
            <button pButton icon="pi pi-refresh" 
              class="p-button-outlined p-button-secondary bg-white rounded-xl shadow-sm border-gray-200" 
              (click)="refreshAll()" 
              [loading]="loading()"
              pTooltip="Force Sync">
            </button>
            
            <ng-container *ngIf="isConnected()">
              <button pButton label="Upload" icon="pi pi-upload" 
                class="p-button-primary shadow-lg px-6 py-2.5 rounded-xl text-sm font-bold border-none bg-indigo-600 hover:bg-indigo-700">
              </button>
            </ng-container>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto">
        <!-- Error Message -->
        <div *ngIf="oauthState() === 'error'" class="mb-8">
          <p-message severity="error" [text]="oauthMessage()" styleClass="w-full text-left rounded-2xl shadow-sm border-none py-4 px-6"></p-message>
        </div>

        <!-- Connect State -->
        <div *ngIf="!isConnected() && !loading()" class="py-20 flex flex-col items-center justify-center text-center animate-fade-in">
          <div class="relative mb-10">
            <div class="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-gray-50">
              <i class="pi pi-google text-5xl text-gray-800"></i>
            </div>
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white border-4 border-[#f4f7f6]">
              <i class="pi pi-link text-sm"></i>
            </div>
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-4">Integrate Cloud Storage</h2>
          <p class="text-gray-500 max-w-lg mb-12 text-lg leading-relaxed font-medium">
            Seamlessly connect your Google Drive to harmonize your data management experience and unlock advanced governance features.
          </p>
          
          <button pButton 
            [label]="oauthState() === 'creating_auth_url' ? 'Initiating...' : 'Authorize Google Access'" 
            icon="pi pi-google" 
            class="p-button-lg px-10 py-5 rounded-2xl font-black shadow-2xl border-none bg-gray-900 text-white hover:bg-black transition-all transform hover:-translate-y-1"
            (click)="startConnect()"
            [loading]="oauthState() === 'creating_auth_url'">
          </button>
          
          <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            <div class="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <i class="pi pi-shield font-bold text-xl"></i>
              </div>
              <h3 class="font-bold text-gray-900 mb-3">Governance-Ready</h3>
              <p class="text-sm text-gray-500 leading-relaxed font-medium">Full integration with data mesh and governance policies.</p>
            </div>
            <div class="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <i class="pi pi-bolt font-bold text-xl"></i>
              </div>
              <h3 class="font-bold text-gray-900 mb-3">Real-time Sync</h3>
              <p class="text-sm text-gray-500 leading-relaxed font-medium">Instant metadata synchronization with your Drive asset.</p>
            </div>
            <div class="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <i class="pi pi-search font-bold text-xl"></i>
              </div>
              <h3 class="font-bold text-gray-900 mb-3">Unified Search</h3>
              <p class="text-sm text-gray-500 leading-relaxed font-medium">Discover files across all connected cloud domains.</p>
            </div>
          </div>
        </div>

        <!-- Connected State -->
        <ng-container *ngIf="isConnected()">
          <!-- Stats Summary (Governance Style) -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="stat-card">
              <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500 font-bold text-xs uppercase tracking-widest">Total Assets</span>
                <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <i class="pi pi-file font-bold"></i>
                </div>
              </div>
              <div class="flex items-end justify-between">
                <h2 class="text-3xl font-black text-gray-900">{{ stats().total }}</h2>
                <span class="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">Sync Active</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500 font-bold text-xs uppercase tracking-widest">Folders</span>
                <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <i class="pi pi-folder font-bold"></i>
                </div>
              </div>
              <div class="flex items-end justify-between">
                <h2 class="text-3xl font-black text-gray-900">{{ stats().folders }}</h2>
                <span class="text-gray-400 text-xs font-bold">Organized</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500 font-bold text-xs uppercase tracking-widest">Storage Type</span>
                <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <i class="pi pi-cloud font-bold"></i>
                </div>
              </div>
              <div class="flex items-end justify-between">
                <h2 class="text-3xl font-black text-gray-900">Cloud</h2>
                <span class="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded-lg">Standard</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500 font-bold text-xs uppercase tracking-widest">Owner Account</span>
                <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <i class="pi pi-user font-bold"></i>
                </div>
              </div>
              <div class="flex items-end justify-between min-w-0">
                <span class="text-gray-900 font-black truncate text-sm mb-2 max-w-[150px] inline-block">
                  {{ credentials()[0]?.google_account_email || 'Linked' }}
                </span>
                <span class="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">Verified</span>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
            <!-- Toolbar -->
            <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white sticky top-0 z-20">
              <div class="relative w-full sm:max-w-lg">
                <i class="pi pi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold"></i>
                <input type="text" pInputText 
                  class="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold shadow-inner" 
                  placeholder="Search metadata, names, extensions..." 
                  [(ngModel)]="searchQuery"
                  (input)="onSearch()">
              </div>
              
              <div class="flex items-center gap-3">
                <button pButton label="Filters" icon="pi pi-filter" class="p-button-outlined p-button-secondary rounded-xl font-bold border-gray-200 text-gray-600"></button>
                <div class="h-8 w-[1px] bg-gray-200"></div>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-text p-button-rounded text-gray-400"></button>
              </div>
            </div>

            <!-- Views -->
            <div class="flex-1 p-6 overflow-auto">
              <!-- Grid/Card View -->
              <div *ngIf="viewMode() === 'card'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                <div *ngFor="let file of filteredFiles()" class="file-card group">
                  <div class="flex items-start justify-between mb-6">
                    <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-all transform group-hover:scale-110 shadow-sm border border-transparent group-hover:border-indigo-100 group-hover:shadow-indigo-100/30">
                      <i [class]="getFileIcon(file.mimeType)" class="text-2xl"></i>
                    </div>
                    <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded p-button-sm text-gray-300 group-hover:text-gray-500"></button>
                  </div>
                  
                  <div class="min-w-0 mb-6">
                    <h3 class="font-bold text-gray-900 text-lg leading-tight mb-2 truncate" [pTooltip]="file.name">{{ file.name }}</h3>
                    <div class="flex items-center gap-2">
                      <p-tag [value]="getFileType(file.mimeType)" styleClass="bg-gray-100 text-gray-600 text-[10px] font-black uppercase px-2 py-0.5 border-none"></p-tag>
                      <span class="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">{{ file.id.substring(0, 8) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between pt-5 border-t border-gray-50">
                    <span class="text-xs font-bold text-gray-400">{{ formatDate(file.modifiedTime) }}</span>
                    <button pButton icon="pi pi-arrow-right" class="p-button-text p-button-rounded p-button-sm text-indigo-600 font-bold"></button>
                  </div>
                </div>
              </div>

              <!-- List/Table View -->
              <div *ngIf="viewMode() === 'list'" class="animate-fade-in">
                <p-table [value]="filteredFiles()" [loading]="loading()" 
                  [rows]="10" [paginator]="true" 
                  responsiveLayout="scroll"
                  styleClass="p-datatable-sm no-border custom-gov-table"
                  [rowHover]="true">
                  <ng-template pTemplate="header">
                    <tr class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50">
                      <th class="p-5 bg-transparent border-none rounded-l-2xl">Asset Name</th>
                      <th class="p-5 bg-transparent border-none">Resource Identifier</th>
                      <th class="p-5 bg-transparent border-none">MIME Classification</th>
                      <th class="p-5 bg-transparent border-none">Last Refreshed</th>
                      <th class="p-5 bg-transparent border-none text-right rounded-r-2xl">Action</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-file>
                    <tr class="group hover:bg-indigo-50/20 transition-all border-b border-gray-50 last:border-none cursor-pointer">
                      <td class="p-5 border-none">
                        <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-all border border-transparent shadow-sm group-hover:shadow-indigo-100/20">
                            <i [class]="getFileIcon(file.mimeType)" class="text-lg"></i>
                          </div>
                          <div class="min-w-0">
                            <span class="block font-bold text-gray-900 leading-none mb-1.5 truncate max-w-[200px]">{{ file.name }}</span>
                            <span class="block text-[10px] text-indigo-400 font-black uppercase tracking-widest">Active Resource</span>
                          </div>
                        </div>
                      </td>
                      <td class="p-5 border-none">
                        <span class="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg font-mono text-xs">{{ file.id.substring(0, 16) }}...</span>
                      </td>
                      <td class="p-5 border-none">
                        <p-tag [value]="file.mimeType" styleClass="bg-white text-gray-500 border border-gray-100 text-[10px] font-bold px-2 py-0.5 shadow-sm"></p-tag>
                      </td>
                      <td class="p-5 border-none">
                        <span class="text-xs font-bold text-gray-400">{{ formatDate(file.modifiedTime) }}</span>
                      </td>
                      <td class="p-5 border-none text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button pButton icon="pi pi-arrow-right" class="p-button-text p-button-rounded p-button-sm text-gray-400 hover:text-indigo-600 hover:bg-white"></button>
                        </div>
                      </td>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="emptymessage">
                    <tr>
                      <td colspan="5" class="p-20 text-center">
                        <div class="flex flex-col items-center gap-6">
                          <div class="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200">
                            <i class="pi pi-search-plus text-5xl"></i>
                          </div>
                          <div>
                            <p class="text-gray-900 font-black text-xl m-0 mb-2">No Matching Assets</p>
                            <p class="text-gray-400 font-medium max-w-xs">We couldn't find any files matching your current search parameters.</p>
                          </div>
                          <button pButton label="Clear Search" (click)="searchQuery = ''; onSearch()" class="p-button-text p-button-sm font-black text-indigo-600"></button>
                        </div>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Skeleton Loading -->
        <div *ngIf="loading() && !isConnected()" class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-10">
            <p-skeleton width="20rem" height="4rem" borderRadius="24px"></p-skeleton>
            <p-skeleton width="10rem" height="3.5rem" borderRadius="16px"></p-skeleton>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <p-skeleton height="10rem" borderRadius="28px"></p-skeleton>
            <p-skeleton height="10rem" borderRadius="28px"></p-skeleton>
            <p-skeleton height="10rem" borderRadius="28px"></p-skeleton>
            <p-skeleton height="10rem" borderRadius="28px"></p-skeleton>
          </div>
          <p-skeleton height="20rem" borderRadius="32px"></p-skeleton>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-inputtext:focus {
        box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.05);
      }
      .custom-gov-table .p-datatable-thead > tr > th {
        font-family: inherit;
        background: transparent;
        border-bottom: 1px solid #f1f5f9;
      }
      .p-paginator {
        background: transparent;
        border: none;
        padding: 2rem;
        
        .p-paginator-page, .p-paginator-next, .p-paginator-last, .p-paginator-first, .p-paginator-prev {
          border-radius: 12px;
          min-width: 2.75rem;
          height: 2.75rem;
          margin: 0 0.25rem;
          color: #64748b;
          font-weight: 800;
          font-size: 0.8rem;
          border: 1px solid transparent;
          
          &.p-highlight {
            background: white;
            color: #4f46e5;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            border-color: #f1f5f9;
          }

          &:hover:not(.p-highlight) {
            background: #eef2ff;
            color: #4f46e5;
          }
        }
      }
    }

    .view-toggle-btn {
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      background: transparent;
      border: none;
      color: #94a3b8;
      border-radius: 10px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &.active {
        background: #f8fafc;
        color: #4f46e5;
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
      }

      &:hover:not(.active) {
        color: #64748b;
        background: #f1f5f9;
      }
    }

    .stat-card {
      background: white;
      padding: 1.75rem;
      border-radius: 1.75rem;
      border: 1px solid #f1f5f9;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        border-color: #e2e8f0;
      }
    }

    .file-card {
      background: white;
      padding: 1.75rem;
      border-radius: 2rem;
      border: 1px solid #f8fafc;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: #e0e7ff;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
      }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FilesDashboardComponent implements OnInit {
  private googleService = inject(GoogleDomainService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal<boolean>(false);
  isConnected = signal<boolean>(false);
  oauthState = signal<OAuthUiState>('idle');
  oauthMessage = signal<string>('');
  
  viewMode = signal<ViewMode>('list');
  searchQuery = '';
  
  files = signal<GoogleDriveFile[]>([]);
  credentials = signal<GoogleCredential[]>([]);
  selectedCredentialId = signal<string>('');

  // Computed properties
  filteredFiles = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.files();
    return this.files().filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.mimeType.toLowerCase().includes(query) ||
      f.id.toLowerCase().includes(query)
    );
  });

  stats = computed(() => {
    const list = this.files();
    return {
      total: list.length,
      folders: list.filter(f => f.mimeType.includes('folder')).length,
      images: list.filter(f => f.mimeType.includes('image')).length,
      docs: list.filter(f => f.mimeType.includes('document') || f.mimeType.includes('pdf')).length,
    };
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        this.oauthState.set('error');
        this.oauthMessage.set('Google connection was cancelled or rejected.');
        this.loadInitialData();
        return;
      }

      if (code && state) {
        this.processCallback(code, state);
        return;
      }

      this.loadInitialData();
    });
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.googleService.getCredentials().subscribe({
      next: (res) => {
        const creds = res.data || [];
        this.credentials.set(creds);
        
        if (creds.length > 0) {
          this.isConnected.set(true);
          this.selectedCredentialId.set(creds[0].credential_id);
          this.loadFiles(creds[0].credential_id);
        } else {
          this.isConnected.set(false);
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading credentials', err);
        this.loading.set(false);
      }
    });
  }

  loadFiles(credentialId: string): void {
    this.loading.set(true);
    this.googleService.getDriveFiles(credentialId, 100).subscribe({ // Request more files for better grid view
      next: (res) => {
        this.files.set(res.data?.files || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.oauthState.set('error');
        this.oauthMessage.set('Failed to synchronize cloud data assets.');
      }
    });
  }

  startConnect(): void {
    this.oauthState.set('creating_auth_url');
    this.googleService.getAuthorizationUrl().subscribe({
      next: (data) => {
        this.oauthState.set('redirecting_to_google');
        window.location.href = data.authorization_url;
      },
      error: (err) => {
        this.oauthState.set('error');
        this.oauthMessage.set('Unable to establish communication with Google servers.');
      }
    });
  }

  processCallback(code: string, state: string): void {
    this.oauthState.set('processing_callback');
    this.loading.set(true);
    
    this.googleService.exchangeCode(code, state).subscribe({
      next: (data) => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
        
        this.oauthState.set('connected');
        this.loadInitialData();
      },
      error: (err) => {
        this.oauthState.set('error');
        this.oauthMessage.set('Identity verification failure. Please re-authenticate.');
        this.loading.set(false);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  refreshAll(): void {
    this.loadInitialData();
  }

  onSearch(): void {
    // Computed property handle this automatically
  }

  formatDate(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  getFileType(mimeType: string): string {
    if (!mimeType) return 'Binary';
    if (mimeType.includes('folder')) return 'Directory';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Slides';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'Document';
    if (mimeType.includes('video')) return 'Video';
    if (mimeType.includes('audio')) return 'Audio';
    return 'Asset';
  }

  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'pi pi-file text-gray-400';
    if (mimeType.includes('folder')) return 'pi pi-folder-fill text-amber-500';
    if (mimeType.includes('image')) return 'pi pi-image text-emerald-500';
    if (mimeType.includes('pdf')) return 'pi pi-file-pdf text-red-500';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'pi pi-file-excel text-green-600';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'pi pi-file-ppt text-orange-500';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'pi pi-file-word text-blue-500';
    if (mimeType.includes('video')) return 'pi pi-video text-pink-500';
    if (mimeType.includes('audio')) return 'pi pi-volume-up text-indigo-400';
    return 'pi pi-file text-gray-300';
  }
}
