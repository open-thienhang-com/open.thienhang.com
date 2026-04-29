## Context

Hệ thống `open.thienhang.com` có module Inventory Management với sidebar gồm nhóm **Forecasting** chứa 4 mục: `Demand Forecast`, `Hub Forecast`, `Trip Forecast`, `Truck Load`. Ba mục cuối (`hub`, `trip`, `truck`) đều trỏ đến component `DatasetComponent` (hoặc `FleetComponent`) với `datasetType` khác nhau, nhưng chưa có nội dung hoàn chỉnh và không cung cấp giá trị thực tế.

Hiện tại các routes tồn tại ở hai nơi song song:
- `inventory.routes.ts` (`/inventory/forecast/*`)
- `retail-planning.routes.ts` (`/planning/forecast/*`)

Sidebar component có một `AppKey` type system với các keys `hub`, `trip`, `truck`, `forecast` ánh xạ tới các routes tương ứng.

## Goals / Non-Goals

**Goals:**
- Xóa hoàn toàn 3 sidebar items: `Hub Forecast`, `Trip Forecast`, `Truck Load` khỏi nhóm Forecasting
- Xóa các route definitions tương ứng trong cả hai file routes
- Xóa các AppKey entries và route mappings liên quan trong `sidebar.component.ts`
- Xóa quick-link cards tương ứng trong `InventoryOverviewComponent`
- Xóa dataset type references trong `DatasetComponent` và `applications.component.ts`
- Thêm redirects từ các URL cũ về `/inventory/forecast/demand` để tránh 404

**Non-Goals:**
- Không thay đổi `Demand Forecast` (`/inventory/forecast/demand`) — giữ nguyên
- Không thay đổi backend API hay data model
- Không refactor `DatasetComponent` hay `FleetComponent`
- Không xóa `retail-planning.routes.ts` hoàn toàn (còn nhiều routes khác)

## Decisions

### D1: Thêm redirects thay vì để 404

**Quyết định:** Thêm `{ path: 'forecast/hub', redirectTo: 'forecast/demand', pathMatch: 'full' }` (tương tự cho `trip`, `truck`) trong `inventory.routes.ts`.

**Lý do:** Có thể tồn tại deep-link hoặc bookmark từ users. Redirect về Demand Forecast là UX tốt hơn là 404.

**Alternative đã xem xét:** Để 404 — bị loại vì rủi ro UX không cần thiết.

### D2: Giữ AppKey type nhưng xóa mapping routes

**Quyết định:** Trong `sidebar.component.ts`, xóa các route mappings (`hub`, `trip`, `truck` trong `routeForApp` và `priorityMap`) nhưng **không** xóa khỏi TypeScript `AppKey` union type để tránh compile errors nếu có code khác đang reference.

**Alternative đã xem xét:** Xóa hoàn toàn AppKey entries — có thể gây TypeScript errors nếu type được dùng ở nơi khác, sẽ xử lý trong task riêng.

### D3: Xóa dataset type entries trong DatasetComponent

**Quyết định:** Xóa entries `truck`, `trip`, `hub` trong mảng `datasets` của `DatasetComponent`. Nếu component được navigate đến bằng URL cũ, redirect (D1) sẽ đưa về `demand` trước khi component load.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| User bookmark các URL cũ → 404 | Thêm redirects (D1) về `/inventory/forecast/demand` |
| AppKey type còn references ở nơi khác | Kiểm tra usage trước khi xóa, chỉ xóa mapping, giữ type |
| Dataset component bị broken nếu datasetType không hợp lệ | Redirect đảm bảo chỉ `demand` type được load |

## Migration Plan

1. Xóa menu items trong `menu-config.ts`
2. Thêm redirects + xóa routes trong `inventory.routes.ts`
3. Xóa routes trong `retail-planning.routes.ts`
4. Xóa quick-link cards trong `overview.component.ts`
5. Xóa AppKey mappings trong `sidebar.component.ts`
6. Xóa route references trong `applications.component.ts`
7. Xóa dataset entries trong `dataset.component.ts`
8. Kiểm tra build `ng build` không có errors
9. Kiểm tra navigation: `/inventory/forecast/hub` → redirect → `/inventory/forecast/demand`

**Rollback:** Revert các file đã chỉnh — không có database migration, không có API thay đổi.

## Open Questions

- Có cần thông báo cho users về việc xóa các pages này không? (Thông qua release note hay in-app banner)
- AppKey type `hub`, `trip`, `truck` có được dùng ở nơi nào khác ngoài `sidebar.component.ts` và `applications.component.ts` không? → Cần kiểm tra trước khi xóa type.
