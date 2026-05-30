import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { InventoryService } from '../../../inventory/services/inventory.service';

export interface PickerCustomer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  customer_type?: string;
}

/**
 * Searchable customer picker shared by the POS and e-commerce screens.
 * - type-ahead search (by name / phone / email) over the customer list
 * - "New" button creates a customer via a dialog and selects it
 * - shows a customer info card once one is selected
 * - emits the selected customer (or null when cleared) via (customerChange)
 *
 * `required` only drives the visual hint; callers decide whether to block
 * checkout (POS allows guest, e-commerce requires a customer).
 */
@Component({
  selector: 'app-customer-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, DialogModule, ButtonModule, InputTextModule],
  template: `
    <div class="customer-picker">
      @if (!selected) {
        <div class="cp-search">
          <p-autoComplete
            [(ngModel)]="query"
            [suggestions]="suggestions"
            (completeMethod)="search($event)"
            (onSelect)="onSelect($event)"
            field="name"
            [dropdown]="true"
            [forceSelection]="false"
            appendTo="body"
            styleClass="cp-ac"
            [placeholder]="required ? 'Search customer (required)' : 'Search customer (optional)'">
            <ng-template let-c pTemplate="item">
              <div class="cp-opt"><span class="cp-opt-name">{{ c.name }}</span>
                @if (c.phone) { <span class="cp-opt-sub">{{ c.phone }}</span> }</div>
            </ng-template>
          </p-autoComplete>
          <button type="button" class="cp-new-btn" (click)="openCreate()">
            <i class="pi pi-user-plus"></i> New
          </button>
        </div>
        @if (required) { <small class="cp-hint">A customer is required to place this order.</small> }
      } @else {
        <div class="cp-card">
          <div class="cp-avatar">{{ initials(selected.name) }}</div>
          <div class="cp-info">
            <div class="cp-name">{{ selected.name }}
              @if (selected.customer_type) { <span class="cp-badge">{{ selected.customer_type }}</span> }
            </div>
            @if (selected.phone) { <div class="cp-row"><i class="pi pi-phone"></i> {{ selected.phone }}</div> }
            @if (selected.email) { <div class="cp-row"><i class="pi pi-envelope"></i> {{ selected.email }}</div> }
            @if (selected.address) { <div class="cp-row"><i class="pi pi-map-marker"></i> {{ selected.address }}</div> }
          </div>
          <button type="button" class="cp-change" (click)="clear()" title="Change customer"><i class="pi pi-times"></i></button>
        </div>
      }
    </div>

    <p-dialog header="New Customer" [(visible)]="showCreate" [modal]="true" [style]="{ width: '420px' }" appendTo="body">
      <div class="cp-form">
        <label>Name *</label>
        <input pInputText [(ngModel)]="form.name" placeholder="Customer name" />
        <label>Phone</label>
        <input pInputText [(ngModel)]="form.phone" placeholder="Phone" />
        <label>Email</label>
        <input pInputText [(ngModel)]="form.email" placeholder="Email" />
        <label>Address</label>
        <input pInputText [(ngModel)]="form.address" placeholder="Address" />
      </div>
      <ng-template pTemplate="footer">
        <button type="button" class="cp-dlg-cancel" (click)="showCreate = false">Cancel</button>
        <button type="button" class="cp-dlg-save" [disabled]="!form.name?.trim() || saving" (click)="create()">
          {{ saving ? 'Saving…' : 'Create & Select' }}
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .customer-picker { width: 100%; }
    .cp-search { display: flex; gap: 0.5rem; align-items: center; }
    .cp-search ::ng-deep .cp-ac { flex: 1; }
    .cp-search ::ng-deep .cp-ac .p-autocomplete-input { width: 100%; }
    .cp-new-btn { white-space: nowrap; border: 1px solid #cbd5e1; background: #fff; color: #334155;
      border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .cp-new-btn:hover { background: #f1f5f9; }
    .cp-hint { color: #ef4444; font-size: 0.72rem; }
    .cp-opt { display: flex; flex-direction: column; }
    .cp-opt-name { font-weight: 600; color: #1e293b; }
    .cp-opt-sub { font-size: 0.75rem; color: #64748b; }
    .cp-card { display: flex; gap: 0.6rem; align-items: flex-start; background: #f8fafc;
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6rem 0.7rem; }
    .cp-avatar { width: 36px; height: 36px; border-radius: 50%; background: #6366f1; color: #fff;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex: none; }
    .cp-info { flex: 1; min-width: 0; }
    .cp-name { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
    .cp-badge { margin-left: 0.4rem; font-size: 0.65rem; text-transform: uppercase; background: #e0e7ff;
      color: #4338ca; border-radius: 4px; padding: 0.05rem 0.35rem; font-weight: 700; }
    .cp-row { font-size: 0.78rem; color: #475569; display: flex; align-items: center; gap: 0.35rem; margin-top: 0.15rem; }
    .cp-row i { font-size: 0.72rem; color: #94a3b8; }
    .cp-change { border: none; background: transparent; color: #94a3b8; cursor: pointer; font-size: 0.9rem; }
    .cp-change:hover { color: #ef4444; }
    .cp-form { display: flex; flex-direction: column; gap: 0.3rem; }
    .cp-form label { font-size: 0.78rem; font-weight: 600; color: #334155; margin-top: 0.4rem; }
    .cp-form input { width: 100%; }
    .cp-dlg-cancel { background: #fff; border: 1px solid #cbd5e1; color: #334155; border-radius: 6px; padding: 0.45rem 0.9rem; cursor: pointer; }
    .cp-dlg-save { background: #6366f1; border: none; color: #fff; border-radius: 6px; padding: 0.45rem 0.9rem; font-weight: 600; cursor: pointer; margin-left: 0.5rem; }
    .cp-dlg-save:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
})
export class CustomerPickerComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private messageService = inject(MessageService);

  @Input() required = false;
  @Output() customerChange = new EventEmitter<PickerCustomer | null>();

  customers: PickerCustomer[] = [];
  suggestions: PickerCustomer[] = [];
  selected: PickerCustomer | null = null;
  query: any = '';

  showCreate = false;
  saving = false;
  form: { name: string; phone: string; email: string; address: string } = { name: '', phone: '', email: '', address: '' };

  ngOnInit(): void {
    this.inventoryService.listRetailCustomers(0, 100).subscribe(res => {
      this.customers = (res.data || []).map((c: any) => ({ ...c, id: c.id || c._id }));
    });
  }

  search(event: { query: string }): void {
    const q = (event.query || '').toLowerCase().trim();
    this.suggestions = !q
      ? this.customers.slice()
      : this.customers.filter(c =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q));
  }

  onSelect(event: any): void {
    // PrimeNG emits the value directly or as { value } depending on version.
    this.selected = event?.value ?? event;
    this.customerChange.emit(this.selected);
  }

  clear(): void {
    this.selected = null;
    this.query = '';
    this.customerChange.emit(null);
  }

  openCreate(): void {
    this.form = { name: (typeof this.query === 'string' ? this.query : '') || '', phone: '', email: '', address: '' };
    this.showCreate = true;
  }

  create(): void {
    if (!this.form.name?.trim() || this.saving) return;
    this.saving = true;
    this.inventoryService.createRetailCustomer({
      name: this.form.name.trim(),
      phone: this.form.phone?.trim() || undefined,
      email: this.form.email?.trim() || undefined,
      address: this.form.address?.trim() || undefined,
      customer_type: 'regular',
    }).subscribe({
      next: (res: any) => {
        const created: PickerCustomer = { ...(res?.data || {}), id: res?.data?.id || res?.data?._id, name: this.form.name.trim() };
        this.customers = [created, ...this.customers];
        this.selected = created;
        this.customerChange.emit(created);
        this.saving = false;
        this.showCreate = false;
        this.messageService.add({ severity: 'success', summary: 'Customer', detail: 'Customer created' });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Customer', detail: 'Could not create customer' });
      },
    });
  }

  initials(name: string): string {
    return (name || '?').trim().split(/\s+/).slice(-2).map(p => p[0]).join('').toUpperCase();
  }
}
