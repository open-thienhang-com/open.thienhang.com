import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

interface Segment {
  id: string; name: string; description: string;
  criteria: string[]; memberCount: number;
  tag: string; tagColor: string; tagBg: string;
  icon: string; iconBg: string; iconColor: string;
}

@Component({
  selector: 'app-loyalty-segments',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, BadgeModule],
  templateUrl: './segments.component.html',
})
export class SegmentsComponent {
  totalCovered(): number { return this.segments.reduce((s, seg) => s + seg.memberCount, 0); }
  avgSize(): number { return this.segments.length ? Math.round(this.totalCovered() / this.segments.length) : 0; }

  segments: Segment[] = [
    { id: 'S001', name: 'High-Value Spenders', description: 'Members with lifetime spend > 10M VND', criteria: ['Lifetime spend ≥ 10,000,000 VND', 'At least 5 transactions', 'Active in last 90 days'], memberCount: 840, tag: 'Revenue', tagColor: '#15803d', tagBg: '#dcfce7', icon: 'pi pi-dollar', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { id: 'S002', name: 'At-Risk Members', description: 'Members with no activity in 60–90 days', criteria: ['No purchase in 60–90 days', 'Joined > 3 months ago', 'Has >= 1 previous order'], memberCount: 1230, tag: 'Re-engage', tagColor: '#b45309', tagBg: '#fef3c7', icon: 'pi pi-exclamation-triangle', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { id: 'S003', name: 'New Members (30d)', description: 'Members who joined within the last 30 days', criteria: ['Joined in last 30 days', 'Tier = Bronze'], memberCount: 420, tag: 'Onboarding', tagColor: '#1d4ed8', tagBg: '#dbeafe', icon: 'pi pi-user-plus', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { id: 'S004', name: 'Birthday This Month', description: 'Members celebrating a birthday this month', criteria: ['Birthday month = current month'], memberCount: 310, tag: 'Birthday', tagColor: '#be185d', tagBg: '#fce7f3', icon: 'pi pi-calendar', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
    { id: 'S005', name: 'Platinum & Gold VIPs', description: 'Top-tier loyalty members', criteria: ['Tier in [Gold, Platinum]', 'Status = active'], memberCount: 1520, tag: 'VIP', tagColor: '#6d28d9', tagBg: '#f5f3ff', icon: 'pi pi-crown', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
    { id: 'S006', name: 'Churned Members', description: 'Members with no activity over 6 months', criteria: ['No activity > 180 days', 'Account still active'], memberCount: 560, tag: 'Churn', tagColor: '#dc2626', tagBg: '#fee2e2', icon: 'pi pi-times-circle', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  ];
}
