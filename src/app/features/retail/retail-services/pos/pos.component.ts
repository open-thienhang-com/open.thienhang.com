import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService, OrderService } from '../../services/retail.service';
import { Product } from '../../models/retail.models';

interface PosProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  isActive: boolean;
}

interface PosCartItem {
  product: PosProduct;
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
export class PosComponent implements OnInit {
  loading = false;
  searchTerm = '';
  selectedCategory = '';

  paymentMethod: 'cash' | 'card' | 'ewallet' = 'cash';
  amountReceived: number | null = null;
  placingOrder = false;

  products: PosProduct[] = [];
  cart: PosCartItem[] = [];

  categoryOptions: { label: string; value: string }[] = [{ label: 'All Categories', value: '' }];
  paymentOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'E-Wallet', value: 'ewallet' }
  ];

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): PosProduct[] {
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
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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
    this.productService.listProducts(undefined, 0, 200).subscribe({
      next: (resp: any) => {
        const raw = Array.isArray(resp?.data) ? resp.data : [];
        this.products = raw
          .map((item: Product) => this.mapProduct(item))
          .filter((item: PosProduct) => item.isActive);
        if (!this.products.length) {
          this.products = this.getFallbackProducts();
        }
        this.setupCategories();
        this.loading = false;
      },
      error: () => {
        this.products = this.getFallbackProducts();
        this.setupCategories();
        this.loading = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'POS',
          detail: 'Product API unavailable. Using demo catalog.'
        });
      }
    });
  }

  addToCart(product: PosProduct): void {
    const existing = this.cart.find((line) => line.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
      return;
    }
    this.cart.unshift({ product, quantity: 1 });
  }

  increase(line: PosCartItem): void {
    line.quantity += 1;
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
        unit_price: line.product.price,
        total_price: line.product.price * line.quantity
      }))
    };

    this.placingOrder = true;
    this.orderService.createOrder(payload).subscribe({
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
        // POS demo still completes locally even if order API fails.
        this.placingOrder = false;
        this.messageService.add({
          severity: 'info',
          summary: 'Demo Checkout',
          detail: 'Order API unavailable. Checkout completed in demo mode.'
        });
        this.clearCart();
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

  private setupCategories(): void {
    const categories: string[] = [...new Set(this.products.map((p) => p.category).filter((x) => !!x))];
    this.categoryOptions = [
      { label: 'All Categories', value: '' },
      ...categories.map((category) => ({ label: category, value: category }))
    ];
  }

  private mapProduct(item: Product): PosProduct {
    return {
      id: String((item as any)?._id || item?.id || ''),
      name: String(item?.name || 'Unnamed'),
      sku: String(item?.sku || ''),
      category: String(item?.category || 'General'),
      price: Number((item as any)?.selling_price ?? item?.price ?? 0),
      isActive: (item as any)?.is_active !== false
    };
  }

  private getFallbackProducts(): PosProduct[] {
    return [
      { id: 'demo-pos-1', name: 'Cold Brew Coffee', sku: 'POS-001', category: 'Beverage', price: 3.5, isActive: true },
      { id: 'demo-pos-2', name: 'Chicken Sandwich', sku: 'POS-002', category: 'Food', price: 7.9, isActive: true },
      { id: 'demo-pos-3', name: 'Chocolate Cookie', sku: 'POS-003', category: 'Bakery', price: 2.25, isActive: true },
      { id: 'demo-pos-4', name: 'Mineral Water', sku: 'POS-004', category: 'Beverage', price: 1.75, isActive: true }
    ];
  }

}
