import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ProductService, CategoryService } from '../../services/retail.service';
import { Product } from '../../models/retail.models';

interface ShopProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountPrice: number;
  isActive: boolean;
  sku: string;
  barcode: string;
}

interface CartItem {
  product: ShopProduct;
  quantity: number;
}

@Component({
  selector: 'app-retail-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule],
  templateUrl: './shop.component.html'
})
export class RetailShopComponent implements OnInit {
  loading = false;
  error = '';

  products: ShopProduct[] = [];
  categories: { label: string; value: string }[] = [{ label: 'All categories', value: '' }];

  searchTerm = '';
  selectedCategory = '';
  cart: CartItem[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  get filteredProducts(): ShopProduct[] {
    const keyword = this.searchTerm.trim().toLowerCase();
    return this.products.filter((p) => {
      const matchesKeyword = !keyword
        || p.name.toLowerCase().includes(keyword)
        || p.category.toLowerCase().includes(keyword)
        || p.description.toLowerCase().includes(keyword)
        || p.sku.toLowerCase().includes(keyword)
        || p.barcode.toLowerCase().includes(keyword);
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      return matchesKeyword && matchesCategory;
    });
  }

  get totalCartItems(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + this.getDisplayPrice(item.product) * item.quantity, 0);
  }

  get cartTax(): number {
    return this.cartSubtotal * 0.1;
  }

  get cartTotal(): number {
    return this.cartSubtotal + this.cartTax;
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.listProducts(undefined, 0, 100).subscribe({
      next: (resp: any) => {
        const raw = Array.isArray(resp?.data) ? resp.data : [];
        this.products = raw
          .map((item: Product) => this.mapProduct(item))
          .filter((item: ShopProduct) => item.isActive);

        if (!this.products.length) {
          this.products = this.getFallbackProducts();
          this.error = 'Product API returned no active products. Showing demo products.';
        }
        this.loading = false;
      },
      error: () => {
        this.products = this.getFallbackProducts();
        this.error = 'Cannot load products from API. Showing demo products.';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.listCategories(0, 100).subscribe({
      next: (resp: any) => {
        const raw = Array.isArray(resp?.data) ? resp.data : [];
        const values: string[] = raw
          .map((item: any): string => String(item?.name || '').trim())
          .filter((item: string) => !!item);
        const unique: string[] = [...new Set<string>(values)];
        this.categories = [
          { label: 'All categories', value: '' },
          ...unique.map((name) => ({ label: name, value: name }))
        ];
      },
      error: () => {
        this.categories = [
          { label: 'All categories', value: '' },
          { label: 'Essentials', value: 'Essentials' },
          { label: 'Lifestyle', value: 'Lifestyle' },
          { label: 'Electronics', value: 'Electronics' }
        ];
      }
    });
  }

  addToCart(product: ShopProduct): void {
    const existing = this.cart.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
      return;
    }
    this.cart.unshift({ product, quantity: 1 });
  }

  increaseQty(item: CartItem): void {
    item.quantity += 1;
  }

  decreaseQty(item: CartItem): void {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem): void {
    this.cart = this.cart.filter((cartItem) => cartItem.product.id !== item.product.id);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  checkoutDemo(): void {
    if (!this.cart.length) return;
    alert('Demo checkout. Integrate real checkout API later.');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  getDisplayPrice(product: ShopProduct): number {
    return product.discountPrice > 0 ? product.discountPrice : product.price;
  }

  private mapProduct(item: Product): ShopProduct {
    const id = String((item as any)?._id || item?.id || '');
    const regularPrice = Number((item as any)?.selling_price ?? item?.price ?? 0);
    const discountPrice = Number((item as any)?.discount_price ?? 0);
    return {
      id,
      name: String(item?.name || 'Unnamed product'),
      category: String(item?.category || 'Uncategorized'),
      description: String(item?.description || ''),
      price: regularPrice,
      discountPrice,
      isActive: (item as any)?.is_active !== false,
      sku: String(item?.sku || ''),
      barcode: String((item as any)?.barcode || '')
    };
  }

  private getFallbackProducts(): ShopProduct[] {
    return [
      {
        id: 'demo-1',
        name: 'Smart Home Camera',
        category: 'Electronics',
        description: 'Indoor camera with motion alerts and cloud backup.',
        price: 89,
        discountPrice: 69,
        isActive: true,
        sku: 'EL-0001',
        barcode: '100001'
      },
      {
        id: 'demo-2',
        name: 'Travel Backpack 28L',
        category: 'Lifestyle',
        description: 'Lightweight daily backpack with laptop compartment.',
        price: 59,
        discountPrice: 0,
        isActive: true,
        sku: 'LS-0015',
        barcode: '100002'
      },
      {
        id: 'demo-3',
        name: 'Vitamin C Serum',
        category: 'Essentials',
        description: 'Daily skincare serum for brightening and hydration.',
        price: 34,
        discountPrice: 29,
        isActive: true,
        sku: 'ES-0042',
        barcode: '100003'
      }
    ];
  }
}
