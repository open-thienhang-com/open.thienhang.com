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
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    BadgeModule,
    ToastModule,
    SkeletonModule,
    TabViewModule,
    TableModule,
    ChipModule,
    DividerModule,
    ProgressBarModule,
    TooltipModule,
    ConfirmDialogModule,
    InputSwitchModule,
    InputTextModule
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  role: RoleDetail | null = null;
  loading = false;
  roleId: string | null = null;
  expandedRows: { [key: string]: boolean } = {};
  
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
      this.roleId = params['id'];
      if (this.roleId) {
        this.loadRole();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRole(): void {
    if (!this.roleId) return;
    
    console.log('Loading role with ID:', this.roleId);
    this.loading = true;
    this.governanceServices.getRoleDetail(this.roleId).subscribe({
      next: (response) => {
        console.log('Role API response:', response);
        if (response.success && response.data) {
          this.role = response.data;
          console.log('Role loaded successfully:', this.role);
        } else {
          console.warn('Role not found or invalid response:', response);
          this.messageService.add({
            severity: 'error',
            summary: 'Role Not Found',
            detail: 'The role you\'re looking for doesn\'t exist or has been deleted.'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading role:', error);
        const errorMessage = error.status === 404 
          ? 'The role you\'re looking for doesn\'t exist or has been deleted.'
          : 'Failed to load role details. Please try again.';
        
        this.messageService.add({
          severity: 'error',
          summary: 'Role Not Found',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/governance/roles']);
  }

  editRole(): void {
    if (this.role) {
      this.router.navigate(['/governance/roles/edit', this.role.kid]);
    }
  }

  toggleRoleStatus(): void {
    if (!this.role) return;
    
    const action = this.role.is_active ? 'deactivate' : 'activate';
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this role?`,
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Role`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: this.role.is_active ? 'p-button-danger' : 'p-button-success',
      accept: () => {
        this.governanceServices.updateRoleStatus(this.role!.kid, !this.role!.is_active).subscribe({
          next: (response) => {
            if (response.success) {
              this.role!.is_active = !this.role!.is_active;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Role ${action}d successfully`
              });
            }
          },
          error: (error) => {
            console.error('Error updating role status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Failed to ${action} role`
            });
          }
        });
      }
    });
  }

  deleteRole(): void {
    if (!this.role) return;
    
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this role? This action cannot be undone.',
      header: 'Delete Role',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteRole(this.role!.kid).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Role deleted successfully'
              });
              this.router.navigate(['/governance/roles']);
            }
          },
          error: (error) => {
            console.error('Error deleting role:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete role'
            });
          }
        });
      }
    });
  }

  getRoleTypeSeverity(type: string): string {
    switch (type) {
      case 'system': return 'danger';
      case 'business': return 'info';
      case 'governance': return 'warning';
      default: return 'secondary';
    }
  }

  getActionSeverity(action: string): string {
    switch (action) {
      case 'read': return 'info';
      case 'write': return 'warning';
      case 'delete': return 'danger';
      case 'manage': return 'success';
      default: return 'secondary';
    }
  }

  getSensitivitySeverity(sensitivity: string): string {
    switch (sensitivity?.toLowerCase()) {
      case 'high':
      case 'critical': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  }

  getAssetIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'database': return 'pi pi-database';
      case 'table': return 'pi pi-table';
      case 'file': return 'pi pi-file';
      case 'api': return 'pi pi-cloud';
      case 's3':
      case 'cloud_storage': return 'pi pi-cloud';
      case 'dashboard': return 'pi pi-chart-line';
      case 'report': return 'pi pi-chart-bar';
      case 'mlmodel': return 'pi pi-sitemap';
      case 'pipeline': return 'pi pi-arrows-h';
      case 'notebook': return 'pi pi-book';
      default: return 'pi pi-box';
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy to clipboard'
      });
    });
  }

  filterPermissions(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const searchValue = inputElement.value;
    // PrimeNG table will handle the filtering automatically via globalFilterFields
  }
}
