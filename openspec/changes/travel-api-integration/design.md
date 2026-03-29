## Context

The Travel module (`open.thienhang.com`) was built against a `/data-mesh/domains/travel/trips/*` API that does not exist in the live backend (`api.thienhang.com`). The `TravelService` and all three page components (`trip-list`, `trip-detail`, `trip-create`) currently fail silently due to 404 responses.

The live API (`api.thienhang.com`) exposes the **Blogger domain** — a full-featured set of endpoints for reading blog posts, authors, analytics, trending content, and comments — which is a natural fit for representing travel destinations and stories. The API also provides an **Uploads domain** for multi-cloud media uploads, which integrates into trip creation flows.

The existing UI framework is Angular 17+ with Signals-based state management and a premium glassmorphic design system established in the Travel and Retail redesigns.

## Goals / Non-Goals

**Goals:**
- Reconnect all Travel views to live, functional API endpoints from the Blogger domain.
- Remodel the "Trip" concept as a "Travel Story / Blog Post" backed by `GET /data-mesh/domains/blogger/posts`.
- Add a Travel Analytics Dashboard using `/data-mesh/domains/blogger/analytics` and trending/author endpoints.
- Integrate photo upload into trip creation using the Uploads domain.
- Maintain the premium glassmorphic design consistent with the established design system.
- Use Angular Signals throughout for reactive state management.

**Non-Goals:**
- No backend changes of any kind.
- No custom domain/trip database — rely solely on the live API.
- No authentication changes — existing token flow is preserved.
- No changes to Retail or other modules.

## Decisions

### D1: Use Blogger Posts as Travel Stories
**Decision**: Map `GET /data-mesh/domains/blogger/posts` → Trip List; `GET /data-mesh/domains/blogger/posts/{post_id}` → Trip Detail.

**Rationale**: The Blogger domain is the only content domain in the live API that offers rich filtering (category, tag, author, status), pagination, and analytics. The "Travel Story" metaphor maps naturally to blog posts — each post represents a destination or travel experience.

**Alternatives considered**:
- Building mock/static data: Rejected — defeats the purpose of API integration.
- Using Governance/Users as trip members: Too indirect and not semantically appropriate.

### D2: Uploads Domain for Media
**Decision**: Use `POST /data-mesh/domains/uploads/imgur` (default) with fallback to `/supabase` and `/gcs` for photo uploads in trip creation.

**Rationale**: Imgur is the simplest option with no bucket setup required. The Uploads domain provides a consistent API surface regardless of provider, reducing future migration cost.

**Alternatives considered**:
- Local file upload only: Rejected — no persistence, no CDN.

### D3: Retain Angular Signals Architecture
**Decision**: Keep the existing Signal-based reactive architecture in `TravelService`. Replace Observable chains with Signal-friendly `tap` + `signal.set()` patterns already established.

**Rationale**: Consistency with Retail and existing Travel redesign. Avoids mixing reactive paradigms.

### D4: TravelService API Surface Remapping

| Old (broken) endpoint | New (live) endpoint |
|---|---|
| `GET /data-mesh/domains/travel/trips` | `GET /data-mesh/domains/blogger/posts?category=travel` |
| `GET /data-mesh/domains/travel/trips/{id}` | `GET /data-mesh/domains/blogger/posts/{id}` |
| `GET /data-mesh/domains/blogger/posts/trending` | Trip Explorer "Trending" section |
| `GET /data-mesh/domains/blogger/analytics` | Analytics Dashboard |
| `GET /data-mesh/domains/blogger/authors` | Author/Trip Leader cards |
| `POST /data-mesh/domains/uploads/imgur` | Media upload in trip creation |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Blogger domain may require authentication for some endpoints | Wrap calls with existing JWT interceptor; handle 401 gracefully |
| Post data schema doesn't match `Trip` model | Create a `BlogPost` model and adapter functions in `travel.model.ts`; keep legacy `Trip` type for reference |
| Imager upload size limits on free Imgur tier | Display warning in UI; offer Supabase as fallback option |
| Category filtering returns empty if no travel-tagged posts | Show helpful empty state with "Explore trending" CTA instead |

## Migration Plan

1. Extend `travel.model.ts` with `BlogPost`, `Author`, `TravelAnalytics` interfaces.
2. Refactor `TravelService` methods to call Blogger + Uploads APIs, keeping the same method signatures where possible.
3. Update `trip-list.component.*` to render `BlogPost[]` instead of `Trip[]`.
4. Update `trip-detail.component.*` to display post analytics and related trending posts.
5. Update `trip-create.component.*` to include the media upload step.
6. Add a new `travel-analytics.component.*` for the analytics dashboard panel.
7. Update `menu-config.ts` to add "Travel Analytics" menu item.
8. No rollback needed — all changes are frontend-only.
