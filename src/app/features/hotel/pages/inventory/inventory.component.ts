import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  location?: string;
  supplier?: string;
  lastRestocked?: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

@Component({
  selector: 'app-hotel-inventory',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputNumberModule,
    DropdownModule, TableModule, BadgeModule, ToastModule, SkeletonModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  loading = false;
  
  searchTerm = '';
  selectedCategory: string | null = null;
  selectedStatus: string | null = null;
  
  showDialog = false;
  isEditMode = false;
  selectedItem: InventoryItem | null = null;
  
  formData: Partial<InventoryItem> = {
    category: 'general',
    unit: 'pcs',
    status: 'in_stock'
  };

  categoryOptions = [
    { label: 'All Categories', value: null },
    { label: 'Linens', value: 'linens' },
    { label: 'Toiletries', value: 'toiletries' },
    { label: 'Cleaning Supplies', value: 'cleaning' },
    { label: 'Kitchen Supplies', value: 'kitchen' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'General', value: 'general' }
  ];

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'In Stock', value: 'in_stock' },
    { label: 'Low Stock', value: 'low_stock' },
    { label: 'Out of Stock', value: 'out_of_stock' }
  ];

  unitOptions = [
    { label: 'Pieces', value: 'pcs' },
    { label: 'Boxes', value: 'boxes' },
    { label: 'Bottles', value: 'bottles' },
    { label: 'Rolls', value: 'rolls' },
    { label: 'Sets', value: 'sets' }
  ];

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    // Generate sample inventory items
    setTimeout(() => {
      this.items = [
        {
          id: 'INV-001',
          name: 'Towels',
          category: 'linens',
          quantity: 150,
          unit: 'pcs',
          minStock: 50,
          maxStock: 200,
          location: 'Storage Room A',
          supplier: 'Textile Co.',
          lastRestocked: new Date(Date.now() - 7 * 86400000),
          status: 'in_stock'
        },
        {
          id: 'INV-002',
          name: 'Shampoo',
          category: 'toiletries',
          quantity: 25,
          unit: 'bottles',
          minStock: 30,
          maxStock: 100,
          location: 'Storage Room B',
          supplier: 'Beauty Supplies Inc.',
          lastRestocked: new Date(Date.now() - 14 * 86400000),
          status: 'low_stock'
        },
        {
          id: 'INV-003',
          name: 'Cleaning Solution',
          category: 'cleaning',
          quantity: 0,
          unit: 'bottles',
          minStock: 10,
          maxStock: 50,
          location: 'Storage Room A',
          supplier: 'Clean Pro',
          lastRestocked: new Date(Date.now() - 30 * 86400000),
          status: 'out_of_stock'
        },
        {
          id: 'INV-004',
          name: 'Coffee Pods',
          category: 'kitchen',
          quantity: 500,
          unit: 'pcs',
          minStock: 200,
          maxStock: 1000,
          location: 'Kitchen Storage',
          supplier: 'Coffee Co.',
          lastRestocked: new Date(Date.now() - 3 * 86400000),
          status: 'in_stock'
        }
      ];
      this.updateItemStatuses();
      this.filterItems();
      this.loading = false;
    }, 500);
  }

  updateItemStatuses(): void {
    this.items.forEach(item => {
      if (item.quantity === 0) {
        item.status = 'out_of_stock';
      } else if (item.quantity <= item.minStock) {
        item.status = 'low_stock';
      } else {
        item.status = 'in_stock';
      }
    });
  }

  filterItems(): void {
    let filtered = [...this.items];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.id.toLowerCase().includes(term) ||
        i.name.toLowerCase().includes(term) ||
        (i.location && i.location.toLowerCase().includes(term))
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(i => i.category === this.selectedCategory);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(i => i.status === this.selectedStatus);
    }

    this.filteredItems = filtered;
  }

  onSearch(): void {
    this.filterItems();
  }

  onCategoryChange(): void {
    this.filterItems();
  }

  onStatusChange(): void {
    this.filterItems();
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = {
      category: 'general',
      unit: 'pcs',
      status: 'in_stock',
      minStock: 10,
      maxStock: 100
    };
    this.showDialog = true;
  }

  editItem(item: InventoryItem): void {
    this.isEditMode = true;
    this.selectedItem = item;
    this.formData = { ...item };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedItem = null;
    this.formData = {
      category: 'general',
      unit: 'pcs',
      status: 'in_stock'
    };
  }

  saveItem(): void {
    if (!this.formData.name || this.formData.quantity === undefined) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    if (this.isEditMode && this.selectedItem) {
      const index = this.items.findIndex(i => i.id === this.selectedItem!.id);
      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          ...this.formData
        } as InventoryItem;
        this.updateItemStatuses();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Inventory item updated'
        });
      }
    } else {
      const newItem: InventoryItem = {
        id: `INV-${Date.now()}`,
        name: this.formData.name!,
        category: this.formData.category || 'general',
        quantity: this.formData.quantity || 0,
        unit: this.formData.unit || 'pcs',
        minStock: this.formData.minStock || 10,
        maxStock: this.formData.maxStock || 100,
        location: this.formData.location,
        supplier: this.formData.supplier,
        lastRestocked: new Date(),
        status: 'in_stock'
      };
      this.items.push(newItem);
      this.updateItemStatuses();
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Inventory item created'
      });
    }

    this.filterItems();
    this.closeDialog();
  }

  restockItem(item: InventoryItem, quantity: number): void {
    item.quantity += quantity;
    item.lastRestocked = new Date();
    this.updateItemStatuses();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Restocked ${quantity} ${item.unit}`
    });
    this.filterItems();
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'in_stock': 'success',
      'low_stock': 'warning',
      'out_of_stock': 'danger'
    };
    return severityMap[status] || 'secondary';
  }

  getInStockItems(): number {
    return this.items.filter(i => i.status === 'in_stock').length;
  }

  getLowStockItems(): number {
    return this.items.filter(i => i.status === 'low_stock').length;
  }

  getOutOfStockItems(): number {
    return this.items.filter(i => i.status === 'out_of_stock').length;
  }
}
