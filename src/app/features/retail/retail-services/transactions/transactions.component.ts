import { Component, OnInit } from '@angular/core';
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
import { InventoryService as TransactionService } from '../../../inventory/services/inventory.service';

interface TransactionItem {
  id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  source: string;
  paidAt: Date | null;
  createdAt: Date | null;
}

@Component({
  selector: 'app-transactions',
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
  templateUrl: './transactions.component.html',
  providers: [MessageService]
})
export class TransactionsComponent implements OnInit {
  transactions: TransactionItem[] = [];
  filteredTransactions: TransactionItem[] = [];
  loading = false;

  totalRecords = 0;
  first = 0;
  rows = 20;

  searchTerm = '';
  selectedStatus = '';
  selectedPaymentMethod = '';
  selectedSource = '';

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Success', value: 'success' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' }
  ];

  paymentOptions: Array<{ label: string; value: string }> = [
    { label: 'All Payment', value: '' }
  ];

  sourceOptions: Array<{ label: string; value: string }> = [
    { label: 'All Source', value: '' }
  ];

  constructor(
    private messageService: MessageService,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {
    this.loadTransactions(0, this.rows);
  }

  loadTransactions(skip: number = 0, limit: number = this.rows): void {
    this.loading = true;
    this.transactionService.listTransactions(skip, limit).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp?.data) ? resp.data : [];
        this.transactions = data.map((it: any) => this.mapTransaction(it));
        this.totalRecords = Number(resp?.total ?? this.transactions.length);
        this.first = skip;
        this.refreshFilterOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.transactions = [];
        this.filteredTransactions = [];
        this.totalRecords = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load transactions'
        });
      }
    });
  }

  onPage(event: any): void {
    const nextFirst = Number(event?.first ?? 0);
    const nextRows = Number(event?.rows ?? this.rows);
    this.rows = nextRows;
    this.loadTransactions(nextFirst, nextRows);
  }

  applyFilters(): void {
    const keyword = this.searchTerm.trim().toLowerCase();
    this.filteredTransactions = this.transactions.filter((item) => {
      const matchesSearch = !keyword
        || item.transactionId.toLowerCase().includes(keyword)
        || item.orderId.toLowerCase().includes(keyword)
        || item.source.toLowerCase().includes(keyword)
        || item.paymentMethod.toLowerCase().includes(keyword);

      const matchesStatus = !this.selectedStatus || item.status.toLowerCase() === this.selectedStatus.toLowerCase();
      const matchesPayment = !this.selectedPaymentMethod || item.paymentMethod.toLowerCase() === this.selectedPaymentMethod.toLowerCase();
      const matchesSource = !this.selectedSource || item.source.toLowerCase() === this.selectedSource.toLowerCase();
      return matchesSearch && matchesStatus && matchesPayment && matchesSource;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPaymentMethod = '';
    this.selectedSource = '';
    this.applyFilters();
  }

  getSuccessCount(): number {
    return this.transactions.filter((it) => it.status.toLowerCase() === 'success').length;
  }

  getPendingCount(): number {
    return this.transactions.filter((it) => it.status.toLowerCase() === 'pending').length;
  }

  getTotalAmount(): number {
    return this.transactions.reduce((sum, it) => sum + Number(it.amount || 0), 0);
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    const key = (status || '').toLowerCase();
    if (key === 'success') return 'success';
    if (key === 'pending') return 'warn';
    if (key === 'failed' || key === 'error') return 'danger';
    return 'info';
  }

  private refreshFilterOptions(): void {
    const paymentValues = [...new Set(this.transactions.map((x) => x.paymentMethod).filter(Boolean))];
    const sourceValues = [...new Set(this.transactions.map((x) => x.source).filter(Boolean))];
    this.paymentOptions = [
      { label: 'All Payment', value: '' },
      ...paymentValues.map((v) => ({ label: v, value: v }))
    ];
    this.sourceOptions = [
      { label: 'All Source', value: '' },
      ...sourceValues.map((v) => ({ label: v, value: v }))
    ];
  }

  private mapTransaction(raw: any): TransactionItem {
    return {
      id: String(raw?._id || ''),
      transactionId: String(raw?.transaction_id || ''),
      orderId: String(raw?.order_id || ''),
      amount: Number(raw?.amount || 0),
      paymentMethod: String(raw?.payment_method || ''),
      status: String(raw?.status || ''),
      source: String(raw?.source || ''),
      paidAt: raw?.paid_at ? new Date(raw.paid_at) : null,
      createdAt: raw?.created_at ? new Date(raw.created_at) : null
    };
  }
}
