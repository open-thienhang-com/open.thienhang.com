## ADDED Requirements

### Requirement: Display travel analytics overview
The system SHALL show key blog-driven analytics in a dedicated Travel Analytics panel using `GET /data-mesh/domains/blogger/analytics`.

#### Scenario: Load overall analytics
- **WHEN** the user navigates to the Travel Analytics page
- **THEN** the system calls `GET /data-mesh/domains/blogger/analytics` and renders metric cards for total posts, total views, and engagement rate

### Requirement: Show trending destinations
The system SHALL display trending blog posts using `GET /data-mesh/domains/blogger/posts/trending`.

#### Scenario: Trending list rendered
- **WHEN** the analytics page loads
- **THEN** the system calls `GET /data-mesh/domains/blogger/posts/trending?limit=5` and shows a ranked list with post title and engagement metrics

### Requirement: Show author statistics
The system SHALL display top travel authors using `GET /data-mesh/domains/blogger/authors`.

#### Scenario: Author cards rendered
- **WHEN** the analytics page loads
- **THEN** the system fetches authors and renders cards showing author name, number of posts, and total views
