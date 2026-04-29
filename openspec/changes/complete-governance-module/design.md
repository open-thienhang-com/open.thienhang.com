## Context

The `open.thienhang.com` frontend has the foundation for Governance but lacks the complex RBAC management tools and system administration utilities provided by the backend. Most service methods are already implemented in `governance.services.ts`, but the corresponding UI components are either missing or in an early state.

## Goals / Non-Goals

**Goals:**
- Provide a comprehensive Casbin RBAC management interface.
- Implement a Permission Checker for debugging access issues.
- Add system-level initialization tools for admins.
- Ensure all governance data is fetched from real API endpoints.
- Achieve a premium, responsive UI using PrimeNG.

**Non-Goals:**
- Refactoring the backend API.
- Implementing complex multi-factor authentication (out of scope for this module).
- Redesigning the entire application shell.

## Decisions

### D1: Tabbed Interface for Casbin Manager
**Choice**: Use a `p-tabView` with three tabs: "Policy Rules", "Role Assignments", and "Permission Checker".
**Rationale**: These three areas are distinct but highly related. A tabbed view provides a clean organization without forcing the user to navigate between pages.

### D2: Inline Editing for Policy Rules
**Choice**: Use a PrimeNG Table with inline editing capabilities or a simple "Add Rule" form row.
**Rationale**: Casbin rules are simple (sub, dom, obj, act). Inline actions reduce friction compared to opening full dialogs for every rule.

### D3: Interactive Permission Checker
**Choice**: A dedicated form where users can input parameters (user, tenant, path, method) and get an immediate ✅/❌ result.
**Rationale**: This is a powerful debugging tool for admins to verify complex RBAC configurations.

### D4: Admin Action Cards
**Choice**: Use `p-card` for distinct administrative actions (Init Permissions, Init Roles, Sync Policies).
**Rationale**: These are infrequent, high-impact actions. Grouping them into clearly labeled cards prevents accidental execution and provides space for descriptive text/warnings.

## Risks / Trade-offs

- **[Risk] Casbin Complexity**: Admins might find the raw sub/dom/obj/act format confusing. 
  - *Mitigation*: Provide clear labels and tooltips explaining each field.
- **[Trade-off] Multi-tenancy**: The UI must handle `tenant_id` consistently across all tabs.
  - *Decision*: Use a global tenant selector or a dropdown within the Casbin view to filter rules.
