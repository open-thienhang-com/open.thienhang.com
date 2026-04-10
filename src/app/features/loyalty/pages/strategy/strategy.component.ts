import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

interface TierRule {
  tier: string; color: string; bg: string; border: string;
  minPoints: number; maxPoints: number | null;
  multiplier: number; perks: string[];
}

@Component({
  selector: 'app-loyalty-strategy',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './strategy.component.html',
})
export class StrategyComponent {
  tiers: TierRule[] = [
    { tier: 'Bronze',   color: '#92400e', bg: '#fef3c7', border: '#fde68a', minPoints: 0,    maxPoints: 999,  multiplier: 1,   perks: ['Earn 1 pt / 10K spend', 'Birthday bonus 100 pts', 'Access to basic rewards'] },
    { tier: 'Silver',   color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', minPoints: 1000, maxPoints: 4999, multiplier: 1.5, perks: ['Earn 1.5× pts', 'Free shipping on orders >200K', 'Early sale access'] },
    { tier: 'Gold',     color: '#b45309', bg: '#fffbeb', border: '#fcd34d', minPoints: 5000, maxPoints: 19999,multiplier: 2,   perks: ['Earn 2× pts', 'Dedicated support line', 'Exclusive Gold rewards', 'Monthly bonus event'] },
    { tier: 'Platinum', color: '#6d28d9', bg: '#f5f3ff', border: '#c4b5fd', minPoints: 20000,maxPoints: null, multiplier: 3,   perks: ['Earn 3× pts', 'Personal account manager', 'Unlimited free shipping', 'Invite-only events', 'Tier protection 12 months'] },
  ];

  policies = [
    { label: 'Points Expiry', value: '12 months after last transaction', icon: 'pi pi-clock', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Earn Rate',     value: '1 point per 10,000 VND spent',    icon: 'pi pi-star',  color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Min Redemption',value: '500 points minimum',               icon: 'pi pi-gift',  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Tier Review',   value: 'Evaluated every 6 months',         icon: 'pi pi-refresh',color:'text-blue-600',   bg: 'bg-blue-50' },
  ];
}
