import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GovernanceServices, Role, RoleDetail, PaginatedResponse } from '../../../core/services/governance.services';
import { RoleComponent } from './role/role.component';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChipModule } from 'primeng/chip';
import { AccordionModule } from 'primeng/accordion';
import { ProgressBarModule } from 'primeng/progressbar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';

interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  businessRoles: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RoleComponent,
    RouterModule,
    ButtonModule,
    TableModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    CardModule,
    BadgeModule,
    PaginatorModule,
    SkeletonModule,
    ConfirmDialogModule,
    SplitButtonModule,
    MenuModule,
    ToolbarModule,
    InputSwitchModule,
    ChipModule,
    AccordionModule,
    ProgressBarModule,
    OverlayPanelModule,
    TooltipModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  showRoleModal = false;
  selectedRole: Role | null = null;
  viewMode: 'list' | 'card' = 'list';
  showFilters: boolean = false;

  searchTerm = '';
  filters = {
    type: '',
    status: ''
  };

  // Pagination
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Stats
  stats: RoleStats = {
    totalRoles: 0,
    activeRoles: 0,
    systemRoles: 0,
    businessRoles: 0
  };

  // Filter options
  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'System', value: 'system' },
    { label: 'Business', value: 'business' },
    { label: 'Governance', value: 'governance' }
  ];

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' }
  ];

  constructor(
    private governanceServices: GovernanceServices,
    private router: Router,
    private toastService: ToastService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    // Initialize pagination with valid numbers
    this.currentPage = 0;
    this.pageSize = 10;
    this.loadRoles();
    this.loadStats();
  }

  loadRoles(): void {
    this.loading = true;

    // Show beautiful loading animation
    this.loadingService.showPageLoading('Loading roles...', 'bars');

    // Ensure pagination parameters are valid numbers
    const currentPage = Number(this.currentPage) || 0;
    const pageSize = Number(this.pageSize) || 10;
    const offset = currentPage * pageSize;

    // Debug logging
    console.log('Loading roles with params:', {
      currentPage,
      pageSize,
      offset,
      originalCurrentPage: this.currentPage,
      originalPageSize: this.pageSize
    });

    const params = {
      limit: pageSize,
      offset: offset,
      search: this.searchTerm || undefined,
      type: this.filters.type || undefined
    };

    this.governanceServices.getRoles(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roles = response.data.data;
          this.totalRecords = response.data.pagination.total;
          this.updateStats();
        } else {
          this.roles = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load roles'
        });
        this.loading = false;
        this.loadingService.hide();
      }
    });
  }

  loadStats(): void {
    // Stats will be calculated from the loaded roles
    this.updateStats();
  }

  updateStats(): void {
    this.stats.totalRoles = this.totalRecords;
    this.stats.activeRoles = this.roles.filter(r => r.is_active !== false).length;
    this.stats.systemRoles = this.roles.filter(r => r.type === 'system').length;
    this.stats.businessRoles = this.roles.filter(r => r.type === 'business').length;
  }

  onLazyLoad(event: any): void {
    // Handle lazy loading event from PrimeNG table
    this.currentPage = Math.floor((event.first || 0) / (event.rows || 10));
    this.pageSize = Number(event.rows) || 10;
    this.loadRoles();
  }

  onPageChange(event: any): void {
    // Handle regular page change event
    this.currentPage = Number(event.page) || 0;
    this.pageSize = Number(event.rows) || 10;
    this.loadRoles();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadRoles();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadRoles();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      type: '',
      status: ''
    };
    this.currentPage = 0;
    this.loadRoles();
  }

  refreshRoles(): void {
    this.loadRoles();
  }

  exportRoles(): void {
    // TODO: Implement export functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Export functionality coming soon'
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadRoles();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
  }

  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  openRoleModal(role: Role | null = null): void {
    this.selectedRole = role;
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedRole = null;
  }

  onRoleSaved(): void {
    this.closeRoleModal();
    this.loadRoles();
  }

  toggleRoleStatus(role: Role): void {
    const newStatus = !role.is_active;
    const action = newStatus ? 'activate' : 'deactivate';

    this.governanceServices.updateRole(role.kid, { is_active: newStatus }).subscribe({
      next: (response) => {
        if (response.success) {
          role.is_active = newStatus;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Role ${action}d successfully`
          });
          this.updateStats();
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing role:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${action} role`
        });
      }
    });
  }

  deleteRole(role: Role): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the role "${role.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.governanceServices.deleteRole(role.kid).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Role deleted successfully'
              });
              this.loadRoles();
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

  viewRoleDetails(role: Role): void {
    this.router.navigate(['/governance/roles', role.kid]);
  }

  getRoleTypeSeverity(type: string): string {
    switch (type) {
      case 'system': return 'danger';
      case 'business': return 'info';
      case 'governance': return 'warning';
      default: return 'secondary';
    }
  }

  getRoleStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'secondary';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackByRoleId(index: number, role: Role): string {
    return role.kid;
  }
}
