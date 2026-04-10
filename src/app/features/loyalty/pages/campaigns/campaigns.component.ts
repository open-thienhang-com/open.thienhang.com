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

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'points_multiplier' | 'bonus_points' | 'referral' | 'birthday' | 'seasonal';
  status: 'active' | 'scheduled' | 'ended' | 'draft';
  startDate: Date;
  endDate: Date;
  pointMultiplier: number;
  bonusPoints: number;
  enrolledCount: number;
  budget: number;
  segment: string;
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, DropdownModule, DialogModule, ToastModule, BadgeModule],
  templateUrl: './campaigns.component.html',
  providers: [MessageService]
})
export class CampaignsComponent implements OnInit {
  campaigns: Campaign[] = [];
  filtered: Campaign[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  showDialog = false;
  editingCampaign: Campaign | null = null;
  dialogMode: 'create' | 'view' = 'create';

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Ended', value: 'ended' },
    { label: 'Draft', value: 'draft' },
  ];

  typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Points Multiplier', value: 'points_multiplier' },
    { label: 'Bonus Points', value: 'bonus_points' },
    { label: 'Referral', value: 'referral' },
    { label: 'Birthday', value: 'birthday' },
    { label: 'Seasonal', value: 'seasonal' },
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.campaigns = this.mock();
    this.applyFilters();
    this.loading = false;
  }

  applyFilters(): void {
    const kw = this.searchTerm.trim().toLowerCase();
    this.filtered = this.campaigns.filter(c => {
      const matchSearch = !kw || c.name.toLowerCase().includes(kw) || c.segment.toLowerCase().includes(kw);
      const matchStatus = !this.selectedStatus || c.status === this.selectedStatus;
      const matchType = !this.selectedType || c.type === this.selectedType;
      return matchSearch && matchStatus && matchType;
    });
  }

  clearFilters(): void { this.searchTerm = ''; this.selectedStatus = ''; this.selectedType = ''; this.applyFilters(); }

  openCreate(): void {
    const now = new Date();
    const end = new Date(now); end.setMonth(end.getMonth() + 1);
    this.editingCampaign = {
      id: '', name: '', description: '', type: 'points_multiplier', status: 'draft',
      startDate: now, endDate: end, pointMultiplier: 2, bonusPoints: 0, enrolledCount: 0, budget: 0, segment: 'All members'
    };
    this.dialogMode = 'create';
    this.showDialog = true;
  }

  viewCampaign(c: Campaign): void { this.editingCampaign = { ...c }; this.dialogMode = 'view'; this.showDialog = true; }

  countByStatus(s: string): number { return this.campaigns.filter(c => c.status === s).length; }
  totalEnrolled(): number { return this.campaigns.reduce((sum, c) => sum + c.enrolledCount, 0); }
  totalBudget(): number { return this.campaigns.reduce((sum, c) => sum + c.budget, 0); }

  getStatusStyle(s: string): { bg: string; color: string } {
    const map: Record<string, { bg: string; color: string }> = {
      active:    { bg: '#dcfce7', color: '#15803d' },
      scheduled: { bg: '#dbeafe', color: '#1d4ed8' },
      ended:     { bg: '#f1f5f9', color: '#64748b' },
      draft:     { bg: '#fef3c7', color: '#b45309' },
    };
    return map[s] || { bg: '#f1f5f9', color: '#64748b' };
  }

  getTypeLabel(t: string): string {
    const map: Record<string, string> = {
      points_multiplier: 'Multiplier', bonus_points: 'Bonus', referral: 'Referral', birthday: 'Birthday', seasonal: 'Seasonal'
    };
    return map[t] || t;
  }

  getTypeIcon(t: string): string {
    const map: Record<string, string> = {
      points_multiplier: 'pi pi-star', bonus_points: 'pi pi-plus-circle', referral: 'pi pi-share-alt',
      birthday: 'pi pi-calendar', seasonal: 'pi pi-sun'
    };
    return map[t] || 'pi pi-megaphone';
  }

  private mock(): Campaign[] {
    return [
      { id: 'C001', name: 'Double Points Weekend', description: 'Earn 2× points on all purchases every weekend', type: 'points_multiplier', status: 'active', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-30'), pointMultiplier: 2, bonusPoints: 0, enrolledCount: 4200, budget: 5000000, segment: 'All members' },
      { id: 'C002', name: 'Gold Member Bonus', description: '500 bonus points for Gold members spending over 500K', type: 'bonus_points', status: 'active', startDate: new Date('2026-04-10'), endDate: new Date('2026-05-10'), pointMultiplier: 1, bonusPoints: 500, enrolledCount: 1200, budget: 2000000, segment: 'Gold tier' },
      { id: 'C003', name: 'Refer a Friend', description: 'Both referrer and referred earn 200 bonus points', type: 'referral', status: 'active', startDate: new Date('2026-03-01'), endDate: new Date('2026-06-30'), pointMultiplier: 1, bonusPoints: 200, enrolledCount: 780, budget: 1500000, segment: 'Silver & above' },
      { id: 'C004', name: 'Birthday Month 3×', description: 'Triple points during members birthday month', type: 'birthday', status: 'scheduled', startDate: new Date('2026-05-01'), endDate: new Date('2026-12-31'), pointMultiplier: 3, bonusPoints: 0, enrolledCount: 0, budget: 3000000, segment: 'All members' },
      { id: 'C005', name: 'Summer Splash Sale', description: 'Earn 1.5× points on summer collection', type: 'seasonal', status: 'draft', startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31'), pointMultiplier: 1.5, bonusPoints: 0, enrolledCount: 0, budget: 4000000, segment: 'All members' },
      { id: 'C006', name: 'Tet Holiday Promo', description: 'Special Tet bonus for Platinum members', type: 'bonus_points', status: 'ended', startDate: new Date('2026-01-25'), endDate: new Date('2026-02-05'), pointMultiplier: 1, bonusPoints: 1000, enrolledCount: 320, budget: 1000000, segment: 'Platinum tier' },
    ];
  }
}
