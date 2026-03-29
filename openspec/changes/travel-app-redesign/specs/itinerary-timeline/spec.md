## ADDED Requirements

### Requirement: itinerary-visualization
The system MUST provide a vertical, visual representation of trip activities.

#### Scenario: Display daily activities
- **WHEN** a user selects a specific trip date
- **THEN** the system shows a vertical timeline of all events (flights, stays, tours) with icons and time markers.

### Requirement: animated-milestones
Timeline items MUST animate into view sequentially.

#### Scenario: Entrance animation
- **WHEN** the trip detail page is loaded
- **THEN** each timeline item fades and slides in from the bottom with a staggered delay.
