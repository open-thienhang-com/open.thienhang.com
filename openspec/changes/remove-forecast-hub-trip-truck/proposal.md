## Why

Ba trang forecast phụ (`/inventory/forecast/hub`, `/inventory/forecast/trip`, `/inventory/forecast/truck`) không cung cấp giá trị thực tế cho người dùng trong giai đoạn hiện tại — chúng đều tái sử dụng cùng component `DatasetComponent`/`FleetComponent` với dữ liệu chưa được hoàn thiện, gây ra trải nghiệm rời rạc và làm sidebar trở nên phức tạp. Việc loại bỏ chúng giúp làm gọn giao diện và tập trung vào flow chính là `Demand Forecast`.

## What Changes

- **REMOVE** sidebar menu items: `Hub Forecast`, `Trip Forecast`, `Truck Load` trong nhóm `Forecasting` của `Inventory Management`
- **REMOVE** route definitions `forecast/hub`, `forecast/trip`, `forecast/truck` trong `inventory.routes.ts`
- **REMOVE** route definitions `forecast/hub`, `forecast/trip`, `forecast/truck` trong `retail-planning.routes.ts`
- **REMOVE** các quick-link cards `Hub Forecast`, `Trip Forecast`, `Truck Load` trong `InventoryOverviewComponent`
- **REMOVE** các `AppKey` entries (`hub`, `trip`, `truck`) và mapping routes trong `sidebar.component.ts`
- **REMOVE** các route references (`/planning/forecast/hub`, `/planning/forecast/trip`, `/planning/forecast/truck`) trong `applications.component.ts` và `dataset.component.ts`
- **KEEP** `Demand Forecast` (`/inventory/forecast/demand`) — đây là flow chính, không thay đổi

## Capabilities

### New Capabilities
- _(không có capability mới — đây là thay đổi loại bỏ UI)_

### Modified Capabilities
- `forecast-sidebar-cleanup`: Loại bỏ 3 mục sidebar Hub/Trip/Truck khỏi nhóm Forecasting, giữ lại Demand Forecast
- `forecast-routes-cleanup`: Xóa route definitions và redirect logic liên quan đến hub/trip/truck forecast

## Impact

**Files bị ảnh hưởng:**
- `src/app/layout/menu-config.ts` — xóa 3 menu items
- `src/app/features/inventory/inventory.routes.ts` — xóa 3 route entries
- `src/app/features/retail-planning/retail-planning.routes.ts` — xóa 3 route entries
- `src/app/features/inventory/pages/overview/overview.component.ts` — xóa 3 quick-link cards trong section `Forecasting`
- `src/app/layout/main-layout/sidebar/sidebar.component.ts` — xóa AppKey entries (`hub`, `trip`, `truck`) và route mappings
- `src/app/features/applications/applications.component.ts` — xóa route references
- `src/app/features/retail-planning/components/dataset/dataset.component.ts` — xóa dataset type entries cho `truck`, `trip`, `hub`

**APIs/Backend:** Không ảnh hưởng — không có API call nào bị xóa.

**Breaking changes:** Các URL `/inventory/forecast/hub`, `/inventory/forecast/trip`, `/inventory/forecast/truck` sẽ trả về 404. Nên thêm redirect về `/inventory/forecast/demand` nếu có deep-link từ bên ngoài.
