import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices, RoleDetail } from '../../../../core/services/governance.services';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, ToastModule, ProgressSpinnerModule, TableModule],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
  providers: [MessageService]
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  role: RoleDetail | null = null;
  loading = false;
  errorMessage: string | null = null;
  roleId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Accept either :id or :kid route param depending on route config
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

  loadRole(kid: string): void {
    this.loading = true;
    this.errorMessage = null;
    this.role = null;

    this.governanceServices.getRoleDetail(kid).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res && (res.success === true) && res.data) {
          this.role = res.data as RoleDetail;
        } else if (res && res.data) {
          // fallback if API returns data without success flag
          this.role = res.data as RoleDetail;
        } else {
          this.errorMessage = res?.message || 'Failed to load role';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Error fetching role';
        try { this.messageService.add({ severity: 'error', summary: 'Error', detail: this.errorMessage }); } catch (e) { }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/governance/roles']);
  }

  /**
   * Transform permissions array into a flat array where each row represents one asset.
   * Permissions with multiple assets will span multiple rows.
   * The first row of each permission group gets a rowspan marker.
   */
  getExpandedPermissions(): any[] {
    if (!this.role?.permissions) return [];

    const expandedRows: any[] = [];

    this.role.permissions.forEach((permission: any) => {
      const assets = permission.assets || [];
      const assetCount = assets.length;

      if (assetCount === 0) {
        // Permission with no assets - create a single row with placeholder
        expandedRows.push({
          permission,
          asset: {
            kid: null,
            name: 'No assets',
            type: 'none',
            location: '-',
            status: '-',
            source: '-',
            sensitivity: '-'
          },
          assetCount: 1,
          isFirstAsset: true
        });
      } else {
        // Permission with assets - create one row per asset
        assets.forEach((asset: any, index: number) => {
          expandedRows.push({
            permission,
            asset,
            assetCount,
            isFirstAsset: index === 0  // Only the first asset row shows the permission cell
          });
        });
      }
    });

    return expandedRows;
  }

  /**
   * Calculate total number of assets across all permissions
   */
  getTotalAssetsCount(): number {
    if (!this.role?.permissions) return 0;

    return this.role.permissions.reduce((total: number, permission: any) => {
      return total + (permission.assets?.length || 0);
    }, 0);
  }
}
