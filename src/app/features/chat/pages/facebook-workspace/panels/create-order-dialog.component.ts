import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ChatService } from '../../../services/chat.service';
import { CustomerSummary, CustomerOrder, ProductSearchResult, OrderItem } from '../../../models/chat.model';

interface CartLine { product: ProductSearchResult; quantity: number; }

/**
 * Create a retail order for the conversation's linked customer (Telegram
 * channel), mirroring the e-commerce checkout. On success it emits the new
 * order so the parent can open the order-confirmation email dialog.
 */
@Component({
  selector: 'app-create-order-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, DropdownModule, InputNumberModule],
  template: `
    <p-dialog header="Tạo đơn hàng" [visible]="true" (visibleChange)="$event || cancelled.emit()"
              [modal]="true" [style]="{ width: '560px' }" [draggable]="false" appendTo="body">
      <div class="co-head">
        <div><span class="co-lbl">Khách hàng</span> <strong>{{ customer.name }}</strong>
          <span *ngIf="customer.phone" class="co-sub"> · {{ customer.phone }}</span></div>
        <div class="co-staff"><i class="pi pi-user"></i> Nhân viên xử lý: <strong>{{ agentName || '—' }}</strong></div>
      </div>

      <div class="co-add">
        <p-dropdown [options]="productOptions" [(ngModel)]="addProductId" [filter]="true"
                    optionLabel="label" optionValue="value" placeholder="Tìm & thêm sản phẩm…"
                    appendTo="body" styleClass="co-prod"></p-dropdown>
        <p-button label="Thêm" icon="pi pi-plus" severity="secondary" [outlined]="true" [disabled]="!addProductId" (onClick)="addItem()"></p-button>
      </div>

      <div class="co-cart">
        <div *ngIf="!cart.length" class="co-empty">Chưa có sản phẩm nào.</div>
        <div *ngFor="let line of cart; let i = index" class="co-row">
          <div class="co-name">{{ line.product.name }} <span class="co-sku">{{ line.product.sku }}</span></div>
          <p-inputNumber [(ngModel)]="line.quantity" [min]="1" [showButtons]="true" inputStyleClass="co-qty"></p-inputNumber>
          <div class="co-price">{{ (line.product.selling_price * line.quantity) | number: '1.0-0' }} ₫</div>
          <button type="button" class="co-rm" (click)="removeItem(i)"><i class="pi pi-times"></i></button>
        </div>
      </div>

      <div class="co-total">Tổng: {{ total() | number: '1.0-0' }} ₫</div>

      <ng-template pTemplate="footer">
        <p-button label="Huỷ" icon="pi pi-times" severity="secondary" [outlined]="true" (onClick)="cancelled.emit()"></p-button>
        <p-button label="Tạo đơn" icon="pi pi-check" severity="success" [loading]="saving" [disabled]="saving || !cart.length" (onClick)="create()"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .co-head { display: flex; flex-direction: column; gap: .25rem; font-size: .85rem; color: #334155; margin-bottom: .75rem; padding-bottom: .6rem; border-bottom: 1px solid #eef2f7; }
    .co-lbl { color: #94a3b8; }
    .co-sub { color: #64748b; }
    .co-staff { font-size: .8rem; color: #475569; }
    .co-staff i { color: #94a3b8; margin-right: .25rem; }
    .co-add { display: flex; gap: .5rem; align-items: center; margin-bottom: .75rem; }
    .co-add ::ng-deep .co-prod { flex: 1; }
    .co-cart { display: flex; flex-direction: column; gap: .4rem; max-height: 280px; overflow: auto; }
    .co-empty { color: #94a3b8; font-size: .85rem; text-align: center; padding: .8rem; }
    .co-row { display: flex; align-items: center; gap: .5rem; }
    .co-name { flex: 1; font-size: .85rem; color: #1e293b; }
    .co-sku { color: #94a3b8; font-size: .75rem; }
    .co-price { width: 110px; text-align: right; font-weight: 600; color: #0f172a; font-size: .85rem; }
    .co-rm { border: none; background: transparent; color: #94a3b8; cursor: pointer; }
    .co-rm:hover { color: #ef4444; }
    .co-total { text-align: right; font-weight: 800; color: #ea580c; font-size: 1.05rem; margin-top: .75rem; }
  `],
})
export class CreateOrderDialogComponent implements OnInit {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  @Input({ required: true }) customer!: CustomerSummary;
  @Input() conversationId?: string;
  @Input() agentName?: string;

  @Output() orderCreated = new EventEmitter<CustomerOrder>();
  @Output() cancelled = new EventEmitter<void>();

  products: ProductSearchResult[] = [];
  addProductId: string | null = null;
  cart: CartLine[] = [];
  saving = false;

  ngOnInit(): void {
    this.chatService.getProductsForChat(0, 100).subscribe({
      next: (res: any) => { this.products = (res.data || []).map((p: any) => ({ ...p, id: p.id || p._id })); },
      error: () => {},
    });
  }

  get productOptions() {
    return this.products.map(p => ({ label: `${p.name} (${p.sku}) — ${(p.selling_price || 0).toLocaleString('vi-VN')}₫`, value: p.id }));
  }

  addItem(): void {
    const p = this.products.find(x => x.id === this.addProductId);
    if (!p) return;
    if (this.cart.some(l => l.product.id === p.id)) {
      this.messageService.add({ severity: 'info', summary: 'Sản phẩm', detail: 'Đã có trong đơn' });
      return;
    }
    this.cart.push({ product: p, quantity: 1 });
    this.addProductId = null;
  }

  removeItem(i: number): void { this.cart.splice(i, 1); }

  total(): number {
    return this.cart.reduce((s, l) => s + (Number(l.product.selling_price) || 0) * (Number(l.quantity) || 0), 0);
  }

  create(): void {
    if (!this.cart.length || this.saving) return;
    const total = this.total();
    const items: OrderItem[] = this.cart.map(l => ({
      product_id: l.product.id,
      sku: l.product.sku,
      product_name: l.product.name,
      quantity: Number(l.quantity) || 0,
      unit_price: Number(l.product.selling_price) || 0,
      total_price: (Number(l.product.selling_price) || 0) * (Number(l.quantity) || 0),
    }));
    this.saving = true;
    this.chatService.createOrder({
      customer_id: this.customer.id,
      items,
      total_amount: total,
      net_amount: total,
      source: 'telegram',
    }).subscribe({
      next: (res: any) => {
        const d = res?.data || res || {};
        const order: CustomerOrder = {
          id: d.id || d._id,
          order_number: d.order_number,
          created_at: d.created_at || new Date().toISOString(),
          total_amount: d.total_amount ?? total,
          status: d.order_status || d.status || 'pending',
          item_count: (d.items?.length ?? items.length),
        };
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Đơn hàng', detail: `Đã tạo đơn #${order.order_number}` });
        this.orderCreated.emit(order);
      },
      error: (err: any) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err?.error?.detail || 'Không thể tạo đơn hàng' });
      },
    });
  }
}
