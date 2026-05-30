import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductService, InventoryService } from '../../services/inventory.service';
import { UploadService } from '../../services/upload.service';
import { Product } from '../../models/inventory.models';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';



@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: any = null;
  loading = false;
  showFilters = false;

  categoryOptions = [
    { label: 'All Categories', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Food & Beverage', value: 'food' },
    { label: 'Home & Garden', value: 'home' },
    { label: 'Sports', value: 'sports' },
    { label: 'Books', value: 'books' }
  ];

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Discontinued', value: 'discontinued' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private uploadService: UploadService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    // Products and stocks live in separate collections; the products endpoint
    // does not return on-hand quantity, so we fetch stocks in parallel and
    // aggregate quantity-on-hand per product to drive the Stock / Total Value /
    // Status columns.
    // Backend caps page size at 100 (MAX_PAGE_SIZE); requesting more returns a
    // 400. Current catalog is well under 100 products/stocks.
    forkJoin({
      products: this.productService.listProducts(this.selectedCategory || undefined, 0, 100),
      stocks: this.inventoryService.listStocks(undefined, 0, 100).pipe(catchError(() => of({ data: [] } as any))),
    }).subscribe({
      next: ({ products, stocks }: any) => {
        const stockByProduct = this.buildStockMap(Array.isArray(stocks?.data) ? stocks.data : []);
        const apiProducts = Array.isArray(products?.data) ? products.data : [];
        this.products = apiProducts.map((item: any) => this.mapApiProduct(item, stockByProduct));
        this.signThumbnails();
        this.refreshCategoryOptionsFromProducts();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load products', error);
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products from API'
        });
      }
    });
  }

  /** Sum on-hand quantity per product id across all warehouses. */
  private buildStockMap(stocks: any[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const s of stocks) {
      const pid = String(s?.product_id ?? '');
      if (!pid) continue;
      const qty = Number(s?.quantity_on_hand ?? s?.quantity_available ?? s?.quantity ?? 0) || 0;
      map.set(pid, (map.get(pid) ?? 0) + qty);
    }
    return map;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || (product.is_active ? 'active' : 'inactive') === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = null;
    this.filteredProducts = [...this.products];
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active':
      case 'In Stock': return 'success';
      case 'inactive':
      case 'Low Stock': return 'warning';
      case 'discontinued':
      case 'Out of Stock': return 'danger';
      case 'Overstock': return 'info';
      default: return 'info';
    }
  }

  getProductStatus(product: Product): string {
    return product.is_active ? 'active' : 'inactive';
  }

  getStockStatus(product: Product): { status: string, severity: string } {
    const quantity = (product as any).quantity ?? 0;
    const minStock = product.reorder_level ?? 0;
    const maxStock = product.maximum_stock ?? 0;
    if (quantity === 0) {
      return { status: 'Out of Stock', severity: 'danger' };
    } else if (quantity <= minStock) {
      return { status: 'Low Stock', severity: 'warning' };
    } else if (maxStock > 0 && quantity >= maxStock) {
      return { status: 'Overstock', severity: 'info' };
    } else {
      return { status: 'In Stock', severity: 'success' };
    }
  }

  getCategoryLabel(category: string): string {
    const labels = {
      'electronics': 'Electronics',
      'clothing': 'Clothing',
      'food': 'Food & Beverage',
      'home': 'Home & Garden',
      'sports': 'Sports',
      'books': 'Books',
      // Fresh Retail (thienhang.com) seed categories
      'rau-cu-qua': 'Rau Củ Quả',
      'thit-ca': 'Thịt & Cá',
      'sua-trung': 'Sữa & Trứng',
      'banh-keo': 'Bánh Kẹo & Snack',
      'do-uong': 'Đồ Uống',
      'gia-vi': 'Gia Vị & Dầu Ăn',
      'thuc-pham-kho': 'Thực Phẩm Khô',
      'hoa-qua': 'Trái Cây'
    };
    return labels[category] || category;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  editProduct(product: Product) {
    if (!product?.id) return;
    this.router.navigate(['/inventory/products', product.id, 'edit']);
  }

  viewProduct(product: Product) {
    if (!product?.id) return;
    this.router.navigate(['/inventory/products', product.id]);
  }

  deleteProduct(event: Event, product: Product) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete product "${product.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.products = this.products.filter(p => p.id !== product.id);
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully'
        });
      }
    });
  }

  createProduct() {
    this.router.navigate(['/inventory/products/create']);
  }

  refreshData() {
    this.loadProducts();
    this.messageService.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: 'Data refreshed successfully'
    });
  }

  exportProducts() {
    this.productService.exportProductsCsv().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.messageService.add({ severity: 'success', summary: 'Export', detail: 'CSV downloaded' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Export', detail: 'Failed to export CSV' }),
    });
  }

  /** Triggered by the hidden file input; uploads the chosen CSV and reloads. */
  importProducts(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loading = true;
    this.productService.importProductsCsv(file).subscribe({
      next: (res: any) => {
        const s = res?.data ?? {};
        const errs = Array.isArray(s.errors) ? s.errors.length : 0;
        this.messageService.add({
          severity: errs ? 'warn' : 'success',
          summary: 'Import',
          detail: `Created ${s.products_created ?? 0}, updated ${s.products_updated ?? 0}, stock ${s.stock_updated ?? 0}` +
            (errs ? `, ${errs} error(s)` : ''),
        });
        this.loadProducts();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Import', detail: 'Failed to import CSV' });
      },
      complete: () => { input.value = ''; },
    });
  }

  getTotalProducts() {
    return this.products.length;
  }

  getLowStockProducts() {
    return this.products.filter(p => {
      const q = (p as any).quantity ?? 0;
      return q <= (p.reorder_level ?? 0) && q > 0;
    }).length;
  }

  getOutOfStockProducts() {
    return this.products.filter(p => ((p as any).quantity ?? 0) === 0).length;
  }

  getTotalValue() {
    return this.products.reduce((sum, product) => {
      const q = (product as any).quantity ?? 0;
      const p = product.selling_price ?? product.price ?? 0;
      return sum + (q * p);
    }, 0);
  }

  get filteredCategoryOptions() {
    return this.categoryOptions;
  }

  get productCategoryOptions() {
    return this.categoryOptions.filter(opt => opt.value !== '');
  }

  get filteredStatusOptions() {
    return this.statusOptions;
  }

  private mapApiProduct(item: any, stockByProduct?: Map<string, number>): Product {
    const id = String(item?._id ?? item?.id ?? '');
    const reorderLevel = Number(item?.reorder_level ?? 0);
    const maximumStock = Number(item?.maximum_stock ?? 0);
    const sellingPrice = Number(item?.selling_price ?? item?.price ?? 0);
    const quantity = Number(stockByProduct?.get(id) ?? item?.quantity ?? 0) || 0;

    const product: any = {
      id,
      name: String(item?.name ?? 'Unknown product'),
      sku: String(item?.sku ?? '-'),
      category: String(item?.category ?? 'other'),
      description: String(item?.description ?? ''),
      reorder_level: reorderLevel,
      maximum_stock: maximumStock,
      selling_price: sellingPrice,
      price: Number(item?.price ?? item?.selling_price ?? 0),
      cost_price: Number(item?.cost_price ?? 0),
      is_active: item?.is_active !== false,
      updated_at: item?.updated_at || new Date().toISOString(),
      barcode: item?.barcode ?? '',
      ...item, // Capture extra API fields
      // Derived view-model fields consumed by the template (camelCase).
      quantity,
      currentStock: quantity,
      minStock: reorderLevel,
      maxStock: maximumStock,
      unitPrice: sellingPrice,
      totalValue: quantity * sellingPrice,
    };
    product.status = this.getStockStatus(product).status;
    return product as Product;
  }

  private refreshCategoryOptionsFromProducts(): void {
    const dynamic = Array.from(
      new Set(
        this.products
          .map((p) => (p.category || '').trim())
          .filter((v) => !!v)
      )
    ).sort((a, b) => a.localeCompare(b));

    this.categoryOptions = [
      { label: 'All Categories', value: '' },
      ...dynamic.map((value) => ({ label: this.getCategoryLabel(value), value }))
    ];
  }

  private signThumbnails(): void {
    this.products.forEach(product => {
      if (product.thumbnail?.url && !product.thumbnail.url.startsWith('http')) {
        const key = product.thumbnail.url;
        this.uploadService.getSignedUrl(key).subscribe({
          next: (res) => {
            if (res.success && product.thumbnail) {
              product.thumbnail.url = res.signed_url;
            }
          },
          error: (err) => console.error(`Failed to sign thumbnail for ${product.id}`, err)
        });
      }
    });
  }
}
