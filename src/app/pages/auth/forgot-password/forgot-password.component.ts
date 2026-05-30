import {Component, EventEmitter, Output, Injector, signal} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Toast} from 'primeng/toast';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
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
  /** Seconds until the user may submit again (driven by HTTP 429 Retry-After). */
  readonly retryCooldown = signal(0);

  @Output() onLogIn: EventEmitter<any> = new EventEmitter();
  @Output() onResetPassword: EventEmitter<any> = new EventEmitter();

  private cooldownTimer: any;

  constructor(private injector: Injector, private authServices: AuthServices, private router: Router) {
    super(injector);
  }

  sendResetLink() {
    if (!this.email) {
      this.showError('Please enter your email address');
      return;
    }
    if (this.retryCooldown() > 0) {
      this.showError(`Thử lại sau ${this.retryCooldown()}s`);
      return;
    }

    this.isLoading = true;
    this.authServices.resetPassword({ email: this.email }).subscribe({
      next: (res) => {
        if (res.success) {
          this.emailSent = true;
          this.showSuccess('OTP sent to your email');
          this.authServices.pendingResetEmail = this.email;
          // Navigate to dedicated reset-password route with email in URL (survives refresh)
          this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
        } else {
          this.showError(res.message || 'Failed to send reset link');
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 429) {
          const retryAfter = Number(error.headers?.get?.('Retry-After')) || 60;
          this.startCooldown(retryAfter);
          this.showError(`Quá nhiều yêu cầu, thử lại sau ${retryAfter}s`);
        } else {
          this.showError(error.error?.message || 'Failed to send reset link');
        }
        this.isLoading = false;
      }
    });
  }

  private startCooldown(seconds: number): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.retryCooldown.set(Math.max(1, Math.floor(seconds)));
    this.cooldownTimer = setInterval(() => {
      const next = this.retryCooldown() - 1;
      if (next <= 0) {
        this.retryCooldown.set(0);
        clearInterval(this.cooldownTimer);
      } else {
        this.retryCooldown.set(next);
      }
    }, 1000);
  }
}
