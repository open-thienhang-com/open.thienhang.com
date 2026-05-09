import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoyaltyService } from '../../services/loyalty.service';
import { LoyaltyAnalytics } from '../../models/loyalty.models';

@Component({
  selector: 'app-loyalty-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, ToastModule],
  templateUrl: './analytics.component.html',
  providers: [MessageService],
})
export class LoyaltyAnalyticsComponent implements OnInit {
  analytics: LoyaltyAnalytics | null = null;
  loading = false;
  selectedRange: '7d' | '30d' | '90d' = '30d';

  rangeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
  ];

  get kpis() {
    const a = this.analytics;
    return [
      { label: 'Program Participation Rate', value: a ? (a.participation_rate * 100).toFixed(1) + '%' : '—', sub: '', icon: 'pi pi-users',       bg: 'bg-violet-100', color: 'text-violet-600', trend: 'up' },
      { label: 'Points Redemption Rate',     value: a ? (a.redemption_rate * 100).toFixed(1) + '%' : '—',  sub: '', icon: 'pi pi-gift',        bg: 'bg-green-100',  color: 'text-green-600',  trend: 'up' },
      { label: 'Avg Points per Member',      value: a ? a.avg_points_per_member.toLocaleString() : '—',    sub: '', icon: 'pi pi-star',        bg: 'bg-yellow-100', color: 'text-yellow-600', trend: 'up' },
      { label: 'Customer Retention Rate',    value: a ? (a.retention_rate * 100).toFixed(1) + '%' : '—',   sub: '', icon: 'pi pi-heart',       bg: 'bg-pink-100',   color: 'text-pink-600',   trend: 'up' },
      { label: 'Campaign ROI',               value: a ? a.campaign_roi.toFixed(1) + '×' : '—',             sub: '', icon: 'pi pi-chart-bar',   bg: 'bg-orange-100', color: 'text-orange-600', trend: 'up' },
      { label: 'New Member Growth',          value: a ? '+' + a.new_member_growth : '—',                   sub: '', icon: 'pi pi-user-plus',   bg: 'bg-blue-100',   color: 'text-blue-600',   trend: 'up' },
      { label: 'Churn Rate',                 value: a ? (a.churn_rate * 100).toFixed(1) + '%' : '—',       sub: '', icon: 'pi pi-times-circle',bg: 'bg-red-100',    color: 'text-red-500',    trend: 'down' },
      { label: 'Avg Order Value (members)',  value: '—',                                                    sub: '', icon: 'pi pi-wallet',      bg: 'bg-teal-100',   color: 'text-teal-600',   trend: 'up' },
    ];
  }

  get tierBreakdown() {
    return this.analytics?.tier_breakdown || [];
  }

  get topCampaigns() {
    return this.analytics?.top_campaigns || [];
  }

  constructor(
    private loyaltyService: LoyaltyService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loyaltyService.getLoyaltyAnalytics(this.selectedRange).subscribe({
      next: (res) => {
        this.analytics = res.data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load analytics' });
        this.loading = false;
      },
    });
  }

  onRangeChange(): void { this.load(); }
}
