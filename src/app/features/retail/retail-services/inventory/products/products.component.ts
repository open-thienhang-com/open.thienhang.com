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
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;

    // Mock data - replace with actual API call
    setTimeout(() => {
      this.products = [
        {
          id: '1',
          name: 'Wireless Headphones Pro',
          sku: 'WH-PRO-001',
          category: 'electronics',
          description: 'Premium wireless headphones with noise cancellation',
          currentStock: 0,
          minStock: 5,
          maxStock: 50,
          unitPrice: 299.99,
          totalValue: 0,
          location: 'Main Warehouse - Aisle 3',
          supplier: 'AudioTech Inc.',
          status: 'active',
          lastUpdated: new Date('2024-01-15'),
          barcode: '123456789012'
        },
        {
          id: '2',
          name: 'Bluetooth Speaker',
          sku: 'BS-PORT-002',
          category: 'electronics',
          description: 'Portable Bluetooth speaker with waterproof design',
          currentStock: 3,
          minStock: 10,
          maxStock: 100,
          unitPrice: 79.99,
          totalValue: 239.97,
          location: 'Main Warehouse - Aisle 2',
          supplier: 'SoundWave Ltd.',
          status: 'active',
          lastUpdated: new Date('2024-01-14'),
          barcode: '123456789013'
        },
        {
          id: '3',
          name: 'Organic Cotton T-Shirt',
          sku: 'TS-ORG-L',
          category: 'clothing',
          description: '100% organic cotton t-shirt, size Large',
          currentStock: 25,
          minStock: 20,
          maxStock: 200,
          unitPrice: 24.99,
          totalValue: 624.75,
          location: 'Clothing Section - Rack 5',
          supplier: 'EcoWear Co.',
          status: 'active',
          lastUpdated: new Date('2024-01-13'),
          barcode: '123456789014'
        },
        {
          id: '4',
          name: 'Gaming Mouse RGB',
          sku: 'GM-RGB-001',
          category: 'electronics',
          description: 'High-precision gaming mouse with RGB lighting',
          currentStock: 15,
          minStock: 8,
          maxStock: 80,
          unitPrice: 49.99,
          totalValue: 749.85,
          location: 'Electronics Section - Shelf 2',
          supplier: 'GameTech Corp.',
          status: 'active',
          lastUpdated: new Date('2024-01-12'),
          barcode: '123456789015'
        },
        {
          id: '5',
          name: 'Stainless Steel Water Bottle',
          sku: 'WB-SS-500',
          category: 'home',
          description: '500ml stainless steel insulated water bottle',
          currentStock: 45,
          minStock: 15,
          maxStock: 150,
          unitPrice: 19.99,
          totalValue: 899.55,
          location: 'Home Goods - Aisle 1',
          supplier: 'HomeEssentials Inc.',
          status: 'active',
          lastUpdated: new Date('2024-01-11'),
          barcode: '123456789016'
        }
      ];

      this.filteredProducts = [...this.products];
      this.loading = false;
    }, 1000);
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
    this.editingProduct = {
      id: '',
      name: '',
      sku: '',
      category: '',
      description: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitPrice: 0,
      totalValue: 0,
      location: '',
      supplier: '',
      status: 'active',
      lastUpdated: new Date()
    };
    this.showProductDialog = true;
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
    return this.categoryOptions.filter(opt => opt.value !== '');
  }

  get filteredStatusOptions() {
    return this.statusOptions.filter(opt => opt.value !== null);
  }
}
