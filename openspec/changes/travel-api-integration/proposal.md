## Why

The Travel module currently calls `/data-mesh/domains/travel/trips/*` endpoints that do not exist in the live API (`api.thienhang.com`). As a result, all Trip CRUD operations fail silently. The API does expose rich domains (Blogger, Uploads, Authentication, Data Governance) that can be leveraged to build a meaningful Travel experience. This change reconnects the UI to working APIs and introduces new premium views.

## What Changes

- **BREAKING**: Replace non-existent `/data-mesh/domains/travel/trips/*` service calls with real API endpoints from the Blogger domain (travel posts, destinations as blog posts) and other available domains.
- Introduce a **Travel Blog Explorer** view — listing travel-themed blog posts from the Blogger domain (`GET /data-mesh/domains/blogger/posts`) as destinations/stories.
- Introduce a **Trip Media Uploader** capability — integrating the Uploads domain (`POST /data-mesh/domains/uploads/imgur`, `/supabase`, `/gcs`) into the Trip creation flow for rich photo attachments.
- Update the **Trip Detail** view to display blog post analytics and trending destinations using `/data-mesh/domains/blogger/posts/{post_id}/analytics` and `/data-mesh/domains/blogger/posts/trending`.
- Refactor `TravelService` to use only confirmed, live API endpoints and Angular Signals throughout.
- Refresh all Travel views with the premium glassmorphic design system already established in the Retail and Travel redesigns.
- Add a **Dashboard / Analytics** panel for trip-related blog metrics (views, authors, comments).

## Capabilities

### New Capabilities

- `travel-blog-explorer`: Browse travel blog posts from the Blogger domain as destinations, with filtering by category, tag, and author.
- `trip-media-upload`: Upload trip photos via the Uploads domain (Imgur, Supabase, GCS options). Integrated into trip creation and detail views.
- `travel-analytics-dashboard`: Display blog-based travel analytics (trending posts, author stats, overall performance). New dedicated panel.
- `travel-api-service`: Refactored TravelService binding to live Blogger + Uploads domain APIs with Signal-based reactive state.

### Modified Capabilities

- `trip-list`: Replace non-functional trip data with live blog posts from Blogger domain, display travel-themed cards with author, category, tags.
- `trip-detail`: Augment detail view with real post analytics and related trending posts.
- `trip-create`: Add media upload step using the Uploads domain API.

## Impact

- **Files**: `travel.service.ts`, `trip-list.component.*`, `trip-detail.component.*`, `trip-create.component.*`, `travel.model.ts`, `menu-config.ts`
- **APIs**: Connects to `GET /data-mesh/domains/blogger/posts`, `GET /data-mesh/domains/blogger/posts/trending`, `GET /data-mesh/domains/blogger/analytics`, `GET /data-mesh/domains/blogger/authors`, `GET /data-mesh/domains/blogger/posts/{post_id}`, `POST /data-mesh/domains/uploads/*`
- **No backend changes**: UI-only, zero backend modifications.
- **Design**: Aligns with the premium glassmorphic design system from the Retail redesign.
