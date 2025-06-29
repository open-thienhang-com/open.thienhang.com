import {Component, EventEmitter, Injector, Output} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {AuthServices} from '../../../core/services/auth.services';
import {Router} from '@angular/router';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-signup',
  imports: [
    Button,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    FormsModule,
    Toast
  ],
  templateUrl: './signup.component.html',
})
export class SignupComponent extends AppBaseComponent {
  confirmPassword: string;
  fullName: string;
  email: string;
  password: string;
  acceptTnC: boolean;
  @Output() onLogIn: EventEmitter<any> = new EventEmitter();

  constructor(private injector: Injector, private authServices: AuthServices, private router: Router ) {
    super(injector);
  }

  signUp() {
    if (!this.validateBeforeSignUp()) {
      return;
    }
    this.authServices.signUp({email: this.email, full_name: this.fullName, password: this.password}).subscribe(res => {
      if (!res) {
        return;
      }
      this.onLogIn.emit();
    })
  }

  validateBeforeSignUp() {
    if (!this.email || !this.fullName || !this.password) {
      this.showError('Please fill in all fields.');
      return false;
    }
    if (!this.acceptTnC) {
      this.showError('Please accept Terms and Conditions');
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.showError('Password do not match');
      return false;
    }
    return true;
  }
}
