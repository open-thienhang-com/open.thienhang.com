import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService, CategoryService, WarehouseService, InventoryService } from '../../../inventory/services/inventory.service';
import { UploadService } from '../../../inventory/services/upload.service';
import { Product, Warehouse, Stock } from '../../../inventory/models/inventory.models';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecommerce.component.html',
  styleUrl: './ecommerce.component.scss'
})
export class EcommerceComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private inventoryService = inject(InventoryService);
  private warehouseService = inject(WarehouseService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private uploadService = inject(UploadService);

  // Data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  cart: CartItem[] = [];
  warehouses: Warehouse[] = [];
  selectedWarehouseId: string = '';
  stockMap: Record<string, number> = {};

  // Filters
  searchQuery = '';
  selectedCategory = '';
  sortBy = 'featured';

  // State
  isLoading = false;
  isCartVisible = true;
  voucherApplied = false;
  voucherCode = '';
  discountRate = 0;

  // Stats
  totalProducts = 0;
  discountDeals = 0;
  totalCategories = 0;
  averagePrice = 0;

  // Sort options
  sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.listProducts(undefined, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.products = res.data || [];
          this.signImages();
          this.totalProducts = res.total || this.products.length;
          this.discountDeals = this.products.filter(p => (p.discount_price ?? 0) > 0).length;
          if (this.products.length > 0) {
            const prices = this.products.map(p => this.getEffectivePrice(p));
            this.averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          }
          if (this.selectedWarehouseId) {
            this.loadStocks();
          }
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  loadWarehouses(): void {
    this.warehouseService.listWarehouses()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.warehouses = res.data || [];
        if (this.warehouses.length > 0 && !this.selectedWarehouseId) {
          this.selectedWarehouseId = this.warehouses[0].id;
          this.loadStocks();
        }
      });
  }

  loadStocks(): void {
    if (!this.selectedWarehouseId) return;
    this.inventoryService.listStocks(this.selectedWarehouseId, 0, 200)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        const stocks = res.data || [];
        this.stockMap = {};
        stocks.forEach(s => {
          this.stockMap[s.product_id] = s.quantity;
        });
      });
  }

  onWarehouseChange(): void {
    this.loadStocks();
  }

  getStockLevel(productId: string): number {
    return this.stockMap[productId] ?? 0;
  }

  loadCategories(): void {
    this.categoryService.listCategories(0, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const cats = res.data || [];
          this.categories = cats.map((c: any) => c.name || c);
          this.totalCategories = this.categories.length;
        }
      });
  }

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory) {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    switch (this.sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.selling_price ?? a.price ?? 0) - (b.selling_price ?? b.price ?? 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.selling_price ?? b.price ?? 0) - (a.selling_price ?? a.price ?? 0));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    this.filteredProducts = result;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortBy = 'featured';
    this.applyFilters();
  }

  getProductPrice(product: Product): number {
    return product.selling_price ?? product.price ?? 0;
  }

  getEffectivePrice(product: Product): number {
    const dp = product.discount_price ?? 0;
    const sp = this.getProductPrice(product);
    return dp > 0 && dp < sp ? dp : sp;
  }

  hasDiscount(product: Product): boolean {
    const dp = product.discount_price ?? 0;
    return dp > 0 && dp < this.getProductPrice(product);
  }

  getDiscountPercent(product: Product): number {
    const orig = this.getProductPrice(product);
    const disc = product.discount_price ?? 0;
    if (!orig || !disc) return 0;
    return Math.round(((orig - disc) / orig) * 100);
  }

  getProductImage(product: Product): string {
    if (product.thumbnail?.url) return product.thumbnail.url;
    if (product.images && product.images.length > 0) return product.images[0].url;
    return '';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Electronics: '#6366f1',
      Clothing: '#ec4899',
      Food: '#f59e0b',
      Home: '#10b981',
      Sports: '#3b82f6',
      Books: '#8b5cf6',
      Toys: '#f97316',
    };
    return colors[category] || '#64748b';
  }

  // Cart methods
  addToCart(product: Product): void {
    const stock = this.getStockLevel(product.id);
    const inCart = this.getCartQuantity(product.id);
    
    if (stock <= inCart) {
      // Small visual feedback or alert could go here
      return;
    }
    
    const existing = this.cart.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter(i => i.product.id !== productId);
  }

  updateQuantity(productId: string, qty: number): void {
    if (qty <= 0) { this.removeFromCart(productId); return; }
    const item = this.cart.find(i => i.product.id === productId);
    if (item) item.quantity = qty;
  }

  getCartItemCount(): number {
    return this.cart.reduce((sum, i) => sum + i.quantity, 0);
  }

  getCartQuantity(productId: string): number {
    return this.cart.find(i => i.product.id === productId)?.quantity ?? 0;
  }

  isInCart(productId: string): boolean {
    return this.cart.some(i => i.product.id === productId);
  }

  getSubtotal(): number {
    return this.cart.reduce((sum, i) => sum + this.getEffectivePrice(i.product) * i.quantity, 0);
  }

  getTax(): number {
    return this.getSubtotal() * 0.1;
  }

  getDiscount(): number {
    return this.getSubtotal() * this.discountRate;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax() - this.getDiscount();
  }

  applyVoucher(): void {
    if (this.voucherCode.toUpperCase() === 'SAVE8') {
      this.discountRate = 0.08;
      this.voucherApplied = true;
    }
  }

  clearVoucher(): void {
    this.discountRate = 0;
    this.voucherApplied = false;
    this.voucherCode = '';
  }

  clearCart(): void {
    this.cart = [];
    this.clearVoucher();
  }

  checkout(): void {
    alert('Demo checkout – total: $' + this.getTotal().toFixed(2));
  }

  private signImages(): void {
    this.products.forEach(product => {
      // Sign thumbnail
      if (product.thumbnail?.url && !product.thumbnail.url.startsWith('http')) {
        this.uploadService.getSignedUrl(product.thumbnail.url).subscribe(res => {
          if (res.success && product.thumbnail) product.thumbnail.url = res.signed_url;
        });
      }
      // Sign first gallery image if needed
      if (product.images?.length && !product.images[0].url.startsWith('http')) {
        this.uploadService.getSignedUrl(product.images[0].url).subscribe(res => {
          if (res.success && product.images) product.images[0].url = res.signed_url;
        });
      }
    });
  }
}
