import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterModule, ButtonModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpPageComponent {}
