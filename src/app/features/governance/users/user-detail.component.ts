import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices } from '../../../core/services/governance.services';
import { MessageService } from 'primeng/api';

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

@Component({
  standalone: true,
  selector: 'app-user-detail',
  imports: [
    CommonModule, RouterModule, FormsModule,
    CardModule, ButtonModule, TagModule, DividerModule,
    ProgressSpinnerModule, ChipModule, ToastModule, InputTextModule, TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent implements OnInit, OnDestroy {
  user: any = null;
  loading = true;
  editMode = false;
  saving = false;
  editForm: any = {};

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const kid = params['kid'];
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
            status: this.user.status
          };
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
        status: this.user.status
      };
    }
    this.editMode = false;
  }

  goBack(): void {
    this.router.navigate(['/governance/users']);
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
