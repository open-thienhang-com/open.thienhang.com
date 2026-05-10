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
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { GoogleDomainService, GoogleCredential, GoogleDriveFile } from '../../../../core/services/google-domain.service';

type OAuthUiState = 'idle' | 'creating_auth_url' | 'redirecting_to_google' | 'processing_callback' | 'connected' | 'error';
type ViewMode = 'list' | 'card';

interface PublicFile {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
}

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
    CardModule,
    TreeModule
  ],
  templateUrl: './files-dashboard.component.html',
  styleUrls: ['./files-dashboard.component.scss']
})
export class FilesDashboardComponent implements OnInit {
  private googleService = inject(GoogleDomainService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  loading = signal<boolean>(false);
  isConnected = signal<boolean>(false);
  oauthState = signal<OAuthUiState>('idle');
  oauthMessage = signal<string>('');
  
  viewMode = signal<ViewMode>('list');
  searchQuery = '';
  
  // Google Drive State
  files = signal<GoogleDriveFile[]>([]);
  credentials = signal<GoogleCredential[]>([]);
  selectedCredentialId = signal<string>('');

  // Public Files State
  publicFiles = signal<PublicFile[]>([]);
  publicFilesLoading = signal<boolean>(false);

  // Tree State
  treeData: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  searchTerm: string = '';

  get filteredTreeData(): TreeNode[] {
    if (!this.searchTerm) return this.treeData;
    
    const search = this.searchTerm.toLowerCase();
    return this.filterTree(this.treeData, search);
  }

  private filterTree(nodes: TreeNode[], search: string): TreeNode[] {
    return nodes
      .map(node => {
        const cloned = { ...node };
        if (cloned.children) {
          cloned.children = this.filterTree(cloned.children, search);
        }
        
        const matchesLabel = (node.label || '').toLowerCase().includes(search);
        const hasMatchingChildren = cloned.children && cloned.children.length > 0;
        
        if (matchesLabel || hasMatchingChildren) {
          if (cloned.children) {
            cloned.expanded = true;
          }
          return cloned;
        }
        return null;
      })
      .filter((node): node is TreeNode => node !== null);
  }

  // Computed properties for Google Drive
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

  // Computed properties for Public Files
  filteredPublicFiles = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.publicFiles();
    return this.publicFiles().filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.mimeType.toLowerCase().includes(query)
    );
  });

  publicStats = computed(() => {
    const list = this.publicFiles();
    return {
      total: list.length,
      images: list.filter(f => f.mimeType.includes('image')).length,
      others: list.filter(f => !f.mimeType.includes('image')).length,
    };
  });

  ngOnInit(): void {
    this.initTreeData();

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

    this.loadPublicFiles();
  }

  initTreeData() {
    this.treeData = [
      {
        key: 'google-drive',
        label: 'Google Drive',
        icon: 'pi pi-google',
        expanded: true,
        data: { type: 'google' }
      },
      {
        key: 'local-public',
        label: 'Local Public Storage',
        icon: 'pi pi-folder',
        expanded: true,
        data: { type: 'public' }
      }
    ];

    // Select Google Drive by default
    this.selectedNode = this.treeData[0];
  }

  onNodeSelect(event: any) {
    this.searchQuery = '';
  }

  clearSelection() {
    this.selectedNode = null;
  }

  loadPublicFiles(): void {
    this.publicFilesLoading.set(true);
    this.http.get<PublicFile[]>('/public/files.json').subscribe({
      next: (data) => {
        this.publicFiles.set(data || []);
        this.publicFilesLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load public files', err);
        this.publicFiles.set([]);
        this.publicFilesLoading.set(false);
      }
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
    this.googleService.getDriveFiles(credentialId, 100).subscribe({
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
    if (this.selectedNode?.key === 'google-drive') {
      this.loadInitialData();
    } else if (this.selectedNode?.key === 'local-public') {
      this.loadPublicFiles();
    }
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

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
