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
import { ConfirmationService, MessageService } from 'primeng/api';

interface CategoryItem {
  id: string;
  name: string;
  code: string;
  parentCategory: string;
  description: string;
  status: 'active' | 'inactive';
  productCount: number;
  updatedAt: Date;
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
  styleUrl: './categories.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class CategoriesComponent implements OnInit {
  categories: CategoryItem[] = [];
  filteredCategories: CategoryItem[] = [];

  searchTerm = '';
  selectedStatus = '';
  selectedParentCategory = '';

  showCategoryDialog = false;
  editingCategory: CategoryItem | null = null;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  parentCategoryOptions = [
    { label: 'All Parent Categories', value: '' },
    { label: 'Root', value: 'Root' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Fashion', value: 'Fashion' },
    { label: 'Home & Living', value: 'Home & Living' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories = [
      {
        id: 'cat-001',
        name: 'Electronics',
        code: 'ELEC',
        parentCategory: 'Root',
        description: 'Phones, laptops, audio devices and accessories',
        status: 'active',
        productCount: 145,
        updatedAt: new Date('2026-02-18')
      },
      {
        id: 'cat-002',
        name: 'Smartphones',
        code: 'PHONE',
        parentCategory: 'Electronics',
        description: 'iOS and Android smartphones',
        status: 'active',
        productCount: 42,
        updatedAt: new Date('2026-02-20')
      },
      {
        id: 'cat-003',
        name: 'Fashion',
        code: 'FASH',
        parentCategory: 'Root',
        description: 'Men and women apparel',
        status: 'active',
        productCount: 268,
        updatedAt: new Date('2026-02-17')
      },
      {
        id: 'cat-004',
        name: 'Seasonal Promotions',
        code: 'SEASONAL',
        parentCategory: 'Root',
        description: 'Temporary category for campaign products',
        status: 'inactive',
        productCount: 0,
        updatedAt: new Date('2026-01-30')
      }
    ];

    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredCategories = this.categories.filter((item) => {
      const matchesSearch = !this.searchTerm
        || item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.code.toLowerCase().includes(this.searchTerm.toLowerCase())
        || item.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;
      const matchesParent = !this.selectedParentCategory || item.parentCategory === this.selectedParentCategory;

      return matchesSearch && matchesStatus && matchesParent;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedParentCategory = '';
    this.applyFilters();
  }

  createCategory(): void {
    this.editingCategory = {
      id: '',
      name: '',
      code: '',
      parentCategory: 'Root',
      description: '',
      status: 'active',
      productCount: 0,
      updatedAt: new Date()
    };
    this.showCategoryDialog = true;
  }

  editCategory(item: CategoryItem): void {
    this.editingCategory = { ...item };
    this.showCategoryDialog = true;
  }

  saveCategory(): void {
    if (!this.editingCategory) return;

    if (!this.editingCategory.name.trim() || !this.editingCategory.code.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name and code are required.'
      });
      return;
    }

    const existingIndex = this.categories.findIndex((it) => it.id === this.editingCategory!.id);
    const normalized = {
      ...this.editingCategory,
      code: this.editingCategory.code.trim().toUpperCase(),
      updatedAt: new Date()
    };

    if (existingIndex !== -1) {
      this.categories[existingIndex] = normalized;
    } else {
      this.categories.unshift({
        ...normalized,
        id: `cat-${Date.now()}`
      });
    }

    this.applyFilters();
    this.showCategoryDialog = false;
    this.editingCategory = null;

    this.messageService.add({
      severity: 'success',
      summary: 'Saved',
      detail: 'Category has been saved successfully.'
    });
  }

  cancelEdit(): void {
    this.showCategoryDialog = false;
    this.editingCategory = null;
  }

  deleteCategory(item: CategoryItem): void {
    this.confirmationService.confirm({
      message: `Delete category "${item.name}"?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categories = this.categories.filter((it) => it.id !== item.id);
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Category deleted successfully.'
        });
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'secondary' {
    return status === 'active' ? 'success' : 'secondary';
  }

  getTotalProducts(): number {
    return this.categories.reduce((sum, item) => sum + item.productCount, 0);
  }

  getActiveCategories(): number {
    return this.categories.filter((item) => item.status === 'active').length;
  }
}
