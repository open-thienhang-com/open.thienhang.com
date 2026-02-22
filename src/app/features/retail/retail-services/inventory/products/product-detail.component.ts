import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProductService } from '../../../services/retail.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
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
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load product detail.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/retail/inventory/products']);
  }

  getStatusSeverity(): 'success' | 'danger' {
    return this.product?.is_active ? 'success' : 'danger';
  }

  asCurrency(value: any): string {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}

