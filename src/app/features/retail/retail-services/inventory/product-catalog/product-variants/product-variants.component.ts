import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  name: string;
  type: 'size' | 'color' | 'style' | 'material' | 'flavor';
  value: string;
  priceAdjustment: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-product-variants',
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
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './product-variants.component.html',
  styleUrl: './product-variants.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ProductVariantsComponent implements OnInit {
  variants: ProductVariant[] = [];
  filteredVariants: ProductVariant[] = [];
  selectedVariants: ProductVariant[] = [];

  variantDialog: boolean = false;
  submitted: boolean = false;
  variant: ProductVariant = this.emptyVariant();

  variantTypes = [
    { label: 'Size', value: 'size' },
    { label: 'Color', value: 'color' },
    { label: 'Style', value: 'style' },
    { label: 'Material', value: 'material' },
    { label: 'Flavor', value: 'flavor' }
  ];

  searchValue: string = '';
  selectedType: string = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadVariants();
  }

  loadVariants() {
    // Mock data - replace with actual API call
    this.variants = [
      {
        id: 1,
        productId: 1,
        sku: 'TSHIRT-S',
        name: 'Small',
        type: 'size',
        value: 'S',
        priceAdjustment: 0,
        stockQuantity: 50,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        productId: 1,
        sku: 'TSHIRT-M',
        name: 'Medium',
        type: 'size',
        value: 'M',
        priceAdjustment: 5,
        stockQuantity: 75,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 3,
        productId: 1,
        sku: 'TSHIRT-L',
        name: 'Large',
        type: 'size',
        value: 'L',
        priceAdjustment: 10,
        stockQuantity: 60,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 4,
        productId: 2,
        sku: 'JEANS-BLUE-32',
        name: 'Blue - 32"',
        type: 'color',
        value: 'Blue',
        priceAdjustment: 0,
        stockQuantity: 30,
        isActive: true,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      },
      {
        id: 5,
        productId: 2,
        sku: 'JEANS-BLACK-32',
        name: 'Black - 32"',
        type: 'color',
        value: 'Black',
        priceAdjustment: 15,
        stockQuantity: 25,
        isActive: true,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      }
    ];
    this.filteredVariants = [...this.variants];
  }

  filterVariants() {
    this.filteredVariants = this.variants.filter(variant => {
      const matchesSearch = !this.searchValue ||
        variant.name.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        variant.sku.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        variant.value.toLowerCase().includes(this.searchValue.toLowerCase());

      const matchesType = !this.selectedType || variant.type === this.selectedType;

      return matchesSearch && matchesType;
    });
  }

  onSearchChange() {
    this.filterVariants();
  }

  onTypeFilterChange() {
    this.filterVariants();
  }

  openNew() {
    this.variant = this.emptyVariant();
    this.submitted = false;
    this.variantDialog = true;
  }

  editVariant(variant: ProductVariant) {
    this.variant = { ...variant };
    this.variantDialog = true;
  }

  deleteVariant(variant: ProductVariant) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete variant "${variant.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.variants = this.variants.filter(val => val.id !== variant.id);
        this.filteredVariants = this.filteredVariants.filter(val => val.id !== variant.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Variant Deleted',
          life: 3000
        });
      }
    });
  }

  hideDialog() {
    this.variantDialog = false;
    this.submitted = false;
  }

  saveVariant() {
    this.submitted = true;

    if (this.variant.name.trim() && this.variant.sku.trim()) {
      if (this.variant.id) {
        // Update existing variant
        const index = this.variants.findIndex(v => v.id === this.variant.id);
        if (index !== -1) {
          this.variant.updatedAt = new Date();
          this.variants[index] = this.variant;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Variant Updated',
            life: 3000
          });
        }
      } else {
        // Create new variant
        this.variant.id = this.createId();
        this.variant.createdAt = new Date();
        this.variant.updatedAt = new Date();
        this.variants.push(this.variant);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Variant Created',
          life: 3000
        });
      }

      this.filterVariants();
      this.variantDialog = false;
      this.variant = this.emptyVariant();
    }
  }

  toggleActive(variant: ProductVariant) {
    variant.isActive = !variant.isActive;
    variant.updatedAt = new Date();
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: `Variant ${variant.isActive ? 'Activated' : 'Deactivated'}`,
      life: 3000
    });
  }

  private createId(): number {
    let id = 1;
    while (this.variants.some(v => v.id === id)) {
      id++;
    }
    return id;
  }

  private emptyVariant(): ProductVariant {
    return {
      id: 0,
      productId: 0,
      sku: '',
      name: '',
      type: 'size',
      value: '',
      priceAdjustment: 0,
      stockQuantity: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  getTypeLabel(type: string): string {
    const typeOption = this.variantTypes.find(t => t.value === type);
    return typeOption ? typeOption.label : type;
  }

  getStatusSeverity(status: boolean): string {
    return status ? 'success' : 'danger';
  }

  getStatusLabel(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }
}
