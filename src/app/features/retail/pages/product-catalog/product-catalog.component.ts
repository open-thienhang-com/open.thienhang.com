import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProductService } from '../../services/retail.service';
import { Product } from '../../models/retail.models';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputNumberModule,
    DropdownModule, ToastModule, ConfirmDialogModule, SkeletonModule, TooltipModule,
    BadgeModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.scss']
})
export class ProductCatalogComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  showDialog = false;
  isEditMode = false;
  selectedProduct: Product | null = null;

  categories = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Books', value: 'books' },
    { label: 'Home & Garden', value: 'home_garden' },
    { label: 'Sports', value: 'sports' },
    { label: 'Food & Beverages', value: 'food_beverages' },
    { label: 'Toys', value: 'toys' },
    { label: 'Other', value: 'other' }
  ];

  selectedCategory = '';
  searchQuery = '';
  currentPage = 1;
  pageSize = 12;

  formData: Partial<Product> = this.getEmptyProductForm();

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    const skip = (this.currentPage - 1) * this.pageSize;

    this.productService.listProducts(
      this.selectedCategory || undefined,
      skip,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.products = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products'
        });
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadProducts();
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = this.getEmptyProductForm();
    this.showDialog = true;
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.formData = { ...product };
    this.showDialog = true;
  }

  saveProduct(): void {
    if (!this.formData.name || !this.formData.category || !this.formData.sku || !this.formData.barcode || this.formData.selling_price === undefined || this.formData.selling_price === null) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    this.loading = true;
    const operation = this.isEditMode
      ? this.productService.updateProduct(this.selectedProduct!.id, this.formData as any)
      : this.productService.createProduct(this.formData as any);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Product updated' : 'Product created'
        });
        this.loadProducts();
        this.showDialog = false;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save product'
        });
        this.loading = false;
      }
    });
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this product?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product deleted'
            });
            this.loadProducts();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete product'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  getMarginPercentage(product: Product): number {
    if (!product.cost_price) return 0;
    const sellingPrice = product.selling_price ?? product.price ?? 0;
    return ((sellingPrice - product.cost_price) / product.cost_price) * 100;
  }

  get filteredProducts(): Product[] {
    if (!this.searchQuery) return this.products;
    return this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  closeDialog(): void {
    this.showDialog = false;
    this.formData = this.getEmptyProductForm();
  }

  private getEmptyProductForm(): Partial<Product> {
    return {
      sku: '',
      name: '',
      barcode: '',
      description: '',
      category: '',
      selling_price: 0,
      cost_price: 0,
      subcategory: '',
      discount_price: 0,
      reorder_level: 10,
      maximum_stock: 0,
      supplier_id: '',
      is_active: true
    };
  }
}
