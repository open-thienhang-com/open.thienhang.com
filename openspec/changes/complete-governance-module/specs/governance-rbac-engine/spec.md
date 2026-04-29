## Requirements

### Requirement: Policy Rule Management
The system shall allow administrators to list, add, and remove Casbin policy rules (p-rules).

#### Scenario: Listing Rules
- **WHEN** the user navigates to the RBAC Engine page and selects the Policy Rules tab.
- **THEN** the system shall fetch rules from `GET /governance/casbin/rules` and display them in a table.

#### Scenario: Adding a Rule
- **WHEN** the user provides `sub`, `dom`, `obj`, and `act` and clicks "Add Rule".
- **THEN** the system shall send a `POST` request to `/governance/casbin/rule` and refresh the list on success.

### Requirement: Role Assignment Management
The system shall allow administrators to assign and unassign roles to users (g-rules).

#### Scenario: Viewing User Roles
- **WHEN** the user enters a User TID and clicks "Search".
- **THEN** the system shall fetch roles from `GET /governance/casbin/user/:tid/roles` and display them.

### Requirement: Permission Checker
The system shall provide an interactive tool to verify if a user has permission for a specific resource path.

#### Scenario: Successful Permission Check
- **WHEN** the user provides `user`, `tenant_id`, `path`, and `method` and clicks "Check".
- **THEN** the system shall call `POST /governance/casbin/check` and display an "ALLOWED" badge if the API returns true.
