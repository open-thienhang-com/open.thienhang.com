import {Component, EventEmitter, Injector, Output} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {PasswordModule} from "primeng/password";
import {CheckboxModule} from "primeng/checkbox";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {AuthServices} from '../../../core/services/auth.services';
import {Router} from '@angular/router';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-signup',
  imports: [
    Button,
    InputText,
    PasswordModule,
    CheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    Toast
  ],
  templateUrl: './signup.component.html',
})
export class SignupComponent extends AppBaseComponent {
  confirmPassword: string = '';
  fullName: string = '';
  email: string = '';
  password: string = '';
  acceptTnC: boolean = false;
  isLoading: boolean = false;
  @Output() onLogIn: EventEmitter<any> = new EventEmitter();

  constructor(private injector: Injector, private authServices: AuthServices, private router: Router ) {
    super(injector);
  }

  signUp() {
    if (!this.validateBeforeSignUp()) {
      return;
    }
    
    this.isLoading = true;
    this.authServices.signUp({
      email: this.email, 
      full_name: this.fullName, 
      password: this.password,
      terms_accepted: this.acceptTnC
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showSuccess('Account created successfully! Please sign in.');
          this.onLogIn.emit();
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
