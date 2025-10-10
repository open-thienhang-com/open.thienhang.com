import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { Textarea } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipsModule } from 'primeng/chips';
import { CommonModule } from '@angular/common';
import { GovernanceServices, Asset } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-asset',
  imports: [
    CommonModule,
    Button,
    FormsModule,
    InputText,
    Dialog,
    FloatLabel,
    Textarea,
    DropdownModule,
    MultiSelectModule,
    ChipsModule
  ],
  providers: [MessageService],
  templateUrl: './asset.component.html',
})
export class AssetComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  asset: Asset = {
    name: '',
    type: '',
    source: '',
    location: '',
    sensitivity: '',
    status: 'active',
    category: '',
    owner: '',
    tags: [],
    description: ''
  };
  originalAsset: Partial<Asset> = {};
  title = 'Create Asset';
  visible = false;
  loading = false;
  isEditMode = false;
  isViewMode = false;

  // Form validation
  formErrors: any = {};

  // Form options
  typeOptions = [
    { label: 'Database', value: 'database' },
    { label: 'API', value: 'api' },
    { label: 'Function', value: 'func' },
    { label: 'File System', value: 'filesystem' },
    { label: 'Service', value: 'service' },
    { label: 'Application', value: 'application' },
    { label: 'Cloud Storage', value: 'cloud' },
    { label: 'Table', value: 'table' }
  ];

  sensitivityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Deprecated', value: 'deprecated' }
  ];

  categoryOptions = [
    { label: 'Data Source', value: 'data_source' },
    { label: 'Application', value: 'application' },
    { label: 'Infrastructure', value: 'infrastructure' },
    { label: 'Service', value: 'service' },
    { label: 'Document', value: 'document' }
  ];

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  // Initialize empty asset
  private initializeAsset(): Asset {
    return {
      name: '',
      type: '',
      source: '',
      location: '',
      sensitivity: '',
      status: 'active',
      category: '',
      owner: '',
      tags: [],
      description: ''
    };
  }

  // Validate form
  private validateForm(): boolean {
    this.formErrors = {};

    if (!this.asset.name?.trim()) {
      this.formErrors.name = 'Asset name is required';
    }

    if (!this.asset.type?.trim()) {
      this.formErrors.type = 'Asset type is required';
    }

    if (!this.asset.sensitivity?.trim()) {
      this.formErrors.sensitivity = 'Sensitivity level is required';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  // Show modal for creating new asset
  show() {
    this.asset = this.initializeAsset();
    this.originalAsset = {};
    this.title = 'Create Asset';
    this.isEditMode = false;
    this.isViewMode = false;
    this.formErrors = {};
    this.visible = true;
  }

  // Show modal for editing existing asset
  edit(asset: Asset) {
    this.asset = { ...asset };
    this.originalAsset = { ...asset };
    this.title = 'Edit Asset';
    this.isEditMode = true;
    this.isViewMode = false;
    this.formErrors = {};
    this.visible = true;
  }

  // Show modal for viewing asset details
  view(asset: Asset) {
    this.asset = { ...asset };
    this.originalAsset = { ...asset };
    this.title = 'Asset Details';
    this.isEditMode = false;
    this.isViewMode = true;
    this.formErrors = {};
    this.visible = true;
  }

  // Save asset
  save() {
    if (!this.validateForm()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the form errors before saving'
      });
      return;
    }

    this.loading = true;

    const saveObservable = this.isEditMode && this.asset._id ?
      this.governanceServices.updateAsset(this.asset._id, this.asset) :
      this.governanceServices.createAsset(this.asset);

    saveObservable.subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Asset updated successfully' : 'Asset created successfully'
          });
          this.visible = false;
          this.asset = this.initializeAsset();
          this.onSave.emit();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res?.message || 'Failed to save asset'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving asset:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save asset. Please try again.'
        });
      }
    });
  }

  // Callback to refresh after delete
  refreshAfterDelete = () => {
    this.visible = false;
    this.onSave.emit();
  }

  // Cancel and close modal
  cancel() {
    this.visible = false;
    this.asset = this.initializeAsset();
    this.formErrors = {};
  }

  // Check if form has unsaved changes
  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.asset) !== JSON.stringify(this.originalAsset);
  }
}
