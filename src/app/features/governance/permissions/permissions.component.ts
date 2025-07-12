import { Component, Injector, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { GovernanceServices } from '../../../core/services/governance.services';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { Tag } from "primeng/tag";
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
import { TreeModule } from 'primeng/tree';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-permissions',
  imports: [
    CommonModule,
    FormsModule,
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
    TreeModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './permissions.component.html',
})
export class PermissionsComponent extends AppBaseComponent implements OnInit {
  permissions: any = { data: [], total: 0 };
  loading = false;

  // View mode
  viewMode: 'list' | 'card' = 'list';

  // Stats
  stats = {
    totalPermissions: 0,
    activePermissions: 0,
    systemPermissions: 0,
    customPermissions: 0
  };

  // Filter options
  resourceOptions = [
    { label: 'All Resources', value: null },
    { label: 'Users', value: 'users' },
    { label: 'Data Products', value: 'data-products' },
    { label: 'Governance', value: 'governance' },
    { label: 'Settings', value: 'settings' }
  ];

  actionOptions = [
    { label: 'All Actions', value: null },
    { label: 'Create', value: 'create' },
    { label: 'Read', value: 'read' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' }
  ];

  scopeOptions = [
    { label: 'All Scopes', value: null },
    { label: 'Global', value: 'global' },
    { label: 'Organization', value: 'organization' },
    { label: 'Team', value: 'team' },
    { label: 'Personal', value: 'personal' }
  ];

  // Current filters
  searchTerm = '';
  selectedResource = null;
  selectedAction = null;
  selectedScope = null;

  // UI state
  showCreateDialog = false;
  showFilters = false;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices,
    public messageService: MessageService
  ) {
    super(injector)
  }

  ngOnInit() {
    console.log('Permissions component initialized');
    this.permissions = { data: [], total: 0 };
    this.getPermissions();
    this.loadStats();
  }

  getPermissions = (page = 0) => {
    this.isTableLoading = true;
    this.loading = true;
    
    const params = {
      offset: page * this.tableRowsPerPage,
      size: this.tableRowsPerPage
    };

    console.log('Fetching permissions with params:', params);

    this.governanceServices.getPermissions(params).subscribe({
      next: (res) => {
        console.log('Permissions API response:', res);
        
        // Handle different response structures
        if (res && res.data) {
          this.permissions = res;
        } else if (res && Array.isArray(res)) {
          // Handle case where response is directly an array
          this.permissions = { data: res, total: res.length };
        } else {
          console.warn('Unexpected response structure:', res);
          this.permissions = { data: [], total: 0 };
        }
        
        this.updateStats();
        this.isTableLoading = false;
        this.loading = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Loaded ${this.permissions?.data?.length || 0} permissions`
        });
      },
      error: (error) => {
        console.error('Error fetching permissions:', error);
        this.permissions = { data: [], total: 0 };
        this.isTableLoading = false;
        this.loading = false;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load permissions'
        });
      }
    });
  }

  updateStats() {
    if (this.permissions?.data && Array.isArray(this.permissions.data)) {
      const data = this.permissions.data;
      this.stats.totalPermissions = this.permissions.total || data.length;
      this.stats.activePermissions = data.filter((perm: any) => perm.action !== 'disabled').length;
      this.stats.systemPermissions = data.filter((perm: any) => perm.code?.startsWith('admin:') || perm.code?.startsWith('system:')).length;
      this.stats.customPermissions = data.filter((perm: any) => !perm.code?.startsWith('admin:') && !perm.code?.startsWith('system:')).length;
    } else {
      console.warn('Permissions data is not an array:', this.permissions);
      this.stats = {
        totalPermissions: 0,
        activePermissions: 0,
        systemPermissions: 0,
        customPermissions: 0
      };
    }
  }

  loadStats() {
    // Stats are now calculated from actual data in updateStats()
    this.updateStats();
  }

  onDeletePermission(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deletePermission(id), this.getPermissions);
  }

  // Toggle filters
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // Apply filters
  applyFilters() {
    console.log('Applying filters:', {
      searchTerm: this.searchTerm,
      selectedResource: this.selectedResource,
      selectedAction: this.selectedAction,
      selectedScope: this.selectedScope
    });
    this.getPermissions(0);
  }

  // Clear filters
  clearFilters() {
    this.searchTerm = '';
    this.selectedResource = null;
    this.selectedAction = null;
    this.selectedScope = null;
    this.getPermissions(0);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Filters Cleared',
      detail: 'All filters have been cleared'
    });
  }

  // Toggle create dialog
  toggleCreateDialog() {
    this.showCreateDialog = !this.showCreateDialog;
  }

  // Utility methods
  getPermissionScopeSeverity(scope: string): string {
    switch (scope) {
      case 'global': return 'danger';
      case 'organization': return 'warning';
      case 'team': return 'info';
      case 'personal': return 'success';
      default: return 'secondary';
    }
  }

  getPermissionActionSeverity(action: string): string {
    switch (action) {
      case 'delete': return 'danger';
      case 'update': return 'warning';
      case 'create': return 'info';
      case 'read': return 'success';
      default: return 'secondary';
    }
  }

  getRoleCount(permission: any): number {
    return permission?.roleCount || 0;
  }

  getUserCount(permission: any): number {
    return permission?.userCount || 0;
  }

  setViewMode(mode: 'list' | 'card') {
    this.viewMode = mode;
  }

  refreshPermissions() {
    this.getPermissions(0);
  }

  loadPermissions(event: any) {
    this.getPermissions(event.first / event.rows);
  }

  viewPermission(permission: any) {
    console.log('View permission:', permission);
    // TODO: Implement view permission modal
  }

  editPermission(permission: any) {
    console.log('Edit permission:', permission);
    // TODO: Implement edit permission modal
  }

  getPermissionColor(action: string): string {
    switch (action?.toLowerCase()) {
      case 'read': return 'from-blue-500 to-blue-600';
      case 'write': return 'from-green-500 to-green-600';
      case 'delete': return 'from-red-500 to-red-600';
      case 'manage': return 'from-purple-500 to-purple-600';
      case 'create': return 'from-yellow-500 to-yellow-600';
      case '*': return 'from-gray-800 to-gray-900';
      default: return 'from-gray-500 to-gray-600';
    }
  }

  getPermissionIcon(action: string): string {
    switch (action?.toLowerCase()) {
      case 'read': return 'pi pi-eye';
      case 'write': return 'pi pi-pencil';
      case 'delete': return 'pi pi-trash';
      case 'manage': return 'pi pi-cog';
      case 'create': return 'pi pi-plus';
      case '*': return 'pi pi-crown';
      default: return 'pi pi-shield';
    }
  }

  getActionSeverity(action: string): string {
    switch (action?.toLowerCase()) {
      case 'read': return 'info';
      case 'write': return 'success';
      case 'delete': return 'danger';
      case 'manage': return 'warning';
      case 'create': return 'success';
      case '*': return 'danger';
      default: return 'secondary';
    }
  }

  getPermissionStatus(permission: any): string {
    // Since the API doesn't return a status field, we'll determine it based on action
    if (permission.action === '*') return 'System';
    if (permission.code?.startsWith('admin:')) return 'Admin';
    return 'Active';
  }

  getPermissionStatusSeverity(permission: any): string {
    const status = this.getPermissionStatus(permission);
    switch (status) {
      case 'System': return 'danger';
      case 'Admin': return 'warning';
      case 'Active': return 'success';
      default: return 'secondary';
    }
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
  }

  // Debug method to test API response
  testPermissionsAPI() {
    console.log('Testing permissions API...');
    this.governanceServices.getPermissions({ size: 5, offset: 0 }).subscribe({
      next: (response) => {
        console.log('Raw API response:', response);
        console.log('Response type:', typeof response);
        console.log('Response.data type:', typeof response?.data);
        console.log('Is data array?:', Array.isArray(response?.data));
        console.log('Data content:', response?.data);
        
        this.messageService.add({
          severity: 'info',
          summary: 'API Test',
          detail: 'Check console for API response details'
        });
      },
      error: (error) => {
        console.error('API test error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'API Test Failed',
          detail: error.message || 'Unknown error'
        });
      }
    });
  }
}
