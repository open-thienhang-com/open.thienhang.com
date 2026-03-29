import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { InventoryService as RetailOrderService } from '../../../inventory/services/inventory.service';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerId: string;
  warehouseId: string;
  itemCount: number;
  source: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  netAmount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  providers: [MessageService]
})
export class OrdersComponent implements OnInit {
  // ── Signals ──
  orders = signal<OrderItem[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  first = signal(0);
  rows = signal(20);

  searchTerm = signal('');
  selectedOrderStatus = signal('');
  selectedPaymentStatus = signal('');
  selectedSource = signal('');

  // ── Computed ──
  filteredOrders = computed(() => {
    const data = this.orders();
    const keyword = this.searchTerm().trim().toLowerCase();
    const status = this.selectedOrderStatus();
    const payment = this.selectedPaymentStatus();
    const src = this.selectedSource();

    return data.filter(item => {
      const matchesSearch = !keyword
        || item.orderNumber.toLowerCase().includes(keyword)
        || item.customerId.toLowerCase().includes(keyword)
        || item.warehouseId.toLowerCase().includes(keyword)
        || item.source.toLowerCase().includes(keyword);

      const matchesOrder = !status || item.orderStatus.toLowerCase() === status.toLowerCase();
      const matchesPayment = !payment || item.paymentStatus.toLowerCase() === payment.toLowerCase();
      const matchesSource = !src || item.source.toLowerCase() === src.toLowerCase();

      return matchesSearch && matchesOrder && matchesPayment && matchesSource;
    });
  });

  pendingCount = computed(() => this.orders().filter(it => it.orderStatus.toLowerCase() === 'pending').length);
  confirmedCount = computed(() => this.orders().filter(it => it.orderStatus.toLowerCase() === 'confirmed').length);
  paidCount = computed(() => this.orders().filter(it => it.paymentStatus.toLowerCase() === 'paid').length);
  totalNetAmount = computed(() => this.orders().reduce((sum, it) => sum + Number(it.netAmount || 0), 0));

  sourceOptions = computed(() => {
    const sourceValues = [...new Set(this.orders().map(x => x.source).filter(Boolean))];
    return [
      { label: 'All Source', value: '' },
      ...sourceValues.map(v => ({ label: v, value: v }))
    ];
  });

  // ── Options ──
  orderStatusOptions = [
    { label: 'All Order Status', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  paymentStatusOptions = [
    { label: 'All Payment Status', value: '' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Failed', value: 'failed' }
  ];

  constructor(
    private messageService: MessageService,
    private retailOrderService: RetailOrderService
  ) { }

  ngOnInit(): void {
    this.loadOrders(0, this.rows());
  }

  loadOrders(skip: number = 0, limit: number = this.rows()): void {
    this.loading.set(true);
    this.retailOrderService.listOrders(skip, limit).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp?.data) ? resp.data : [];
        this.orders.set(data.map((it: any) => this.mapOrder(it)));
        this.totalRecords.set(Number(resp?.total ?? this.orders().length));
        this.first.set(skip);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.orders.set([]);
        this.totalRecords.set(0);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load orders'
        });
      }
    });
  }

  onPage(event: any): void {
    const nextFirst = Number(event?.first ?? 0);
    const nextRows = Number(event?.rows ?? this.rows());
    this.rows.set(nextRows);
    this.loadOrders(nextFirst, nextRows);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedOrderStatus.set('');
    this.selectedPaymentStatus.set('');
    this.selectedSource.set('');
  }

  getOrderStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const key = (status || '').toLowerCase();
    if (key === 'confirmed' || key === 'completed') return 'success';
    if (key === 'pending') return 'warn';
    if (key === 'cancelled' || key === 'failed') return 'danger';
    return 'info';
  }

  getPaymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const key = (status || '').toLowerCase();
    if (key === 'paid') return 'success';
    if (key === 'unpaid' || key === 'pending') return 'warn';
    if (key === 'failed') return 'danger';
    return 'info';
  }

  private mapOrder(raw: any): OrderItem {
    const items = Array.isArray(raw?.items) ? raw.items : [];
    return {
      id: String(raw?._id || ''),
      orderNumber: String(raw?.order_number || ''),
      customerId: String(raw?.customer_id || ''),
      warehouseId: String(raw?.warehouse_id || ''),
      itemCount: items.length,
      source: String(raw?.source || ''),
      orderStatus: String(raw?.order_status || ''),
      paymentStatus: String(raw?.payment_status || ''),
      totalAmount: Number(raw?.total_amount || 0),
      netAmount: Number(raw?.net_amount || 0),
      createdAt: raw?.created_at ? new Date(raw.created_at) : null,
      updatedAt: raw?.updated_at ? new Date(raw.updated_at) : null
    };
  }
}
