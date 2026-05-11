import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices } from '../../../core/services/governance.services';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  standalone: true,
  selector: 'app-user-detail',
  imports: [
    CommonModule, RouterModule, FormsModule,
    CardModule, ButtonModule, TagModule, DividerModule,
    ProgressSpinnerModule, ChipModule, ToastModule, InputTextModule, TooltipModule, TableModule, TabViewModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-detail.component.html',
  styles: [`
    .user-profile-page { background: #f1f5f9; min-height: 100vh; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%);
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
      width: 96px; height: 96px; border-radius: 50%;
      background: rgba(255,255,255,.15); border: 4px solid rgba(255,255,255,.4);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(10px);
    }
    .profile-avatar i { font-size: 2.5rem; color: #fff; }
    .profile-status-dot {
      position: absolute; bottom: 6px; right: 6px;
      width: 18px; height: 18px; border-radius: 50%;
      border: 3px solid #fff;
    }
    .dot-active { background: #22c55e; }
    .dot-inactive { background: #94a3b8; }

    .profile-hero { flex: 1; padding-bottom: 4px; }
    .profile-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .profile-name { font-size: 1.875rem; font-weight: 800; color: #fff; margin: 0; }
    .profile-status-tag { font-size: 0.75rem; }
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
      grid-template-columns: 300px 1fr;
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

    .id-card .user-id-code {
      display: block; padding: 14px 18px;
      font-family: 'Courier New', monospace; font-size: 0.75rem;
      color: #64748b; word-break: break-all; line-height: 1.6;
    }

    /* ── Main cards ─────────────────────────────────────────── */
    .profile-main { display: flex; flex-direction: column; gap: 20px; }

    .profile-card {
      background: #fff; border-radius: 20px;
      box-shadow: 0 1px 12px rgba(0,0,0,.06); overflow: hidden;
    }
    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
    }
    .card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 8px; }
    .card-title i { color: #6366f1; }
    .card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }
    .card-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .card-body { padding: 24px; }
    .card-body.no-pad { padding: 0; }

    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 640px) { .fields-grid { grid-template-columns: 1fr; } }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; }
    .field-value { font-size: 0.9rem; color: #1e293b; font-weight: 500; margin: 0; }
    .field-input { width: 100%; }

    /* ── Access section ─────────────────────────────────────── */
    .access-section { display: flex; flex-direction: column; gap: 20px; }
    .access-block { display: flex; flex-direction: column; gap: 10px; }
    .access-block-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #64748b; display: flex; align-items: center; gap: 6px; }
    .chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    :host ::ng-deep .chip-role.p-chip { background: #ede9fe; color: #7c3aed; border: 1px solid #ddd6fe; }
    :host ::ng-deep .chip-team.p-chip { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
    :host ::ng-deep .chip-policy.p-chip { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .empty-hint { font-size: 0.85rem; color: #94a3b8; margin: 0; display: flex; align-items: center; gap: 6px; }

    /* ── Empty / Loading ─────────────────────────────────────── */
    .profile-loading, .profile-not-found {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; gap: 12px; color: #64748b;
    }
    .profile-not-found i { font-size: 3.5rem; color: #cbd5e1; }
    .profile-not-found h2 { font-size: 1.25rem; font-weight: 700; color: #374151; margin: 0; }
    .profile-not-found p { color: #9ca3af; margin: 0; }

    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-icon { font-size: 2.5rem; color: #cbd5e1; display: block; margin-bottom: 12px; }
    .empty-state p { color: #94a3b8; margin: 0; }
  `]
})
export class UserDetailComponent implements OnInit, OnDestroy {
  user: any = null;
  loading = true;
  editMode = false;
  saving = false;
  editForm: any = {};
  userId = '';
  permissionMatrix: { resource: string; actions: { action: string; grantedByRoles: string[] }[] }[] = [];

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
      const kid = params['kid'];
      this.userId = kid;
      if (kid) this.loadUser(kid);
      else this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(kid: string): void {
    this.loading = true;
    this.governanceServices.getUser(kid).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.user = data?.kid ? data : (data?.data ?? data ?? null);
        if (this.user) {
          this.editForm = {
            first_name: this.user.first_name,
            last_name: this.user.last_name,
            email: this.user.email,
            role: this.user.role,
            status: this.user.status,
            phone: this.user.phone
          };
          this.buildPermissionMatrix();
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user' });
        this.loading = false;
      }
    });
  }

  saveChanges(): void {
    const id = this.user?.kid || this.user?._id;
    if (!id) return;
    this.saving = true;
    this.governanceServices.updateUser(id, this.editForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'User updated' });
        this.editMode = false;
        this.saving = false;
        this.loadUser(id);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
        this.saving = false;
      }
    });
  }

  cancelEdit(): void {
    if (this.user) {
      this.editForm = {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        role: this.user.role,
        status: this.user.status,
        phone: this.user.phone
      };
    }
    this.editMode = false;
  }

  buildPermissionMatrix(): void {
    const permissions: any[] = this.user?.governance?.permissions ?? [];
    const roles: any[] = this.user?.governance?.roles ?? [];
    const resourceMap = new Map<string, Map<string, string[]>>();

    for (const perm of permissions) {
      const code: string = typeof perm === 'string' ? perm : (perm?.code ?? perm?.id ?? '');
      const parts = code.split(':');
      if (parts.length < 3) continue;
      const resource = parts[1];
      const action = parts[2];

      if (!resourceMap.has(resource)) resourceMap.set(resource, new Map());
      const actionMap = resourceMap.get(resource)!;

      const grantedBy: string[] = [];
      for (const role of roles) {
        const roleName = typeof role === 'string' ? role : (role?.name ?? role?.id ?? '');
        const rolePerms: any[] = role?.permissions ?? [];
        const hasIt = rolePerms.some((rp: any) => {
          const rpCode = typeof rp === 'string' ? rp : (rp?.code ?? rp?.id ?? '');
          return rpCode === code;
        });
        if (hasIt) grantedBy.push(roleName);
      }
      actionMap.set(action, grantedBy);
    }

    this.permissionMatrix = Array.from(resourceMap.entries()).map(([resource, actionMap]) => ({
      resource,
      actions: Array.from(actionMap.entries()).map(([action, grantedByRoles]) => ({ action, grantedByRoles }))
    }));
  }

  getRoleNames(): string[] {
    const roles: any[] = this.user?.governance?.roles ?? [];
    return roles.map(r => typeof r === 'string' ? r : (r?.name ?? r?.id ?? ''));
  }

  roleGrantsPermission(roleName: string, permCode: string): boolean {
    for (const group of this.permissionMatrix) {
      for (const a of group.actions) {
        if (`perm:${group.resource}:${a.action}` === permCode) {
          return a.grantedByRoles.includes(roleName);
        }
      }
    }
    return false;
  }

  goBack(): void {
    this.router.navigate(['/governance/users']);
  }

  editUser(): void {
    this.router.navigate(['/governance/users', this.userId, 'edit']);
  }

  deleteUser(): void {
    this.confirmationService.confirm({
      message: `Delete user "${this.user?.full_name || this.user?.email}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteUser(this.userId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted' });
            setTimeout(() => this.router.navigate(['/governance/users']), 800);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to delete' })
        });
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      case 'suspended': return 'danger';
      default: return 'success';
    }
  }

  getUserName(): string {
    if (!this.user) return '';
    if (this.user.first_name || this.user.last_name) {
      return `${this.user.first_name || ''} ${this.user.last_name || ''}`.trim();
    }
    return this.user.name || this.user.email || this.user.kid || 'Unknown';
  }
}
