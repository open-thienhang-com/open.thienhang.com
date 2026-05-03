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
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-casbin',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CardModule, TabViewModule, ToastModule, TableModule,
    InputTextModule, DropdownModule, TagModule, TooltipModule,
    ProgressSpinnerModule, ChipModule, DividerModule, CheckboxModule
  ],
  templateUrl: './casbin.component.html',
  providers: [MessageService]
})
export class CasbinComponent implements OnInit {
  // Matrix Configuration (will be populated dynamically)
  matrixResources: string[] = [];
  matrixActions: string[] = [];
  
  // Tab 1: Policy Rules (Matrix View)
  rules: any[] = [];
  groupedRules: any = {}; // { [sub]: { [obj]: { [act]: boolean } } }
  rulesLoading = false;
  filterTenantId = '*';
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
    { label: 'DELETE', value: 'DELETE' },
    { label: '*', value: '*' }
  ];

  constructor(
    private governanceServices: GovernanceServices,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  // ─── Tab 1: Policy Rules (Matrix) ──────────────────────────────────────────

  loadRules(): void {
    this.rulesLoading = true;
    const params: any = {};
    if (this.filterTenantId) params['tenant_id'] = this.filterTenantId;
    if (this.filterSub) params['sub'] = this.filterSub;

    this.governanceServices.getCasbinRules(params).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        let rawRules: any[] = [];
        if (Array.isArray(data)) rawRules = data;
        else if (data?.data) rawRules = data.data;
        else if (data?.rules) rawRules = data.rules;
        
        this.rules = rawRules;
        this.transformRulesToMatrix(rawRules);
        this.rulesLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Casbin rules' });
        this.rulesLoading = false;
      }
    });
  }

  private transformRulesToMatrix(rawRules: any[]): void {
    const matrix: any = {};
    const resSet = new Set<string>();
    const actSet = new Set<string>();

    // Initial pass to identify resources and actions, and filter p-rules
    const pRules = rawRules.filter(r => (r.ptype || r.v0) === 'p');

    pRules.forEach(r => {
      const obj = r.obj || r.v2 || 'global';
      const act = r.act || r.v3;
      if (obj !== '*') resSet.add(obj);
      if (act !== '*') actSet.add(act);
    });

    // If data is empty, use defaults
    if (resSet.size === 0) ['projects', 'reports', 'settings', 'tasks', 'teams'].forEach(r => resSet.add(r));
    if (actSet.size === 0) ['create', 'read', 'update', 'delete'].forEach(a => actSet.add(a));

    this.matrixResources = Array.from(resSet).sort();
    this.matrixActions = Array.from(actSet).sort();

    // Secondary pass to build matrix and handle wildcards
    pRules.forEach(r => {
      const sub = r.sub || r.v0;
      const obj = r.obj || r.v2 || 'global';
      const act = r.act || r.v3;

      if (!matrix[sub]) matrix[sub] = {};

      if (obj === '*' && act === '*') {
        // Universal permission: All resources, all actions
        this.matrixResources.forEach(res => {
          if (!matrix[sub][res]) matrix[sub][res] = {};
          this.matrixActions.forEach(a => matrix[sub][res][a] = true);
        });
        matrix[sub]['*'] = { '*': true }; // Store the wildcard itself
      } else if (obj === '*') {
        // Wildcard resource: This action for all resources
        this.matrixResources.forEach(res => {
          if (!matrix[sub][res]) matrix[sub][res] = {};
          matrix[sub][res][act] = true;
        });
        if (!matrix[sub]['*']) matrix[sub]['*'] = {};
        matrix[sub]['*'][act] = true;
      } else if (act === '*') {
        // Wildcard action: All actions for this resource
        if (!matrix[sub][obj]) matrix[sub][obj] = {};
        this.matrixActions.forEach(a => matrix[sub][obj][a] = true);
        matrix[sub][obj]['*'] = true;
      } else {
        // Specific rule
        if (!matrix[sub][obj]) matrix[sub][obj] = {};
        matrix[sub][obj][act] = true;
      }
    });

    this.groupedRules = matrix;
    
    // Final pass to ensure all cells are initialized
    Object.keys(this.groupedRules).forEach(sub => {
      this.matrixResources.forEach(res => {
        if (!this.groupedRules[sub][res]) this.groupedRules[sub][res] = {};
        this.matrixActions.forEach(act => {
          if (this.groupedRules[sub][res][act] === undefined) {
            this.groupedRules[sub][res][act] = false;
          }
        });
      });
    });
  }

  get subjects(): string[] {
    return Object.keys(this.groupedRules).filter(s => s !== '*' && s !== 'p');
  }

  // Helper to make tech terms friendly for low-tech users
  getFriendlyName(id: string): string {
    if (!id) return 'General';
    if (id === '*') return 'All System (Full Access)';
    
    const mapping: any = {
      // Roles
      'role:admin': 'Super Administrator',
      'role:user': 'Regular Staff',
      'role:viewer': 'Guest / Observer',
      'role:editor': 'Content Editor',
      'role:tenant_admin': 'Tenant Manager',
      'System Admin': 'System Core Admin',
      'Standard User': 'Standard Employee',
      // Resources
      '/governance/*': 'Governance & Policies',
      '/data-catalog/*': 'Data Catalog (Search)',
      '/data-mesh/domains/*': 'Data Mesh & Domains',
      '/authentication/*': 'Login & Security Settings',
      'projects': 'Project Management',
      'reports': 'Analytics & Reports',
      'settings': 'System Configuration',
      'tasks': 'Task & Workflow',
      'teams': 'Team Organization',
      'global': 'System-wide'
    };
    
    return mapping[id] || id.replace('role:', '').replace(/\//g, ' ').replace(/\*/g, '').trim() || id;
  }

  getActionLabel(act: string): string {
    const mapping: any = {
      'GET': 'View / Read',
      'view': 'View / Read',
      'POST': 'Add New',
      'create': 'Add New',
      'PUT': 'Edit / Update',
      'PATCH': 'Edit / Update',
      'update': 'Edit / Update',
      'DELETE': 'Delete',
      'delete': 'Delete',
      '*': 'Full Control'
    };
    return mapping[act] || act;
  }

  getActionIcon(act: string): string {
    const mapping: any = {
      'GET': 'pi pi-eye',
      'view': 'pi pi-eye',
      'POST': 'pi pi-plus-circle',
      'create': 'pi pi-plus-circle',
      'PUT': 'pi pi-pencil',
      'PATCH': 'pi pi-pencil',
      'update': 'pi pi-pencil',
      'DELETE': 'pi pi-trash',
      'delete': 'pi pi-trash',
      '*': 'pi pi-star-fill'
    };
    return mapping[act] || 'pi pi-check';
  }

  isInherited(sub: string, obj: string, act: string): boolean {
    // Check if permission is granted via *
    const rules = this.groupedRules[sub];
    if (!rules) return false;
    
    const fromGlobal = rules['*']?.['*'] === true;
    const fromObjWildcard = rules['*']?.[act] === true;
    const fromActWildcard = rules[obj]?.['*'] === true;
    
    return fromGlobal || fromObjWildcard || fromActWildcard;
  }

  toggleMatrixPermission(sub: string, obj: string, act: string): void {
    // Prevent toggling if inherited from wildcard? 
    // For now, let's just send the specific rule toggle.
    const isCurrentlySet = this.groupedRules[sub]?.[obj]?.[act];
    const rule: CasbinRule = {
      sub,
      dom: this.filterTenantId || '*',
      obj: obj === 'global' ? '' : obj,
      act
    };

    if (isCurrentlySet) {
      this.governanceServices.removeCasbinRule(rule).subscribe({
        next: () => {
          this.groupedRules[sub][obj][act] = false;
          this.messageService.add({ severity: 'info', summary: 'Updated', detail: 'Permission removed' });
          // If it was inherited, the UI might still show it as true if we reload
          // But here we are just updating local state for UX
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
      });
    } else {
      this.governanceServices.addCasbinRule(rule).subscribe({
        next: () => {
          if (!this.groupedRules[sub][obj]) this.groupedRules[sub][obj] = {};
          this.groupedRules[sub][obj][act] = true;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Permission granted' });
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update' })
      });
    }
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
        this.messageService.add({ severity: 'success', summary: 'Reloaded', detail: 'Casbin policies reloaded' });
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
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: `Role assigned` });
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
        this.messageService.add({ severity: 'success', summary: 'Removed', detail: `Role unassigned` });
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
