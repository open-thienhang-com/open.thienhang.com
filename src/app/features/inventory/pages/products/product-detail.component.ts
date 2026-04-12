import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProductService } from '../../services/inventory.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TagModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  loading = true;
  error: string | null = null;
  productId = '';
  product: any = null;
  
  thumbnailPreview: string | null = null;
  imagePreviews: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.productId) {
      this.error = 'Missing product id.';
      this.loading = false;
      return;
    }
    this.loadProduct();
  }

  loadProduct(): void {
    this.loading = true;
    this.error = null;
    this.productService.getProduct(this.productId).subscribe({
      next: (resp: any) => {
        this.product = resp?.data || null;
        this.signImages();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load product detail.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/products']);
  }

  getStatusSeverity(): 'success' | 'danger' {
    return this.product?.is_active ? 'success' : 'danger';
  }

  asCurrency(value: any): string {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  editProduct(): void {
    if (this.productId) {
      this.router.navigate(['/inventory/products', this.productId, 'edit']);
    }
  }

  private signImages(): void {
    if (!this.product) return;

    // Sign thumbnail
    if (this.product.thumbnail?.url && !this.product.thumbnail.url.startsWith('http')) {
      this.uploadService.getSignedUrl(this.product.thumbnail.url).subscribe(res => {
        if (res.success) this.thumbnailPreview = res.signed_url;
      });
    } else if (this.product.thumbnail?.url) {
      this.thumbnailPreview = this.product.thumbnail.url;
    }

    // Sign gallery
    if (this.product.images?.length) {
      this.imagePreviews = new Array(this.product.images.length).fill('');
      this.product.images.forEach((img: any, idx: number) => {
        if (img.url && !img.url.startsWith('http')) {
          this.uploadService.getSignedUrl(img.url).subscribe(res => {
            if (res.success) this.imagePreviews[idx] = res.signed_url;
          });
        } else if (img.url) {
          this.imagePreviews[idx] = img.url;
        }
      });
    }
  }
}

