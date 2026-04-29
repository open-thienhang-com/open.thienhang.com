## Requirements

### Requirement: Permission Initialization
The system shall provide a tool to auto-generate permissions based on existing API routes.

#### Scenario: Running Initialization
- **WHEN** the user selects "Auto-generate Permissions", optionally provides a `tenant_id`, and clicks "Initialize".
- **THEN** the system shall call `POST /governance/init/permissions` and show a success message with the result.

### Requirement: Role Initialization
The system shall allow creating default roles for a tenant.

#### Scenario: Initializing Default Roles
- **WHEN** the user provides a `tenant_id` and a list of role names and clicks "Initialize Roles".
- **THEN** the system shall call `POST /governance/init/roles`.

### Requirement: Casbin Policy Sync
The system shall provide a way to re-sync Casbin policies from the primary database (MongoDB).

#### Scenario: Syncing Policies
- **WHEN** the user clicks "Sync Casbin Policies".
- **THEN** the system shall call `POST /governance/init/casbin-sync`.
