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
    // Mock data for roles - replace with actual service call
    const mockRoles = [
      {
        _id: '1',
        name: 'Data Administrator',
        description: 'Full administrative access to all data governance features and platform management',
        type: 'system',
        level: 'admin',
        scope: 'global',
        risk_level: 'High',
        permissions: [
          'data_read_all', 'data_write_all', 'data_delete', 'user_management',
          'role_management', 'policy_management', 'governance_config'
        ],
        users: ['admin@company.com', 'data-lead@company.com'],
        inherits_from: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        _id: '2',
        name: 'Data Steward',
        description: 'Manages data quality, metadata, and ensures compliance with data governance policies',
        type: 'standard',
        level: 'advanced',
        scope: 'department',
        risk_level: 'Medium',
        permissions: [
          'data_read_dept', 'data_write_dept', 'metadata_manage', 'quality_check',
          'policy_view', 'lineage_view', 'catalog_manage'
        ],
        users: ['steward1@company.com', 'steward2@company.com', 'data-analyst@company.com'],
        inherits_from: 'Data User',
        created_at: '2024-01-16T09:00:00Z',
        updated_at: '2024-01-22T11:15:00Z'
      },
      {
        _id: '3',
        name: 'Data Analyst',
        description: 'Analyzes data and creates reports with read access to approved datasets',
        type: 'standard',
        level: 'standard',
        scope: 'team',
        risk_level: 'Low',
        permissions: [
          'data_read_team', 'report_create', 'dashboard_create', 'query_execute',
          'export_limited', 'catalog_view'
        ],
        users: [
          'analyst1@company.com', 'analyst2@company.com', 'analyst3@company.com',
          'business-analyst@company.com', 'market-research@company.com'
        ],
        inherits_from: 'Data User',
        created_at: '2024-01-17T08:30:00Z',
        updated_at: '2024-01-21T16:45:00Z'
      },
      {
        _id: '4',
        name: 'Data Engineer',
        description: 'Builds and maintains data pipelines, ETL processes, and data infrastructure',
        type: 'custom',
        level: 'advanced',
        scope: 'project',
        risk_level: 'Medium',
        permissions: [
          'pipeline_create', 'pipeline_manage', 'data_read_all', 'data_write_staging',
          'schema_modify', 'connection_manage', 'job_schedule'
        ],
        users: ['engineer1@company.com', 'engineer2@company.com', 'devops@company.com'],
        inherits_from: 'Data User',
        created_at: '2024-01-18T07:00:00Z',
        updated_at: '2024-01-23T13:20:00Z'
      },
      {
        _id: '5',
        name: 'Data User',
        description: 'Basic read access to public datasets and self-service analytics',
        type: 'standard',
        level: 'basic',
        scope: 'team',
        risk_level: 'Low',
        permissions: [
          'data_read_public', 'report_view', 'dashboard_view', 'catalog_browse'
        ],
        users: [
          'user1@company.com', 'user2@company.com', 'user3@company.com', 'user4@company.com',
          'marketing@company.com', 'sales@company.com', 'support@company.com'
        ],
        inherits_from: null,
        created_at: '2024-01-19T12:00:00Z',
        updated_at: '2024-01-19T12:00:00Z'
      },
      {
        _id: '6',
        name: 'Compliance Officer',
        description: 'Monitors data usage compliance and manages privacy-related policies',
        type: 'custom',
        level: 'advanced',
        scope: 'global',
        risk_level: 'High',
        permissions: [
          'audit_view_all', 'compliance_manage', 'privacy_manage', 'policy_enforce',
          'data_classification', 'access_review', 'incident_manage'
        ],
        users: ['compliance@company.com', 'privacy-officer@company.com'],
        inherits_from: 'Data User',
        created_at: '2024-01-20T10:30:00Z',
        updated_at: '2024-01-24T09:15:00Z'
      },
      {
        _id: '7',
        name: 'Business Intelligence Developer',
        description: 'Creates and maintains BI reports, dashboards, and data visualizations',
        type: 'custom',
        level: 'standard',
        scope: 'department',
        risk_level: 'Low',
        permissions: [
          'bi_create', 'bi_manage', 'data_read_dept', 'dashboard_advanced',
          'report_schedule', 'visualization_create'
        ],
        users: ['bi-dev1@company.com', 'bi-dev2@company.com'],
        inherits_from: 'Data Analyst',
        created_at: '2024-01-21T14:00:00Z',
        updated_at: '2024-01-25T10:45:00Z'
      },
      {
        _id: '8',
        name: 'Data Scientist',
        description: 'Advanced analytics, machine learning, and statistical modeling capabilities',
        type: 'custom',
        level: 'advanced',
        scope: 'project',
        risk_level: 'Medium',
        permissions: [
          'ml_create', 'ml_train', 'data_read_all', 'compute_resources',
          'model_deploy', 'experiment_manage', 'feature_store'
        ],
        users: ['scientist1@company.com', 'ml-engineer@company.com', 'researcher@company.com'],
        inherits_from: 'Data Analyst',
        created_at: '2024-01-22T11:30:00Z',
        updated_at: '2024-01-26T15:20:00Z'
      }
    ];

    // Simulate API response
    setTimeout(() => {
      this.roles = mockRoles;
      this.totalRecords = mockRoles.length;
      this.filteredRoles = [...this.roles];
      this.filterRoles();
      this.loadStats();
    }, 500);

    // Uncomment for actual API call:
    // this.governanceServices.getRoles({ offset: this.currentPage, size: this.itemsPerPage }).subscribe(res => {
    //   if (res) {
    //     this.roles = res.data || [];
    //     this.totalRecords = res.total || 0;
    //     this.filteredRoles = [...this.roles];
    //     this.filterRoles();
    //   }
    // });
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

