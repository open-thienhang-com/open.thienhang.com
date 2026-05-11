import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GovernanceServices, Tenant, TenantUpdate, TenantMemberCreate } from '../../../../core/services/governance.services';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { InputTextarea } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, TabViewModule, ToastModule, TagModule,
    InputTextModule, DropdownModule, TableModule, DialogModule,
    ProgressSpinnerModule, ConfirmDialogModule, TooltipModule,
    DividerModule, InputTextarea, BadgeModule
  ],
  templateUrl: './tenant-detail.component.html',
  providers: [MessageService, ConfirmationService],
  styles: [`
    .tenant-profile-page { background: #f1f5f9; min-height: 100vh; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #ec4899 100%);
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
    .dot-suspended { background: #ef4444; }
    .dot-trial { background: #f59e0b; }

    .profile-hero { flex: 1; padding-bottom: 4px; }
    .profile-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .profile-name { font-size: 2.25rem; font-weight: 800; color: #fff; margin: 0; }
    .profile-status-tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .profile-slug { color: rgba(255,255,255,.75); margin: 6px 0 10px; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
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

    /* ── Detail Fields ── */
    .section-title { font-size: 0.875rem; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: #1e293b; border-left: 4px solid #6366f1; padding-left: 12px; }
    .detail-field label { display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; margin-bottom: 6px; }
    .detail-field p { font-size: 1rem; color: #1e293b; font-weight: 500; margin: 0; }

    .timeline-list { display: flex; flex-direction: column; gap: 12px; }
    .timeline-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
    .timeline-item .label { color: #64748b; }
    .timeline-item .val { color: #1e293b; }

    .json-box {
      background: #1e293b; border-radius: 12px; padding: 16px;
      color: #38bdf8; font-family: monospace; font-size: 0.75rem;
      max-height: 200px; overflow: auto; border: 1px solid #334155;
    }

    /* ── Members Table ── */
    .card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
    .card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }
    
    .member-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: #e0e7ff;
      color: #4338ca; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.875rem;
    }
    .member-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; margin: 0; line-height: 1.2; }
    .member-email { font-size: 0.75rem; color: #64748b; font-family: monospace; margin-top: 2px; }

    :host ::ng-deep .no-border.p-datatable .p-datatable-thead > tr > th {
      background: #f8fafc; border: none; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; color: #64748b;
    }
    :host ::ng-deep .no-border.p-datatable .p-datatable-tbody > tr { border-bottom: 1px solid #f1f5f9; }
    :host ::ng-deep .no-border.p-datatable .p-datatable-tbody > tr > td { border: none; padding: 16px 8px; }

    /* ── Dialogs ── */
    :host ::ng-deep .modern-profile-dialog.p-dialog .p-dialog-header { border-bottom: 1px solid #f1f5f9; padding: 20px 24px; }
    :host ::ng-deep .modern-profile-dialog.p-dialog .p-dialog-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
    .info-alert { background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 12px; padding: 12px 16px; display: flex; gap: 12px; align-items: flex-start; }
    .info-alert i { color: #0ea5e9; font-size: 1.1rem; margin-top: 2px; }
    .info-alert p { font-size: 0.8rem; color: #0369a1; margin: 0; line-height: 1.5; }

    /* ── Loading ─────────────────────────────────────── */
    .profile-loading, .profile-not-found {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; gap: 12px; color: #64748b;
    }
  `]
})
export class TenantDetailComponent implements OnInit, OnDestroy {
  tenant: Tenant | null = null;
  editForm: TenantUpdate = {};
  members: any[] = [];
  totalMembers = 0;
  memberPage = 0;
  memberPageSize = 50;

  loading = false;
  membersLoading = false;
  saving = false;
  editMode = false;

  showInviteDialog = false;
  inviteData: TenantMemberCreate = { email: '', role_id: 'role:viewer', telnet: '' };
  inviting = false;

  tenantRoles = [
    { label: 'Owner', value: 'role:owner' },
    { label: 'Admin', value: 'role:admin' },
    { label: 'Editor', value: 'role:editor' },
    { label: 'Viewer', value: 'role:viewer' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Trial', value: 'trial' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  tenantKid = '';

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const kid = params['kid'];
      this.tenantKid = kid;
      if (kid) {
        this.loadTenant(kid);
        this.loadMembers(kid);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTenant(kid: string): void {
    this.loading = true;
    this.governanceServices.getTenant(kid).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.tenant = (data?.kid || data?.id || data?.telnet || data?.slug) ? data : (data?.data ?? null);
        if (this.tenant) {
          this.editForm = { name: this.tenant.name, description: this.tenant.description, status: this.tenant.status };
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenant' });
        this.loading = false;
      }
    });
  }

  loadMembers(kid: string): void {
    this.membersLoading = true;
    this.governanceServices.getTenantMembers(kid, { limit: this.memberPageSize, offset: this.memberPage * this.memberPageSize })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          const data = (res as any)?.data;
          if (data?.data) {
            this.members = data.data;
            this.totalMembers = data.pagination?.total ?? data.data.length;
          } else if (Array.isArray(data)) {
            this.members = data;
            this.totalMembers = data.length;
          } else {
            this.members = [];
          }
          this.membersLoading = false;
        },
        error: () => {
          this.membersLoading = false;
        }
      });
  }

  saveChanges(): void {
    if (!this.tenant) return;
    const id = this.tenant.kid || this.tenant.id;
    if (!id) return;
    this.saving = true;
    this.governanceServices.updateTenant(id, this.editForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Tenant updated' });
        this.editMode = false;
        this.saving = false;
        this.loadTenant(this.tenant!.kid);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update tenant' });
        this.saving = false;
      }
    });
  }

  openInviteDialog(): void {
    this.inviteData = { user_id: '', role: '' };
    this.showInviteDialog = true;
  }

  inviteMember(): void {
    if (!this.tenant || !this.inviteData.email?.trim()) return;
    const id = this.tenant.kid || this.tenant.id;
    if (!id) return;
    this.inviting = true;
    this.governanceServices.inviteTenantMember(id, this.inviteData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Invited', detail: 'Member invited successfully' });
        this.showInviteDialog = false;
        this.inviting = false;
        this.loadMembers(id);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to invite member' });
        this.inviting = false;
      }
    });
  }

  removeMember(userId: string, name?: string): void {
    this.confirmationService.confirm({
      message: `Remove ${name || userId} from this tenant?`,
      header: 'Confirm Remove',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const id = this.tenant!.kid || this.tenant!.id;
        if (!id) return;
        this.governanceServices.removeTenantMember(id, userId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Member removed' });
            this.loadMembers(id);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove member' });
          }
        });
      }
    });
  }

  cancelEdit(): void {
    if (this.tenant) {
      this.editForm = { name: this.tenant.name, description: this.tenant.description, status: this.tenant.status };
    }
    this.editMode = false;
  }

  goBack(): void {
    this.router.navigate(['/governance/tenants']);
  }

  suspendTenant(): void {
    this.confirmationService.confirm({
      message: `Suspend tenant "${this.tenant?.name}"? Users will lose access until reactivated.`,
      header: 'Confirm Suspension',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteTenant(this.tenantKid).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Suspended', detail: 'Tenant suspended' });
            setTimeout(() => this.router.navigate(['/governance/tenants']), 800);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to suspend' })
        });
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'danger';
      case 'trial': return 'warning';
      default: return 'secondary';
    }
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  }

  getSettingsJson(): string {
    if (!this.tenant?.settings) return '{}';
    return JSON.stringify(this.tenant.settings, null, 2);
  }
}
