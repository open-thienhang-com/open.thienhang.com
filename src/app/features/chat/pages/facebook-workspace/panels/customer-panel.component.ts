import {
  Component, Input, Output, EventEmitter, OnDestroy, inject, signal, computed
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
import {
  TelegramConversation, CustomerSummary, CustomerOrder,
  CustomerCreatePayload, OrderItem, OrderCreatePayload, SendEmailPayload, ProductSearchResult
} from '../../../models/chat.model';

@Component({
  selector: 'app-customer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonModule, TagModule, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="customer-panel p-4">

      <!-- ── Linked customer card ──────────────────────────────────────── -->
      <div *ngIf="linkedCustomer" class="linked-customer-card mb-4">
        <div class="flex justify-end mb-2">
          <button type="button" class="ghost-action text-xs" (click)="unlink()" [disabled]="linking">
            <i class="pi pi-times mr-1"></i>Unlink
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 mb-3 border-b border-gray-200">
          <button type="button" pButton [class.active-tab]="activeTab() === 'profile'" class="p-button-text p-button-sm text-xs" (click)="loadTab('profile')">Profile</button>
          <button type="button" pButton [class.active-tab]="activeTab() === 'orders'" class="p-button-text p-button-sm text-xs" (click)="loadTab('orders')">Orders</button>
          <button type="button" pButton [class.active-tab]="activeTab() === 'history'" class="p-button-text p-button-sm text-xs" (click)="loadTab('history')">History</button>
        </div>

        <!-- Profile tab -->
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
          <!-- Send email button -->
          <button *ngIf="linkedCustomer.email && !showEmailForm()" type="button"
                  class="email-btn mt-3" (click)="showEmailForm.set(true)">
            <i class="pi pi-envelope mr-1"></i>Send email
          </button>
          <!-- Email compose form -->
          <div *ngIf="showEmailForm()" class="email-form mt-3">
            <p class="text-xs font-semibold mb-2">Send email to {{ linkedCustomer.email }}</p>
            <input type="text" class="form-input mb-2" [(ngModel)]="emailSubject" placeholder="Subject *" />
            <textarea class="form-input mb-2" rows="4" [(ngModel)]="emailContent" placeholder="Message body *"></textarea>
            <div class="flex gap-2">
              <button type="button" class="ghost-action text-xs" (click)="cancelEmail()">Cancel</button>
              <button type="button" class="email-btn text-xs" (click)="sendEmail()"
                      [disabled]="sendingEmail() || !emailSubject.trim() || !emailContent.trim()">
                <i [class]="sendingEmail() ? 'pi pi-spin pi-spinner' : 'pi pi-send'" class="mr-1"></i>
                {{ sendingEmail() ? 'Sending...' : 'Send' }}
              </button>
            </div>
            <div *ngIf="emailError" class="text-xs text-red-500 mt-1">{{ emailError }}</div>
          </div>
        </div>

        <!-- Orders tab -->
        <div *ngIf="activeTab() === 'orders'" class="tab-content">
          <div *ngIf="ordersLoading()" class="text-center py-4">
            <p-progressSpinner [style]="{width:'24px',height:'24px'}"></p-progressSpinner>
          </div>
          <div *ngIf="!ordersLoading() && orders().length === 0 && !showOrderForm()" class="text-xs text-gray-400 py-2">No orders</div>
          <div *ngIf="!ordersLoading() && orders().length > 0" class="orders-list" style="max-height:200px;overflow-y:auto;">
            <div *ngFor="let order of orders()" class="order-row mb-2 pb-2 border-b border-gray-100 text-xs">
              <div class="font-semibold text-sm">{{ order.order_number }}</div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">{{ order.status }}</span>
                <span class="font-semibold">{{ order.total_amount | currency:'VND':'symbol':'1.0-0' }}</span>
              </div>
              <div class="text-gray-400">{{ order.created_at | date:'short' }}</div>
            </div>
          </div>

          <!-- Create order -->
          <button *ngIf="!showOrderForm()" type="button" class="email-btn mt-2" (click)="showOrderForm.set(true)">
            <i class="pi pi-plus mr-1"></i>Tạo đơn hàng
          </button>
          <div *ngIf="showOrderForm()" class="order-form mt-3">
            <p class="text-xs font-semibold mb-2">Tạo đơn hàng mới</p>
            <!-- Product search -->
            <input type="text" class="form-input mb-2" [(ngModel)]="productSearch"
                   (ngModelChange)="onProductSearch($event)" placeholder="Tìm sản phẩm..." />
            <div *ngIf="productResults().length > 0" class="product-results mb-2">
              <button *ngFor="let p of productResults()" type="button" class="product-result-row"
                      (click)="addOrderItem(p)">
                <span class="flex-1 text-xs truncate">{{ p.name }}</span>
                <span class="text-xs text-blue-600 ml-2">{{ p.selling_price | currency:'VND':'symbol':'1.0-0' }}</span>
              </button>
            </div>
            <!-- Order items -->
            <div *ngIf="orderItems().length > 0" class="order-items mb-2">
              <div *ngFor="let item of orderItems(); let i = index" class="order-item-row">
                <span class="flex-1 text-xs truncate">{{ item.product_name }}</span>
                <input type="number" class="qty-input" [(ngModel)]="item.quantity" min="1"
                       (ngModelChange)="recalcItem(i)" />
                <span class="text-xs font-semibold ml-2">{{ item.total_price | currency:'VND':'symbol':'1.0-0' }}</span>
                <button type="button" class="remove-btn ml-1" (click)="removeOrderItem(i)"><i class="pi pi-times"></i></button>
              </div>
              <div class="text-xs font-bold text-right mt-1 border-t pt-1">
                Total: {{ orderTotal() | currency:'VND':'symbol':'1.0-0' }}
              </div>
            </div>
            <div class="flex gap-2 mt-2">
              <button type="button" class="ghost-action text-xs" (click)="cancelOrder()">Cancel</button>
              <button type="button" class="email-btn text-xs" (click)="createOrder()"
                      [disabled]="creatingOrder() || orderItems().length === 0">
                <i [class]="creatingOrder() ? 'pi pi-spin pi-spinner' : 'pi pi-check'" class="mr-1"></i>
                {{ creatingOrder() ? 'Đang tạo...' : 'Tạo đơn' }}
              </button>
            </div>
            <div *ngIf="orderError" class="text-xs text-red-500 mt-1">{{ orderError }}</div>
          </div>
        </div>

        <!-- History tab -->
        <div *ngIf="activeTab() === 'history'" class="tab-content">
          <div *ngIf="historyLoading()" class="text-center py-4">
            <p-progressSpinner [style]="{width:'24px',height:'24px'}"></p-progressSpinner>
          </div>
          <div *ngIf="!historyLoading() && chatHistory().length === 0" class="text-xs text-gray-400 py-2">No history</div>
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

      <!-- ── Search + link ──────────────────────────────────────────────── -->
      <div class="mb-3">
        <p class="text-xs text-gray-500 mb-2">{{ linkedCustomer ? 'Re-link to another customer' : 'Link to retail customer' }}</p>
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" class="form-input pl-8 w-full text-sm"
                 [(ngModel)]="searchKeyword" (ngModelChange)="onSearch($event)"
                 placeholder="Search name, phone, or email..." />
        </div>
      </div>

      <div *ngIf="searching" class="py-3 text-center">
        <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
        <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
      </div>

      <div *ngIf="!searching && searchResults.length > 0" class="customer-search-results">
        <button *ngFor="let customer of searchResults" type="button" class="customer-result-row"
                [disabled]="linking" (click)="selectCustomer(customer)">
          <div class="flex-1 min-w-0">
            <strong class="block text-sm truncate">{{ customer.name }}</strong>
            <span class="text-xs text-gray-500">{{ customer.phone }}</span>
          </div>
          <p-tag [value]="customer.customer_type" severity="info"></p-tag>
        </button>
      </div>

      <!-- Create new customer when no results -->
      <div *ngIf="!searching && searchKeyword.trim() && searchResults.length === 0" class="text-center py-3">
        <i class="pi pi-user-minus block mb-1 text-gray-400"></i>
        <p class="text-sm text-gray-400 mb-2">No customers found</p>
        <button *ngIf="!showCreateForm()" type="button" class="email-btn" (click)="showCreateForm.set(true)">
          <i class="pi pi-user-plus mr-1"></i>Tạo khách hàng mới
        </button>
      </div>

      <!-- Create customer form -->
      <div *ngIf="showCreateForm()" class="create-customer-form mt-3">
        <p class="text-xs font-semibold mb-2">Tạo khách hàng mới</p>
        <input type="text" class="form-input mb-2" [(ngModel)]="newCustomer.name" placeholder="Tên *" />
        <input type="text" class="form-input mb-2" [(ngModel)]="newCustomer.phone" placeholder="Số điện thoại" />
        <input type="email" class="form-input mb-2" [(ngModel)]="newCustomer.email" placeholder="Email" />
        <input type="text" class="form-input mb-2" [(ngModel)]="newCustomer.address" placeholder="Địa chỉ" />
        <div class="flex gap-2">
          <button type="button" class="ghost-action text-xs" (click)="cancelCreate()">Cancel</button>
          <button type="button" class="email-btn text-xs" (click)="createCustomer()"
                  [disabled]="creatingCustomer() || !newCustomer.name.trim()">
            <i [class]="creatingCustomer() ? 'pi pi-spin pi-spinner' : 'pi pi-check'" class="mr-1"></i>
            {{ creatingCustomer() ? 'Đang tạo...' : 'Tạo & liên kết' }}
          </button>
        </div>
        <div *ngIf="createError" class="text-xs text-red-500 mt-1">{{ createError }}</div>
      </div>

      <!-- Link status feedback -->
      <div *ngIf="linkError" class="mt-3 text-xs text-red-500">
        <i class="pi pi-exclamation-circle mr-1"></i>{{ linkError }}
      </div>
    </div>
  `,
  styles: [`
    .linked-customer-card { background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px; }
    .active-tab { border-bottom:2px solid #3b82f6 !important; color:#3b82f6 !important; }
    .tab-content { padding-top:8px; }
    .order-row:last-child, .history-row:last-child { border-bottom:none; }
    .customer-search-results { border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
    .customer-result-row { display:flex; align-items:center; gap:8px; width:100%; padding:10px 12px; text-align:left; background:white; border-bottom:1px solid #f3f4f6; cursor:pointer; transition:background .15s; }
    .customer-result-row:last-child { border-bottom:none; }
    .customer-result-row:hover:not(:disabled) { background:#f9fafb; }
    .customer-result-row:disabled { opacity:.6; cursor:not-allowed; }
    .email-btn { display:inline-flex; align-items:center; padding:5px 12px; border-radius:6px; background:#3b82f6; color:white; font-size:.75rem; cursor:pointer; border:none; transition:background .15s; }
    .email-btn:hover:not(:disabled) { background:#2563eb; }
    .email-btn:disabled { opacity:.6; cursor:not-allowed; }
    .ghost-action { display:inline-flex; align-items:center; padding:5px 10px; border-radius:6px; background:transparent; color:#6b7280; font-size:.75rem; cursor:pointer; border:1px solid #e5e7eb; transition:background .15s; }
    .ghost-action:hover:not(:disabled) { background:#f9fafb; }
    .email-form, .order-form, .create-customer-form { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
    .form-input { width:100%; padding:6px 10px; border:1px solid #d1d5db; border-radius:6px; font-size:.8rem; outline:none; }
    .form-input:focus { border-color:#3b82f6; }
    .product-results { border:1px solid #e5e7eb; border-radius:6px; max-height:150px; overflow-y:auto; }
    .product-result-row { display:flex; align-items:center; width:100%; padding:6px 10px; background:white; border-bottom:1px solid #f3f4f6; cursor:pointer; font-size:.75rem; }
    .product-result-row:last-child { border-bottom:none; }
    .product-result-row:hover { background:#f9fafb; }
    .order-item-row { display:flex; align-items:center; gap:4px; padding:4px 0; border-bottom:1px solid #f3f4f6; }
    .qty-input { width:48px; padding:2px 6px; border:1px solid #d1d5db; border-radius:4px; font-size:.75rem; text-align:center; }
    .remove-btn { background:none; border:none; cursor:pointer; color:#ef4444; font-size:.7rem; padding:2px; }
    .pl-8 { padding-left:2.5rem; }
    .relative { position:relative; }
    .absolute { position:absolute; }
    .left-3 { left:.75rem; }
    .top-1\\/2 { top:50%; }
    .-translate-y-1\\/2 { transform:translateY(-50%); }
  `]
})
export class CustomerPanelComponent implements OnDestroy {
  private chatService = inject(ChatService);

  @Input() set conversation(value: TelegramConversation | null) {
    this._conversation = value;
    this.loadLinkedCustomer();
    this._resetAllForms();
  }
  get conversation(): TelegramConversation | null { return this._conversation; }
  private _conversation: TelegramConversation | null = null;

  @Output() customerLinked = new EventEmitter<CustomerSummary | null>();

  // ── Search / link ────────────────────────────────────────────────────────────
  searchKeyword = '';
  searchResults: CustomerSummary[] = [];
  linkedCustomer: CustomerSummary | null = null;
  searching = false;
  linking = false;
  linkError = '';

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  activeTab = signal<'profile' | 'orders' | 'history'>('profile');
  orders = signal<CustomerOrder[]>([]);
  chatHistory = signal<any[]>([]);
  ordersLoaded = signal(false);
  historyLoaded = signal(false);
  ordersLoading = signal(false);
  historyLoading = signal(false);

  // ── Email compose ─────────────────────────────────────────────────────────────
  showEmailForm = signal(false);
  sendingEmail = signal(false);
  emailSubject = '';
  emailContent = '';
  emailError = '';

  // ── Create customer ───────────────────────────────────────────────────────────
  showCreateForm = signal(false);
  creatingCustomer = signal(false);
  createError = '';
  newCustomer: CustomerCreatePayload = { name: '', phone: '', email: '', address: '' };

  // ── Create order ──────────────────────────────────────────────────────────────
  showOrderForm = signal(false);
  creatingOrder = signal(false);
  orderError = '';
  productSearch = '';
  productResults = signal<ProductSearchResult[]>([]);
  orderItems = signal<OrderItem[]>([]);
  readonly orderTotal = computed(() => this.orderItems().reduce((s, i) => s + i.total_price, 0));

  private searchSubject = new Subject<string>();
  private productSearchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor() {
    // Customer search debounce
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword.trim()) { this.searchResults = []; this.searching = false; return of(null); }
          this.searching = true;
          return this.chatService.searchRetailCustomers(keyword, 8).pipe(catchError(() => of(null)));
        })
      ).subscribe(res => { this.searching = false; this.searchResults = res?.data || []; })
    );

    // Product search debounce
    this.subs.add(
      this.productSearchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword.trim()) { this.productResults.set([]); return of(null); }
          return this.chatService.searchProductsForChat(keyword, 8).pipe(catchError(() => of(null)));
        })
      ).subscribe(res => { this.productResults.set(res?.data || []); })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  loadTab(tab: 'profile' | 'orders' | 'history'): void {
    this.activeTab.set(tab);

    if (tab === 'orders' && !this.ordersLoaded() && this.linkedCustomer) {
      this.ordersLoading.set(true);
      this.chatService.getCustomerOrders(this.linkedCustomer.id).subscribe({
        next: res => { this.orders.set((res.data as CustomerOrder[]) || []); this.ordersLoaded.set(true); this.ordersLoading.set(false); },
        error: () => this.ordersLoading.set(false)
      });
    }

    if (tab === 'history' && !this.historyLoaded() && this.linkedCustomer) {
      this.historyLoading.set(true);
      this.chatService.getCustomerChatHistory(this.linkedCustomer.id).subscribe({
        next: res => { this.chatHistory.set((res.data as any[]) || []); this.historyLoaded.set(true); this.historyLoading.set(false); },
        error: () => this.historyLoading.set(false)
      });
    }
  }

  // ── Customer search ───────────────────────────────────────────────────────────
  onSearch(keyword: string): void { this.searchSubject.next(keyword); }

  selectCustomer(customer: CustomerSummary): void {
    if (!this._conversation?.id) return;
    this.linking = true; this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, customer.id).subscribe({
      next: () => {
        this.linkedCustomer = customer;
        this.searchKeyword = ''; this.searchResults = [];
        this.linking = false;
        this.customerLinked.emit(customer);
        this._resetTabState();
      },
      error: () => { this.linking = false; this.linkError = 'Failed to link customer. Please try again.'; }
    });
  }

  unlink(): void {
    if (!this._conversation?.id) return;
    this.linking = true; this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, null).subscribe({
      next: () => { this.linkedCustomer = null; this.linking = false; this.customerLinked.emit(null); },
      error: () => { this.linking = false; this.linkError = 'Failed to unlink. Please try again.'; }
    });
  }

  // ── Email ─────────────────────────────────────────────────────────────────────
  cancelEmail(): void { this.showEmailForm.set(false); this.emailSubject = ''; this.emailContent = ''; this.emailError = ''; }

  sendEmail(): void {
    if (!this.linkedCustomer?.email || !this.emailSubject.trim() || !this.emailContent.trim()) return;
    this.sendingEmail.set(true); this.emailError = '';
    const payload: SendEmailPayload = {
      to_email: this.linkedCustomer.email,
      to_name: this.linkedCustomer.name,
      subject: this.emailSubject.trim(),
      content: this.emailContent.trim()
    };
    this.chatService.sendEmailToCustomer(payload).subscribe({
      next: () => { this.sendingEmail.set(false); this.cancelEmail(); },
      error: () => { this.sendingEmail.set(false); this.emailError = 'Failed to send email. Please try again.'; }
    });
  }

  // ── Create customer ───────────────────────────────────────────────────────────
  cancelCreate(): void { this.showCreateForm.set(false); this.createError = ''; this.newCustomer = { name: '', phone: '', email: '', address: '' }; }

  createCustomer(): void {
    if (!this.newCustomer.name.trim() || !this._conversation?.id) return;
    this.creatingCustomer.set(true); this.createError = '';
    this.chatService.createRetailCustomer({ ...this.newCustomer, name: this.newCustomer.name.trim() }).subscribe({
      next: (res) => {
        const created = res.data;
        this.chatService.linkConversationToCustomer(this._conversation!.id!, created.id).subscribe({
          next: () => {
            this.linkedCustomer = created;
            this.creatingCustomer.set(false);
            this.cancelCreate();
            this.searchKeyword = ''; this.searchResults = [];
            this.customerLinked.emit(created);
            this._resetTabState();
          },
          error: () => { this.creatingCustomer.set(false); this.createError = 'Customer created but could not link. Try searching.'; }
        });
      },
      error: () => { this.creatingCustomer.set(false); this.createError = 'Failed to create customer. Please try again.'; }
    });
  }

  // ── Create order ──────────────────────────────────────────────────────────────
  onProductSearch(keyword: string): void { this.productSearchSubject.next(keyword); }

  addOrderItem(product: ProductSearchResult): void {
    const existing = this.orderItems().find(i => i.product_id === product.id);
    if (existing) {
      this.orderItems.update(items => items.map(i =>
        i.product_id === product.id ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price } : i
      ));
    } else {
      this.orderItems.update(items => [...items, {
        product_id: product.id, sku: product.sku, product_name: product.name,
        quantity: 1, unit_price: product.selling_price, total_price: product.selling_price
      }]);
    }
    this.productSearch = ''; this.productResults.set([]);
  }

  recalcItem(index: number): void {
    this.orderItems.update(items => items.map((item, i) =>
      i === index ? { ...item, total_price: item.quantity * item.unit_price } : item
    ));
  }

  removeOrderItem(index: number): void {
    this.orderItems.update(items => items.filter((_, i) => i !== index));
  }

  cancelOrder(): void {
    this.showOrderForm.set(false); this.orderError = '';
    this.orderItems.set([]); this.productSearch = ''; this.productResults.set([]);
  }

  createOrder(): void {
    if (!this.linkedCustomer?.id || this.orderItems().length === 0) return;
    this.creatingOrder.set(true); this.orderError = '';
    const payload: OrderCreatePayload = {
      customer_id: this.linkedCustomer.id,
      items: this.orderItems(),
      total_amount: this.orderTotal(),
      net_amount: this.orderTotal(),
      source: 'chat'
    };
    this.chatService.createOrder(payload).subscribe({
      next: (res) => {
        this.creatingOrder.set(false);
        this.cancelOrder();
        // Refresh orders tab
        this.ordersLoaded.set(false);
        this.loadTab('orders');
      },
      error: () => { this.creatingOrder.set(false); this.orderError = 'Failed to create order. Please try again.'; }
    });
  }

  // ── Private ───────────────────────────────────────────────────────────────────
  private loadLinkedCustomer(): void {
    const customerId = this._conversation?.customer_id;
    if (!customerId) { this.linkedCustomer = null; return; }
    this.chatService.getRetailCustomer(customerId).pipe(catchError(() => of(null))).subscribe(res => {
      this.linkedCustomer = res?.data ?? null;
    });
  }

  private _resetTabState(): void {
    this.activeTab.set('profile');
    this.ordersLoaded.set(false); this.historyLoaded.set(false);
    this.orders.set([]); this.chatHistory.set([]);
  }

  private _resetAllForms(): void {
    this.showEmailForm.set(false); this.emailSubject = ''; this.emailContent = ''; this.emailError = '';
    this.showCreateForm.set(false); this.createError = ''; this.newCustomer = { name: '', phone: '', email: '', address: '' };
    this.showOrderForm.set(false); this.orderError = ''; this.orderItems.set([]); this.productSearch = ''; this.productResults.set([]);
    this.linkError = '';
    this._resetTabState();
  }
}
