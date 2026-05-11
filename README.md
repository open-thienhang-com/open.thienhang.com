# open.thienhang.com — Fresh Retail UI

Angular 19 frontend for the **Fresh Retail** platform — a multi-tenant retail management and planning application.

Live app: [https://open.thienhang.com](https://open.thienhang.com)
Backend API: [https://api.thienhang.com/docs](https://api.thienhang.com/docs)

---

## What is Fresh Retail?

Fresh Retail is an end-to-end retail operations platform. The UI covers:

- **Orders** — order list, detail modal, status timeline, action buttons (confirm / ship / deliver / cancel)
- **Inventory** — multi-warehouse overview, products, categories, suppliers, vehicles, warehouses, analytics
- **Customers** — member profiles, contact history, segmentation
- **Loyalty** — points dashboard, tier management, campaigns, reward catalog, automation rules
- **Retail Planning** — demand forecasting, fleet planning, route simulation, cost estimation, dataset management
- **POS** — point-of-sale transaction interface
- **Payments & Transactions** — payment status tracking, transaction history
- **Omnichannel** — unified view across physical, e-commerce, and social channels
- **E-commerce** — online storefront management

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Angular | 19 |
| UI Components | PrimeNG | 19 |
| Theming | `@primeng/themes` + TailwindCSS PrimeUI | 19 / 3.4 |
| Icons | PrimeIcons | 7 |
| Charts | Chart.js | 3 |
| Maps | Leaflet | 1.9 |
| Rich Text | Quill | 2 |
| Spreadsheet | xlsx | 0.18 |
| HTTP / State | RxJS | 7.8 |
| Language | TypeScript | 5.5 |

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Angular CLI 19: `npm install -g @angular/cli@19`

### Setup

```bash
git clone https://github.com/open-thienhang-com/open.thienhang.com.git
cd open.thienhang.com

npm install
```

Configure the API base URL in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};
```

### Development server

```bash
ng serve
# → http://localhost:4200
```

### Production build

```bash
ng build --configuration production
# Output: dist/
```

---

## Project Structure

```
src/app/
├── core/
│   ├── services/                  # HTTP service layer (one file per domain)
│   ├── guards/                    # Route auth guards
│   ├── interceptors/              # Auth token injection
│   └── models/                    # Shared TypeScript interfaces
├── features/
│   ├── retail/
│   │   └── retail-services/
│   │       ├── overview/          # Retail dashboard
│   │       ├── orders/            # Order list, detail, status timeline
│   │       ├── customers/         # Member profiles, segments
│   │       ├── payment/           # Payment status tracking
│   │       ├── transactions/      # Transaction history
│   │       ├── pos/               # Point-of-sale interface
│   │       ├── ecommerce/         # Online storefront management
│   │       └── omnichannel/       # Multi-channel unified view
│   ├── retail-planning/
│   │   └── components/
│   │       ├── demand/            # Demand input and overview
│   │       ├── demand-forecast/   # ML forecast visualization
│   │       ├── plan/              # Plan detail
│   │       ├── plan-list/         # All plans
│   │       ├── create-plan/       # Plan creation wizard
│   │       ├── fleet/             # Fleet management
│   │       ├── vehicles/          # Vehicle assignment
│   │       ├── warehouses/        # Warehouse configuration
│   │       ├── delivery-points/   # Delivery location setup
│   │       ├── simulation/        # Route simulation
│   │       ├── trip-simulation/   # Trip-level simulation
│   │       ├── evaluation/        # Plan evaluation metrics
│   │       ├── cost-estimation/   # Cost breakdown
│   │       ├── dataset/           # Dataset browser
│   │       └── settings/          # Planning module settings
│   ├── inventory/
│   │   └── pages/
│   │       ├── overview/          # Stock overview dashboard
│   │       ├── products/          # Product catalog
│   │       ├── categories/        # Category management
│   │       ├── warehouses/        # Warehouse management
│   │       ├── suppliers/         # Supplier list
│   │       ├── vehicles/          # Delivery vehicle tracking
│   │       ├── partners/          # Partner management
│   │       └── analytics/         # Inventory analytics
│   ├── loyalty/
│   │   └── pages/
│   │       ├── overview/          # Loyalty dashboard
│   │       ├── members/           # Member points & tiers
│   │       ├── campaigns/         # Campaign list & detail
│   │       ├── rewards/           # Reward catalog
│   │       ├── segments/          # Member segmentation
│   │       ├── automation/        # Automated reward rules
│   │       ├── strategy/          # Tier strategy config
│   │       ├── channels/          # Loyalty channels
│   │       └── analytics/         # Loyalty analytics
│   ├── governance/                # RBAC — tenants, roles, permissions
│   ├── dashboard/                 # Platform overview
│   └── ...
└── shared/                        # Reusable components and pipes
```

---

## Key Conventions

- **Standalone components** — all components use `standalone: true`; no NgModules
- **Lazy loading** — every feature loaded via `loadComponent()` in `app.routes.ts`
- **PrimeNG first** — use PrimeNG components before any alternative
- **RxJS** — `forkJoin` for parallel requests, `catchError(() => of(null))` for fault tolerance
- **Cache** — `CacheService` wraps HTTP with a 5-minute TTL; pass a `cacheKey` per call

---

## API Conventions

All backend calls go through `core/services/`. Base URL is read from `environment.apiUrl`.

| Feature | Base path |
|---|---|
| Retail orders | `/retail/orders` |
| Retail inventory | `/retail/inventory` |
| Retail members | `/retail/members` |
| Loyalty | `/retail/loyalty` |
| Demand forecast | `/retail/demand/forecast` |
| Governance | `/governance` |
| Auth | `/authentication` |

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready, protected |
| `production` | Deployment target |
| `develop` | Integration branch |
| `feature/retail-*` | Retail feature development |
| `hotfix/*` | Emergency production fixes |

---

## Changelog

### v0.4.0 — 2026-05-09
- feat(retail/orders): order status timeline component with action buttons (confirm / process / ship / deliver / cancel)
- feat(inventory): inventory service — `confirmOrder`, `processOrder`, `shipOrder`, `deliverOrder`, `cancelOrder`
- feat(retail-planning): trip simulation and route evaluation components

### v0.3.0 — 2026-05-04
- feat(retail-planning): demand forecast visualization with Gaussian distribution chart
- feat(retail-planning): fleet and vehicle assignment components
- feat(retail-planning): cost estimation and plan evaluation panels
- feat(inventory): multi-warehouse overview with stock analytics

### v0.2.0 — 2026-04-15
- feat(retail): orders list with pagination, search, and status filter
- feat(retail): customer profiles and member segmentation views
- feat(loyalty): campaigns, rewards, and loyalty analytics pages
- feat(retail-planning): dataset management and planning wizard

### v0.1.0 — 2026-03-22
- feat: initial Angular 19 scaffold — routing, modules, shared layout
- feat(governance): tenant, role, permission, and policy management UI
- feat(auth): JWT login, token refresh, Google OAuth2 integration
