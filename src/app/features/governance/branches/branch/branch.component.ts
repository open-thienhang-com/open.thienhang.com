import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Branch } from '../../../../core/services/governance.services';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ButtonModule, InputTextModule, InputTextarea,
    DropdownModule, ToggleSwitchModule, CardModule,
    DividerModule, TooltipModule, TagModule
  ],
  templateUrl: './branch.component.html'
})
export class BranchComponent implements OnInit {
  @Input() branch?: Branch;
  @Input() loading = false;
  @Input() allBranches: Branch[] = [];
  @Output() save = new EventEmitter<Branch>();
  @Output() cancel = new EventEmitter<void>();

  form: UntypedFormGroup;

  branchTypes = [
    { label: 'Office', value: 'office' },
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Retail Store', value: 'retail_store' },
    { label: 'Distribution Center', value: 'distribution_center' },
    { label: 'Other', value: 'other' }
  ];

  constructor(private fb: UntypedFormBuilder) {
    this.form = this.fb.group({
      id: [''],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      branch_type: ['office'],
      is_active: [true],
      parent_id: [null],
      address: this.fb.group({
        street: [''],
        city: [''],
        postal_code: [''],
        country: ['Vietnam']
      }),
      contact_info: this.fb.group({
        email: ['', [Validators.email]],
        phone: ['']
      }),
      metadata_json: ['{}']
    });
  }

  ngOnInit(): void {
    if (this.branch) {
      this.form.patchValue({
        ...this.branch,
        metadata_json: JSON.stringify(this.branch.metadata || {}, null, 2)
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const val = this.form.value;
    let metadata = {};
    try {
      metadata = JSON.parse(val.metadata_json);
    } catch (e) {
      // fallback
    }

    const payload: Branch = {
      ...val,
      metadata
    };
    delete (payload as any).metadata_json;

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
