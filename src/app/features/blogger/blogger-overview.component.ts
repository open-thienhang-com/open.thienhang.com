import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-blogger-overview',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="p-4">
      <h2>Blogger App Overview</h2>
      <p>This is a minimal Blogger overview page. Replace with the full dashboard later.</p>
      <p-card>
        <ng-template pTemplate="title">Featured Post</ng-template>
        <ng-template pTemplate="content">
          <p>A sample featured post summary goes here.</p>
          <button pButton type="button" label="View Posts"></button>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`.p-4 { padding: 1rem; }`]
})
export class BloggerOverviewComponent {}
