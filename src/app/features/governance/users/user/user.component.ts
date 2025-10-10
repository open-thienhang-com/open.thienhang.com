import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Dialog } from "primeng/dialog";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user',
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
  templateUrl: './user.component.html',
})
export class UserComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  user: any = {};
  title = 'Create User';
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

    this.loading = true;
    const userId = this.user.kid || this.user._id || this.user.id;
    const saveObservable = userId ?
      this.governanceServices.updateUser(userId, this.user) :
      this.governanceServices.createUser(this.user);

    saveObservable.subscribe({
      next: (res) => {
        if (!res) {
          return;
        }
        this.showSuccess(userId ? 'Updated successfully' : 'Created successfully');
        this.visible = false;
        this.user = {};
        this.loading = false;
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error saving user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${userId ? 'update' : 'create'} user`
        });
        this.loading = false;
      }
    });
  }

  show(id?) {
    this.visible = true;
    this.user = {};
    this.isEditMode = false;
    this.isViewMode = false;

    if (id) {
      this.title = 'Edit User';
      this.isEditMode = true;
      this.loadUser(id);
    } else {
      this.title = 'Create User';
    }
  }

  // View user in read-only mode
  view(user: any) {
    this.visible = true;
    this.isViewMode = true;
    this.isEditMode = true;
    this.title = 'User Details';
    const id = user.kid || user._id || user.id;
    this.loadUser(id);
  }

  // Edit user
  edit(user: any) {
    this.visible = true;
    this.isEditMode = true;
    this.isViewMode = false;
    this.title = 'Edit User';
    const id = user.kid || user._id || user.id;
    this.loadUser(id);
  }

  // Load user details
  loadUser(id: string) {
    this.loading = true;
    console.log('Loading user with ID:', id);
    this.governanceServices.getUser(id).subscribe({
      next: (res) => {
        console.log('User API response:', res);
        if (!res) {
          console.warn('Empty response from API');
          return;
        }
        if (res.data) {
          console.log('Using res.data:', res.data);
          this.user = res.data;
        } else {
          console.log('Using res directly:', res);
          this.user = res;
        }
        console.log('Final user object:', this.user);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details'
        });
        this.loading = false;
        this.visible = false;
      }
    });
  }

  // Delete user with confirmation
  delete() {
    const userId = this.user.kid || this.user._id || this.user.id;
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User ID not found'
      });
      return;
    }

    this.confirmOnDelete(
      new Event('click'),
      this.governanceServices.deleteUser(userId),
      () => {
        this.onSave.emit();
        this.visible = false;
      }
    );
  }

  // Switch from view mode to edit mode
  switchToEditMode() {
    this.isViewMode = false;
    this.title = 'Edit User';
  }

  // Validate form
  validateForm(): boolean {
    if (!this.user.email?.trim()) {
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

  // Get user's full name
  getFullName(): string {
    if (this.user.first_name || this.user.last_name) {
      return `${this.user.first_name || ''} ${this.user.last_name || ''}`.trim();
    }
    return this.user.email || 'Unknown User';
  }
}
