## ADDED Requirements

### Requirement: Display blog posts as travel destinations
The system SHALL fetch and display blog posts from `GET /data-mesh/domains/blogger/posts` as a list of travel stories/destinations in the Trip List view.

#### Scenario: Load travel posts on page open
- **WHEN** the user navigates to the Trip List view
- **THEN** the system calls `GET /data-mesh/domains/blogger/posts` and renders each post as a travel story card with title, author, category, and tags

#### Scenario: Filter by category
- **WHEN** the user selects a category from the sidebar filter
- **THEN** the system calls `GET /data-mesh/domains/blogger/posts?category=<selected>` and updates the card grid reactively

#### Scenario: Filter by tag
- **WHEN** the user types a tag in the search field
- **THEN** the system filters posts using `?tag=<value>` and shows matching travel stories

#### Scenario: Empty state
- **WHEN** no posts match the applied filter
- **THEN** the system displays a "No destinations found" empty state with a CTA to view trending posts

#### Scenario: Loading state
- **WHEN** the API request is in-flight
- **THEN** the system displays glassmorphic skeleton cards matching the post card layout
