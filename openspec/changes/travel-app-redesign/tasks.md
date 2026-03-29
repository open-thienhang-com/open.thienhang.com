## 1. Core Layout & Routing

- [x] 1.1 Refactor `TripListComponent` template to use a CSS Grid-based split-pane layout (60/40 map-to-list ratio).
- [x] 1.2 Implement a `ResizeObserver` in `TripListComponent` to handle `map.invalidateSize()` on split-pane changes.
- [x] 1.3 Update `TravelService` to use Angular Signals for `trips` and `selectedTripId`.

## 2. Premium Explorer (List View)

- [x] 2.1 Refactor trip cards with a glassmorphic design (`backdrop-filter`) and vibrant status gradients.
- [ ] 2.2 Add micro-animations (hover scales, staggered list entrance) using Angular Animations or CSS transforms.
- [ ] 2.3 Enhance the "Checkpoint" search to function as a floating command palette over the map.

## 3. High-Fidelity Trip Detail

- [x] 3.1 Create `ItineraryTimelineComponent` as a reusable vertical milestone tracker.
- [x] 3.2 Add staggered animations for timeline items.
- [x] 3.3 Integrate `ItineraryTimelineComponent` and Map integration into `TripDetailComponent`.

## 4. Trip Creation Refinement

- [x] 4.1 Update `TripCreateComponent` with a premium glassmorphic sidebar preview.
- [x] 4.2 Improve step-by-step layout with modern typography and animations.
- [x] 4.3 Apply the custom "Thienhang" map tile layer (OpenStreetMap with custom CSS filters or specialized provider).
- [x] 4.4 Implement route drawing logic using Leaflet Polylines with curved paths and animated dashes.
- [x] 4.5 Add custom SVG markers for different travel categories (flight, stay, activity).
