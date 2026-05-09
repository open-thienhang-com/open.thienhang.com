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
  { path: '/inventory/product*',      method: 'GET', label: 'Products',           section: 'Inventory' },
  { path: '/inventory/categor*',      method: 'GET', label: 'Categories',         section: 'Inventory' },
  { path: '/inventory/supplier*',     method: 'GET', label: 'Suppliers',          section: 'Inventory' },
  { path: '/inventory/partner*',      method: 'GET', label: 'Partners',           section: 'Inventory' },
  { path: '/inventory/fleet*',        method: 'GET', label: 'Fleet/Truck',        section: 'Inventory' },
  { path: '/inventory/analytic*',     method: 'GET', label: 'Stock Analytics',    section: 'Inventory' },
  { path: '/inventory/forecast*',     method: 'GET', label: 'Forecasting',        section: 'Inventory' },
  // ── Retail & Commerce ────────────────────────────────────────────────────
  { path: '/retail/*',                method: 'GET', label: 'Retail (all)',       section: 'Retail' },
  { path: '/retail/order*',           method: 'GET', label: 'Orders',             section: 'Retail' },
  { path: '/retail/transaction*',     method: 'GET', label: 'Transactions',       section: 'Retail' },
  { path: '/retail/product*',         method: 'GET', label: 'Retail Products',    section: 'Retail' },
  { path: '/retail/payment*',         method: 'GET', label: 'Payment',            section: 'Retail' },
  { path: '/retail/pos*',             method: 'GET', label: 'POS',                section: 'Retail' },
  { path: '/retail/ecommerce*',       method: 'GET', label: 'Ecommerce',          section: 'Retail' },
  // ── Customers & Loyalty ──────────────────────────────────────────────────
  { path: '/loyalty/*',               method: 'GET', label: 'Loyalty (all)',      section: 'Customers' },
  { path: '/loyalty/member*',         method: 'GET', label: 'Members',            section: 'Customers' },
  { path: '/loyalty/reward*',         method: 'GET', label: 'Rewards',            section: 'Customers' },
  { path: '/loyalty/campaign*',       method: 'GET', label: 'Campaigns',          section: 'Customers' },
  { path: '/loyalty/segment*',        method: 'GET', label: 'Segments',           section: 'Customers' },
  { path: '/loyalty/analytic*',       method: 'GET', label: 'Loyalty Analytics',  section: 'Customers' },
  // ── Support / CMC ────────────────────────────────────────────────────────
  { path: '/cmc/*',                   method: 'GET', label: 'Support (all)',      section: 'Support' },
  { path: '/cmc/template*',           method: 'GET', label: 'Templates',          section: 'Support' },
  { path: '/cmc/automation*',         method: 'GET', label: 'Automation',         section: 'Support' },
  { path: '/cmc/workspace*',          method: 'GET', label: 'Workspace',          section: 'Support' },
  // ── Planning & Logistics ─────────────────────────────────────────────────
  { path: '/planning/*',              method: 'GET', label: 'Planning (all)',     section: 'Planning' },
  { path: '/planning/vehicle*',       method: 'GET', label: 'Vehicles',           section: 'Planning' },
  { path: '/planning/auto-planning*', method: 'GET', label: 'Auto Planning',      section: 'Planning' },
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
