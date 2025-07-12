import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from "primeng/button";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { CheckboxModule } from "primeng/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
    PasswordModule,
    CheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    Toast
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent extends AppBaseComponent {
  email = 'admin@thienhang.com';
  password = '12345678';
  remember = false;
  isLoading = false;
  @Output() onSignUp: EventEmitter<any> = new EventEmitter();
  @Output() onForgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(
    private injector: Injector, 
    private authService: AuthServices, 
    private router: Router,
    private loadingService: LoadingService
  ) {
    super(injector);
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
          localStorage.setItem('isLoggedIn', 'true');
          this.showSuccess('Login successful');
          this.router.navigate(['']).then();
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

}
