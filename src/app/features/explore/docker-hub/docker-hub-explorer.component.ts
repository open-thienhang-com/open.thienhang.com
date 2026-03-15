import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DockerHubDomainService,
  DockerHubImage,
  DockerHubNamespace,
  DockerHubSummary,
  DockerHubOverview,
  DockerHubQuality,
  DockerHubCost,
  DockerHubFeatures,
  DockerHubVersion,
  DockerHubListResponse
} from '../../../core/services/dockerhub-domain.service';

type DockerHubSection = 'overview' | 'namespaces' | 'images' | 'governance' | 'scripts';

interface SidebarSection {
  key: DockerHubSection;
  label: string;
  icon: string;
  description: string;
}

interface SectionResource<T> {
  loading: boolean;
  data: T;
  error: string;
}

@Component({
  selector: 'app-docker-hub-explorer',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
    InputTextModule,
    DrawerModule
  ],
  templateUrl: './docker-hub-explorer.component.html',
  styleUrls: ['./docker-hub-explorer.component.scss']
})
export class DockerHubExplorerComponent implements OnInit {
  readonly sections: SidebarSection[] = [
    { key: 'overview', label: 'Overview', icon: 'pi pi-home', description: 'Docker Hub status, summary, and sync posture' },
    { key: 'namespaces', label: 'Namespaces', icon: 'pi pi-server', description: 'Namespace rollup and repository density' },
    { key: 'images', label: 'Image Inventory', icon: 'pi pi-box', description: 'Full image registry with tag and security metadata' },
    { key: 'governance', label: 'Governance', icon: 'pi pi-shield', description: 'Quality, cost, and lifecycle metadata' },
    { key: 'scripts', label: 'Developer Tools', icon: 'pi pi-code', description: 'CLI snippets and automation scripts' }
  ];

  readonly cliSnippets = [
    { label: 'List Images', desc: 'Fetch all images from the registry', command: 'curl "http://localhost:8080/data-mesh/domains/dockerhub/images?skip=0&limit=20"' },
    { label: 'Image Detail', desc: 'Get metadata for a specific image', command: 'curl "http://localhost:8080/data-mesh/domains/dockerhub/images/thienhang-web-frontend"' },
    { label: 'Summary', desc: 'Get registry health and totals', command: 'curl "http://localhost:8080/data-mesh/domains/dockerhub/summary"' },
    { label: 'Namespaces', desc: 'List all connected namespaces', command: 'curl "http://localhost:8080/data-mesh/domains/dockerhub/namespaces"' }
  ];

  readonly automationScript = `#!/bin/bash
# Sync Docker Hub Namespaces
NAMESPACES=("thienhang" "platform-engineering")
API_BASE="http://localhost:8080/data-mesh/domains/dockerhub"

for NS in "\${NAMESPACES[@]}"; do
  echo "Syncing $NS..."
  curl -X GET "$API_BASE/images?namespace=$NS&limit=50"
done`;

  activeSection: DockerHubSection = 'overview';
  globalLoading = true;
  private readonly loadedSections = new Set<DockerHubSection>();

  // State
  overviewState = this.createState<DockerHubOverview | null>(null);
  summaryState = this.createState<DockerHubSummary | null>(null);
  qualityState = this.createState<DockerHubQuality | null>(null);
  costState = this.createState<DockerHubCost | null>(null);
  featuresState = this.createState<DockerHubFeatures | null>(null);
  versionState = this.createState<DockerHubVersion | null>(null);
  namespacesState = this.createState<{ data: DockerHubNamespace[]; total: number } | null>(null);
  imagesState = this.createState<DockerHubListResponse<DockerHubImage> | null>(null);
  
  // Filtering & Detail
  searchQuery = '';
  selectedImage: DockerHubImage | null = null;
  detailVisible = false;

  constructor(private readonly dockerHubService: DockerHubDomainService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  createState<T>(data: T): SectionResource<T> {
    return { loading: true, data, error: '' };
  }

  loadDashboard(force = true): void {
    this.globalLoading = true;
    this.dockerHubService.getSummary().pipe(
      catchError(error => of({ __error: error } as const))
    ).subscribe(result => {
      this.applyState(this.summaryState, result);
      this.loadSectionData(this.activeSection, force);
    });
  }

  switchSection(section: DockerHubSection): void {
    this.activeSection = section;
    this.loadSectionData(section);
  }

  loadSectionData(section: DockerHubSection, force = false): void {
    if (!force && this.loadedSections.has(section)) {
      this.globalLoading = false;
      return;
    }

    this.globalLoading = true;
    switch (section) {
      case 'overview':
        forkJoin({
          overview: this.dockerHubService.getOverview().pipe(catchError(e => of({ __error: e } as const))),
          quality: this.dockerHubService.getQuality().pipe(catchError(e => of({ __error: e } as const))),
          cost: this.dockerHubService.getCost().pipe(catchError(e => of({ __error: e } as const))),
          features: this.dockerHubService.getFeatures().pipe(catchError(e => of({ __error: e } as const)))
        }).subscribe(result => {
          this.applyState(this.overviewState, result.overview);
          this.applyState(this.qualityState, result.quality);
          this.applyState(this.costState, result.cost);
          this.applyState(this.featuresState, result.features);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;

      case 'namespaces':
        this.dockerHubService.getNamespaces().pipe(
          catchError(e => of({ __error: e } as const))
        ).subscribe(result => {
          this.applyState(this.namespacesState, result);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;

      case 'images':
        this.loadImages();
        break;

      case 'governance':
        forkJoin({
          quality: this.dockerHubService.getQuality().pipe(catchError(e => of({ __error: e } as const))),
          cost: this.dockerHubService.getCost().pipe(catchError(e => of({ __error: e } as const))),
          features: this.dockerHubService.getFeatures().pipe(catchError(e => of({ __error: e } as const))),
          version: this.dockerHubService.getVersion().pipe(catchError(e => of({ __error: e } as const)))
        }).subscribe(result => {
          this.applyState(this.qualityState, result.quality);
          this.applyState(this.costState, result.cost);
          this.applyState(this.featuresState, result.features);
          this.applyState(this.versionState, result.version);
          this.loadedSections.add(section);
          this.globalLoading = false;
        });
        break;
    }
  }

  loadImages(): void {
    this.imagesState.loading = true;
    const params: any = { skip: 0, limit: 100 };
    if (this.searchQuery) params.search = this.searchQuery;

    this.dockerHubService.getImages(params).pipe(
      catchError(e => of({ __error: e } as const))
    ).subscribe(result => {
      this.applyState(this.imagesState, result);
      if (this.imagesState.data?.data?.length && !this.selectedImage) {
        this.selectedImage = this.imagesState.data.data[0];
      }
      this.loadedSections.add('images');
      this.globalLoading = false;
    });
  }

  selectImage(image: DockerHubImage): void {
    this.selectedImage = image;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // In a real app, we'd show a toast here.
      console.log('Copied to clipboard');
    });
  }

  onSearch(): void {
    this.loadImages();
  }

  showDetail(image: DockerHubImage): void {
    this.selectedImage = image;
    this.detailVisible = true;
  }

  get activeSectionMeta(): SidebarSection {
    return this.sections.find(s => s.key === this.activeSection) || this.sections[0];
  }

  get summaryCards() {
    const summary = this.summaryState.data;
    return [
      { label: 'Total Images', value: summary?.total_images ?? '-', icon: 'pi pi-box', tone: 'blue', caption: 'Total tags across all repos' },
      { label: 'Healthy', value: summary?.healthy_images ?? '-', icon: 'pi pi-check-circle', tone: 'emerald', caption: 'Images with no critical issues' },
      { label: 'Namespaces', value: summary?.namespaces ?? '-', icon: 'pi pi-server', tone: 'purple', caption: 'Connected Docker Hub namespaces' },
      { label: 'Repositories', value: summary?.repositories ?? '-', icon: 'pi pi-folder', tone: 'orange', caption: 'Active image repositories' }
    ];
  }

  getSeverity(status?: string): 'success' | 'warn' | 'danger' | 'info' {
    switch ((status || '').toLowerCase()) {
      case 'healthy':
      case 'live':
      case 'public':
        return 'success';
      case 'degraded':
      case 'sample':
      case 'private':
        return 'warn';
      case 'error':
      case 'vulnerable':
        return 'danger';
      default:
        return 'info';
    }
  }

  formatDate(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  private applyState<T>(state: SectionResource<T>, result: T | { __error: unknown }): void {
    if (this.hasError(result)) {
      state.loading = false;
      state.error = this.getErrorMessage(result.__error);
      return;
    }
    state.loading = false;
    state.error = '';
    state.data = result;
  }

  private hasError<T>(value: T | { __error: unknown }): value is { __error: unknown } {
    return !!value && typeof value === 'object' && '__error' in value;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || error.message || `HTTP ${error.status}`;
    }
    return 'Unable to load Docker Hub data.';
  }
}
