import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GovernanceServices, Policy, PaginatedResponse } from '../../../core/services/governance.services';
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

interface PolicyStats {
  totalPolicies: number;
  activePolicies: number;
  violations: number;
  enforcedPolicies: number;
}

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    ProgressBarModule
  ],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class PoliciesComponent implements OnInit {
  policies: Policy[] = [];
  loading = false;
  showPolicyModal = false;
  selectedPolicy: Policy | null = null;
  viewMode: 'list' | 'card' = 'list';
  showFilters: boolean = false;

  searchTerm = '';
  filters = {
    status: '',
    type: '',
    priority: '',
    enabled: ''
  };

  // Pagination
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Stats
  stats: PolicyStats = {
    totalPolicies: 0,
    activePolicies: 0,
    violations: 0,
    enforcedPolicies: 0
  };

  // Filter options
  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Access Control', value: 'access_control' },
    { label: 'Data Protection', value: 'data_protection' },
    { label: 'Compliance', value: 'compliance' }
  ];

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Enabled', value: 'true' },
    { label: 'Disabled', value: 'false' }
  ];

  priorityOptions = [
    { label: 'All Priorities', value: '' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' }
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
    this.loadPolicies();
    this.loadStats();
  }

  loadPolicies(): void {
    this.loading = true;

    // Show beautiful loading animation
    this.loadingService.showPageLoading('Loading policies...', 'data-flow');

    // Ensure pagination parameters are valid numbers
    const currentPage = Number(this.currentPage) || 0;
    const pageSize = Number(this.pageSize) || 10;
    const offset = currentPage * pageSize;

    // Debug logging
    console.log('Loading policies with params:', {
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
      type: this.filters.type || undefined,
      enabled: this.filters.enabled || undefined
    };

    this.governanceServices.getPolicies(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.policies = response.data.data;
          this.totalRecords = response.data.pagination.total;
          this.updateStats();
        } else {
          this.policies = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load policies'
        });
        this.loading = false;
        this.loadingService.hide();
      }
    });
  }

  loadStats(): void {
    // Stats will be calculated from the loaded policies
    this.updateStats();
  }

  updateStats(): void {
    this.stats.totalPolicies = this.totalRecords;
    this.stats.activePolicies = this.policies.filter(p => p.enabled).length;
    this.stats.enforcedPolicies = this.policies.filter(p => p.enabled && p.type === 'access_control').length;
    this.stats.violations = 0; // This would need to come from a separate API call
  }

  onLazyLoad(event: any): void {
    // Handle lazy loading event from PrimeNG table
    this.currentPage = Math.floor((event.first || 0) / (event.rows || 10));
    this.pageSize = Number(event.rows) || 10;
    this.loadPolicies();
  }

  onPageChange(event: any): void {
    // Handle regular page change event
    this.currentPage = Number(event.page) || 0;
    this.pageSize = Number(event.rows) || 10;
    this.loadPolicies();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadPolicies();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadPolicies();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filters = {
      status: '',
      type: '',
      priority: '',
      enabled: ''
    };
    this.currentPage = 0;
    this.loadPolicies();
  }

  refreshPolicies(): void {
    this.loadPolicies();
  }

  exportPolicies(): void {
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
    this.loadPolicies();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
  }

  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  createPolicy(): void {
    this.router.navigate(['/governance/policies/new']);
  }

  openPolicyModal(policy: Policy | null = null): void {
    this.selectedPolicy = policy;
    this.showPolicyModal = true;
  }

  closePolicyModal(): void {
    this.showPolicyModal = false;
    this.selectedPolicy = null;
  }

  onPolicySaved(): void {
    this.closePolicyModal();
    this.loadPolicies();
  }

  togglePolicyStatus(policy: Policy): void {
    const action = policy.enabled ? 'disable' : 'enable';
    const serviceCall = policy.enabled ?
      this.governanceServices.disablePolicy(policy.kid) :
      this.governanceServices.enablePolicy(policy.kid);

    serviceCall.subscribe({
      next: (response) => {
        if (response.success) {
          policy.enabled = !policy.enabled;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Policy ${action}d successfully`
          });
          this.updateStats();
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing policy:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${action} policy`
        });
      }
    });
  }

  deletePolicy(policy: Policy): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the policy "${policy.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.governanceServices.deletePolicy(policy.kid).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Policy deleted successfully'
              });
              this.loadPolicies();
            }
          },
          error: (error) => {
            console.error('Error deleting policy:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete policy'
            });
          }
        });
      }
    });
  }

  viewPolicyDetails(policy: Policy): void {
    this.router.navigate(['/governance/policies', policy.kid]);
  }

  getPolicyTypeSeverity(type: string): string {
    switch (type) {
      case 'access_control': return 'info';
      case 'data_protection': return 'warning';
      case 'compliance': return 'danger';
      default: return 'secondary';
    }
  }

  getPolicyStatusSeverity(enabled: boolean): string {
    return enabled ? 'success' : 'secondary';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackByPolicyId(index: number, policy: Policy): string {
    return policy.kid;
  }
}
