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

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ButtonModule, TagModule, ToastModule, ProgressSpinnerModule,
    TabViewModule, DividerModule, TooltipModule, BadgeModule, ChipModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './asset-detail.component.html',
})
export class AssetDetailComponent implements OnInit, OnDestroy {
  asset: any = null;
  loading = true;
  assetId = '';
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
      this.assetId = params['id'];
      if (this.assetId) this.loadAsset(this.assetId);
      else this.loading = false;
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAsset(id: string): void {
    this.loading = true;
    this.governanceServices.getAsset(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { this.asset = res?.data ?? res ?? null; this.loading = false; },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load asset' });
        this.loading = false;
      }
    });
  }

  editAsset(): void { this.router.navigate(['/governance/assets', this.assetId, 'edit']); }

  deleteAsset(): void {
    this.confirmationService.confirm({
      message: `Delete asset "${this.asset?.name}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteAsset(this.assetId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Asset deleted' });
            setTimeout(() => this.router.navigate(['/governance/assets']), 1000);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Delete failed' })
        });
      }
    });
  }

  getTypeSeverity(type: string): string {
    const map: Record<string, string> = { table: 'info', view: 'success', report: 'warning', api: 'danger', file: 'secondary' };
    return map[type?.toLowerCase()] ?? 'secondary';
  }

  getPermissions(): any[] { return this.asset?.permissions ?? []; }
  getPolicies(): any[] { return this.asset?.policies ?? []; }
  formatDate(d?: string): string { if (!d) return '—'; return new Date(d).toLocaleString(); }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() =>
      this.messageService.add({ severity: 'success', summary: 'Copied', detail: 'Copied to clipboard' }));
  }
}
