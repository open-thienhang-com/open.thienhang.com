import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../../services/retail.service';

interface ProductCreateForm {
  sku: string;
  name: string;
  barcode: string;
  cost_price: number;
  selling_price: number;
  description: string;
  discount_price: number;
  category: string;
  subcategory: string;
  reorder_level: number;
  maximum_stock: number;
  supplier_id: string;
  is_active: boolean;
}

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextarea,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent {
  saving = false;

  categoryOptions = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Food & Beverage', value: 'food' },
    { label: 'Home & Garden', value: 'home' },
    { label: 'Sports', value: 'sports' },
    { label: 'Books', value: 'books' },
    { label: 'Other', value: 'other' }
  ];

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  form: ProductCreateForm = {
    sku: '',
    name: '',
    barcode: '',
    cost_price: 0,
    selling_price: 0,
    description: '',
    discount_price: 0,
    category: '',
    subcategory: '',
    reorder_level: 10,
    maximum_stock: 0,
    supplier_id: '',
    is_active: true
  };

  constructor(
    private router: Router,
    private messageService: MessageService,
    private productService: ProductService
  ) {}

  cancel(): void {
    this.router.navigate(['/retail/inventory/products']);
  }

  create(): void {
    if (!this.form.sku.trim() || !this.form.name.trim() || !this.form.barcode.trim() || !this.form.category) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'SKU, Name, Barcode and Category are required.'
      });
      return;
    }

    this.saving = true;
    this.productService.createProduct(this.form as any).subscribe({
      next: (resp: any) => {
        this.saving = false;
        const createdId = resp?.data?._id || resp?.data?.id;
        this.messageService.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Product created successfully.'
        });
        if (createdId) {
          this.router.navigate(['/retail/inventory/products', createdId]);
          return;
        }
        this.router.navigate(['/retail/inventory/products']);
      },
      error: (err: any) => {
        this.saving = false;
        const detail = err?.error?.message || 'Failed to create product.';
        this.messageService.add({
          severity: 'error',
          summary: 'Create Failed',
          detail
        });
      }
    });
  }
}
