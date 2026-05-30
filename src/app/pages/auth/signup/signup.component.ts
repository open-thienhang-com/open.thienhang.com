import { Component, EventEmitter, Input, Injector, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
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
    RadioButtonModule,
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

  /** OTP delivery: 'email' (default) or 'telegram'. */
  verificationChannel: 'email' | 'telegram' = 'email';
  telegramChatId: number | null = null;
  telegramUsername = '';

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
    const telegramFields = this.verificationChannel === 'telegram'
      ? {
          telegram_chat_id: Number(this.telegramChatId),
          telegram_username: this.telegramUsername?.replace(/^@/, '').trim() || undefined,
        }
      : {};

    this.authServices.signUp({
      email: this.email,
      full_name: this.fullName,
      password: this.password,
      terms_accepted: this.acceptTnC,
      verification_channel: this.verificationChannel,
      ...telegramFields,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Đã gửi mã xác thực đến email của bạn.');
          this.authServices.pendingVerificationEmail = this.email;
          // Send the user to the verify screen with the email in the URL so
          // refresh/copy-paste both work. Emitting onVerifyAccount keeps the
          // AuthComponent mode-switch path intact when signup is rendered
          // inside the auth shell rather than via standalone /register route.
          this.onVerifyAccount.emit();
          this.router.navigate(['/verify'], {
            queryParams: { email: this.email, from: 'signup' },
          });
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
    if (this.verificationChannel === 'telegram') {
      const chatId = Number(this.telegramChatId);
      if (this.telegramChatId === null || Number.isNaN(chatId) || chatId <= 0) {
        this.showError('Enter your Telegram chat ID. Open the bot, send /start, then copy the chat ID it replies with.');
        return false;
      }
    }
    return true;
  }
}
