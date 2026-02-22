import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductService } from '../../../services/retail.service';
import { Router } from '@angular/router';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  supplier: string;
  status: 'active' | 'inactive' | 'discontinued';
  lastUpdated: Date;
  barcode?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: any = null;
  loading = false;
  showFilters = false;

  showProductDialog = false;
  editingProduct: Product | null = null;

  categoryOptions = [
    { label: 'All Categories', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Food & Beverage', value: 'food' },
    { label: 'Home & Garden', value: 'home' },
    { label: 'Sports', value: 'sports' },
    { label: 'Books', value: 'books' }
  ];

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Discontinued', value: 'discontinued' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.listProducts(this.selectedCategory || undefined, 0, 20).subscribe({
      next: (response: any) => {
        const apiProducts = Array.isArray(response?.data) ? response.data : [];
        this.products = apiProducts.map((item: any) => this.mapApiProduct(item));
        this.refreshCategoryOptionsFromProducts();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load products', error);
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products from API'
        });
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = null;
    this.filteredProducts = [...this.products];
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'discontinued': return 'danger';
      default: return 'info';
    }
  }

  getStockStatus(product: Product): { status: string, severity: string } {
    if (product.currentStock === 0) {
      return { status: 'Out of Stock', severity: 'danger' };
    } else if (product.currentStock <= product.minStock) {
      return { status: 'Low Stock', severity: 'warning' };
    } else if (product.currentStock >= product.maxStock) {
      return { status: 'Overstock', severity: 'info' };
    } else {
      return { status: 'In Stock', severity: 'success' };
    }
  }

  getCategoryLabel(category: string): string {
    const labels = {
      'electronics': 'Electronics',
      'clothing': 'Clothing',
      'food': 'Food & Beverage',
      'home': 'Home & Garden',
      'sports': 'Sports',
      'books': 'Books'
    };
    return labels[category] || category;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  editProduct(product: Product) {
    this.editingProduct = { ...product };
    this.showProductDialog = true;
  }

  viewProduct(product: Product) {
    if (!product?.id) return;
    this.router.navigate(['/retail/inventory/products', product.id]);
  }

  deleteProduct(event: Event, product: Product) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete product "${product.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.products = this.products.filter(p => p.id !== product.id);
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully'
        });
      }
    });
  }

  createProduct() {
    this.router.navigate(['/retail/inventory/products/create']);
  }

  saveProduct() {
    if (this.editingProduct) {
      // Calculate total value
      this.editingProduct.totalValue = this.editingProduct.currentStock * this.editingProduct.unitPrice;

      if (this.editingProduct.id) {
        // Update existing
        const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
        if (index !== -1) {
          this.products[index] = { ...this.editingProduct, lastUpdated: new Date() };
        }
      } else {
        // Create new
        this.editingProduct.id = Date.now().toString();
        this.products.push({ ...this.editingProduct });
      }

      this.applyFilters();
      this.showProductDialog = false;
      this.editingProduct = null;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Product saved successfully'
      });
    }
  }

  cancelEdit() {
    this.showProductDialog = false;
    this.editingProduct = null;
  }

  refreshData() {
    this.loadProducts();
    this.messageService.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: 'Data refreshed successfully'
    });
  }

  exportProducts() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Exporting products data'
    });
  }

  getTotalProducts() {
    return this.products.length;
  }

  getLowStockProducts() {
    return this.products.filter(p => p.currentStock <= p.minStock && p.currentStock > 0).length;
  }

  getOutOfStockProducts() {
    return this.products.filter(p => p.currentStock === 0).length;
  }

  getTotalValue() {
    return this.products.reduce((sum, product) => sum + product.totalValue, 0);
  }

  get filteredCategoryOptions() {
    return this.categoryOptions;
  }

  get productCategoryOptions() {
    return this.categoryOptions.filter(opt => opt.value !== '');
  }

  get filteredStatusOptions() {
    return this.statusOptions;
  }

  private mapApiProduct(item: any): Product {
    const currentStock = Number(item?.stock ?? item?.quantity ?? 0);
    const unitPrice = Number(item?.selling_price ?? item?.price ?? 0);
    const minStock = Number(item?.reorder_level ?? 0);
    const maxStock = Number(item?.maximum_stock ?? 0);
    return {
      id: String(item?._id ?? item?.id ?? ''),
      name: String(item?.name ?? 'Unknown product'),
      sku: String(item?.sku ?? '-'),
      category: String(item?.category ?? 'other'),
      description: String(item?.description ?? ''),
      currentStock,
      minStock,
      maxStock,
      unitPrice,
      totalValue: currentStock * unitPrice,
      location: String(item?.location ?? '-'),
      supplier: String(item?.supplier_id ?? '-'),
      status: item?.is_active === false ? 'inactive' : 'active',
      lastUpdated: item?.updated_at ? new Date(item.updated_at) : new Date(),
      barcode: item?.barcode ?? ''
    };
  }

  private refreshCategoryOptionsFromProducts(): void {
    const dynamic = Array.from(
      new Set(
        this.products
          .map((p) => (p.category || '').trim())
          .filter((v) => !!v)
      )
    ).sort((a, b) => a.localeCompare(b));

    this.categoryOptions = [
      { label: 'All Categories', value: '' },
      ...dynamic.map((value) => ({ label: this.getCategoryLabel(value), value }))
    ];
  }
}
