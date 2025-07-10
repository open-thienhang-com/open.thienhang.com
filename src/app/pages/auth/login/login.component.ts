import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from "primeng/button";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthServices } from '../../../core/services/auth.services';
import { Router } from '@angular/router';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-login',
  imports: [
    Button,
    FloatLabel,
    InputText,
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
  @Output() onSignUp: EventEmitter<any> = new EventEmitter();
  @Output() onForgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(private injector: Injector, private authService: AuthServices, private router: Router) {
    super(injector);
  }

  login() {
    this.authService.login({
      email: this.email,
      password: this.password,
    }).subscribe(res => {
      if (res) {
        localStorage.setItem('isLoggedIn', 'true');
        this.router.navigate(['']).then();
      }
    }, error => {
      this.showError(error.error.message);
    })
  }

}
