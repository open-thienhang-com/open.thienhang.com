import { Component, EventEmitter, Injector, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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

  /** True when the page was reached after a failed login attempt — show banner. */
  readonly fromLogin = signal(false);
  /** True when the page was reached straight after signup. */
  readonly fromSignup = signal(false);
  /** True once the magic-link token in ?token= has been attempted (success or 410). */
  readonly tokenConsumeAttempted = signal(false);
  /** True if the magic-link returned 410 GONE — show "expired" notice + resend CTA. */
  readonly tokenExpired = signal(false);
  /** True while the magic-link verification call is in flight. */
  readonly tokenConsuming = signal(false);

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
    const params = this.route.snapshot.queryParams;
    const emailFromParam = params['email'];
    this.email = emailFromParam || this.authServices.pendingVerificationEmail || '';
    this.fromLogin.set(params['from'] === 'login');
    this.fromSignup.set(params['from'] === 'signup');

    // Magic-link auto-consume: if the email button was clicked, the URL carries
    // ?token=<magic>. Backend returns a session token alongside success so the
    // UI can drop the user straight on the dashboard without a re-login round
    // trip. On 410 surface "link expired"; any other error falls through to
    // the manual OTP form below.
    const token = params['token'];
    if (token && this.email && !this.tokenConsumeAttempted()) {
      this.tokenConsumeAttempted.set(true);
      this.tokenConsuming.set(true);
      this.authServices.verifyMagicToken(this.email, token, 'verify_email').subscribe({
        next: (res) => {
          this.tokenConsuming.set(false);
          if (res?.success !== false) {
            this.adoptSessionFromVerify(res);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.tokenConsuming.set(false);
          if (err.status === 410) {
            this.tokenExpired.set(true);
          }
          // Any non-410 falls back to the manual OTP form silently.
        },
      });
    }
  }

  /** After verify success (OTP or magic-link), the backend hands us a session
   * token. Hydrate localStorage + AuthServices state, then navigate straight
   * to the dashboard. Falls back to /login when no token is present (e.g.
   * legacy backend not yet rebuilt). */
  private adoptSessionFromVerify(res: any): void {
    const tokenPayload = res?.data?.token || res?.data;
    const accessToken = tokenPayload?.access_token;
    if (accessToken) {
      try { localStorage.setItem('access_token', accessToken); } catch { /* ignore */ }
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userVerified', 'true');
      this.authServices.pendingVerificationEmail = '';
      this.showSuccess('Email đã xác thực. Đang chuyển vào hệ thống…');
      // Pre-warm the userSubject so the dashboard's guards/templates see
      // the user immediately instead of flashing a guest layout.
      this.authServices.getCurrentUser().subscribe({ error: () => {} });
      setTimeout(() => this.router.navigate(['/'], { replaceUrl: true }), 800);
      return;
    }
    // No session in payload — older backend or unexpected shape. Fall back.
    this.authServices.pendingVerificationEmail = '';
    this.showSuccess('Email đã xác thực, hãy đăng nhập.');
    setTimeout(() => this.router.navigate(['/login']), 1200);
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
          this.onVerified.emit();
          this.adoptSessionFromVerify(res);
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
          this.tokenExpired.set(false);
          this.startCooldown(60);
        } else {
          this.showError(res.message || 'Failed to resend OTP');
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 429) {
          // Backend rate-limited. Drive the cooldown off the Retry-After header
          // so the UI matches the real server window instead of a guessed 60s.
          const retryAfter = Number(err.headers?.get?.('Retry-After')) || 60;
          this.startCooldown(retryAfter);
          this.showError(`Quá nhiều yêu cầu, thử lại sau ${retryAfter}s`);
          return;
        }
        this.showError(err.error?.message || 'Failed to resend OTP');
      }
    });
  }

  private startCooldown(seconds: number): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.resendCooldown = Math.max(1, Math.floor(seconds));
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
        this.resendCooldown = 0;
      }
    }, 1000);
  }
}
