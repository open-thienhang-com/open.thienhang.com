import { Component, EventEmitter, Injector, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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

  /** True once the user clicked the magic link in the reset email and the
   * server has consumed it. In this state the OTP field is hidden and
   * /update-password is called without a code. */
  readonly magicConsumed = signal(false);
  /** True while the magic-link verification is in flight. */
  readonly magicConsuming = signal(false);
  /** True if the magic-link returned 410 GONE — surface "expired" notice. */
  readonly magicExpired = signal(false);

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
    const token = params['token'];

    // Magic-link auto-consume. The server will mark the OTP record
    // magic_consumed=true and set the otp_token cookie. On success we hide
    // the OTP input — the user just needs a new password. On 410 we surface
    // "expired" + offer manual flow.
    if (token && this.email) {
      this.magicConsuming.set(true);
      this.authServices.verifyMagicToken(this.email, token, 'reset_password').subscribe({
        next: () => {
          this.magicConsuming.set(false);
          this.magicConsumed.set(true);
          this.authServices.pendingResetEmail = this.email;
        },
        error: (err: HttpErrorResponse) => {
          this.magicConsuming.set(false);
          if (err.status === 410) this.magicExpired.set(true);
        },
      });
    }
  }

  resetPassword(): void {
    if (!this.magicConsumed() && !this.otp) {
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
    // When the magic link was consumed, the server-side OTP record carries the
    // `magic_consumed` flag and /update-password accepts an empty `otp`. The
    // cookie set during magic consume identifies which record to finalize.
    this.authServices.setNewPassword({
      token: this.magicConsumed() ? '' : this.otp,
      password: this.password,
      confirm_password: this.confirmPassword,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Password reset successfully! Please sign in with your new password.');
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
