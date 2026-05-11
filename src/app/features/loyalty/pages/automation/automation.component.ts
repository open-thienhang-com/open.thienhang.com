import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoyaltyService } from '../../services/loyalty.service';
import { AutomationRule } from '../../models/loyalty.models';

@Component({
  selector: 'app-loyalty-automation',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule],
  templateUrl: './automation.component.html',
  providers: [MessageService],
})
export class AutomationComponent implements OnInit {
  rules: AutomationRule[] = [];
  loading = false;

  constructor(
    private loyaltyService: LoyaltyService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loyaltyService.listAutomationRules({ limit: 50 }).subscribe({
      next: (res) => {
        this.rules = res.data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load automation rules' });
        this.loading = false;
      },
    });
  }

  activateRule(r: AutomationRule): void {
    const id = r.id;
    if (!id) return;
    this.loyaltyService.activateAutomationRule(id).subscribe({
      next: (res) => {
        r.status = 'active';
        this.messageService.add({ severity: 'success', summary: 'Activated', detail: r.name });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate rule' }),
    });
  }

  pauseRule(r: AutomationRule): void {
    const id = r.id;
    if (!id) return;
    this.loyaltyService.pauseAutomationRule(id).subscribe({
      next: () => {
        r.status = 'paused';
        this.messageService.add({ severity: 'info', summary: 'Paused', detail: r.name });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to pause rule' }),
    });
  }

  deleteRule(r: AutomationRule): void {
    const id = r.id;
    if (!id) return;
    this.loyaltyService.deleteAutomationRule(id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: r.name }); this.load(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete rule' }),
    });
  }

  getStatusStyle(s: string): { bg: string; color: string } {
    const m: Record<string, { bg: string; color: string }> = {
      active: { bg: '#dcfce7', color: '#15803d' },
      paused: { bg: '#fef3c7', color: '#b45309' },
      draft:  { bg: '#f1f5f9', color: '#64748b' },
    };
    return m[s] || { bg: '#f1f5f9', color: '#64748b' };
  }

  getTriggerLabel(t: string): string {
    const map: Record<string, string> = {
      member_join: 'Member joins the loyalty program',
      birthday: 'Member birthday month starts',
      tier_upgrade: 'Member crosses tier threshold',
      inactivity_60d: 'No activity for 60 days',
      inactivity_180d: 'No activity for 6 months',
      points_expiry_warning: '30 days before points expiration',
      high_spend: 'Single order exceeds threshold',
      referral_success: 'Referred friend makes first purchase',
    };
    return map[t] || t;
  }

  getActionLabel(a: string): string {
    const map: Record<string, string> = {
      grant_points: 'Grant bonus points',
      send_notification: 'Send notification',
      apply_multiplier: 'Apply points multiplier',
      enroll_campaign: 'Enroll in campaign',
      assign_tag: 'Assign member tag',
    };
    return map[a] || a;
  }

  getIcon(t: string): string {
    const map: Record<string, string> = {
      member_join: 'pi pi-user-plus', birthday: 'pi pi-calendar', tier_upgrade: 'pi pi-arrow-up',
      inactivity_60d: 'pi pi-bell', inactivity_180d: 'pi pi-refresh', points_expiry_warning: 'pi pi-clock',
      high_spend: 'pi pi-star', referral_success: 'pi pi-share-alt',
    };
    return map[t] || 'pi pi-bolt';
  }

  countByStatus(s: string): number { return this.rules.filter(r => r.status === s).length; }
  totalFired(): number { return this.rules.reduce((sum, r) => sum + (r.fired_count || 0), 0); }
}
