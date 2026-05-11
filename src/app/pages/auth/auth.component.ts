import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {VerifyAccountComponent} from './verify-account/verify-account.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-auth',
  imports: [
    FormsModule,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    VerifyAccountComponent,
    ResetPasswordComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AuthComponent implements OnInit {
  modes = {
    login: 1,
    signup: 2,
    forgotPassword: 3,
    verifyAccount: 4,
    resetPassword: 5,
  };
  curMode = this.modes.login;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const modeFromData = this.route.snapshot.data['mode'];
    if (modeFromData) {
      this.curMode = modeFromData;
    }
    // /forgot-password?step=reset — jump directly to reset-password screen
    const step = this.route.snapshot.queryParams['step'];
    if (step === 'reset') {
      this.curMode = this.modes.resetPassword;
    }
  }

  setCurMode(mode: number) {
    this.curMode = mode;
  }

  handleUnverified(data: { email: string }) {
    this.setCurMode(this.modes.verifyAccount);
  }
}
