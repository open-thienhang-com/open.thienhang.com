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
  providers: [MessageService, ConfirmationService]
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
