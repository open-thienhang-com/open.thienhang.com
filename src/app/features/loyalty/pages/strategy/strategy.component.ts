import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoyaltyService } from '../../services/loyalty.service';
import { Strategy } from '../../models/loyalty.models';

@Component({
  selector: 'app-loyalty-strategy',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule],
  templateUrl: './strategy.component.html',
  providers: [MessageService],
})
export class StrategyComponent implements OnInit {
  strategies: Strategy[] = [];
  loading = false;

  tiers = [
    { tier: 'Bronze', multiplier: 1, minPoints: 0, maxPoints: 999, perks: ['Basic earn rate', 'Birthday bonus'], color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
    { tier: 'Silver', multiplier: 1.2, minPoints: 1000, maxPoints: 4999, perks: ['1.2× earn rate', 'Birthday bonus', 'Exclusive offers'], color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
    { tier: 'Gold', multiplier: 1.5, minPoints: 5000, maxPoints: 19999, perks: ['1.5× earn rate', 'Birthday bonus', 'Free shipping', 'Priority support'], color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
    { tier: 'Platinum', multiplier: 2, minPoints: 20000, maxPoints: null, perks: ['2× earn rate', 'Birthday bonus', 'Free shipping', 'Priority support', 'VIP events'], color: '#6d28d9', bg: '#f5f3ff', border: '#c4b5fd' },
  ];

  policies = [
    { label: 'Points Expiry', value: '12 months after last transaction', icon: 'pi pi-clock', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Earn Rate',     value: '1 point per 10,000 VND spent',    icon: 'pi pi-star',  color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Min Redemption',value: '500 points minimum',               icon: 'pi pi-gift',  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Tier Review',   value: 'Evaluated every 6 months',         icon: 'pi pi-refresh',color:'text-blue-600',   bg: 'bg-blue-50' },
  ];

  constructor(
    private loyaltyService: LoyaltyService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loyaltyService.listStrategies({ limit: 50 }).subscribe({
      next: (res) => {
        this.strategies = res.data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load strategies' });
        this.loading = false;
      },
    });
  }

  getTierStyle(tier: string): { color: string; bg: string; border: string } {
    const map: Record<string, { color: string; bg: string; border: string }> = {
      bronze:   { color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
      silver:   { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
      gold:     { color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
      platinum: { color: '#6d28d9', bg: '#f5f3ff', border: '#c4b5fd' },
      diamond:  { color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
    };
    return map[tier.toLowerCase()] || { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
  }

  getTypeLabel(t: string): string {
    const map: Record<string, string> = {
      points_earning: 'Points Earning', points_redemption: 'Redemption',
      tier_upgrade: 'Tier Upgrade', vip_access: 'VIP Access', custom: 'Custom',
    };
    return map[t] || t;
  }
}
