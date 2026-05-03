import {
  Component, Input, Output, EventEmitter, OnDestroy, inject
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
        </div>
      </div>

      <!-- Loading skeletons -->
      <div *ngIf="searching" class="flex flex-col gap-2">
        <p-skeleton height="4rem"></p-skeleton>
        <p-skeleton height="4rem"></p-skeleton>
      </div>

      <!-- Product cards -->
      <div *ngIf="!searching && searchResults.length > 0" class="product-results mb-4">
        <div *ngFor="let product of searchResults" class="product-card">
          <div class="product-card-image" *ngIf="product.image_url">
            <img [src]="product.image_url" [alt]="product.name" />
          </div>
          <div class="product-card-info flex-1 min-w-0">
            <strong class="block text-sm truncate">{{ product.name }}</strong>
            <span class="text-xs text-gray-500">{{ product.sku }}</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm font-semibold text-blue-600">{{ product.selling_price | currency:'VND':'symbol':'1.0-0' }}</span>
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
      </div>

      <div *ngIf="!searching && searchKeyword.trim() && searchResults.length === 0" class="text-center py-4 text-sm text-gray-400">
        <i class="pi pi-box block mb-1"></i>
        No products found
      </div>

      <!-- Order draft -->
      <div *ngIf="orderItems.length > 0" class="order-draft mt-4">
        <p class="text-xs font-semibold text-gray-600 mb-2">Order draft ({{ orderItems.length }} items)</p>
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
          <span class="text-sm text-gray-500">Total: <strong>{{ orderTotal | currency:'VND':'symbol':'1.0-0' }}</strong></span>
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
      background: white;
    }
    .product-card-image img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
    .product-card-actions { flex-shrink: 0; }
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
export class ProductPanelComponent implements OnDestroy {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  @Input() conversation: TelegramConversation | null = null;
  @Output() messageSent = new EventEmitter<TelegramMessage>();

  searchKeyword = '';
  searchResults: ProductSearchResult[] = [];
  searching = false;
  sending = false;
  creatingOrder = false;
  orderItems: OrderItem[] = [];

  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor() {
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword.trim()) {
            this.searchResults = [];
            this.searching = false;
            return of(null);
          }
          this.searching = true;
          return this.chatService.searchProductsForChat(keyword, 10).pipe(catchError(() => of(null)));
        })
      ).subscribe(res => {
        this.searching = false;
        this.searchResults = res?.data || [];
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSearch(keyword: string): void {
    this.searchSubject.next(keyword);
  }

  get orderTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.product.selling_price * item.qty, 0);
  }

  sendProduct(product: ProductSearchResult): void {
    const conv = this.conversation;
    if (!conv?.chat_id) return;

    this.sending = true;
    let caption = `🛍️ *${product.name}*\n💰 ${product.selling_price.toLocaleString('vi-VN')} ₫`;
    if (product.description) caption += `\n\n${product.description}`;

    const payload: any = {
      chat_id: conv.chat_id,
      caption,
      disable_notification: false
    };

    if (product.image_url) {
      payload.photo = product.image_url;
      this.chatService.sendTelegramPhoto(payload).subscribe({
        next: () => this.onSendSuccess(product, caption, 'photo', product.image_url),
        error: () => this.onSendError()
      });
    } else {
      this.chatService.sendTelegramMessage({ chat_id: conv.chat_id, text: caption, disable_notification: false }).subscribe({
        next: () => this.onSendSuccess(product, caption, 'text'),
        error: () => this.onSendError()
      });
    }
  }

  private onSendSuccess(product: ProductSearchResult, content: string, type: string, mediaUrl?: string): void {
    this.sending = false;
    const message: TelegramMessage = {
      id: `product_${Date.now()}`,
      sender: 'agent',
      sender_name: 'Agent',
      content,
      timestamp: new Date().toISOString(),
      message_type: type,
      delivery_status: 'sent',
      media_url: mediaUrl,
      caption: content
    };
    this.messageSent.emit(message);
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
    if (!this.orderItems.length || !this.conversation?.id) return;
    this.creatingOrder = true;

    const lines = this.orderItems.map(item =>
      `• ${item.product.name} × ${item.qty} = ${(item.product.selling_price * item.qty).toLocaleString('vi-VN')} ₫`
    ).join('\n');
    const summary = `📋 Order created:\n${lines}\n💰 Total: ${this.orderTotal.toLocaleString('vi-VN')} ₫`;

    this.chatService.sendTelegramMessage({
      chat_id: this.conversation.chat_id,
      text: summary,
      disable_notification: false
    }).subscribe({
      next: () => {
        const message: TelegramMessage = {
          id: `order_${Date.now()}`,
          sender: 'agent',
          sender_name: 'Agent',
          content: summary,
          timestamp: new Date().toISOString(),
          message_type: 'text',
          delivery_status: 'sent'
        };
        const itemCount = this.orderItems.length;
        this.messageSent.emit(message);
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
