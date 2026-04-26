# open.thienhang.com - System Architecture

## Overview

open.thienhang.com is an enterprise Angular 19 web application that serves as a unified portal for data management, governance, and business operations. It provides a modular, multi-tenant platform with role-based access control.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Angular 19.0.1 |
| UI Components | PrimeNG 19.1.3 |
| Theming | PrimeNG Themes (Aura, Lara, Material, Nora) |
| Styling | TailwindCSS 3.4.17 |
| Maps | Leaflet 1.9.4 |
| Charts | Chart.js 3.3.2 |
| State Management | RxJS 7.8.1 |
| Editor | Quill 2.0.3 |
| Spreadsheets | xlsx 0.18.5 |

## Project Structure

```
src/
├── app/
│   ├── core/           # Core services, guards, interceptors
│   │   ├── config/     # Application configuration
│   │   ├── guard/     # Route guards (auth, role)
│   │   ├── interceptor/ # HTTP interceptors
│   │   └── services/  # Core services (auth, api)
│   ├── features/      # Feature modules (31 modules)
│   │   ├── data-mesh-management/
│   │   ├── governance/
│   │   ├── explore/
│   │   ├── retail/
│   │   ├── loyalty/
│   │   ├── inventory/
│   │   ├── hotel/
│   │   ├── travel/
│   │   ├── files/
│   │   ├── chat/
│   │   └── ...
│   ├── layout/         # Layout components (sidebar, header)
│   ├── pages/         # Page-level components
│   └── shared/        # Shared components, pipes, directives
├── assets/            # Static assets (images, fonts)
├── styles/            # Global styles
└── views/            # View templates
```

## Core Modules

### 1. Data Mesh Management
- **Data Products**: Catalog, Discovery, Assets, Lineage, Policies, Monitoring
- **Data Domains**: Catalog, Discovery, Assets, Lineage, Policies, Monitoring

### 2. Governance
- **Identity**: Tenants, Users, Accounts, Teams, Branches
- **Access Control**: Roles, Permissions, Policies, Assets, Entitlements
- **RBAC & Admin**: Casbin engine, Admin tools

### 3. Business Modules
- **Retail**: POS, E-commerce, Orders, Transactions
- **Loyalty**: CRM, Customers, Rewards, Campaigns
- **Inventory**: Stock, Warehouse, Fleet, Forecasting
- **Hotel**: Rooms, Bookings, Guests, Maintenance

### 4. Communication
- **Chat**: Messaging platform, Team chat
- **Notification**: Templates, Delivery, Monitoring

### 5. Utilities
- **Files**: File storage and management
- **Settings**: Application settings

## Architecture Patterns

### Module-Based Architecture
- Each feature is a lazy-loaded module
- Standalone components with imports array
- Route-based code splitting

### Service Layer
- Singleton services for state management
- HTTP interceptors for auth tokens
- Guard-based route protection

### Component Hierarchy
```
AppComponent
└── MainLayout
    ├── Sidebar (navigation)
    ├── Header (app switcher, theme, user menu)
    └── RouterOutlet (feature content)
```

## Authentication & Authorization

- JWT-based authentication via HTTP interceptors
- Role-based access control (RBAC)
- Casbin engine for policy enforcement
- Tenant-level isolation

## Build & Deployment

```bash
npm run build  # Builds to dist/open-mesh
npm run deploy # Deploys via angular-cli-ghpages
```

Base href: `/`

## Current Apps (App Switcher)

- Governance
- Support
- Inventory Management
- Files
- Settings