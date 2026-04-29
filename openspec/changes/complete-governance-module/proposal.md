## Why

The Governance module in `open.thienhang.com` is currently incomplete, with several key features listed in the implementation plan either missing UI or having functional gaps. Completing this module is critical for providing a full multi-tenant RBAC management experience and synchronizing with the capabilities of `api.thienhang.com`.

## What Changes

- **New Casbin RBAC Manager**: A full-featured UI for managing policy rules, role assignments, and permission checking.
- **New Governance Admin Tools**: Tools for initializing permissions, roles, and syncing Casbin policies across tenants.
- **Enhanced Role Statistics**: Integration with real API metrics instead of client-side computations.
- **Improved Permission View**: Added support for viewing associated assets directly within the permission list.
- **Service Verification**: Comprehensive audit of `governance.services.ts` to ensure 100% alignment with `api.thienhang.com`.

## Capabilities

### New Capabilities
- `governance-rbac-engine`: Interactive management of Casbin policies and assignments.
- `governance-admin-init`: System-level initialization and synchronization tools for governance data.

### Modified Capabilities
- `governance-management`: Updating requirements for role statistics and permission-asset visualization.

## Impact

- **Frontend**: `src/app/features/governance/` will see significant additions.
- **API**: Better utilization of existing `/governance/casbin/*` and `/governance/init/*` endpoints.
- **User Experience**: Admins will have a unified dashboard for all governance tasks.
