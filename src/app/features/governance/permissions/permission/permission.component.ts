import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-permission',
  imports: [
    CommonModule,
    FormsModule,
    Dialog,
    FloatLabel,
    InputText,
    Textarea,
    Button,
    Tag,
    TableModule,
    TooltipModule,
    DividerModule,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './permission.component.html',
})
export class PermissionComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  permission: any = {};
  title = 'Create Permission';
  visible = false;
  loading = false;
  isEditMode = false;
  isViewMode = false;

  // Action options
  actionOptions = [
    { label: 'Access', value: 'access' },
    { label: 'Create', value: 'create' },
    { label: 'Read', value: 'read' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
    { label: 'Manage', value: 'manage' },
    { label: 'All (*)', value: '*' }
  ];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices,
    public messageService: MessageService
  ) {
    super(injector);
  }

  save() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    const permissionId = this.permission.kid || this.permission._id || this.permission.id;
    const saveObservable = permissionId ?
      this.governanceServices.updatePermission(permissionId, this.permission) :
      this.governanceServices.createPermission(this.permission);

    saveObservable.subscribe({
      next: (res) => {
        if (!res) {
          return;
        }
        this.showSuccess(permissionId ? 'Updated successfully' : 'Created successfully');
        this.visible = false;
        this.permission = {};
        this.loading = false;
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error saving permission:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${permissionId ? 'update' : 'create'} permission`
        });
        this.loading = false;
      }
    });
  }

  show(id?) {
    this.visible = true;
    this.permission = {};
    this.isEditMode = false;
    this.isViewMode = false;

    if (id) {
      this.title = 'Edit Permission';
      this.isEditMode = true;
      this.loadPermission(id);
    } else {
      this.title = 'Create Permission';
    }
  }

  // View permission in read-only mode
  view(permission: any) {
    this.visible = true;
    this.isViewMode = true;
    this.isEditMode = true; // Keep edit mode true to load data
    this.title = 'Permission Details';
    const id = permission.kid || permission._id || permission.id;
    this.loadPermission(id);
  }

  // Edit permission
  edit(permission: any) {
    this.visible = true;
    this.isEditMode = true;
    this.isViewMode = false;
    this.title = 'Edit Permission';
    const id = permission.kid || permission._id || permission.id;
    this.loadPermission(id);
  }

  // Load permission details
  loadPermission(id: string) {
    this.loading = true;
    console.log('Loading permission with ID:', id);
    this.governanceServices.getPermission(id).subscribe({
      next: (res) => {
        console.log('Permission API response:', res);
        if (!res) {
          console.warn('Empty response from API');
          return;
        }
        // Handle different response formats
        if (res.data) {
          console.log('Using res.data:', res.data);
          this.permission = res.data;
          // Normalize assets: prefer assets_with_names (rich objects), fall back to assets (strings)
          try {
            if (Array.isArray(this.permission.assets_with_names) && this.permission.assets_with_names.length) {
              // Use assets_with_names directly but ensure fields expected by the template exist
              this.permission.assets = this.permission.assets_with_names.map((a: any) => ({
                kid: a.kid || null,
                name: a.name || a.kid || 'N/A',
                type: a.type || '',
                location: a.location || '',
                sensitivity: a.sensitivity || '',
                source: a.source || '',
                status: a.status || ''
              }));
            } else if (Array.isArray(this.permission.assets) && this.permission.assets.length && typeof this.permission.assets[0] === 'string') {
              // Map simple string list to objects for the table
              this.permission.assets = this.permission.assets.map((kid: string) => ({
                kid,
                name: kid,
                type: '',
                location: '',
                sensitivity: '',
                source: '',
                status: ''
              }));
            } else if (!Array.isArray(this.permission.assets)) {
              this.permission.assets = [];
            }
          } catch (err) {
            console.warn('Failed to normalize permission assets:', err);
            this.permission.assets = this.permission.assets || [];
          }
          // Update which optional columns should be shown in the template
          this.updateAssetColumnVisibility();
        } else {
          console.log('Using res directly:', res);
          this.permission = res;
        }
        console.log('Final permission object:', this.permission);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading permission:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load permission details'
        });
        this.loading = false;
        this.visible = false;
      }
    });
  }

  // Delete permission with confirmation
  delete() {
    const permissionId = this.permission.kid || this.permission._id || this.permission.id;
    if (!permissionId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Permission ID not found'
      });
      return;
    }

    this.confirmOnDelete(
      new Event('click'),
      this.governanceServices.deletePermission(permissionId),
      () => {
        this.onSave.emit();
        this.visible = false;
      }
    );
  }

  // Switch from view mode to edit mode
  switchToEditMode() {
    this.isViewMode = false;
    this.title = 'Edit Permission';
  }

  // Validate form
  validateForm(): boolean {
    if (!this.permission.code?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Permission code is required'
      });
      return false;
    }

    if (!this.permission.name?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Permission name is required'
      });
      return false;
    }

    return true;
  }

  // Get action severity
  getActionSeverity(action: string): string {
    switch (action?.toLowerCase()) {
      case 'access': return 'info';
      case 'read': return 'info';
      case 'write': return 'success';
      case 'update': return 'success';
      case 'delete': return 'danger';
      case 'manage': return 'warning';
      case 'create': return 'success';
      case '*': return 'danger';
      default: return 'secondary';
    }
  }

  // Get asset type severity
  getAssetTypeSeverity(type: string): string {
    switch (type?.toLowerCase()) {
      case 'route': return 'info';
      case 'api': return 'success';
      case 'resource': return 'warning';
      case 'data': return 'primary';
      default: return 'secondary';
    }
  }

  // Columns visibility flags for assets table
  showLocationColumn = false;
  showSensitivityColumn = false;
  showSourceColumn = false;
  showStatusColumn = false;

  // Update visibility of optional asset columns based on actual asset data
  private updateAssetColumnVisibility() {
    try {
      const assets = Array.isArray(this.permission?.assets) ? this.permission.assets : [];
      this.showLocationColumn = assets.some((a: any) => !!(a && a.location));
      this.showSensitivityColumn = assets.some((a: any) => !!(a && a.sensitivity));
      this.showSourceColumn = assets.some((a: any) => !!(a && a.source));
      this.showStatusColumn = assets.some((a: any) => !!(a && a.status));
    } catch (err) {
      this.showLocationColumn = false;
      this.showSensitivityColumn = false;
      this.showSourceColumn = false;
      this.showStatusColumn = false;
    }
  }

  // Get sensitivity severity
  getSensitivitySeverity(sensitivity: string): string {
    switch (sensitivity?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  }

  // Get status severity
  getStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'disabled': return 'danger';
      default: return 'secondary';
    }
  }

  // Copy to clipboard
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Text copied to clipboard'
      });
    });
  }
}
