## Why

The current Travel application in `open.thienhang.com` provides functional trip management but lacks the "Premium" and "Wow" factor expected from the thienhang.com platform. To align with modern design standards (like Airbnb, Hopper, or luxury travel concierges), the app needs a significant aesthetic and functional upgrade. 

Redesigning the app will:
- Establish a high-end, immersive user experience.
- Improve the discoverability of trip details through better spatial organization.
- Enhance the "Checkpoint" feature into a more integrated, interactive travel assistant.
- Standardize the UI using the platform's latest design tokens (glassmorphism, vibrant gradients, and fluid micro-animations).

## What Changes

The redesign will transform the Travel module from a standard administrative tool into a luxury travel planning suite:

1. **Immersive Trip Explorer**: Replace the standard grid with a high-fidelity "Explorer" view featuring card-based storytelling and rich metadata (weather, local time, and destination highlights).
2. **Integrated Checkpoint Map**: Merge the "Checkpoint" sidebar into a full-screen or split-pane interactive map experience that feels native and responsive.
3. **Glassmorphic Navigation**: Implement a sleek, semi-transparent navigation and filter system.
4. **Enhanced Detail View**: Refactor the trip detail page to include an itinerary timeline with visual milestones and media attachments.
5. **Fluid Create Flow**: A multi-step, animated "Trip Wizard" to make planning feel effortless.

## Capabilities

### New Capabilities
- `itinerary-timeline`: A vertical, animated timeline for daily trip activities and logistics.
- `map-integration-v2`: Enhanced interactive map with custom markers, route drawing, and "POIs" (Points of Interest) overlay.
- `travel-media-gallery`: Support for uploading and viewing destination photos or document scans.

### Modified Capabilities
- `trip-management`: Update core trip DTOs to support richer metadata (itinerary items, media links).

## Impact

- **Frontend**: Significant updates to `TripListComponent`, `TripDetailComponent`, and `TravelService`.
- **UI System**: Increased usage of premium animations and glassmorphic CSS utilities.
- **Dependencies**: Potential addition of `ngx-leaflet` or similar for better Angular-Leaflet integration if needed, though standard Leaflet is retained for performance.
