import {Component, EventEmitter, Output} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthServices} from '../../../core/services/auth.services';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    Button,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = 'me@thienhang.com';
  password = 'stringst';
  remember = false;
  @Output() onSignUp: EventEmitter<any> = new EventEmitter();
  @Output() onForgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthServices, private router: Router) {}

  login() {
    // this.router.navigate(['/']);
    this.authService.login({
      email: this.email,
      password: this.password,
    }).subscribe(res => {
      console.log(res);
      if (res) {
        this.router.navigate(['']).then();
      }
    })
  }

}
