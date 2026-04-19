import { Injectable } from '@angular/core';
import { getApiBase } from '../config/api-config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { CacheService } from './cache.service';

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  success?: boolean;
  message?: string;
}

export interface User {
  _id?: string;
  id?: string;
  kid?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  role?: string;
  status?: string;
  is_active?: boolean;
  is_verified?: boolean;
  teams?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Account {
  _id?: string;
  id?: string;
  identify?: string;
  image?: string;
  name?: string;
  full_name?: string;
  email?: string;
  username?: string;
  type?: string;
  status?: string;
  department?: string;
  is_active?: boolean;
  is_verified?: boolean;
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Asset {
  _id?: string | null;
  id?: string;
  kid?: string | null;
  name: string;
  type: string;
  source?: string;
  location?: string;
  sensitivity?: string;
  status?: string;
  category?: string;
  owner?: string;
  tags?: string[];
  metadata?: any;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PolicyRoleDetail {
  _id: string;
  kid: string;
  name: string;
  description: string;
  type: 'system' | 'business' | 'governance';
  permissions: string[];
  is_active: boolean;
  contact: Array<{
    email: string;
    name: string;
    phone: string;
  }>;
  created_at: string;
  updated_at: string;
  _created_at: string;
  _updated_at: string;
}

export interface Policy {
  _id: string | null;
  kid: string;
  name: string;
  description: string;
  type: 'access_control' | 'data_protection' | 'compliance';
  effect: 'allow' | 'deny' | null;
  subjects: string[];
  roles: string[];
  domain_id: string | null;
  data_product_id: string | null;
  conditions: any;
  priority: number;
  enabled: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  role_details: PolicyRoleDetail[];
  permission_details: any[];
  asset_details: any[];
  user_details: any[];
  team_details: any[];
  affected_assets_total: number;
  policy_rules_total: number;
  total_subjects: number;
  total_roles: number;
  domain_info: any;
  data_product_info: any;
}

export interface Role {
  _id: string;
  kid: string;
  name: string;
  description: string;
  type: 'system' | 'business' | 'governance';
  permissions: number;
  is_active?: boolean;
  contact?: Array<{
    email: string;
    name: string;
    phone?: string;
  }> | null;
  created_at?: string;
  updated_at?: string;
  _created_at?: string;
  _updated_at?: string;
}

export interface RoleDetail extends Omit<Role, 'permissions'> {
  permissions: Permission[];
  policies?: Policy[];
  users?: User[];
  teams?: Team[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
  };
  search?: string;
}

export interface Team {
  _id?: string;
  id?: string;
  kid?: string;
  name: string;
  description?: string;
  members?: string[] | any[];
  roles?: string[];
  isActive?: boolean;
  is_active?: boolean;
  status?: string;
  type?: string;
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Permission {
  _id: string;
  kid: string;
  name: string;
  description: string;
  code: string;
  resource?: string;
  action: string;
  effect?: 'allow' | 'deny';
  conditions?: any;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  assets?: Asset[];
  asset_total?: number;
}

// Tenant management
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

export interface TenantMemberCreate {
  user_id: string;
  role?: string;
}

// Casbin RBAC
export interface CasbinRule {
  sub: string;
  dom: string;
  obj: string;
  act: string;
}

export interface CasbinAssign {
  user: string;
  role: string;
  tenant_id: string;
}

export interface CasbinCheck {
  user: string;
  tenant_id: string;
  path: string;
  method: string;
}

@Injectable({
  providedIn: 'root'
})
export class GovernanceServices {
  private get baseUrl(): string {
    return getApiBase();
  }

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) { }

  // ─── Users ───────────────────────────────────────────────────────────────────

  getUsers(params?: any): Observable<ApiResponse<User[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<User[]>(`${this.baseUrl}/governance/users`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<any>(`${this.baseUrl}/governance/user/${id}`)
      .pipe(map(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          return { data: response.data, total: response.total, message: response.message, success: true } as ApiResponse<User>;
        }
        return this.wrapResponse(response);
      }));
  }

  createUser(user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.post<User>(`${this.baseUrl}/governance/user`, user)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateUser(id: string, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.patch<User>(`${this.baseUrl}/governance/user/${id}`, user)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/user/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Accounts ────────────────────────────────────────────────────────────────

  getAccounts(params?: any): Observable<ApiResponse<Account[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Account[]>(`${this.baseUrl}/governance/accounts`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAccount(id: string): Observable<ApiResponse<Account>> {
    return this.http.get<any>(`${this.baseUrl}/governance/account/${id}`)
      .pipe(map(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          return { data: response.data, total: response.total, message: response.message, success: true } as ApiResponse<Account>;
        }
        return this.wrapResponse(response);
      }));
  }

  updateAccount(id: string, account: Partial<Account>): Observable<ApiResponse<Account>> {
    return this.http.patch<Account>(`${this.baseUrl}/governance/account/${id}`, account)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Assets ──────────────────────────────────────────────────────────────────

  getAssets(params?: any): Observable<ApiResponse<Asset[]>> {
    const httpParams = this.buildHttpParams(params);
    const cacheKey = `assets_${JSON.stringify(params || {})}`;
    const httpObservable = this.http.get<any>(`${this.baseUrl}/data-catalog/assets`, { params: httpParams })
      .pipe(map(response => {
        if (response && response.data) {
          return { data: response.data as Asset[], total: response.total, message: response.message, success: true } as ApiResponse<Asset[]>;
        }
        return this.wrapArrayResponse(response) as ApiResponse<Asset[]>;
      }));
    return this.cacheService.getCachedObservable<ApiResponse<Asset[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getAsset(id: string): Observable<ApiResponse<Asset>> {
    const cacheKey = `asset_${id}`;
    const httpObservable = this.http.get<Asset>(`${this.baseUrl}/governance/assets/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
    return this.cacheService.getCachedObservable<ApiResponse<Asset>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  createAsset(asset: Asset): Observable<ApiResponse<Asset>> {
    this.clearAssetsCache();
    return this.http.post<Asset>(`${this.baseUrl}/governance/assets`, asset)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAsset(id: string, asset: Partial<Asset>): Observable<ApiResponse<Asset>> {
    this.clearAssetsCache();
    this.cacheService.delete(`asset_${id}`);
    return this.http.patch<Asset>(`${this.baseUrl}/governance/assets/${id}`, asset)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAsset(id: string): Observable<ApiResponse<any>> {
    this.clearAssetsCache();
    this.cacheService.delete(`asset_${id}`);
    return this.http.delete<any>(`${this.baseUrl}/governance/assets/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  private clearAssetsCache(): void {
    const cacheStats = this.cacheService.getStats();
    cacheStats.keys.filter((key: string) => key.startsWith('assets_')).forEach((key: string) => this.cacheService.delete(key));
  }

  clearCache(): void {
    this.cacheService.clear();
  }

  // ─── Policies ────────────────────────────────────────────────────────────────

  getPolicies(params?: any): Observable<ApiResponse<PaginatedResponse<Policy>>> {
    const cacheKey = `policies_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<PaginatedResponse<Policy>>(`${this.baseUrl}/governance/policies`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
    return this.cacheService.getCachedObservable<ApiResponse<PaginatedResponse<Policy>>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getPolicy(id: string): Observable<ApiResponse<Policy>> {
    const cacheKey = `policy_${id}`;
    const httpObservable = this.http.get<Policy>(`${this.baseUrl}/governance/policies/${id}`)
      .pipe(
        tap(response => console.log('Raw policy API response:', response)),
        map(response => this.wrapResponse(response))
      );
    return this.cacheService.getCachedObservable<ApiResponse<Policy>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  createPolicy(policy: Partial<Policy>): Observable<ApiResponse<Policy>> {
    return this.http.post<Policy>(`${this.baseUrl}/governance/policies`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updatePolicy(id: string, policy: Partial<Policy>): Observable<ApiResponse<Policy>> {
    return this.http.put<Policy>(`${this.baseUrl}/governance/policies/${id}`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deletePolicy(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/policies/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  enablePolicy(id: string): Observable<ApiResponse<Policy>> {
    return this.http.put<Policy>(`${this.baseUrl}/governance/policies/${id}`, { enabled: true })
      .pipe(map(response => this.wrapResponse(response)));
  }

  disablePolicy(id: string): Observable<ApiResponse<Policy>> {
    return this.http.put<Policy>(`${this.baseUrl}/governance/policies/${id}`, { enabled: false })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Roles ───────────────────────────────────────────────────────────────────

  getRoles(params?: any): Observable<ApiResponse<PaginatedResponse<Role>>> {
    const cacheKey = `roles_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<PaginatedResponse<Role>>(`${this.baseUrl}/governance/roles`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
    return this.cacheService.getCachedObservable<ApiResponse<PaginatedResponse<Role>>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getRoleDetail(id: string): Observable<ApiResponse<RoleDetail>> {
    const cacheKey = `role_detail_${id}`;
    const httpObservable = this.http.get<any>(`${this.baseUrl}/governance/role/${id}`)
      .pipe(map(response => {
        if (response && typeof response === 'object') {
          if (response._id || response.kid) {
            return { data: response as RoleDetail, success: true, message: 'Role detail fetched successfully' } as ApiResponse<RoleDetail>;
          }
          if (response.data) {
            return { data: response.data as RoleDetail, success: response.success !== undefined ? response.success : true, message: response.message || 'Role detail fetched successfully' } as ApiResponse<RoleDetail>;
          }
        }
        return this.wrapResponse(response);
      }));
    return this.cacheService.getCachedObservable<ApiResponse<RoleDetail>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getRoleStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<any>(`${this.baseUrl}/governance/role/statistics/overview`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createRole(role: Partial<RoleDetail>): Observable<ApiResponse<RoleDetail>> {
    this.cacheService.clear();
    return this.http.post<RoleDetail>(`${this.baseUrl}/governance/role`, role)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateRole(id: string, role: Partial<Role>): Observable<ApiResponse<Role>> {
    this.cacheService.clear();
    return this.http.put<Role>(`${this.baseUrl}/governance/role/${id}`, role)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteRole(id: string): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/role/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getRolePermissions(roleId: string): Observable<ApiResponse<Permission[]>> {
    const cacheKey = `role_permissions_${roleId}`;
    const httpObservable = this.http.get<any>(`${this.baseUrl}/governance/role/${roleId}/permissions`)
      .pipe(map(response => this.wrapArrayResponse<Permission>(response)));
    return this.cacheService.getCachedObservable<ApiResponse<Permission[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  updateRolePermissions(roleId: string, permissions: string[]): Observable<ApiResponse<RoleDetail>> {
    this.cacheService.clear();
    return this.http.put<RoleDetail>(`${this.baseUrl}/governance/role/${roleId}/permissions`, { permissions })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Permissions ─────────────────────────────────────────────────────────────

  getPermissions(params?: any): Observable<ApiResponse<Permission[]>> {
    const cacheKey = `permissions_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<Permission[]>(`${this.baseUrl}/governance/permissions`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse<Permission>(response)));
    return this.cacheService.getCachedObservable<ApiResponse<Permission[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getPermissionsWithAssets(params?: any): Observable<ApiResponse<Permission[]>> {
    const cacheKey = `permissions_assets_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<any>(`${this.baseUrl}/governance/permissions/assets`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse<Permission>(response)));
    return this.cacheService.getCachedObservable<ApiResponse<Permission[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getPermission(id: string): Observable<ApiResponse<Permission>> {
    const cacheKey = `permission_${id}`;
    const httpObservable = this.http.get<any>(`${this.baseUrl}/governance/permission/${id}`)
      .pipe(map(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          return { data: response.data, total: response.total, message: response.message, success: true } as ApiResponse<Permission>;
        }
        return this.wrapResponse(response);
      }));
    return this.cacheService.getCachedObservable<ApiResponse<Permission>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  createPermission(permission: Partial<Permission>): Observable<ApiResponse<Permission>> {
    this.cacheService.clear();
    return this.http.post<Permission>(`${this.baseUrl}/governance/permission`, permission)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<ApiResponse<Permission>> {
    this.cacheService.clear();
    return this.http.patch<Permission>(`${this.baseUrl}/governance/permission/${id}`, permission)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deletePermission(id: string): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/permission/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Teams ───────────────────────────────────────────────────────────────────

  getTeams(params?: any): Observable<ApiResponse<Team[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Team[]>(`${this.baseUrl}/governance/teams`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getTeam(id: string): Observable<ApiResponse<Team>> {
    return this.http.get<any>(`${this.baseUrl}/governance/team/${id}`)
      .pipe(map(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          return { data: response.data, total: response.total, message: response.message, success: true } as ApiResponse<Team>;
        }
        return this.wrapResponse(response);
      }));
  }

  createTeam(team: Partial<Team>): Observable<ApiResponse<Team>> {
    return this.http.post<Team>(`${this.baseUrl}/governance/team`, team)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateTeam(id: string, team: Partial<Team>): Observable<ApiResponse<Team>> {
    return this.http.patch<Team>(`${this.baseUrl}/governance/team/${id}`, team)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteTeam(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/team/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Tenants ─────────────────────────────────────────────────────────────────

  getTenants(params?: { limit?: number; offset?: number; status?: string }): Observable<ApiResponse<PaginatedResponse<Tenant>>> {
    const cacheKey = `tenants_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<any>(`${this.baseUrl}/governance/tenants`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
    return this.cacheService.getCachedObservable<ApiResponse<PaginatedResponse<Tenant>>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getTenant(kid: string): Observable<ApiResponse<Tenant>> {
    return this.http.get<any>(`${this.baseUrl}/governance/tenant/${kid}`)
      .pipe(map(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          return { data: response.data, success: true, message: response.message } as ApiResponse<Tenant>;
        }
        return this.wrapResponse(response);
      }));
  }

  createTenant(data: TenantCreate): Observable<ApiResponse<Tenant>> {
    this.cacheService.clear();
    return this.http.post<Tenant>(`${this.baseUrl}/governance/tenant`, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateTenant(kid: string, data: TenantUpdate): Observable<ApiResponse<Tenant>> {
    this.cacheService.clear();
    return this.http.patch<Tenant>(`${this.baseUrl}/governance/tenant/${kid}`, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteTenant(kid: string): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/tenant/${kid}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getTenantMembers(kid: string, params?: { limit?: number; offset?: number }): Observable<ApiResponse<any>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(`${this.baseUrl}/governance/tenant/${kid}/members`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  inviteTenantMember(kid: string, data: TenantMemberCreate): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/tenant/${kid}/members`, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeTenantMember(kid: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/tenant/${kid}/members/${userId}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getMyTenants(): Observable<ApiResponse<any>> {
    return this.http.get<any>(`${this.baseUrl}/governance/me/tenants`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Casbin RBAC ─────────────────────────────────────────────────────────────

  getCasbinRules(params?: { tenant_id?: string; sub?: string }): Observable<ApiResponse<any>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(`${this.baseUrl}/governance/casbin/rules`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  addCasbinRule(rule: CasbinRule): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/casbin/rule`, rule)
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeCasbinRule(rule: CasbinRule): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/casbin/rule`, { body: rule })
      .pipe(map(response => this.wrapResponse(response)));
  }

  assignRole(data: CasbinAssign): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/casbin/assign`, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  unassignRole(data: CasbinAssign): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/casbin/assign`, { body: data })
      .pipe(map(response => this.wrapResponse(response)));
  }

  checkPermission(data: CasbinCheck): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/casbin/check`, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getUserCasbinRoles(tid: string, tenantId?: string): Observable<ApiResponse<any>> {
    const httpParams = tenantId ? this.buildHttpParams({ tenant_id: tenantId }) : undefined;
    return this.http.get<any>(`${this.baseUrl}/governance/casbin/user/${tid}/roles`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  reloadCasbinPolicies(): Observable<ApiResponse<any>> {
    return this.http.get<any>(`${this.baseUrl}/governance/casbin/reload`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Governance Init (Admin) ──────────────────────────────────────────────────

  initPermissions(params?: { tenant_id?: string; dry_run?: boolean }): Observable<ApiResponse<any>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.post<any>(`${this.baseUrl}/governance/init/permissions`, {}, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  initRoles(tenantId?: string, roleNames?: string[]): Observable<ApiResponse<any>> {
    const httpParams = tenantId ? this.buildHttpParams({ tenant_id: tenantId }) : undefined;
    return this.http.post<any>(`${this.baseUrl}/governance/init/roles`, roleNames || null, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  syncCasbinPolicies(): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/init/casbin-sync`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  generateRoleKid(name: string): string {
    return name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (typeof params[key] === 'number' && isNaN(params[key])) return;
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              if (typeof value === 'number' && isNaN(value)) return;
              httpParams = httpParams.append(key, value.toString());
            });
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }
    return httpParams;
  }

  private wrapResponse<T>(data: T): ApiResponse<T> {
    return { data, success: true };
  }

  private wrapArrayResponse<T = any>(response: any): ApiResponse<T[]> {
    if (response && typeof response === 'object' && 'data' in response) {
      return {
        data: response.data || [],
        total: response.total || (Array.isArray(response.data) ? response.data.length : 0),
        success: response.success !== undefined ? response.success : true,
        message: response.message
      };
    }
    if (Array.isArray(response)) {
      return { data: response as T[], total: response.length, success: true };
    }
    return { data: [] as T[], total: 0, success: false, message: 'Invalid response format' };
  }
}
