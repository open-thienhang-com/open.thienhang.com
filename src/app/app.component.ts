import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
