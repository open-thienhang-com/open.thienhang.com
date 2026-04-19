import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { GovernanceServices, CasbinRule, CasbinAssign, CasbinCheck } from '../../../core/services/governance.services';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-casbin',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, TabViewModule, ToastModule, TableModule,
    InputTextModule, DropdownModule, TagModule, TooltipModule,
    ProgressSpinnerModule, ChipModule, DividerModule
  ],
  templateUrl: './casbin.component.html',
  providers: [MessageService]
})
export class CasbinComponent implements OnInit {
  // Tab 1: Policy Rules
  rules: any[] = [];
  rulesLoading = false;
  filterTenantId = '';
  filterSub = '';

  newRule: CasbinRule = { sub: '', dom: '', obj: '', act: '' };
  addingRule = false;
  showAddRuleForm = false;

  // Tab 2: Role Assignments
  lookupTid = '';
  lookupTenantId = '';
  userRoles: any[] = [];
  userRolesLoading = false;

  assignForm: CasbinAssign = { user: '', role: '', tenant_id: '' };
  assigning = false;
  unassigning = false;

  // Tab 3: Permission Checker
  checkForm: CasbinCheck = { user: '', tenant_id: '', path: '', method: 'GET' };
  checkResult: any = null;
  checking = false;

  methodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' }
  ];

  constructor(
    private governanceServices: GovernanceServices,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  // ─── Tab 1: Policy Rules ───────────────────────────────────────────────────

  loadRules(): void {
    this.rulesLoading = true;
    const params: any = {};
    if (this.filterTenantId) params['tenant_id'] = this.filterTenantId;
    if (this.filterSub) params['sub'] = this.filterSub;

    this.governanceServices.getCasbinRules(params).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        if (Array.isArray(data)) {
          this.rules = data;
        } else if (data?.data) {
          this.rules = data.data;
        } else if (data?.rules) {
          this.rules = data.rules;
        } else {
          this.rules = [];
        }
        this.rulesLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Casbin rules' });
        this.rulesLoading = false;
      }
    });
  }

  addRule(): void {
    if (!this.newRule.sub || !this.newRule.dom || !this.newRule.obj || !this.newRule.act) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'All fields are required' });
      return;
    }
    this.addingRule = true;
    this.governanceServices.addCasbinRule(this.newRule).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Rule added' });
        this.newRule = { sub: '', dom: '', obj: '', act: '' };
        this.showAddRuleForm = false;
        this.addingRule = false;
        this.loadRules();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add rule' });
        this.addingRule = false;
      }
    });
  }

  removeRule(rule: any): void {
    const casbinRule: CasbinRule = {
      sub: rule.sub || rule.v0,
      dom: rule.dom || rule.v1,
      obj: rule.obj || rule.v2,
      act: rule.act || rule.v3
    };
    this.governanceServices.removeCasbinRule(casbinRule).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Rule removed' });
        this.loadRules();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove rule' });
      }
    });
  }

  reloadPolicies(): void {
    this.governanceServices.reloadCasbinPolicies().subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Reloaded', detail: 'Casbin policies reloaded from MongoDB' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reload policies' });
      }
    });
  }

  // ─── Tab 2: Role Assignments ───────────────────────────────────────────────

  lookupUserRoles(): void {
    if (!this.lookupTid.trim()) return;
    this.userRolesLoading = true;
    this.governanceServices.getUserCasbinRoles(this.lookupTid, this.lookupTenantId || undefined).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        if (Array.isArray(data)) {
          this.userRoles = data;
        } else if (data?.roles) {
          this.userRoles = data.roles;
        } else {
          this.userRoles = [];
        }
        this.userRolesLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user roles' });
        this.userRolesLoading = false;
      }
    });
  }

  assignRole(): void {
    if (!this.assignForm.user || !this.assignForm.role || !this.assignForm.tenant_id) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'User, Role, and Tenant are required' });
      return;
    }
    this.assigning = true;
    this.governanceServices.assignRole(this.assignForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: `Role "${this.assignForm.role}" assigned` });
        this.assigning = false;
        if (this.lookupTid === this.assignForm.user) this.lookupUserRoles();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign role' });
        this.assigning = false;
      }
    });
  }

  unassignRole(): void {
    if (!this.assignForm.user || !this.assignForm.role || !this.assignForm.tenant_id) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'User, Role, and Tenant are required' });
      return;
    }
    this.unassigning = true;
    this.governanceServices.unassignRole(this.assignForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Removed', detail: `Role "${this.assignForm.role}" unassigned` });
        this.unassigning = false;
        if (this.lookupTid === this.assignForm.user) this.lookupUserRoles();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to unassign role' });
        this.unassigning = false;
      }
    });
  }

  // ─── Tab 3: Permission Checker ─────────────────────────────────────────────

  checkPermission(): void {
    if (!this.checkForm.user || !this.checkForm.tenant_id || !this.checkForm.path || !this.checkForm.method) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'All fields are required' });
      return;
    }
    this.checking = true;
    this.checkResult = null;
    this.governanceServices.checkPermission(this.checkForm).subscribe({
      next: (res) => {
        this.checkResult = (res as any)?.data ?? res;
        this.checking = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Permission check failed' });
        this.checking = false;
      }
    });
  }

  isAllowed(): boolean {
    if (!this.checkResult) return false;
    return this.checkResult.allowed === true || this.checkResult.result === true || this.checkResult.permitted === true;
  }

  getRuleSub(rule: any): string { return rule.sub ?? rule.v0 ?? '—'; }
  getRuleDom(rule: any): string { return rule.dom ?? rule.v1 ?? '—'; }
  getRuleObj(rule: any): string { return rule.obj ?? rule.v2 ?? '—'; }
  getRuleAct(rule: any): string { return rule.act ?? rule.v3 ?? '—'; }
}
