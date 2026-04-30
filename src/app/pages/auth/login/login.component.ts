import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from "primeng/button";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from "primeng/password";
import { CheckboxModule } from "primeng/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { AuthServices } from '../../../core/services/auth.services';
import { Router } from '@angular/router';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { Toast } from 'primeng/toast';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-login',
  imports: [
    Button,
    InputText,
    DropdownModule,
    PasswordModule,
    CheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    Toast
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent extends AppBaseComponent {
  email = 'admin@thienhang.com';
  password = '12345678';
  remember = false;
  isLoading = false;
  apiOptions = [
    { label: 'Production (api.thienhang.com)', value: 'https://api.thienhang.com' },
    { label: 'Localhost (localhost:8080)', value: 'http://localhost:8080' },
    { label: 'Localhost (localhost:8081)', value: 'http://localhost:8081' }
  ];
  selectedApi: string | null = null;
  // If true, the selected environment will be applied to the runtime API base (localStorage/window.__API_BASE__)
  applyApi = true;
  @Output() onSignUp: EventEmitter<any> = new EventEmitter();
  @Output() onForgotPassword: EventEmitter<any> = new EventEmitter();
  @Output() onUnverified: EventEmitter<{email: string}> = new EventEmitter();

  constructor(
    private injector: Injector,
    private authService: AuthServices,
    private router: Router,
    private loadingService: LoadingService
  ) {
    super(injector);
    // Initialize selectedApi from localStorage if present
    try {
      this.selectedApi = localStorage.getItem('API_BASE') || null;
    } catch (e) {
      this.selectedApi = null;
    }
  }

  login() {
    if (!this.email || !this.password) {
      this.showError('Please enter both email and password');
      return;
    }

    this.isLoading = true;

    // Show beautiful loading animation
    this.loadingService.showOverlay('Signing you in...', 'pulse');

    this.authService.login({
      email: this.email,
      password: this.password,
      remember_me: this.remember
    }).subscribe({
      next: (res) => {
        if (res.success) {
          // Check if account is unverified — switch to verify mode instead of navigating
          if (res.data?.is_verified === false) {
            this.authService.pendingVerificationEmail = this.email;
            this.showError('Your email is not verified. Please enter the OTP sent to your email.');
            this.isLoading = false;
            this.loadingService.hide();
            this.onUnverified.emit({ email: this.email });
            return;
          }
          // Ensure we fetch current user profile after login so header/menu can show user info
          this.authService.getCurrentUser().subscribe(() => {
            localStorage.setItem('isLoggedIn', 'true');
            this.showSuccess('Login successful');
            this.router.navigate(['']).then();
          }, () => {
            // even if fetching profile fails, continue to navigate
            localStorage.setItem('isLoggedIn', 'true');
            this.showSuccess('Login successful');
            this.router.navigate(['']).then();
          });
        } else {
          this.showError(res.message || 'Login failed');
        }
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        this.showError(error.error?.message || 'Login failed');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  onApiChange(value: string | null) {
    this.selectedApi = value;
    try {
      if (this.applyApi) {
        if (value) {
          localStorage.setItem('API_BASE', value);
          // Also set runtime override for immediate use in the page
          // @ts-ignore
          if (typeof window !== 'undefined') window.__API_BASE__ = value;
        } else {
          localStorage.removeItem('API_BASE');
          // @ts-ignore
          if (typeof window !== 'undefined') delete window.__API_BASE__;
        }
      }
    } catch (e) {
      // ignore storage errors
    }
  }

}
