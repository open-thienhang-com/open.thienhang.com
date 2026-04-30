import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { AuthServices } from '../../../core/services/auth.services';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, InputText, PasswordModule, Toast],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent extends AppBaseComponent implements OnInit {
  otp: string = '';
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  isLoading: boolean = false;

  @Output() onReset: EventEmitter<any> = new EventEmitter();
  @Output() onBackToLogin: EventEmitter<any> = new EventEmitter();

  constructor(
    private injector: Injector,
    private authServices: AuthServices,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.email = params['email'] || this.authServices.pendingResetEmail || '';
    this.otp = params['otp'] || '';
  }

  resetPassword(): void {
    if (!this.otp) {
      this.showError('Please enter the OTP from your email');
      return;
    }
    if (!this.password) {
      this.showError('Please enter a new password');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }
    if (this.password.length < 8) {
      this.showError('Password must be at least 8 characters');
      return;
    }

    this.isLoading = true;
    this.authServices.setNewPassword({
      token: this.otp,
      password: this.password,
      confirm_password: this.confirmPassword
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Password reset! Please sign in with your new password.');
          this.authServices.pendingResetEmail = '';
          setTimeout(() => {
            this.onReset.emit();
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.showError(res.message || 'Failed to reset password');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showError(err.error?.message || err.error?.detail || 'OTP expired or invalid. Please request a new reset email.');
        this.isLoading = false;
      }
    });
  }
}
