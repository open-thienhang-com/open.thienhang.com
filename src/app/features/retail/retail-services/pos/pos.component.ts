import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService, CategoryService, WarehouseService, InventoryService } from '../../../inventory/services/inventory.service';
import { UploadService } from '../../../inventory/services/upload.service';
import { Product, Warehouse, Stock } from '../../../inventory/models/inventory.models';

interface PosCartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss',
  providers: [MessageService]
})
export class PosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private inventoryService = inject(InventoryService);
  private warehouseService = inject(WarehouseService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private uploadService = inject(UploadService);
  private messageService = inject(MessageService);
  loading = false;
  searchTerm = '';
  selectedCategory = '';

  paymentMethod: 'cash' | 'card' | 'ewallet' = 'cash';
  amountReceived: number | null = null;
  placingOrder = false;

  products: Product[] = [];
  categories: string[] = [];
  cart: PosCartItem[] = [];
  warehouses: Warehouse[] = [];
  selectedWarehouseId: string = '';
  stockMap: Record<string, number> = {};
  currentDate: Date = new Date();
  orderNumber: string = Math.floor(1000 + Math.random() * 9000).toString();

  constructor() { 
    setInterval(() => this.currentDate = new Date(), 60000);
  }

  applyFilters(): void {
    // Getter 'filteredProducts' handles the filtering automatically when signals or properties change
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
    this.loadCategories();
  }

  get filteredProducts(): Product[] {
    const keyword = this.searchTerm.trim().toLowerCase();
    return this.products.filter((product) => {
      const matchesSearch = !keyword
        || product.name.toLowerCase().includes(keyword)
        || product.sku.toLowerCase().includes(keyword)
        || product.category.toLowerCase().includes(keyword);
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  get itemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + this.getEffectivePrice(item.product) * item.quantity, 0);
  }

  get tax(): number {
    return this.subtotal * 0.08;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  get changeAmount(): number {
    if (this.paymentMethod !== 'cash') return 0;
    const received = Number(this.amountReceived || 0);
    return Math.max(received - this.total, 0);
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.listProducts(undefined, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.products = resp.data || [];
          this.signImages();
          if (this.selectedWarehouseId) {
            this.loadStocks();
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'POS',
            detail: 'Product API unavailable.'
          });
        }
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
      .subscribe(res => {
        const cats = res.data || [];
        this.categories = cats.map((c: any) => c.name);
      });
  }

  private signImages(): void {
    this.products.forEach(product => {
      // Sign thumbnail
      if (product.thumbnail?.url && !product.thumbnail.url.startsWith('http')) {
        this.uploadService.getSignedUrl(product.thumbnail.url).subscribe(res => {
          if (res.success && product.thumbnail) product.thumbnail.url = res.signed_url;
        });
      }
    });
  }

  getProductImage(product: Product): string {
    return product.thumbnail?.url || '';
  }

  getEffectivePrice(product: Product): number {
    return product.discount_price || product.selling_price || product.cost_price || 0;
  }

  getProductPrice(product: Product): number {
    return product.selling_price || product.cost_price || 0;
  }

  hasDiscount(product: Product): boolean {
    return !!product.discount_price && product.discount_price < this.getProductPrice(product);
  }

  getDiscountPercent(product: Product): number {
    const orig = this.getProductPrice(product);
    const disc = product.discount_price || orig;
    if (orig <= 0) return 0;
    return Math.round(((orig - disc) / orig) * 100);
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      'Electronics': '#3b82f6',
      'Apparel': '#ec4899',
      'Groceries': '#10b981',
      'Home': '#f59e0b',
      'Beauty': '#8b5cf6'
    };
    return colors[cat] || '#64748b';
  }

  addToCart(product: Product): void {
    const stock = this.getStockLevel(product.id);
    const inCart = this.cart.find(i => i.product.id === product.id)?.quantity || 0;
    
    if (stock <= inCart) {
      this.messageService.add({ severity: 'warn', summary: 'Out of Stock', detail: 'Requested quantity exceeds available stock.' });
      return;
    }

    const existing = this.cart.find((line) => line.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
      return;
    }
    this.cart.unshift({ product: product as any, quantity: 1 });
  }

  increase(line: PosCartItem): void {
    const stock = this.getStockLevel(line.product.id);
    if (line.quantity < stock) {
      line.quantity += 1;
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Stock Limit', detail: 'Maximum stock reached.' });
    }
  }

  decrease(line: PosCartItem): void {
    line.quantity -= 1;
    if (line.quantity <= 0) {
      this.remove(line);
    }
  }

  remove(line: PosCartItem): void {
    this.cart = this.cart.filter((item) => item.product.id !== line.product.id);
  }

  clearCart(): void {
    this.cart = [];
    this.amountReceived = null;
  }

  completeSale(): void {
    if (!this.cart.length || this.total <= 0 || this.placingOrder) return;
    if (this.paymentMethod === 'cash' && Number(this.amountReceived || 0) < this.total) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Insufficient Cash',
        detail: 'Amount received is less than total amount.'
      });
      return;
    }

    const payload = {
      customer_id: 'walk-in',
      total_amount: this.total,
      status: 'confirmed',
      items: this.cart.map((line) => ({
        product_id: line.product.id,
        quantity: line.quantity,
        unit_price: this.getEffectivePrice(line.product as any),
        total_price: this.getEffectivePrice(line.product as any) * line.quantity
      }))
    };

    this.placingOrder = true;
    this.inventoryService.createOrder(payload).subscribe({
      next: () => {
        this.placingOrder = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sale Completed',
          detail: 'Order has been created successfully.'
        });
        this.clearCart();
      },
      error: () => {
        this.placingOrder = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Checkout Failed',
          detail: 'Could not create order.'
        });
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value || 0);
  }
}
