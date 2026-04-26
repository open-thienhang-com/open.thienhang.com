import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
  GovernanceServices,
  Tenant, User, Account, Team, Branch,
  Role, Permission, Policy, Asset, Entitlement
} from '../../../core/services/governance.services';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TabViewModule } from 'primeng/tabview';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

interface SectionStats {
  tenants: number;
  users: number;
  accounts: number;
  teams: number;
  branches: number;
  roles: number;
  permissions: number;
  policies: number;
  assets: number;
  entitlements: number;
}

@Component({
  selector: 'app-proposal',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ButtonModule, CardModule, TableModule, TagModule, BadgeModule,
    TabViewModule, SkeletonModule, TooltipModule, ToastModule, DividerModule
  ],
  templateUrl: './proposal.component.html',
  providers: [MessageService]
})
export class ProposalComponent implements OnInit {
  loading = true;

  tenants: Tenant[] = [];
  users: User[] = [];
  accounts: Account[] = [];
  teams: Team[] = [];
  branches: Branch[] = [];
  roles: Role[] = [];
  permissions: Permission[] = [];
  policies: Policy[] = [];
  assets: Asset[] = [];
  entitlements: Entitlement[] = [];

  stats: SectionStats = {
    tenants: 0, users: 0, accounts: 0, teams: 0, branches: 0,
    roles: 0, permissions: 0, policies: 0, assets: 0, entitlements: 0
  };

  flowNodes = [
    { label: 'Tenant', icon: 'pi pi-building', color: 'blue', route: '/governance/tenants', desc: 'Multi-tenant isolation' },
    { label: 'Users', icon: 'pi pi-user', color: 'indigo', route: '/governance/users', desc: 'Identity & authentication' },
    { label: 'Teams', icon: 'pi pi-users', color: 'violet', route: '/governance/teams', desc: 'Group collaboration' },
    { label: 'Roles', icon: 'pi pi-tag', color: 'purple', route: '/governance/roles', desc: 'Permission grouping' },
    { label: 'Permissions', icon: 'pi pi-key', color: 'orange', route: '/governance/permissions', desc: 'Resource-action rules' },
    { label: 'Policies', icon: 'pi pi-lock', color: 'red', route: '/governance/policies', desc: 'Access enforcement' },
    { label: 'Assets', icon: 'pi pi-database', color: 'teal', route: '/governance/assets', desc: 'Data resources' },
    { label: 'Entitlements', icon: 'pi pi-star', color: 'green', route: '/governance/entitlements', desc: 'Feature grants' },
  ];

  constructor(
    private svc: GovernanceServices,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;

    // Try the two consolidated endpoints first (2 calls instead of 10).
    // If the backend doesn't have them yet, fall back to individual calls.
    forkJoin({
      overview: this.svc.getGovernanceOverview({ limit: 5 }).pipe(catchError(() => of(null))),
      metrics:  this.svc.getGovernanceMetrics().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ overview, metrics }) => {
        const hasOverview = overview?.data && typeof overview.data === 'object' && !Array.isArray(overview.data);
        const hasMetrics  = metrics?.data  && typeof metrics.data  === 'object' && !Array.isArray(metrics.data);

        if (hasOverview || hasMetrics) {
          this.applyOverview(overview?.data);
          this.applyMetrics(metrics?.data);
          this.loading = false;
        } else {
          // Consolidated endpoints not ready — fall back to individual calls
          this.loadIndividual();
        }
      },
      error: () => this.loadIndividual()
    });
  }

  private applyOverview(data: any): void {
    if (!data) return;
    this.tenants     = data.tenants     ?? [];
    this.users       = data.users       ?? [];
    this.accounts    = data.accounts    ?? [];
    this.teams       = data.teams       ?? [];
    this.branches    = data.branches    ?? [];
    this.roles       = data.roles       ?? [];
    this.permissions = data.permissions ?? [];
    this.policies    = data.policies    ?? [];
    this.assets      = data.assets      ?? [];
    this.entitlements = data.entitlements ?? [];
  }

  private applyMetrics(data: any): void {
    if (!data) return;
    if (data.tenants     != null) this.stats.tenants     = data.tenants;
    if (data.users       != null) this.stats.users       = data.users;
    if (data.accounts    != null) this.stats.accounts    = data.accounts;
    if (data.teams       != null) this.stats.teams       = data.teams;
    if (data.branches    != null) this.stats.branches    = data.branches;
    if (data.roles       != null) this.stats.roles       = data.roles;
    if (data.permissions != null) this.stats.permissions = data.permissions;
    if (data.policies    != null) this.stats.policies    = data.policies;
    if (data.assets      != null) this.stats.assets      = data.assets;
    if (data.entitlements != null) this.stats.entitlements = data.entitlements;
  }

  private loadIndividual(): void {
    forkJoin({
      tenants:      this.svc.getTenants({ limit: 5, offset: 0 }).pipe(catchError(() => of(null))),
      users:        this.svc.getUsers({ limit: 5 }).pipe(catchError(() => of(null))),
      accounts:     this.svc.getAccounts({ limit: 5 }).pipe(catchError(() => of(null))),
      teams:        this.svc.getTeams({ limit: 5 }).pipe(catchError(() => of(null))),
      branches:     this.svc.getBranches({ limit: 5 }).pipe(catchError(() => of(null))),
      roles:        this.svc.getRoles({ limit: 5 }).pipe(catchError(() => of(null))),
      permissions:  this.svc.getPermissions({ limit: 5 }).pipe(catchError(() => of(null))),
      policies:     this.svc.getPolicies({ limit: 5 }).pipe(catchError(() => of(null))),
      assets:       this.svc.getAssets({ limit: 5 }).pipe(catchError(() => of(null))),
      entitlements: this.svc.getEntitlements({ limit: 5 }).pipe(catchError(() => of(null))),
    }).subscribe({
      next: (res) => {
        this.tenants     = this.extractList(res.tenants);
        this.stats.tenants = this.extractTotal(res.tenants);

        this.users       = this.extractList(res.users);
        this.stats.users = this.extractTotal(res.users);

        this.accounts    = this.extractList(res.accounts);
        this.stats.accounts = this.extractTotal(res.accounts);

        this.teams       = this.extractList(res.teams);
        this.stats.teams = this.extractTotal(res.teams);

        this.branches    = this.extractList(res.branches);
        this.stats.branches = this.extractTotal(res.branches);

        this.roles       = this.extractList(res.roles);
        this.stats.roles = this.extractTotal(res.roles);

        this.permissions = this.extractList(res.permissions);
        this.stats.permissions = this.extractTotal(res.permissions);

        this.policies    = this.extractList(res.policies);
        this.stats.policies = this.extractTotal(res.policies);

        this.assets      = this.extractList(res.assets);
        this.stats.assets = this.extractTotal(res.assets);

        this.entitlements = this.extractList(res.entitlements);
        this.stats.entitlements = this.extractTotal(res.entitlements);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load governance data' });
      }
    });
  }

  private extractList(res: any): any[] {
    if (!res) return [];
    const d = res?.data;
    if (d?.data && Array.isArray(d.data)) return d.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(res)) return res;
    return [];
  }

  private extractTotal(res: any): number {
    if (!res) return 0;
    const d = res?.data;
    if (d?.pagination?.total != null) return d.pagination.total;
    if (res?.total != null) return res.total;
    return this.extractList(res).length;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  getStatusSeverity(status?: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': case 'inactive': return 'danger';
      case 'trial': case 'pending': return 'warning';
      default: return 'secondary';
    }
  }

  getTierSeverity(tier?: string): string {
    switch (tier) {
      case 'enterprise': return 'danger';
      case 'premium': return 'warning';
      case 'pro': return 'info';
      default: return 'secondary';
    }
  }

  formatDate(d?: string | Date): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString();
  }

  countTier(tier: string): number {
    return this.entitlements.filter(e => e.tier === tier).length;
  }

  get totalEntities(): number {
    return Object.values(this.stats).reduce((a, b) => a + b, 0);
  }
}
