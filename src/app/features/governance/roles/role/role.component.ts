import { Component, EventEmitter, Injector, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';

@Component({
  selector: 'app-role',
  imports: [
    CommonModule,
    Button,
    Dialog,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule,
    DropdownModule,
    CheckboxModule,
    ChipModule
  ],
  templateUrl: './role.component.html',
})
export class RoleComponent extends AppBaseComponent {
  @Input() role: any = null;
  @Output() saveRole = new EventEmitter<void>();
  @Output() cancelRole = new EventEmitter<void>();

  title = 'Create Role';
  visible = false;

  // Dropdown options
  typeOptions = [
    { label: 'System', value: 'system' },
    { label: 'Standard', value: 'standard' },
    { label: 'Custom', value: 'custom' }
  ];

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

  riskOptions = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' }
  ];

  inheritanceOptions = [
    { label: 'Data User', value: 'Data User' },
    { label: 'Data Analyst', value: 'Data Analyst' },
    { label: 'Data Steward', value: 'Data Steward' }
  ];

  // Permission categories and definitions
  permissionCategories = [
    {
      name: 'Data Access',
      description: 'Permissions for reading and accessing data',
      icon: 'pi pi-database',
      permissions: [
        { label: 'Read Public Data', value: 'data_read_public' },
        { label: 'Read Team Data', value: 'data_read_team' },
        { label: 'Read Department Data', value: 'data_read_dept' },
        { label: 'Read All Data', value: 'data_read_all' },
        { label: 'Write Staging Data', value: 'data_write_staging' },
        { label: 'Write Department Data', value: 'data_write_dept' },
        { label: 'Write All Data', value: 'data_write_all' },
        { label: 'Delete Data', value: 'data_delete' },
        { label: 'Export Limited', value: 'export_limited' },
        { label: 'Export Full', value: 'export_full' }
      ]
    },
    {
      name: 'Analytics & Reporting',
      description: 'Permissions for creating reports and analytics',
      icon: 'pi pi-chart-line',
      permissions: [
        { label: 'View Reports', value: 'report_view' },
        { label: 'Create Reports', value: 'report_create' },
        { label: 'Schedule Reports', value: 'report_schedule' },
        { label: 'View Dashboards', value: 'dashboard_view' },
        { label: 'Create Dashboards', value: 'dashboard_create' },
        { label: 'Advanced Dashboards', value: 'dashboard_advanced' },
        { label: 'Execute Queries', value: 'query_execute' },
        { label: 'Create Visualizations', value: 'visualization_create' }
      ]
    },
    {
      name: 'Data Management',
      description: 'Permissions for managing data assets and metadata',
      icon: 'pi pi-cog',
      permissions: [
        { label: 'Browse Catalog', value: 'catalog_browse' },
        { label: 'View Catalog', value: 'catalog_view' },
        { label: 'Manage Catalog', value: 'catalog_manage' },
        { label: 'Manage Metadata', value: 'metadata_manage' },
        { label: 'Quality Checks', value: 'quality_check' },
        { label: 'View Lineage', value: 'lineage_view' },
        { label: 'Modify Schema', value: 'schema_modify' },
        { label: 'Data Classification', value: 'data_classification' }
      ]
    },
    {
      name: 'Pipeline & Infrastructure',
      description: 'Permissions for data engineering and pipelines',
      icon: 'pi pi-sitemap',
      permissions: [
        { label: 'Create Pipelines', value: 'pipeline_create' },
        { label: 'Manage Pipelines', value: 'pipeline_manage' },
        { label: 'Schedule Jobs', value: 'job_schedule' },
        { label: 'Manage Connections', value: 'connection_manage' },
        { label: 'Compute Resources', value: 'compute_resources' }
      ]
    },
    {
      name: 'Machine Learning',
      description: 'Permissions for ML and data science activities',
      icon: 'pi pi-microsoft',
      permissions: [
        { label: 'Create ML Models', value: 'ml_create' },
        { label: 'Train Models', value: 'ml_train' },
        { label: 'Deploy Models', value: 'model_deploy' },
        { label: 'Manage Experiments', value: 'experiment_manage' },
        { label: 'Feature Store', value: 'feature_store' }
      ]
    },
    {
      name: 'Business Intelligence',
      description: 'Permissions for BI tools and advanced analytics',
      icon: 'pi pi-chart-bar',
      permissions: [
        { label: 'Create BI Content', value: 'bi_create' },
        { label: 'Manage BI Content', value: 'bi_manage' }
      ]
    },
    {
      name: 'Governance & Compliance',
      description: 'Permissions for governance, policies, and compliance',
      icon: 'pi pi-shield',
      permissions: [
        { label: 'View Policies', value: 'policy_view' },
        { label: 'Manage Policies', value: 'policy_management' },
        { label: 'Enforce Policies', value: 'policy_enforce' },
        { label: 'Manage Compliance', value: 'compliance_manage' },
        { label: 'Manage Privacy', value: 'privacy_manage' },
        { label: 'View All Audits', value: 'audit_view_all' },
        { label: 'Review Access', value: 'access_review' },
        { label: 'Manage Incidents', value: 'incident_manage' }
      ]
    },
    {
      name: 'Administration',
      description: 'Permissions for system and user administration',
      icon: 'pi pi-users',
      permissions: [
        { label: 'User Management', value: 'user_management' },
        { label: 'Role Management', value: 'role_management' },
        { label: 'Governance Configuration', value: 'governance_config' }
      ]
    }
  ];

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    // Ensure permissions array exists
    if (!this.role.permissions) {
      this.role.permissions = [];
    }

    const saveObservable = this.role._id ?
      this.governanceServices.updateRole(this.role._id, this.role) :
      this.governanceServices.createRole(this.role);

    // Mock implementation - replace with actual service call
    setTimeout(() => {
      this.showSuccess(this.role._id ? 'Role updated successfully' : 'Role created successfully');
      this.visible = false;
      this.role = { permissions: [] };
      this.saveRole.emit();
    }, 500);

    // Uncomment for actual API call:
    // saveObservable.subscribe(res => {
    //   if (!res) {
    //     return;
    //   }
    //   this.showSuccess(this.role._id ? 'Updated successfully' : 'Created successfully');
    //   this.visible = false;
    //   this.role = { permissions: [] };
    //   this.onSave.emit();
    // });
  }

  show(id?) {
    this.visible = true;
    this.role = { permissions: [] };

    if (id) {
      this.title = 'Edit Role';
      // Mock implementation - replace with actual service call
      setTimeout(() => {
        // Find mock role data
        const mockRole = {
          _id: id,
          name: 'Sample Role',
          description: 'Sample role description',
          type: 'custom',
          level: 'standard',
          scope: 'team',
          risk_level: 'Medium',
          permissions: ['data_read_team', 'report_view', 'dashboard_view'],
          inherits_from: 'Data User'
        };
        this.role = { ...mockRole };
      }, 200);

      // Uncomment for actual API call:
      // this.governanceServices.getRole(id).subscribe(res => {
      //   if (!res) {
      //     return;
      //   }
      //   this.role = res.data;
      // });
    } else {
      this.title = 'Create Role';
      this.role = {
        permissions: [],
        type: 'custom',
        level: 'standard',
        scope: 'team',
        risk_level: 'Medium'
      };
    }
  }

  // Permission management methods
  isPermissionSelected(permission: string): boolean {
    return this.role.permissions && this.role.permissions.includes(permission);
  }

  togglePermission(permission: string, selected: boolean): void {
    if (!this.role.permissions) {
      this.role.permissions = [];
    }

    if (selected) {
      if (!this.role.permissions.includes(permission)) {
        this.role.permissions.push(permission);
      }
    } else {
      this.role.permissions = this.role.permissions.filter(p => p !== permission);
    }
  }

  isCategorySelected(category: any): boolean {
    if (!this.role.permissions || !category.permissions) {
      return false;
    }
    return category.permissions.every(p => this.role.permissions.includes(p.value));
  }

  toggleCategory(category: any, selected: boolean): void {
    if (!this.role.permissions) {
      this.role.permissions = [];
    }

    category.permissions.forEach(permission => {
      this.togglePermission(permission.value, selected);
    });
  }

  selectAllPermissions(): void {
    this.role.permissions = [];
    this.permissionCategories.forEach(category => {
      category.permissions.forEach(permission => {
        if (!this.role.permissions.includes(permission.value)) {
          this.role.permissions.push(permission.value);
        }
      });
    });
  }

  clearAllPermissions(): void {
    this.role.permissions = [];
  }

  getSelectedPermissionsCount(): number {
    return this.role.permissions ? this.role.permissions.length : 0;
  }

  isFormValid(): boolean {
    return !!(this.role.name && this.role.name.trim().length > 0);
  }

  removeUser(user: string): void {
    if (this.role.users) {
      this.role.users = this.role.users.filter(u => u !== user);
    }
  }
}
