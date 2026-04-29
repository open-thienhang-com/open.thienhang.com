## REMOVED Requirements

### Requirement: Hub Forecast sidebar entry
The system SHALL NOT display a "Hub Forecast" menu item in the Forecasting group of the Inventory Management sidebar.
**Reason**: Page không cung cấp nội dung hoàn chỉnh; gây ra trải nghiệm rời rạc cho người dùng.
**Migration**: Users navigating to `/inventory/forecast/hub` SHALL be redirected to `/inventory/forecast/demand`.

#### Scenario: Hub Forecast không xuất hiện trong sidebar
- **WHEN** user mở sidebar Inventory Management → nhóm Forecasting
- **THEN** không có menu item "Hub Forecast" được hiển thị

#### Scenario: URL cũ được redirect
- **WHEN** user truy cập `/inventory/forecast/hub` hoặc `/planning/forecast/hub`
- **THEN** system redirect về `/inventory/forecast/demand`

---

### Requirement: Trip Forecast sidebar entry
The system SHALL NOT display a "Trip Forecast" menu item in the Forecasting group of the Inventory Management sidebar.
**Reason**: Page không cung cấp nội dung hoàn chỉnh; gây ra trải nghiệm rời rạc cho người dùng.
**Migration**: Users navigating to `/inventory/forecast/trip` SHALL be redirected to `/inventory/forecast/demand`.

#### Scenario: Trip Forecast không xuất hiện trong sidebar
- **WHEN** user mở sidebar Inventory Management → nhóm Forecasting
- **THEN** không có menu item "Trip Forecast" được hiển thị

#### Scenario: URL cũ được redirect
- **WHEN** user truy cập `/inventory/forecast/trip` hoặc `/planning/forecast/trip`
- **THEN** system redirect về `/inventory/forecast/demand`

---

### Requirement: Truck Load sidebar entry
The system SHALL NOT display a "Truck Load" menu item in the Forecasting group of the Inventory Management sidebar.
**Reason**: Page không cung cấp nội dung hoàn chỉnh; gây ra trải nghiệm rời rạc cho người dùng.
**Migration**: Users navigating to `/inventory/forecast/truck` SHALL be redirected to `/inventory/forecast/demand`.

#### Scenario: Truck Load không xuất hiện trong sidebar
- **WHEN** user mở sidebar Inventory Management → nhóm Forecasting
- **THEN** không có menu item "Truck Load" được hiển thị

#### Scenario: URL cũ được redirect
- **WHEN** user truy cập `/inventory/forecast/truck` hoặc `/planning/forecast/truck`
- **THEN** system redirect về `/inventory/forecast/demand`

---

### Requirement: Hub/Trip/Truck quick-link cards trong Inventory Overview
The system SHALL NOT display quick-link cards for "Hub Forecast", "Trip Forecast", "Truck Load" trong section Forecasting của trang Inventory Overview.
**Reason**: Nhất quán với việc xóa các trang này khỏi sidebar.
**Migration**: Section Forecasting trong Overview chỉ hiển thị "Demand Forecast".

#### Scenario: Overview chỉ hiển thị Demand Forecast trong Forecasting section
- **WHEN** user vào trang `/inventory/overview`
- **THEN** section Forecasting chỉ có card "Demand Forecast", không có Hub/Trip/Truck

## ADDED Requirements

### Requirement: Demand Forecast là entry point duy nhất của Forecasting
The system SHALL display only "Demand Forecast" in the Forecasting group of the Inventory Management sidebar.

#### Scenario: Sidebar Forecasting group chỉ còn một item
- **WHEN** user mở sidebar Inventory Management → nhóm Forecasting
- **THEN** chỉ có menu item "Demand Forecast" (`/inventory/forecast/demand`) được hiển thị

#### Scenario: Demand Forecast vẫn hoạt động bình thường
- **WHEN** user click "Demand Forecast" trong sidebar hoặc truy cập `/inventory/forecast/demand`
- **THEN** trang Demand Forecast load bình thường, không bị ảnh hưởng
