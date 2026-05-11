import {
  Component, Input, Output, EventEmitter, OnDestroy, inject, signal, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChatService } from '../../../services/chat.service';
import { TelegramConversation, CustomerSummary, CustomerOrder } from '../../../models/chat.model';

@Component({
  selector: 'app-customer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonModule, TagModule, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="customer-panel p-4">
      <!-- Linked customer card with tabs -->
      <div *ngIf="linkedCustomer" class="linked-customer-card mb-4">
        <!-- Unlink button -->
        <div class="flex justify-end mb-2">
          <button type="button" class="ghost-action text-xs" (click)="unlink()" [disabled]="linking">
            <i class="pi pi-times mr-1"></i>Unlink
          </button>
        </div>

        <!-- Micro tabs -->
        <div class="flex gap-1 mb-3 border-b border-gray-200">
          <button
            type="button"
            pButton
            [class.active-tab]="activeTab() === 'profile'"
            class="p-button-text p-button-sm text-xs"
            (click)="loadTab('profile')">
            Profile
          </button>
          <button
            type="button"
            pButton
            [class.active-tab]="activeTab() === 'orders'"
            class="p-button-text p-button-sm text-xs"
            (click)="loadTab('orders')">
            Orders
          </button>
          <button
            type="button"
            pButton
            [class.active-tab]="activeTab() === 'history'"
            class="p-button-text p-button-sm text-xs"
            (click)="loadTab('history')">
            Chat history
          </button>
        </div>

        <!-- Tab content: Profile -->
        <div *ngIf="activeTab() === 'profile'" class="tab-content">
          <p class="text-xs text-gray-500 mb-1">Linked customer</p>
          <strong class="block text-sm">{{ linkedCustomer.name }}</strong>
          <span class="text-xs text-gray-500">{{ linkedCustomer.phone }}</span>
          <span *ngIf="linkedCustomer.email" class="block text-xs text-gray-400">{{ linkedCustomer.email }}</span>
          <div class="flex items-center gap-2 mt-2">
            <p-tag [value]="linkedCustomer.customer_type" severity="info"></p-tag>
            <p-tag *ngIf="linkedCustomer.is_active" value="Active" severity="success"></p-tag>
            <p-tag *ngIf="!linkedCustomer.is_active" value="Inactive" severity="secondary"></p-tag>
          </div>
        </div>

        <!-- Tab content: Orders -->
        <div *ngIf="activeTab() === 'orders'" class="tab-content">
          <div *ngIf="ordersLoading()" class="text-center py-4">
            <p-progressSpinner [style]="{width:'24px',height:'24px'}"></p-progressSpinner>
          </div>
          <div *ngIf="!ordersLoading() && orders().length === 0" class="text-xs text-gray-400 py-2">
            No orders
          </div>
          <div *ngIf="!ordersLoading() && orders().length > 0" class="orders-list" style="max-height:250px;overflow-y:auto;">
            <div *ngFor="let order of orders()" class="order-row mb-2 pb-2 border-b border-gray-100 text-xs">
              <div class="font-semibold text-sm">{{ order.order_number }}</div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ order.status }}</span>
                <span class="font-semibold">{{ order.total_amount | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
              <div class="text-gray-400">{{ order.created_at | date:'short' }}</div>
            </div>
          </div>
        </div>

        <!-- Tab content: Chat History -->
        <div *ngIf="activeTab() === 'history'" class="tab-content">
          <div *ngIf="historyLoading()" class="text-center py-4">
            <p-progressSpinner [style]="{width:'24px',height:'24px'}"></p-progressSpinner>
          </div>
          <div *ngIf="!historyLoading() && chatHistory().length === 0" class="text-xs text-gray-400 py-2">
            No history
          </div>
          <div *ngIf="!historyLoading() && chatHistory().length > 0" class="history-list" style="max-height:250px;overflow-y:auto;">
            <div *ngFor="let conv of chatHistory()" class="history-row mb-2 pb-2 border-b border-gray-100 text-xs">
              <div class="flex items-center gap-1">
                <i [class]="'pi pi-' + (conv.platform === 'telegram' ? 'send' : 'envelope')" class="text-gray-400"></i>
                <span class="font-semibold text-xs">{{ conv.platform }}</span>
              </div>
              <div class="text-gray-600 truncate mt-1">{{ conv.last_message }}</div>
              <div class="text-gray-400">{{ conv.last_message_time | date:'short' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search box -->
      <div class="mb-3">
        <p class="text-xs text-gray-500 mb-2">{{ linkedCustomer ? 'Re-link to another customer' : 'Link to retail customer' }}</p>
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            class="form-input pl-8 w-full text-sm"
            [(ngModel)]="searchKeyword"
            (ngModelChange)="onSearch($event)"
            placeholder="Search name, phone, or email..."
          />
        </div>
      </div>

      <!-- Search results dropdown -->
      <div *ngIf="searching" class="py-3 text-center">
        <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
        <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
      </div>

      <div *ngIf="!searching && searchResults.length > 0" class="customer-search-results">
        <button
          *ngFor="let customer of searchResults"
          type="button"
          class="customer-result-row"
          [disabled]="linking"
          (click)="selectCustomer(customer)">
          <div class="flex-1 min-w-0">
            <strong class="block text-sm truncate">{{ customer.name }}</strong>
            <span class="text-xs text-gray-500">{{ customer.phone }}</span>
          </div>
          <p-tag [value]="customer.customer_type" severity="info"></p-tag>
        </button>
      </div>

      <div *ngIf="!searching && searchKeyword.trim() && searchResults.length === 0" class="text-center py-4 text-sm text-gray-400">
        <i class="pi pi-user-minus block mb-1"></i>
        No customers found
      </div>

      <!-- Link status feedback -->
      <div *ngIf="linkError" class="mt-3 text-xs text-red-500">
        <i class="pi pi-exclamation-circle mr-1"></i>{{ linkError }}
      </div>
    </div>
  `,
  styles: [`
    .linked-customer-card {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px;
    }
    .active-tab {
      border-bottom: 2px solid #3b82f6 !important;
      color: #3b82f6 !important;
    }
    .tab-content {
      padding-top: 8px;
    }
    .order-row:last-child, .history-row:last-child {
      border-bottom: none;
    }
    .customer-search-results {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .customer-result-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      text-align: left;
      background: white;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.15s;
    }
    .customer-result-row:last-child { border-bottom: none; }
    .customer-result-row:hover:not(:disabled) { background: #f9fafb; }
    .customer-result-row:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class CustomerPanelComponent implements OnDestroy {
  private chatService = inject(ChatService);

  @Input() set conversation(value: TelegramConversation | null) {
    this._conversation = value;
    this.loadLinkedCustomer();
  }
  get conversation(): TelegramConversation | null { return this._conversation; }
  private _conversation: TelegramConversation | null = null;

  @Output() customerLinked = new EventEmitter<string | null>();

  searchKeyword = '';
  searchResults: CustomerSummary[] = [];
  linkedCustomer: CustomerSummary | null = null;
  searching = false;
  linking = false;
  linkError = '';

  // Tab-related signals
  activeTab = signal<'profile' | 'orders' | 'history'>('profile');
  orders = signal<CustomerOrder[]>([]);
  chatHistory = signal<any[]>([]);
  ordersLoaded = signal(false);
  historyLoaded = signal(false);
  ordersLoading = signal(false);
  historyLoading = signal(false);

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
          return this.chatService.searchRetailCustomers(keyword, 8).pipe(
            catchError(() => of(null))
          );
        })
      ).subscribe(res => {
        this.searching = false;
        this.searchResults = res?.data || [];
      })
    );

    // Reset tab state when linked customer changes
    effect(() => {
      if (this.linkedCustomer) {
        this.activeTab.set('profile');
        this.ordersLoaded.set(false);
        this.historyLoaded.set(false);
        this.orders.set([]);
        this.chatHistory.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadTab(tab: 'profile' | 'orders' | 'history'): void {
    this.activeTab.set(tab);

    if (tab === 'orders' && !this.ordersLoaded() && this.linkedCustomer) {
      this.ordersLoading.set(true);
      this.chatService.getCustomerOrders(this.linkedCustomer.id).subscribe({
        next: res => {
          this.orders.set((res.data as CustomerOrder[]) || []);
          this.ordersLoaded.set(true);
          this.ordersLoading.set(false);
        },
        error: () => {
          this.ordersLoading.set(false);
        }
      });
    }

    if (tab === 'history' && !this.historyLoaded() && this.linkedCustomer) {
      this.historyLoading.set(true);
      this.chatService.getCustomerChatHistory(this.linkedCustomer.id).subscribe({
        next: res => {
          this.chatHistory.set((res.data as any[]) || []);
          this.historyLoaded.set(true);
          this.historyLoading.set(false);
        },
        error: () => {
          this.historyLoading.set(false);
        }
      });
    }
  }

  onSearch(keyword: string): void {
    this.searchSubject.next(keyword);
  }

  selectCustomer(customer: CustomerSummary): void {
    if (!this._conversation?.id) return;
    this.linking = true;
    this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, customer.id).subscribe({
      next: () => {
        this.linkedCustomer = customer;
        this.searchKeyword = '';
        this.searchResults = [];
        this.linking = false;
        this.customerLinked.emit(customer.id);
      },
      error: () => {
        this.linking = false;
        this.linkError = 'Failed to link customer. Please try again.';
      }
    });
  }

  unlink(): void {
    if (!this._conversation?.id) return;
    this.linking = true;
    this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, null).subscribe({
      next: () => {
        this.linkedCustomer = null;
        this.linking = false;
        this.customerLinked.emit(null);
      },
      error: () => {
        this.linking = false;
        this.linkError = 'Failed to unlink. Please try again.';
      }
    });
  }

  private loadLinkedCustomer(): void {
    const customerId = (this._conversation as any)?.customer_id;
    if (!customerId) {
      this.linkedCustomer = null;
      return;
    }
    this.chatService.getRetailCustomer(customerId).pipe(catchError(() => of(null))).subscribe(res => {
      this.linkedCustomer = res?.data ?? null;
    });
  }
}
