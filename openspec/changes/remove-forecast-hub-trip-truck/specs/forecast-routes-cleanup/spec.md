## REMOVED Requirements

### Requirement: Route forecast/hub trong inventory module
The system SHALL NOT define a route at `forecast/hub` within the inventory routes module.
**Reason**: Trang Hub Forecast bị xóa.
**Migration**: Route MUST redirect to `forecast/demand`.

#### Scenario: Route forecast/hub redirect về demand
- **WHEN** Angular router khớp path `/inventory/forecast/hub`
- **THEN** router redirect về `/inventory/forecast/demand`

---

### Requirement: Route forecast/trip trong inventory module
The system SHALL NOT define a routed component at `forecast/trip` within the inventory routes module.
**Reason**: Trang Trip Forecast bị xóa.
**Migration**: Route MUST redirect to `forecast/demand`.

#### Scenario: Route forecast/trip redirect về demand
- **WHEN** Angular router khớp path `/inventory/forecast/trip`
- **THEN** router redirect về `/inventory/forecast/demand`

---

### Requirement: Route forecast/truck trong inventory module
The system SHALL NOT define a routed component at `forecast/truck` within the inventory routes module.
**Reason**: Trang Truck Load Forecast bị xóa.
**Migration**: Route MUST redirect to `forecast/demand`.

#### Scenario: Route forecast/truck redirect về demand
- **WHEN** Angular router khớp path `/inventory/forecast/truck`
- **THEN** router redirect về `/inventory/forecast/demand`

---

### Requirement: Route forecast/hub trong retail-planning module
The system SHALL NOT define a route at `forecast/hub` within `retail-planning.routes.ts`.
**Reason**: Trang Hub Forecast bị xóa, retail-planning routes cũng cần nhất quán.
**Migration**: Không có redirect cần thiết ở đây vì `/planning/*` paths không được expose trong menu; `/inventory/*` redirects đã cover.

#### Scenario: retail-planning không còn route forecast/hub
- **WHEN** Angular router load `retail-planning.routes.ts`
- **THEN** không có route entry nào cho `forecast/hub`

---

### Requirement: Route forecast/trip trong retail-planning module
The system SHALL NOT define a route at `forecast/trip` within `retail-planning.routes.ts`.
**Reason**: Trang Trip Forecast bị xóa.
**Migration**: Không cần redirect riêng.

#### Scenario: retail-planning không còn route forecast/trip
- **WHEN** Angular router load `retail-planning.routes.ts`
- **THEN** không có route entry nào cho `forecast/trip`

---

### Requirement: Route forecast/truck trong retail-planning module
The system SHALL NOT define a route at `forecast/truck` within `retail-planning.routes.ts`.
**Reason**: Trang Truck Forecast bị xóa.
**Migration**: Không cần redirect riêng.

#### Scenario: retail-planning không còn route forecast/truck
- **WHEN** Angular router load `retail-planning.routes.ts`
- **THEN** không có route entry nào cho `forecast/truck`

## ADDED Requirements

### Requirement: Redirect các URL cũ về Demand Forecast
The inventory routes module SHALL define redirect rules cho 3 paths bị xóa về `/inventory/forecast/demand`.

#### Scenario: Redirect hub → demand
- **WHEN** user hoặc link trỏ đến `/inventory/forecast/hub`
- **THEN** Angular router redirect về `/inventory/forecast/demand` với `pathMatch: 'full'`

#### Scenario: Redirect trip → demand
- **WHEN** user hoặc link trỏ đến `/inventory/forecast/trip`
- **THEN** Angular router redirect về `/inventory/forecast/demand` với `pathMatch: 'full'`

#### Scenario: Redirect truck → demand
- **WHEN** user hoặc link trỏ đến `/inventory/forecast/truck`
- **THEN** Angular router redirect về `/inventory/forecast/demand` với `pathMatch: 'full'`
