## 1. Sidebar Menu Config

- [ ] 1.1 Xóa menu item `Hub Forecast` (`/inventory/forecast/hub`) khỏi nhóm `Forecasting` trong `src/app/layout/menu-config.ts`
- [ ] 1.2 Xóa menu item `Trip Forecast` (`/inventory/forecast/trip`) khỏi nhóm `Forecasting` trong `src/app/layout/menu-config.ts`
- [ ] 1.3 Xóa menu item `Truck Load` (`/inventory/forecast/truck`) khỏi nhóm `Forecasting` trong `src/app/layout/menu-config.ts`
- [ ] 1.4 Verify nhóm `Forecasting` trong sidebar chỉ còn `Demand Forecast`

## 2. Inventory Routes

- [ ] 2.1 Xóa route entry `forecast/hub` (loadComponent DatasetComponent) trong `src/app/features/inventory/inventory.routes.ts`
- [ ] 2.2 Xóa route entry `forecast/trip` (loadComponent DatasetComponent) trong `src/app/features/inventory/inventory.routes.ts`
- [ ] 2.3 Xóa route entry `forecast/truck` (loadComponent FleetComponent) trong `src/app/features/inventory/inventory.routes.ts`
- [ ] 2.4 Thêm redirect `{ path: 'forecast/hub', redirectTo: 'forecast/demand', pathMatch: 'full' }` trong `inventory.routes.ts`
- [ ] 2.5 Thêm redirect `{ path: 'forecast/trip', redirectTo: 'forecast/demand', pathMatch: 'full' }` trong `inventory.routes.ts`
- [ ] 2.6 Thêm redirect `{ path: 'forecast/truck', redirectTo: 'forecast/demand', pathMatch: 'full' }` trong `inventory.routes.ts`

## 3. Retail Planning Routes

- [ ] 3.1 Xóa route entry `forecast/hub` trong `src/app/features/retail-planning/retail-planning.routes.ts`
- [ ] 3.2 Xóa route entry `forecast/trip` trong `src/app/features/retail-planning/retail-planning.routes.ts`
- [ ] 3.3 Xóa route entry `forecast/truck` trong `src/app/features/retail-planning/retail-planning.routes.ts`

## 4. Inventory Overview Component

- [ ] 4.1 Xóa quick-link card `Hub Forecast` trong mảng `sections[Forecasting].links` của `src/app/features/inventory/pages/overview/overview.component.ts`
- [ ] 4.2 Xóa quick-link card `Trip Forecast` trong mảng `sections[Forecasting].links` của `overview.component.ts`
- [ ] 4.3 Xóa quick-link card `Truck Load` trong mảng `sections[Forecasting].links` của `overview.component.ts`
- [ ] 4.4 Verify section Forecasting trong Overview chỉ còn card `Demand Forecast`

## 5. Sidebar Component — AppKey & Route Mappings

- [ ] 5.1 Xóa `hub: '/planning/forecast/hub'` khỏi `routeForApp` trong `src/app/layout/main-layout/sidebar/sidebar.component.ts`
- [ ] 5.2 Xóa `trip: '/planning/forecast/trip'` khỏi `routeForApp` trong `sidebar.component.ts`
- [ ] 5.3 Xóa `truck: '/planning/forecast/truck'` khỏi `routeForApp` trong `sidebar.component.ts`
- [ ] 5.4 Xóa `hub: ['inventory management']` khỏi `priorityMap` trong `sidebar.component.ts`
- [ ] 5.5 Xóa `trip: ['inventory management']` khỏi `priorityMap` trong `sidebar.component.ts`
- [ ] 5.6 Xóa `truck: ['inventory management']` khỏi `priorityMap` trong `sidebar.component.ts`

## 6. Applications Component

- [ ] 6.1 Xóa `hub: '/planning/forecast/hub'` trong `src/app/features/applications/applications.component.ts`
- [ ] 6.2 Xóa `trip: '/planning/forecast/trip'` trong `applications.component.ts`
- [ ] 6.3 Xóa `truck: '/planning/forecast/truck'` trong `applications.component.ts`

## 7. Dataset Component

- [ ] 7.1 Xóa dataset entry `{ key: 'truck', ... route: '/planning/forecast/truck' }` trong `src/app/features/retail-planning/components/dataset/dataset.component.ts`
- [ ] 7.2 Xóa dataset entry `{ key: 'trip', ... route: '/planning/forecast/trip' }` trong `dataset.component.ts`
- [ ] 7.3 Xóa dataset entry `{ key: 'hub', ... route: '/planning/forecast/hub' }` trong `dataset.component.ts`

## 8. Verification

- [ ] 8.1 Chạy `ng build` (hoặc `npm run build`) — đảm bảo không có compile errors
- [ ] 8.2 Kiểm tra browser: truy cập `/inventory/forecast/hub` → phải redirect về `/inventory/forecast/demand`
- [ ] 8.3 Kiểm tra browser: truy cập `/inventory/forecast/trip` → phải redirect về `/inventory/forecast/demand`
- [ ] 8.4 Kiểm tra browser: truy cập `/inventory/forecast/truck` → phải redirect về `/inventory/forecast/demand`
- [ ] 8.5 Kiểm tra sidebar Inventory Management → Forecasting group chỉ hiển thị `Demand Forecast`
- [ ] 8.6 Kiểm tra trang `/inventory/overview` → section Forecasting chỉ có card `Demand Forecast`
- [ ] 8.7 Kiểm tra `/inventory/forecast/demand` vẫn load bình thường (không bị ảnh hưởng)
