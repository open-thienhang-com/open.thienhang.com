import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { LoyaltyService } from '../../services/loyalty.service';
import { Member } from '../../models/loyalty.models';

@Component({
  selector: 'app-loyalty-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, DropdownModule, InputTextModule, BadgeModule, ToastModule, DialogModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
  providers: [MessageService]
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  loading = false;
  total = 0;
  page = 1;
  pageSize = 20;

  searchTerm = '';
  selectedTier = '';
  selectedStatus = '';

  tierOptions = [
    { label: 'All Tiers', value: '' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'Gold', value: 'gold' },
    { label: 'Silver', value: 'silver' },
    { label: 'Bronze', value: 'bronze' },
  ];

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  selectedMember: Member | null = null;
  showDetail = false;
  pointsHistory: any[] = [];
  loadingHistory = false;

  get filtered(): Member[] {
    return this.members.filter(m => {
      if (this.searchTerm) {
        const q = this.searchTerm.toLowerCase();
        if (!m.full_name.toLowerCase().includes(q) &&
            !(m.member_id && m.member_id.toLowerCase().includes(q)) &&
            !(m.email && m.email.toLowerCase().includes(q))) return false;
      }
      if (this.selectedTier && m.tier !== this.selectedTier) return false;
      if (this.selectedStatus && m.status !== this.selectedStatus) return false;
      return true;
    });
  }

  constructor(
    private loyaltyService: LoyaltyService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    this.loyaltyService.listMembers({
      search: this.searchTerm || undefined,
      tier: this.selectedTier || undefined,
      status: this.selectedStatus || undefined,
      skip: (this.page - 1) * this.pageSize,
      limit: this.pageSize,
    }).subscribe({
      next: (res) => {
        this.members = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load members' });
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadMembers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTier = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  openDetail(m: Member): void {
    this.selectedMember = m;
    this.showDetail = true;
    this.loadPointsHistory(m.id || m._id || '');
  }

  loadPointsHistory(memberId: string): void {
    if (!memberId) return;
    this.loadingHistory = true;
    this.loyaltyService.getPointsHistory(memberId).subscribe({
      next: (res) => {
        this.pointsHistory = res.data;
        this.loadingHistory = false;
      },
      error: () => { this.loadingHistory = false; },
    });
  }

  deleteMember(m: Member): void {
    const id = m.id || m._id;
    if (!id) return;
    this.loyaltyService.deleteMember(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${m.full_name} removed` });
        this.loadMembers();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete member' });
      },
    });
  }

  countByTier(tier: string): number {
    return this.members.filter(m => m.tier === tier).length;
  }

  countActive(): number {
    return this.members.filter(m => m.status === 'active').length;
  }

  totalPoints(): number {
    return this.members.reduce((s, m) => s + m.points_balance, 0);
  }

  getTierLabel(tier: string): string {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  getTierBadge(tier: string): { bg: string; color: string; border: string } {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      platinum: { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd' },
      gold:     { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
      silver:   { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
      bronze:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    };
    return map[tier] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  }

  getInitials(name: string): string {
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  getAvatarBg(tier: string): string {
    const m: Record<string, string> = { platinum: '#8b5cf6', gold: '#f59e0b', silver: '#64748b', bronze: '#b45309' };
    return m[tier] || '#6366f1';
  }
}
