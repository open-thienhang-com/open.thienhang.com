# Project Instructions & Implementation Guide

## Overview
This document outlines the implementation details, API integrations, UI improvements, and backend requirements for the Open Thien Hang project.

## Table of Contents
1. [API Integrations](#api-integrations)
2. [UI Improvements](#ui-improvements)
3. [Backend Requirements](#backend-requirements)
4. [Technical Specifications](#technical-specifications)
5. [File Structure](#file-structure)

## API Integrations

### 1. Data Mesh Domains API
**Location**: `src/app/core/services/data-mesh.services.ts`

**Implemented APIs:**
- `getDomainsList()` - Retrieve list of available domains
- `getDomainDetails(domainKey)` - Get detailed information for specific domain
- `getDomainCatalog()` - Get catalog of all domains with metadata

**Usage Example:**
```typescript
// Get all domains
this.dataMeshService.getDomainsList().subscribe(response => {
  this.domains = response.data;
});

// Get domain details with parallel API calls
forkJoin([
  this.dataMeshService.getDomainDetails(domainKey),
  this.dataMeshService.getDomainCatalog()
]).subscribe(([details, catalog]) => {
  // Process data
});
```

**Response Format:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}
```

### 2. Retail Application APIs
**Status**: Backend implementation required

**Base URL**: `/adapters/retail`

**Required Services:**
- ProductService (`/products`)
- InventoryService (`/stocks`)
- AnalyticsService (`/analytics`)
- OrderService (`/orders`)

**Detailed specification**: See [Backend API Implementation Request](#backend-api-implementation-request) section below.

## UI Improvements

### 1. All Applications Popup Redesign
**Location**: `src/app/layout/main-layout/sidebar/sidebar.component.scss`

**Features Implemented:**
- Neutral indigo header design
- Unique accent colors for each application type
- Balanced grid layout with auto-fit columns
- Responsive design for mobile/tablet/desktop
- Hover effects and animations
- Application separators and visual hierarchy

**Color Scheme:**
- Retail: Orange (#f59e0b)
- Governance: Purple (#8b5cf6)
- Planning: Cyan (#06b6d4)
- Marketplace: Green (#10b981)
- Blogger: Pink (#ec4899)
- Hotel: Orange (#f97316)
- Ad Manager: Lime (#84cc16)
- Settings: Gray (#6b7280)

### 2. Menu System Fixes
**Location**: `src/app/layout/main-layout/sidebar/sidebar.component.ts`

**Issue Fixed:**
- Marketplace application menu items (Database Explorer, Pipelines, Topics & Events, Containers, Advanced Search) not displaying

**Solution:**
- Added fallback logic in `computeVisibleGroups()` method
- Ensures Explore menu items appear for Marketplace app selection

### 3. Visual Enhancements
**Location**: `src/app/layout/main-layout/sidebar/sidebar.component.scss`

**Added Features:**
- Border separators between application tiles
- Horizontal separator line between grid rows
- Enhanced hover states and transitions
- Mobile-responsive separator hiding

## Backend Requirements

### Retail Application API Implementation

#### Technical Stack
- **Framework**: Node.js/Express or similar
- **Database**: PostgreSQL
- **Cache**: Redis (for inventory locking)
- **Authentication**: JWT Bearer Token
- **Documentation**: OpenAPI/Swagger

#### Database Schema
```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  images JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Warehouses table
CREATE TABLE warehouses (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INTEGER,
  current_stock_value DECIMAL(12,2) DEFAULT 0
);

-- Stocks table
CREATE TABLE stocks (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  warehouse_id UUID REFERENCES warehouses(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  warehouse_id UUID REFERENCES warehouses(id),
  movement_type VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id VARCHAR(100),
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);
```

#### API Endpoints

##### Product Management
```
GET    /adapters/retail/products              # List products
GET    /adapters/retail/products/{id}         # Get product
POST   /adapters/retail/products              # Create product
PUT    /adapters/retail/products/{id}         # Update product
DELETE /adapters/retail/products/{id}         # Delete product
```

##### Inventory Management
```
GET    /adapters/retail/stocks                # List stocks
GET    /adapters/retail/stocks/{id}           # Get stock entry
GET    /adapters/retail/stocks/low            # Low stock alerts
POST   /adapters/retail/stocks/update         # Update stock (with locking)
GET    /adapters/retail/warehouses            # List warehouses
```

##### Stock Movements
```
GET    /adapters/retail/stock-movements/{productId}  # Movement history
```

##### Order Management
```
GET    /adapters/retail/orders                # List orders
GET    /adapters/retail/orders/{id}           # Get order
POST   /adapters/retail/orders                # Create order
PUT    /adapters/retail/orders/{id}           # Update order
PATCH  /adapters/retail/orders/{id}/cancel    # Cancel order
DELETE /adapters/retail/orders/{id}           # Delete order
```

##### Analytics
```
GET    /adapters/retail/analytics/inventory          # Inventory analytics
GET    /adapters/retail/analytics/alerts             # Stock alerts
GET    /adapters/retail/analytics/products/{id}      # Product analytics
GET    /adapters/retail/analytics/warehouses/{id}    # Warehouse analytics
GET    /adapters/retail/analytics/categories         # Category analytics
```

#### Business Logic Requirements

##### Inventory Management
1. **Stock Level Validation**: Prevent negative stock levels
2. **Reorder Alerts**: Auto-generate alerts when stock ≤ reorder_level
3. **Concurrent Updates**: Redis-based locking mechanism (30s timeout, 3 retries)
4. **Stock Movement Tracking**: Log all stock changes with reasons

##### Product Management
1. **SKU Uniqueness**: Ensure unique SKUs across all products
2. **Category Management**: Dynamic category system
3. **Image Handling**: Support multiple product images (JSONB storage)
4. **Soft Delete**: Mark products as inactive instead of hard delete

##### Order Processing
1. **Stock Reservation**: Reserve stock when order is created
2. **Order Number Generation**: Auto-generate unique order numbers
3. **Status Workflow**: Enforce valid status transitions
4. **Inventory Deduction**: Only deduct stock on order confirmation

##### Analytics
1. **Real-time Calculations**: Cost/selling values, profit margins
2. **Alert System**: Configurable alert thresholds
3. **Performance Metrics**: Turnover rates, stock efficiency

#### Security & Performance

##### Authentication & Authorization
- JWT token validation on all endpoints
- Role-based access control (Admin, Manager, Staff)
- API rate limiting per user

##### Performance Requirements
- Response time < 200ms for simple queries
- Response time < 500ms for complex analytics
- Pagination for all list endpoints (default 20 items)
- Database query optimization with proper indexing
- Redis caching for frequently accessed data

##### Error Handling
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 500)
- Detailed error messages in response
- Input validation with clear error responses
- Database constraint violation handling

## Technical Specifications

### Frontend Stack
- **Framework**: Angular 17+
- **UI Library**: PrimeNG
- **Styling**: SCSS with CSS Variables
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient

### Backend Stack (Recommended)
- **Runtime**: Node.js 18+
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **ORM**: Prisma or TypeORM
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi or Zod
- **Documentation**: Swagger/OpenAPI

### Development Environment
- **Package Manager**: npm
- **Build Tool**: Angular CLI
- **Linting**: ESLint
- **Testing**: Jest (backend), Jasmine/Karma (frontend)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## File Structure

```
src/
├── app/
│   ├── core/
│   │   ├── config/
│   │   │   └── api-config.ts          # API base URLs and configuration
│   │   └── services/
│   │       ├── data-mesh.services.ts  # Data mesh API services
│   │       └── retail/
│   │           ├── retail.service.ts  # Retail API services
│   │           └── retail.models.ts   # Retail data models
│   ├── features/
│   │   ├── data-mesh/
│   │   │   ├── domain-catalog/        # Domain catalog component
│   │   │   └── domain-detail/         # Domain detail component
│   │   └── retail/
│   │       ├── product-catalog/       # Product catalog component
│   │       ├── inventory/             # Inventory management
│   │       └── orders/                # Order management
│   └── layout/
│       ├── main-layout/
│       │   └── sidebar/
│       │       ├── sidebar.component.html    # Sidebar template
│       │       ├── sidebar.component.scss    # Sidebar styles
│       │       └── sidebar.component.ts      # Sidebar logic
│       └── menu-config.ts             # Menu configuration
├── assets/
└── styles/
```

## Implementation Checklist

### Frontend ✅
- [x] Data Mesh API integration
- [x] Retail service models and interfaces
- [x] All Applications popup redesign
- [x] Menu system fixes for Marketplace
- [x] Visual separators and enhancements

### Backend 🔄
- [ ] Product management API
- [ ] Inventory management API
- [ ] Order management API
- [ ] Analytics API
- [ ] Authentication & authorization
- [ ] Database schema setup
- [ ] API documentation

### Testing 🔄
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] End-to-end tests for critical flows
- [ ] Performance testing

### Deployment 🔄
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Environment configuration
- [ ] Monitoring and logging

## Next Steps

1. **Backend Development**: Implement retail APIs according to specifications
2. **Testing**: Comprehensive testing of all APIs and frontend integration
3. **Performance Optimization**: Database indexing and query optimization
4. **Security Audit**: Review authentication and authorization
5. **Documentation**: Complete API documentation and user guides
6. **Deployment**: Production deployment with monitoring

## Contact Information

For questions or clarifications regarding this implementation:
- Frontend: Angular application with PrimeNG UI
- Backend: REST API with PostgreSQL and Redis
- Architecture: Microservices with API gateway pattern

---

**Last Updated**: January 31, 2026
**Version**: 1.0.0