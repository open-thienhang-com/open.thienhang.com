import {Component, Injector, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {AccountComponent} from './account/account.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-accounts',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    TableModule,
    Tag,
    AccountComponent,
    InputTextModule,
    DropdownModule,
    BadgeModule,
    PaginatorModule,
    TooltipModule,
    ChipModule,
    CardModule,
    SkeletonModule,
    InputGroupModule,
    InputGroupAddonModule,
    DataViewModule,
    DividerModule,
    PanelModule
  ],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent extends AppBaseComponent implements OnInit {
  accounts: any;
  filteredAccounts: any[] = [];
  totalRecords: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  
  // View mode
  viewMode: 'list' | 'card' = 'list';
  
  // Stats
  stats = {
    totalAccounts: 0,
    activeAccounts: 0,
    pendingAccounts: 0,
    lockedAccounts: 0
  };
  
  // Filters
  showFilters: boolean = false;
  searchTerm: string = '';
  selectedStatus: any = null;
  selectedType: any = null;
  selectedDepartment: any = null;
  
  // Page size options
  pageSizeOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];
  
  // Options for dropdowns
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Locked', value: 'locked' }
  ];
  
  typeOptions = [
    { label: 'Employee', value: 'employee' },
    { label: 'Contractor', value: 'contractor' },
    { label: 'Admin', value: 'admin' },
    { label: 'Service Account', value: 'service' }
  ];
  
  departmentOptions = [
    { label: 'IT', value: 'it' },
    { label: 'Sales', value: 'sales' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'HR', value: 'hr' },
    { label: 'Finance', value: 'finance' },
    { label: 'Operations', value: 'operations' }
  ];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getAccounts();
    this.updateStats();
  }

  getAccounts = (page = 0) => {
    this.isTableLoading = true;
    this.currentPage = page;
    this.governanceServices.getAccounts({
      offset: page * this.pageSize, 
      size: this.pageSize
    }).subscribe(res => {
      this.accounts = res;
      this.filteredAccounts = res.data;
      this.totalRecords = res.total || 0;
      this.isTableLoading = false;
      this.updateStats();
    })
  }

  refreshAccounts() {
    this.getAccounts(this.currentPage);
  }

  exportAccounts() {
    // Implementation for exporting accounts
    console.log('Exporting accounts...');
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.getAccounts(0);
  }

  updateStats() {
    if (this.accounts?.data) {
      const data = this.accounts.data;
      this.stats.totalAccounts = data.length;
      this.stats.activeAccounts = data.filter((acc: any) => acc.is_active === true).length;
      this.stats.pendingAccounts = data.filter((acc: any) => acc.status === 'pending').length;
      this.stats.lockedAccounts = data.filter((acc: any) => acc.status === 'locked').length;
    }
  }

  filterAccounts() {
    if (!this.accounts?.data) return;
    
    let filtered = [...this.accounts.data];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(account => 
        (account.full_name && account.full_name.toLowerCase().includes(term)) ||
        (account.email && account.email.toLowerCase().includes(term)) ||
        (account.username && account.username.toLowerCase().includes(term))
      );
    }
    
    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(account => account.status === this.selectedStatus);
    }
    
    // Type filter
    if (this.selectedType) {
      filtered = filtered.filter(account => account.type === this.selectedType);
    }
    
    // Department filter
    if (this.selectedDepartment) {
      filtered = filtered.filter(account => account.department === this.selectedDepartment);
    }
    
    this.filteredAccounts = filtered;
  }

  applyFilters() {
    this.filterAccounts();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedType = null;
    this.selectedDepartment = null;
    this.filteredAccounts = this.accounts?.data || [];
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  viewAccount(account: any) {
    // Implementation for viewing account details
    console.log('Viewing account:', account);
  }

  manageAccess(account: any) {
    // Implementation for managing account access
    console.log('Managing access for account:', account);
  }

  onPageChange(event: any) {
    this.getAccounts(event.page);
  }

  getSeverity(status: boolean) {
    switch (status) {
      case true:
        return 'success';
      case false:
        return 'danger';
      default:
        return 'warning';
    }
  }

  onDeleteAccount(event: Event, id: string) {
    event.stopPropagation();
    this.showError('Account deletion is not supported by the API.');
  }
}
