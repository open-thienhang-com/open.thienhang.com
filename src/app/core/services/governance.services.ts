import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  name?: string;
  full_name?: string;
  email?: string;
  username?: string;
  type?: string;
  status?: string;
  department?: string;
  is_active?: boolean;
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  owner: string;
  tags: string[];
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  _id?: string;
  id?: string;
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

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: string;
  rules: any[];
  isActive: boolean;
  applicableResources: string[];
  createdAt: Date;
  updatedAt: Date;
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

@Injectable({
  providedIn: 'root'
})
export class GovernanceServices {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) {}

  // Users Management
  getUsers(params?: any): Observable<ApiResponse<User[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<User[]>(`${this.baseUrl}/governance/users`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<User>(`${this.baseUrl}/governance/user/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createUser(user: User): Observable<ApiResponse<User>> {
    return this.http.post<User>(`${this.baseUrl}/governance/user`, user)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateUser(id: string, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<User>(`${this.baseUrl}/governance/user/${id}`, user)
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
    return this.http.get<Team>(`${this.baseUrl}/governance/team/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createTeam(team: Team): Observable<ApiResponse<Team>> {
    return this.http.post<Team>(`${this.baseUrl}/governance/team`, team)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateTeam(id: string, team: Partial<Team>): Observable<ApiResponse<Team>> {
    return this.http.put<Team>(`${this.baseUrl}/governance/team/${id}`, team)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteTeam(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/team/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  activateTeam(id: string): Observable<ApiResponse<Team>> {
    return this.http.post<Team>(`${this.baseUrl}/governance/team/${id}/activate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  deactivateTeam(id: string): Observable<ApiResponse<Team>> {
    return this.http.post<Team>(`${this.baseUrl}/governance/team/${id}/deactivate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  getTeamMembers(teamId: string): Observable<ApiResponse<User[]>> {
    return this.http.get<User[]>(`${this.baseUrl}/governance/team/${teamId}/members`)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  addTeamMember(teamId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/governance/team/${teamId}/member/${userId}`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  removeTeamMember(teamId: string, userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/team/${teamId}/member/${userId}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Accounts Management
  getAccounts(params?: any): Observable<ApiResponse<Account[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Account[]>(`${this.baseUrl}/governance/accounts`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAccount(id: string): Observable<ApiResponse<Account>> {
    return this.http.get<Account>(`${this.baseUrl}/governance/account/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createAccount(account: Account): Observable<ApiResponse<Account>> {
    return this.http.post<Account>(`${this.baseUrl}/governance/account`, account)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAccount(id: string, account: Partial<Account>): Observable<ApiResponse<Account>> {
    return this.http.put<Account>(`${this.baseUrl}/governance/account/${id}`, account)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAccount(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/account/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  activateAccount(id: string): Observable<ApiResponse<Account>> {
    return this.http.post<Account>(`${this.baseUrl}/governance/account/${id}/activate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  deactivateAccount(id: string): Observable<ApiResponse<Account>> {
    return this.http.post<Account>(`${this.baseUrl}/governance/account/${id}/deactivate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Assets Management
  getAssets(params?: any): Observable<ApiResponse<Asset[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Asset[]>(`${this.baseUrl}/governance/assets`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAsset(id: string): Observable<ApiResponse<Asset>> {
    return this.http.get<Asset>(`${this.baseUrl}/governance/asset/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createAsset(asset: Asset): Observable<ApiResponse<Asset>> {
    return this.http.post<Asset>(`${this.baseUrl}/governance/asset`, asset)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAsset(id: string, asset: Partial<Asset>): Observable<ApiResponse<Asset>> {
    return this.http.put<Asset>(`${this.baseUrl}/governance/asset/${id}`, asset)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAsset(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/asset/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Policies Management
  getPolicies(params?: any): Observable<ApiResponse<Policy[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Policy[]>(`${this.baseUrl}/governance/policies`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getPolicy(id: string): Observable<ApiResponse<Policy>> {
    return this.http.get<Policy>(`${this.baseUrl}/governance/policy/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createPolicy(policy: Policy): Observable<ApiResponse<Policy>> {
    return this.http.post<Policy>(`${this.baseUrl}/governance/policy`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updatePolicy(id: string, policy: Partial<Policy>): Observable<ApiResponse<Policy>> {
    return this.http.put<Policy>(`${this.baseUrl}/governance/policy/${id}`, policy)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deletePolicy(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/policy/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  activatePolicy(id: string): Observable<ApiResponse<Policy>> {
    return this.http.post<Policy>(`${this.baseUrl}/governance/policy/${id}/activate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  deactivatePolicy(id: string): Observable<ApiResponse<Policy>> {
    return this.http.post<Policy>(`${this.baseUrl}/governance/policy/${id}/deactivate`, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Roles Management
  getRoles(params?: any): Observable<ApiResponse<Role[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Role[]>(`${this.baseUrl}/governance/roles`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getRole(id: string): Observable<ApiResponse<Role>> {
    return this.http.get<Role>(`${this.baseUrl}/governance/role/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createRole(role: Role): Observable<ApiResponse<Role>> {
    return this.http.post<Role>(`${this.baseUrl}/governance/role`, role)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateRole(id: string, role: Partial<Role>): Observable<ApiResponse<Role>> {
    return this.http.put<Role>(`${this.baseUrl}/governance/role/${id}`, role)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteRole(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/role/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Permissions Management
  getPermissions(params?: any): Observable<ApiResponse<Permission[]>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Permission[]>(`${this.baseUrl}/governance/permissions`, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getPermission(id: string): Observable<ApiResponse<Permission>> {
    return this.http.get<Permission>(`${this.baseUrl}/governance/permission/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createPermission(permission: Permission): Observable<ApiResponse<Permission>> {
    return this.http.post<Permission>(`${this.baseUrl}/governance/permission`, permission)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<ApiResponse<Permission>> {
    return this.http.put<Permission>(`${this.baseUrl}/governance/permission/${id}`, permission)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deletePermission(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<any>(`${this.baseUrl}/governance/permission/${id}`)
      .pipe(map(response => this.wrapResponse(response)));
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

  // Helper method to build HttpParams from object
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
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
  private wrapArrayResponse<T>(data: T[]): ApiResponse<T[]> {
    return { 
      data: data || [], 
      total: Array.isArray(data) ? data.length : 0,
      success: true 
    };
  }
}
