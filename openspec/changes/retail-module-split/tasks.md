# Tasks: Retail Module Split

## Agent Instructions

> **QUAN TRỌNG — ĐỌC TRƯỚC KHI THỰC HIỆN**
>
> Bạn là một Angular developer implement change `retail-module-split`.
>
> **Nguyên tắc bắt buộc:**
> 1. **MOVE files, không REWRITE** — Chỉ di chuyển file sang đường dẫn mới, cập nhật import paths và class/selector names nếu rename. Không thay đổi logic, HTML template, hay CSS.
> 2. **Tạo file mới** cho các mục đánh dấu CREATE NEW — dùng minimal template (standalone component, empty class, inject services).
> 3. **Không break** bất kỳ component nào đang hoạt động. Nếu không chắc về import path, đọc file gốc trước.
> 4. **Thứ tự thực hiện**: Models → Services → Components → Routes → app.routes.ts → menu-config.ts.
> 5. **Framework**: Angular 19, standalone components, `inject()`, Signals (`signal<T>()`), PrimeNG 19.
> 6. **API endpoints KHÔNG thay đổi** — tất cả services vẫn gọi `/data-mesh/domains/retail/*`.
>
> **Specs tham khảo:**
> - `specs/inventory-module/spec.md` — Inventory module chi tiết
> - `specs/loyalty-module/spec.md` — Loyalty module chi tiết
> - `specs/sidebar-layout/spec.md` — Sidebar và routes chi tiết

---

## Phase 1: Inventory Module

### 1.1 Tạo thư mục và models

- [ ] Tạo `src/app/features/inventory/models/inventory.models.ts`
  - Extract từ `retail/models/retail.models.ts`: Product, Stock, Warehouse, StockMovement, AnalyticsData, StockSummary, AnalyticsProduct, StockAlert, StockUpdateRequest, StockUpdateResponse, ProductCreateRequest, ProductUpdateRequest, MovementType, AlertType, AlertSeverity
  - Giữ nguyên `retail.models.ts` — chỉ thêm re-export hoặc để nguyên (tránh break imports hiện có)

### 1.2 Tạo inventory.service.ts

- [ ] Tạo `src/app/features/inventory/services/inventory.service.ts`
  - MOVE (copy) các service classes từ `retail/services/retail.service.ts`: ProductService, InventoryService, AnalyticsService, CategoryService, WarehouseService, PartnerService, SupplierService
  - Cập nhật imports trong file mới: dùng `../models/inventory.models` thay vì `../../models/retail.models`
  - GIỮ NGUYÊN `retail.service.ts` — không xóa, không sửa (tránh break)

### 1.3 Move components — Products

- [ ] MOVE `retail/retail-services/inventory/products/products.component.ts` → `inventory/pages/products/products.component.ts`
  - Cập nhật import paths (services, models)
- [ ] MOVE `retail/retail-services/inventory/products/products.component.html` → `inventory/pages/products/products.component.html`
- [ ] MOVE `retail/retail-services/inventory/products/products.component.scss` → `inventory/pages/products/products.component.scss`
- [ ] MOVE `retail/retail-services/inventory/products/product-create.component.ts` → `inventory/pages/products/product-create.component.ts`
- [ ] MOVE `retail/retail-services/inventory/products/product-create.component.html` → `inventory/pages/products/product-create.component.html`
- [ ] MOVE `retail/retail-services/inventory/products/product-detail.component.ts` → `inventory/pages/products/product-detail.component.ts`
- [ ] MOVE `retail/retail-services/inventory/products/product-detail.component.html` → `inventory/pages/products/product-detail.component.html`

### 1.4 Move components — Categories

- [ ] MOVE `retail/retail-services/inventory/categories/categories.component.ts` → `inventory/pages/categories/categories.component.ts`
  - Cập nhật import paths
- [ ] MOVE `retail/retail-services/inventory/categories/categories.component.html` → `inventory/pages/categories/categories.component.html`
- [ ] MOVE `retail/retail-services/inventory/categories/categories.component.scss` → `inventory/pages/categories/categories.component.scss`

### 1.5 Move components — Warehouses (rename từ locations)

- [ ] MOVE `retail/retail-services/inventory/locations/locations.component.ts` → `inventory/pages/warehouses/warehouses.component.ts`
  - Đổi class name: `LocationsComponent` → `WarehousesComponent`
  - Đổi selector: `app-locations` → `app-warehouses`
  - Cập nhật import paths
- [ ] MOVE `retail/retail-services/inventory/locations/locations.component.html` → `inventory/pages/warehouses/warehouses.component.html`
- [ ] MOVE `retail/retail-services/inventory/locations/locations.component.scss` → `inventory/pages/warehouses/warehouses.component.scss`

### 1.6 Move components — Suppliers

- [ ] MOVE `retail/retail-services/inventory/suppliers/suppliers.component.ts` → `inventory/pages/suppliers/suppliers.component.ts`
- [ ] MOVE `retail/retail-services/inventory/suppliers/suppliers.component.html` → `inventory/pages/suppliers/suppliers.component.html`
- [ ] MOVE `retail/retail-services/inventory/suppliers/suppliers.component.scss` → `inventory/pages/suppliers/suppliers.component.scss`

### 1.7 Move components — Partners

- [ ] MOVE `retail/retail-services/inventory/partners/partners.component.ts` → `inventory/pages/partners/partners.component.ts`
- [ ] MOVE `retail/retail-services/inventory/partners/partners.component.html` → `inventory/pages/partners/partners.component.html`

### 1.8 Move components — Movements

- [ ] MOVE `retail/retail-services/inventory/movements/` → `inventory/pages/movements/` (nếu tồn tại)
  - Nếu chưa có movements component: Tạo `inventory/pages/movements/movements.component.ts` (empty standalone)

### 1.9 Move components — Analytics

- [ ] MOVE `retail/retail-services/analytics/analytics.component.ts` → `inventory/pages/analytics/analytics.component.ts`
  - Cập nhật import paths
- [ ] MOVE `retail/retail-services/analytics/analytics.component.html` → `inventory/pages/analytics/analytics.component.html`
- [ ] MOVE `retail/retail-services/analytics/analytics.component.scss` → `inventory/pages/analytics/analytics.component.scss`

### 1.10 Move components — Settings

- [ ] MOVE `retail/retail-services/inventory/settings/settings.component.ts` → `inventory/pages/settings/settings.component.ts`
- [ ] MOVE `retail/retail-services/inventory/settings/settings.component.html` → `inventory/pages/settings/settings.component.html`
- [ ] MOVE `retail/retail-services/inventory/settings/settings.component.scss` → `inventory/pages/settings/settings.component.scss`

### 1.11 Tạo InventoryOverviewComponent (mới)

- [ ] Tạo `src/app/features/inventory/pages/overview/inventory-overview.component.ts`
  - Standalone component, inject `InventoryService` và `AnalyticsService`
  - Signals: `analytics`, `alerts`, `loading`
  - Template: stats cards (Total Products, Low Stock, Warehouses, Stock Value) + Recent Movements table + Stock Alerts list
  - Xem spec đầy đủ tại `specs/inventory-module/spec.md`

### 1.12 Tạo inventory.routes.ts

- [ ] Tạo `src/app/features/inventory/inventory.routes.ts`
  - Nội dung đầy đủ xem `specs/inventory-module/spec.md`
  - Gồm: overview, products, products/create, products/:id, categories, warehouses, suppliers, partners, movements, analytics, settings

---

## Phase 2: Loyalty Module

### 2.1 Tạo loyalty.models.ts

- [ ] Tạo `src/app/features/loyalty/models/loyalty.models.ts`
  - Stub types: LoyaltyMember, LoyaltyReward, LoyaltyCampaign, LoyaltyStats
  - Enums: MemberTier, CampaignStatus
  - Nội dung đầy đủ xem `specs/loyalty-module/spec.md`

### 2.2 Tạo loyalty.service.ts

- [ ] Tạo `src/app/features/loyalty/services/loyalty.service.ts`
  - Injectable stub, return `of(...)` với mock data
  - Methods: getStats(), getMembers(), getRewards(), getCampaigns()

### 2.3 Move MembersComponent (rename từ loyalty)

- [ ] MOVE `retail/retail-services/loyalty/loyalty.component.ts` → `loyalty/pages/members/members.component.ts`
  - Đổi class: `LoyaltyComponent` → `MembersComponent`
  - Đổi selector: `app-loyalty` → `app-members`
- [ ] MOVE `retail/retail-services/loyalty/loyalty.component.html` → `loyalty/pages/members/members.component.html`
- [ ] MOVE `retail/retail-services/loyalty/loyalty.component.scss` → `loyalty/pages/members/members.component.scss`

### 2.4 Move ChannelsComponent (rename từ omni-channel)

- [ ] MOVE `retail/retail-services/omni-channel/omni-channel.component.ts` → `loyalty/pages/channels/channels.component.ts`
  - Đổi class: `OmniChannelComponent` → `ChannelsComponent`
  - Đổi selector: `app-omni-channel` → `app-channels`
- [ ] MOVE `retail/retail-services/omni-channel/omni-channel.component.html` → `loyalty/pages/channels/channels.component.html`
- [ ] MOVE `retail/retail-services/omni-channel/omni-channel.component.scss` → `loyalty/pages/channels/channels.component.scss`

### 2.5 Tạo RewardsComponent (mới)

- [ ] Tạo `src/app/features/loyalty/pages/rewards/rewards.component.ts`
  - Standalone component, inject `LoyaltyService`
  - Template: stats banner (Active Rewards: 146, Redeem Cost: $2.31, Redemption Volume: 78,212, Partner Offers: 29) + rewards list/table

### 2.6 Tạo CampaignsComponent (mới)

- [ ] Tạo `src/app/features/loyalty/pages/campaigns/campaigns.component.ts`
  - Standalone component, inject `LoyaltyService`
  - Template: stats banner (Campaigns Live: 32, Open Rate: 42.3%, Conversion: 9.8%, ROI: 3.7x) + campaigns table với status filter

### 2.7 Tạo LoyaltyOverviewComponent (mới)

- [ ] Tạo `src/app/features/loyalty/pages/overview/loyalty-overview.component.ts`
  - Standalone component, inject `LoyaltyService`
  - Signals: `stats`, `campaigns`, `loading`
  - Template: 4 stats cards + recent campaigns table (5 items) + tier breakdown

### 2.8 Tạo loyalty.routes.ts

- [ ] Tạo `src/app/features/loyalty/loyalty.routes.ts`
  - Nội dung đầy đủ xem `specs/loyalty-module/spec.md`
  - Gồm: overview (default), members, rewards, campaigns, channels

---

## Phase 3: Sidebar và Routes

### 3.1 Cập nhật menu-config.ts

- [ ] Mở `src/app/layout/menu-config.ts`
- [ ] Xóa block `Retail Management` (label, icon, 7 flat children)
- [ ] Thêm 4 domain groups theo thứ tự: Retail, Inventory, Planning, Loyalty
  - Nội dung đầy đủ xem `specs/sidebar-layout/spec.md`
- [ ] Giữ nguyên: Data Mesh Management, Governance, Travel, Notification Center

### 3.2 Kiểm tra và cập nhật sidebar.component.ts

- [ ] Mở `src/app/layout/sidebar/sidebar.component.ts`
- [ ] Nếu có inline navigation array → Xóa, import từ `menu-config.ts`
- [ ] Đảm bảo component bind `menu` và `sidebarGroups` từ `menu-config.ts`

### 3.3 Cập nhật app.routes.ts

- [ ] Thêm imports: `inventoryRoutes`, `loyaltyRoutes`
- [ ] Thêm vào `MainLayoutComponent` children (cùng block với `planning`):
  ```typescript
  { path: 'inventory', children: inventoryRoutes },
  { path: 'loyalty', children: loyaltyRoutes },
  ```
- [ ] Thêm redirect rules trước `'**'` wildcard:
  ```typescript
  { path: 'retail/inventory', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'retail/inventory/products', redirectTo: 'inventory/products', pathMatch: 'full' },
  { path: 'retail/inventory/categories', redirectTo: 'inventory/categories', pathMatch: 'full' },
  { path: 'retail/inventory/locations', redirectTo: 'inventory/warehouses', pathMatch: 'full' },
  { path: 'retail/inventory/warehouses', redirectTo: 'inventory/warehouses', pathMatch: 'full' },
  { path: 'retail/inventory/suppliers', redirectTo: 'inventory/suppliers', pathMatch: 'full' },
  { path: 'retail/inventory/partners', redirectTo: 'inventory/partners', pathMatch: 'full' },
  { path: 'retail/inventory/settings', redirectTo: 'inventory/settings', pathMatch: 'full' },
  { path: 'retail/loyalty', redirectTo: 'loyalty/overview', pathMatch: 'full' },
  { path: 'retail/rewards', redirectTo: 'loyalty/rewards', pathMatch: 'full' },
  { path: 'retail/campaigns', redirectTo: 'loyalty/campaigns', pathMatch: 'full' },
  { path: 'retail/omni-channel', redirectTo: 'loyalty/channels', pathMatch: 'full' },
  ```
- [ ] Sửa `/retail` redirect (trong retail children):
  - TRƯỚC: `{ path: '', redirectTo: '/planning/stochastic', pathMatch: 'full' }`
  - SAU: `{ path: '', redirectTo: 'overview', pathMatch: 'full' }`
- [ ] Thêm `/retail/fresh-retail` redirect → `/retail/overview`
- [ ] Thêm route `/retail/overview` → `OverviewComponent` (từ retail-services/overview)

### 3.4 Xóa routes đã move (sau khi inventory + loyalty routes hoạt động)

- [ ] Xóa `/retail/inventory` subtree khỏi retail children
- [ ] Xóa `/retail/loyalty`, `/retail/rewards`, `/retail/campaigns`, `/retail/omni-channel` routes
- [ ] Xóa import `FRESH_RETAIL_FEATURE_CONFIG` từ `app.routes.ts` nếu không còn dùng

---

## Phase 4: Verification

### 4.1 Build check

- [ ] Chạy `ng build` — không có lỗi compile
- [ ] Không có lỗi `TS2307: Cannot find module` (import paths)
- [ ] Không có lỗi `NG8001: Unknown element` (selector)

### 4.2 Route check

- [ ] `/inventory/products` load đúng `ProductsComponent`
- [ ] `/inventory/overview` load đúng `InventoryOverviewComponent`
- [ ] `/loyalty/overview` load đúng `LoyaltyOverviewComponent`
- [ ] `/loyalty/members` load đúng `MembersComponent`
- [ ] `/retail` redirect sang `/retail/overview`
- [ ] `/retail/inventory/products` redirect sang `/inventory/products`
- [ ] `/retail/loyalty` redirect sang `/loyalty/overview`

### 4.3 Sidebar check

- [ ] Sidebar hiển thị 4 groups: Retail, Inventory, Planning, Loyalty
- [ ] "Retail Management" group không còn tồn tại
- [ ] Planning group hiển thị đầy đủ sub-items
- [ ] Tất cả URLs trong sidebar trỏ đúng

---

## File Summary

### Files tạo mới
```
src/app/features/inventory/
├── models/inventory.models.ts
├── services/inventory.service.ts
├── pages/overview/inventory-overview.component.ts
├── pages/movements/movements.component.ts       (nếu chưa có)
└── inventory.routes.ts

src/app/features/loyalty/
├── models/loyalty.models.ts
├── services/loyalty.service.ts
├── pages/overview/loyalty-overview.component.ts
├── pages/rewards/rewards.component.ts
├── pages/campaigns/campaigns.component.ts
└── loyalty.routes.ts
```

### Files được MOVE (không rewrite)
```
retail/retail-services/inventory/products/*       → inventory/pages/products/
retail/retail-services/inventory/categories/*     → inventory/pages/categories/
retail/retail-services/inventory/locations/*      → inventory/pages/warehouses/ (+ rename)
retail/retail-services/inventory/suppliers/*      → inventory/pages/suppliers/
retail/retail-services/inventory/partners/*       → inventory/pages/partners/
retail/retail-services/inventory/settings/*       → inventory/pages/settings/
retail/retail-services/analytics/*               → inventory/pages/analytics/
retail/retail-services/loyalty/*                 → loyalty/pages/members/ (+ rename)
retail/retail-services/omni-channel/*            → loyalty/pages/channels/ (+ rename)
```

### Files được UPDATE (không rewrite, chỉ thêm/sửa config)
```
src/app/app.routes.ts                 → thêm inventory/loyalty routes + redirects
src/app/layout/menu-config.ts         → thay Retail Management → 4 domain groups
src/app/layout/sidebar/sidebar.component.ts  → đảm bảo dùng menu-config (nếu cần)
```

### Files GIỮ NGUYÊN (không đụng vào)
```
src/app/features/retail/             → Giữ nguyên (chỉ xóa routes đã move ra ngoài)
src/app/features/retail-planning/    → Không thay đổi gì
retail/services/retail.service.ts    → Giữ nguyên (không xóa classes đã extract)
retail/models/retail.models.ts       → Giữ nguyên (không xóa interfaces đã extract)
```
