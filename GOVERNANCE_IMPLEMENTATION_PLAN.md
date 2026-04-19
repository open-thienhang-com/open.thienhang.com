# Governance Feature — Complete Implementation Plan

**Source:** `https://api.thienhang.com/openapi.json`  
**Date:** 2026-04-19  
**Stack:** Angular 17+ standalone components, PrimeNG, RxJS

---

## Gap Analysis (Existing vs. API)

### Already Implemented
| Feature | Routes | Service | Status |
|---------|--------|---------|--------|
| Roles | list, new, detail | `getRoles`, `getRoleDetail`, `createRole`, `updateRole`, `deleteRole` | ✅ Functional |
| Permissions | list | `getPermissions`, `getPermission`, `createPermission`, `updatePermission`, `deletePermission` | ✅ Functional |
| Policies | list, new, detail | `getPolicies`, `getPolicy`, `createPolicy`, `updatePolicy`, `deletePolicy` | ✅ Functional |
| Users | list, detail | `getUsers`, `getUser`, `createUser`, `updateUser` | ✅ Partial |
| Teams | list, new | `getTeams`, `getTeam`, `createTeam` | ⚠️ Partial |
| Accounts | list, detail | `getAccounts`, `getAccount` | ⚠️ UI only |
| Assets | list, detail | via data-catalog API | ⚠️ Different API |

### Missing — Must Implement
| Feature | API Endpoints | Priority |
|---------|--------------|----------|
| **Tenants** | `/governance/tenant*`, `/governance/tenants`, `/governance/me/tenants` | 🔴 P1 |
| **Casbin RBAC engine** | `/governance/casbin/*` | 🔴 P1 |
| **Role statistics** | `GET /governance/role/statistics/overview` | 🟡 P2 |
| **Permissions with assets** | `GET /governance/permissions/assets` | 🟡 P2 |
| **Team detail page** | existing: `GET /governance/team/:id` | 🟡 P2 |
| **Governance Init admin** | `/governance/init/*` | 🟠 P3 |

### Service Bugs (Wrong Endpoints)
| Method | Current (Wrong) | Correct API |
|--------|----------------|-------------|
| `updateTeam` | PATCH `/governance/teams/${id}` | PATCH `/governance/team/${id}` |
| `deleteTeam` | DELETE `/governance/teams/${id}` | DELETE `/governance/team/${id}` |
| `createRole` | POST `/governance/roles` | POST `/governance/role` |
| Fake endpoints | activate/deactivate user/team, assign user to team | Not in API — remove |

---

## TypeScript Models to Add/Fix

### New Interfaces

```typescript
// governance.services.ts — add these

export interface Tenant {
  _id?: string;
  kid: string;
  name: string;
  description?: string;
  status: 'active' | 'suspended' | 'trial';
  owner?: string;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface TenantCreate {
  name: string;
  description?: string;
  status?: 'active' | 'suspended' | 'trial';
}

export interface TenantUpdate {
  name?: string;
  description?: string;
  status?: 'active' | 'suspended' | 'trial';
}

export interface TenantMember {
  user_id: string;
  role?: string;
}

export interface CasbinRule {
  sub: string;   // subject (role or user TID)
  dom: string;   // domain/tenant_id (use '*' for global)
  obj: string;   // object/resource path
  act: string;   // action (GET, POST, PUT, DELETE, *)
}

export interface CasbinAssign {
  user: string;      // user TID
  role: string;      // role name
  tenant_id: string; // tenant domain
}

export interface CasbinCheck {
  user: string;      // user TID
  tenant_id: string;
  path: string;      // resource path
  method: string;    // HTTP method
}
```

---

## Implementation Tasks

### Phase 1 — Fix Service Bugs

**File:** `src/app/core/services/governance.services.ts`

1. Fix `updateTeam`: change URL from `/governance/teams/${id}` → `/governance/team/${id}`
2. Fix `deleteTeam`: change URL from `/governance/teams/${id}` → `/governance/team/${id}`
3. Fix `createRole`: change URL from `/governance/roles` → `/governance/role` (use `createRoleWithPermissions` only)
4. Remove non-existent methods: `activateUser`, `deactivateUser`, `assignUserToTeam`, `removeUserFromTeam`, `activateTeam`, `deactivateTeam`, `getTeamMembers` (wrong endpoint), `addTeamMember`, `removeTeamMember`
5. Remove entirely fake service groups: Classifications, Retention Policies, Access Controls, Compliance Records (not in API)
6. Add missing real service methods (see Phase 1.5)

**New service methods to add:**

```typescript
// Tenants
getTenants(params?: {limit?: number; offset?: number; status?: string}): Observable<ApiResponse<PaginatedResponse<Tenant>>>
getTenant(kid: string): Observable<ApiResponse<Tenant>>
createTenant(data: TenantCreate): Observable<ApiResponse<Tenant>>
updateTenant(kid: string, data: TenantUpdate): Observable<ApiResponse<Tenant>>
deleteTenant(kid: string): Observable<ApiResponse<any>>  // soft delete/suspend
getTenantMembers(kid: string, params?: {limit?: number; offset?: number}): Observable<ApiResponse<any>>
inviteTenantMember(kid: string, data: TenantMember): Observable<ApiResponse<any>>
removeTenantMember(kid: string, userId: string): Observable<ApiResponse<any>>
getMyTenants(): Observable<ApiResponse<any>>

// Casbin
getCasbinRules(params?: {tenant_id?: string; sub?: string}): Observable<ApiResponse<any>>
addCasbinRule(rule: CasbinRule): Observable<ApiResponse<any>>
removeCasbinRule(rule: CasbinRule): Observable<ApiResponse<any>>
assignRole(data: CasbinAssign): Observable<ApiResponse<any>>
unassignRole(data: CasbinAssign): Observable<ApiResponse<any>>
checkPermission(data: CasbinCheck): Observable<ApiResponse<any>>
getUserCasbinRoles(tid: string, tenantId?: string): Observable<ApiResponse<any>>
reloadCasbinPolicies(): Observable<ApiResponse<any>>

// Role Stats
getRoleStatistics(): Observable<ApiResponse<any>>

// Permissions with Assets
getPermissionsWithAssets(params?: {size?: number; offset?: number; search?: string}): Observable<ApiResponse<any>>

// Governance Init (admin)
initPermissions(params?: {tenant_id?: string; dry_run?: boolean}): Observable<ApiResponse<any>>
initRoles(tenantId?: string, roleNames?: string[]): Observable<ApiResponse<any>>
syncCasbinPolicies(): Observable<ApiResponse<any>>
```

---

### Phase 2 — Tenant Module (P1)

**Files to create:**
```
src/app/features/governance/tenants/
├── tenants.component.ts           # List + stats
├── tenants.component.html
├── tenants.component.scss
├── tenant-detail/
│   ├── tenant-detail.component.ts  # View/edit + member list
│   └── tenant-detail.component.html
└── tenant-create/
    ├── tenant-create.component.ts  # Dialog/form
    └── tenant-create.component.html
```

**Routes to add in `app.routes.ts`:**
```typescript
{ path: 'governance/tenants', loadComponent: () => import('./features/governance/tenants/tenants.component').then(m => m.TenantsComponent) },
{ path: 'governance/tenants/new', loadComponent: () => import('./features/governance/tenants/tenant-create/tenant-create.component').then(m => m.TenantCreateComponent) },
{ path: 'governance/tenants/:kid', loadComponent: () => import('./features/governance/tenants/tenant-detail/tenant-detail.component').then(m => m.TenantDetailComponent) },
```

**Menu item to add in `menu-config.ts`:**
```typescript
{ label: 'Tenants', url: '/governance/tenants', icon: 'pi pi-sitemap' }
```

**`tenants.component.ts` — key features:**
- Stat cards: Total, Active, Suspended, Trial (filter by `status` param)
- Table: name, status (tag), owner, created_at, actions
- Search by name, filter by status dropdown
- Actions: view detail, edit, suspend/delete
- Paginator: limit/offset

**`tenant-detail.component.ts` — key features:**
- Two tabs: "Overview" (edit form) and "Members" (member table)
- Members tab: list members with `GET /governance/tenant/:kid/members`
- Invite member button → dialog with user_id + role fields → `POST /governance/tenant/:kid/members`
- Remove member → confirm → `DELETE /governance/tenant/:kid/members/:user_id`

---

### Phase 3 — Casbin RBAC Manager (P1)

**Files to create:**
```
src/app/features/governance/casbin/
├── casbin.component.ts           # Main tabbed view
├── casbin.component.html
├── casbin.component.scss
└── permission-checker/
    ├── permission-checker.component.ts   # Interactive check tool
    └── permission-checker.component.html
```

**Routes to add:**
```typescript
{ path: 'governance/casbin', loadComponent: () => import('./features/governance/casbin/casbin.component').then(m => m.CasbinComponent) },
```

**Menu item:**
```typescript
{ label: 'RBAC Engine', url: '/governance/casbin', icon: 'pi pi-shield' }
```

**`casbin.component.ts` — 3 tabs:**

**Tab 1: Policy Rules (`p-rules`)**
- Table: sub, dom, obj, act columns
- Filter by tenant_id dropdown, sub input
- Add rule button → inline form row → POST `/governance/casbin/rule`
- Delete row → DELETE `/governance/casbin/rule`
- Reload button → GET `/governance/casbin/reload`

**Tab 2: Role Assignments (`g-rules`)**
- Input: User TID → GET `/governance/casbin/user/:tid/roles`
- Show assigned roles per tenant
- Assign role form: user TID + role name + tenant_id → POST `/governance/casbin/assign`
- Remove assignment → DELETE `/governance/casbin/assign`

**Tab 3: Permission Checker**
- Form: user TID, tenant_id, path (resource), HTTP method (dropdown: GET/POST/PUT/DELETE)
- "Check" button → POST `/governance/casbin/check`
- Result: green ✅ ALLOWED or red ❌ DENIED badge

---

### Phase 4 — Fix Existing Features (P2)

#### 4.1 Team Detail Page
**File:** `src/app/features/governance/teams/team-detail/team-detail.component.ts`

- Route: `governance/teams/:id`
- GET `/governance/team/:id` for detail
- PATCH `/governance/team/:id` for edit
- Member management (if API supports)

#### 4.2 Role Statistics
**File:** `src/app/features/governance/roles/roles.component.ts`

- Replace `updateStats()` (computed from loaded page) with real API call
- `GET /governance/role/statistics/overview` → populate stat cards
- Call on `ngOnInit` separate from pagination

#### 4.3 Permissions with Assets View
**File:** `src/app/features/governance/permissions/permissions.component.ts`

- Add toggle: "With Assets" view using `GET /governance/permissions/assets`
- Show asset chips inside each permission row

#### 4.4 Policy Update Method Fix
Current service `updatePolicy` uses PATCH but API spec shows PUT for roles.  
Verify policy update endpoint method (currently shows PUT in spec for `/governance/policies/:kid`).

---

### Phase 5 — Governance Admin (P3)

**Files to create:**
```
src/app/features/governance/admin/
├── governance-admin.component.ts
└── governance-admin.component.html
```

**Route:** `governance/admin`  
**Menu:** `{ label: 'Admin Tools', url: '/governance/admin', icon: 'pi pi-cog' }`

**Features — 3 action cards:**

1. **Auto-generate Permissions**
   - Input: tenant_id (optional), dry_run toggle
   - Button → POST `/governance/init/permissions`
   - Show result count

2. **Initialize Default Roles**
   - Input: tenant_id (optional), role names chips input
   - Button → POST `/governance/init/roles`

3. **Sync Casbin Policies**
   - Button → POST `/governance/init/casbin-sync`
   - Show success/error

---

## File Change Summary

### Modified Files
| File | Changes |
|------|---------|
| `src/app/core/services/governance.services.ts` | Fix 3 URL bugs, remove ~8 fake methods, add Tenant+Casbin+Init methods + interfaces |
| `src/app/app.routes.ts` | Add 5 new routes (tenants x3, casbin, admin) |
| `src/app/layout/menu-config.ts` | Add Tenants + RBAC Engine + Admin menu items |
| `src/app/features/governance/roles/roles.component.ts` | Wire real stats API |
| `src/app/features/governance/permissions/permissions.component.ts` | Add assets view toggle |

### New Files (minimum)
| File | Purpose |
|------|---------|
| `governance/tenants/tenants.component.{ts,html,scss}` | Tenant list |
| `governance/tenants/tenant-detail/tenant-detail.component.{ts,html}` | Tenant detail + members |
| `governance/tenants/tenant-create/tenant-create.component.{ts,html}` | Create tenant dialog |
| `governance/casbin/casbin.component.{ts,html,scss}` | RBAC manager |
| `governance/admin/governance-admin.component.{ts,html}` | Admin init tools |
| `governance/teams/team-detail/team-detail.component.{ts,html}` | Team detail |

---

## Implementation Order

```
1. Fix service bugs (30 min)
   └─ Wrong URLs + remove fake endpoints + add Tenant/Casbin interfaces

2. Tenant Module (2h)
   └─ Service methods → TenantsComponent → TenantDetailComponent → routes + menu

3. Casbin Manager (2h)
   └─ Service methods → CasbinComponent (3 tabs) → routes + menu

4. Fix existing gaps (1h)
   └─ Role stats API → Team detail page → Permissions+Assets toggle

5. Admin Tools (1h)
   └─ GovernanceAdminComponent → 3 init actions
```

**Total estimated effort: ~6-7 hours**

---

## Key API Mapping Reference

```
GET    /governance/tenants                    → list tenants (limit, offset, status)
POST   /governance/tenant                     → create tenant
GET    /governance/tenant/:kid                → get tenant detail
PATCH  /governance/tenant/:kid               → update tenant
DELETE /governance/tenant/:kid               → suspend tenant (soft delete)
GET    /governance/tenant/:kid/members        → list members (limit, offset)
POST   /governance/tenant/:kid/members        → invite member {user_id, role}
DELETE /governance/tenant/:kid/members/:uid   → remove member
GET    /governance/me/tenants                 → current user's tenants

GET    /governance/casbin/rules               → list p-rules (?tenant_id, ?sub)
POST   /governance/casbin/rule               → add p-rule {sub,dom,obj,act}
DELETE /governance/casbin/rule               → remove p-rule {sub,dom,obj,act}
POST   /governance/casbin/assign             → assign role {user,role,tenant_id}
DELETE /governance/casbin/assign             → unassign role {user,role,tenant_id}
POST   /governance/casbin/check              → check perm {user,tenant_id,path,method}
GET    /governance/casbin/user/:tid/roles    → get user roles (?tenant_id)
GET    /governance/casbin/reload             → reload policies from MongoDB

GET    /governance/role/statistics/overview  → role stats
GET    /governance/permissions/assets        → permissions with asset details

POST   /governance/init/permissions          → auto-generate from FastAPI routes
POST   /governance/init/roles               → create default roles per tenant
POST   /governance/init/casbin-sync         → re-sync Casbin from MongoDB
```
