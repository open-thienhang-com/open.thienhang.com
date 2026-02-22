import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CustomerService } from '../../services/retail.service';

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customerType: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    BadgeModule,
    ToastModule
  ],
  templateUrl: './customers.component.html',
  providers: [MessageService]
})
export class CustomersComponent implements OnInit {
  customers: CustomerItem[] = [];
  filteredCustomers: CustomerItem[] = [];
  loading = false;
  saving = false;

  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  showCustomerDialog = false;
  dialogMode: 'create' | 'edit' | 'view' = 'create';
  editingCustomer: CustomerItem | null = null;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  typeOptions: Array<{ label: string; value: string }> = [
    { label: 'All Types', value: '' }
  ];

  dialogStatusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private messageService: MessageService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.listCustomers(0, 50).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp?.data) ? resp.data : [];
        this.customers = data.map((it: any) => this.mapCustomer(it));
        this.refreshTypeOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.customers = [];
        this.filteredCustomers = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load customers'
        });
      }
    });
  }

  applyFilters(): void {
    const keyword = this.searchTerm.trim().toLowerCase();
    this.filteredCustomers = this.customers.filter((item) => {
      const matchesSearch = !keyword
        || item.name.toLowerCase().includes(keyword)
        || item.phone.toLowerCase().includes(keyword)
        || item.email.toLowerCase().includes(keyword)
        || item.address.toLowerCase().includes(keyword)
        || item.customerType.toLowerCase().includes(keyword);

      const statusKey = item.isActive ? 'active' : 'inactive';
      const matchesStatus = !this.selectedStatus || statusKey === this.selectedStatus;
      const matchesType = !this.selectedType || item.customerType === this.selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilters();
  }

  createCustomer(): void {
    this.dialogMode = 'create';
    this.editingCustomer = {
      id: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      customerType: '',
      isActive: true,
      createdAt: null,
      updatedAt: null
    };
    this.showCustomerDialog = true;
  }

  viewCustomer(item: CustomerItem): void {
    this.openCustomerByMode(item, 'view');
  }

  editCustomer(item: CustomerItem): void {
    this.openCustomerByMode(item, 'edit');
  }

  saveCustomer(): void {
    if (!this.editingCustomer || this.dialogMode === 'view') {
      this.cancelEdit();
      return;
    }

    const payload = {
      name: this.editingCustomer.name.trim(),
      phone: this.editingCustomer.phone.trim(),
      email: this.editingCustomer.email.trim(),
      address: this.editingCustomer.address.trim(),
      customer_type: this.editingCustomer.customerType.trim(),
      is_active: this.editingCustomer.isActive
    };

    if (!payload.name || !payload.phone || !payload.email || !payload.address || !payload.customer_type) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name, phone, email, address and customer type are required.'
      });
      return;
    }

    this.saving = true;
    const req$ = this.dialogMode === 'edit' && this.editingCustomer.id
      ? this.customerService.updateCustomer(this.editingCustomer.id, payload)
      : this.customerService.createCustomer(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showCustomerDialog = false;
        this.editingCustomer = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.dialogMode === 'edit' ? 'Customer updated' : 'Customer created'
        });
        this.loadCustomers();
      },
      error: (err: any) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to save customer'
        });
      }
    });
  }

  cancelEdit(): void {
    this.showCustomerDialog = false;
    this.editingCustomer = null;
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'active' : 'inactive';
  }

  getActiveCustomersCount(): number {
    return this.customers.filter((it) => it.isActive).length;
  }

  private openCustomerByMode(item: CustomerItem, mode: 'edit' | 'view'): void {
    this.dialogMode = mode;
    this.saving = true;
    this.customerService.getCustomer(item.id).subscribe({
      next: (resp: any) => {
        this.editingCustomer = this.mapCustomer(resp?.data || item);
        this.showCustomerDialog = true;
        this.saving = false;
      },
      error: () => {
        this.editingCustomer = { ...item };
        this.showCustomerDialog = true;
        this.saving = false;
      }
    });
  }

  private refreshTypeOptions(): void {
    const values: string[] = [...new Set(this.customers.map((p) => p.customerType).filter((x) => !!x))];
    this.typeOptions = [
      { label: 'All Types', value: '' },
      ...values.map((v) => ({ label: v, value: v }))
    ];
  }

  private mapCustomer(raw: any): CustomerItem {
    return {
      id: String(raw?._id || raw?.id || ''),
      name: String(raw?.name || ''),
      phone: String(raw?.phone || ''),
      email: String(raw?.email || ''),
      address: String(raw?.address || ''),
      customerType: String(raw?.customer_type || ''),
      isActive: raw?.is_active !== false,
      createdAt: raw?.created_at ? new Date(raw.created_at) : null,
      updatedAt: raw?.updated_at ? new Date(raw.updated_at) : null
    };
  }
}
