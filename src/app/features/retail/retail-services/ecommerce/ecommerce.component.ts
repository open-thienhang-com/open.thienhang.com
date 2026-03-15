import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService, CategoryService } from '../../services/retail.service';
import { Product } from '../../models/retail.models';

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

  // Data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  cart: CartItem[] = [];

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

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.listProducts(undefined, 0, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.products = res.data || [];
          this.totalProducts = res.total || this.products.length;
          this.discountDeals = this.products.filter(p => (p.discount_price ?? 0) > 0).length;
          if (this.products.length > 0) {
            const prices = this.products.map(p => p.selling_price ?? p.price ?? 0);
            this.averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          }
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
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
    if (product.images && product.images.length > 0) return product.images[0];
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
}
