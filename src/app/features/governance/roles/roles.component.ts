import {Component, Injector, OnInit} from '@angular/core';
import {RoleComponent} from '../roles/role/role.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {DataTableComponent} from "../../../shared/component/data-table/data-table.component";
import {DataTableFilterComponent} from '../../../shared/component/data-table-filter/data-table-filter.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-roles',
  imports: [
    RoleComponent,
    Button,
    TableModule,
    DropdownModule,
    InputTextModule,
    CardModule,
    BadgeModule,
    TagModule,
    ChipModule,
    MenuModule,
    TooltipModule,
    DialogModule,
    InputSwitchModule,
    MultiSelectModule,
    OverlayPanelModule
  ],
  templateUrl: './roles.component.html',
})
export class RolesComponent extends AppBaseComponent implements OnInit {
  roles: any;
  
  // Stats
  stats = {
    totalRoles: 0,
    activeRoles: 0,
    customRoles: 0,
    systemRoles: 0
  };

  // Filter options
  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  typeOptions = [
    { label: 'All Types', value: null },
    { label: 'System', value: 'system' },
    { label: 'Custom', value: 'custom' }
  ];

  departmentOptions = [
    { label: 'All Departments', value: null },
    { label: 'IT', value: 'it' },
    { label: 'HR', value: 'hr' },
    { label: 'Finance', value: 'finance' },
    { label: 'Operations', value: 'operations' }
  ];

  // Current filters
  searchTerm = '';
  selectedStatus = null;
  selectedType = null;
  selectedDepartment = null;

  // UI state
  showCreateDialog = false;
  showFilters = false;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getRoles();
    this.loadStats();
  }

  getRoles = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getRoles({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.roles = res;
      this.isTableLoading = false;
    })
  }

  loadStats() {
    // Mock stats - replace with actual API call
    this.stats = {
      totalRoles: 24,
      activeRoles: 18,
      customRoles: 12,
      systemRoles: 12
    };
  }

  onDeleteRole(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteRole(id), this.getRoles);
  }

  // Filter methods
  applyFilters() {
    // Implement filter logic
    this.getRoles();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedType = null;
    this.selectedDepartment = null;
    this.getRoles();
  }

  // Utility methods
  getRoleTypeSeverity(type: string): string {
    switch (type) {
      case 'system': return 'info';
      case 'custom': return 'success';
      default: return 'secondary';
    }
  }

  getRoleStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'warning';
    }
  }

  getPermissionCount(role: any): number {
    return role?.permissions?.length || 0;
  }

  getUserCount(role: any): number {
    return role?.userCount || 0;
  }

  toggleCreateDialog() {
    this.showCreateDialog = !this.showCreateDialog;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}

