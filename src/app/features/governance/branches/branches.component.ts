import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GovernanceServices, Branch } from '../../../core/services/governance.services';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, TableModule, TagModule, InputTextModule,
    ToastModule, PaginatorModule, TooltipModule, CardModule,
    SkeletonModule, ConfirmDialogModule
  ],
  templateUrl: './branches.component.html',
  providers: [MessageService, ConfirmationService]
})
export class BranchesComponent implements OnInit {
  branches: Branch[] = [];
  loading = false;
  
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
    { label: 'Office', value: 'office' },
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Retail Store', value: 'retail_store' },
    { label: 'Distribution Center', value: 'distribution_center' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  stats = { 
    total: 0, 
    active: 0, 
    offices: 0,
    warehouses: 0
  };

  constructor(
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading = true;
    this.governanceServices.getBranches({ 
      limit: this.pageSize, 
      offset: this.currentPage * this.pageSize,
      q: this.searchTerm
    }).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        if (data?.data) {
          this.branches = data.data;
          this.totalRecords = data.pagination?.total ?? data.data.length;
        } else {
          this.branches = res.data as any;
          this.totalRecords = this.branches.length;
        }
        this.updateStats();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches' });
        this.loading = false;
      }
    });
  }

  updateStats() {
    this.stats.total = this.totalRecords;
    this.stats.active = this.branches.filter(b => b.is_active !== false).length;
    this.stats.offices = this.branches.filter(b => b.branch_type === 'office').length;
    this.stats.warehouses = this.branches.filter(b => b.branch_type === 'warehouse').length;
  }

  onSearch() {
    this.currentPage = 0;
    this.loadBranches();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadBranches();
  }

  applyFilters() {
    this.loadBranches();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = null;
    this.selectedStatus = null;
    this.loadBranches();
  }

  refreshData() {
    this.loadBranches();
    this.messageService.add({ severity: 'info', summary: 'Refreshed', detail: 'Branch data synchronized' });
  }

  exportData() {
    this.messageService.add({ severity: 'info', summary: 'Export', detail: 'Exporting branch data...' });
  }

  setViewMode(mode: 'list' | 'card') {
    this.viewMode = mode;
  }

  viewDetail(b: Branch) {
    this.router.navigate(['/governance/branches', b.code]);
  }

  createNew() {
    this.router.navigate(['/governance/branches/new']);
  }

  deleteBranch(b: Branch) {
    this.confirmationService.confirm({
      message: `Delete branch "${b.name}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.governanceServices.deleteBranch(b.code).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Branch removed' });
            this.loadBranches();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
          }
        });
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadBranches();
  }

  getStatusSeverity(branch: Branch) {
    return branch.is_active !== false ? 'success' : 'danger';
  }
}
