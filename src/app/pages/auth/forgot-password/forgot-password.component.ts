import {Component, EventEmitter, Output, Injector} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Toast} from 'primeng/toast';
import {CommonModule} from '@angular/common';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {AuthServices} from '../../../core/services/auth.services';

@Component({
  selector: 'app-forgot-password',
  imports: [
    Button,
    InputText,
    ReactiveFormsModule,
    FormsModule,
    Toast,
    CommonModule
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent extends AppBaseComponent {
  email: string = '';
  isLoading: boolean = false;
  emailSent: boolean = false;
  @Output() onLogIn: EventEmitter<any> = new EventEmitter();

  constructor(private injector: Injector, private authServices: AuthServices) {
    super(injector);
  }

  sendResetLink() {
    if (!this.email) {
      this.showError('Please enter your email address');
      return;
    }

    this.isLoading = true;
    this.authServices.resetPassword({ email: this.email }).subscribe({
      next: (res) => {
        if (res.success) {
          this.emailSent = true;
          this.showSuccess('Password reset link sent to your email');
        } else {
          this.showError(res.message || 'Failed to send reset link');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to send reset link');
        this.isLoading = false;
      }
    });
  }
}
