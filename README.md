# open.thienhang.com

Angular 19 frontend for the thienhang platform — governance portal, data catalog, data mesh, and domain management.

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Angular | 19 |
| UI Components | PrimeNG | 19 |
| Theming | @primeng/themes + TailwindCSS PrimeUI | 19 / 3.4 |
| Icons | PrimeIcons | 7 |
| Charts | Chart.js | 3 |
| Maps | Leaflet | 1.9 |
| Rich Text | Quill | 2 |
| Spreadsheet | xlsx | 0.18 |
| HTTP / State | RxJS | 7.8 |
| Language | TypeScript | 5.5 |

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Angular CLI 19: `npm install -g @angular/cli@19`

## Setup

```bash
npm install
```

Copy and configure environment:

```bash
cp src/environments/environment.ts src/environments/environment.development.ts
# Set apiUrl to your backend, e.g. http://localhost:8080
```

## Development

```bash
ng serve
# → http://localhost:4200
```

The dev server proxies API calls to the backend (`http://localhost:8080` by default).

## Build

```bash
# Development
ng build

# Production
ng build --configuration production
```

Output goes to `dist/example-app/`.

## Test

```bash
ng test
```

## Project Structure

```
src/app/
├── core/
│   ├── services/          # HTTP service layer (one file per domain)
│   │   ├── governance.services.ts
│   │   ├── data-mesh.services.ts
│   │   ├── data.product.services.ts
│   │   └── ...
│   ├── guards/            # Route auth guards
│   ├── interceptors/      # HTTP interceptors (auth token injection)
│   └── models/            # Shared TypeScript interfaces
├── features/              # Lazy-loaded route modules
│   ├── governance/        # RBAC — tenants, roles, permissions, teams, users
│   │   ├── admin/         # Init permissions, casbin sync, health summary
│   │   ├── tenants/       # Tenant CRUD + suspend/activate
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── policies/
│   │   ├── teams/         # Team detail with contacts, members, owners
│   │   ├── users/
│   │   ├── accounts/
│   │   ├── assets/        # Data asset catalog (GET /governance/assets)
│   │   ├── branches/
│   │   └── entitlements/
│   ├── data-mesh/         # Domain catalog, data products, domain detail
│   ├── data-assets/       # Data asset browser
│   ├── dashboard/         # Platform overview dashboard
│   ├── retail/            # Retail domain
│   ├── retail-planning/   # Retail planning module
│   ├── hotel/             # Hotel domain
│   ├── marketplace/       # Marketplace module
│   ├── inventory/         # Inventory management
│   ├── loyalty/           # Loyalty programs
│   ├── chat/              # Messaging / CMC
│   ├── observability/     # Monitoring and observability
│   ├── integrations/      # External integrations
│   ├── profile/           # User profile
│   └── settings/          # App settings
└── shared/                # Reusable components and pipes
```

## API Conventions

All backend calls go through `core/services/`. The base URL is read from `environment.apiUrl`.

| Feature area | Base path |
|---|---|
| Governance (RBAC, assets) | `/governance` |
| Data products | `/governance/data-products` |
| Domain catalog | `/governance/catalog`, `/governance/domains` |
| Auth | `/auth` |

## Environment Variables

Configured in `src/environments/environment*.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};
```

## Key Conventions

- **Standalone components** — all components use `standalone: true`; no NgModules
- **Lazy loading** — every feature is loaded via `loadComponent()` in `app.routes.ts`
- **PrimeNG** — use PrimeNG components first; Angular Material only where PrimeNG has no equivalent
- **RxJS** — use `forkJoin` for parallel requests, `catchError(() => of(null))` for fault-tolerant parallel calls
- **Cache** — `CacheService` wraps HTTP observables with a 5-minute TTL; pass a `cacheKey` string per call
