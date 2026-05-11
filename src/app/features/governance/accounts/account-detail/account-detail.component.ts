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
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule, TagModule, ToastModule, ProgressSpinnerModule,
    TabViewModule, DividerModule, TooltipModule, BadgeModule, ConfirmDialogModule
  ],
  templateUrl: './account-detail.component.html',
  providers: [MessageService, ConfirmationService],
  styles: [`
    .account-profile-page { background: #f1f5f9; min-height: 100vh; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 60%, #1e40af 100%);
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
      backdrop-filter: blur(10px); overflow: hidden;
    }
    .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile-avatar .initials { font-size: 2rem; color: #fff; font-weight: 800; }
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
    .stat-icon { font-size: 1.25rem; color: #0ea5e9; display: block; margin-bottom: 6px; }
    .stat-value { font-size: 1.2rem; font-weight: 700; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-top: 2px; }

    .info-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 10px rgba(0,0,0,.06); overflow: hidden;
    }
    .info-card-header {
      padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
      color: #0284c7; display: flex; align-items: center; gap: 8px;
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

    /* ── TabView ── */
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav {
      background: #f8fafc; padding: 0 24px; border-bottom: 1px solid #f1f5f9;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li .p-tabview-nav-link {
      background: transparent; border: none; padding: 18px 24px; font-weight: 700;
      font-size: 0.9rem; color: #64748b; box-shadow: none;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
      color: #0284c7; border-bottom: 2px solid #0284c7;
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
export class AccountDetailComponent implements OnInit, OnDestroy {
  account: any = null;
  loading = true;
  accountId = '';

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
      const id = params['id'];
      this.accountId = id;
      if (id) this.loadAccount(id);
      else this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccount(id: string): void {
    this.loading = true;
    this.governanceServices.getAccount(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.account = res?.data ?? res ?? null;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load account' });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/governance/accounts']);
  }

  editAccount(): void {
    this.router.navigate(['/governance/accounts', this.accountId, 'edit']);
  }

  deleteAccount(): void {
    this.confirmationService.confirm({
      message: 'Deactivate this account? This will set the account to inactive.',
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteAccount(this.accountId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deactivated', detail: 'Account deactivated' });
            setTimeout(() => this.router.navigate(['/governance/accounts']), 800);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to deactivate' })
        });
      }
    });
  }

  getInitials(): string {
    const name = this.account?.full_name || this.account?.email || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() =>
      this.messageService.add({ severity: 'success', summary: 'Copied', detail: 'Copied to clipboard' })
    );
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  }

  getNotifications(): Record<string, boolean> {
    return this.account?.notifications ?? {};
  }

  getPreferences(): Record<string, any> {
    return this.account?.preferences ?? {};
  }
}
