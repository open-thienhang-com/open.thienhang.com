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
  providers: [MessageService, ConfirmationService]
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

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const kid = params['kid'];
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
        this.tenant = data?.kid ? data : (data?.data ?? null);
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
    this.saving = true;
    this.governanceServices.updateTenant(this.tenant.kid, this.editForm).subscribe({
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
    this.inviting = true;
    this.governanceServices.inviteTenantMember(this.tenant.kid, this.inviteData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Invited', detail: 'Member invited successfully' });
        this.showInviteDialog = false;
        this.inviting = false;
        this.loadMembers(this.tenant!.kid);
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
        this.governanceServices.removeTenantMember(this.tenant!.kid, userId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Member removed' });
            this.loadMembers(this.tenant!.kid);
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
