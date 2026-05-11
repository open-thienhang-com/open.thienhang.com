import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ad-manager-overview',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="p-d-flex p-jc-center p-mt-4">
      <p-card header="Ad Manager" style="width: 780px;">
        <p>This is a minimal Ad Manager overview page. You can extend this with campaigns, creatives, and reports.</p>
        <ng-template pTemplate="footer">
          <button pButton type="button" label="Create Campaign" class="p-button-primary"></button>
        </ng-template>
      </p-card>
    </div>
  `
})
export class AdManagerOverviewComponent {}
