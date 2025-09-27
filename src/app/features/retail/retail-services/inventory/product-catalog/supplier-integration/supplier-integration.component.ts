import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  totalProducts: number;
  lastSync: Date;
  createdAt: Date;
}

interface SupplierProduct {
  id: number;
  supplierId: number;
  productId: number;
  supplierProductCode: string;
  supplierProductName: string;
  supplierPrice: number;
  moq: number; // Minimum Order Quantity
  leadTime: number; // in days
  isActive: boolean;
  lastUpdated: Date;
}

interface SyncJob {
  id: number;
  supplierId: number;
  supplierName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  startTime: Date;
  endTime?: Date;
  errors: string[];
}

@Component({
  selector: 'app-supplier-integration',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    ProgressBarModule,
    TabViewModule,
    FileUploadModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './supplier-integration.component.html',
  styleUrl: './supplier-integration.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class SupplierIntegrationComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  selectedSuppliers: Supplier[] = [];

  supplierProducts: SupplierProduct[] = [];
  filteredSupplierProducts: SupplierProduct[] = [];

  syncJobs: SyncJob[] = [];
  activeSyncJobs: SyncJob[] = [];

  supplierDialog: boolean = false;
  productDialog: boolean = false;
  syncDialog: boolean = false;
  submitted: boolean = false;

  supplier: Supplier = this.emptySupplier();
  supplierProduct: SupplierProduct = this.emptySupplierProduct();

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' }
  ];

  searchSupplierValue: string = '';
  selectedSupplierStatus: string = '';

  searchProductValue: string = '';
  selectedSupplierId: number = 0;

  activeTabIndex: number = 0;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.loadSuppliers();
    this.loadSupplierProducts();
    this.loadSyncJobs();
  }

  loadSuppliers() {
    // Mock data - replace with actual API call
    this.suppliers = [
      {
        id: 1,
        name: 'Global Electronics Ltd',
        code: 'GE001',
        contactPerson: 'John Smith',
        email: 'john@globalelectronics.com',
        phone: '+1-555-0101',
        address: '123 Tech Street, Silicon Valley, CA 94043',
        status: 'active',
        rating: 4.5,
        totalProducts: 1250,
        lastSync: new Date('2024-01-20'),
        createdAt: new Date('2023-06-15')
      },
      {
        id: 2,
        name: 'Fashion Forward Inc',
        code: 'FF002',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@fashionforward.com',
        phone: '+1-555-0102',
        address: '456 Style Avenue, New York, NY 10001',
        status: 'active',
        rating: 4.2,
        totalProducts: 890,
        lastSync: new Date('2024-01-19'),
        createdAt: new Date('2023-08-20')
      },
      {
        id: 3,
        name: 'Home & Garden Supplies',
        code: 'HG003',
        contactPerson: 'Mike Wilson',
        email: 'mike@homegarden.com',
        phone: '+1-555-0103',
        address: '789 Garden Lane, Denver, CO 80202',
        status: 'inactive',
        rating: 3.8,
        totalProducts: 567,
        lastSync: new Date('2024-01-10'),
        createdAt: new Date('2023-09-10')
      }
    ];
    this.filteredSuppliers = [...this.suppliers];
  }

  loadSupplierProducts() {
    // Mock data - replace with actual API call
    this.supplierProducts = [
      {
        id: 1,
        supplierId: 1,
        productId: 1,
        supplierProductCode: 'GE-LAPTOP-001',
        supplierProductName: 'Business Laptop Pro',
        supplierPrice: 899.99,
        moq: 5,
        leadTime: 7,
        isActive: true,
        lastUpdated: new Date('2024-01-20')
      },
      {
        id: 2,
        supplierId: 1,
        productId: 2,
        supplierProductCode: 'GE-PHONE-002',
        supplierProductName: 'Smartphone Ultra',
        supplierPrice: 699.99,
        moq: 10,
        leadTime: 5,
        isActive: true,
        lastUpdated: new Date('2024-01-20')
      },
      {
        id: 3,
        supplierId: 2,
        productId: 3,
        supplierProductCode: 'FF-TSHIRT-001',
        supplierProductName: 'Cotton T-Shirt',
        supplierPrice: 12.99,
        moq: 50,
        leadTime: 14,
        isActive: true,
        lastUpdated: new Date('2024-01-19')
      }
    ];
    this.filteredSupplierProducts = [...this.supplierProducts];
  }

  loadSyncJobs() {
    // Mock data - replace with actual API call
    this.syncJobs = [
      {
        id: 1,
        supplierId: 1,
        supplierName: 'Global Electronics Ltd',
        status: 'completed',
        progress: 100,
        totalItems: 1250,
        processedItems: 1250,
        startTime: new Date('2024-01-20T10:00:00'),
        endTime: new Date('2024-01-20T10:30:00'),
        errors: []
      },
      {
        id: 2,
        supplierId: 2,
        supplierName: 'Fashion Forward Inc',
        status: 'running',
        progress: 65,
        totalItems: 890,
        processedItems: 578,
        startTime: new Date('2024-01-21T09:00:00'),
        errors: []
      }
    ];
    this.activeSyncJobs = this.syncJobs.filter(job => job.status === 'running' || job.status === 'pending');
  }

  filterSuppliers() {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      const matchesSearch = !this.searchSupplierValue ||
        supplier.name.toLowerCase().includes(this.searchSupplierValue.toLowerCase()) ||
        supplier.code.toLowerCase().includes(this.searchSupplierValue.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(this.searchSupplierValue.toLowerCase());

      const matchesStatus = !this.selectedSupplierStatus || supplier.status === this.selectedSupplierStatus;

      return matchesSearch && matchesStatus;
    });
  }

  filterSupplierProducts() {
    this.filteredSupplierProducts = this.supplierProducts.filter(product => {
      const matchesSearch = !this.searchProductValue ||
        product.supplierProductName.toLowerCase().includes(this.searchProductValue.toLowerCase()) ||
        product.supplierProductCode.toLowerCase().includes(this.searchProductValue.toLowerCase());

      const matchesSupplier = !this.selectedSupplierId || product.supplierId === this.selectedSupplierId;

      return matchesSearch && matchesSupplier;
    });
  }

  onSupplierSearchChange() {
    this.filterSuppliers();
  }

  onSupplierStatusFilterChange() {
    this.filterSuppliers();
  }

  onProductSearchChange() {
    this.filterSupplierProducts();
  }

  onSupplierFilterChange() {
    this.filterSupplierProducts();
  }

  openNewSupplier() {
    this.supplier = this.emptySupplier();
    this.submitted = false;
    this.supplierDialog = true;
  }

  editSupplier(supplier: Supplier) {
    this.supplier = { ...supplier };
    this.supplierDialog = true;
  }

  deleteSupplier(supplier: Supplier) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete supplier "${supplier.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.suppliers = this.suppliers.filter(val => val.id !== supplier.id);
        this.filteredSuppliers = this.filteredSuppliers.filter(val => val.id !== supplier.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Supplier Deleted',
          life: 3000
        });
      }
    });
  }

  openNewSupplierProduct() {
    this.supplierProduct = this.emptySupplierProduct();
    this.submitted = false;
    this.productDialog = true;
  }

  editSupplierProduct(product: SupplierProduct) {
    this.supplierProduct = { ...product };
    this.productDialog = true;
  }

  deleteSupplierProduct(product: SupplierProduct) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete supplier product "${product.supplierProductName}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.supplierProducts = this.supplierProducts.filter(val => val.id !== product.id);
        this.filteredSupplierProducts = this.filteredSupplierProducts.filter(val => val.id !== product.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Supplier Product Deleted',
          life: 3000
        });
      }
    });
  }

  startSync(supplier: Supplier) {
    const syncJob: SyncJob = {
      id: this.createId(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: 'running',
      progress: 0,
      totalItems: supplier.totalProducts,
      processedItems: 0,
      startTime: new Date(),
      errors: []
    };

    this.syncJobs.unshift(syncJob);
    this.activeSyncJobs.unshift(syncJob);

    // Simulate sync progress
    this.simulateSyncProgress(syncJob);

    this.messageService.add({
      severity: 'info',
      summary: 'Sync Started',
      detail: `Syncing products from ${supplier.name}`,
      life: 3000
    });
  }

  private simulateSyncProgress(syncJob: SyncJob) {
    const interval = setInterval(() => {
      syncJob.processedItems += Math.floor(Math.random() * 10) + 1;
      syncJob.progress = Math.min((syncJob.processedItems / syncJob.totalItems) * 100, 100);

      if (syncJob.processedItems >= syncJob.totalItems) {
        syncJob.status = 'completed';
        syncJob.endTime = new Date();
        clearInterval(interval);

        // Update supplier last sync
        const supplier = this.suppliers.find(s => s.id === syncJob.supplierId);
        if (supplier) {
          supplier.lastSync = new Date();
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Sync Completed',
          detail: `Successfully synced ${syncJob.totalItems} products from ${syncJob.supplierName}`,
          life: 5000
        });
      }
    }, 500);
  }

  hideSupplierDialog() {
    this.supplierDialog = false;
    this.submitted = false;
  }

  hideProductDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveSupplier() {
    this.submitted = true;

    if (this.supplier.name.trim() && this.supplier.code.trim()) {
      if (this.supplier.id) {
        // Update existing supplier
        const index = this.suppliers.findIndex(s => s.id === this.supplier.id);
        if (index !== -1) {
          this.suppliers[index] = this.supplier;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Supplier Updated',
            life: 3000
          });
        }
      } else {
        // Create new supplier
        this.supplier.id = this.createId();
        this.supplier.createdAt = new Date();
        this.suppliers.push(this.supplier);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Supplier Created',
          life: 3000
        });
      }

      this.filterSuppliers();
      this.supplierDialog = false;
      this.supplier = this.emptySupplier();
    }
  }

  saveSupplierProduct() {
    this.submitted = true;

    if (this.supplierProduct.supplierProductName.trim() && this.supplierProduct.supplierProductCode.trim()) {
      if (this.supplierProduct.id) {
        // Update existing product
        const index = this.supplierProducts.findIndex(p => p.id === this.supplierProduct.id);
        if (index !== -1) {
          this.supplierProduct.lastUpdated = new Date();
          this.supplierProducts[index] = this.supplierProduct;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Supplier Product Updated',
            life: 3000
          });
        }
      } else {
        // Create new product
        this.supplierProduct.id = this.createId();
        this.supplierProduct.lastUpdated = new Date();
        this.supplierProducts.push(this.supplierProduct);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Supplier Product Created',
          life: 3000
        });
      }

      this.filterSupplierProducts();
      this.productDialog = false;
      this.supplierProduct = this.emptySupplierProduct();
    }
  }

  toggleSupplierStatus(supplier: Supplier) {
    supplier.status = supplier.status === 'active' ? 'inactive' : 'active';
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: `Supplier ${supplier.status === 'active' ? 'Activated' : 'Deactivated'}`,
      life: 3000
    });
  }

  toggleProductStatus(product: SupplierProduct) {
    product.isActive = !product.isActive;
    product.lastUpdated = new Date();
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: `Product ${product.isActive ? 'Activated' : 'Deactivated'}`,
      life: 3000
    });
  }

  onFileUpload(event: any) {
    // Handle bulk import
    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: 'Processing supplier catalog import...',
      life: 3000
    });
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warning';
      case 'running': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusIconClass(status: string): string {
    switch (status) {
      case 'running': return 'pi pi-spin pi-spinner';
      case 'completed': return 'pi pi-check-circle';
      case 'failed': return 'pi pi-times-circle';
      default: return 'pi pi-clock';
    }
  }

  getSupplierStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      default: return 'Pending';
    }
  }

  getSupplierStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'warning';
    }
  }

  getSupplierTooltip(status: string): string {
    return status === 'active' ? 'Deactivate' : 'Activate';
  }

  getProductStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getProductStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getProductTooltip(isActive: boolean): string {
    return isActive ? 'Deactivate' : 'Activate';
  }

  getSyncStatusLabel(status: string): string {
    switch (status) {
      case 'running': return 'Running';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Pending';
    }
  }

  formatEndTime(endTime?: Date): string {
    return endTime ? this.datePipe.transform(endTime, 'short')! : '-';
  }

  getCompletedSyncJobsCount(): number {
    return this.syncJobs.filter(j => j.status === 'completed').length;
  }

  getFailedSyncJobsCount(): number {
    return this.syncJobs.filter(j => j.status === 'failed').length;
  }

  private createId(): number {
    const allIds = [
      ...this.suppliers.map(s => s.id),
      ...this.supplierProducts.map(p => p.id),
      ...this.syncJobs.map(j => j.id)
    ];
    let id = 1;
    while (allIds.includes(id)) {
      id++;
    }
    return id;
  }

  private emptySupplier(): Supplier {
    return {
      id: 0,
      name: '',
      code: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      rating: 0,
      totalProducts: 0,
      lastSync: new Date(),
      createdAt: new Date()
    };
  }

  private emptySupplierProduct(): SupplierProduct {
    return {
      id: 0,
      supplierId: this.selectedSupplierId || 0,
      productId: 0,
      supplierProductCode: '',
      supplierProductName: '',
      supplierPrice: 0,
      moq: 1,
      leadTime: 1,
      isActive: true,
      lastUpdated: new Date()
    };
  }
}
