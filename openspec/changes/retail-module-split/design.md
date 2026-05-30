# Design: Retail Module Decomposition

## Context

### Current File Structure Problem

```
src/app/features/
├── retail/                        ← MONOLITH (~110 files)
│   ├── models/retail.models.ts    ← All models in one file
│   ├── services/retail.service.ts ← 8+ service classes in one file
│   ├── pages/                     ← Public-facing pages
│   └── retail-services/           ← All feature implementations
│       ├── inventory/             ← CONCERN 1: Stock management
│       ├── loyalty/               ← CONCERN 2: Loyalty (stub)
│       ├── orders/                ← CONCERN 3: Core retail
│       ├── customers/             ← CONCERN 3: Core retail
│       ├── pos/                   ← CONCERN 3: Core retail
│       ├── payment/               ← CONCERN 3: Core retail
│       ├── ecommerce/             ← CONCERN 3: Core retail
│       ├── transactions/          ← CONCERN 3: Core retail
│       ├── omni-channel/          ← CONCERN 2: Loyalty/Marketing
│       ├── analytics/             ← Shared?
│       └── ...
└── retail-planning/               ← CONCERN 4: Planning (already split)
    ├── components/                ← 35+ components
    └── services/                  ← 19 services
```

### Current Route Problem

```
/retail                → redirect to /planning/stochastic (inconsistent!)
/retail/inventory/*    → products, categories, warehouses...
/retail/loyalty        → placeholder feature page
/retail/rewards        → placeholder feature page
/retail/campaigns      → placeholder feature page
/retail/omni-channel   → Facebook workspace
/planning/*            → retail-planning routes (NOT in sidebar)
```

### Current Sidebar Problem

`menu-config.ts` exports `sidebarGroups` (Explore section only) + `menu` array (main nav).
`sidebar.component.ts` has a separate inline `sidebarGroups` definition that duplicates/conflicts.

Result: Sidebar state might come from either place depending on which the SidebarComponent uses.

---

## Target Architecture

```
src/app/features/
├── retail/                ← Core commerce (trimmed)
│   ├── models/            ← Core retail models
│   ├── services/          ← RetailService (orders, customers, POS)
│   └── pages/             ← overview, orders, customers, transactions, pos, payment, ecommerce
│
├── inventory/             ← NEW: Stock management domain
│   ├── models/            ← Inventory models (Product, Stock, Warehouse, etc.)
│   ├── services/          ← InventoryService, ProductService, AnalyticsService
│   ├── pages/
│   │   ├── overview/      ← Stock dashboard
│   │   ├── products/      ← (moved from retail/retail-services/inventory/products)
│   │   ├── categories/
│   │   ├── warehouses/
│   │   ├── locations/
│   │   ├── suppliers/
│   │   ├── partners/
│   │   ├── movements/
│   │   ├── analytics/
│   │   └── settings/
│   └── inventory.routes.ts
│
├── loyalty/               ← NEW: CRM & Marketing domain
│   ├── models/            ← Loyalty models
│   ├── services/          ← LoyaltyService (members, rewards, campaigns)
│   ├── pages/
│   │   ├── overview/      ← Loyalty dashboard
│   │   ├── members/       ← (loyalty.component.ts → members component)
│   │   ├── rewards/       ← rewards feature page → real component
│   │   ├── campaigns/     ← campaigns feature page → real component
│   │   └── channels/      ← omni-channel (từ retail/omni-channel)
│   └── loyalty.routes.ts
│
└── retail-planning/       ← UNCHANGED (already split)
    ├── components/
    ├── services/
    └── retail-planning.routes.ts
```

---

## Goals / Non-Goals

**Goals:**
- Module boundary rõ ràng theo domain (retail core / inventory / loyalty / planning)
- Sidebar thống nhất: 1 file `menu-config.ts` làm source of truth
- Routes phản ánh đúng domain (`/inventory/*`, `/loyalty/*`)
- Backward compatibility: old routes redirect sang new
- Không break bất kỳ component logic nào
- File movement thuần túy (không rewrite)

**Non-Goals:**
- Thay đổi component HTML/logic/styles
- Thay đổi API endpoints hoặc models
- Implement loyalty feature thật (scope riêng)
- Merge với retail-redesign UI changes

---

## Decisions

### 1. Move files, don't rewrite

Tất cả components trong `inventory/` và `loyalty/` chỉ được **move** (di chuyển) sang module mới, giữ nguyên code. Chỉ thay đổi:
- Import paths trong component files (update relative imports)
- Route `loadComponent` paths trong `app.routes.ts`

Alternatives:
- Rewrite components: Rejected — out of scope, risk cao, `retail-redesign` sẽ handle UI
- Copy components: Rejected — duplicate code

### 2. Inventory routes: `/inventory/*` (not `/retail/inventory/*`)

URL `/retail/inventory/*` bị xóa, thay bằng `/inventory/*`. Old routes được redirect.

Lý do: Domain boundary rõ ràng, URL ngắn hơn, consistent với `/planning/*` và `/loyalty/*` pattern.

Redirect rules:
```typescript
{ path: 'retail/inventory', redirectTo: '/inventory', pathMatch: 'full' },
{ path: 'retail/inventory/:child', redirectTo: '/inventory/:child', pathMatch: 'full' },
```

### 3. Retail core `/retail` redirect thay đổi

Hiện tại: `/retail` → redirect `/planning/stochastic` (confusing!)

Thay bằng: `/retail` → `/retail/overview` (overview dashboard)

### 4. Sidebar: menu-config.ts là single source of truth

**Xóa** inline `sidebarGroups` trong `sidebar.component.ts`.
**Import** `menu` từ `menu-config.ts` trong `sidebar.component.ts`.

Nếu `sidebar.component.ts` đang define inline navigation:
- Extract inline config → merge vào `menu-config.ts`
- `sidebar.component.ts` chỉ import `{ menu } from '../../layout/menu-config'`

### 5. Services split

`retail.service.ts` hiện có 8+ service classes trong 1 file. Sau module split:

| Service | Module |
|---------|--------|
| `ProductService` | → `inventory/services/inventory.service.ts` |
| `InventoryService` | → `inventory/services/inventory.service.ts` |
| `AnalyticsService` | → `inventory/services/inventory.service.ts` |
| `CategoryService` | → `inventory/services/inventory.service.ts` |
| `WarehouseService` | → `inventory/services/inventory.service.ts` |
| `PartnerService` | → `inventory/services/inventory.service.ts` |
| `SupplierService` | → `inventory/services/inventory.service.ts` |
| `OrderService` | → `retail/services/retail.service.ts` |
| `CustomerService` | → `retail/services/retail.service.ts` |
| `TransactionService` | → `retail/services/retail.service.ts` |
| `RetailOrderService` | → `retail/services/retail.service.ts` |

Loyalty chưa có service thật → tạo `loyalty/services/loyalty.service.ts` stub (injectable, empty methods).

### 6. Models split

`retail.models.ts` hiện có tất cả models. Sau split:

| Models | Module |
|--------|--------|
| `Product`, `Stock`, `Warehouse`, `StockMovement`, `AnalyticsData`, `StockAlert`, `StockSummary`, `AnalyticsProduct`, `StockUpdateRequest/Response` | → `inventory/models/inventory.models.ts` |
| `Order`, `OrderItem`, `OrderStatus` | → `retail/models/retail.models.ts` (giữ lại) |
| `Category` (nếu tồn tại) | → `inventory/models/` |
| Loyalty models | → `loyalty/models/loyalty.models.ts` (tạo mới) |
| `ApiResponse<T>`, `ListResponse<T>` | → `shared/models/api.models.ts` (tạo hoặc dùng existing) |

---

## Sidebar Navigation Design

### New menu-config.ts structure

```
sidebarGroups: MenuItem[] = [
  {
    label: 'Explore',
    icon: 'pi pi-compass',
    children: [...]           ← giữ nguyên
  }
]

menu: MenuItem[] = [
  // --- Data Platform ---
  { label: 'Data Mesh Management', icon: 'pi pi-sitemap', expanded: false, children: [...] },
  { label: 'Governance', icon: 'pi pi-shield', expanded: false, children: [...] },

  // --- Separator ---

  // --- Business Apps ---
  {
    label: 'Retail',
    icon: 'pi pi-shop',
    expanded: true,
    children: [
      { label: 'Overview', url: '/retail/overview', icon: 'pi pi-th-large' },
      { label: 'Orders', url: '/retail/orders', icon: 'pi pi-send' },
      { label: 'Customers', url: '/retail/customers', icon: 'pi pi-users' },
      { label: 'Transactions', url: '/retail/transactions', icon: 'pi pi-credit-card' },
      { label: 'Point of Sale', url: '/retail/pos', icon: 'pi pi-dollar' },
      { label: 'E-commerce', url: '/retail/ecommerce', icon: 'pi pi-globe' },
    ]
  },
  {
    label: 'Inventory',
    icon: 'pi pi-box',
    expanded: false,
    children: [
      { label: 'Overview', url: '/inventory/overview', icon: 'pi pi-th-large' },
      { label: 'Products', url: '/inventory/products', icon: 'pi pi-tag' },
      { label: 'Warehouses', url: '/inventory/warehouses', icon: 'pi pi-building' },
      { label: 'Categories', url: '/inventory/categories', icon: 'pi pi-sitemap' },
      { label: 'Suppliers', url: '/inventory/suppliers', icon: 'pi pi-truck' },
      { label: 'Partners', url: '/inventory/partners', icon: 'pi pi-briefcase' },
      { label: 'Movements', url: '/inventory/movements', icon: 'pi pi-arrows-h' },
      { label: 'Analytics', url: '/inventory/analytics', icon: 'pi pi-chart-bar' },
    ]
  },
  {
    label: 'Planning',
    icon: 'pi pi-directions',
    expanded: false,
    children: [
      { label: 'Overview', url: '/planning', icon: 'pi pi-th-large' },
      { label: 'Plans', url: '/planning/plan-list', icon: 'pi pi-list' },
      { label: 'Demands', url: '/planning/demands', icon: 'pi pi-chart-line' },
      { label: 'Warehouses', url: '/planning/warehouses', icon: 'pi pi-building' },
      { label: 'Fleet', url: '/planning/fleet', icon: 'pi pi-car' },
      { label: 'Simulation', url: '/planning/simulation', icon: 'pi pi-cog' },
      { label: 'Settings', url: '/planning/settings', icon: 'pi pi-sliders-h' },
    ]
  },
  {
    label: 'Loyalty',
    icon: 'pi pi-star',
    expanded: false,
    children: [
      { label: 'Overview', url: '/loyalty', icon: 'pi pi-th-large' },
      { label: 'Members', url: '/loyalty/members', icon: 'pi pi-id-card' },
      { label: 'Rewards', url: '/loyalty/rewards', icon: 'pi pi-gift' },
      { label: 'Campaigns', url: '/loyalty/campaigns', icon: 'pi pi-megaphone' },
      { label: 'Channels', url: '/loyalty/channels', icon: 'pi pi-share-alt' },
    ]
  },

  // --- Other apps ---
  { label: 'Travel', icon: 'pi pi-globe', url: '/travel' },
  { label: 'Notification Center', icon: 'pi pi-bell', expanded: false, children: [...] },
]
```

---

## Route Structure

### New routes in app.routes.ts

```typescript
// Add inventory.routes.ts file
{ path: 'inventory', children: inventoryRoutes },

// Add loyalty.routes.ts file
{ path: 'loyalty', children: loyaltyRoutes },

// Redirects for backward compat
{ path: 'retail/inventory', redirectTo: 'inventory', pathMatch: 'full' },
{ path: 'retail/inventory/products', redirectTo: 'inventory/products', pathMatch: 'full' },
{ path: 'retail/inventory/categories', redirectTo: 'inventory/categories', pathMatch: 'full' },
{ path: 'retail/inventory/warehouses', redirectTo: 'inventory/warehouses', pathMatch: 'full' },
{ path: 'retail/inventory/locations', redirectTo: 'inventory/locations', pathMatch: 'full' },
{ path: 'retail/inventory/suppliers', redirectTo: 'inventory/suppliers', pathMatch: 'full' },
{ path: 'retail/inventory/partners', redirectTo: 'inventory/partners', pathMatch: 'full' },
{ path: 'retail/inventory/settings', redirectTo: 'inventory/settings', pathMatch: 'full' },
{ path: 'retail/loyalty', redirectTo: 'loyalty', pathMatch: 'full' },
{ path: 'retail/rewards', redirectTo: 'loyalty/rewards', pathMatch: 'full' },
{ path: 'retail/campaigns', redirectTo: 'loyalty/campaigns', pathMatch: 'full' },
{ path: 'retail/omni-channel', redirectTo: 'loyalty/channels', pathMatch: 'full' },
// Fix: /retail → /retail/overview (không redirect sang planning)
{ path: 'retail', redirectTo: 'retail/overview', pathMatch: 'full' },
```

---

## Risks / Trade-offs

- [Import path breakage sau file move] → Mỗi component cần update relative imports. Dùng IDE refactor hoặc sed script thay vì manual. Đây là risk cao nhất.
- [sidebar.component.ts có state riêng] → Nếu SidebarComponent dùng inline config thay vì import menu-config, cần verify và migrate cẩn thận.
- [retail-redesign change bị ảnh hưởng] → retail-redesign chỉ thay đổi UI, không thay đổi routing. Sau khi module-split, retail-redesign cần update file paths. Áp dụng module-split trước.
- [analytics trong retail: thuộc inventory hay retail?] → Analytics component (`/retail/analytics`) hiện là analytics về inventory (stock alerts, stock value). Quyết định: move sang `/inventory/analytics`.
