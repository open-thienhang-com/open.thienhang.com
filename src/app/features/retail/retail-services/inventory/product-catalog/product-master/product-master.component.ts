import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';

// Services
import { ConfirmationService, MessageService } from 'primeng/api';

interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  supplier: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  status: 'active' | 'inactive' | 'discontinued';
  images: string[];
  specifications: { [key: string]: any };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    BadgeModule,
    InputTextarea,
    InputNumberModule,
    FileUploadModule,
    TabViewModule,
    CheckboxModule
  ],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ProductMasterComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;

  // Dialog states
  productDialogVisible = false;
  productDialogMode: 'create' | 'edit' = 'create';

  // Form data
  currentProduct: Partial<Product> = {};
  selectedProducts: Product[] = [];

  // Filter options
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedBrand = '';

  // Dropdown options
  categories = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Food & Beverage', value: 'food' },
    { label: 'Home & Garden', value: 'home' },
    { label: 'Health & Beauty', value: 'health' },
    { label: 'Sports & Outdoors', value: 'sports' },
    { label: 'Books & Media', value: 'books' },
    { label: 'Automotive', value: 'automotive' }
  ];

  brands = [
    { label: 'Apple', value: 'apple' },
    { label: 'Samsung', value: 'samsung' },
    { label: 'Nike', value: 'nike' },
    { label: 'Adidas', value: 'adidas' },
    { label: 'Sony', value: 'sony' },
    { label: 'LG', value: 'lg' },
    { label: 'Dell', value: 'dell' },
    { label: 'HP', value: 'hp' }
  ];

  suppliers = [
    { label: 'TechCorp Inc.', value: 'techcorp' },
    { label: 'FashionHub Ltd.', value: 'fashionhub' },
    { label: 'Global Foods Co.', value: 'globalfoods' },
    { label: 'HomeStyle Distributors', value: 'homestyle' }
  ];

  units = [
    { label: 'Piece', value: 'piece' },
    { label: 'Kilogram', value: 'kg' },
    { label: 'Liter', value: 'liter' },
    { label: 'Meter', value: 'meter' },
    { label: 'Box', value: 'box' },
    { label: 'Pack', value: 'pack' }
  ];

  statuses = [
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
          sku: 'IPH15P128',
          barcode: '1234567890123',
          name: 'iPhone 15 Pro 128GB',
          description: 'Latest iPhone with advanced camera system and A17 Pro chip',
          category: 'electronics',
          brand: 'apple',
          supplier: 'techcorp',
          unit: 'piece',
          costPrice: 999,
          sellingPrice: 1199,
          status: 'active',
          images: ['/assets/images/products/iphone15.jpg'],
          specifications: {
            'Storage': '128GB',
            'Color': 'Natural Titanium',
            'Display': '6.1-inch Super Retina XDR',
            'Camera': '48MP Main'
          },
          tags: ['smartphone', 'apple', 'premium'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: '2',
          sku: 'NKAF1M',
          barcode: '1234567890124',
          name: 'Nike Air Force 1',
          description: 'Classic basketball sneakers with iconic style',
          category: 'clothing',
          brand: 'nike',
          supplier: 'fashionhub',
          unit: 'pair',
          costPrice: 80,
          sellingPrice: 120,
          status: 'active',
          images: ['/assets/images/products/nike-af1.jpg'],
          specifications: {
            'Size': '8-13',
            'Color': 'White',
            'Material': 'Leather/Synthetic',
            'Style': 'Low-top'
          },
          tags: ['sneakers', 'nike', 'casual'],
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18')
        },
        {
          id: '3',
          sku: 'ORGAPPLE1KG',
          barcode: '1234567890125',
          name: 'Organic Red Apples',
          description: 'Fresh organic red apples from local farms',
          category: 'food',
          brand: 'globalfoods',
          supplier: 'globalfoods',
          unit: 'kg',
          costPrice: 2.50,
          sellingPrice: 4.99,
          status: 'active',
          images: ['/assets/images/products/apples.jpg'],
          specifications: {
            'Type': 'Red Delicious',
            'Origin': 'Local Farm',
            'Organic': 'Certified',
            'Storage': 'Refrigerated'
          },
          tags: ['organic', 'fruit', 'fresh'],
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-22')
        }
      ];
      this.filteredProducts = [...this.products];
      this.loading = false;
    }, 1000);
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || product.status === this.selectedStatus;
      const matchesBrand = !this.selectedBrand || product.brand === this.selectedBrand;

      return matchesSearch && matchesCategory && matchesStatus && matchesBrand;
    });
  }

  openCreateDialog() {
    this.productDialogMode = 'create';
    this.currentProduct = {
      status: 'active',
      images: [],
      specifications: {},
      tags: []
    };
    this.productDialogVisible = true;
  }

  openEditDialog(product: Product) {
    this.productDialogMode = 'edit';
    this.currentProduct = { ...product };
    this.productDialogVisible = true;
  }

  saveProduct() {
    if (this.productDialogMode === 'create') {
      // Create new product
      const newProduct: Product = {
        id: Date.now().toString(),
        sku: this.currentProduct.sku || '',
        barcode: this.currentProduct.barcode,
        name: this.currentProduct.name || '',
        description: this.currentProduct.description || '',
        category: this.currentProduct.category || '',
        brand: this.currentProduct.brand || '',
        supplier: this.currentProduct.supplier || '',
        unit: this.currentProduct.unit || 'piece',
        costPrice: this.currentProduct.costPrice || 0,
        sellingPrice: this.currentProduct.sellingPrice || 0,
        status: this.currentProduct.status as Product['status'] || 'active',
        images: this.currentProduct.images || [],
        specifications: this.currentProduct.specifications || {},
        tags: this.currentProduct.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.products.unshift(newProduct);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Product created successfully'
      });
    } else {
      // Update existing product
      const index = this.products.findIndex(p => p.id === this.currentProduct.id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          ...this.currentProduct,
          updatedAt: new Date()
        } as Product;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product updated successfully'
        });
      }
    }

    this.filterProducts();
    this.productDialogVisible = false;
    this.currentProduct = {};
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${product.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(p => p.id !== product.id);
        this.filterProducts();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully'
        });
      }
    });
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedProducts.length} selected products?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(p => !this.selectedProducts.includes(p));
        this.selectedProducts = [];
        this.filterProducts();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${this.selectedProducts.length} products deleted successfully`
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-active';
      case 'inactive': return 'badge-inactive';
      case 'discontinued': return 'badge-discontinued';
      default: return '';
    }
  }

  getCategoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label || value;
  }

  getBrandLabel(value: string): string {
    return this.brands.find(b => b.value === value)?.label || value;
  }

  getSupplierLabel(value: string): string {
    return this.suppliers.find(s => s.value === value)?.label || value;
  }

  onImageUpload(event: any) {
    // Handle image upload logic here
    console.log('Image upload:', event);
  }

  addSpecification() {
    if (!this.currentProduct.specifications) {
      this.currentProduct.specifications = {};
    }
    // Add empty specification for user to fill
  }

  getSpecKeys(): string[] {
    return this.currentProduct.specifications ? Object.keys(this.currentProduct.specifications) : [];
  }
}
