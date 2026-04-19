import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { GovernanceServices } from '../../../core/services/governance.services';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChipsModule } from 'primeng/chips';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-governance-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, ToastModule, InputTextModule,
    InputSwitchModule, ChipsModule, DividerModule, TagModule
  ],
  templateUrl: './governance-admin.component.html',
  providers: [MessageService]
})
export class GovernanceAdminComponent {
  // Init permissions
  permTenantId = '';
  permDryRun = false;
  permRunning = false;
  permResult: any = null;

  // Init roles
  rolesTenantId = '';
  rolesNames: string[] = [];
  rolesRunning = false;
  rolesResult: any = null;

  // Casbin sync
  syncRunning = false;
  syncResult: any = null;

  constructor(
    private governanceServices: GovernanceServices,
    private messageService: MessageService
  ) {}

  initPermissions(): void {
    this.permRunning = true;
    this.permResult = null;
    const params: any = {};
    if (this.permTenantId) params['tenant_id'] = this.permTenantId;
    if (this.permDryRun) params['dry_run'] = true;

    this.governanceServices.initPermissions(params).subscribe({
      next: (res) => {
        this.permResult = (res as any)?.data ?? res;
        this.messageService.add({ severity: 'success', summary: 'Done', detail: this.permDryRun ? 'Dry-run completed' : 'Permissions initialized' });
        this.permRunning = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to init permissions' });
        this.permRunning = false;
      }
    });
  }

  initRoles(): void {
    this.rolesRunning = true;
    this.rolesResult = null;
    this.governanceServices.initRoles(this.rolesTenantId || undefined, this.rolesNames.length ? this.rolesNames : undefined).subscribe({
      next: (res) => {
        this.rolesResult = (res as any)?.data ?? res;
        this.messageService.add({ severity: 'success', summary: 'Done', detail: 'Default roles initialized' });
        this.rolesRunning = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to init roles' });
        this.rolesRunning = false;
      }
    });
  }

  syncCasbin(): void {
    this.syncRunning = true;
    this.syncResult = null;
    this.governanceServices.syncCasbinPolicies().subscribe({
      next: (res) => {
        this.syncResult = (res as any)?.data ?? res;
        this.messageService.add({ severity: 'success', summary: 'Synced', detail: 'Casbin policies synced from MongoDB' });
        this.syncRunning = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Sync failed' });
        this.syncRunning = false;
      }
    });
  }
}
