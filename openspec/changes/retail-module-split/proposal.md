# Proposal: Retail Module Decomposition

## 1. Why

Module `features/retail/` hiện là một monolith với hơn 110 files trộn lẫn 4 mối quan tâm khác nhau:

| Concern | Files hiện tại | Vấn đề |
|---------|---------------|---------|
| **Core retail** (POS, Orders, Customers, Payments) | `retail-services/orders/`, `pos/`, `customers/` | Bị chôn vùi trong folder retail khổng lồ |
| **Inventory** (Products, Warehouses, Categories, Suppliers) | `retail-services/inventory/` — 12 sub-folder | Coupled với retail logic, khó maintain riêng |
| **Loyalty & Marketing** (Loyalty, Rewards, Campaigns, Omni-channel) | `retail-services/loyalty/`, routes `loyalty`, `rewards`, `campaigns` | Dùng placeholder `RetailFeaturePageComponent` thay vì feature thật |
| **Planning** (Demand forecasting, Trip simulation, Fleet) | `features/retail-planning/` (đã tách riêng) | Không có sidebar entry riêng, chưa được expose đúng cách |

**Sidebar hiện tại** có 2 vấn đề:
1. `menu-config.ts` và `sidebar.component.ts` định nghĩa navigation ở hai chỗ khác nhau (không đồng nhất)
2. "Retail Management" group flat 7 items — không phân biệt domain

**Hệ quả:**
- Developer muốn sửa inventory phải navigate qua `retail/retail-services/inventory/`
- Loyalty hiện là stub (`RetailFeaturePageComponent`), không có service riêng
- Planning (`/planning/*`) không xuất hiện trong sidebar
- URL `/retail/inventory/*` và `/retail/loyalty` không reflect đúng domain boundary

## 2. What Changes

### Code Structure
- Tách `features/retail/retail-services/inventory/` → thư mục mới `features/inventory/`
- Tách loyalty-related routes và components → thư mục mới `features/loyalty/`
- Giữ `features/retail/` chỉ chứa core commerce (orders, customers, POS, payment, ecommerce, overview)
- Giữ `features/retail-planning/` không đổi file, chỉ thêm sidebar entry

### Routes
- `/retail/inventory/*` → `/inventory/*` (kèm redirect từ đường cũ)
- `/retail/loyalty` → `/loyalty`
- `/retail/rewards` → `/loyalty/rewards`
- `/retail/campaigns` → `/loyalty/campaigns`
- `/retail/omni-channel` → `/loyalty/channels`
- `/planning/*` → không đổi URL, chỉ thêm sidebar

### Sidebar (menu-config.ts)
Thêm 3 sections mới, thay "Retail Management" monolith:
```
Retail          (/retail/*)
Inventory       (/inventory/*)
Planning        (/planning/*)
Loyalty         (/loyalty/*)
```

### Layout Consistency
- Thống nhất nguồn dữ liệu sidebar: tất cả navigation từ `menu-config.ts`, xóa inline definition trong `sidebar.component.ts`
- Mỗi section có icon nhất quán, expanded state mặc định hợp lý

## 3. Capabilities

### New Capabilities
- `inventory-module`: Feature module độc lập tại `src/app/features/inventory/` với routes, services, models riêng
- `loyalty-module`: Feature module độc lập tại `src/app/features/loyalty/` với `LoyaltyService`, dedicated components
- `planning-sidebar-entry`: Planning module có sidebar entry riêng với đầy đủ sub-items

### Modified Capabilities
- `retail-core`: Giảm scope — chỉ còn orders, customers, transactions, POS, payment, ecommerce
- `sidebar-navigation`: Thống nhất từ 2 sources → 1 source (`menu-config.ts`), consistent 4-section layout

### Unchanged
- `retail-planning/` feature code không đổi
- Tất cả API endpoints không đổi (`/data-mesh/domains/retail/*`)
- Component implementations không đổi (chỉ di chuyển file)

## 4. Impact

- **Affected files**: `app.routes.ts`, `menu-config.ts`, `sidebar.component.ts`, `features/retail/` (restructure), 2 new feature folders
- **API**: Không thay đổi backend
- **Backward compat**: Redirect rules cho tất cả old URLs (`/retail/inventory/*` → `/inventory/*`, etc.)
- **Builds on**: `retail-redesign` change (UI improvements vẫn valid, chỉ thay đổi file paths)

## 5. Out of Scope
- Thay đổi API endpoints
- Viết lại component logic hoặc UI
- Merge với `retail-redesign` UI changes (2 changes độc lập, apply theo thứ tự)
