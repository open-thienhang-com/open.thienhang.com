import { Component, EventEmitter, Input, Injector, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { Toast } from 'primeng/toast';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { AuthServices, PublicTenant } from '../../../core/services/auth.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    PasswordModule,
    CheckboxModule,
    Toast,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent extends AppBaseComponent {
  @Input() tenants: PublicTenant[] = [];
  @Output() onLogIn = new EventEmitter<void>();
  @Output() onVerifyAccount = new EventEmitter<void>();

  selectedTenant = '';
  confirmPassword = '';
  fullName = '';
  email = '';
  password = '';
  acceptTnC = false;
  isLoading = false;

  constructor(
    private injector: Injector,
    private authServices: AuthServices,
    private router: Router,
  ) {
    super(injector);
  }

  signUp(): void {
    if (!this.validateBeforeSignUp()) return;

    this.isLoading = true;
    this.authServices.signUp({
      email: this.email,
      full_name: this.fullName,
      password: this.password,
      terms_accepted: this.acceptTnC,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Account created! Please sign in.');
          this.onLogIn.emit();
        } else {
          this.showError(res.message || 'Sign up failed');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Sign up failed');
        this.isLoading = false;
      }
    });
  }

  validateBeforeSignUp(): boolean {
    if (!this.email || !this.fullName || !this.password) {
      this.showError('Please fill in all required fields.');
      return false;
    }
    if (!this.acceptTnC) {
      this.showError('Please accept the Terms and Conditions.');
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.showError('Passwords do not match.');
      return false;
    }
    if (this.password.length < 8) {
      this.showError('Password must be at least 8 characters.');
      return false;
    }
    return true;
  }
}
