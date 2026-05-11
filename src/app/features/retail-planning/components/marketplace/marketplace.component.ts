import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModelService, Model, ModelListResponse } from '../../services/model.service';
import { ApiResponse } from '../../services/api.service';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-marketplace',
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css',
})
export class MarketplaceComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  models: Model[] = [];
  loading = true;
  error: string | null = null;

  // Search and filter
  searchQuery = '';
  typeFilter = '';
  versionFilter = '';

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalModels = 0;

  constructor(private modelService: ModelService) { }

  ngOnInit(): void {
    this.loadModels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadModels(): void {
    this.loading = true;
    this.error = null;

    const params: any = {
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.pageSize,
    };

    if (this.searchQuery.trim()) {
      params.q = this.searchQuery.trim();
    }

    if (this.typeFilter) {
      params.type = this.typeFilter;
    }

    if (this.versionFilter.trim()) {
      params.version = this.versionFilter.trim();
    }

    this.modelService.getModels(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          // Backend returns: { success, models, total, count, skip, limit }
          // Transform to component format
          if (response.data && response.data.models) {
            // Map models to match Model interface
            this.models = response.data.models.map((model: any) => ({
              key: model.key,
              name: model.meta?.name || model.key,
              type: model.meta?.type,
              status: model.meta?.status || 'active',
              accuracy: model.meta?.accuracy,
              created_at: model.meta?.created_at,
              updated_at: model.meta?.updated_at,
              metadata: model.meta
            }));
            this.totalModels = response.data.total || 0;
          } else {
            this.models = [];
            this.totalModels = 0;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading models:', err);
          this.error = 'Không thể tải danh sách models';
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadModels();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadModels();
  }

  onRefresh(): void {
    this.loadModels();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadModels();
  }

  get totalPages(): number {
    return Math.ceil(this.totalModels / this.pageSize);
  }

  getModelTypeBadgeClass(type?: string): string {
    switch (type?.toLowerCase()) {
      case 'bilstm':
        return 'bg-blue-100 text-blue-800';
      case 'cnn':
        return 'bg-green-100 text-green-800';
      case 'transformer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getModelStatusBadgeClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  selectedModel: Model | null = null;
  showDetailsModal = false;
  modelExamples: any[] = [];
  modelMeta: any = null;
  loadingExamples = false;
  loadingMeta = false;

  onViewDetails(model: Model): void {
    this.selectedModel = model;
    this.showDetailsModal = true;
    this.loadModelDetails(model.key);
  }

  onCloseDetails(): void {
    this.showDetailsModal = false;
    this.selectedModel = null;
    this.modelExamples = [];
    this.modelMeta = null;
  }

  private loadModelDetails(key: string): void {
    // Load examples
    this.loadingExamples = true;
    this.modelService.getModelExamples(key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.loadingExamples = false;
          if (response.ok && response.data?.examples) {
            this.modelExamples = response.data.examples;
          }
        },
        error: (err) => {
          this.loadingExamples = false;
          console.error('Error loading examples:', err);
        }
      });

    // Load meta
    this.loadingMeta = true;
    this.modelService.getModelMeta(key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.loadingMeta = false;
          if (response.ok && response.data?.meta) {
            this.modelMeta = response.data.meta;
          }
        },
        error: (err) => {
          this.loadingMeta = false;
          console.error('Error loading meta:', err);
        }
      });
  }
}
