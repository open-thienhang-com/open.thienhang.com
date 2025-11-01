import { Component, EventEmitter, Injector, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';

@Component({
  selector: 'app-role',
  imports: [
    CommonModule,
    Button,
    Dialog,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule,
    DropdownModule,
    CheckboxModule,
    ChipModule,
    TableModule,
    PaginatorModule,
    TooltipModule
  ],
  templateUrl: './role.component.html',
})
export class RoleComponent extends AppBaseComponent {
  /** When true the component renders inline (page) instead of inside a p-dialog */
  @Input() inline: boolean = false;
  @Input() role: any = null;
  @Output() saveRole = new EventEmitter<void>();
  @Output() cancelRole = new EventEmitter<void>();

  title = 'Create Role';
  visible = false;

  // Dropdown options
  typeOptions = [
    { label: 'System', value: 'system' },
    { label: 'Business', value: 'business' },
    { label: 'Governance', value: 'governance' }
  ];

  // Permission categories and definitions (kept for potential future use)
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

  // Permission matrix structure
  permissionMatrix: { resource: string; permissions: any[] }[] = [];
  allResources: string[] = [];
  allActions: string[] = [];

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  ngOnInit(): void {
    // Ensure role is initialized for inline rendering (no dialog/show call)
    if (!this.role) {
      this.role = this.getDefaultRole();
    }

    // Load initial permissions for inline/page view
    this.loadPermissions('', 0, 1000); // Load more for matrix view
  }

  private getDefaultRole() {
    return {
      name: '',
      description: '',
      permissions: [],
      type: 'system',
      contact: []
    };
  }

  // Permissions fetched from API
  permissions: any[] = [];
  permTotal = 0;
  permPageSize = 1000; // Load all for matrix view
  permOffset = 0;
  permSearch = '';
  permLoading = false;
  saving = false;
  private permSearchTimeout: any = null;

  // Load permissions list from API and build matrix
  loadPermissions(search: string = '', offset: number = 0, size: number = 1000) {
    this.permLoading = true;
    this.permSearch = search;
    this.permOffset = offset;
    this.permPageSize = size;

    const params: any = { size, offset };
    if (search && search.trim()) params.search = search.trim();

    this.governanceServices.getPermissions(params).subscribe({
      next: (res) => {
        if (!res) {
          this.permissions = [];
          this.permTotal = 0;
          this.permLoading = false;
          return;
        }
        // res.data expected to be an array of permission objects
        this.permissions = Array.isArray(res.data) ? res.data : [];
        this.permTotal = (res as any).total || (this.permissions.length || 0);
        this.buildPermissionMatrix();
        this.permLoading = false;
      },
      error: (err) => {
        console.error('Failed to load permissions', err);
        this.permissions = [];
        this.permTotal = 0;
        this.permLoading = false;
      }
    });
  }

  // Build matrix structure from permissions
  private buildPermissionMatrix(): void {
    // Group permissions by resource
    const grouped = new Map<string, any[]>();
    const actions = new Set<string>();

    this.permissions.forEach(perm => {
      const resource = perm.resource || 'Other';
      const action = perm.action || 'execute';

      actions.add(action);

      if (!grouped.has(resource)) {
        grouped.set(resource, []);
      }
      grouped.get(resource)!.push(perm);
    });

    // Convert to array and sort
    this.permissionMatrix = Array.from(grouped.entries())
      .map(([resource, permissions]) => ({ resource, permissions }))
      .sort((a, b) => a.resource.localeCompare(b.resource));

    this.allActions = Array.from(actions).sort();
    this.allResources = Array.from(grouped.keys()).sort();
  }

  // Get permission by resource and action for matrix display
  getPermissionByResourceAction(resource: string, action: string): any {
    return this.permissions.find(p => p.resource === resource && p.action === action);
  }

  // Check if a specific resource+action permission is selected
  isMatrixPermissionSelected(resource: string, action: string): boolean {
    const perm = this.getPermissionByResourceAction(resource, action);
    if (!perm) return false;
    const id = perm.kid || perm.code;
    return this.role.permissions && this.role.permissions.includes(id);
  }

  // Toggle a specific resource+action permission
  toggleMatrixPermission(resource: string, action: string, selected: boolean): void {
    const perm = this.getPermissionByResourceAction(resource, action);
    if (!perm) return;

    const id = perm.kid || perm.code;
    this.togglePermission(id, selected);
  }

  onPermSearch(term: string) {
    // debounce
    if (this.permSearchTimeout) clearTimeout(this.permSearchTimeout);
    this.permSearchTimeout = setTimeout(() => {
      this.loadPermissions(term, 0, this.permPageSize);
    }, 300);
  }

  onPermPage(event: any) {
    // event.first (offset), event.rows (page size)
    const offset = event.first || 0;
    const size = event.rows || this.permPageSize;
    this.loadPermissions(this.permSearch, offset, size);
  }

  save() {
    // Ensure permissions array exists
    if (!this.role.permissions) {
      this.role.permissions = [];
    }

    // Ensure permissions stored are permission 'kid' values (preferred)
    this.role.permissions = (this.role.permissions || []).map(p => {
      if (!p) return p;
      if (typeof p === 'string') return p; // already a string id
      return p.kid || p.code || p;
    });

    // Generate a role.kid based on name if not present
    if (!this.role.kid && this.role.name) {
      this.role.kid = this.generateKidFromName(this.role.name);
    }

    // Ensure contact array exists
    if (!this.role.contact) {
      this.role.contact = [];
    }

    const payload = {
      name: this.role.name,
      description: this.role.description || '',
      type: this.role.type,
      permissions: this.role.permissions,
      kid: this.role.kid,
      contact: this.role.contact
    };

    const saveObservable = this.role._id ?
      this.governanceServices.updateRole(this.role._id, payload) :
      this.governanceServices.createRole(payload);
    // Call real API
    this.saving = true;
    saveObservable.subscribe({
      next: (res) => {
        this.saving = false;
        if (!res || !res.success) {
          this.showError(res && (res as any).message ? (res as any).message : 'Failed to save role');
          return;
        }
        this.showSuccess(this.role._id ? 'Role updated successfully' : 'Role created successfully');
        // hide dialog only when not inline
        if (!this.inline) {
          this.visible = false;
        }
        this.role = this.getDefaultRole();
        this.saveRole.emit();
      },
      error: (err) => {
        this.saving = false;
        console.error('Failed to save role', err);
        this.showError('Failed to save role');
      }
    });
  }

  private generateKidFromName(name: string): string {
    const slug = (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
    const suffix = Date.now().toString(36).slice(-6);
    return `${slug}-${suffix}`;
  }

  show(id?) {
    this.visible = true;

    // Initialize with default fields to prevent null reference errors
    if (id) {
      this.title = 'Edit Role';
      // Set default first to prevent template errors during loading
      this.role = { ...this.getDefaultRole() };

      // Load the role from API
      this.governanceServices.getRoleDetail(id).subscribe({
        next: (res) => {
          if (!res || !res.data) {
            return;
          }
          const rd: any = res.data;
          // Map detailed permission objects to codes if needed
          const perms = Array.isArray(rd.permissions) ? rd.permissions.map((p: any) => p.kid || p.code || p) : [];
          this.role = {
            ...rd,
            permissions: perms
          };
        },
        error: (err) => {
          console.error('Failed to load role detail', err);
          this.showError('Failed to load role data');
        }
      });

      // Load permissions for edit view
      this.loadPermissions('', 0, this.permPageSize);
    } else {
      this.title = 'Create Role';
      this.role = { ...this.getDefaultRole() };
      // Load permissions when creating a new role
      this.loadPermissions('', 0, this.permPageSize);
    }
  }

  onCancelClick() {
    // If inline (page), emit cancel so the parent can navigate away.
    if (this.inline) {
      this.cancelRole.emit();
    } else {
      // hide dialog only
      this.visible = false;
      this.cancelRole.emit();
    }
  }

  onDialogHide() {
    // Dialog was closed by the user
    this.cancelRole.emit();
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
    // Select all currently loaded permissions (use kid if available)
    this.role.permissions = (this.permissions || []).map(p => p.kid || p.code || p);
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
