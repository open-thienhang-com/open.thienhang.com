## ADDED Requirements

### Requirement: custom-thienhang-tiles
The map MUST use a custom, high-contrast tile layer that matches the thienhang.com brand colors.

#### Scenario: Applied custom style
- **WHEN** the map initializes
- **THEN** it layer with muted blues and greys for geographical features.

### Requirement: route-visualization
The system MUST support drawing routes between selected checkpoints.

#### Scenario: Draw route
- **WHEN** multiple stops are selected for a trip
- **THEN** a curved, animated line is drawn between sequence markers on the map.
