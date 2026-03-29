# Spec: Sidebar Layout Unification

## Problem

Hiện tại sidebar navigation bị định nghĩa ở **2 chỗ khác nhau**:

1. `src/app/layout/menu-config.ts` — export `sidebarGroups` (Explore section) và `menu` (main navigation)
2. `src/app/layout/sidebar/sidebar.component.ts` — có thể có inline `sidebarGroups` riêng (cần kiểm tra)

`menu-config.ts` hiện có "Retail Management" là một group flat với 7 items trộn lẫn inventory + loyalty + core retail, không phân biệt domain.

---

## Target: menu-config.ts mới

Thay thế group `Retail Management` bằng **4 domain groups** riêng:

```typescript
// src/app/layout/menu-config.ts
import { MenuItem } from './models/menu-item';

export const sidebarGroups: MenuItem[] = [
  {
    label: 'Explore',
    icon: 'pi pi-compass',
    expanded: false,
    children: [
      {
        label: 'Data Mesh',
        icon: 'pi pi-sitemap',
        children: [
          { label: 'Data Products', url: '/data-mesh/data-products', icon: 'pi pi-shopping-cart' },
          { label: 'Domains', url: '/data-mesh/domains', icon: 'pi pi-book' },
          { label: 'API Explorer', url: '/data-mesh/api-explorer', icon: 'pi pi-code' },
        ]
      },
      { label: 'Database', url: '/explore/database', icon: 'pi pi-database' },
      { label: 'Pipelines', url: '/explore/pipelines', icon: 'pi pi-sliders-h' },
      { label: 'Topics', url: '/explore/topics', icon: 'pi pi-tags' },
      { label: 'ML Models', url: '/explore/ml-models', icon: 'pi pi-brain' },
      { label: 'Container', url: '/explore/container', icon: 'pi pi-box' },
      { label: 'Search', url: '/explore/search', icon: 'pi pi-search' }
    ]
  }
];

export const menu: MenuItem[] = [
  // --- Data Platform ---
  {
    label: 'Data Mesh Management',
    icon: 'pi pi-sitemap',
    type: 'item',
    expanded: true,
    children: [
      {
        label: 'Data Products',
        icon: 'pi pi-shopping-cart',
        expanded: false,
        children: [
          { label: 'Catalog', url: '/data-mesh/data-products/catalog', icon: 'pi pi-list' },
          { label: 'Discovery', url: '/data-mesh/data-products/discovery', icon: 'pi pi-search' },
          { label: 'Assets', url: '/data-mesh/data-products/assets', icon: 'pi pi-database' },
          { label: 'Lineage', url: '/data-mesh/data-products/lineage', icon: 'pi pi-share-alt' },
          { label: 'Policies', url: '/data-mesh/data-products/policies', icon: 'pi pi-lock' },
          { label: 'Monitoring', url: '/data-mesh/data-products/monitoring', icon: 'pi pi-chart-line' }
        ]
      },
      {
        label: 'Data Domains',
        icon: 'pi pi-book',
        expanded: false,
        children: [
          { label: 'Catalog', url: '/data-mesh/domains/catalog', icon: 'pi pi-list' },
          { label: 'Discovery', url: '/data-mesh/domains/discovery', icon: 'pi pi-search' },
          { label: 'Assets', url: '/data-mesh/domains/assets', icon: 'pi pi-database' },
          { label: 'Lineage', url: '/data-mesh/domains/lineage', icon: 'pi pi-share-alt' },
          { label: 'Policies', url: '/data-mesh/domains/policies', icon: 'pi pi-lock' },
          { label: 'Monitoring', url: '/data-mesh/domains/monitoring', icon: 'pi pi-chart-line' }
        ]
      },
    ]
  },
  {
    label: 'Governance',
    icon: 'pi pi-shield',
    type: 'item',
    expanded: false,
    children: [
      { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
      { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
      { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
      { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' },
      { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
      { label: 'Roles', url: '/governance/roles', icon: 'pi pi-users' },
      { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' }
    ]
  },

  // --- Business Apps ---
  {
    label: 'Retail',
    icon: 'pi pi-shop',
    type: 'item',
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
    type: 'item',
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
    type: 'item',
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
    type: 'item',
    expanded: false,
    children: [
      { label: 'Overview', url: '/loyalty/overview', icon: 'pi pi-th-large' },
      { label: 'Members', url: '/loyalty/members', icon: 'pi pi-id-card' },
      { label: 'Rewards', url: '/loyalty/rewards', icon: 'pi pi-gift' },
      { label: 'Campaigns', url: '/loyalty/campaigns', icon: 'pi pi-megaphone' },
      { label: 'Channels', url: '/loyalty/channels', icon: 'pi pi-share-alt' },
    ]
  },

  // --- Other apps ---
  {
    label: 'Travel',
    icon: 'pi pi-globe',
    type: 'item',
    url: '/travel'
  },
  {
    label: 'Notification Center',
    icon: 'pi pi-bell',
    type: 'item',
    url: '/notification',
    expanded: true,
    children: [
      { label: 'Overview', url: '/notification', icon: 'pi pi-home' },
      {
        label: 'Templates',
        icon: 'pi pi-copy',
        expanded: true,
        children: [
          { label: 'Explorer', url: '/notification/explorer', icon: 'pi pi-list' },
          { label: 'Composer', url: '/notification/composer', icon: 'pi pi-send' },
          { label: 'Create Template', url: '/notification/templates/create', icon: 'pi pi-plus' }
        ]
      },
      {
        label: 'Monitoring',
        icon: 'pi pi-chart-line',
        expanded: false,
        children: [
          { label: 'Audit Log', url: '/notification/audit', icon: 'pi pi-history' },
          { label: 'Reliability', url: '/notification/reliability', icon: 'pi pi-shield' },
          { label: 'Performance', url: '/notification/scheduling', icon: 'pi pi-clock' },
        ]
      },
      {
        label: 'Development',
        icon: 'pi pi-code',
        expanded: false,
        children: [
          { label: 'API Playground', url: '/notification/api', icon: 'pi pi-terminal' },
        ]
      }
    ]
  },
  // Settings intentionally removed from sidebar menu config; Settings is a standalone app
];
```

---

## sidebar.component.ts — Thay đổi cần thực hiện

### Kiểm tra trước khi thay đổi

Mở `src/app/layout/sidebar/sidebar.component.ts` và kiểm tra:
- Nếu component **import** `menu` hoặc `sidebarGroups` từ `menu-config.ts` → không cần thay đổi import
- Nếu component có **inline definition** của `sidebarGroups` hoặc `menuItems` → XÓA inline definition, thay bằng import từ `menu-config.ts`

### Pattern đúng sau khi thay đổi

```typescript
// sidebar.component.ts
import { menu, sidebarGroups } from '../menu-config';

@Component({ ... })
export class SidebarComponent {
  menuItems = menu;          // main nav — từ menu-config.ts
  exploreGroups = sidebarGroups; // Explore section — từ menu-config.ts

  // Không có bất kỳ inline navigation config nào
}
```

---

## app.routes.ts — Thay đổi cần thực hiện

### Thêm routes mới cho inventory và loyalty

```typescript
// Thêm imports
import { inventoryRoutes } from './features/inventory/inventory.routes';
import { loyaltyRoutes } from './features/loyalty/loyalty.routes';

// Trong routes array (thêm vào MainLayoutComponent children):
{ path: 'inventory', children: inventoryRoutes },
{ path: 'loyalty', children: loyaltyRoutes },
```

### Thêm redirect rules

```typescript
// Redirect cũ → mới (thêm VÀO TRƯỚC wildcard route '**')
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

### Sửa `/retail` redirect

```typescript
// TRƯỚC (sai):
{ path: '', redirectTo: '/planning/stochastic', pathMatch: 'full' }

// SAU (đúng) — trong children của retail route:
{ path: '', redirectTo: 'overview', pathMatch: 'full' }
```

### Xóa routes đã move

Sau khi inventory và loyalty routes đã hoạt động, xóa khỏi `retail` children:
- `/retail/inventory/` subtree (cả block `children: [...]`)
- `/retail/loyalty` route
- `/retail/rewards` route
- `/retail/campaigns` route
- `/retail/omni-channel` route

---

## retail/fresh-retail redirect

Route `/retail/fresh-retail` hiện là overview entry point (sidebar trỏ về đây). Sau khi có `/retail/overview`:

```typescript
// Trong retail children:
{ path: 'fresh-retail', redirectTo: 'overview', pathMatch: 'full' },
{ path: 'overview', loadComponent: () => import('./features/retail/retail-services/overview/overview.component').then(m => m.OverviewComponent) },
```

---

## Requirements

### Requirement: menu-config.ts là single source of truth

#### Scenario: Sidebar hiển thị 4 business domain groups
- WHEN sidebar render
- THEN menu hiển thị: Retail, Inventory, Planning, Loyalty (theo thứ tự)
- AND mỗi group có icon riêng biệt
- AND không có group "Retail Management" cũ

#### Scenario: Inventory group expand/collapse
- WHEN user click vào "Inventory" group header
- THEN group toggle expanded/collapsed
- AND state không bị reset khi navigate

#### Scenario: Planning group có đầy đủ sub-items
- WHEN user expand "Planning" group
- THEN hiển thị 7 items: Overview, Plans, Demands, Warehouses, Fleet, Simulation, Settings
- AND tất cả URLs trỏ đúng `/planning/*`

#### Scenario: Sidebar không có inline definition
- GIVEN `sidebar.component.ts` đã được update
- THEN component không chứa bất kỳ hardcoded menuItems array nào
- AND tất cả navigation data đến từ `menu-config.ts`

### Requirement: Retail route redirect đúng

#### Scenario: /retail redirect
- WHEN user navigate tới `/retail`
- THEN browser redirect sang `/retail/overview` (KHÔNG phải `/planning/stochastic`)

### Requirement: Backward compat redirects hoạt động

#### Scenario: /retail/inventory/products redirect
- WHEN user navigate tới `/retail/inventory/products`
- THEN browser redirect sang `/inventory/products`

#### Scenario: /retail/loyalty redirect
- WHEN user navigate tới `/retail/loyalty`
- THEN browser redirect sang `/loyalty/overview`

#### Scenario: /retail/omni-channel redirect
- WHEN user navigate tới `/retail/omni-channel`
- THEN browser redirect sang `/loyalty/channels`
