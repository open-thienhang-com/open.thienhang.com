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
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    TooltipModule,
    ToastModule,
    ConfirmDialogModule
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

  // View mode
  viewMode: 'list' | 'card' = 'list';

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
    // Force use mock data for testing
    setTimeout(() => {
      this.users = [
        {
          _id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@company.com',
          role: 'admin',
          status: 'active',
          is_active: true,
          teams: ['team1'],
          created_at: new Date(),
          last_login: new Date()
        },
        {
          _id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@company.com',
          role: 'manager',
          status: 'active',
          is_active: true,
          teams: ['team2'],
          created_at: new Date(),
          last_login: new Date()
        },
        {
          _id: '3',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob.johnson@company.com',
          role: 'user',
          status: 'pending',
          is_active: false,
          teams: [],
          created_at: new Date(),
          last_login: null
        }
      ];
      this.filteredUsers = [...this.users];
      this.totalRecords = this.users.length;
      this.calculateStats();
      this.isTableLoading = false;
    }, 100);
  }

  loadTeamOptions() {
    // Load teams for filter dropdown
    this.governanceServices.getTeams({}).subscribe(res => {
      this.teamOptions = res.data.map(team => ({
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

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
  }

  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode = mode;
  }

  showFilters: boolean = false;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.getUsers(0);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.getUsers(0);
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

