import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { LoyaltyService } from '../../services/loyalty.service';
import { Campaign, CampaignCreate } from '../../models/loyalty.models';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, DropdownModule, DialogModule, ToastModule, BadgeModule],
  templateUrl: './campaigns.component.html',
  providers: [MessageService]
})
export class CampaignsComponent implements OnInit {
  campaigns: Campaign[] = [];
  loading = false;
  total = 0;
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  showDialog = false;
  editingCampaign: Partial<Campaign & CampaignCreate> | null = null;
  dialogMode: 'create' | 'view' = 'create';

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Completed', value: 'completed' },
    { label: 'Draft', value: 'draft' },
    { label: 'Paused', value: 'paused' },
  ];

  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Welcome', value: 'welcome' },
    { label: 'Birthday', value: 'birthday' },
    { label: 'Purchase', value: 'purchase' },
    { label: 'Referral', value: 'referral' },
    { label: 'Retention', value: 'retention' },
    { label: 'Seasonal', value: 'seasonal' },
    { label: 'Promotion', value: 'promotion' },
  ];

  constructor(
    private loyaltyService: LoyaltyService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loyaltyService.listCampaigns({
      search: this.searchTerm || undefined,
      status: this.selectedStatus || undefined,
      campaign_type: this.selectedType || undefined,
    }).subscribe({
      next: (res) => {
        this.campaigns = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load campaigns' });
        this.loading = false;
      },
    });
  }

  applyFilters(): void { this.load(); }
  clearFilters(): void { this.searchTerm = ''; this.selectedStatus = ''; this.selectedType = ''; this.load(); }

  openCreate(): void {
    this.editingCampaign = {
      name: '', description: '', campaign_type: 'promotion', status: 'draft',
      start_date: new Date().toISOString(), channels: ['email'],
    };
    this.dialogMode = 'create';
    this.showDialog = true;
  }

  viewCampaign(c: Campaign): void { this.editingCampaign = { ...c }; this.dialogMode = 'view'; this.showDialog = true; }

  saveCampaign(): void {
    if (!this.editingCampaign) return;
    const id = (this.editingCampaign as Campaign).id;
    if (this.dialogMode === 'create' || !id) {
      this.loyaltyService.createCampaign(this.editingCampaign as CampaignCreate).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Campaign created' }); this.showDialog = false; this.load(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create campaign' }),
      });
    }
  }

  activateCampaign(c: Campaign): void {
    if (!c.id) return;
    this.loyaltyService.activateCampaign(c.id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Activated', detail: c.name }); this.load(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate' }),
    });
  }

  pauseCampaign(c: Campaign): void {
    if (!c.id) return;
    this.loyaltyService.pauseCampaign(c.id).subscribe({
      next: () => { this.messageService.add({ severity: 'info', summary: 'Paused', detail: c.name }); this.load(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to pause' }),
    });
  }

  completeCampaign(c: Campaign): void {
    if (!c.id) return;
    this.loyaltyService.completeCampaign(c.id).subscribe({
      next: () => { this.messageService.add({ severity: 'info', summary: 'Completed', detail: c.name }); this.load(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to complete' }),
    });
  }

  deleteCampaign(c: Campaign): void {
    if (!c.id) return;
    this.loyaltyService.deleteCampaign(c.id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: c.name }); this.load(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete' }),
    });
  }

  get filtered(): Campaign[] {
    return this.campaigns.filter(c => {
      if (this.searchTerm && !c.name.toLowerCase().includes(this.searchTerm.toLowerCase())) return false;
      if (this.selectedStatus && c.status !== this.selectedStatus) return false;
      if (this.selectedType && c.campaign_type !== this.selectedType) return false;
      return true;
    });
  }

  totalBudget(): number { return this.campaigns.reduce((sum, c) => sum + ((c as any).budget || 0), 0); }
  countByStatus(s: string): number { return this.campaigns.filter(c => c.status === s).length; }
  totalEnrolled(): number { return this.campaigns.reduce((sum, c) => sum + (c.stats?.['total_recipients'] || 0), 0); }

  getStatusStyle(s: string): { bg: string; color: string } {
    const map: Record<string, { bg: string; color: string }> = {
      active:    { bg: '#dcfce7', color: '#15803d' },
      scheduled: { bg: '#dbeafe', color: '#1d4ed8' },
      completed: { bg: '#f1f5f9', color: '#64748b' },
      draft:     { bg: '#fef3c7', color: '#b45309' },
      paused:    { bg: '#fef9c3', color: '#a16207' },
      cancelled: { bg: '#fee2e2', color: '#dc2626' },
    };
    return map[s] || { bg: '#f1f5f9', color: '#64748b' };
  }

  getTypeLabel(t: string): string {
    const map: Record<string, string> = {
      purchase: 'Purchase', referral: 'Referral', birthday: 'Birthday',
      seasonal: 'Seasonal', welcome: 'Welcome', retention: 'Retention', promotion: 'Promotion',
    };
    return map[t] || t;
  }

  getTypeIcon(t: string): string {
    const map: Record<string, string> = {
      purchase: 'pi pi-shopping-cart', referral: 'pi pi-share-alt', birthday: 'pi pi-calendar',
      seasonal: 'pi pi-sun', welcome: 'pi pi-user-plus', retention: 'pi pi-heart', promotion: 'pi pi-megaphone',
    };
    return map[t] || 'pi pi-megaphone';
  }
}
