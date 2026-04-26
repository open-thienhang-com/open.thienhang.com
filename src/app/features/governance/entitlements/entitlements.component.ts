import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceServices, Entitlement, EntitlementAssignment } from '../../../core/services/governance.services';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthServices } from '../../../core/services/auth.services';
import { Branch } from '../../../core/services/governance.services';

@Component({
  selector: 'app-entitlements',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, TableModule, TagModule, InputTextModule,
    DialogModule, ToastModule, PaginatorModule, TooltipModule,
    TabViewModule, DividerModule, DropdownModule, InputTextarea,
    ConfirmDialogModule
  ],
  templateUrl: './entitlements.component.html',
  providers: [MessageService, ConfirmationService]
})
export class EntitlementsComponent implements OnInit {
  entitlements: Entitlement[] = [];
  assignments: EntitlementAssignment[] = [];
  loading = false;
  assignmentsLoading = false;
  
  totalRecords = 0;
  currentPage = 0;
  pageSize = 10;
  itemsPerPage = 10;

  viewMode: 'list' | 'card' = 'list';
  searchTerm = '';
  showFilters = false;

  selectedType: any = null;
  selectedStatus: any = null;

  typeOptions = [
    { label: 'Feature', value: 'feature' },
    { label: 'Limit', value: 'limit' },
    { label: 'Standard', value: 'standard' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  categoryOptions = [
    { label: 'Feature', value: 'feature' },
    { label: 'Limit', value: 'limit' },
    { label: 'Standard', value: 'standard' }
  ];

  tierOptions = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Premium', value: 'premium' },
    { label: 'Enterprise', value: 'enterprise' }
  ];

  showDialog = false;
  editMode = false;
  entitlement: Partial<Entitlement> = {};
  saving = false;

  showAssignDialog = false;
  assignment: Partial<EntitlementAssignment> = { entity_type: 'tenant' };
  assigning = false;

  entityTypes = [
    { label: 'Tenant', value: 'tenant' },
    { label: 'User', value: 'user' },
    { label: 'Team', value: 'team' }
  ];

  stats = { 
    total: 0, 
    active: 0, 
    totalAssignments: 0,
    features: 0,
    limits: 0
  };

  branches: Branch[] = [];
  currentUser: any = null;

  constructor(
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authServices: AuthServices
  ) {}

  ngOnInit() {
    this.authServices.getUser().subscribe(user => this.currentUser = user);
    this.loadEntitlements();
    this.loadAssignments();
    this.loadBranches();
  }

  loadBranches() {
    this.governanceServices.getBranches().subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.branches = data?.data || (Array.isArray(res.data) ? res.data : []);
      }
    });
  }

  loadEntitlements() {
    this.loading = true;
    this.governanceServices.getEntitlements({ 
      limit: this.pageSize, 
      offset: this.currentPage * this.pageSize 
    }).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        if (data?.data) {
          this.entitlements = data.data;
          this.totalRecords = data.pagination?.total ?? data.data.length;
        } else {
          this.entitlements = res.data as any;
          this.totalRecords = this.entitlements.length;
        }
        this.updateStats();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load entitlements' });
        this.loading = false;
      }
    });
  }

  loadAssignments() {
    this.assignmentsLoading = true;
    this.governanceServices.getEntitlementAssignments().subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.assignments = data?.data || (Array.isArray(res.data) ? res.data : []);
        this.stats.totalAssignments = this.assignments.length;
        this.assignmentsLoading = false;
      },
      error: () => {
        this.assignmentsLoading = false;
      }
    });
  }

  updateStats() {
    this.stats.total = this.totalRecords;
    this.stats.active = this.entitlements.filter(e => e.is_enabled !== false).length;
    this.stats.features = this.entitlements.filter(e => e.category === 'feature').length;
    this.stats.limits = this.entitlements.filter(e => e.category === 'limit').length;
  }

  createEntitlement() {
    this.entitlement = { 
        is_enabled: true,
        category: 'feature',
        tier: 'free',
        telnet: this.currentUser?.identify,
        metadata: {}
    };
    this.editMode = false;
    this.showDialog = true;
  }

  editEntitlement(e: Entitlement) {
    this.entitlement = { ...e, metadata: e.metadata || {} };
    this.editMode = true;
    this.showDialog = true;
  }

  assignEntitlement(ent: Entitlement) {
    this.assignment = { 
        entitlement_code: ent.code,
        entity_type: 'tenant', 
        status: 'active' 
    };
    this.showAssignDialog = true;
  }

  saveEntitlement() {
    if (!this.entitlement.code || !this.entitlement.name) return;
    
    this.saving = true;
    const saveObs = this.editMode ? 
      this.governanceServices.updateEntitlement(this.entitlement.code, this.entitlement) :
      this.governanceServices.createEntitlement(this.entitlement);

    saveObs.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Entitlement ${this.editMode ? 'updated' : 'created'}` });
        this.showDialog = false;
        this.saving = false;
        this.loadEntitlements();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
        this.saving = false;
      }
    });
  }

  deleteEntitlement(e: Entitlement) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete entitlement "${e.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.governanceServices.deleteEntitlement(e.code).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Entitlement deleted' });
            this.loadEntitlements();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
          }
        });
      }
    });
  }

  openAssign() {
    this.assignment = { entity_type: 'tenant', status: 'active' };
    this.showAssignDialog = true;
  }

  saveAssignment() {
    if (!this.assignment.entitlement_code || !this.assignment.entity_id) return;
    
    this.assigning = true;
    this.governanceServices.assignEntitlement(this.assignment).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: 'Entitlement assigned successfully' });
        this.showAssignDialog = false;
        this.assigning = false;
        this.loadAssignments();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Assignment failed' });
        this.assigning = false;
      }
    });
  }

  deleteAssignment(id: string) {
    this.confirmationService.confirm({
      message: 'Remove this assignment?',
      header: 'Confirm Remove',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.governanceServices.deleteEntitlementAssignment(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Assignment removed' });
            this.loadAssignments();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Removal failed' });
          }
        });
      }
    });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadEntitlements();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadEntitlements();
  }

  applyFilters() {
    this.loadEntitlements();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = null;
    this.selectedStatus = null;
    this.loadEntitlements();
  }

  refreshData() {
    this.loadEntitlements();
    this.messageService.add({ severity: 'info', summary: 'Refreshed', detail: 'Entitlements synchronized' });
  }

  exportData() {
    this.messageService.add({ severity: 'info', summary: 'Export', detail: 'Exporting entitlements...' });
  }

  setViewMode(mode: 'list' | 'card') {
    this.viewMode = mode;
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadEntitlements();
  }

  getStatusSeverity(status?: string) {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'secondary';
    }
  }
}
