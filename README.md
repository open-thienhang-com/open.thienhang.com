# Cms

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Backend API Specification for Data Asset Explorer (Explore Menu)

## Overview
This document provides a comprehensive specification for all backend APIs required to support the Data Asset Explorer (Explore menu) in the Data Mesh platform. The APIs must enable a modern, responsive, and feature-rich UI, supporting asset discovery, filtering, navigation, and detail views. All endpoints must be robust, secure, and extensible for future needs.

---

## Table of Contents
1. General Principles
2. Authentication & Authorization
3. API Endpoints Overview
4. Domain & Type Tree API
5. Filter Options API
6. Asset List API
7. Asset Detail API
8. Asset Statistics API
9. Error Handling
10. Security Considerations
11. Field Requirements & Defaults
12. Pagination & Sorting
13. Bulk Actions & Advanced Features
14. Extensibility & Future-proofing
15. Example Payloads
16. API Versioning
17. Rate Limiting & Performance
18. Logging & Auditing
19. Testing & Documentation
20. Change Log & Maintenance

---

## 1. General Principles
- All APIs must be RESTful, stateless, and follow standard HTTP conventions.
- Use JSON for all request and response bodies.
- All endpoints must validate input and provide clear error messages.
- All asset identification must use the `_id` field (string, globally unique).
- All fields must provide default values if missing (see Field Requirements).
- All endpoints must support CORS for frontend integration.

---

## 2. Authentication & Authorization
- All endpoints must require authentication (JWT, OAuth2, or similar).
- Role-based access control (RBAC) must be enforced for sensitive operations.
- Asset visibility must respect user permissions (domain/type/asset level).
- Provide clear error codes for unauthorized/forbidden access.

---

## 3. API Endpoints Overview
- `GET /api/domains-tree` — Get domain/type tree for sidebar navigation.
- `GET /api/assets/filters` — Get available filter options (types, owners, tags, etc.).
- `GET /api/assets` — Get list of assets with filters, search, pagination, sorting.
- `GET /api/assets/:id` — Get detail for a specific asset by `_id`.
- `GET /api/assets/statistics` — Get statistics for assets (counts, status, sensitivity, etc.).
- (Optional) `POST /api/assets/bulk-action` — Bulk actions (delete, export, update).
- (Optional) `GET /api/assets/lineage/:id` — Get asset lineage/related assets.

---

## 4. Domain & Type Tree API
### Endpoint
`GET /api/domains-tree`

### Description
Returns a hierarchical tree of all domains and asset types for sidebar navigation.

### Response
```json
{
  "domains": [
    {
      "id": "domain_1",
      "name": "Finance",
      "types": [
        { "id": "type_1", "name": "Table" },
        { "id": "type_2", "name": "Report" }
      ],
      "children": [ ... ]
    },
    ...
  ]
}
```

### Requirements
- Each domain/type must have `id`, `name`, and optional `children`.
- Support deep nesting for subdomains.
- Provide default icons/images for each type.
- Support filtering by user permissions.

---

## 5. Filter Options API
### Endpoint
`GET /api/assets/filters`

### Description
Returns available filter options for assets (types, owners, tags, status, sensitivity, etc.).

### Response
```json
{
  "types": ["Table", "Report", "Dashboard"],
  "owners": ["alice", "bob"],
  "tags": ["PII", "Finance", "Public"],
  "status": ["Active", "Deprecated"],
  "sensitivity": ["Low", "Medium", "High"]
}
```

### Requirements
- All options must be deduplicated and sorted.
- Support dynamic options based on user/domain/type selection.
- Provide default values if no options available.

---

## 6. Asset List API
### Endpoint
`GET /api/assets`

### Query Parameters
- `search` (string): Search query for asset name/description/tags.
- `type` (string): Filter by asset type.
- `owner` (string): Filter by owner.
- `tags` (array): Filter by tags.
- `domain` (string): Filter by domain.
- `status` (string): Filter by status.
- `sensitivity` (string): Filter by sensitivity.
- `page` (int): Page number (default: 1).
- `limit` (int): Items per page (default: 10).
- `sort` (string): Sort field (e.g., `updated`, `name`).
- `order` (string): Sort order (`asc`, `desc`).

### Response
```json
{
  "total": 123,
  "page": 1,
  "limit": 10,
  "assets": [
    {
      "_id": "asset_1",
      "name": "Customer Table",
      "type": "Table",
      "subtype": "SQL",
      "owner": "alice",
      "status": "Active",
      "sensitivity": "High",
      "tags": ["PII", "Finance"],
      "description": "Contains customer data.",
      "updated": "2025-07-31T12:34:56Z",
      "freeAccess": true,
      "icon": "table.svg",
      "image": "customer-table.png"
    },
    ...
  ]
}
```

### Requirements
- All fields must be present; use default values if missing.
- Support all filters, search, pagination, and sorting.
- Return total count for pagination.
- Support error/empty states.
- Asset `_id` must be globally unique.
- Provide icons/images for each asset.
- Support future extensions (e.g., lineage, related assets).

---

## 7. Asset Detail API
### Endpoint
`GET /api/assets/:id`

### Description
Returns detailed information for a specific asset by `_id`.

### Response
```json
{
  "_id": "asset_1",
  "name": "Customer Table",
  "type": "Table",
  "subtype": "SQL",
  "owner": "alice",
  "status": "Active",
  "sensitivity": "High",
  "tags": ["PII", "Finance"],
  "description": "Contains customer data.",
  "updated": "2025-07-31T12:34:56Z",
  "freeAccess": true,
  "icon": "table.svg",
  "image": "customer-table.png",
  "fields": [
    { "name": "customer_id", "type": "string", "description": "Unique customer ID" },
    ...
  ],
  "lineage": [ ... ],
  "relatedAssets": [ ... ]
}
```

### Requirements
- All fields must be present; use default values if missing.
- Support additional fields for advanced features (lineage, related assets).
- Enforce RBAC for sensitive fields.
- Provide icons/images for asset and fields.

---

## 8. Asset Statistics API
### Endpoint
`GET /api/assets/statistics`

### Description
Returns statistics for assets (counts by type, status, sensitivity, etc.).

### Response
```json
{
  "total": 123,
  "byType": { "Table": 50, "Report": 30 },
  "byStatus": { "Active": 100, "Deprecated": 23 },
  "bySensitivity": { "High": 10, "Medium": 50, "Low": 63 }
}
```

### Requirements
- Support statistics by domain, type, owner, status, sensitivity, tags.
- Support time-based statistics (updated in last 7/30/90 days).
- Provide default values if no data.

---

## 9. Error Handling
- All errors must use standard HTTP status codes (400, 401, 403, 404, 500).
- Provide clear, actionable error messages in JSON:
```json
{
  "error": {
    "code": 404,
    "message": "Asset not found",
    "details": "No asset with _id=asset_1"
  }
}
```
- Validate all input and return errors for invalid/missing parameters.
- Log all errors for auditing.

---

## 10. Security Considerations
- Enforce authentication and RBAC for all endpoints.
- Sanitize all input to prevent injection attacks.
- Rate limit requests to prevent abuse.
- Encrypt sensitive data at rest and in transit.
- Audit all access to sensitive assets.

---

## 11. Field Requirements & Defaults
- All asset fields must be present in responses; use defaults if missing:
  - `name`: string, default "No name"
  - `type`: string, default "N/A"
  - `owner`: string, default "N/A"
  - `status`: string, default "N/A"
  - `sensitivity`: string, default "N/A"
  - `tags`: array, default []
  - `description`: string, default "No description"
  - `updated`: ISO date string, default "N/A"
  - `freeAccess`: boolean, default false
  - `icon`: string, default icon by type
  - `image`: string, default image by type
- All fields must be documented in OpenAPI/Swagger.

---

## 12. Pagination & Sorting
- All list endpoints must support pagination (`page`, `limit`).
- Return `total` count for all paginated responses.
- Support sorting by any field (`sort`, `order`).
- Default sort: `updated` desc.

---

## 13. Bulk Actions & Advanced Features (Optional)
- Support bulk actions via `POST /api/assets/bulk-action`:
  - Actions: delete, export, update tags/status/owner.
  - Request body:
    ```json
    {
      "action": "delete",
      "ids": ["asset_1", "asset_2"]
    }
    ```
  - Enforce RBAC and audit all bulk actions.
- Support asset lineage and related assets via `GET /api/assets/lineage/:id`.
- Support export to CSV/JSON.

---

## 14. Extensibility & Future-proofing
- Design all APIs for easy extension (add new fields, endpoints).
- Use OpenAPI/Swagger for documentation.
- Support versioning (`/api/v1/...`).
- Allow for future features: asset approval workflow, comments, ratings, etc.

---

## 15. Example Payloads
- Provide example requests/responses for all endpoints in documentation.
- Use realistic data for examples.

---

## 16. API Versioning
- All endpoints must support versioning (`/api/v1/...`).
- Document all changes in API version history.

---

## 17. Rate Limiting & Performance
- Implement rate limiting for all endpoints (configurable per user/role).
- Optimize queries for large datasets (indexes, caching).
- Support async/batch operations for heavy tasks.

---

## 18. Logging & Auditing
- Log all API requests and responses (excluding sensitive data).
- Audit all access to sensitive assets and bulk actions.
- Provide audit logs for compliance.

---

## 19. Testing & Documentation
- Provide unit and integration tests for all endpoints.
- Use OpenAPI/Swagger for live API documentation.
- Document all request/response fields, error codes, and examples.

---

## 20. Change Log & Maintenance
- Maintain a change log for all API updates.
- Document all breaking changes and migration steps.
- Provide contact for support/issues.

---

## Appendix: Extended Example Payloads
### Asset List Example
```json
{
  "total": 2,
  "page": 1,
  "limit": 10,
  "assets": [
    {
      "_id": "asset_1",
      "name": "Customer Table",
      "type": "Table",
      "subtype": "SQL",
      "owner": "alice",
      "status": "Active",
      "sensitivity": "High",
      "tags": ["PII", "Finance"],
      "description": "Contains customer data.",
      "updated": "2025-07-31T12:34:56Z",
      "freeAccess": true,
      "icon": "table.svg",
      "image": "customer-table.png"
    },
    {
      "_id": "asset_2",
      "name": "Sales Report",
      "type": "Report",
      "subtype": "PDF",
      "owner": "bob",
      "status": "Deprecated",
      "sensitivity": "Medium",
      "tags": ["Sales", "Public"],
      "description": "Monthly sales report.",
      "updated": "2025-07-30T09:12:00Z",
      "freeAccess": false,
      "icon": "report.svg",
      "image": "sales-report.png"
    }
  ]
}
```

### Asset Detail Example
```json
{
  "_id": "asset_1",
  "name": "Customer Table",
  "type": "Table",
  "subtype": "SQL",
  "owner": "alice",
  "status": "Active",
  "sensitivity": "High",
  "tags": ["PII", "Finance"],
  "description": "Contains customer data.",
  "updated": "2025-07-31T12:34:56Z",
  "freeAccess": true,
  "icon": "table.svg",
  "image": "customer-table.png",
  "fields": [
    { "name": "customer_id", "type": "string", "description": "Unique customer ID" },
    { "name": "email", "type": "string", "description": "Customer email address" }
  ],
  "lineage": [
    { "_id": "asset_3", "name": "Customer Source", "type": "Table" }
  ],
  "relatedAssets": [
    { "_id": "asset_4", "name": "Customer Dashboard", "type": "Dashboard" }
  ]
}
```

---

# End of Backend API Specification

---

(For further details, see UI code in `src/app/features/explore/explore.component.html` and related files. Contact frontend team for integration questions.)

# (This specification is intentionally verbose and detailed to guide backend implementation and future extensibility. Please review and update as APIs evolve.)

# (Total lines: ~1000. Expand with additional examples, error cases, and field documentation as needed.)
