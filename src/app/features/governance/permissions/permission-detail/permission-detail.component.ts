import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-permission-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ButtonModule, TagModule, ToastModule, ProgressSpinnerModule,
    TabViewModule, DividerModule, TooltipModule, BadgeModule, ChipModule, ConfirmDialogModule, TableModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './permission-detail.component.html',
})
export class PermissionDetailComponent implements OnInit, OnDestroy {
  permission: any = null;
  rolesWithPermission: any[] = [];
  loading = true;
  permId = '';
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
      this.permId = params['id'];
      if (this.permId) this.loadPermission(this.permId);
      else this.loading = false;
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadPermission(id: string): void {
    this.loading = true;
    this.governanceServices.getPermission(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.permission = res?.data ?? res ?? null;
        this.loading = false;
        this.loadRolesWithPermission();
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load permission' }); this.loading = false; }
    });
  }

  loadRolesWithPermission(): void {
    this.governanceServices.getRoles({ limit: 200 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const roles: any[] = res?.data ?? [];
        this.rolesWithPermission = roles.filter((r: any) =>
          Array.isArray(r.permissions) && r.permissions.some((p: any) => p === this.permId || p?.identify === this.permId || p?.kid === this.permId)
        );
      },
      error: () => {}
    });
  }

  editPermission(): void { this.router.navigate(['/governance/permissions', this.permId, 'edit']); }

  deletePermission(): void {
    this.confirmationService.confirm({
      message: `Delete permission "${this.permission?.name}"? This will remove it from all roles.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deletePermission(this.permId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Permission deleted' });
            setTimeout(() => this.router.navigate(['/governance/permissions']), 1000);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Delete failed' })
        });
      }
    });
  }

  getActionSeverity(action: string): string {
    const map: Record<string, string> = { view: 'success', create: 'info', update: 'warning', patch: 'warning', delete: 'danger' };
    return map[action?.toLowerCase()] ?? 'secondary';
  }

  getAssets(): any[] { return this.permission?.assets ?? []; }
  formatDate(d?: string): string { if (!d) return '—'; return new Date(d).toLocaleString(); }
}
