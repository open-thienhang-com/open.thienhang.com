## 1. Sidebar & Menu Consolidation

- [ ] 1.1 Update `src/app/layout/menu-config.ts` to merge "Fresh Retail" and "Inventory" into a single "Retail Management" group.
- [ ] 1.2 Align icons and labels with the premium design system (e.g., uses `pi pi-shopping-cart` for the main group).
- [ ] 1.3 Ensure all legacy retail URLs redirect correctly to the new consolidated structure if necessary.

## 2. Reactive Service Refactoring

- [ ] 2.1 Refactor `RetailService` (and sub-services) to use Angular Signals for core state: `products`, `orders`, `stocks`.
- [ ] 2.2 Implement robust error handling and loading states using Signals (e.g., `loading = signal(false)`).
- [ ] 2.3 Verify API integration with `api.thienhang.com/data-mesh/domains/retail/` endpoints.

## 3. High-Fidelity UI Implementation

- [ ] 3.1 Implement "Retail Management Overview" dashboard with glassmorphic cards and SVG-based sparklines for sales/inventory metrics.
- [ ] 3.2 Redesign "Product Catalog" as a 60/40 explorer (Split-pane) with a high-performance grid and detailed side-peek.
- [ ] 3.3 Redesign "Order Management" using the `ItineraryTimelineComponent` pattern for status tracking.
- [ ] 3.4 Apply staggered entrance animations to all list views for a premium feel.

## 4. Verification & Polish

- [ ] 4.1 Perform end-to-end smoke test of the Retail module: Dashboard -> Catalog -> Order Detail.
- [ ] 4.2 Verify responsive behavior using `ResizeObserver` for the new split-pane layouts.
- [ ] 4.3 Finalize documentation and update the walkthrough with browser recordings of the new UI.
