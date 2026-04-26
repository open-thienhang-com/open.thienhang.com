import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { GovernanceServices, Tenant, TenantCreate } from '../../../core/services/governance.services';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, TableModule, TagModule, InputTextModule, DropdownModule,
    DialogModule, ToastModule, CardModule, PaginatorModule, SkeletonModule,
    ConfirmDialogModule, ToolbarModule, TooltipModule, BadgeModule
  ],
  templateUrl: './tenants.component.html',
  providers: [MessageService, ConfirmationService]
})
export class TenantsComponent implements OnInit {
  tenants: Tenant[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 0;
  pageSize = 20;

  searchTerm = '';
  selectedStatus = '';

  // UI State
  viewMode: 'list' | 'card' = 'list';
  showFilters = false;

  stats = { total: 0, active: 0, suspended: 0, trial: 0 };

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Trial', value: 'trial' }
  ];

  tenantStatusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Trial', value: 'trial' }
  ];

  constructor(
    private governanceServices: GovernanceServices,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    const params: any = {
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize
    };
    if (this.selectedStatus) params['status'] = this.selectedStatus;

    this.governanceServices.getTenants(params).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        if (data?.data) {
          this.tenants = data.data;
          this.totalRecords = data.pagination?.total ?? data.data.length;
        } else if (Array.isArray(data)) {
          this.tenants = data;
          this.totalRecords = data.length;
        } else {
          this.tenants = [];
          this.totalRecords = 0;
        }
        this.updateStats();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenants' });
        this.loading = false;
      }
    });
  }

  updateStats(): void {
    this.stats.total = this.totalRecords;
    this.stats.active = this.tenants.filter(t => t.status === 'active').length;
    this.stats.suspended = this.tenants.filter(t => t.status === 'suspended').length;
    this.stats.trial = this.tenants.filter(t => t.status === 'trial').length;
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadTenants();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadTenants();
  }

  onStatusFilter(): void {
    this.currentPage = 0;
    this.loadTenants();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  refreshTenants(): void {
    this.loadTenants();
  }

  applyFilters(): void {
    this.onSearch();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.onSearch();
  }

  openCreateDialog(): void {
    this.router.navigate(['/governance/tenants/new']);
  }

  viewTenant(tenant: Tenant): void {
    this.router.navigate(['/governance/tenants', tenant.kid]);
  }

  deleteTenant(tenant: Tenant): void {
    this.confirmationService.confirm({
      message: `Suspend tenant "${tenant.name}"?`,
      header: 'Confirm Suspend',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.governanceServices.deleteTenant(tenant.kid).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tenant suspended' });
            this.loadTenants();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to suspend tenant' });
          }
        });
      }
    });
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
    return new Date(d).toLocaleDateString();
  }
}
