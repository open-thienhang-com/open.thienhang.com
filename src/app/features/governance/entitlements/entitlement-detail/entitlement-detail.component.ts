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
  providers: [MessageService, ConfirmationService],
  templateUrl: './entitlement-detail.component.html'
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
