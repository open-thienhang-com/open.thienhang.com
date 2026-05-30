# Design: Retail Management Unified Redesign

## Context
The current retail functionality in `open.thienhang.com` is fragmented into multiple menu groups ("Fresh Retail", "Inventory") and lacks a modern, high-fidelity aesthetic. This design proposes a unified "Retail Management" module that leverages Angular Signals for reactive state management and adopts a premium glassmorphic UI consistent with the Travel module.

## Goals / Non-Goals

**Goals:**
- **Consolidated Navigation**: Merge all retail-related routes under a single "Retail Management" group in `menu-config.ts`.
- **Premium UI System**: Implement `backdrop-filter`, 1px borders, and high-quality status gradients.
- **Reactive State**: Use Angular Signals for `products`, `orders`, and `customers` in their respective services.
- **Enhanced Product Catalog**: Create a high-fidelity 60/40 explorer view for product management.
- **Micro-interactions**: Use staggered animations for list loading and smooth transitions.

**Non-Goals:**
- **Backend Modifications**: No changes to `api.thienhang.com`.
- **New Features**: Only redesigning and refactoring existing functionality.

## Decisions

### 1. Unified Sidebar Architecture
Consolidate "Fresh Retail" and "Inventory" into:
- **Retail Management**
  - **Overview**: Unified dashboard with key metrics.
  - **Products**: Redesigned 60/40 catalog.
  - **Orders**: Timeline-based order tracking.
  - **Logistics**: (Inventory, Partners, Warehouses).
  - **Loyalty**: Redesigned marketing views.

### 2. Signal-based State Management
Transition from raw RxJS or local state to Signals in `RetailService`:
```typescript
products = signal<Product[]>([]);
selectedProductId = signal<string | null>(null);
loading = signal<boolean>(false);
```

### 3. Glassmorphic UI Tokens
Apply a shared design system across all retail views:
- **Background**: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(20px)`.
- **Borders**: `1px solid rgba(255, 255, 255, 0.1)`.
- **Typography**: Inter/Outfit with heavy weight for headers and subtle tracking for body text.

### 4. Itinerary-style Order Tracking
Reuse the `ItineraryTimelineComponent` logic to display order status:
- Order Placed -> Confirmed -> Shipped -> Delivered.

## Risks / Trade-offs

- **Performance**: Heavy use of `backdrop-filter` can be taxing on low-end hardware; will optimize with `will-change: transform`.
- **Integration**: Navigating between consolidated routes must handle URL redirects gracefully to maintain backward compatibility.
