import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

interface AutoRule {
  id: string; name: string; trigger: string; action: string;
  status: 'active' | 'paused' | 'draft';
  firedCount: number; lastFired: Date | null;
  icon: string; color: string; bg: string;
}

@Component({
  selector: 'app-loyalty-automation',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './automation.component.html',
})
export class AutomationComponent {
  rules: AutoRule[] = [
    { id: 'A001', name: 'Welcome Bonus',         trigger: 'Member joins the loyalty program',          action: 'Grant 100 bonus points',                   status: 'active', firedCount: 412,  lastFired: new Date('2026-04-09'), icon: 'pi pi-user-plus',    color: '#1d4ed8', bg: '#dbeafe' },
    { id: 'A002', name: 'Birthday Reward',        trigger: 'Member birthday month starts',              action: 'Grant 3× multiplier for 30 days + 200 pts', status: 'active', firedCount: 310,  lastFired: new Date('2026-04-01'), icon: 'pi pi-calendar',     color: '#be185d', bg: '#fce7f3' },
    { id: 'A003', name: 'Tier Upgrade Alert',     trigger: 'Member crosses tier threshold',             action: 'Send push notification + email congratulation', status: 'active', firedCount: 87, lastFired: new Date('2026-04-08'), icon: 'pi pi-arrow-up',     color: '#15803d', bg: '#dcfce7' },
    { id: 'A004', name: 'Inactivity Re-engage',   trigger: 'No activity for 60 days',                  action: 'Send email with 50 bonus points offer',     status: 'active', firedCount: 234,  lastFired: new Date('2026-04-07'), icon: 'pi pi-bell',         color: '#b45309', bg: '#fef3c7' },
    { id: 'A005', name: 'Points Expiry Warning',  trigger: '30 days before points expiration',         action: 'Send SMS + email reminder',                 status: 'active', firedCount: 150,  lastFired: new Date('2026-04-06'), icon: 'pi pi-clock',        color: '#7c3aed', bg: '#f5f3ff' },
    { id: 'A006', name: 'High Spend Milestone',   trigger: 'Single order > 2,000,000 VND',             action: 'Grant 500 bonus points + VIP tag',          status: 'paused', firedCount: 55,   lastFired: new Date('2026-03-28'), icon: 'pi pi-star',         color: '#f59e0b', bg: '#fffbeb' },
    { id: 'A007', name: 'Referral Success',       trigger: 'Referred friend makes first purchase',     action: 'Grant 200 pts to referrer + 100 pts to friend', status: 'active', firedCount: 92, lastFired: new Date('2026-04-05'), icon: 'pi pi-share-alt',    color: '#0284c7', bg: '#e0f2fe' },
    { id: 'A008', name: 'Winback Campaign',       trigger: 'No activity > 6 months',                  action: 'Trigger winback campaign enrollment',       status: 'draft',  firedCount: 0,    lastFired: null,                  icon: 'pi pi-refresh',      color: '#dc2626', bg: '#fee2e2' },
  ];

  getStatusStyle(s: string): { bg: string; color: string } {
    const m: Record<string, { bg: string; color: string }> = {
      active: { bg: '#dcfce7', color: '#15803d' },
      paused: { bg: '#fef3c7', color: '#b45309' },
      draft:  { bg: '#f1f5f9', color: '#64748b' },
    };
    return m[s] || { bg: '#f1f5f9', color: '#64748b' };
  }

  countByStatus(s: string): number { return this.rules.filter(r => r.status === s).length; }
  totalFired(): number { return this.rules.reduce((sum, r) => sum + r.firedCount, 0); }
}
