import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, ToastModule, TagModule, InputTextModule,
    TableModule, ProgressSpinnerModule, ConfirmDialogModule, ChipModule, TooltipModule
  ],
  templateUrl: './team-detail.component.html',
  providers: [MessageService, ConfirmationService]
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  team: Team | null = null;
  editForm: Partial<Team> = {};
  loading = false;
  saving = false;
  editMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'] || params['kid'];
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
        this.team = data?.kid ? data : (data?.data ?? null);
        if (this.team) {
          this.editForm = { name: this.team.name, description: this.team.description };
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
    const id = this.team?.kid || this.team?.id;
    if (!id) return;
    this.saving = true;
    this.governanceServices.updateTeam(id, this.editForm).subscribe({
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
    if (this.team) this.editForm = { name: this.team.name, description: this.team.description };
    this.editMode = false;
  }

  goBack(): void {
    this.router.navigate(['/governance/teams']);
  }

  getStatusSeverity(isActive?: boolean): string {
    return isActive !== false ? 'success' : 'secondary';
  }

  getMemberList(): any[] {
    const members = this.team?.members;
    if (!members) return [];
    return Array.isArray(members) ? members : [];
  }
}
