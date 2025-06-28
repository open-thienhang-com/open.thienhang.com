import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GovernanceServices {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) {}

  getAssets(params): Observable<any> {
    const url = `${this.baseUrl}/governance/assets`;
    return this.http.get(url, {params});
  }

  getAsset(id): Observable<any> {
    const url = `${this.baseUrl}/governance/asset/${id}`;
    return this.http.get(url);
  }

  createAsset(data ) {
    const url = `${this.baseUrl}/governance/asset`;
    return this.http.post(url, data);
  }

  deleteAsset(id ) {
    const url = `${this.baseUrl}/governance/asset/${id}`;
    return this.http.delete(url);
  }

  getAccounts(params): Observable<any> {
    const url = `${this.baseUrl}/governance/accounts`;
    return this.http.get(url, {params});
  }

  getAccount(id): Observable<any> {
    const url = `${this.baseUrl}/governance/account/${id}`;
    return this.http.get(url);
  }

  createAccount(data ) {
    const url = `${this.baseUrl}/governance/account`;
    return this.http.post(url, data);
  }

  deleteAccount(id ) {
    const url = `${this.baseUrl}/governance/account/${id}`;
    return this.http.delete(url);
  }

  // Permission
  getPermissions(params): Observable<any> {
    const url = `${this.baseUrl}/governance/permissions`;
    return this.http.get(url, {params});
  }

  getPermission(id): Observable<any> {
    const url = `${this.baseUrl}/governance/permission/${id}`;
    return this.http.get(url);
  }

  createPermission(data ) {
    const url = `${this.baseUrl}/governance/permission`;
    return this.http.post(url, data);
  }

  deletePermission(id ) {
    const url = `${this.baseUrl}/governance/permission/${id}`;
    return this.http.delete(url);
  }

  // Roles
  getRoles(params): Observable<any> {
    const url = `${this.baseUrl}/governance/roles`;
    return this.http.get(url, {params});
  }

  getRole(id): Observable<any> {
    const url = `${this.baseUrl}/governance/role/${id}`;
    return this.http.get(url);
  }

  createRole(data ) {
    const url = `${this.baseUrl}/governance/role`;
    return this.http.post(url, data);
  }

  deleteRole(id ) {
    const url = `${this.baseUrl}/governance/role/${id}`;
    return this.http.delete(url);
  }

  // Teams
  getTeams(params): Observable<any> {
    const url = `${this.baseUrl}/governance/teams`;
    return this.http.get(url, {params});
  }

  getTeam(id): Observable<any> {
    const url = `${this.baseUrl}/governance/team/${id}`;
    return this.http.get(url);
  }

  createTeam(data ) {
    const url = `${this.baseUrl}/governance/team`;
    return this.http.post(url, data);
  }

  deleteTeam(id ) {
    const url = `${this.baseUrl}/governance/team/${id}`;
    return this.http.delete(url);
  }

  // Users
  getUsers(params): Observable<any> {
    const url = `${this.baseUrl}/governance/users`;
    return this.http.get(url, {params});
  }

  getUser(id): Observable<any> {
    const url = `${this.baseUrl}/governance/user/${id}`;
    return this.http.get(url);
  }

  createUser(data ) {
    const url = `${this.baseUrl}/governance/user`;
    return this.http.post(url, data);
  }

  deleteUser(id ) {
    const url = `${this.baseUrl}/governance/user/${id}`;
    return this.http.delete(url);
  }

  // Polices
  getPolicies(params): Observable<any> {
    const url = `${this.baseUrl}/governance/policies`;
    return this.http.get(url, {params});
  }

  getPolicy(id): Observable<any> {
    const url = `${this.baseUrl}/governance/policy/${id}`;
    return this.http.get(url);
  }

  createPolicy(data ) {
    const url = `${this.baseUrl}/governance/policy`;
    return this.http.post(url, data);
  }

  deletePolicy(id ) {
    const url = `${this.baseUrl}/governance/policy/${id}`;
    return this.http.delete(url);
  }
}
