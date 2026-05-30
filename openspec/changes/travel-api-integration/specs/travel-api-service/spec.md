## ADDED Requirements

### Requirement: TravelService binds to live Blogger API
The system SHALL replace all `/data-mesh/domains/travel/*` calls in `TravelService` with equivalent calls to `/data-mesh/domains/blogger/*` endpoints.

#### Scenario: listTrips maps to blogger posts
- **WHEN** `TravelService.listTrips()` is called
- **THEN** it calls `GET /data-mesh/domains/blogger/posts` and returns a `BlogPost[]` array via Signal state

#### Scenario: getTrip maps to blogger post detail
- **WHEN** `TravelService.getTrip(id)` is called
- **THEN** it calls `GET /data-mesh/domains/blogger/posts/{id}` and returns the post detail

### Requirement: TravelService uses Angular Signals exclusively
The system SHALL manage all reactive state (loading, posts, selectedPost) via Angular Signals.

#### Scenario: Loading state signal updated during fetch
- **WHEN** any data fetch is initiated
- **THEN** `loading` Signal is set to `true`; on completion or error it is set to `false`

#### Scenario: BlogPost model defined
- **WHEN** the Blogger API returns a post object
- **THEN** it is mapped to the `BlogPost` interface defined in `travel.model.ts` with fields: `id`, `title`, `url`, `author`, `category`, `tags`, `published`, `images`
