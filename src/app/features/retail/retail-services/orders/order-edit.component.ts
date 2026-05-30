import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InventoryService, ProductService } from '../../../inventory/services/inventory.service';
import { CustomerPickerComponent, PickerCustomer } from '../shared/customer-picker.component';

/**
 * Dedicated full-page order editor (replaces the stacked edit dialog so there
 * aren't multiple popups fighting each other). Resolves customer / warehouse
 * ids to names for display.
 */
@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, InputNumberModule, ToastModule, CustomerPickerComponent],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="text-gray-500 hover:text-gray-800" (click)="back()"><i class="pi pi-arrow-left text-lg"></i></button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Edit Order</h1>
          <p class="text-sm text-gray-500">{{ order?.order_number ? ('#' + order.order_number) : '' }}</p>
        </div>
      </div>

      <div *ngIf="loading" class="text-gray-500">Loading…</div>

      <div *ngIf="!loading && editForm" class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Customer</label>
          <div class="text-xs text-gray-500 mb-1">Current: {{ customerName(editForm.customer_id) }}</div>
          <app-customer-picker [required]="false" (customerChange)="onCustomer($event)"></app-customer-picker>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Order status</label>
            <p-dropdown [options]="orderStatusOptions" [(ngModel)]="editForm.order_status" optionLabel="label" optionValue="value" appendTo="body" styleClass="w-full"></p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Payment status</label>
            <p-dropdown [options]="paymentStatusOptions" [(ngModel)]="editForm.payment_status" optionLabel="label" optionValue="value" appendTo="body" styleClass="w-full"></p-dropdown>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Warehouse</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">{{ warehouseName(editForm.warehouse_id) }}</div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Shipping address</label>
          <input pInputText [(ngModel)]="editForm.shipping_address" class="w-full" placeholder="Shipping address" />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Items</label>
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-gray-600">Product</th>
                  <th class="px-3 py-2 text-right text-gray-600">Qty</th>
                  <th class="px-3 py-2 text-right text-gray-600">Unit</th>
                  <th class="px-3 py-2 text-right text-gray-600">Total</th>
                  <th class="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let it of editForm.items; let i = index" class="border-t">
                  <td class="px-3 py-2">{{ it.product_name }} <span class="text-gray-400">{{ it.sku }}</span></td>
                  <td class="px-3 py-2 text-right" style="width:120px">
                    <p-inputNumber [(ngModel)]="it.quantity" [min]="1" [showButtons]="true" (onInput)="qtyChange(it)" (onBlur)="qtyChange(it)" inputStyleClass="w-16 text-right"></p-inputNumber>
                  </td>
                  <td class="px-3 py-2 text-right">{{ it.unit_price | number: '1.0-0' }}</td>
                  <td class="px-3 py-2 text-right font-semibold">{{ it.total_price | number: '1.0-0' }}</td>
                  <td class="px-2 py-2 text-center">
                    <button type="button" class="text-red-500 hover:text-red-700" (click)="removeItem(i)"><i class="pi pi-times"></i></button>
                  </td>
                </tr>
                <tr *ngIf="!editForm.items.length"><td colspan="5" class="px-3 py-3 text-center text-gray-400">No items</td></tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <p-dropdown [options]="productOptions" [(ngModel)]="addProductId" [filter]="true" optionLabel="label" optionValue="value" placeholder="Add product…" appendTo="body" styleClass="flex-1"></p-dropdown>
            <p-button label="Add" icon="pi pi-plus" severity="secondary" [outlined]="true" [disabled]="!addProductId" (onClick)="addItem()"></p-button>
          </div>
        </div>

        <div class="flex justify-end text-lg font-bold text-orange-600">Total: {{ total() | number: '1.0-0' }} ₫</div>

        <div class="flex justify-end gap-2 pt-2 border-t">
          <p-button label="Cancel" icon="pi pi-times" severity="secondary" [outlined]="true" (onClick)="back()"></p-button>
          <p-button label="Save Changes" icon="pi pi-check" severity="success" [loading]="saving" [disabled]="saving" (onClick)="save()"></p-button>
        </div>
      </div>
    </div>
  `,
})
export class OrderEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private messageService = inject(MessageService);

  orderId = '';
  order: any = null;
  editForm: any = null;
  loading = true;
  saving = false;
  products: any[] = [];
  addProductId: string | null = null;
  private customerMap: Record<string, string> = {};
  private warehouseMap: Record<string, string> = {};

  orderStatusOptions = [
    { label: 'Pending', value: 'pending' }, { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' }, { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' },
    { label: 'Returned', value: 'returned' },
  ];
  paymentStatusOptions = [
    { label: 'Unpaid', value: 'unpaid' }, { label: 'Paid', value: 'paid' },
    { label: 'Partial', value: 'partial' }, { label: 'Refunded', value: 'refunded' },
  ];

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    this.productService.listProducts(undefined, 0, 100).subscribe((r: any) => {
      this.products = (r.data || []).map((p: any) => ({ ...p, id: p.id || p._id }));
    });
    this.inventoryService.listRetailCustomers(0, 100).subscribe((r: any) => {
      (r.data || []).forEach((c: any) => { this.customerMap[c.id || c._id] = c.name; });
    });
    this.inventoryService.getAllWarehouses().subscribe((r: any) => {
      (r.data || []).forEach((w: any) => { this.warehouseMap[w.id || w._id] = w.warehouse_name || w.name; });
    });
    this.loadOrder();
  }

  loadOrder(): void {
    this.loading = true;
    this.inventoryService.getOrder(this.orderId).subscribe({
      next: (resp: any) => {
        const o = resp?.data || resp;
        this.order = o;
        this.editForm = {
          customer_id: o.customer_id || '',
          shipping_address: o.shipping_address || '',
          order_status: o.order_status || 'pending',
          payment_status: o.payment_status || 'unpaid',
          warehouse_id: o.warehouse_id || '',
          items: (o.items || []).map((it: any) => ({
            product_id: it.product_id, sku: it.sku, product_name: it.product_name,
            quantity: it.quantity, unit_price: it.unit_price, total_price: it.total_price,
          })),
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load order' });
      },
    });
  }

  get productOptions() {
    return this.products.map(p => ({ label: `${p.name} (${p.sku})`, value: p.id }));
  }

  customerName(id: string): string {
    if (!id || id === 'walk-in' || id === 'guest') return id === 'guest' ? 'Guest' : 'Walk-in';
    return this.customerMap[id] || id;
  }
  warehouseName(id: string): string {
    if (!id) return '—';
    return this.warehouseMap[id] || id;
  }

  onCustomer(c: PickerCustomer | null): void {
    if (c) { this.editForm.customer_id = c.id; this.customerMap[c.id] = c.name; }
  }
  qtyChange(it: any): void { it.total_price = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0); }
  removeItem(i: number): void { this.editForm.items.splice(i, 1); }
  addItem(): void {
    const p = this.products.find(x => x.id === this.addProductId);
    if (!p) return;
    if (this.editForm.items.some((it: any) => it.product_id === p.id)) {
      this.messageService.add({ severity: 'info', summary: 'Item', detail: 'Product already in this order' });
      return;
    }
    const price = Number(p.selling_price ?? p.price ?? 0);
    this.editForm.items.push({ product_id: p.id, sku: p.sku, product_name: p.name, quantity: 1, unit_price: price, total_price: price });
    this.addProductId = null;
  }
  total(): number {
    return (this.editForm?.items || []).reduce((s: number, it: any) => s + (Number(it.total_price) || 0), 0);
  }

  save(): void {
    if (!this.editForm) return;
    const total = this.total();
    const payload = {
      customer_id: this.editForm.customer_id || undefined,
      shipping_address: this.editForm.shipping_address || undefined,
      order_status: this.editForm.order_status,
      payment_status: this.editForm.payment_status,
      warehouse_id: this.editForm.warehouse_id || undefined,
      items: this.editForm.items.map((it: any) => ({
        product_id: it.product_id, sku: it.sku, product_name: it.product_name,
        quantity: Number(it.quantity) || 0, unit_price: Number(it.unit_price) || 0,
        total_price: Number(it.total_price) || 0, discount: 0,
      })),
      total_amount: total, net_amount: total,
    };
    this.saving = true;
    this.inventoryService.updateOrder(this.orderId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Order updated' });
        setTimeout(() => this.back(), 600);
      },
      error: (err: any) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Could not update order' });
      },
    });
  }

  back(): void { this.router.navigate(['/retail/orders']); }
}
