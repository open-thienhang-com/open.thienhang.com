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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChatService } from '../../../services/chat.service';
import {
  TelegramConversation, CustomerSummary, CustomerOrder, TelegramMessage,
  CustomerCreatePayload, OrderItem, OrderCreatePayload, SendEmailPayload, ProductSearchResult,
  OrderConfirmationResult,
} from '../../../models/chat.model';
import { OrderConfirmationDialogComponent } from './order-confirmation-dialog.component';
import { CreateOrderDialogComponent } from './create-order-dialog.component';

@Component({
  selector: 'app-customer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonModule, TagModule, ProgressSpinnerModule, OrderConfirmationDialogComponent, CreateOrderDialogComponent],
  styles: [`
    :host { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; }

    /* ── shared ── */
    .cp { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; font-size:.8rem; }
    .cp-scroll { flex:1; min-height:0; overflow-y:auto; padding:.6rem .75rem; }
    .cp-btn {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.3rem .7rem; border-radius:6px; font:inherit; font-size:.72rem; font-weight:600;
      border:none; cursor:pointer; transition:background .12s;
    }
    .cp-btn--primary { background:#2563eb; color:#fff; }
    .cp-btn--primary:hover:not(:disabled) { background:#1d4ed8; }
    .cp-btn--ghost { background:none; border:1px solid #e2e8f0; color:#64748b; }
    .cp-btn--ghost:hover:not(:disabled) { background:#f1f5f9; }
    .cp-btn--danger { background:none; border:none; color:#ef4444; padding:.2rem .4rem; font-size:.68rem; }
    .cp-btn:disabled { opacity:.55; cursor:not-allowed; }

    .cp-input {
      width:100%; padding:.35rem .6rem; border:1px solid #e2e8f0; border-radius:6px;
      font:inherit; font-size:.78rem; outline:none; box-sizing:border-box;
      transition:border .12s;
    }
    .cp-input:focus { border-color:#2563eb; }
    .cp-input--search { padding-left:2rem; }

    .cp-search-wrap { position:relative; }
    .cp-search-icon { position:absolute; left:.55rem; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:.75rem; }

    /* ── linked customer card (sticky so the agent always sees who they're acting on) ── */
    .cp-card {
      background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;
      padding:.6rem .75rem; margin-bottom:.6rem; flex-shrink:0;
      position:sticky; top:0; z-index:2;
    }
    .cp-card-head { display:flex; align-items:center; gap:.55rem; }
    .cp-avatar {
      width:2rem; height:2rem; border-radius:50%; background:#2563eb; color:#fff;
      display:flex; align-items:center; justify-content:center;
      font-size:.8rem; font-weight:700; flex-shrink:0;
    }
    .cp-card-info { flex:1; min-width:0; }
    .cp-card-name { font-size:.82rem; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-card-phone { font-size:.72rem; color:#64748b; }
    .cp-card-tags { display:flex; gap:.3rem; flex-wrap:wrap; margin-top:.35rem; }
    .cp-unlink { font:inherit; font-size:.65rem; color:#94a3b8; background:none; border:none; cursor:pointer; padding:0; }
    .cp-unlink:hover { color:#ef4444; }

    /* ── tabs (sticky under the customer card so they always remain reachable) ── */
    .cp-tabs {
      display:flex; gap:.2rem; padding:.4rem .75rem 0;
      border-bottom:1px solid #e2e8f0; flex-shrink:0;
      background:#fff; position:sticky; top:0; z-index:1;
    }
    .cp-tab {
      font:inherit; font-size:.72rem; font-weight:600; background:none; border:none;
      padding:.3rem .55rem; cursor:pointer; color:#64748b; border-bottom:2px solid transparent;
      margin-bottom:-1px; transition:color .12s, border-color .12s;
    }
    .cp-tab.active { color:#2563eb; border-bottom-color:#2563eb; }

    /* ── tab content ── */
    .cp-tab-body { flex:1; min-height:0; overflow-y:auto; padding:.6rem .75rem; }
    .cp-info-row { display:flex; justify-content:space-between; gap:.5rem; padding:.25rem 0; border-bottom:1px solid #f1f5f9; font-size:.75rem; }
    .cp-info-label { color:#94a3b8; flex-shrink:0; }
    .cp-info-val { color:#0f172a; font-weight:600; text-align:right; }

    .cp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.35rem; padding:1.5rem .5rem; color:#94a3b8; }
    .cp-empty i { font-size:1.25rem; }
    .cp-empty p { margin:0; font-size:.75rem; }

    /* ── order rows ── */
    .cp-order-row { padding:.5rem 0; border-bottom:1px solid #f1f5f9; font-size:.75rem; }
    .cp-order-row:last-child { border-bottom:none; }
    .cp-order-row-head { display:flex; justify-content:space-between; align-items:center; gap:.4rem; }
    .cp-order-num { font-weight:700; color:#0f172a; }
    .cp-order-meta { display:flex; justify-content:space-between; color:#64748b; margin-top:.15rem; }
    .cp-order-amount { font-weight:700; color:#0f172a; }
    .cp-order-foot { display:flex; justify-content:space-between; align-items:center; gap:.4rem; margin-top:.35rem; }
    .cp-order-confirmed {
      display:inline-flex; align-items:center; gap:.25rem;
      font-size:.66rem; font-weight:600; color:#16a34a;
      background:#dcfce7; padding:.1rem .35rem; border-radius:999px;
    }
    .cp-order-confirmed i { font-size:.66rem; }
    .cp-btn--sm { padding:.2rem .5rem; font-size:.66rem; }

    /* ── history rows ── */
    .cp-hist-row { padding:.4rem 0; border-bottom:1px solid #f1f5f9; font-size:.75rem; }
    .cp-hist-row:last-child { border-bottom:none; }
    .cp-hist-preview { color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:.1rem; }
    .cp-hist-time { color:#94a3b8; font-size:.68rem; }

    /* ── email compose ── */
    .cp-compose { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:.6rem; margin-top:.5rem; display:flex; flex-direction:column; gap:.4rem; }
    .cp-compose-row { display:flex; gap:.4rem; justify-content:flex-end; }

    /* ── unlinked search state ── */
    .cp-section-title { font-size:.68rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; padding:.5rem .75rem .3rem; flex-shrink:0; }

    .cp-results { flex-shrink:0; margin:.4rem .75rem 0; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
    .cp-result-row {
      display:flex; align-items:center; gap:.5rem;
      padding:.5rem .65rem; background:#fff; border-bottom:1px solid #f8fafc;
      cursor:pointer; transition:background .12s; font-size:.75rem; width:100%; text-align:left; border:none;
    }
    .cp-result-row:last-child { border-bottom:none; }
    .cp-result-row:hover:not(:disabled) { background:#f8fafc; }
    .cp-result-row:disabled { opacity:.6; cursor:not-allowed; }
    .cp-result-av {
      width:1.6rem; height:1.6rem; border-radius:50%; background:#64748b; color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:.65rem; font-weight:700; flex-shrink:0;
    }
    .cp-result-name { font-weight:600; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-result-phone { color:#94a3b8; font-size:.68rem; }
    .cp-result-link { margin-left:auto; flex-shrink:0; font-size:.65rem; font-weight:700; color:#2563eb; }

    /* ── create form ── */
    .cp-create-form { margin:.5rem .75rem 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:.6rem; display:flex; flex-direction:column; gap:.4rem; }
    .cp-create-title { font-size:.72rem; font-weight:700; color:#0f172a; }
    .cp-create-actions { display:flex; gap:.4rem; }

    .cp-footer { padding:.5rem .75rem; border-top:1px solid #f1f5f9; flex-shrink:0; }
    .cp-error { font-size:.7rem; color:#ef4444; padding:.3rem .75rem; }
  `],
  template: `
<div class="cp">

  <!-- ══ LINKED: customer card + tabs ══════════════════════════════════════ -->
  <ng-container *ngIf="linkedCustomer">

    <!-- Card header -->
    <div class="cp-scroll" style="flex:0;padding-bottom:0">
      <div class="cp-card">
        <div class="cp-card-head">
          <div class="cp-avatar">{{ (linkedCustomer.name || '?').charAt(0).toUpperCase() }}</div>
          <div class="cp-card-info">
            <div class="cp-card-name">{{ linkedCustomer.name }}</div>
            <div class="cp-card-phone">{{ linkedCustomer.phone || '—' }}</div>
          </div>
          <button type="button" class="cp-unlink" (click)="unlink()" [disabled]="linking" title="Hủy liên kết">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="cp-card-tags">
          <p-tag [value]="linkedCustomer.customer_type || 'customer'" severity="info"></p-tag>
          <p-tag [value]="linkedCustomer.is_active ? 'Active' : 'Inactive'"
                 [severity]="linkedCustomer.is_active ? 'success' : 'secondary'"></p-tag>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="cp-tabs">
      <button type="button" class="cp-tab" [class.active]="activeTab() === 'profile'" (click)="loadTab('profile')">Profile</button>
      <button type="button" class="cp-tab" [class.active]="activeTab() === 'orders'" (click)="loadTab('orders')">Đơn hàng</button>
      <button type="button" class="cp-tab" [class.active]="activeTab() === 'history'" (click)="loadTab('history')">Lịch sử</button>
      <button type="button" class="cp-tab" [class.active]="activeTab() === 'relink'" (click)="activeTab.set('relink')">Đổi link</button>
    </div>

    <!-- Tab body -->
    <div class="cp-tab-body">

      <!-- Profile -->
      <ng-container *ngIf="activeTab() === 'profile'">
        <div *ngIf="linkedCustomer.email" class="cp-info-row"><span class="cp-info-label">Email</span><span class="cp-info-val">{{ linkedCustomer.email }}</span></div>
        <div class="cp-info-row"><span class="cp-info-label">Loại</span><span class="cp-info-val">{{ linkedCustomer.customer_type }}</span></div>

        <!-- Send email -->
        <div style="margin-top:.6rem">
          <button *ngIf="linkedCustomer.email && !showEmailForm()" type="button" class="cp-btn cp-btn--ghost" (click)="showEmailForm.set(true)">
            <i class="pi pi-envelope"></i> Gửi email
          </button>
          <div *ngIf="showEmailForm()" class="cp-compose">
            <span style="font-size:.72rem;font-weight:700;color:#0f172a">Gửi email tới {{ linkedCustomer.email }}</span>
            <input type="text" class="cp-input" [(ngModel)]="emailSubject" placeholder="Tiêu đề *" />
            <textarea class="cp-input" rows="3" [(ngModel)]="emailContent" placeholder="Nội dung *" style="resize:none"></textarea>
            <div class="cp-compose-row">
              <button type="button" class="cp-btn cp-btn--ghost" (click)="cancelEmail()">Hủy</button>
              <button type="button" class="cp-btn cp-btn--primary" (click)="sendEmail()"
                      [disabled]="sendingEmail() || !emailSubject.trim() || !emailContent.trim()">
                <i [class]="sendingEmail() ? 'pi pi-spin pi-spinner' : 'pi pi-send'"></i>
                {{ sendingEmail() ? 'Đang gửi...' : 'Gửi' }}
              </button>
            </div>
            <span *ngIf="emailError" style="font-size:.7rem;color:#ef4444">{{ emailError }}</span>
          </div>
        </div>
      </ng-container>

      <!-- Orders -->
      <ng-container *ngIf="activeTab() === 'orders'">
        <button type="button" (click)="showCreateOrder.set(true)"
                style="width:100%;margin-bottom:.6rem;padding:.5rem;border:none;border-radius:6px;background:#2563eb;color:#fff;font-weight:600;font-size:.85rem;cursor:pointer;">
          <i class="pi pi-plus"></i> Tạo đơn hàng
        </button>
        <div *ngIf="ordersLoading()" class="cp-empty"><i class="pi pi-spin pi-spinner"></i></div>
        <div *ngIf="!ordersLoading() && orders().length === 0" class="cp-empty">
          <i class="pi pi-shopping-bag"></i><p>Chưa có đơn hàng</p>
        </div>
        <div *ngFor="let order of orders()" class="cp-order-row">
          <div class="cp-order-row-head">
            <div class="cp-order-num">{{ order.order_number }}</div>
            <span *ngIf="(order.confirmation_emails?.length || 0) > 0" class="cp-order-confirmed">
              <i class="pi pi-check-circle"></i>
              Confirmed<ng-container *ngIf="(order.confirmation_emails?.length || 0) > 1"> ({{ order.confirmation_emails!.length }}x)</ng-container>
            </span>
          </div>
          <div class="cp-order-meta">
            <span>{{ order.status }}</span>
            <span class="cp-order-amount">{{ order.total_amount | currency:'VND':'symbol':'1.0-0' }}</span>
          </div>
          <div class="cp-order-foot">
            <span style="font-size:.68rem;color:#94a3b8">{{ order.created_at | date:'dd/MM/yy HH:mm' }}</span>
            <button type="button" class="cp-btn cp-btn--ghost cp-btn--sm"
                    [disabled]="!linkedCustomer?.email"
                    [title]="linkedCustomer?.email ? '' : 'Khách hàng chưa có email'"
                    (click)="openConfirmationDialog(order)">
              <i class="pi pi-envelope"></i> Gửi mail xác nhận
            </button>
          </div>
        </div>
      </ng-container>

      <!-- History -->
      <ng-container *ngIf="activeTab() === 'history'">
        <div *ngIf="historyLoading()" class="cp-empty"><i class="pi pi-spin pi-spinner"></i></div>
        <div *ngIf="!historyLoading() && chatHistory().length === 0" class="cp-empty">
          <i class="pi pi-comments"></i><p>Chưa có lịch sử</p>
        </div>
        <div *ngFor="let conv of chatHistory()" class="cp-hist-row">
          <div style="display:flex;align-items:center;gap:.3rem">
            <i [class]="'pi pi-' + (conv.platform === 'telegram' ? 'send' : 'envelope')" style="font-size:.65rem;color:#94a3b8"></i>
            <span style="font-weight:600;font-size:.72rem">{{ conv.platform }}</span>
          </div>
          <div class="cp-hist-preview">{{ conv.last_message }}</div>
          <div class="cp-hist-time">{{ conv.last_message_time | date:'dd/MM HH:mm' }}</div>
        </div>
      </ng-container>

      <!-- Re-link -->
      <ng-container *ngIf="activeTab() === 'relink'">
        <div style="margin-bottom:.5rem">
          <div class="cp-search-wrap">
            <i class="pi pi-search cp-search-icon"></i>
            <input type="text" class="cp-input cp-input--search"
                   [(ngModel)]="searchKeyword" (ngModelChange)="onSearch($event)"
                   placeholder="Tên, SĐT, email..." />
          </div>
        </div>
        <div *ngIf="searching" class="cp-empty"><i class="pi pi-spin pi-spinner"></i></div>
        <ng-container *ngIf="!searching">
          <button *ngFor="let c of searchResults" type="button" class="cp-result-row"
                  [disabled]="linking" (click)="selectCustomer(c)">
            <div class="cp-result-av">{{ (c.name||'?').charAt(0).toUpperCase() }}</div>
            <div style="flex:1;min-width:0">
              <div class="cp-result-name">{{ c.name }}</div>
              <div class="cp-result-phone">{{ c.phone }}</div>
            </div>
            <span class="cp-result-link">Link</span>
          </button>
          <div *ngIf="searchKeyword.trim() && !searching && searchResults.length === 0" class="cp-empty">
            <i class="pi pi-user-minus"></i><p>Không tìm thấy</p>
          </div>
        </ng-container>
        <span *ngIf="linkError" class="cp-error">{{ linkError }}</span>
      </ng-container>

    </div>
  </ng-container>

  <!-- ══ UNLINKED: search → results → create ════════════════════════════════ -->
  <ng-container *ngIf="!linkedCustomer">

    <div class="cp-section-title">Liên kết khách hàng</div>

    <!-- Search -->
    <div style="padding:0 .75rem .4rem">
      <div class="cp-search-wrap">
        <i class="pi pi-search cp-search-icon"></i>
        <input type="text" class="cp-input cp-input--search"
               [(ngModel)]="searchKeyword" (ngModelChange)="onSearch($event)"
               placeholder="Tên, số điện thoại, email..." />
      </div>
    </div>

    <!-- Loading skeleton -->
    <div *ngIf="searching" style="padding:0 .75rem">
      <p-skeleton height="2.2rem" styleClass="mb-1" borderRadius="6px"></p-skeleton>
      <p-skeleton height="2.2rem" styleClass="mb-1" borderRadius="6px"></p-skeleton>
      <p-skeleton height="2.2rem" borderRadius="6px"></p-skeleton>
    </div>

    <!-- Results list -->
    <div *ngIf="!searching && searchResults.length > 0" class="cp-results">
      <button *ngFor="let c of searchResults" type="button" class="cp-result-row"
              [disabled]="linking" (click)="selectCustomer(c)">
        <div class="cp-result-av">{{ (c.name||'?').charAt(0).toUpperCase() }}</div>
        <div style="flex:1;min-width:0">
          <div class="cp-result-name">{{ c.name }}</div>
          <div class="cp-result-phone">{{ c.phone }}</div>
        </div>
        <p-tag [value]="c.customer_type || 'KH'" severity="info"></p-tag>
        <span class="cp-result-link"><i class="pi pi-link"></i></span>
      </button>
    </div>

    <!-- No results -->
    <div *ngIf="!searching && searchKeyword.trim() && searchResults.length === 0 && !showCreateForm()" class="cp-empty">
      <i class="pi pi-user-minus"></i>
      <p>Không tìm thấy khách hàng</p>
    </div>

    <!-- Create form -->
    <div *ngIf="showCreateForm()" class="cp-create-form">
      <div class="cp-create-title">Tạo khách hàng mới</div>
      <input type="text" class="cp-input" [(ngModel)]="newCustomer.name" placeholder="Tên *" />
      <input type="text" class="cp-input" [(ngModel)]="newCustomer.phone" placeholder="Số điện thoại" />
      <input type="email" class="cp-input" [(ngModel)]="newCustomer.email" placeholder="Email" />
      <input type="text" class="cp-input" [(ngModel)]="newCustomer.address" placeholder="Địa chỉ" />
      <div class="cp-create-actions">
        <button type="button" class="cp-btn cp-btn--ghost" (click)="cancelCreate()">Hủy</button>
        <button type="button" class="cp-btn cp-btn--primary" (click)="createCustomer()"
                [disabled]="creatingCustomer() || !newCustomer.name.trim()">
          <i [class]="creatingCustomer() ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
          {{ creatingCustomer() ? 'Đang tạo...' : 'Tạo & liên kết' }}
        </button>
      </div>
      <span *ngIf="createError" style="font-size:.7rem;color:#ef4444">{{ createError }}</span>
    </div>

    <!-- Footer actions -->
    <div class="cp-footer">
      <button *ngIf="!showCreateForm()" type="button" class="cp-btn cp-btn--primary" style="width:100%;justify-content:center"
              (click)="showCreateForm.set(true)">
        <i class="pi pi-user-plus"></i> Tạo khách hàng mới
      </button>
    </div>

    <span *ngIf="linkError" class="cp-error">{{ linkError }}</span>
  </ng-container>

</div>

<!-- Order-confirmation dialog (mounted lazily when agent clicks "Gửi mail xác nhận") -->
<app-order-confirmation-dialog
    *ngIf="dialogOrder && linkedCustomer"
    [customer]="linkedCustomer"
    [order]="dialogOrder"
    [conversationId]="_conversation?.id || undefined"
    [agentName]="_conversation?.agent || undefined"
    (sent)="onConfirmationSent($event)"
    (cancelled)="dialogOrder = null">
</app-order-confirmation-dialog>

<!-- Create-order dialog: build a Telegram-channel order for the linked customer -->
<app-create-order-dialog
    *ngIf="showCreateOrder() && linkedCustomer"
    [customer]="linkedCustomer"
    [conversationId]="_conversation?.id || undefined"
    [agentName]="_conversation?.agent || undefined"
    (orderCreated)="onOrderCreated($event)"
    (cancelled)="showCreateOrder.set(false)">
</app-create-order-dialog>
  `
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
  /** Fired when an order-confirmation email is dispatched; parent appends a
   *  system message into the conversation thread. */
  @Output() messageSent = new EventEmitter<TelegramMessage>();

  /** Order being confirmed in the dialog — null when dialog is closed. */
  dialogOrder: CustomerOrder | null = null;

  // ── Search / link
  searchKeyword = '';
  searchResults: CustomerSummary[] = [];
  linkedCustomer: CustomerSummary | null = null;
  searching = false;
  linking = false;
  linkError = '';

  // ── Tabs
  activeTab = signal<'profile' | 'orders' | 'history' | 'relink'>('profile');
  orders = signal<CustomerOrder[]>([]);
  chatHistory = signal<any[]>([]);
  ordersLoaded = signal(false);
  historyLoaded = signal(false);
  ordersLoading = signal(false);
  historyLoading = signal(false);

  // ── Create order (Telegram-channel checkout for the linked customer)
  showCreateOrder = signal(false);

  // ── Email
  showEmailForm = signal(false);
  sendingEmail = signal(false);
  emailSubject = '';
  emailContent = '';
  emailError = '';

  // ── Create customer
  showCreateForm = signal(false);
  creatingCustomer = signal(false);
  createError = '';
  newCustomer: CustomerCreatePayload = { name: '', phone: '', email: '', address: '' };

  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor() {
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword.trim()) { this.searchResults = []; this.searching = false; return of(null); }
          this.searching = true;
          return this.chatService.searchRetailCustomers(keyword, 10).pipe(catchError(() => of(null)));
        })
      ).subscribe(res => { this.searching = false; this.searchResults = res?.data || []; })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  loadTab(tab: 'profile' | 'orders' | 'history' | 'relink'): void {
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
      error: () => { this.linking = false; this.linkError = 'Liên kết thất bại. Thử lại.'; }
    });
  }

  unlink(): void {
    if (!this._conversation?.id) return;
    this.linking = true; this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, null).subscribe({
      next: () => { this.linkedCustomer = null; this.linking = false; this.customerLinked.emit(null); },
      error: () => { this.linking = false; this.linkError = 'Hủy liên kết thất bại.'; }
    });
  }

  /** Open the order-confirmation dialog for a specific order row. */
  openConfirmationDialog(order: CustomerOrder): void {
    if (!this.linkedCustomer?.email) return;
    this.dialogOrder = order;
  }

  /** A new order was just created from the conversation. Close the create
   *  dialog, surface it in the orders list, pin a system message, then open the
   *  confirmation-email dialog so the agent can email the customer. */
  onOrderCreated(order: CustomerOrder): void {
    this.showCreateOrder.set(false);
    this.orders.update(list => [order, ...list]);
    this.ordersLoaded.set(true);
    this.activeTab.set('orders');

    this.messageSent.emit({
      id: `order-created-${order.id}-${Date.now()}`,
      sender: 'system',
      sender_name: 'System',
      content: `🛒 Đã tạo đơn #${order.order_number} (${(order.total_amount || 0).toLocaleString('vi-VN')}₫) cho ${this.linkedCustomer?.name || 'khách'}`,
      timestamp: new Date().toISOString(),
      message_type: 'text',
      delivery_status: 'sent',
    } as TelegramMessage);

    // Chain into the email-confirmation dialog (only if the customer has email).
    if (this.linkedCustomer?.email) {
      this.dialogOrder = order;
    }
  }

  /** Dialog reports a successful send. Append a system message into the
   *  thread (via parent) and refresh the order's confirmation badge. */
  onConfirmationSent(result: OrderConfirmationResult): void {
    const order = this.dialogOrder;
    this.dialogOrder = null;
    if (!order) return;

    // Update local badge count without round-tripping the list.
    this.orders.update(list => list.map(o => o.id === order.id
      ? {
          ...o,
          confirmation_emails: [
            ...(o.confirmation_emails || []),
            {
              batch_id: result.batch_id || '',
              sent_at: result.sent_at || new Date().toISOString(),
              recipient_email: result.recipient_email,
            },
          ],
        }
      : o,
    ));

    // Build a thread system message (sender='system' so it doesn't count
    // against agent response-time metrics).
    const when = result.sent_at || new Date().toISOString();
    const summary = `📧 Đã gửi email xác nhận đơn #${order.order_number} tới ${result.recipient_email}`;
    this.messageSent.emit({
      id: `order-confirm-${order.id}-${Date.now()}`,
      sender: 'system',
      sender_name: 'System',
      content: summary,
      timestamp: when,
      message_type: 'text',
      delivery_status: 'sent',
    });
  }

  cancelEmail(): void { this.showEmailForm.set(false); this.emailSubject = ''; this.emailContent = ''; this.emailError = ''; }

  sendEmail(): void {
    if (!this.linkedCustomer?.email || !this.emailSubject.trim() || !this.emailContent.trim()) return;
    this.sendingEmail.set(true); this.emailError = '';
    const payload: SendEmailPayload = {
      to_email: this.linkedCustomer.email, to_name: this.linkedCustomer.name,
      subject: this.emailSubject.trim(), content: this.emailContent.trim()
    };
    this.chatService.sendEmailToCustomer(payload).subscribe({
      next: () => { this.sendingEmail.set(false); this.cancelEmail(); },
      error: () => { this.sendingEmail.set(false); this.emailError = 'Gửi email thất bại.'; }
    });
  }

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
          error: () => { this.creatingCustomer.set(false); this.createError = 'Tạo thành công nhưng link thất bại. Hãy tìm và link.'; }
        });
      },
      error: () => { this.creatingCustomer.set(false); this.createError = 'Tạo khách hàng thất bại.'; }
    });
  }

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
    this.linkError = ''; this.searchKeyword = ''; this.searchResults = [];
    this._resetTabState();
  }
}
