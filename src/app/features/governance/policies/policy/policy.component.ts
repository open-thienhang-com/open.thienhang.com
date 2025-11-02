import { Component, EventEmitter, Injector, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Textarea } from "primeng/textarea";
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipsModule } from 'primeng/chips';
import { InputNumberModule } from 'primeng/inputnumber';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { GovernanceServices, Policy } from '../../../../core/services/governance.services';

@Component({
  selector: 'app-policy',
  imports: [
    CommonModule,
    Button,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule,
    DropdownModule,
    CheckboxModule,
    MultiSelectModule,
    ChipsModule,
    InputNumberModule
  ],
  templateUrl: './policy.component.html',
})
export class PolicyComponent extends AppBaseComponent implements OnInit {
  @Input() policy: Policy | null = null;
  @Input() inline: boolean = false; // For standalone page rendering
  @Output() savePolicy = new EventEmitter<void>();
  @Output() cancelPolicy = new EventEmitter<void>();

  title = 'Create Policy';
  editingPolicy: Policy = {
    _id: null,
    kid: '',
    name: '',
    description: '',
    type: 'access_control',
    effect: 'allow',
    subjects: [],
    roles: [],
    // permissions/resources removed
    domain_id: null,
    data_product_id: null,
    conditions: {},
    priority: 1,
    enabled: true,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    role_details: [],
    permission_details: [],
    asset_details: [],
    user_details: [],
    team_details: [],
    affected_assets_total: 0,
    policy_rules_total: 0,
    total_subjects: 0,
    total_roles: 0,
    domain_info: null,
    data_product_info: null
  };

  // Dropdown options
  users: any[] = [];
  teams: any[] = [];
  roles: any[] = [];

  // Combined subjects (users + teams)
  get subjects(): any[] {
    return [...this.users, ...this.teams];
  }

  // Conditions
  ipRestrictions: string[] = [];

  typeOptions = [
    { label: 'Access Control', value: 'access_control' },
    { label: 'Data Protection', value: 'data_protection' },
    { label: 'Compliance', value: 'compliance' }
  ];

  effectOptions = [
    { label: 'Allow', value: 'allow' },
    { label: 'Deny', value: 'deny' }
  ];

  classificationOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Internal', value: 'internal' },
    { label: 'Confidential', value: 'confidential' },
    { label: 'Restricted', value: 'restricted' }
  ];

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices,
    private router: Router) {
    super(injector);
  }

  ngOnInit() {
    if (this.policy) {
      this.editingPolicy = { ...this.policy };
      this.title = 'Edit Policy';

      // Parse conditions
      if (this.editingPolicy.conditions) {
        this.ipRestrictions = this.editingPolicy.conditions['ip_restriction'] || [];
      }
    } else {
      this.title = 'Create Policy';
    }

    this.loadUsers();
    this.loadTeams();
    this.loadRoles();
  }

  loadUsers() {
    this.governanceServices.getUsers({ size: 100, offset: 0 }).subscribe({
      next: (res) => {
        if (res.data) {
          this.users = res.data.map(user => ({
            label: `${user.email || user.kid} ${user.first_name || ''} ${user.last_name || ''}`.trim(),
            value: user.kid
          }));
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadTeams() {
    this.governanceServices.getTeams({ size: 100, offset: 0 }).subscribe({
      next: (res) => {
        if (res.data) {
          this.teams = res.data.map(team => ({
            label: `${team.name} (${team.kid})`,
            value: team.kid
          }));
        }
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  loadRoles() {
    this.governanceServices.getRoles({ limit: 100, offset: 0 }).subscribe({
      next: (res) => {
        // res.data is PaginatedResponse which contains { data: Role[], pagination: {...} }
        if (res.data && (res.data as any).data) {
          this.roles = (res.data as any).data.map(role => ({
            label: `${role.name} (${role.type || 'N/A'})`,
            value: role.kid
          }));
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  generateKid(name: string): string {
    // Convert name to uppercase, replace spaces and special chars with underscores
    const prefix = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 20); // Limit to 20 chars

    // Generate random suffix (6 characters)
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `POL_${prefix}_${randomSuffix}`;
  }

  save() {
    if (!this.editingPolicy.name.trim()) {
      this.showError('Policy name is required');
      return;
    }

    if (!this.editingPolicy.type.trim()) {
      this.showError('Policy type is required');
      return;
    }

    // Build conditions object
    this.editingPolicy.conditions = {
      ...(this.editingPolicy.conditions || {}),
      ip_restriction: this.ipRestrictions.length > 0 ? this.ipRestrictions : undefined
    };

    // Generate kid for new policies
    if (!this.policy || !this.policy.kid) {
      this.editingPolicy.kid = this.generateKid(this.editingPolicy.name);
      console.log('Generated kid:', this.editingPolicy.kid);
    }

    const saveObservable = this.policy && this.policy.kid ?
      this.governanceServices.updatePolicy(this.policy.kid, this.editingPolicy) :
      this.governanceServices.createPolicy(this.editingPolicy);

    saveObservable.subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess(this.policy ? 'Policy updated successfully' : 'Policy created successfully');
          if (this.inline) {
            // Navigate back to policies list for inline mode
            this.router.navigate(['/governance/policies']);
          } else {
            // Emit event for dialog mode
            this.savePolicy.emit();
          }
        } else {
          this.showError(res.message || 'Failed to save policy');
        }
      },
      error: (error) => {
        console.error('Error saving policy:', error);
        this.showError('Failed to save policy');
      }
    });
  }

  cancel() {
    if (this.inline) {
      // Navigate back to policies list for inline mode
      this.router.navigate(['/governance/policies']);
    } else {
      // Emit event for dialog mode
      this.cancelPolicy.emit();
    }
  }
}
