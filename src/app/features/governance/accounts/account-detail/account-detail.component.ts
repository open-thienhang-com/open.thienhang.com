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
  providers: [MessageService, ConfirmationService],
  templateUrl: './account-detail.component.html'
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
