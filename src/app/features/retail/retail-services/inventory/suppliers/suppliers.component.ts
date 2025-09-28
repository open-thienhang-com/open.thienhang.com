import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId?: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalValue: number;
  lastOrderDate?: Date;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  customerType: 'retail' | 'wholesale' | 'distributor';
  status: 'active' | 'inactive';
  totalOrders: number;
  totalValue: number;
  lastOrderDate?: Date;
  creditLimit: number;
  currentBalance: number;
  notes?: string;
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputTextarea,
    CardModule,
    TabViewModule,
    BadgeModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class SuppliersComponent implements OnInit {
  activeTabIndex = 0; // 0 for suppliers, 1 for customers
  showSupplierDialog = false;
  showCustomerDialog = false;
  editingSupplier: Supplier | null = null;
  editingCustomer: Customer | null = null;

  // Filters
  searchTerm = '';
  selectedStatus = '';

  // Data
  suppliers: Supplier[] = [];
  customers: Customer[] = [];
  filteredSuppliers: Supplier[] = [];
  filteredCustomers: Customer[] = [];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  customerTypeOptions = [
    { label: 'Retail', value: 'retail' },
    { label: 'Wholesale', value: 'wholesale' },
    { label: 'Distributor', value: 'distributor' }
  ];

  paymentTermsOptions = [
    { label: 'Net 30', value: 'net_30' },
    { label: 'Net 60', value: 'net_60' },
    { label: 'Net 90', value: 'net_90' },
    { label: 'Cash on Delivery', value: 'cod' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadSuppliers();
    this.loadCustomers();
  }

  loadSuppliers() {
    // Mock data - replace with actual API call
    this.suppliers = [
      {
        id: '1',
        name: 'Global Supplies Inc.',
        contactPerson: 'John Smith',
        email: 'john@globalsupplies.com',
        phone: '+1-555-0123',
        address: '123 Business St',
        city: 'New York',
        country: 'USA',
        taxId: 'US123456789',
        paymentTerms: 'net_30',
        status: 'active',
        totalOrders: 45,
        totalValue: 125000.00,
        lastOrderDate: new Date('2024-09-20'),
        notes: 'Reliable supplier, good quality products'
      },
      {
        id: '2',
        name: 'Tech Components Ltd.',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@techcomponents.com',
        phone: '+1-555-0456',
        address: '456 Tech Ave',
        city: 'San Francisco',
        country: 'USA',
        taxId: 'US987654321',
        paymentTerms: 'net_60',
        status: 'active',
        totalOrders: 32,
        totalValue: 89000.00,
        lastOrderDate: new Date('2024-09-18'),
        notes: 'Specializes in electronic components'
      }
    ];
    this.applySupplierFilters();
  }

  loadCustomers() {
    // Mock data - replace with actual API call
    this.customers = [
      {
        id: '1',
        name: 'Retail Store Chain',
        contactPerson: 'Mike Wilson',
        email: 'mike@retailchain.com',
        phone: '+1-555-0789',
        address: '789 Commerce Blvd',
        city: 'Chicago',
        country: 'USA',
        customerType: 'retail',
        status: 'active',
        totalOrders: 67,
        totalValue: 156000.00,
        lastOrderDate: new Date('2024-09-25'),
        creditLimit: 50000.00,
        currentBalance: 12500.00,
        notes: 'Large retail chain, regular customer'
      },
      {
        id: '2',
        name: 'Wholesale Distributors',
        contactPerson: 'Lisa Brown',
        email: 'lisa@wholesaledist.com',
        phone: '+1-555-0321',
        address: '321 Distribution Way',
        city: 'Los Angeles',
        country: 'USA',
        customerType: 'wholesale',
        status: 'active',
        totalOrders: 23,
        totalValue: 78000.00,
        lastOrderDate: new Date('2024-09-22'),
        creditLimit: 100000.00,
        currentBalance: 0.00,
        notes: 'Wholesale distributor, pays on time'
      }
    ];
    this.applyCustomerFilters();
  }

  applySupplierFilters() {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      const matchesSearch = !this.searchTerm ||
        supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || supplier.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  applyCustomerFilters() {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = !this.searchTerm ||
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || customer.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearch() {
    this.applySupplierFilters();
    this.applyCustomerFilters();
  }

  onStatusChange() {
    this.applySupplierFilters();
    this.applyCustomerFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applySupplierFilters();
    this.applyCustomerFilters();
  }

  createSupplier() {
    this.editingSupplier = {
      id: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      paymentTerms: 'net_30',
      status: 'active',
      totalOrders: 0,
      totalValue: 0
    };
    this.showSupplierDialog = true;
  }

  createCustomer() {
    this.editingCustomer = {
      id: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      customerType: 'retail',
      status: 'active',
      totalOrders: 0,
      totalValue: 0,
      creditLimit: 0,
      currentBalance: 0
    };
    this.showCustomerDialog = true;
  }

  editSupplier(supplier: Supplier) {
    this.editingSupplier = { ...supplier };
    this.showSupplierDialog = true;
  }

  editCustomer(customer: Customer) {
    this.editingCustomer = { ...customer };
    this.showCustomerDialog = true;
  }

  saveSupplier() {
    if (!this.editingSupplier) return;

    if (this.editingSupplier.id) {
      // Update existing
      const index = this.suppliers.findIndex(s => s.id === this.editingSupplier!.id);
      if (index !== -1) {
        this.suppliers[index] = { ...this.editingSupplier! };
      }
    } else {
      // Add new
      this.editingSupplier.id = Date.now().toString();
      this.suppliers.unshift({ ...this.editingSupplier! });
    }

    this.applySupplierFilters();
    this.showSupplierDialog = false;
    this.editingSupplier = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Supplier saved successfully'
    });
  }

  saveCustomer() {
    if (!this.editingCustomer) return;

    if (this.editingCustomer.id) {
      // Update existing
      const index = this.customers.findIndex(c => c.id === this.editingCustomer!.id);
      if (index !== -1) {
        this.customers[index] = { ...this.editingCustomer! };
      }
    } else {
      // Add new
      this.editingCustomer.id = Date.now().toString();
      this.customers.unshift({ ...this.editingCustomer! });
    }

    this.applyCustomerFilters();
    this.showCustomerDialog = false;
    this.editingCustomer = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Customer saved successfully'
    });
  }

  cancelSupplierEdit() {
    this.showSupplierDialog = false;
    this.editingSupplier = null;
  }

  cancelCustomerEdit() {
    this.showCustomerDialog = false;
    this.editingCustomer = null;
  }

  deleteSupplier(supplier: Supplier) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete supplier "${supplier.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.suppliers = this.suppliers.filter(s => s.id !== supplier.id);
        this.applySupplierFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Supplier deleted successfully'
        });
      }
    });
  }

  deleteCustomer(customer: Customer) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete customer "${customer.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.customers = this.customers.filter(c => c.id !== customer.id);
        this.applyCustomerFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Customer deleted successfully'
        });
      }
    });
  }

  getStatusSeverity(status: string): string {
    return status === 'active' ? 'success' : 'danger';
  }

  getCustomerTypeSeverity(type: string): string {
    switch (type) {
      case 'retail': return 'info';
      case 'wholesale': return 'warning';
      case 'distributor': return 'success';
      default: return 'info';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  exportSuppliers() {
    // Implement export functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Export functionality will be implemented'
    });
  }

  exportCustomers() {
    // Implement export functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Export functionality will be implemented'
    });
  }

  refreshData() {
    this.loadSuppliers();
    this.loadCustomers();
    this.messageService.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: 'Data refreshed successfully'
    });
  }

  getActiveSuppliersCount(): number {
    return this.suppliers.filter(s => s.status === 'active').length;
  }

  getActiveCustomersCount(): number {
    return this.customers.filter(c => c.status === 'active').length;
  }

  getTotalSupplierValue(): number {
    return this.suppliers.reduce((sum, s) => sum + s.totalValue, 0);
  }

  getTotalCustomerValue(): number {
    return this.customers.reduce((sum, c) => sum + c.totalValue, 0);
  }
}