import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextarea } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Movement {
  id: string;
  type: 'inbound' | 'outbound';
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reference: string; // PO number, SO number, etc.
  supplier?: string;
  customer?: string;
  location: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  attachments?: File[];
}

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputTextarea,
    BadgeModule,
    CardModule,
    TabViewModule,
    FileUploadModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './movements.component.html',
  styleUrl: './movements.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class MovementsComponent implements OnInit {
  movements: Movement[] = [];
  filteredMovements: Movement[] = [];
  showMovementDialog = false;
  editingMovement: Movement | null = null;
  activeTabIndex = 0;

  // Filters
  searchTerm = '';
  selectedType: string = '';
  selectedStatus: string = '';
  selectedDateRange: Date[] = [];

  // Form data
  movementTypes = [
    { label: 'Inbound (Purchase)', value: 'inbound' },
    { label: 'Outbound (Sales)', value: 'outbound' }
  ];

  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Mock data for products, suppliers, customers
  products = [
    { id: '1', name: 'Product A', sku: 'SKU001' },
    { id: '2', name: 'Product B', sku: 'SKU002' },
    { id: '3', name: 'Product C', sku: 'SKU003' }
  ];

  suppliers = [
    { id: '1', name: 'Supplier A', contact: 'supplierA@example.com' },
    { id: '2', name: 'Supplier B', contact: 'supplierB@example.com' }
  ];

  customers = [
    { id: '1', name: 'Customer A', contact: 'customerA@example.com' },
    { id: '2', name: 'Customer B', contact: 'customerB@example.com' }
  ];

  locations = [
    { id: '1', name: 'Warehouse A' },
    { id: '2', name: 'Warehouse B' },
    { id: '3', name: 'Store Front' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    // Mock data - replace with actual API call
    this.movements = [
      {
        id: '1',
        type: 'inbound',
        productId: '1',
        productName: 'Product A',
        quantity: 100,
        unitPrice: 10.50,
        totalValue: 1050.00,
        reference: 'PO-2024-001',
        supplier: 'Supplier A',
        location: 'Warehouse A',
        date: new Date('2024-09-25'),
        status: 'confirmed',
        notes: 'Regular stock replenishment'
      },
      {
        id: '2',
        type: 'outbound',
        productId: '2',
        productName: 'Product B',
        quantity: 25,
        unitPrice: 15.00,
        totalValue: 375.00,
        reference: 'SO-2024-001',
        customer: 'Customer A',
        location: 'Store Front',
        date: new Date('2024-09-24'),
        status: 'confirmed',
        notes: 'Customer order fulfillment'
      },
      {
        id: '3',
        type: 'inbound',
        productId: '3',
        productName: 'Product C',
        quantity: 50,
        unitPrice: 8.75,
        totalValue: 437.50,
        reference: 'PO-2024-002',
        supplier: 'Supplier B',
        location: 'Warehouse B',
        date: new Date('2024-09-26'),
        status: 'pending',
        notes: 'New product introduction'
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredMovements = this.movements.filter(movement => {
      const matchesSearch = !this.searchTerm ||
        movement.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        movement.reference.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType = !this.selectedType || movement.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || movement.status === this.selectedStatus;

      let matchesDate = true;
      if (this.selectedDateRange && this.selectedDateRange.length === 2) {
        const movementDate = new Date(movement.date);
        matchesDate = movementDate >= this.selectedDateRange[0] && movementDate <= this.selectedDateRange[1];
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.selectedDateRange = [];
    this.applyFilters();
  }

  createMovement() {
    this.editingMovement = {
      id: '',
      type: 'inbound',
      productId: '',
      productName: '',
      quantity: 0,
      unitPrice: 0,
      totalValue: 0,
      reference: '',
      location: '',
      date: new Date(),
      status: 'pending'
    };
    this.showMovementDialog = true;
  }

  editMovement(movement: Movement) {
    this.editingMovement = { ...movement };
    this.showMovementDialog = true;
  }

  saveMovement() {
    if (!this.editingMovement) return;

    // Calculate total value
    this.editingMovement.totalValue = this.editingMovement.quantity * this.editingMovement.unitPrice;

    if (this.editingMovement.id) {
      // Update existing
      const index = this.movements.findIndex(m => m.id === this.editingMovement!.id);
      if (index !== -1) {
        this.movements[index] = { ...this.editingMovement! };
      }
    } else {
      // Add new
      this.editingMovement.id = Date.now().toString();
      this.movements.unshift({ ...this.editingMovement! });
    }

    this.applyFilters();
    this.showMovementDialog = false;
    this.editingMovement = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Movement saved successfully'
    });
  }

  cancelEdit() {
    this.showMovementDialog = false;
    this.editingMovement = null;
  }

  deleteMovement(movement: Movement) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this ${movement.type} movement?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.movements = this.movements.filter(m => m.id !== movement.id);
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Movement deleted successfully'
        });
      }
    });
  }

  confirmMovement(movement: Movement) {
    movement.status = 'confirmed';
    this.applyFilters();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Movement confirmed successfully'
    });
  }

  cancelMovement(movement: Movement) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this movement?',
      header: 'Confirm Cancellation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        movement.status = 'cancelled';
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Movement cancelled successfully'
        });
      }
    });
  }

  getMovementSeverity(type: string): string {
    switch (type) {
      case 'inbound': return 'success';
      case 'outbound': return 'warning';
      default: return 'info';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
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

  onProductChange() {
    if (this.editingMovement && this.editingMovement.productId) {
      const product = this.products.find(p => p.id === this.editingMovement!.productId);
      if (product) {
        this.editingMovement.productName = product.name;
      }
    }
  }

  onQuantityChange() {
    if (this.editingMovement) {
      this.editingMovement.totalValue = this.editingMovement.quantity * this.editingMovement.unitPrice;
    }
  }

  onUnitPriceChange() {
    if (this.editingMovement) {
      this.editingMovement.totalValue = this.editingMovement.quantity * this.editingMovement.unitPrice;
    }
  }

  exportMovements() {
    // Implement export functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Export functionality will be implemented'
    });
  }

  refreshData() {
    this.loadMovements();
    this.messageService.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: 'Data refreshed successfully'
    });
  }

  getInboundCount(): number {
    return this.movements.filter(m => m.type === 'inbound').length;
  }

  getOutboundCount(): number {
    return this.movements.filter(m => m.type === 'outbound').length;
  }

  getPendingCount(): number {
    return this.movements.filter(m => m.status === 'pending').length;
  }

  getTotalValue(): number {
    return this.movements.reduce((sum, m) => sum + m.totalValue, 0);
  }
}
