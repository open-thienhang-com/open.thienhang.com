# Spec: Inventory Module

## Target Directory Structure

```
src/app/features/inventory/
├── models/
│   └── inventory.models.ts           ← Từ retail.models.ts (Product, Stock, Warehouse, etc.)
├── services/
│   └── inventory.service.ts          ← Từ retail.service.ts (ProductService, InventoryService, etc.)
├── pages/
│   ├── overview/                     ← Tạo mới (inventory dashboard tổng hợp)
│   │   └── inventory-overview.component.ts
│   ├── products/                     ← Move từ retail/retail-services/inventory/products/
│   │   ├── products.component.ts
│   │   ├── products.component.html
│   │   ├── products.component.scss
│   │   ├── product-create.component.ts
│   │   ├── product-create.component.html
│   │   ├── product-detail.component.ts
│   │   └── product-detail.component.html
│   ├── categories/                   ← Move từ retail/retail-services/inventory/categories/
│   │   ├── categories.component.ts
│   │   ├── categories.component.html
│   │   └── categories.component.scss
│   ├── warehouses/                   ← Move từ retail/retail-services/inventory/locations/
│   │   ├── warehouses.component.ts
│   │   └── warehouses.component.html
│   ├── suppliers/                    ← Move từ retail/retail-services/inventory/suppliers/
│   │   ├── suppliers.component.ts
│   │   ├── suppliers.component.html
│   │   └── suppliers.component.scss
│   ├── partners/                     ← Move từ retail/retail-services/inventory/partners/
│   │   ├── partners.component.ts
│   │   └── partners.component.html
│   ├── movements/                    ← Move từ retail/retail-services/inventory/movements/
│   │   └── movements.component.ts
│   ├── analytics/                    ← Move từ retail/retail-services/analytics/
│   │   └── analytics.component.ts
│   └── settings/                     ← Move từ retail/retail-services/inventory/settings/
│       ├── settings.component.ts
│       ├── settings.component.html
│       └── settings.component.scss
└── inventory.routes.ts               ← Tạo mới
```

---

## inventory.routes.ts

```typescript
import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/inventory-overview.component').then(m => m.InventoryOverviewComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
  },
  {
    path: 'products/create',
    loadComponent: () => import('./pages/products/product-create.component').then(m => m.ProductCreateComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/products/product-detail.component').then(m => m.ProductDetailComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent),
  },
  {
    path: 'warehouses',
    loadComponent: () => import('./pages/warehouses/warehouses.component').then(m => m.WarehousesComponent),
  },
  {
    path: 'suppliers',
    loadComponent: () => import('./pages/suppliers/suppliers.component').then(m => m.SuppliersComponent),
  },
  {
    path: 'partners',
    loadComponent: () => import('./pages/partners/partners.component').then(m => m.PartnersComponent),
  },
  {
    path: 'movements',
    loadComponent: () => import('./pages/movements/movements.component').then(m => m.MovementsComponent),
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
  },
];
```

---

## inventory.models.ts

Trích xuất từ `retail.models.ts` — chỉ giữ các types liên quan đến inventory:

```typescript
// Giữ trong inventory.models.ts (move từ retail.models.ts):
export interface Product { ... }
export interface Stock { ... }
export interface Warehouse { ... }
export interface StockMovement { ... }
export interface AnalyticsData { ... }
export interface StockSummary { ... }
export interface AnalyticsProduct { ... }
export interface StockAlert { ... }
export interface StockUpdateRequest { ... }
export interface StockUpdateResponse { ... }
export interface ProductCreateRequest { ... }
export interface ProductUpdateRequest { ... }
export enum MovementType { ... }
export enum AlertType { ... }
export enum AlertSeverity { ... }

// Giữ trong retail.models.ts (không move):
export interface Order { ... }
export interface OrderItem { ... }
export enum OrderStatus { ... }

// Shared types → thêm vào shared hoặc giữ trong cả 2 files:
export interface ApiResponse<T> { ... }
export interface ListResponse<T> { ... }
```

---

## inventory.service.ts

Service file mới, extract từ `retail.service.ts`:

```typescript
// src/app/features/inventory/services/inventory.service.ts
// Move các service classes từ retail.service.ts:
// - ProductService (inject HttpClient, apiBase)
// - InventoryService
// - AnalyticsService
// - CategoryService
// - WarehouseService
// - PartnerService
// - SupplierService (nếu có)
//
// API base URL: getApiBase() + '/data-mesh/domains/retail'
// (Không thay đổi endpoints)
```

---

## InventoryOverviewComponent (tạo mới)

Dashboard tổng quan inventory, tương tự pattern `retail/fresh-retail`:

```typescript
// src/app/features/inventory/pages/overview/inventory-overview.component.ts
@Component({
  selector: 'app-inventory-overview',
  standalone: true,
  template: `
    <!-- Stats cards: Total Products, Low Stock Items, Total Warehouses, Stock Value -->
    <!-- Quick actions: Go to Products, View Low Stock, Create Product -->
    <!-- Recent Movements table (last 5) -->
    <!-- Stock Alerts list -->
  `
})
export class InventoryOverviewComponent {
  inventoryService = inject(InventoryService);
  analyticsService = inject(AnalyticsService);

  // Signals
  analytics = signal<AnalyticsData | null>(null);
  alerts = signal<StockAlert[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.analyticsService.getInventoryAnalytics().subscribe(data => {
      this.analytics.set(data);
      this.loading.set(false);
    });
    this.analyticsService.getStockAlerts().subscribe(a => this.alerts.set(a));
  }
}
```

---

## Requirements

### Requirement: Inventory module tồn tại độc lập

#### Scenario: Navigate tới /inventory/products
- WHEN user navigate tới `/inventory/products`
- THEN `ProductsComponent` render đúng (cùng component, chỉ đổi path)
- AND không có lỗi import hoặc route not found

#### Scenario: Navigate tới /inventory/overview (mới)
- WHEN user navigate tới `/inventory/overview`
- THEN `InventoryOverviewComponent` render với stats cards và recent data

#### Scenario: Old URL redirect
- WHEN user navigate tới `/retail/inventory/products`
- THEN browser redirect sang `/inventory/products` (302 redirect)

#### Scenario: Inventory sidebar entry
- WHEN sidebar render
- THEN "Inventory" group hiển thị với 8 sub-items
- AND group icon là `pi pi-box`
- AND group có thể expand/collapse

---

## File Migration Mapping

| Old path | New path | Action |
|----------|----------|--------|
| `retail/retail-services/inventory/products/products.component.ts` | `inventory/pages/products/products.component.ts` | MOVE |
| `retail/retail-services/inventory/products/product-create.component.ts` | `inventory/pages/products/product-create.component.ts` | MOVE |
| `retail/retail-services/inventory/products/product-detail.component.ts` | `inventory/pages/products/product-detail.component.ts` | MOVE |
| `retail/retail-services/inventory/categories/categories.component.ts` | `inventory/pages/categories/categories.component.ts` | MOVE |
| `retail/retail-services/inventory/locations/locations.component.ts` | `inventory/pages/warehouses/warehouses.component.ts` | MOVE + RENAME |
| `retail/retail-services/inventory/suppliers/suppliers.component.ts` | `inventory/pages/suppliers/suppliers.component.ts` | MOVE |
| `retail/retail-services/inventory/partners/partners.component.ts` | `inventory/pages/partners/partners.component.ts` | MOVE |
| `retail/retail-services/inventory/movements/` | `inventory/pages/movements/` | MOVE |
| `retail/retail-services/analytics/` | `inventory/pages/analytics/` | MOVE |
| `retail/retail-services/inventory/settings/settings.component.ts` | `inventory/pages/settings/settings.component.ts` | MOVE |
| `retail/services/retail.service.ts` (partial) | `inventory/services/inventory.service.ts` | EXTRACT |
| `retail/models/retail.models.ts` (partial) | `inventory/models/inventory.models.ts` | EXTRACT |
| — | `inventory/pages/overview/inventory-overview.component.ts` | CREATE NEW |
| — | `inventory/inventory.routes.ts` | CREATE NEW |
