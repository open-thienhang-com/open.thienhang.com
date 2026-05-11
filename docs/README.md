# open.thienhang.com

## Modular Monolithic Architecture

### Digital Enterprise Portal for Data Management and Governance

**Hang Tuan Thien**

University of the People

**MSIT 5910 - Capstone Project**

**Dr. Shabia Shabir**

**April 26, 2026**

---

## 1. Architecture Overview

The **open.thienhang.com** system is designed as a frontend web application employing a **Modular Monolithic Architecture**, directly aligned with Domain-Driven Design (DDD) principles (Evans, 2003). According to Summers (2020), a well-structured system architecture ensures that complex requirements are managed within cohesive functional units. By organizing the system into high-level modules—Data Mesh Management, Governance, and Business Operations—the design achieves high maintainability and low deployment complexity while still allowing for independent feature development. This approach addresses the digital divide in enterprise data management by providing a robust yet manageable platform.

The **open.thienhang.com** application serves as the frontend portal for the thienhang.com ecosystem, providing a unified interface for data management, governance, and business operations. Following the modular monolithic architecture pattern (Fowler, 2015), this frontend application decomposes complex enterprise requirements into isolated bounded contexts—such as data mesh, governance, and retail operations—ensuring that UI components remain highly cohesive while maintaining loose coupling between distinct functional domains.

---

## 2. System Architecture Blueprint and Module Design

### 2.1 Technology Stack

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

### 2.2 Functional Requirements (FRs)

| ID | Requirement | Module |
|----|------------|-------|
| FR1 | Data domain catalog management with visualization | Data Mesh Management |
| FR2 | Multi-faceted data asset discovery and lineage tracking | Data Mesh Management |
| FR3 | Role-based access control (RBAC) and policy enforcement | Governance |
| FR4 | Multi-tenant user and identity management | Governance |
| FR5 | Business intelligence dashboards and analytics | Business Modules |
| FR6 | Cross-module data visualization and reporting | Core |

### 2.3 Non-Functional Requirements (NFRs)

| ID | Requirement | Specification |
|----|------------|---------------|
| NFR1 | Scalability | Support lazy-loaded modules for optimal bundle size |
| NFR2 | Reliability | Route guards and error handling for 99.9% uptime |
| NFR3 | Security | JWT-based authentication with RBAC enforcement |
| NFR4 | Maintainability | Modular component architecture with clear separation of concerns |
| NFR5 | Performance | Code splitting and Ahead-of-Time (AOT) compilation |

---

## 3. Module-wise Breakdown

Following the methodology of Summers (2020), each module is defined by its specific inputs, methodologies, and outputs:

| Module Name | Input | Methodology | Output |
|------------|-------|------------|--------|
| Data Mesh Management | Domain catalogs, Data products, Asset metadata | Angular Components, PrimeNG Tables | Catalog views, Lineage graphs, Policy managers |
| Governance | Users, Roles, Permissions, Policies | Casbin RBAC Engine, JWT Auth | Access control UI, Admin tools |
| Retail Operations | Orders, Inventory, Customers | State management (RxJS) | POS interfaces, Order management |
| Loyalty & CRM | Customer profiles, Rewards, Campaigns | Service integration | Customer dashboards, Loyalty tracking |
| Inventory | Stock levels, Warehouses, Fleet | Forecasting integration | Stock views, Replenishment alerts |
| Hotel Management | Rooms, Bookings, Guests | Component-based UI | Booking system, Guest profiles |
| Travel | Trips, Itineraries, Maps | Leaflet integration | Travel planning, Map views |
| Chat & Notification | Messages, Templates | Real-time messaging | Inbox, Notification center |
| Files | Documents, Storage | File upload/download | File manager interface |
| Settings | Configuration, User preferences | Form components | Settings panels |

---

## 4. Project Structure and Organization

The project is organized to reflect the DDD-based modular architecture:

```
open.thienhang.com/
├── src/app/
│   ├── core/                    # Services, guards, interceptors
│   │   ├── config/            # Application configuration
│   │   ├── guard/           # Route guards (auth, role)
│   │   ├── interceptor/      # HTTP interceptors
│   │   └── services/       # Core services (auth, api)
│   ├── features/               # 31 Feature modules
│   │   ├── data-mesh-management/
│   │   ├── governance/
│   │   ├── explore/
│   │   ├── retail/
│   │   ├── loyalty/
│   │   ├── inventory/
│   │   ├── hotel/
│   │   ├── travel/
│   │   ├── chat/
│   │   └── ...
│   ├── layout/                # Layout components (sidebar, header)
│   ├── pages/                # Page-level components
│   └── shared/               # Shared components, pipes, directives
├── assets/                   # Static assets (images, fonts)
├── styles/                   # Global styles
└── views/                   # View templates
```

### 4.1 Directory Organization Principles

As emphasized by Davies (2024), clear directory organization ensures traceability and maintainability:

- **`/core`**: Contains authentication services, HTTP interceptors, and route guards—the foundational infrastructure.
- **`/features`**: Isolated directories for each domain to prevent logic leakage, following the "Don't Repeat Yourself" (DRY) principle.
- **`/layout`**: Shared layout components (Sidebar, Header) used across all modules.
- **`/shared`**: Global utilities such as pipes and directives used across all features.

---

## 5. Version Control and Collaboration

### 5.1 Repository Setup

The project utilizes a Git-based repository on GitHub, following best practices for enterprise development:

```
Repository: open.thienhang.com
https://github.com/open-thienhang-com/open.thienhang.com.git
```

### 5.2 Branching Approach

The project implements a **Feature-Branching workflow** to maintain code integrity and support collaborative development:

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `develop` | Integration branch for new features |
| `feature/*` | Feature-specific development |

As noted in Davies (2024), Git tools like `status` and `log` provide accountability. Traceability is maintained by linking commits to specific requirements (e.g., `feat: add domain catalog for FR1`). This systematic history allows the team to track changes and ensure a proactive approach to software quality (Summers, 2020).

---

## 6. Component Architecture

The application follows a hierarchical component structure:

```
AppComponent
└── MainLayout
    ├── Sidebar (navigation with app switcher)
    ├── Header (app switcher, theme toggle, user menu)
    └── RouterOutlet (feature content)
```

### 6.1 Key Components

| Component | Responsibility |
|-----------|--------------|
| `SidebarComponent` | Navigation, app switching, theme selection |
| `MainLayoutComponent` | Layout orchestration |
| Feature Components | Domain-specific UI (catalogs, governance, etc.) |
| Shared Components | Reusable UI elements (tables, forms, charts) |

---

## 7. Authentication and Authorization

The system implements robust security measures as outlined by Jones, Bradley, and Sakimura (2015):

- **JWT-based Authentication**: Secure token-based authentication via HTTP interceptors
- **Role-Based Access Control (RBAC)**: Casbin-powered policy enforcement
- **Route Guards**: Protection of sensitive routes based on user roles
- **Multi-tenant Isolation**: Tenant-level data separation

---

## 8. Build and Deployment

```bash
# Development
npm install
npm start

# Production build
npm run build  # Output: dist/open-mesh

# Deployment
npm run deploy # GitHub Pages
```

Base href: `/`

---

## 9. Conclusion

The **open.thienhang.com** frontend application demonstrates a well-architected enterprise portal built on Angular 19 with PrimeNG components. By employing a Modular Monolithic Architecture guided by Domain-Driven Design principles, the system achieves the necessary balance between maintainability, scalability, and deployment simplicity. The clear separation of concerns through isolated feature modules ensures that each bounded context—the Data Mesh, Governance, and Business Operations—can evolve independently while maintaining a cohesive user experience.

---

## References

Davies, S. (2024). *Effective Git for Enterprise Development*. O'Reilly Media.

Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley.

Fowler, M. (2015, March 10). Monolithic Architecture. MartinFowler.com. https://martinfowler.com/articles/monolithic-architecture/

Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)* (Request for Comments RFC 7519). Internet Engineering Task Force. https://datatracker.ietf.org/doc/html/rfc7519

Newman, S. (2021). *Building Microservices* (2nd ed.). O'Reilly Media.

Summers, E. J. (2020). *Software Architecture Patterns: A Guide to Effective Software Design and Architecture*. Tech Summit Press.