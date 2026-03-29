import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="p-4">
      <h1 class="text-3xl font-bold mb-4">Loyalty Campaigns</h1>
      <p class="text-600 mb-6">Create and monitor marketing campaigns and promotions.</p>
      <div class="grid">
        <div class="col-12">
            <p-card styleClass="glassmorphic">
                <p>Campaigns management interface coming soon...</p>
            </p-card>
        </div>
      </div>
    </div>
  `
})
export class CampaignsComponent {}
