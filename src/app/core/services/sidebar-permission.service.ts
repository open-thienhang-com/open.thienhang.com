import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { getApiBase } from '../config/api-config';

export type PermissionMap = Record<string, boolean>;

export interface SidebarCheck {
  path: string;
  method: string;
  label: string;
  section: string;
}

export const SIDEBAR_CHECKS: SidebarCheck[] = [
  // ── Governance (admin / tenant_admin only) ───────────────────────────────
  { path: '/governance/*',            method: 'GET', label: 'Governance (all)',   section: 'Governance' },
  { path: '/governance/tenant*',      method: 'GET', label: 'Tenants',            section: 'Governance' },
  { path: '/governance/user*',        method: 'GET', label: 'Users',              section: 'Governance' },
  { path: '/governance/account*',     method: 'GET', label: 'Accounts',           section: 'Governance' },
  { path: '/governance/team*',        method: 'GET', label: 'Teams',              section: 'Governance' },
  { path: '/governance/branch*',      method: 'GET', label: 'Branches',           section: 'Governance' },
  { path: '/governance/role*',        method: 'GET', label: 'Roles',              section: 'Governance' },
  { path: '/governance/permission*',  method: 'GET', label: 'Permissions',        section: 'Governance' },
  { path: '/governance/polic*',       method: 'GET', label: 'Policies',           section: 'Governance' },
  { path: '/governance/asset*',       method: 'GET', label: 'Assets',             section: 'Governance' },
  { path: '/governance/entitlement*', method: 'GET', label: 'Entitlements',       section: 'Governance' },
  { path: '/governance/casbin*',      method: 'GET', label: 'RBAC Engine',        section: 'Governance' },
  { path: '/governance/admin*',       method: 'GET', label: 'Admin Tools',        section: 'Governance' },
  // ── Inventory ────────────────────────────────────────────────────────────
  { path: '/inventory/*',             method: 'GET', label: 'Inventory (all)',    section: 'Inventory' },
  // ── Retail & Commerce ────────────────────────────────────────────────────
  { path: '/retail/*',                method: 'GET', label: 'Retail (all)',       section: 'Retail' },
  // ── Customers & Loyalty ──────────────────────────────────────────────────
  { path: '/loyalty/*',               method: 'GET', label: 'Loyalty (all)',      section: 'Customers' },
  // ── Support / CMC ────────────────────────────────────────────────────────
  { path: '/cmc/*',                   method: 'GET', label: 'Support (all)',      section: 'Support' },
  // ── Planning & Logistics ─────────────────────────────────────────────────
  { path: '/planning/*',              method: 'GET', label: 'Planning (all)',     section: 'Planning' },
  // ── Data Mesh ────────────────────────────────────────────────────────────
  { path: '/data-mesh/*',             method: 'GET', label: 'Data Mesh (all)',    section: 'Data Mesh' },
];

@Injectable({ providedIn: 'root' })
export class SidebarPermissionService {
  private permissions$ = new BehaviorSubject<PermissionMap | null>(null);

  constructor(private http: HttpClient) {}

  loadPermissions(userId: string, tenantId: string): Observable<void> {
    const url = `${getApiBase()}/governance/casbin/bulk-check`;
    return this.http.post<any>(url, {
      user_id: userId,
      tenant_id: tenantId,
      checks: SIDEBAR_CHECKS.map(c => ({ path: c.path, method: c.method })),
    }).pipe(
      tap(res => this.permissions$.next(res?.data ?? {})),
      catchError(() => {
        this.permissions$.next({});
        return of(null);
      }),
      map(() => void 0),
    );
  }

  /** Synchronous check — fail-open: true when map not loaded or path not in map. */
  isAllowed(casbinPath: string): boolean {
    const map = this.permissions$.getValue();
    if (map === null) return true;
    if (!(casbinPath in map)) return true;
    return map[casbinPath];
  }

  /** Observable stream of the raw permission map. */
  getPermissions$(): Observable<PermissionMap | null> {
    return this.permissions$.asObservable();
  }

  /** Flat list with label + allowed flag, for the profile permissions table. */
  getPermissionList(): Array<SidebarCheck & { allowed: boolean | null }> {
    const map = this.permissions$.getValue();
    return SIDEBAR_CHECKS.map(c => ({
      ...c,
      allowed: map === null ? null : (map[c.path] ?? null),
    }));
  }

  clear(): void {
    this.permissions$.next(null);
  }
}
