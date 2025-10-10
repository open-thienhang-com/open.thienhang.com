import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    Dialog,
    FloatLabel,
    InputText,
    TagModule,
    TooltipModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './account.component.html',
})
export class AccountComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  account: any = {};
  title = 'Create Account';
  visible = false;
  loading = false;
  isEditMode = false;
  isViewMode = false;

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

    if (!this.account._id && !this.account.identify) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Account creation is not supported. Accounts can only be updated.'
      });
      return;
    }

    this.loading = true;
    const accountId = this.account.identify || this.account._id || this.account.id;
    const saveObservable = this.governanceServices.updateAccount(accountId, this.account);

    saveObservable.subscribe({
      next: (res) => {
        if (!res) {
          return;
        }
        this.showSuccess('Updated successfully');
        this.visible = false;
        this.account = {};
        this.loading = false;
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error saving account:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update account'
        });
        this.loading = false;
      }
    });
  }

  show(id?) {
    this.visible = true;
    this.account = {};
    this.isEditMode = false;
    this.isViewMode = false;

    if (id) {
      this.title = 'Edit Account';
      this.isEditMode = true;
      this.loadAccount(id);
    } else {
      this.title = 'Create Account';
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Account creation is not supported. Please edit existing accounts.'
      });
    }
  }

  // View account in read-only mode
  view(account: any) {
    this.visible = true;
    this.isViewMode = true;
    this.isEditMode = true;
    this.title = 'Account Details';
    const id = account.identify || account._id || account.id;
    this.loadAccount(id);
  }

  // Edit account
  edit(account: any) {
    this.visible = true;
    this.isEditMode = true;
    this.isViewMode = false;
    this.title = 'Edit Account';
    const id = account.identify || account._id || account.id;
    this.loadAccount(id);
  }

  // Load account details
  loadAccount(id: string) {
    this.loading = true;
    console.log('Loading account with ID:', id);
    this.governanceServices.getAccount(id).subscribe({
      next: (res) => {
        console.log('Account API response:', res);
        if (!res) {
          console.warn('Empty response from API');
          return;
        }
        if (res.data) {
          console.log('Using res.data:', res.data);
          this.account = res.data;
        } else {
          console.log('Using res directly:', res);
          this.account = res;
        }
        console.log('Final account object:', this.account);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading account:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load account details'
        });
        this.loading = false;
        this.visible = false;
      }
    });
  }

  // Switch from view mode to edit mode
  switchToEditMode() {
    this.isViewMode = false;
    this.title = 'Edit Account';
  }

  // Validate form
  validateForm(): boolean {
    if (!this.account.email?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Email is required'
      });
      return false;
    }

    return true;
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

  // Get status severity for tag
  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
