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
  // permissions/resources removed from policy model
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
  permissions: number; // number of permissions for list view
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
  permissions: Permission[]; // detailed permissions for detail view
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

export interface ComplianceRecord {
  id: string;
  policyId: string;
  resourceId: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  lastChecked: Date;
  violations: any[];
  metadata: any;
}

export interface AccessControl {
  id: string;
  subjectId: string;
  subjectType: 'user' | 'role' | 'team';
  resourceId: string;
  resourceType: string;
  permissions: string[];
  conditions: any;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface Classification {
  id: string;
  resourceId: string;
  resourceType: string;
  level: string;
  category: string;
  tags: string[];
  sensitivity: string;
  retentionPolicy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  disposalMethod: string;
  applicableTypes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

@Injectable({
  providedIn: 'root'
})
export class GovernanceServices {
  private baseUrl = getApiBase();

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) { }

  // Users Management
  getUsers(params?: any): Observable<ApiResponse<User[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<User[]>(`${this.baseUrl}/governance/users`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<any>(`${this.baseUrl}/governance/user/${id}`)
      .pipe(
        map(response => {
          // Handle response that already has 'data' property
          if (response && typeof response === 'object' && 'data' in response) {
            return {
              data: response.data,
              total: response.total,
              message: response.message,
              success: true
            } as ApiResponse<User>;
          }
          // Otherwise wrap the response
          return this.wrapResponse(response);
        })
      );
  }

  createUser(user: User): Observable<ApiResponse<User>> {
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

  activateUser(id: string): Observable<ApiResponse<User>> {
    return this.http.post<User>(`${this.baseUrl}/governance/user/${id}/activate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  deactivateUser(id: string): Observable<ApiResponse<User>> {
    return this.http.post<User>(`${this.baseUrl}/governance/user/${id}/deactivate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  assignUserToTeam(userId: string, teamId: string): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/user/${userId}/team/${teamId}`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeUserFromTeam(userId: string, teamId: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/user/${userId}/team/${teamId}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getUserTeams(userId: string): Observable<ApiResponse<Team[]>> {
    return this.http.get<Team[]>(`${this.baseUrl}/governance/user/${userId}/teams`)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  // Teams Management
  getTeams(params?: any): Observable<ApiResponse<Team[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Team[]>(`${this.baseUrl}/governance/teams`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getTeam(id: string): Observable<ApiResponse<Team>> {
    return this.http.get<any>(`${this.baseUrl}/governance/team/${id}`)
      .pipe(
        map(response => {
          // Handle response that already has 'data' property
          if (response && typeof response === 'object' && 'data' in response) {
            return {
              data: response.data,
              total: response.total,
              message: response.message,
              success: true
            } as ApiResponse<Team>;
          }
          // Otherwise wrap the response
          return this.wrapResponse(response);
        })
      );
  }

  createTeam(team: Team): Observable<ApiResponse<Team>> {
    return this.http.post<Team>(`${this.baseUrl}/governance/team`, team)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateTeam(id: string, team: Partial<Team>): Observable<ApiResponse<Team>> {
    return this.http.patch<Team>(`${this.baseUrl}/governance/teams/${id}`, team)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteTeam(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/teams/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  activateTeam(id: string): Observable<ApiResponse<Team>> {
    return this.http.post<Team>(`${this.baseUrl}/governance/teams/${id}/activate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  deactivateTeam(id: string): Observable<ApiResponse<Team>> {
    return this.http.post<Team>(`${this.baseUrl}/governance/teams/${id}/deactivate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  getTeamMembers(teamId: string): Observable<ApiResponse<User[]>> {
    return this.http.get<User[]>(`${this.baseUrl}/governance/teams/${teamId}/members`)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  addTeamMember(teamId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/teams/${teamId}/member/${userId}`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeTeamMember(teamId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/teams/${teamId}/member/${userId}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Accounts Management
  getAccounts(params?: any): Observable<ApiResponse<Account[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Account[]>(`${this.baseUrl}/governance/accounts`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAccount(id: string): Observable<ApiResponse<Account>> {
    return this.http.get<any>(`${this.baseUrl}/governance/account/${id}`)
      .pipe(
        map(response => {
          // Handle response that already has 'data' property
          if (response && typeof response === 'object' && 'data' in response) {
            return {
              data: response.data,
              total: response.total,
              message: response.message,
              success: true
            } as ApiResponse<Account>;
          }
          // Otherwise wrap the response
          return this.wrapResponse(response);
        })
      );
  }

  updateAccount(id: string, account: Partial<Account>): Observable<ApiResponse<Account>> {
    return this.http.patch<Account>(`${this.baseUrl}/governance/account/${id}`, account)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Assets Management
  getAssets(params?: any): Observable<ApiResponse<Asset[]>> {
    const httpParams = this.buildHttpParams(params);
    const cacheKey = `assets_${JSON.stringify(params || {})}`;

    // Create the HTTP observable
    const httpObservable = this.http.get<any>(`${this.baseUrl}/data-catalog/assets`, { params: httpParams })
      .pipe(map(response => {
        // Handle the API response format from your example
        if (response && response.data) {
          return {
            data: response.data as Asset[],
            total: response.total,
            message: response.message,
            success: true
          } as ApiResponse<Asset[]>;
        }
        return this.wrapArrayResponse(response) as ApiResponse<Asset[]>;
      }));

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<Asset[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getAsset(id: string): Observable<ApiResponse<Asset>> {
    const cacheKey = `asset_${id}`;
    const httpObservable = this.http.get<Asset>(`${this.baseUrl}/governance/assets/${id}`)
      .pipe(map(response => this.wrapResponse(response)));

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<Asset>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  createAsset(asset: Asset): Observable<ApiResponse<Asset>> {
    // Clear assets cache when creating new asset
    this.clearAssetsCache();

    return this.http.post<Asset>(`${this.baseUrl}/governance/assets`, asset)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAsset(id: string, asset: Partial<Asset>): Observable<ApiResponse<Asset>> {
    // Clear assets cache when updating asset
    this.clearAssetsCache();
    this.cacheService.delete(`asset_${id}`);

    return this.http.patch<Asset>(`${this.baseUrl}/governance/assets/${id}`, asset)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAsset(id: string): Observable<ApiResponse<any>> {
    // Clear assets cache when deleting asset
    this.clearAssetsCache();
    this.cacheService.delete(`asset_${id}`);

    return this.http.delete<any>(`${this.baseUrl}/governance/assets/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Clear all assets-related cache
  private clearAssetsCache(): void {
    const cacheStats = this.cacheService.getStats();
    const assetsKeys = cacheStats.keys.filter(key => key.startsWith('assets_'));
    assetsKeys.forEach(key => this.cacheService.delete(key));
  }

  // Public method to clear cache
  clearCache(): void {
    this.cacheService.clear();
  }

  // Policies Management
  getPolicies(params?: any): Observable<ApiResponse<PaginatedResponse<Policy>>> {
    const cacheKey = `policies_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<PaginatedResponse<Policy>>(`${this.baseUrl}/governance/policies`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<PaginatedResponse<Policy>>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getPolicy(id: string): Observable<ApiResponse<Policy>> {
    console.log('Fetching policy with ID:', id);
    const cacheKey = `policy_${id}`;
    const httpObservable = this.http.get<Policy>(`${this.baseUrl}/governance/policies/${id}`)
      .pipe(
        tap(response => console.log('Raw policy API response:', response)),
        map(response => this.wrapResponse(response)),
        tap(wrappedResponse => console.log('Wrapped policy response:', wrappedResponse))
      );

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<Policy>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  createPolicy(policy: Partial<Policy>): Observable<ApiResponse<Policy>> {
    return this.http.post<Policy>(`${this.baseUrl}/governance/policies`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updatePolicy(id: string, policy: Partial<Policy>): Observable<ApiResponse<Policy>> {
    return this.http.patch<Policy>(`${this.baseUrl}/governance/policies/${id}`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deletePolicy(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/policies/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  enablePolicy(id: string): Observable<ApiResponse<Policy>> {
    return this.http.patch<Policy>(`${this.baseUrl}/governance/policies/${id}`, { enabled: true })
      .pipe(map(response => this.wrapResponse(response)));
  }

  disablePolicy(id: string): Observable<ApiResponse<Policy>> {
    return this.http.patch<Policy>(`${this.baseUrl}/governance/policies/${id}`, { enabled: false })
      .pipe(map(response => this.wrapResponse(response)));
  }

  assignRoleToPolicy(policyId: string, roleId: string): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/policies/${policyId}/roles/${roleId}`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeRoleFromPolicy(policyId: string, roleId: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/policies/${policyId}/roles/${roleId}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Enhanced Roles Management
  getRoles(params?: any): Observable<ApiResponse<PaginatedResponse<Role>>> {
    const cacheKey = `roles_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<PaginatedResponse<Role>>(`${this.baseUrl}/governance/roles`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<PaginatedResponse<Role>>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getRoleDetail(id: string): Observable<ApiResponse<RoleDetail>> {
    console.log('Fetching role detail with ID:', id);
    const cacheKey = `role_detail_${id}`;
    const httpObservable = this.http.get<any>(`${this.baseUrl}/governance/role/${id}`)
      .pipe(
        tap(response => console.log('Raw role detail API response:', response)),
        map(response => {
          // Handle response that already has proper structure
          if (response && typeof response === 'object') {
            // If response has direct role properties, wrap it
            if (response._id || response.kid) {
              return {
                data: response as RoleDetail,
                success: true,
                message: 'Role detail fetched successfully'
              } as ApiResponse<RoleDetail>;
            }
            // If response already wrapped, return as is
            if (response.data) {
              return {
                data: response.data as RoleDetail,
                success: response.success !== undefined ? response.success : true,
                message: response.message || 'Role detail fetched successfully'
              } as ApiResponse<RoleDetail>;
            }
          }
          return this.wrapResponse(response);
        }),
        tap(wrappedResponse => console.log('Wrapped role detail response:', wrappedResponse))
      );

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<RoleDetail>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  createRole(role: Partial<Role>): Observable<ApiResponse<Role>> {
    // Clear cache when creating new role
    this.cacheService.clear();
    return this.http.post<Role>(`${this.baseUrl}/governance/roles`, role)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createRoleWithPermissions(role: Partial<RoleDetail>): Observable<ApiResponse<RoleDetail>> {
    // Clear cache when creating new role with permissions
    this.cacheService.clear();
    return this.http.post<RoleDetail>(`${this.baseUrl}/governance/role`, role)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateRole(id: string, role: Partial<Role>): Observable<ApiResponse<Role>> {
    // Clear cache when updating role
    this.cacheService.clear();
    return this.http.patch<Role>(`${this.baseUrl}/governance/role/${id}`, role)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateRoleStatus(id: string, is_active: boolean): Observable<ApiResponse<Role>> {
    // Clear cache when updating role status
    this.cacheService.clear();
    return this.http.patch<Role>(`${this.baseUrl}/governance/role/${id}/status`, { is_active })
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteRole(id: string): Observable<ApiResponse<any>> {
    // Clear cache when deleting role
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/role/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Role Permissions Management
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.post<any>(`${this.baseUrl}/governance/role/${roleId}/permissions`, { permissions: permissionIds })
      .pipe(map(response => this.wrapResponse(response)));
  }

  removePermissionsFromRole(roleId: string, permissionIds: string[]): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/role/${roleId}/permissions`, { body: { permissions: permissionIds } })
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateRolePermissions(roleId: string, permissions: string[]): Observable<ApiResponse<RoleDetail>> {
    this.cacheService.clear();
    return this.http.put<RoleDetail>(`${this.baseUrl}/governance/role/${roleId}/permissions`, { permissions })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Permissions Management
  getPermissions(params?: any): Observable<ApiResponse<Permission[]>> {
    const cacheKey = `permissions_${JSON.stringify(params || {})}`;
    const httpParams = this.buildHttpParams(params);
    const httpObservable = this.http.get<Permission[]>(`${this.baseUrl}/governance/permissions`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse<Permission>(response)));

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<Permission[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  getPermission(id: string): Observable<ApiResponse<Permission>> {
    const cacheKey = `permission_${id}`;
    const httpObservable = this.http.get<any>(`${this.baseUrl}/governance/permission/${id}`)
      .pipe(
        map(response => {
          // Handle response that already has 'data' property
          if (response && typeof response === 'object' && 'data' in response) {
            return {
              data: response.data,
              total: response.total,
              message: response.message,
              success: true
            } as ApiResponse<Permission>;
          }
          // Otherwise wrap the response
          return this.wrapResponse(response);
        })
      );

    // Return cached observable with 5-minute TTL
    return this.cacheService.getCachedObservable<ApiResponse<Permission>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  createPermission(permission: Permission): Observable<ApiResponse<Permission>> {
    // Clear permissions cache when creating new permission
    this.cacheService.clear();
    return this.http.post<Permission>(`${this.baseUrl}/governance/permission`, permission)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<ApiResponse<Permission>> {
    // Clear permissions cache when updating permission
    this.cacheService.clear();
    return this.http.patch<Permission>(`${this.baseUrl}/governance/permission/${id}`, permission)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deletePermission(id: string): Observable<ApiResponse<any>> {
    // Clear permissions cache when deleting permission
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/permission/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Bulk permissions operations
  bulkCreatePermissions(permissions: Permission[]): Observable<ApiResponse<Permission[]>> {
    this.cacheService.clear();
    return this.http.post<Permission[]>(`${this.baseUrl}/governance/permission/bulk`, { permissions })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  bulkUpdatePermissions(updates: Array<{ id: string; permission: Partial<Permission> }>): Observable<ApiResponse<Permission[]>> {
    this.cacheService.clear();
    return this.http.patch<Permission[]>(`${this.baseUrl}/governance/permission/bulk`, { updates })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  bulkDeletePermissions(ids: string[]): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/permission/bulk`, { body: { ids } })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Permission assignment operations
  assignPermissionToRole(permissionId: string, roleId: string): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.post<any>(`${this.baseUrl}/governance/permission/assign`, { permissionId, roleId })
      .pipe(map(response => this.wrapResponse(response)));
  }

  revokePermissionFromRole(permissionId: string, roleId: string): Observable<ApiResponse<any>> {
    this.cacheService.clear();
    return this.http.delete<any>(`${this.baseUrl}/governance/permission/revoke`, { body: { permissionId, roleId } })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Permission validation
  validatePermission(code: string, assetId?: string): Observable<ApiResponse<{ valid: boolean; message?: string }>> {
    const params = assetId ? { code, assetId } : { code };
    const httpParams = this.buildHttpParams(params);
    return this.http.get<{ valid: boolean; message?: string }>(`${this.baseUrl}/governance/permission/validate`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Get permissions by role
  getPermissionsByRole(roleId: string): Observable<ApiResponse<Permission[]>> {
    const cacheKey = `permissions_role_${roleId}`;
    const httpObservable = this.http.get<Permission[]>(`${this.baseUrl}/governance/permission/role/${roleId}`)
      .pipe(map(response => this.wrapArrayResponse<Permission>(response)));

    return this.cacheService.getCachedObservable<ApiResponse<Permission[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  // Get permissions by user
  getPermissionsByUser(userId: string): Observable<ApiResponse<Permission[]>> {
    const cacheKey = `permissions_user_${userId}`;
    const httpObservable = this.http.get<Permission[]>(`${this.baseUrl}/governance/permission/user/${userId}`)
      .pipe(map(response => this.wrapArrayResponse<Permission>(response)));

    return this.cacheService.getCachedObservable<ApiResponse<Permission[]>>(cacheKey, httpObservable, 5 * 60 * 1000);
  }

  // Get effective permissions (combined from all roles)
  getEffectivePermissions(userId: string): Observable<ApiResponse<Permission[]>> {
    const cacheKey = `effective_permissions_${userId}`;
    const httpObservable = this.http.get<Permission[]>(`${this.baseUrl}/governance/permission/effective/${userId}`)
      .pipe(map(response => this.wrapArrayResponse<Permission>(response)));

    return this.cacheService.getCachedObservable<ApiResponse<Permission[]>>(cacheKey, httpObservable, 2 * 60 * 1000); // 2 minutes TTL for effective permissions
  }

  // Classifications Management
  getClassifications(params?: any): Observable<ApiResponse<Classification[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Classification[]>(`${this.baseUrl}/governance/classifications`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getClassification(id: string): Observable<ApiResponse<Classification>> {
    return this.http.get<Classification>(`${this.baseUrl}/governance/classification/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createClassification(classification: Classification): Observable<ApiResponse<Classification>> {
    return this.http.post<Classification>(`${this.baseUrl}/governance/classification`, classification)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateClassification(id: string, classification: Partial<Classification>): Observable<ApiResponse<Classification>> {
    return this.http.put<Classification>(`${this.baseUrl}/governance/classification/${id}`, classification)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteClassification(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/classification/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Retention Policies Management
  getRetentionPolicies(params?: any): Observable<ApiResponse<RetentionPolicy[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<RetentionPolicy[]>(`${this.baseUrl}/governance/retention-policies`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getRetentionPolicy(id: string): Observable<ApiResponse<RetentionPolicy>> {
    return this.http.get<RetentionPolicy>(`${this.baseUrl}/governance/retention-policy/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createRetentionPolicy(policy: RetentionPolicy): Observable<ApiResponse<RetentionPolicy>> {
    return this.http.post<RetentionPolicy>(`${this.baseUrl}/governance/retention-policy`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateRetentionPolicy(id: string, policy: Partial<RetentionPolicy>): Observable<ApiResponse<RetentionPolicy>> {
    return this.http.put<RetentionPolicy>(`${this.baseUrl}/governance/retention-policy/${id}`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteRetentionPolicy(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/retention-policy/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Access Control Management
  getAccessControls(params?: any): Observable<ApiResponse<AccessControl[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<AccessControl[]>(`${this.baseUrl}/governance/access-controls`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAccessControl(id: string): Observable<ApiResponse<AccessControl>> {
    return this.http.get<AccessControl>(`${this.baseUrl}/governance/access-control/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createAccessControl(accessControl: AccessControl): Observable<ApiResponse<AccessControl>> {
    return this.http.post<AccessControl>(`${this.baseUrl}/governance/access-control`, accessControl)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAccessControl(id: string, accessControl: Partial<AccessControl>): Observable<ApiResponse<AccessControl>> {
    return this.http.put<AccessControl>(`${this.baseUrl}/governance/access-control/${id}`, accessControl)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAccessControl(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/access-control/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Compliance Management
  getComplianceRecords(params?: any): Observable<ApiResponse<ComplianceRecord[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ComplianceRecord[]>(`${this.baseUrl}/governance/compliance-records`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getComplianceRecord(id: string): Observable<ApiResponse<ComplianceRecord>> {
    return this.http.get<ComplianceRecord>(`${this.baseUrl}/governance/compliance-record/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createComplianceRecord(record: ComplianceRecord): Observable<ApiResponse<ComplianceRecord>> {
    return this.http.post<ComplianceRecord>(`${this.baseUrl}/governance/compliance-record`, record)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateComplianceRecord(id: string, record: Partial<ComplianceRecord>): Observable<ApiResponse<ComplianceRecord>> {
    return this.http.put<ComplianceRecord>(`${this.baseUrl}/governance/compliance-record/${id}`, record)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteComplianceRecord(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/compliance-record/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Dashboard and Overview
  getGovernanceOverview(): Observable<ApiResponse<any>> {
    return this.http.get<any>(`${this.baseUrl}/governance/overview`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getGovernanceMetrics(params?: any): Observable<ApiResponse<any>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<any>(`${this.baseUrl}/governance/metrics`, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Import/Export and Utilities
  exportGovernanceData(entityType: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/governance/export/${entityType}`, { responseType: 'blob' });
  }

  importGovernanceData(entityType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    return this.http.post<any>(`${this.baseUrl}/governance/import`, formData);
  }

  validateGovernanceConfiguration(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/governance/validate`);
  }

  // Role utilities
  generateRoleKid(name: string): string {
    // Convert role name to kid format
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  // Helper method to build HttpParams from object
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          // Check for NaN values and skip them
          if (typeof params[key] === 'number' && isNaN(params[key])) {
            return; // Skip NaN values
          }

          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              if (typeof value === 'number' && isNaN(value)) {
                return; // Skip NaN values in arrays
              }
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

  // Helper method to wrap a single object response to match the API response format
  private wrapResponse<T>(data: T): ApiResponse<T> {
    return { data, success: true };
  }

  // Helper method to wrap an array response to match the API response format
  private wrapArrayResponse<T = any>(response: any): ApiResponse<T[]> {
    // If response is already in the correct format (has data property)
    if (response && typeof response === 'object' && 'data' in response) {
      return {
        data: response.data || [],
        total: response.total || (Array.isArray(response.data) ? response.data.length : 0),
        success: response.success !== undefined ? response.success : true,
        message: response.message
      };
    }

    // If response is a direct array
    if (Array.isArray(response)) {
      return {
        data: response as T[],
        total: response.length,
        success: true
      };
    }

    // Fallback for other cases
    return {
      data: [] as T[],
      total: 0,
      success: false,
      message: 'Invalid response format'
    };
  }
}
