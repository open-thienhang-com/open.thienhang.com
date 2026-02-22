import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../../services/retail.service';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputTextarea,
    BadgeModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './categories.component.html',
  providers: [MessageService]
})
export class CategoriesComponent implements OnInit {
  categories: CategoryItem[] = [];
  filteredCategories: CategoryItem[] = [];
  loading = false;
  saving = false;

  searchTerm = '';
  selectedStatus = '';
  selectedParentId = '';

  showCategoryDialog = false;
  editingCategory: CategoryItem | null = null;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  parentOptions: Array<{ label: string; value: string }> = [
    { label: 'All Parents', value: '' }
  ];

  dialogParentOptions: Array<{ label: string; value: string }> = [
    { label: 'None (Root)', value: '' }
  ];

  dialogStatusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private messageService: MessageService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.listCategories(0, 50).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp?.data) ? resp.data : [];
        this.categories = data.map((it: any) => this.mapCategory(it));
        this.applyFilters();
        this.refreshParentOptions();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.categories = [];
        this.filteredCategories = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load categories'
        });
      }
    });
  }

  applyFilters(): void {
    this.filteredCategories = this.categories.filter((item) => {
      const keyword = this.searchTerm.trim().toLowerCase();
      const matchesSearch = !keyword
        || item.name.toLowerCase().includes(keyword)
        || item.slug.toLowerCase().includes(keyword)
        || item.description.toLowerCase().includes(keyword);

      const statusKey = item.isActive ? 'active' : 'inactive';
      const matchesStatus = !this.selectedStatus || statusKey === this.selectedStatus;
      const matchesParent = !this.selectedParentId || item.parentId === this.selectedParentId;

      return matchesSearch && matchesStatus && matchesParent;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedParentId = '';
    this.applyFilters();
  }

  createCategory(): void {
    this.editingCategory = {
      id: '',
      name: '',
      slug: '',
      description: '',
      parentId: '',
      isActive: true,
      createdAt: null,
      updatedAt: null
    };
    this.showCategoryDialog = true;
  }

  editCategory(item: CategoryItem): void {
    this.saving = true;
    this.categoryService.getCategory(item.id).subscribe({
      next: (resp: any) => {
        this.editingCategory = this.mapCategory(resp?.data || item);
        this.showCategoryDialog = true;
        this.saving = false;
      },
      error: () => {
        this.editingCategory = { ...item };
        this.showCategoryDialog = true;
        this.saving = false;
      }
    });
  }

  saveCategory(): void {
    if (!this.editingCategory) return;

    const payload = {
      name: this.editingCategory.name.trim(),
      slug: this.editingCategory.slug.trim(),
      description: this.editingCategory.description || '',
      parent_id: this.editingCategory.parentId || '',
      is_active: this.editingCategory.isActive
    };

    if (!payload.name || !payload.slug) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name and slug are required.'
      });
      return;
    }

    this.saving = true;

    const isEdit = !!this.editingCategory.id;
    const req$ = isEdit
      ? this.categoryService.updateCategory(this.editingCategory.id, payload)
      : this.categoryService.createCategory(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showCategoryDialog = false;
        this.editingCategory = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: isEdit ? 'Category updated' : 'Category created'
        });
        this.loadCategories();
      },
      error: (err: any) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to save category'
        });
      }
    });
  }

  cancelEdit(): void {
    this.showCategoryDialog = false;
    this.editingCategory = null;
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'active' : 'inactive';
  }

  getActiveCategories(): number {
    return this.categories.filter((item) => item.isActive).length;
  }

  getRootCategories(): number {
    return this.categories.filter((item) => !item.parentId).length;
  }

  getParentLabel(parentId: string): string {
    if (!parentId) return 'Root';
    const parent = this.categories.find((c) => c.id === parentId);
    return parent?.name || parentId;
  }

  private refreshParentOptions(): void {
    const options = this.categories.map((c) => ({ label: c.name, value: c.id }));
    this.parentOptions = [{ label: 'All Parents', value: '' }, ...options];
    this.dialogParentOptions = [{ label: 'None (Root)', value: '' }, ...options];
  }

  private mapCategory(raw: any): CategoryItem {
    return {
      id: String(raw?._id || raw?.id || ''),
      name: String(raw?.name || ''),
      slug: String(raw?.slug || ''),
      description: String(raw?.description || ''),
      parentId: String(raw?.parent_id || ''),
      isActive: raw?.is_active !== false,
      createdAt: raw?.created_at ? new Date(raw.created_at) : null,
      updatedAt: raw?.updated_at ? new Date(raw.updated_at) : null
    };
  }
}
