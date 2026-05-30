import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryService as RetailOrderService, ProductService } from '../../../inventory/services/inventory.service';
import { CustomerPickerComponent, PickerCustomer } from '../shared/customer-picker.component';

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

interface StatusStep {
  status: string;
  icon: string;
  label: string;
  desc: string;
}

interface StatusAction {
  key: string;
  label: string;
  severity: 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';
  icon: string;
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
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
    InputNumberModule,
    CustomerPickerComponent
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class OrdersComponent implements OnInit {
  // ── Signals ──
  orders = signal<OrderItem[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  first = signal(0);
  rows = signal(20);
  selectedOrder = signal<any>(null);
  detailVisible = signal(false);
  detailLoading = signal(false);
  updatingStatus = signal(false);

  // Handle both _id (MongoDB alias) and id (serialized field name)
  selectedOrderId = computed(() => {
    const o = this.selectedOrder();
    return o?._id || o?.id || '';
  });

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
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Returned', value: 'returned' },
    { label: 'Expired', value: 'expired' }
  ];

  paymentStatusOptions = [
    { label: 'All Payment Status', value: '' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Partial', value: 'partial' },
    { label: 'Refunded', value: 'refunded' }
  ];

  // ── Status flow definition (for timeline card) ──
  statusFlow: StatusStep[] = [
    { status: 'pending',    icon: 'pi-clock',        label: 'Pending',    desc: 'Đơn mới tạo, chờ xác nhận từ nhân viên' },
    { status: 'confirmed',  icon: 'pi-check-circle', label: 'Confirmed',  desc: 'Đã xác nhận, đang chờ xử lý đóng gói' },
    { status: 'processing', icon: 'pi-cog',          label: 'Processing', desc: 'Đang xử lý / đóng gói hàng hóa' },
    { status: 'shipped',    icon: 'pi-truck',        label: 'Shipped',    desc: 'Đã bàn giao cho đơn vị vận chuyển' },
    { status: 'delivered',  icon: 'pi-home',         label: 'Delivered',  desc: 'Giao hàng thành công đến khách hàng' },
  ];

  private readonly statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  // ── Edit order state ──
  editVisible = signal(false);
  savingEdit = signal(false);
  editForm: any = null;
  products: any[] = [];
  addProductId: string | null = null;

  paymentStatusEditOptions = [
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Partial', value: 'partial' },
    { label: 'Refunded', value: 'refunded' },
  ];
  orderStatusEditOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Returned', value: 'returned' },
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private retailOrderService: RetailOrderService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.loadOrders(0, this.rows());
  }

  // ── Edit order ──
  get productOptions() {
    return this.products.map(p => ({ label: `${p.name} (${p.sku})`, value: p.id }));
  }

  openEdit(): void {
    const o = this.selectedOrder();
    if (!o) return;
    this.editForm = {
      customer_id: o.customer_id || '',
      customerName: o.customer_id || '',
      shipping_address: o.shipping_address || '',
      order_status: o.order_status || 'pending',
      payment_status: o.payment_status || 'unpaid',
      warehouse_id: o.warehouse_id || '',
      items: (o.items || []).map((it: any) => ({
        product_id: it.product_id, sku: it.sku, product_name: it.product_name,
        quantity: it.quantity, unit_price: it.unit_price, total_price: it.total_price,
      })),
    };
    if (!this.products.length) {
      this.productService.listProducts(undefined, 0, 100).subscribe((r: any) => {
        this.products = (r.data || []).map((p: any) => ({ ...p, id: p.id || p._id }));
      });
    }
    this.editVisible.set(true);
  }

  onEditCustomer(c: PickerCustomer | null): void {
    this.editForm.customer_id = c?.id || '';
    this.editForm.customerName = c?.name || '';
  }

  editQtyChange(it: any): void {
    it.total_price = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
  }

  removeEditItem(i: number): void {
    this.editForm.items.splice(i, 1);
  }

  addEditItem(): void {
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

  editTotal(): number {
    return (this.editForm?.items || []).reduce((s: number, it: any) => s + (Number(it.total_price) || 0), 0);
  }

  saveEdit(): void {
    const id = this.selectedOrderId();
    if (!id || !this.editForm) return;
    const total = this.editTotal();
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
      total_amount: total,
      net_amount: total,
    };
    this.savingEdit.set(true);
    this.retailOrderService.updateOrder(id, payload).subscribe({
      next: (resp: any) => {
        this.selectedOrder.set(resp?.data || resp);
        this.savingEdit.set(false);
        this.editVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Order updated', detail: 'Order information saved' });
        this.loadOrders(this.first(), this.rows());
      },
      error: (err: any) => {
        this.savingEdit.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Could not update order' });
      },
    });
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
    if (key === 'delivered') return 'success';
    if (key === 'pending') return 'warn';
    if (key === 'cancelled' || key === 'returned' || key === 'expired') return 'danger';
    return 'info';
  }

  getPaymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const key = (status || '').toLowerCase();
    if (key === 'paid') return 'success';
    if (key === 'partial') return 'warn';
    if (key === 'unpaid' || key === 'pending') return 'warn';
    if (key === 'refunded') return 'danger';
    return 'info';
  }

  isCurrentOrPastStatus(stepStatus: string): boolean {
    const current = (this.selectedOrder()?.order_status || '').toLowerCase();
    const currentIdx = this.statusOrder.indexOf(current);
    const stepIdx = this.statusOrder.indexOf(stepStatus);
    if (currentIdx === -1 || stepIdx === -1) return false;
    return stepIdx <= currentIdx;
  }

  isCurrentStatus(stepStatus: string): boolean {
    return (this.selectedOrder()?.order_status || '').toLowerCase() === stepStatus;
  }

  isCancelledOrder(): boolean {
    const status = (this.selectedOrder()?.order_status || '').toLowerCase();
    return status === 'cancelled' || status === 'returned' || status === 'expired';
  }

  getAvailableActions(status: string): StatusAction[] {
    const s = (status || '').toLowerCase();
    const cancelAction: StatusAction = { key: 'cancel', label: 'Cancel Order', severity: 'danger', icon: 'pi pi-times' };
    switch (s) {
      case 'pending':    return [{ key: 'confirm',  label: 'Confirm Order',      severity: 'success', icon: 'pi pi-check' }, cancelAction];
      case 'confirmed':  return [{ key: 'process',  label: 'Mark Processing',    severity: 'info',    icon: 'pi pi-cog'   }, cancelAction];
      case 'processing': return [{ key: 'ship',     label: 'Mark Shipped',       severity: 'info',    icon: 'pi pi-truck' }, cancelAction];
      case 'shipped':    return [{ key: 'deliver',  label: 'Mark Delivered',     severity: 'success', icon: 'pi pi-home'  }];
      default:           return [];
    }
  }

  updateOrderStatus(action: string, orderId: string): void {
    if (action === 'cancel') {
      this.confirmationService.confirm({
        message: 'Bạn chắc chắn muốn huỷ đơn hàng này?',
        header: 'Xác nhận huỷ đơn',
        icon: 'pi pi-exclamation-triangle',
        accept: () => this.executeStatusUpdate(action, orderId)
      });
      return;
    }
    this.executeStatusUpdate(action, orderId);
  }

  private executeStatusUpdate(action: string, orderId: string): void {
    if (!orderId) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy ID đơn hàng' });
      return;
    }
    this.updatingStatus.set(true);

    const request$ = (() => {
      switch (action) {
        case 'confirm':  return this.retailOrderService.confirmOrder(orderId);
        case 'process':  return this.retailOrderService.processOrder(orderId);
        case 'ship':     return this.retailOrderService.shipOrder(orderId);
        case 'deliver':  return this.retailOrderService.deliverOrder(orderId);
        case 'cancel':   return this.retailOrderService.cancelOrder(orderId);
        default:         return null;
      }
    })();

    if (!request$) { this.updatingStatus.set(false); return; }

    request$.subscribe({
      next: (resp: any) => {
        const updated = resp?.data || resp;
        this.selectedOrder.set(updated);
        const updatedId = updated?._id || updated?.id || orderId;
        this.orders.update(list =>
          list.map(o => o.id === updatedId ? { ...o, orderStatus: updated?.order_status || o.orderStatus } : o)
        );
        this.updatingStatus.set(false);
        this.messageService.add({ severity: 'success', summary: 'Cập nhật thành công', detail: `Đơn hàng đã chuyển sang trạng thái ${updated?.order_status}` });
      },
      error: (err: any) => {
        this.updatingStatus.set(false);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err?.error?.detail || 'Không thể cập nhật trạng thái đơn hàng' });
      }
    });
  }

  viewOrder(id: string): void {
    this.detailLoading.set(true);
    this.detailVisible.set(true);
    this.selectedOrder.set(null);
    this.retailOrderService.getOrder(id).subscribe({
      next: (resp: any) => {
        this.selectedOrder.set(resp?.data || resp);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load order details.' });
      }
    });
  }

  closeDetail(): void {
    this.detailVisible.set(false);
    this.selectedOrder.set(null);
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
