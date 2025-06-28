import {Component, EventEmitter, Output} from '@angular/core';
import {Button} from "primeng/button";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-forgot-password',
  imports: [
    Button,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  email: any;
  @Output() onLogIn: EventEmitter<any> = new EventEmitter();
}
