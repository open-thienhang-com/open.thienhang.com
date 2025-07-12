# API Paths Fix Summary

## Overview
Updated all governance service endpoints to match the exact API structure documented in the OpenAPI specification.

## Changes Made

### 1. Users Management
- **Changed**: `/governance/users` → `/governance/users/users`
- **Changed**: `/governance/user/{id}` → `/governance/users/user/{id}`
- **Changed**: HTTP method from `PUT` → `PATCH` for updates
- **Updated endpoints**:
  - `getUsers()` - GET `/governance/users/users`
  - `getUser(id)` - GET `/governance/users/user/{id}`
  - `createUser()` - POST `/governance/users/user`
  - `updateUser()` - PATCH `/governance/users/user/{id}`
  - `assignUserToTeam()` - POST `/governance/users/user/{userId}/team/{teamId}`
  - `removeUserFromTeam()` - DELETE `/governance/users/user/{userId}/team/{teamId}`
  - `getUserTeams()` - GET `/governance/users/user/{userId}/teams`

### 2. Accounts Management
- **Changed**: `/governance/accounts` → `/governance/accounts/accounts`
- **Changed**: `/governance/account/{id}` → `/governance/accounts/account/{id}`
- **Changed**: HTTP method from `PUT` → `PATCH` for updates
- **Removed**: `createAccount()` method (not available in API)
- **Removed**: `deleteAccount()` method (not available in API)
- **Removed**: `activateAccount()` and `deactivateAccount()` methods (not available in API)
- **Updated endpoints**:
  - `getAccounts()` - GET `/governance/accounts/accounts`
  - `getAccount(id)` - GET `/governance/accounts/account/{id}`
  - `updateAccount()` - PATCH `/governance/accounts/account/{id}`

### 3. Teams Management
- **Already correct**: `/governance/teams/teams` and `/governance/teams/team/{id}`
- **Changed**: HTTP method from `PUT` → `PATCH` for updates
- **Updated endpoints**:
  - `getTeams()` - GET `/governance/teams/teams`
  - `getTeam(id)` - GET `/governance/teams/team/{id}`
  - `createTeam()` - POST `/governance/teams/team`
  - `updateTeam()` - PATCH `/governance/teams/team/{id}`
  - `deleteTeam()` - DELETE `/governance/teams/team/{id}`

### 4. Roles Management
- **Changed**: `/governance/roles` → `/governance/roles/roles`
- **Changed**: `/governance/role/{id}` → `/governance/roles/role/{id}`
- **Changed**: HTTP method from `PUT` → `PATCH` for updates
- **Updated endpoints**:
  - `getRoles()` - GET `/governance/roles/roles`
  - `getRole(id)` - GET `/governance/roles/role/{id}`
  - `createRole()` - POST `/governance/roles/role`
  - `updateRole()` - PATCH `/governance/roles/role/{id}`
  - `deleteRole()` - DELETE `/governance/roles/role/{id}`

### 5. Permissions Management
- **Changed**: `/governance/permissions` → `/governance/permissions/permissions`
- **Changed**: `/governance/permission/{id}` → `/governance/permissions/permission/{id}`
- **Changed**: HTTP method from `PUT` → `PATCH` for updates
- **Updated endpoints**:
  - `getPermissions()` - GET `/governance/permissions/permissions`
  - `getPermission(id)` - GET `/governance/permissions/permission/{id}`
  - `createPermission()` - POST `/governance/permissions/permission`
  - `updatePermission()` - PATCH `/governance/permissions/permission/{id}`
  - `deletePermission()` - DELETE `/governance/permissions/permission/{id}`

### 6. Policies Management
- **Changed**: `/governance/policies` → `/governance/policies/policies`
- **Changed**: `/governance/policy/{id}` → `/governance/policies/policy/{id}`
- **Changed**: HTTP method from `PUT` → `PATCH` for updates
- **Removed**: `activatePolicy()` and `deactivatePolicy()` methods (not available in API)
- **Added**: `getPoliciesByRole()` and `getPoliciesBySubject()` methods
- **Updated endpoints**:
  - `getPolicies()` - GET `/governance/policies/policies`
  - `getPolicy(id)` - GET `/governance/policies/policy/{id}`
  - `createPolicy()` - POST `/governance/policies/policy`
  - `updatePolicy()` - PATCH `/governance/policies/policy/{id}`
  - `deletePolicy()` - DELETE `/governance/policies/policy/{id}`
  - `getPoliciesByRole(roleId)` - GET `/governance/policies/policies/by-role/{roleId}`
  - `getPoliciesBySubject(subjectId)` - GET `/governance/policies/policies/by-subject/{subjectId}`

### 7. Assets Management
- **Already correct**: `/governance/assets/assets` and `/governance/assets/asset/{id}`
- **Already using PATCH**: No changes needed

## API Pattern Consistency
All governance endpoints now follow the consistent pattern:
- **List endpoints**: `/governance/{resource}s/{resource}s`
- **Individual endpoints**: `/governance/{resource}s/{resource}/{id}`
- **HTTP methods**: GET, POST, PATCH, DELETE (no PUT methods)

## Benefits
1. **Exact API Alignment**: All endpoints now match the backend API specification
2. **Consistency**: All services follow the same naming and HTTP method conventions
3. **Reliability**: Eliminates API call failures due to incorrect endpoints
4. **Maintainability**: Easier to maintain and debug API integration issues

## Testing
All governance service methods have been updated and should be tested to ensure proper functionality with the backend API.
