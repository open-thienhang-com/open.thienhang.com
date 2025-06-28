import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';

@Component({
  selector: 'app-auth',
  imports: [
    FormsModule,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  modes = {
    login: 1,
    signup: 2,
    forgotPassword: 3,
  };
  curMode = this.modes.login;

  setCurMode(mode) {
    this.curMode = mode;
  }

}
