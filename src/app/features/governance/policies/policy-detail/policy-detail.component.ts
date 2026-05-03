import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices, Policy } from '../../../../core/services/governance.services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { getApiBase } from '../../../../core/config/api-config';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    TagModule,
    BadgeModule,
    ToastModule,
    SkeletonModule,
    TabViewModule,
    TableModule,
    ChipModule,
    DividerModule,
    ProgressBarModule,
    TooltipModule,
    ConfirmDialogModule,
    InputSwitchModule
  ],
  templateUrl: './policy-detail.component.html',
  providers: [MessageService, ConfirmationService],
  styles: [`
    .policy-profile-page { background: #f1f5f9; min-height: 100vh; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 60%, #312e81 100%);
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
    .profile-meta-text { color: rgba(255,255,255,.75); margin: 6px 0 10px; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
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
    .stat-icon { font-size: 1.25rem; color: #4f46e5; display: block; margin-bottom: 6px; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-top: 2px; }

    .info-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 10px rgba(0,0,0,.06); overflow: hidden;
    }
    .info-card-header {
      padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
      color: #4f46e5; display: flex; align-items: center; gap: 8px;
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
      display: block; font-family: monospace; font-size: 0.75rem;
      color: #64748b; word-break: break-all; line-height: 1.6;
    }

    /* ── Main cards ─────────────────────────────────────────── */
    .profile-main { display: flex; flex-direction: column; gap: 20px; }

    .profile-card {
      background: #fff; border-radius: 20px;
      box-shadow: 0 1px 12px rgba(0,0,0,.06); overflow: hidden;
    }
    .profile-card.no-pad { padding: 0; }
    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
    }
    .card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 8px; }
    .card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }
    .card-body { padding: 24px; }
    .card-body.no-pad { padding: 0; }

    /* ── Table Styling ── */
    :host ::ng-deep .no-border.p-datatable .p-datatable-thead > tr > th {
      background: #f8fafc; border: none; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; color: #64748b;
    }
    :host ::ng-deep .no-border.p-datatable .p-datatable-tbody > tr { border-bottom: 1px solid #f1f5f9; }
    :host ::ng-deep .no-border.p-datatable .p-datatable-tbody > tr > td { border: none; padding: 16px 8px; }

    /* ── Subjects ── */
    .subject-item {
      display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #f1f5f9;
      padding: 12px 16px; border-radius: 16px;
    }
    .subject-item.user { background: #f8fafc; }
    .subject-item.team { background: #faf5ff; border-color: #f3e8ff; }
    .subject-item .avatar {
      width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;
    }
    .subject-item.user .avatar { background: #4f46e5; color: #fff; }
    .subject-item.team .avatar { background: #9333ea; color: #fff; }
    .subject-item .info { flex: 1; min-width: 0; }
    .subject-item .info .name { font-weight: 700; color: #1e293b; font-size: 0.875rem; margin: 0; }
    .subject-item .info .email, .subject-item .info .meta { font-size: 0.7rem; color: #64748b; font-family: monospace; margin: 2px 0 0; }

    /* ── Empty State ── */
    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-icon { font-size: 2.5rem; color: #cbd5e1; display: block; margin-bottom: 12px; }
    .empty-state p { color: #94a3b8; margin: 0; }

    /* ── Loading ─────────────────────────────────────── */
    .profile-loading, .profile-not-found {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; gap: 12px; color: #64748b;
    }
    .skeleton-wrap { display: flex; flex-direction: column; align-items: center; width: 100%; }
  `]
})
export class PolicyDetailComponent implements OnInit, OnDestroy {
  policy: Policy | null = null;
  loading = false;
  policyId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
    ,
    private http: HttpClient
  ) { }

  getInitials(user: any): string {
    if (!user) return '';
    const first = (user.first_name || '').toString().trim();
    const last = (user.last_name || '').toString().trim();
    if (first || last) return ((first.charAt(0) || '') + (last.charAt(0) || '')).toUpperCase();
    if (user.name) return user.name.split(' ').map((s: string) => s.charAt(0)).slice(0, 2).join('').toUpperCase();
    if (user.kid) return user.kid.substring(0, 2).toUpperCase();
    return '';
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.policyId = params['id'] || params['kid'];
      if (this.policyId) {
        this.loadPolicy();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPolicy(): void {
    if (!this.policyId) return;

    console.log('Loading policy with ID:', this.policyId);
    console.log('API URL will be:', `${getApiBase()}/governance/policies/${this.policyId}`);
    this.loading = true;
    this.governanceServices.getPolicy(this.policyId).subscribe({
      next: (response) => {
        console.log('Policy API response:', response);
        // governanceServices wraps responses; but sometimes the API returns the raw object
        const raw = (response && (response as any).data) ? (response as any).data : response;
        if (raw && raw.kid) {
          this.policy = this.normalizePolicy(raw as any);
          console.log('Policy loaded successfully:', this.policy);
        } else {
          // Fallback: try a relative path which may be proxied (e.g., http://localhost:4200/governance/policies/:id)
          console.warn('Policy not found in wrapped response, attempting fallback fetch for', this.policyId);
          this.http.get<any>(`/governance/policies/${encodeURIComponent(this.policyId)}`).subscribe({
            next: (fallback) => {
              const candidate = (fallback && fallback.data) ? fallback.data : fallback;
              if (candidate && candidate.kid) {
                this.policy = this.normalizePolicy(candidate as any);
                console.log('Policy loaded from fallback endpoint:', this.policy);
              } else {
                console.warn('Fallback fetch returned invalid policy:', fallback);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Policy Not Found',
                  detail: 'The policy you\'re looking for doesn\'t exist or has been deleted.'
                });
              }
            },
            error: (err) => {
              console.error('Fallback fetch error:', err);
              this.messageService.add({ severity: 'error', summary: 'Policy Not Found', detail: 'Failed to load policy details.' });
            }
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading policy:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });

        let errorMessage = 'Failed to load policy details. Please try again.';
        if (error.status === 404) {
          errorMessage = 'The policy you\'re looking for doesn\'t exist or has been deleted.';
        } else if (error.status === 403) {
          errorMessage = 'You don\'t have permission to view this policy.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Policy Not Found',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  /**
   * Normalize a raw policy object from the API into the Policy interface the UI expects.
   */
  private normalizePolicy(raw: any): Policy {
    if (!raw) return raw;
    const p: any = { ...raw };
    // Ensure arrays exist
    p.subjects = Array.isArray(raw.subjects) ? raw.subjects : (raw.subjects ? [raw.subjects] : []);
    p.roles = Array.isArray(raw.roles) ? raw.roles : (raw.roles ? [raw.roles] : []);
    p.permissions = Array.isArray(raw.permissions) ? raw.permissions : (raw.permissions ? [raw.permissions] : []);
    p.resources = Array.isArray(raw.resources) ? raw.resources : (raw.resources ? [raw.resources] : []);
    p.role_details = Array.isArray(raw.role_details) ? raw.role_details : [];
    p.permission_details = Array.isArray(raw.permission_details) ? raw.permission_details : [];
    p.user_details = Array.isArray(raw.user_details) ? raw.user_details : [];
    p.team_details = Array.isArray(raw.team_details) ? raw.team_details : [];
    p.asset_details = Array.isArray(raw.asset_details) ? raw.asset_details : [];
    p.affected_assets_total = raw.affected_assets_total ?? 0;
    p.policy_rules_total = raw.policy_rules_total ?? 0;
    p.total_subjects = raw.total_subjects ?? (p.subjects ? p.subjects.length : 0);
    p.total_roles = raw.total_roles ?? (p.role_details ? p.role_details.length : (p.roles ? p.roles.length : 0));
    p.total_permissions = raw.total_permissions ?? (p.permission_details ? p.permission_details.length : (p.permissions ? p.permissions.length : 0));
    p.total_resources = raw.total_resources ?? (p.resources ? p.resources.length : 0);
    return p as Policy;
  }

  goBack(): void {
    this.router.navigate(['/governance/policies']);
  }

  editPolicy(): void {
    if (this.policy) {
      this.router.navigate(['/governance/policies/edit', this.policy.kid]);
    }
  }

  togglePolicyStatus(): void {
    if (!this.policy) return;

    const action = this.policy.enabled ? 'disable' : 'enable';
    const serviceCall = this.policy.enabled ?
      this.governanceServices.disablePolicy(this.policy.kid) :
      this.governanceServices.enablePolicy(this.policy.kid);

    serviceCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.policy!.enabled = !this.policy!.enabled;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Policy ${action}d successfully`
          });
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing policy:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${action} policy`
        });
      }
    });
  }

  deletePolicy(): void {
    if (!this.policy) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the policy "${this.policy.name}"?`,
      header: 'Delete Policy',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deletePolicy(this.policy!.kid).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Policy deleted successfully'
              });
              this.router.navigate(['/governance/policies']);
            }
          },
          error: (error) => {
            console.error('Error deleting policy:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete policy'
            });
          }
        });
      }
    });
  }

  getPolicyTypeSeverity(type: string): string {
    switch (type) {
      case 'access_control': return 'info';
      case 'data_protection': return 'warning';
      case 'compliance': return 'danger';
      default: return 'secondary';
    }
  }

  getPolicyStatusSeverity(enabled: boolean): string {
    return enabled ? 'success' : 'secondary';
  }

  getEffectSeverity(effect: string): string {
    switch (effect) {
      case 'allow': return 'success';
      case 'deny': return 'danger';
      default: return 'secondary';
    }
  }

  getPriorityColor(priority: number): string {
    if (priority >= 80) return 'danger';
    if (priority >= 50) return 'warning';
    return 'info';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString?.toString() || '-';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString?.toString() || '-';
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Text copied to clipboard'
      });
    });
  }
}
