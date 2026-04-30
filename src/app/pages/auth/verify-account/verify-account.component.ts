import { Component, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { AuthServices } from '../../../core/services/auth.services';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, InputText, Toast],
  templateUrl: './verify-account.component.html',
})
export class VerifyAccountComponent extends AppBaseComponent implements OnInit, OnDestroy {
  otp: string = '';
  email: string = '';
  isLoading: boolean = false;
  resendCooldown: number = 0;

  @Output() onVerified: EventEmitter<any> = new EventEmitter();
  @Output() onBackToLogin: EventEmitter<any> = new EventEmitter();

  private cooldownTimer: any;

  constructor(
    private injector: Injector,
    private authServices: AuthServices,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // Query param email has priority over in-memory service property
    const emailFromParam = this.route.snapshot.queryParams['email'];
    this.email = emailFromParam || this.authServices.pendingVerificationEmail || '';
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  verify(): void {
    if (!this.otp) {
      this.showError('Please enter the OTP from your email');
      return;
    }
    if (!this.email) {
      this.showError('Email address is missing. Please go back and sign up again.');
      return;
    }

    this.isLoading = true;
    this.authServices.verifyEmail(this.email, this.otp).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Email verified! Please sign in.');
          this.authServices.pendingVerificationEmail = '';
          setTimeout(() => {
            this.onVerified.emit();
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.showError(res.message || 'Invalid or expired OTP');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showError(err.error?.message || err.error?.detail || 'Invalid or expired OTP');
        this.isLoading = false;
      }
    });
  }

  resend(): void {
    if (this.resendCooldown > 0) return;
    if (!this.email) {
      this.showError('Email address is missing');
      return;
    }

    this.authServices.resendVerificationEmail(this.email).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('OTP resent to your email');
          this.startCooldown();
        } else {
          this.showError(res.message || 'Failed to resend OTP');
        }
      },
      error: (err) => {
        this.showError(err.error?.message || 'Failed to resend OTP');
      }
    });
  }

  private startCooldown(): void {
    this.resendCooldown = 60;
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
        this.resendCooldown = 0;
      }
    }, 1000);
  }
}
