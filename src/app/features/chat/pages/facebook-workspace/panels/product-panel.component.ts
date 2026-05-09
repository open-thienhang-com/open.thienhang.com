import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../../services/chat.service';
import { TelegramConversation, ProductSearchResult, TelegramMessage } from '../../../models/chat.model';

interface OrderItem {
  product: ProductSearchResult;
  qty: number;
}

@Component({
  selector: 'app-product-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonModule, TagModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="product-panel p-4">
      <!-- Search -->
      <div class="mb-3">
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            class="form-input pl-8 w-full text-sm"
            [(ngModel)]="searchKeyword"
            (ngModelChange)="onSearch($event)"
            placeholder="Search products by name or SKU..."
          />
          <button *ngIf="searchKeyword" type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            (click)="clearSearch()">
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div *ngIf="loading" class="flex flex-col gap-2">
        <p-skeleton height="4rem" *ngFor="let _ of [1,2,3,4]"></p-skeleton>
      </div>

      <!-- Product list -->
      <div *ngIf="!loading && displayedProducts.length > 0" class="product-results mb-4">
        <p class="text-xs text-gray-400 mb-2">
          {{ searchKeyword ? 'Search results' : 'All products' }}
          <span class="font-medium text-gray-600">({{ totalProducts }})</span>
        </p>
        <div *ngFor="let product of displayedProducts" class="product-card">
          <div class="product-card-image" *ngIf="product.image_url">
            <img [src]="product.image_url" [alt]="product.name"
                 (error)="onImageError($event)" />
          </div>
          <div class="product-card-image product-no-image" *ngIf="!product.image_url">
            <i class="pi pi-box text-gray-300"></i>
          </div>
          <div class="product-card-info flex-1 min-w-0">
            <strong class="block text-sm truncate">{{ product.name }}</strong>
            <span class="text-xs text-gray-500">{{ product.sku }}</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm font-semibold text-blue-600">
                {{ product.selling_price | currency:'VND':'symbol':'1.0-0' }}
              </span>
              <p-tag *ngIf="product.category" [value]="product.category" severity="secondary"></p-tag>
            </div>
          </div>
          <div class="product-card-actions flex flex-col gap-1">
            <button type="button" class="ghost-action text-xs" (click)="sendProduct(product)" [disabled]="sending">
              <i class="pi pi-send mr-1"></i>Send
            </button>
            <button type="button" class="ghost-action text-xs" (click)="addToOrder(product)">
              <i class="pi pi-plus mr-1"></i>Add
            </button>
          </div>
        </div>

        <!-- Load more -->
        <button *ngIf="!searchKeyword && hasMore"
          type="button" class="load-more-btn w-full mt-2 text-xs"
          (click)="loadMore()" [disabled]="loadingMore">
          <i [class]="loadingMore ? 'pi pi-spin pi-spinner' : 'pi pi-chevron-down'" class="mr-1"></i>
          {{ loadingMore ? 'Loading...' : 'Load more' }}
        </button>
      </div>

      <div *ngIf="!loading && searchKeyword.trim() && displayedProducts.length === 0"
           class="text-center py-6 text-sm text-gray-400">
        <i class="pi pi-box block mb-2 text-2xl"></i>
        No products found for "{{ searchKeyword }}"
      </div>

      <div *ngIf="!loading && !searchKeyword && displayedProducts.length === 0"
           class="text-center py-6 text-sm text-gray-400">
        <i class="pi pi-box block mb-2 text-2xl"></i>
        No products available
      </div>

      <!-- Order draft -->
      <div *ngIf="orderItems.length > 0" class="order-draft mt-4">
        <p class="text-xs font-semibold text-gray-600 mb-2">
          <i class="pi pi-shopping-cart mr-1"></i>
          Order draft ({{ orderItems.length }} items)
        </p>
        <div *ngFor="let item of orderItems; let i = index" class="order-item-row">
          <span class="flex-1 text-sm truncate">{{ item.product.name }}</span>
          <div class="flex items-center gap-1">
            <button type="button" class="qty-btn" (click)="changeQty(i, -1)">−</button>
            <span class="text-sm w-6 text-center">{{ item.qty }}</span>
            <button type="button" class="qty-btn" (click)="changeQty(i, 1)">+</button>
            <button type="button" class="ghost-action text-xs ml-1" (click)="removeFromOrder(i)">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
          <span class="text-sm text-gray-500">
            Total: <strong>{{ orderTotal | currency:'VND':'symbol':'1.0-0' }}</strong>
          </span>
          <div class="flex gap-2">
            <button type="button" class="ghost-action text-xs" (click)="clearOrder()">Clear</button>
            <button type="button" class="send-btn text-xs" (click)="createOrder()" [disabled]="creatingOrder">
              <i [class]="creatingOrder ? 'pi pi-spin pi-spinner' : 'pi pi-shopping-cart'" class="mr-1"></i>
              {{ creatingOrder ? 'Creating...' : 'Create Order' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <p-toast position="bottom-right"></p-toast>
  `,
  styles: [`
    .product-results { display: flex; flex-direction: column; gap: 8px; }
    .product-card {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;
      background: white; transition: box-shadow .15s;
    }
    .product-card:hover { box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .product-card-image img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
    .product-no-image {
      width: 48px; height: 48px; border-radius: 6px; background: #f3f4f6;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .product-card-actions { flex-shrink: 0; }
    .load-more-btn {
      padding: 6px 12px; border: 1px dashed #d1d5db; border-radius: 6px;
      background: transparent; cursor: pointer; color: #6b7280;
    }
    .load-more-btn:hover:not(:disabled) { background: #f9fafb; }
    .order-draft {
      background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;
    }
    .order-item-row {
      display: flex; align-items: center; gap: 8px; padding: 6px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .order-item-row:last-of-type { border-bottom: none; }
    .qty-btn {
      width: 22px; height: 22px; border: 1px solid #d1d5db; border-radius: 4px;
      background: white; cursor: pointer; font-size: 14px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .qty-btn:hover { background: #f3f4f6; }
  `]
})
export class ProductPanelComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  @Input() conversation: TelegramConversation | null = null;
  @Output() messageSent = new EventEmitter<TelegramMessage>();

  searchKeyword = '';
  displayedProducts: ProductSearchResult[] = [];
  totalProducts = 0;
  loading = false;
  loadingMore = false;
  hasMore = false;
  sending = false;
  creatingOrder = false;
  orderItems: OrderItem[] = [];

  private currentSkip = 0;
  private readonly pageSize = 20;
  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor() {
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword.trim()) {
            this.loadInitialProducts();
            return of(null);
          }
          this.loading = true;
          this.displayedProducts = [];
          return this.chatService.searchProductsForChat(keyword, 30).pipe(catchError(() => of(null)));
        })
      ).subscribe(res => {
        if (res !== null) {
          this.loading = false;
          this.displayedProducts = res?.data || [];
          this.totalProducts = res?.total ?? this.displayedProducts.length;
        }
      })
    );
  }

  ngOnInit(): void {
    this.loadInitialProducts();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadInitialProducts(): void {
    this.currentSkip = 0;
    this.loading = true;
    this.displayedProducts = [];
    this.subs.add(
      this.chatService.getProductsForChat(0, this.pageSize).pipe(catchError(() => of(null))).subscribe(res => {
        this.loading = false;
        this.displayedProducts = res?.data || [];
        this.totalProducts = res?.total ?? this.displayedProducts.length;
        this.hasMore = this.displayedProducts.length >= this.pageSize;
        this.currentSkip = this.displayedProducts.length;
      })
    );
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.subs.add(
      this.chatService.getProductsForChat(this.currentSkip, this.pageSize).pipe(catchError(() => of(null))).subscribe(res => {
        this.loadingMore = false;
        const newItems = res?.data || [];
        this.displayedProducts = [...this.displayedProducts, ...newItems];
        this.currentSkip += newItems.length;
        this.hasMore = newItems.length >= this.pageSize;
      })
    );
  }

  onSearch(keyword: string): void {
    this.searchSubject.next(keyword);
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.loadInitialProducts();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  get orderTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.product.selling_price * item.qty, 0);
  }

  sendProduct(product: ProductSearchResult): void {
    const conv = this.conversation;
    if (!conv?.chat_id) return;

    this.sending = true;

    const priceStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.selling_price);
    let caption = `🛍️ *${product.name}*`;
    if (product.category) caption += `\n🏷️ ${product.category}`;
    caption += `\n💰 ${priceStr}`;
    if (product.description) caption += `\n\n${product.description}`;

    const keyboard = {
      inline_keyboard: [[
        { text: '🛒 Order now', callback_data: `order:${product.id}` },
        ...(product.selling_price ? [{ text: `💰 ${priceStr}`, callback_data: `price:${product.id}` }] : [])
      ]]
    };

    if (product.image_url) {
      this.chatService.sendTelegramPhoto({
        chat_id: conv.chat_id,
        photo: product.image_url,
        caption,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }).subscribe({
        next: () => this.onSendSuccess(product, caption, 'photo', product.image_url),
        error: () => this.onSendError()
      });
    } else {
      this.chatService.sendTelegramMessage({
        chat_id: conv.chat_id,
        text: caption,
        disable_notification: false,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }).subscribe({
        next: () => this.onSendSuccess(product, caption, 'text'),
        error: () => this.onSendError()
      });
    }
  }

  private onSendSuccess(product: ProductSearchResult, content: string, type: string, mediaUrl?: string): void {
    this.sending = false;
    this.messageSent.emit({
      id: `product_${Date.now()}`,
      sender: 'agent', sender_name: 'Agent',
      content, timestamp: new Date().toISOString(),
      message_type: type, delivery_status: 'sent',
      media_url: mediaUrl, caption: content
    });
    this.messageService.add({ severity: 'success', summary: 'Product sent', detail: product.name });
  }

  private onSendError(): void {
    this.sending = false;
    this.messageService.add({ severity: 'error', summary: 'Send failed', detail: 'Could not send product' });
  }

  addToOrder(product: ProductSearchResult): void {
    const existing = this.orderItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.orderItems = [...this.orderItems, { product, qty: 1 }];
    }
  }

  changeQty(index: number, delta: number): void {
    const item = this.orderItems[index];
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      this.removeFromOrder(index);
    } else {
      this.orderItems = this.orderItems.map((it, i) => i === index ? { ...it, qty: newQty } : it);
    }
  }

  removeFromOrder(index: number): void {
    this.orderItems = this.orderItems.filter((_, i) => i !== index);
  }

  clearOrder(): void {
    this.orderItems = [];
  }

  createOrder(): void {
    if (!this.orderItems.length || !this.conversation?.chat_id) return;
    this.creatingOrder = true;

    const lines = this.orderItems.map(item =>
      `• ${item.product.name} × ${item.qty} = ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.product.selling_price * item.qty)}`
    ).join('\n');
    const totalStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(this.orderTotal);
    const summary = `📋 Order created:\n${lines}\n💰 Total: ${totalStr}`;

    this.chatService.sendTelegramMessage({
      chat_id: this.conversation.chat_id,
      text: summary,
      disable_notification: false
    }).subscribe({
      next: () => {
        const itemCount = this.orderItems.length;
        this.messageSent.emit({
          id: `order_${Date.now()}`,
          sender: 'agent', sender_name: 'Agent',
          content: summary, timestamp: new Date().toISOString(),
          message_type: 'text', delivery_status: 'sent'
        });
        this.clearOrder();
        this.creatingOrder = false;
        this.messageService.add({ severity: 'success', summary: 'Order created', detail: `${itemCount} items` });
      },
      error: () => {
        this.creatingOrder = false;
        this.messageService.add({ severity: 'error', summary: 'Order failed', detail: 'Could not create order' });
      }
    });
  }
}
