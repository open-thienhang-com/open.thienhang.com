import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleComponent } from '../roles/role/role.component';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TitleComponent } from '../../../shared/component/title/title.component';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { GovernanceServices } from '../../../core/services/governance.services';
import { DataTableComponent } from "../../../shared/component/data-table/data-table.component";
import { DataTableFilterComponent } from '../../../shared/component/data-table-filter/data-table-filter.component';
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
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-roles',
  imports: [
    CommonModule,
    FormsModule,
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
    OverlayPanelModule,
    PaginatorModule
  ],
  templateUrl: './roles.component.html',
})
export class RolesComponent extends AppBaseComponent implements OnInit {
  roles: any[] = [];
  filteredRoles: any[] = [];

  // Stats for dashboard cards
  totalRoles: number = 0;
  adminRoles: number = 0;
  assignedUsers: number = 0;
  customRoles: number = 0;

  // Pagination
  itemsPerPage: number = 12;
  totalRecords: number = 0;
  currentPage: number = 0;

  // Filter options
  levelOptions = [
    { label: 'Basic', value: 'basic' },
    { label: 'Standard', value: 'standard' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Admin', value: 'admin' }
  ];

  scopeOptions = [
    { label: 'Global', value: 'global' },
    { label: 'Department', value: 'department' },
    { label: 'Team', value: 'team' },
    { label: 'Project', value: 'project' }
  ];

  // Current filters
  searchTerm: string = '';
  selectedLevel: any = null;
  selectedScope: any = null;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.loadRoles();
    this.loadStats();
  }

  loadRoles() {
    this.governanceServices.getRoles({ offset: this.currentPage, size: this.itemsPerPage }).subscribe(res => {
      if (res) {
        this.roles = res.data || [];
        this.totalRecords = res.total || 0;
        this.filteredRoles = [...this.roles];
        this.filterRoles();
      }
    });
  }

  loadStats() {
    // Calculate stats from roles data
    this.totalRoles = this.roles.length;
    this.adminRoles = this.roles.filter(role => role.level === 'admin').length;
    this.customRoles = this.roles.filter(role => role.type === 'custom').length;
    this.assignedUsers = this.roles.reduce((sum, role) => sum + (role.users?.length || 0), 0);
  }

  filterRoles() {
    this.filteredRoles = this.roles.filter(role => {
      const matchesSearch = !this.searchTerm ||
        role.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesLevel = !this.selectedLevel || role.level === this.selectedLevel;
      const matchesScope = !this.selectedScope || role.scope === this.selectedScope;

      return matchesSearch && matchesLevel && matchesScope;
    });

    this.totalRecords = this.filteredRoles.length;
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.itemsPerPage = event.rows;
    this.loadRoles();
  }

  refreshRoles() {
    this.loadRoles();
  }

  // Role action methods
  showRoleMatrix() {
    // Implement role matrix view
    console.log('Show role matrix');
  }

  viewRole(role: any) {
    // Implement view role details
    console.log('View role:', role);
  }

  manageAssignments(role: any) {
    // Implement manage user assignments
    console.log('Manage assignments for role:', role);
  }

  editPermissions(role: any) {
    // Implement edit permissions
    console.log('Edit permissions for role:', role);
  }

  cloneRole(role: any) {
    // Implement clone role
    console.log('Clone role:', role);
  }

  deleteRole(role: any) {
    this.confirmOnDelete(role, this.governanceServices.deleteRole(role._id), this.loadRoles);
  }

  // Utility methods for template
  getRoleIconClass(level: string): string {
    switch (level) {
      case 'admin': return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'advanced': return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'standard': return 'bg-gradient-to-br from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  }

  getRoleIcon(level: string): string {
    switch (level) {
      case 'admin': return 'pi pi-crown';
      case 'advanced': return 'pi pi-star';
      case 'standard': return 'pi pi-shield';
      default: return 'pi pi-user';
    }
  }

  getRoleTypeSeverity(type: string): string {
    switch (type) {
      case 'system': return 'info';
      case 'custom': return 'success';
      default: return 'secondary';
    }
  }

  getRiskSeverity(riskLevel: string): string {
    switch (riskLevel) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  }

  getPermissionLabel(permission: string): string {
    // Convert permission codes to readable labels
    return permission.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

