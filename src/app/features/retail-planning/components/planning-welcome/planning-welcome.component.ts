import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-planning-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './planning-welcome.component.html',
  styleUrls: ['./planning-welcome.component.scss']
})
export class PlanningWelcomeComponent {}

