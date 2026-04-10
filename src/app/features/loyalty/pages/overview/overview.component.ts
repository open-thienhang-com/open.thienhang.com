import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-loyalty-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class LoyaltyOverviewComponent {
  stats = [
    { label: 'Total Members', value: '12,480', sub: '+3.2% this month', icon: 'pi pi-users', bg: 'bg-violet-100', color: 'text-violet-600' },
    { label: 'Active Campaigns', value: '8', sub: '3 ending this week', icon: 'pi pi-megaphone', bg: 'bg-orange-100', color: 'text-orange-600' },
    { label: 'Points Issued', value: '4.5M', sub: 'all time', icon: 'pi pi-star', bg: 'bg-yellow-100', color: 'text-yellow-600' },
    { label: 'Redemptions', value: '1,840', sub: 'this quarter', icon: 'pi pi-gift', bg: 'bg-green-100', color: 'text-green-600' },
  ];

  tiers = [
    { label: 'Platinum', count: 320, pct: 3, color: '#a855f7', bg: '#f5f3ff' },
    { label: 'Gold',     count: 1200, pct: 10, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Silver',   count: 3800, pct: 30, color: '#64748b', bg: '#f1f5f9' },
    { label: 'Bronze',   count: 7160, pct: 57, color: '#b45309', bg: '#fef3c7' },
  ];

  quickLinks = [
    { label: 'Members', desc: 'Browse and manage loyalty members', icon: 'pi pi-users', color: 'text-violet-600', bg: 'bg-violet-50', url: '/loyalty/members' },
    { label: 'Rewards Catalog', desc: 'Define and publish reward items', icon: 'pi pi-gift', color: 'text-green-600', bg: 'bg-green-50', url: '/loyalty/rewards' },
    { label: 'Campaigns', desc: 'Launch point-multiplier campaigns', icon: 'pi pi-megaphone', color: 'text-orange-600', bg: 'bg-orange-50', url: '/loyalty/campaigns' },
    { label: 'Segments', desc: 'Target audiences by behavior', icon: 'pi pi-filter', color: 'text-blue-600', bg: 'bg-blue-50', url: '/loyalty/segments' },
    { label: 'Automation', desc: 'Trigger rules and drip flows', icon: 'pi pi-bolt', color: 'text-indigo-600', bg: 'bg-indigo-50', url: '/loyalty/automation' },
    { label: 'Analytics', desc: 'Loyalty KPIs and cohort reports', icon: 'pi pi-chart-bar', color: 'text-pink-600', bg: 'bg-pink-50', url: '/loyalty/analytics' },
  ];

  recentActivity = [
    { event: 'Gold tier upgrade', member: 'Nguyen Van A', time: '5m ago', icon: 'pi pi-arrow-up', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { event: 'Points redeemed', member: 'Tran Thi B', time: '22m ago', icon: 'pi pi-gift', color: 'text-green-600', bg: 'bg-green-50' },
    { event: 'Campaign enrolled', member: 'Le Van C', time: '1h ago', icon: 'pi pi-megaphone', color: 'text-orange-600', bg: 'bg-orange-50' },
    { event: 'New member joined', member: 'Pham Thi D', time: '3h ago', icon: 'pi pi-user-plus', color: 'text-violet-600', bg: 'bg-violet-50' },
    { event: 'Reward claimed', member: 'Hoang Van E', time: '5h ago', icon: 'pi pi-check-circle', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];
}
