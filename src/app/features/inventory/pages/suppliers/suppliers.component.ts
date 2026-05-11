import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextarea } from 'primeng/inputtextarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SupplierService } from '../../services/inventory.service';

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
    TagModule,
    BadgeModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextarea
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  filteredSuppliers: any[] = [];
  loading = false;
  total = 0;
  searchTerm = '';
  selectedStatus: any = null;
  showFilters = false;

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  // Create/Edit dialog
  showSupplierDialog = false;
  editingSupplier: any = null;
  createForm = { name: '', contact_name: '', email: '', phone: '', address: '', is_active: true };
  formSubmitted = false;
  createSaving = false;

  get activeCount(): number {
    return this.suppliers.filter(s => s.is_active !== false).length;
  }

  get inactiveCount(): number {
    return this.suppliers.filter(s => s.is_active === false).length;
  }

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private supplierService: SupplierService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.supplierService.listSuppliers(0, 100, this.searchTerm || undefined).subscribe({
      next: (res: any) => {
        this.suppliers = res.data || [];
        this.total = res.total || this.suppliers.length;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load suppliers' });
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.filteredSuppliers = this.suppliers.filter(s => {
      const matchesSearch = !this.searchTerm ||
        s.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (s.contact_name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === null || s.is_active === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.filteredSuppliers = [...this.suppliers];
  }

  getStatusLabel(isActive: boolean): string {
    return isActive !== false ? 'Active' : 'Inactive';
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive !== false ? 'success' : 'danger';
  }

  refreshData() {
    this.load();
    this.messageService.add({ severity: 'success', summary: 'Refreshed', detail: 'Data refreshed successfully' });
  }

  openCreateDialog() {
    this.editingSupplier = null;
    this.createForm = { name: '', contact_name: '', email: '', phone: '', address: '', is_active: true };
    this.formSubmitted = false;
    this.showSupplierDialog = true;
  }

  openEditDialog(supplier: any) {
    this.editingSupplier = supplier;
    this.createForm = {
      name: supplier.name || '',
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      is_active: supplier.is_active !== false
    };
    this.formSubmitted = false;
    this.showSupplierDialog = true;
  }

  saveSupplier() {
    this.formSubmitted = true;
    if (!this.createForm.name) return;

    this.createSaving = true;

    if (this.editingSupplier?.id) {
      this.supplierService.updateSupplier(this.editingSupplier.id, this.createForm).subscribe({
        next: () => {
          this.createSaving = false;
          this.showSupplierDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Supplier updated successfully' });
          this.load();
        },
        error: (err: any) => {
          this.createSaving = false;
          const msg = err?.error?.detail || 'Failed to update supplier';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        }
      });
    } else {
      this.supplierService.createSupplier(this.createForm).subscribe({
        next: () => {
          this.createSaving = false;
          this.showSupplierDialog = false;
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Supplier created successfully' });
          this.load();
        },
        error: (err: any) => {
          this.createSaving = false;
          const msg = err?.error?.detail || 'Failed to create supplier';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        }
      });
    }
  }

  cancelEdit() {
    this.showSupplierDialog = false;
    this.editingSupplier = null;
  }

  deleteSupplier(event: Event, supplier: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete supplier "${supplier.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.supplierService.deleteSupplier(supplier.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Supplier deleted successfully' });
            this.load();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete supplier' });
          }
        });
      }
    });
  }
}