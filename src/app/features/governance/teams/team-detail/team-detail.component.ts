import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GovernanceServices, Team } from '../../../../core/services/governance.services';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';

interface ContactEntry {
  type: string;
  value: string;
}

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, ToastModule, TagModule, InputTextModule,
    TableModule, ProgressSpinnerModule, ConfirmDialogModule, ChipModule, TooltipModule,
    DropdownModule, DividerModule, TabViewModule
  ],
  templateUrl: './team-detail.component.html',
  providers: [MessageService, ConfirmationService],
  styles: [`
    .team-profile-page { background: #f1f5f9; min-height: 100vh; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #a855f7 0%, #d946ef 60%, #db2777 100%);
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
    .stat-icon { font-size: 1.25rem; color: #a855f7; display: block; margin-bottom: 6px; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-top: 2px; }
    .stat-card.highlight .stat-icon { color: #ec4899; }

    .info-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 10px rgba(0,0,0,.06); overflow: hidden;
    }
    .info-card-header {
      padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
      color: #a855f7; display: flex; align-items: center; gap: 8px;
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
    .card-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 8px; }
    .card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }
    .card-body { padding: 24px; }

    /* ── Member Items ── */
    .member-link, .member-static {
      display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #f1f5f9;
      padding: 12px 16px; border-radius: 16px; text-decoration: none; transition: all 0.2s;
    }
    .member-link:hover { border-color: #a855f7; background: #faf5ff; transform: translateY(-2px); }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #d946ef);
      color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;
    }
    .avatar.gray { background: #e2e8f0; color: #64748b; }
    .info { flex: 1; min-width: 0; }
    .info .name { font-weight: 700; color: #1e293b; font-size: 0.875rem; margin: 0; }
    .info .meta { font-size: 0.7rem; color: #94a3b8; margin-top: 2px; }
    i.pi-chevron-right { color: #cbd5e1; font-size: 0.7rem; }

    /* ── Owner Chip ── */
    .owner-chip {
      display: flex; align-items: center; gap: 8px; background: #fff1f2; border: 1px solid #fecdd3;
      padding: 6px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; color: #be123c;
    }
    .owner-avatar { width: 20px; height: 20px; border-radius: 50%; background: #be123c; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; }

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
export class TeamDetailComponent implements OnInit, OnDestroy {
  team: any = null;
  editForm: Partial<Team> & { name?: string; description?: string } = {};
  editContacts: ContactEntry[] = [];
  loading = false;
  saving = false;
  editMode = false;

  contactTypeOptions = [
    { label: 'Email', value: 'email' },
    { label: 'Slack', value: 'slack' },
    { label: 'Phone', value: 'phone' }
  ];

  private destroy$ = new Subject<void>();

  teamId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'] || params['kid'];
      this.teamId = id;
      if (id) this.loadTeam(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeam(id: string): void {
    this.loading = true;
    this.governanceServices.getTeam(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.team = data?.kid ? data : (data?.data ?? data ?? null);
        if (this.team) {
          this.editForm = { name: this.team.name, description: this.team.description };
          this.editContacts = Array.isArray(this.team.contact)
            ? this.team.contact.map((c: any) => ({ type: c.type || 'email', value: c.value || '' }))
            : [];
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load team' });
        this.loading = false;
      }
    });
  }

  saveChanges(): void {
    const id = this.team?.kid || this.team?.id || this.team?._id;
    if (!id) return;
    this.saving = true;
    const payload: any = {
      name: this.editForm.name,
      description: this.editForm.description,
      contact: this.editContacts.filter(c => c.value.trim())
    };
    this.governanceServices.updateTeam(id, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Team updated' });
        this.editMode = false;
        this.saving = false;
        this.loadTeam(id);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update team' });
        this.saving = false;
      }
    });
  }

  cancelEdit(): void {
    if (this.team) {
      this.editForm = { name: this.team.name, description: this.team.description };
      this.editContacts = Array.isArray(this.team.contact)
        ? this.team.contact.map((c: any) => ({ type: c.type || 'email', value: c.value || '' }))
        : [];
    }
    this.editMode = false;
  }

  addContact(): void {
    this.editContacts.push({ type: 'email', value: '' });
  }

  removeContact(index: number): void {
    this.editContacts.splice(index, 1);
  }

  goBack(): void {
    this.router.navigate(['/governance/teams']);
  }

  deleteTeam(): void {
    this.confirmationService.confirm({
      message: `Delete team "${this.team?.name}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteTeam(this.teamId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Team deleted' });
            setTimeout(() => this.router.navigate(['/governance/teams']), 800);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to delete' })
        });
      }
    });
  }

  getStatusSeverity(isActive?: boolean): string {
    return isActive !== false ? 'success' : 'secondary';
  }

  getMemberList(): any[] {
    const members = this.team?.members;
    if (!members || !Array.isArray(members)) return [];
    return members.map((m: any) => typeof m === 'object' && m !== null
      ? { label: m.name || m.full_name || m.email || m.kid || m.id || 'Unknown', kid: m.kid || m.id || null }
      : { label: String(m), kid: null }
    );
  }

  getOwnersList(): any[] {
    const owners = this.team?.owners;
    if (!owners || !Array.isArray(owners)) return [];
    return owners.map((o: any) => {
      if (typeof o === 'object' && o !== null) {
        return { label: o.name || o.full_name || o.email || o.kid || 'Unknown' };
      }
      return { label: String(o) };
    });
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  }
}
