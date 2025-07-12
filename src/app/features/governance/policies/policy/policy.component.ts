import { Component, EventEmitter, Injector, Output, Input, OnInit } from '@angular/core';
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Textarea } from "primeng/textarea";
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { GovernanceServices, Policy } from '../../../../core/services/governance.services';

@Component({
  selector: 'app-policy',
  imports: [
    Button,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule,
    DropdownModule,
    CheckboxModule
  ],
  templateUrl: './policy.component.html',
})
export class PolicyComponent extends AppBaseComponent implements OnInit {
  @Input() policy: Policy | null = null;
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
    permissions: [],
    resources: [],
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
    total_permissions: 0,
    total_resources: 0,
    domain_info: null,
    data_product_info: null
  };

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  ngOnInit() {
    if (this.policy) {
      this.editingPolicy = { ...this.policy };
      this.title = 'Edit Policy';
    } else {
      this.title = 'Create Policy';
    }
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

    const saveObservable = this.policy && this.policy.kid ?
      this.governanceServices.updatePolicy(this.policy.kid, this.editingPolicy) :
      this.governanceServices.createPolicy(this.editingPolicy);

    saveObservable.subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess(this.policy ? 'Policy updated successfully' : 'Policy created successfully');
          this.savePolicy.emit();
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
    this.cancelPolicy.emit();
  }
}
