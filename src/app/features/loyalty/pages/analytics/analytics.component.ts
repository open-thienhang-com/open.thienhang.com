import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-loyalty-analytics',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './analytics.component.html',
})
export class LoyaltyAnalyticsComponent {
  kpis = [
    { label: 'Program Participation Rate', value: '68%',    sub: '+4% vs last month',   icon: 'pi pi-users',      bg: 'bg-violet-100', color: 'text-violet-600', trend: 'up' },
    { label: 'Points Redemption Rate',     value: '41%',    sub: '-2% vs last month',   icon: 'pi pi-gift',       bg: 'bg-green-100',  color: 'text-green-600',  trend: 'down' },
    { label: 'Avg Points per Member',      value: '2,340',  sub: '+120 this month',     icon: 'pi pi-star',       bg: 'bg-yellow-100', color: 'text-yellow-600', trend: 'up' },
    { label: 'Customer Retention Rate',    value: '82%',    sub: '+1.5% vs last month', icon: 'pi pi-heart',      bg: 'bg-pink-100',   color: 'text-pink-600',   trend: 'up' },
    { label: 'Campaign ROI',               value: '3.2×',   sub: 'avg across campaigns',icon: 'pi pi-chart-bar',  bg: 'bg-orange-100', color: 'text-orange-600', trend: 'up' },
    { label: 'New Member Growth',          value: '+420',   sub: 'joined this month',   icon: 'pi pi-user-plus',  bg: 'bg-blue-100',   color: 'text-blue-600',   trend: 'up' },
    { label: 'Churn Rate',                 value: '4.8%',   sub: '-0.3% vs last month', icon: 'pi pi-times-circle',bg: 'bg-red-100',   color: 'text-red-500',    trend: 'down' },
    { label: 'Avg Order Value (members)',  value: '485K',   sub: '+15K vs last period', icon: 'pi pi-wallet',     bg: 'bg-teal-100',   color: 'text-teal-600',   trend: 'up' },
  ];

  tierBreakdown = [
    { label: 'Platinum', count: 320,  pct: 3,  pts: '45,200', color: '#8b5cf6' },
    { label: 'Gold',     count: 1200, pct: 10, pts: '28,100', color: '#f59e0b' },
    { label: 'Silver',   count: 3800, pct: 30, pts: '12,400', color: '#64748b' },
    { label: 'Bronze',   count: 7160, pct: 57, pts: '2,340',  color: '#b45309' },
  ];

  topCampaigns = [
    { name: 'Double Points Weekend', enrolled: 4200, pointsIssued: 820000, roi: '4.1×', status: 'active' },
    { name: 'Gold Member Bonus',     enrolled: 1200, pointsIssued: 240000, roi: '3.5×', status: 'active' },
    { name: 'Refer a Friend',        enrolled: 780,  pointsIssued: 156000, roi: '5.2×', status: 'active' },
    { name: 'Tet Holiday Promo',     enrolled: 320,  pointsIssued: 64000,  roi: '2.8×', status: 'ended' },
  ];
}
