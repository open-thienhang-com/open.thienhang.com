## Context

The current `TripListComponent` uses a standard bootstrap-like grid and a separate sticky sidebar for the map. This approach feels disjointed on larger screens and fails to provide an immersive experience. The redesign will adopt a "Split-Pane Workspace" pattern where the map and list are co-dependent, high-fidelity components.

## Goals / Non-Goals

**Goals:**
- Implement a 70/30 or 60/40 split-pane layout for the Trip Explorer.
- Create a glassmorphic sidebar for trip cards with vibrant status indicators.
- Develop a vertical "Itinerary Timeline" component for the Detail view.
- Introduce a "Quick Search" command palette for destinations.
- Standardize on Leaflet with custom "thienhang-style" tile layering.

**Non-Goals:**
- Porting to a different map provider (e.g., Google Maps).
- Complete backend rewrite (though DTOs will be extended).
- Offline support (out of scope for this UI refresh).

## Decisions

### 1. Unified Split-Pane Explorer
**Decision**: Use a CSS Grid layout with `grid-template-columns: 1fr 400px` (variable) for the main Explorer.
**Rationale**: Unlike the current sticky sidebar, this ensures the map is a first-class citizen and doesn't get pushed below the list on medium screens.

### 2. Angular Signal-based State
**Decision**: Refactor `TravelService` to use Angular Signals for trip state and selection.
**Rationale**: Simplifies the synchronization between the Map markers and the List selection state, promoting a "Select on Map, Highlight in List" interaction.

### 3. Glassmorphic Design System
**Decision**: Apply `backdrop-filter: blur()` and semi-transparent white/dark surfaces for all overlay components.
**Rationale**: Matches the `open.thienhang.com` premium aesthetic and provides a modern "app-like" feel.

## Risks / Trade-offs

- **[Risk] Performance with many map markers** → **[Mitigation]** Implement marker clustering or viewport-based loading if trips exceed 50.
- **[Risk] Leaflet/Angular Resize issues** → **[Mitigation]** Use `ResizeObserver` to call `map.invalidateSize()` automatically when the split-pane changes.
