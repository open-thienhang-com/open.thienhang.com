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
  templateUrl: './user-detail.component.html'
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
            status: this.user.status
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
        status: this.user.status
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
