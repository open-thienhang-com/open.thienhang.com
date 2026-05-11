import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../services/inventory.service';
import { UploadService } from '../../services/upload.service';
import { ImageObject, ProductCreateRequest } from '../../models/inventory.models';

interface ProductEditForm extends ProductCreateRequest {}

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextarea,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './product-edit.component.html',
  styleUrl: './products.component.scss' // Reuse styles
})
export class ProductEditComponent implements OnInit {
  productId = '';
  loading = true;
  saving = false;
  
  form: ProductEditForm = {
    sku: '',
    name: '',
    barcode: '',
    cost_price: 0,
    selling_price: 0,
    description: '',
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

  categoryOptions = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Food & Beverage', value: 'food' },
    { label: 'Home & Garden', value: 'home' },
    { label: 'Sports', value: 'sports' },
    { label: 'Books', value: 'books' }
  ];

  thumbnailPreview: string | null = null;
  imagePreviews: string[] = [];
  uploadingThumbnail = false;
  uploadingGallery = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private productService: ProductService,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.productId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing product ID' });
      this.router.navigate(['/inventory/products']);
      return;
    }
    this.loadProduct();
  }

  loadProduct(): void {
    this.loading = true;
    this.productService.getProduct(this.productId).subscribe({
      next: (resp: any) => {
        const prod = resp?.data;
        if (prod) {
          this.form = {
            sku: prod.sku || '',
            name: prod.name || '',
            barcode: prod.barcode || '',
            cost_price: prod.cost_price || 0,
            selling_price: prod.selling_price || prod.price || 0,
            description: prod.description || '',
            category: prod.category || '',
            subcategory: prod.subcategory || '',
            category_ids: prod.category_ids || [prod.category],
            reorder_level: prod.reorder_level || 10,
            maximum_stock: prod.maximum_stock || 0,
            supplier_id: prod.supplier_id || '',
            is_active: prod.is_active !== false,
            thumbnail: prod.thumbnail || null,
            images: prod.images || [],
            telnet: prod.telnet || 'retail'
          };
          this.signExistingImages();
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load product' });
      }
    });
  }

  signExistingImages(): void {
    // Sign thumbnail
    if (this.form.thumbnail?.url && !this.form.thumbnail.url.startsWith('http')) {
      this.uploadService.getSignedUrl(this.form.thumbnail.url).subscribe(res => {
        if (res.success) this.thumbnailPreview = res.signed_url;
      });
    } else if (this.form.thumbnail?.url) {
      this.thumbnailPreview = this.form.thumbnail.url;
    }

    // Sign gallery
    this.imagePreviews = new Array(this.form.images.length).fill('');
    this.form.images.forEach((img, idx) => {
      if (img.url && !img.url.startsWith('http')) {
        this.uploadService.getSignedUrl(img.url).subscribe(res => {
          if (res.success) this.imagePreviews[idx] = res.signed_url;
        });
      } else if (img.url) {
        this.imagePreviews[idx] = img.url;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/inventory/products']);
  }

  update(): void {
    if (!this.form.sku || !this.form.name) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'SKU and Name are required.' });
      return;
    }

    this.saving = true;
    // Map back URLs to keys for storage if they were signed (starts with http)
    // Actually, in the current implementation, we keep keys in the object and separate preview strings
    // So 'this.form.thumbnail.url' should already be the key unless I modified it.
    // Let's ensure consistency.
    
    this.productService.updateProduct(this.productId, this.form as any).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Product updated successfully.' });
        setTimeout(() => this.router.navigate(['/inventory/products']), 1000);
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: err?.error?.message || 'Failed to update.' });
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
        this.uploadService.getSignedUrl(key).subscribe(signedResp => {
          this.thumbnailPreview = signedResp.signed_url;
          this.uploadingThumbnail = false;
        });
      },
      error: () => {
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

          this.uploadService.getSignedUrl(key).subscribe(signedResp => {
            this.imagePreviews.push(signedResp.signed_url);
            uploadedCount++;
            if (uploadedCount === files.length) this.uploadingGallery = false;
          });
        },
        error: () => {
          uploadedCount++;
          if (uploadedCount === files.length) this.uploadingGallery = false;
          this.messageService.add({ severity: 'error', summary: 'Upload Failed', detail: `Failed to upload ${file.name}` });
        }
      });
    });
  }

  removeImage(index: number): void {
    this.form.images.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }
}
