import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-hotel-overview',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="p-4">
      <h2>Hotel App Overview</h2>
      <p>This is a minimal Hotel overview page. Replace with the full dashboard later.</p>
      <p-card>
        <ng-template pTemplate="title">Hotel Summary</ng-template>
        <ng-template pTemplate="content">
          <p>Quick stats and links for hotel management go here.</p>
          <button pButton type="button" label="Open Management"></button>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`.p-4 { padding: 1rem; }`]
})
export class HotelOverviewComponent {}
