import { Component, Injector, OnInit } from '@angular/core';
import { UserComponent } from './user/user.component';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TitleComponent } from '../../../shared/component/title/title.component';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { GovernanceServices } from '../../../core/services/governance.services';
import { DataTableComponent } from "../../../shared/component/data-table/data-table.component";
import { DataTableFilterComponent } from '../../../shared/component/data-table-filter/data-table-filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    FormsModule,
    UserComponent,
    Button,
    TableModule,
    InputTextModule,
    DropdownModule,
    BadgeModule,
    PaginatorModule,
    TooltipModule
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent extends AppBaseComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];

  // Stats
  totalUsers: number = 0;
  activeUsers: number = 0;
  pendingUsers: number = 0;
  adminUsers: number = 0;

  // Filters
  searchTerm: string = '';
  selectedStatus: any = null;
  selectedRole: any = null;
  selectedTeam: any = null;

  // Options for dropdowns
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' }
  ];

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'User', value: 'user' },
    { label: 'Viewer', value: 'viewer' }
  ];

  teamOptions: any[] = [];

  // Pagination
  totalRecords: number = 0;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getUsers();
    this.loadTeamOptions();
  }

  getUsers = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getUsers({ offset: page, size: this.tableRowsPerPage }).subscribe(res => {
      this.users = res.data || res;
      this.filteredUsers = [...this.users];
      this.totalRecords = res.total || this.users.length;
      this.calculateStats();
      this.isTableLoading = false;
    })
  }

  loadTeamOptions() {
    // Load teams for filter dropdown
    this.governanceServices.getTeams({}).subscribe(res => {
      this.teamOptions = (res.data || res).map(team => ({
        label: team.name,
        value: team._id
      }));
    });
  }

  calculateStats() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.status === 'active' || u.is_active).length;
    this.pendingUsers = this.users.filter(u => u.status === 'pending' || !u.is_verified).length;
    this.adminUsers = this.users.filter(u => u.role === 'admin').length;
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus ||
        user.status === this.selectedStatus ||
        (this.selectedStatus === 'active' && user.is_active);

      const matchesRole = !this.selectedRole || user.role === this.selectedRole;

      const matchesTeam = !this.selectedTeam ||
        (user.teams && user.teams.some(team => team === this.selectedTeam));

      return matchesSearch && matchesStatus && matchesRole && matchesTeam;
    });
  }

  refreshUsers() {
    this.getUsers();
  }

  exportUsers() {
    console.log('Exporting users...');
    // Implement export functionality
  }

  viewUser(user: any) {
    console.log('Viewing user:', user);
    // Implement user detail view
  }

  managePermissions(user: any) {
    console.log('Managing permissions for user:', user);
    // Implement permissions management
  }

  deleteUser(user: any) {
    this.confirmOnDelete(null, this.governanceServices.deleteUser(user._id), this.getUsers);
  }

  onDeleteUser(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteUser(id), this.getUsers);
  }

  onPageChange(event: any) {
    this.getUsers(event.page);
  }

  getRoleSeverity(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'user': return 'info';
      case 'viewer': return 'secondary';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      case 'suspended': return 'danger';
      default: return 'success';
    }
  }
}

