import {Component, EventEmitter, Output} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-signup',
  imports: [
    Button,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  confirmPassword: any;
  username: any;
  email: any;
  password: any;
  acceptTnC: any;
  @Output() onLogIn: EventEmitter<any> = new EventEmitter();

}
