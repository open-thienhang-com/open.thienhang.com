## 1. Model & Service Foundation

- [ ] 1.1 Add `BlogPost`, `BlogAuthor`, `TravelAnalytics`, `UploadResult` interfaces to `travel.model.ts`, replacing/extending the broken `Trip` model
- [ ] 1.2 Refactor `TravelService.listTrips()` to call `GET /data-mesh/domains/blogger/posts` with optional category/tag/author filters
- [ ] 1.3 Refactor `TravelService.getTrip(id)` to call `GET /data-mesh/domains/blogger/posts/{id}`
- [ ] 1.4 Add `TravelService.getTrending()` calling `GET /data-mesh/domains/blogger/posts/trending`
- [ ] 1.5 Add `TravelService.getAnalytics()` calling `GET /data-mesh/domains/blogger/analytics`
- [ ] 1.6 Add `TravelService.getAuthors()` calling `GET /data-mesh/domains/blogger/authors`
- [ ] 1.7 Add `TravelService.uploadMedia(file, provider)` calling `POST /data-mesh/domains/uploads/{provider}` (default: imgur)
- [ ] 1.8 Ensure all service methods use Angular Signals for `loading`, `posts`, `selectedPost` state

## 2. Trip List View (Travel Blog Explorer)

- [ ] 2.1 Update `trip-list.component.ts` to consume `BlogPost[]` from the refactored `TravelService`
- [ ] 2.2 Add sidebar category/tag filter UI that calls `TravelService.listTrips({category, tag})`
- [ ] 2.3 Implement glassmorphic post cards showing title, author avatar, category badge, published date, and tags
- [ ] 2.4 Add skeleton loading cards during fetch
- [ ] 2.5 Add "No destinations found" empty state with a "View Trending" CTA
- [ ] 2.6 Update `trip-list.component.scss` with the Explorer layout matching the Retail/Travel design system

## 3. Trip Detail View

- [ ] 3.1 Update `trip-detail.component.ts` to call `TravelService.getTrip(id)` and display the full `BlogPost` detail
- [ ] 3.2 Add a "Post Analytics" panel calling `GET /data-mesh/domains/blogger/posts/{id}/analytics`
- [ ] 3.3 Add a "Trending Nearby" section using `TravelService.getTrending()` filtered to same category
- [ ] 3.4 Add post comments count from `GET /data-mesh/domains/blogger/posts/{id}/comments`
- [ ] 3.5 Ensure glassmorphic hero image, metadata row, and content section match the premium design system

## 4. Trip Create View (Media Upload Integration)

- [ ] 4.1 Update `trip-create.component.ts` to include a "Cover Photo" upload step
- [ ] 4.2 Implement file picker triggering `TravelService.uploadMedia(file)` on selection
- [ ] 4.3 Display upload progress/preview after successful upload; store returned URL in form state
- [ ] 4.4 Show error toast and retry button on upload failure
- [ ] 4.5 Make Imgur the default provider; add optional dropdown for Supabase/GCS

## 5. Travel Analytics Dashboard (New Page)

- [ ] 5.1 Generate `travel-analytics.component.ts/html/scss` and register route at `/travel/analytics`
- [ ] 5.2 Display metric cards from `TravelService.getAnalytics()` (total posts, total views, avg engagement)
- [ ] 5.3 Render trending destinations list from `TravelService.getTrending()`
- [ ] 5.4 Render top author cards from `TravelService.getAuthors()`
- [ ] 5.5 Add the "Travel Analytics" menu item to `menu-config.ts` under the Travel group

## 6. Verification

- [ ] 6.1 Smoke test: navigate to Trip List and confirm posts load from Blogger API (no 404)
- [ ] 6.2 Smoke test: navigate to Trip Detail and confirm analytics panel loads
- [ ] 6.3 Smoke test: navigate to Trip Create and upload a test image; confirm URL is returned
- [ ] 6.4 Smoke test: navigate to Travel Analytics and confirm metric cards + trending list render
- [ ] 6.5 Verify no console errors or unhandled exceptions in any Travel view
- [ ] 6.6 Record browser walkthrough and update walkthrough.md
