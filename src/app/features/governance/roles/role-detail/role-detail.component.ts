import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices, RoleDetail } from '../../../../core/services/governance.services';
import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, ToastModule, ProgressSpinnerModule,
    TableModule, TabViewModule, TagModule, DividerModule, BadgeModule, TooltipModule
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
  providers: [MessageService]
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  role: RoleDetail | null = null;
  loading = false;
  errorMessage: string | null = null;
  roleId: string | null = null;
  usersWithRole: any[] = [];
  usersLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.roleId = params['id'] || params['kid'] || null;
      if (this.roleId) {
        this.loadRole(this.roleId);
      } else {
        this.errorMessage = 'No role ID provided in URL';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRole(id: string): void {
    this.loading = true;
    this.errorMessage = null;
    this.role = null;
    this.governanceServices.getRoleDetail(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.role = res?.data ?? res ?? null;
        this.loading = false;
        if (this.role) this.loadUsersWithRole();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error fetching role';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.errorMessage! });
      }
    });
  }

  loadUsersWithRole(): void {
    this.usersLoading = true;
    this.governanceServices.getUsers({ limit: 200 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const users: any[] = res?.data ?? [];
        this.usersWithRole = users.filter(u =>
          Array.isArray(u.roles) && u.roles.includes(this.roleId)
        );
        this.usersLoading = false;
      },
      error: () => { this.usersLoading = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/governance/roles']);
  }

  getActionSeverity(action: string): string {
    const map: Record<string, string> = {
      view: 'success', create: 'info', update: 'warning',
      patch: 'warning', delete: 'danger', unknown: 'secondary'
    };
    return map[action?.toLowerCase()] ?? 'secondary';
  }

  getTypeSeverity(type: string): string {
    const map: Record<string, string> = {
      system: 'danger', business: 'info', governance: 'warning'
    };
    return map[type?.toLowerCase()] ?? 'secondary';
  }

  getUserInitials(user: any): string {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  getUserName(user: any): string {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.email || user.kid || 'Unknown';
  }

  getTotalAssetsCount(): number {
    if (!this.role?.permissions) return 0;
    return this.role.permissions.reduce((t: number, p: any) => t + (p.assets?.length || 0), 0);
  }
}
