# Proposal: Retail Management Unified Redesign

## 1. Summary
Redesign and consolidate the current fragmented Retail experience in `open.thienhang.com` into a single, high-fidelity "Retail Management" module. This initiative will align the Retail UI/UX with the premium, glassmorphic design language recently implemented for the Travel module, while ensuring full integration with existing APIs at `api.thienhang.com`.

## 2. Motivation
The current Retail implementation is split across "Fresh Retail" and "Inventory" menu groups, leading to a disconnected user experience. Furthermore, the UI lacks the modern "WOW" factor of the newer modules. By consolidating these features and adopting a reactive, Signal-based architecture, we can provide a seamless, performant, and premium administrative platform for retail operations.

## 3. Goals & Objectives
- **Consolidation**: Merge "Fresh Retail" and "Inventory" into a unified "Retail Management" sidebar group.
- **Premium Design**: Implement a glassmorphic UI with vibrant aesthetics, staggered animations, and modern typography.
- **Reactive Architecture**: Refactor services and components to use Angular Signals for state management (Products, Orders, Customers).
- **Zero Backend Changes**: Utilize existing APIs at `https://api.thienhang.com/data-mesh/domains/retail/` without modifications.
- **Enhanced Discovery**: Implement a high-fidelity Product Catalog with a 60/40 split-pane (Map/Grid vs. Detail) similar to the Travel Explorer.

## 4. Key Performance Indicators (KPIs)
- **Visual Consistency**: 100% alignment with the new `open.thienhang.com` design system.
- **Performance**: Significant reduction in perceived lag through Signal-based reactivity.
- **Usability**: Reduced click-depth for common retail tasks (Order confirmation, Stock updates).

## 5. Scope
- **Menu/Layout**: Update `menu-config.ts` and sidebar structure.
- **Product Catalog**: Redesign `/retail/products` and `/retail/inventory/products`.
- **Order Management**: Redesign `/retail/orders` with timeline tracking.
- **Inventory/Analytics**: High-fidelity dashboard for stocks and low-stock alerts.
- **Customer/Partner CRM**: Premium list/detail views for `/retail/customers` and `/retail/partners`.

## 6. Constraints & Assumptions
- **API Availability**: Assumes full availability of endpoints defined in `https://api.thienhang.com/openapi.json`.
- **Styling**: Must use vanilla CSS with Backdrop Filter support.
- **Reused Components**: Leverage `ItineraryTimelineComponent` principles for Order status tracking.
