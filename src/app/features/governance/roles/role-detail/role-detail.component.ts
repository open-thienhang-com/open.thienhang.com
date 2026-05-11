import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices, RoleDetail } from '../../../../core/services/governance.services';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, ToastModule, ProgressSpinnerModule,
    TableModule, TabViewModule, TagModule, DividerModule, BadgeModule, TooltipModule, ConfirmDialogModule
  ],
  templateUrl: './role-detail.component.html',
  providers: [MessageService, ConfirmationService],
  styles: [`
    .role-profile-page { background: #f1f5f9; min-height: 100vh; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%);
      padding: 32px 40px 80px;
      overflow: hidden;
    }
    .cover-gradient {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at top right, rgba(255,255,255,.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .profile-header-content {
      position: relative;
      display: flex; align-items: flex-end; gap: 24px;
      max-width: 1200px; margin: 0 auto;
    }
    .profile-avatar-wrap { position: relative; flex-shrink: 0; }
    .profile-avatar {
      width: 96px; height: 96px; border-radius: 24px;
      background: rgba(255,255,255,.15); border: 4px solid rgba(255,255,255,.4);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(10px);
    }
    .profile-avatar i { font-size: 2.5rem; color: #fff; }
    .profile-status-dot {
      position: absolute; bottom: -4px; right: -4px;
      width: 22px; height: 22px; border-radius: 50%;
      border: 4px solid #fff;
    }
    .dot-active { background: #22c55e; }
    .dot-inactive { background: #94a3b8; }

    .profile-hero { flex: 1; padding-bottom: 4px; }
    .profile-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .profile-name { font-size: 2.25rem; font-weight: 800; color: #fff; margin: 0; }
    .profile-status-tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .profile-email { color: rgba(255,255,255,.75); margin: 6px 0 10px; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
    .profile-meta-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .meta-chip {
      background: rgba(255,255,255,.15); color: rgba(255,255,255,.9);
      border: 1px solid rgba(255,255,255,.2);
      padding: 4px 12px; border-radius: 999px; font-size: 0.8rem;
      display: flex; align-items: center; gap: 6px; backdrop-filter: blur(8px);
    }
    .meta-chip.mono { font-family: monospace; }

    .profile-header-actions { display: flex; gap: 10px; flex-shrink: 0; padding-bottom: 4px; align-items: center; }
    .profile-header-actions button { color: #fff !important; border-color: rgba(255,255,255,.4) !important; }
    .profile-header-actions .p-button-text { color: rgba(255,255,255,.8) !important; }

    /* ── Body ──────────────────────────────────────────────── */
    .profile-body {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
      max-width: 1200px; margin: -44px auto 0;
      padding: 0 40px 48px;
      position: relative;
    }
    @media (max-width: 1024px) {
      .profile-body { grid-template-columns: 1fr; }
    }

    /* ── Sidebar ────────────────────────────────────────────── */
    .profile-sidebar { display: flex; flex-direction: column; gap: 16px; }

    .stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-card {
      background: #fff; border-radius: 16px; padding: 16px 12px;
      text-align: center; box-shadow: 0 1px 10px rgba(0,0,0,.06);
    }
    .stat-icon { font-size: 1.25rem; color: #6366f1; display: block; margin-bottom: 6px; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-top: 2px; }

    .info-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 10px rgba(0,0,0,.06); overflow: hidden;
    }
    .info-card-header {
      padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
      color: #6366f1; display: flex; align-items: center; gap: 8px;
    }
    .info-list { padding: 8px 0; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 18px; border-bottom: 1px solid #f8fafc; gap: 8px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-key { font-size: 0.78rem; color: #94a3b8; font-weight: 500; flex-shrink: 0; }
    .info-val { font-size: 0.875rem; color: #1e293b; font-weight: 600; text-align: right; display: flex; align-items: center; gap: 4px; }

    .id-card .id-code {
      display: block; padding: 14px 18px;
      font-family: monospace; font-size: 0.75rem;
      color: #64748b; word-break: break-all; line-height: 1.6;
    }

    /* ── Main cards ─────────────────────────────────────────── */
    .profile-main { display: flex; flex-direction: column; gap: 20px; }

    .profile-card {
      background: #fff; border-radius: 20px;
      box-shadow: 0 1px 12px rgba(0,0,0,.06); overflow: hidden;
    }
    .profile-card.no-pad { padding: 0; }

    /* ── TabView ── */
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav {
      background: #f8fafc; padding: 0 24px; border-bottom: 1px solid #f1f5f9;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li .p-tabview-nav-link {
      background: transparent; border: none; padding: 18px 24px; font-weight: 700;
      font-size: 0.9rem; color: #64748b; box-shadow: none;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
      color: #4f46e5; border-bottom: 2px solid #4f46e5;
    }

    .card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
    .card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }

    /* ── Table Styling ── */
    :host ::ng-deep .no-border.p-datatable .p-datatable-thead > tr > th {
      background: #f8fafc; border: none; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; color: #64748b;
    }
    :host ::ng-deep .no-border.p-datatable .p-datatable-tbody > tr { border-bottom: 1px solid #f1f5f9; }
    :host ::ng-deep .no-border.p-datatable .p-datatable-tbody > tr > td { border: none; padding: 16px 8px; }

    /* ── User Item Link ── */
    .user-item-link {
      display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #f1f5f9;
      padding: 12px 16px; border-radius: 16px; text-decoration: none; transition: all 0.2s;
    }
    .user-item-link:hover { border-color: #6366f1; background: #f5f3ff; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08); transform: translateY(-2px); }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;
    }
    .user-info { flex: 1; min-width: 0; }
    .user-info .name { font-weight: 700; color: #1e293b; font-size: 0.875rem; margin: 0; line-height: 1.2; }
    .user-info .email { font-size: 0.7rem; color: #64748b; font-family: monospace; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-item-link i { color: #cbd5e1; font-size: 0.8rem; }
    .user-item-link:hover i { color: #6366f1; }

    /* ── Empty State ── */
    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-icon { font-size: 2.5rem; color: #cbd5e1; display: block; margin-bottom: 12px; }
    .empty-state p { color: #94a3b8; margin: 0; }

    /* ── Loading ─────────────────────────────────────── */
    .profile-loading, .profile-not-found {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; gap: 12px; color: #64748b;
    }
  `]
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  role: RoleDetail | null = null;
  loading = false;
  errorMessage: string | null = null;
  roleId: string | null = null;
  usersWithRole: any[] = [];
  usersLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.roleId = params['id'] || params['kid'] || null;
      if (this.roleId) {
        this.loadRole(this.roleId);
      } else {
        this.errorMessage = 'No role ID provided in URL';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRole(id: string): void {
    this.loading = true;
    this.errorMessage = null;
    this.role = null;
    this.governanceServices.getRoleDetail(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.role = res?.data ?? res ?? null;
        this.loading = false;
        if (this.role) this.loadUsersWithRole();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error fetching role';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.errorMessage! });
      }
    });
  }

  loadUsersWithRole(): void {
    this.usersLoading = true;
    this.governanceServices.getUsers({ limit: 200 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const users: any[] = res?.data ?? [];
        this.usersWithRole = users.filter(u =>
          Array.isArray(u.roles) && u.roles.includes(this.roleId)
        );
        this.usersLoading = false;
      },
      error: () => { this.usersLoading = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/governance/roles']);
  }

  editRole(): void {
    this.router.navigate(['/governance/roles', this.roleId, 'edit']);
  }

  deleteRole(): void {
    this.confirmationService.confirm({
      message: `Delete role "${this.role?.name}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteRole(this.roleId!).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Role deleted' });
            setTimeout(() => this.router.navigate(['/governance/roles']), 800);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to delete' })
        });
      }
    });
  }

  getActionSeverity(action: string): string {
    const map: Record<string, string> = {
      view: 'success', create: 'info', update: 'warning',
      patch: 'warning', delete: 'danger', unknown: 'secondary'
    };
    return map[action?.toLowerCase()] ?? 'secondary';
  }

  getTypeSeverity(type: string): string {
    const map: Record<string, string> = {
      system: 'danger', business: 'info', governance: 'warning'
    };
    return map[type?.toLowerCase()] ?? 'secondary';
  }

  getUserInitials(user: any): string {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  getUserName(user: any): string {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.email || user.kid || 'Unknown';
  }

  getTotalAssetsCount(): number {
    if (!this.role?.permissions) return 0;
    return this.role.permissions.reduce((t: number, p: any) => t + (p.assets?.length || 0), 0);
  }
}
