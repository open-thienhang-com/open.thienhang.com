import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-entitlement-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule, TagModule, ToastModule, ProgressSpinnerModule,
    TabViewModule, DividerModule, TooltipModule, TableModule, BadgeModule, ConfirmDialogModule
  ],
  templateUrl: './entitlement-detail.component.html',
  providers: [MessageService, ConfirmationService],
  styles: [`
    .entitlement-profile-page { background: #f1f5f9; min-height: 100vh; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #10b981 0%, #059669 60%, #064e3b 100%);
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
    .stat-icon { font-size: 1.25rem; color: #10b981; display: block; margin-bottom: 6px; }
    .stat-value { font-size: 1.4rem; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-top: 2px; }

    .info-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 10px rgba(0,0,0,.06); overflow: hidden;
    }
    .info-card-header {
      padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
      color: #059669; display: flex; align-items: center; gap: 8px;
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
    .card-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 8px; }
    .card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }

    /* ── TabView ── */
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav {
      background: #f8fafc; padding: 0 24px; border-bottom: 1px solid #f1f5f9;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li .p-tabview-nav-link {
      background: transparent; border: none; padding: 18px 24px; font-weight: 700;
      font-size: 0.9rem; color: #64748b; box-shadow: none;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
      color: #059669; border-bottom: 2px solid #059669;
    }

    /* ── Table ── */
    :host ::ng-deep .profile-table.p-datatable .p-datatable-thead > tr > th {
      background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; padding: 12px 24px;
    }
    :host ::ng-deep .profile-table.p-datatable .p-datatable-tbody > tr > td {
      padding: 16px 24px; border-bottom: 1px solid #f1f5f9;
    }

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
export class EntitlementDetailComponent implements OnInit, OnDestroy {
  entitlement: any = null;
  assignments: any[] = [];
  loading = true;
  assignmentsLoading = false;
  entitlementCode = '';

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
      const code = params['code'];
      this.entitlementCode = code;
      if (code) this.loadEntitlement(decodeURIComponent(code));
      else this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEntitlement(code: string): void {
    this.loading = true;
    this.governanceServices.getEntitlement(code).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.entitlement = res?.data ?? res ?? null;
        this.loading = false;
        this.loadAssignments(code);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load entitlement' });
        this.loading = false;
      }
    });
  }

  loadAssignments(code: string): void {
    this.assignmentsLoading = true;
    this.governanceServices.getEntitlementAssignments({ code }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.assignments = res?.data ?? [];
        this.assignmentsLoading = false;
      },
      error: () => { this.assignmentsLoading = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/governance/entitlements']);
  }

  editEntitlement(): void {
    this.router.navigate(['/governance/entitlements', this.entitlementCode, 'edit']);
  }

  deleteEntitlement(): void {
    this.confirmationService.confirm({
      message: `Delete entitlement "${this.entitlement?.code}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteEntitlement(this.entitlementCode).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Entitlement deleted' });
            setTimeout(() => this.router.navigate(['/governance/entitlements']), 800);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to delete' })
        });
      }
    });
  }

  getTierSeverity(tier: string): string {
    const map: Record<string, string> = {
      platinum: 'danger', gold: 'warning', silver: 'info',
      bronze: 'secondary', all: 'success'
    };
    return map[tier?.toLowerCase()] ?? 'secondary';
  }

  getCategorySeverity(cat: string): string {
    const map: Record<string, string> = {
      discount: 'warning', promotion: 'success', shipping: 'info',
      points: 'warning', membership: 'danger', gift: 'success', access: 'info'
    };
    return map[cat?.toLowerCase()] ?? 'secondary';
  }

  getMetadataJson(): string {
    return JSON.stringify(this.entitlement?.metadata ?? {}, null, 2);
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  }
}
