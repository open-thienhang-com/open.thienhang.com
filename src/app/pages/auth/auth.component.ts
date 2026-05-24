import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyAccountComponent } from './verify-account/verify-account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthServices, PublicTenant } from '../../core/services/auth.services';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    VerifyAccountComponent,
    ResetPasswordComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  readonly version = '2.0';

  modes = {
    login: 1,
    signup: 2,
    forgotPassword: 3,
    verifyAccount: 4,
    resetPassword: 5,
  };
  curMode = this.modes.login;

  publicTenants: PublicTenant[] = [];

  constructor(private route: ActivatedRoute, private authServices: AuthServices) {}

  ngOnInit(): void {
    const modeFromData = this.route.snapshot.data['mode'];
    if (modeFromData) {
      this.curMode = modeFromData;
    }
    const step = this.route.snapshot.queryParams['step'];
    if (step === 'reset') {
      this.curMode = this.modes.resetPassword;
    }

    this.authServices.getPublicTenants().subscribe({
      next: r => { this.publicTenants = r.data ?? []; },
      error: () => {}
    });
  }

  setCurMode(mode: number): void {
    this.curMode = mode;
  }

  handleUnverified(data: { email: string }): void {
    this.setCurMode(this.modes.verifyAccount);
  }
}
