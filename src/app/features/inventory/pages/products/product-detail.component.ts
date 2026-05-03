import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService, InventoryService } from '../../services/inventory.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    ButtonModule, TagModule, DialogModule, DropdownModule,
    InputNumberModule, InputTextModule, TableModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  loading = true;
  error: string | null = null;
  productId = '';
  product: any = null;

  thumbnailPreview: string | null = null;
  imagePreviews: string[] = [];

  // Stock adjustment
  showAdjustDialog = false;
  adjustForm = { warehouse_id: '', quantity_change: 0, movement_type: 'inbound', reason: '' };
  adjustSubmitting = false;
  adjustError: string | null = null;

  // Warehouses for dropdown
  warehouses: any[] = [];

  // Movement history
  movements: any[] = [];
  movementsLoading = false;

  movementTypeOptions = [
    { label: 'Inbound', value: 'inbound' },
    { label: 'Outbound', value: 'outbound' },
    { label: 'Adjustment', value: 'adjustment' },
    { label: 'Damage', value: 'damage' },
    { label: 'Loss', value: 'loss' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private uploadService: UploadService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.productId) {
      this.error = 'Missing product id.';
      this.loading = false;
      return;
    }
    this.loadProduct();
    this.loadMovements();
    this.loadWarehouses();
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

  loadMovements(): void {
    this.movementsLoading = true;
    this.inventoryService.getStockMovementHistory(this.productId, 0, 50).subscribe({
      next: (res: any) => { this.movements = res.data || []; this.movementsLoading = false; },
      error: () => { this.movementsLoading = false; }
    });
  }

  loadWarehouses(): void {
    this.inventoryService.getAllWarehouses().subscribe({
      next: (res: any) => {
        this.warehouses = (res.data || []).map((w: any) => ({
          label: w.warehouse_name || w.name || w._id,
          value: w._id || w.warehouse_id
        }));
      },
      error: () => {}
    });
  }

  openAdjustDialog(): void {
    this.adjustForm = { warehouse_id: this.warehouses[0]?.value || '', quantity_change: 0, movement_type: 'inbound', reason: '' };
    this.adjustError = null;
    this.showAdjustDialog = true;
  }

  submitAdjustment(): void {
    if (!this.adjustForm.warehouse_id || this.adjustForm.quantity_change === 0 || !this.adjustForm.reason) {
      this.adjustError = 'Please fill in all required fields and enter a non-zero quantity.';
      return;
    }
    this.adjustSubmitting = true;
    this.adjustError = null;
    this.inventoryService.updateStock({
      product_id: this.productId,
      warehouse_id: this.adjustForm.warehouse_id,
      quantity_change: this.adjustForm.quantity_change,
      movement_type: this.adjustForm.movement_type as any,
      notes: this.adjustForm.reason,
      reason: this.adjustForm.reason,
    }).subscribe({
      next: () => {
        this.adjustSubmitting = false;
        this.showAdjustDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Stock Updated', detail: 'Stock adjustment recorded' });
        this.loadMovements();
      },
      error: (err: any) => {
        this.adjustSubmitting = false;
        this.adjustError = err?.error?.detail || err?.message || 'Failed to update stock.';
      }
    });
  }

  getMovementSeverity(type: string): 'success' | 'danger' | 'warning' | 'info' | 'secondary' {
    switch (type) {
      case 'inbound': return 'success';
      case 'outbound': return 'danger';
      case 'adjustment': return 'info';
      case 'damage': case 'loss': return 'warning';
      default: return 'secondary';
    }
  }

  goBack(): void { this.router.navigate(['/inventory/products']); }

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
    if (this.product.thumbnail?.url && !this.product.thumbnail.url.startsWith('http')) {
      this.uploadService.getSignedUrl(this.product.thumbnail.url).subscribe(res => {
        if (res.success) this.thumbnailPreview = res.signed_url;
      });
    } else if (this.product.thumbnail?.url) {
      this.thumbnailPreview = this.product.thumbnail.url;
    }
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
