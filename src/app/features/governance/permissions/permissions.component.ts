import {Component, Injector, OnInit} from '@angular/core';
import {PermissionComponent} from '../permissions/permission/permission.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {GovernanceServices} from '../../../core/services/governance.services';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {Tag} from "primeng/tag";
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

@Component({
  selector: 'app-permissions',
  imports: [
    PermissionComponent,
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
    TreeModule
  ],
  templateUrl: './permissions.component.html',
})
export class PermissionsComponent extends AppBaseComponent implements OnInit {
  permissions: any;
  loading = false;

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
  viewMode = 'list'; // list, tree, matrix

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getPermissions();
    this.loadStats();
  }

  getPermissions = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getPermissions({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.permissions = res;
      this.isTableLoading = false;
    })
  }

  loadStats() {
    // Mock stats - replace with actual API call
    this.stats = {
      totalPermissions: 156,
      activePermissions: 142,
      systemPermissions: 89,
      customPermissions: 67
    };
  }

  onDeletePermission(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deletePermission(id), this.getPermissions);
  }

  // Filter methods
  applyFilters() {
    // Implement filter logic
    this.getPermissions();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedResource = null;
    this.selectedAction = null;
    this.selectedScope = null;
    this.getPermissions();
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

  toggleCreateDialog() {
    this.showCreateDialog = !this.showCreateDialog;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  setViewMode(mode: string) {
    this.viewMode = mode;
  }
}
