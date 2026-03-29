import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-loyalty-overview',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class LoyaltyOverviewComponent {
  stats = [
    { label: 'Total Members', value: '1,250', icon: 'pi pi-users', color: 'blue' },
    { label: 'Active Campaigns', value: '3', icon: 'pi pi-megaphone', color: 'orange' },
    { label: 'Points Issued', value: '450k', icon: 'pi pi-star', color: 'yellow' },
    { label: 'Redemptions', value: '85', icon: 'pi pi-gift', color: 'green' }
  ];
}
