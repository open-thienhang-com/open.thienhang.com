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
import { ProductService } from '../../services/inventory.service';
import { UploadService } from '../../services/upload.service';
import { ImageObject } from '../../models/inventory.models';

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
  thumbnail: ImageObject | null;
  images: ImageObject[];
  category_ids: string[];
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
    is_active: true,
    thumbnail: null,
    images: [],
    category_ids: []
  };

  thumbnailPreview: string | null = null;
  imagePreviews: string[] = [];
  uploadingThumbnail = false;
  uploadingGallery = false;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private productService: ProductService,
    private uploadService: UploadService
  ) {
    this.generateRandomDefaults();
  }

  cancel(): void {
    this.router.navigate(['/inventory/products']);
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
          this.router.navigate(['/inventory/products', createdId]);
          return;
        }
        this.router.navigate(['/inventory/products']);
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

  onThumbnailSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingThumbnail = true;
    this.uploadService.uploadImage(file).subscribe({
      next: (resp) => {
        const key = resp.metadata.key;
        this.form.thumbnail = {
          url: key,
          alt: file.name,
          is_primary: true,
          sort_order: 0
        };
        
        // Fetch signed URL for preview
        this.uploadService.getSignedUrl(key).subscribe(signedResp => {
          this.thumbnailPreview = signedResp.signed_url;
          this.uploadingThumbnail = false;
        });
      },
      error: (err) => {
        this.uploadingThumbnail = false;
        this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: 'Failed to upload thumbnail.' });
      }
    });
  }

  onImagesSelected(event: any): void {
    const files = Array.from(event.target.files as FileList);
    if (!files.length) return;

    this.uploadingGallery = true;
    let uploadedCount = 0;

    files.forEach(file => {
      this.uploadService.uploadImage(file).subscribe({
        next: (resp) => {
          const key = resp.metadata.key;
          const imgObj: ImageObject = {
            url: key,
            alt: file.name,
            is_primary: false,
            sort_order: this.form.images.length
          };
          this.form.images.push(imgObj);

          // Get signed URL for preview
          this.uploadService.getSignedUrl(key).subscribe(signedResp => {
            this.imagePreviews.push(signedResp.signed_url);
            uploadedCount++;
            if (uploadedCount === files.length) {
              this.uploadingGallery = false;
            }
          });
        },
        error: (err) => {
          uploadedCount++;
          if (uploadedCount === files.length) {
            this.uploadingGallery = false;
          }
          this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: `Failed to upload ${file.name}` });
        }
      });
    });
  }

  removeImage(index: number): void {
    this.form.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  generateRandomDefaults(): void {
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const categories = this.categoryOptions.map(c => c.value);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    
    this.form = {
      ...this.form,
      sku: `SKU-${randomSuffix}`,
      name: `Sample Product ${randomSuffix}`,
      barcode: `BC-${randomSuffix}`,
      cost_price: Math.floor(Math.random() * 50) + 10,
      selling_price: Math.floor(Math.random() * 100) + 60,
      description: 'Automatically generated sample product for testing purposes.',
      category: selectedCategory,
      category_ids: [selectedCategory],
      subcategory: 'General',
      reorder_level: 15,
      maximum_stock: 500,
      supplier_id: 'SUPP-001',
      is_active: true
    };
  }
}
