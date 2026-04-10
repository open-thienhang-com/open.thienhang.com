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

interface MemberRow {
  id: string;
  fullName: string;
  customerId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  joinedAt: Date | null;
  status: 'active' | 'inactive';
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-loyalty-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, DropdownModule, InputTextModule, BadgeModule, ToastModule, DialogModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
  providers: [MessageService]
})
export class MembersComponent implements OnInit {
  members: MemberRow[] = [];
  filtered: MemberRow[] = [];
  loading = false;

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

  selectedMember: MemberRow | null = null;
  showDetail = false;

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    // Seed mock data while real API is wired
    this.members = this.mockMembers();
    this.applyFilters();
    this.loading = false;
  }

  applyFilters(): void {
    const kw = this.searchTerm.trim().toLowerCase();
    this.filtered = this.members.filter(m => {
      const matchSearch = !kw || m.fullName.toLowerCase().includes(kw) || m.customerId.toLowerCase().includes(kw) || (m.email || '').toLowerCase().includes(kw);
      const matchTier = !this.selectedTier || m.tier === this.selectedTier;
      const matchStatus = !this.selectedStatus || m.status === this.selectedStatus;
      return matchSearch && matchTier && matchStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTier = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  openDetail(m: MemberRow): void {
    this.selectedMember = m;
    this.showDetail = true;
  }

  countByTier(tier: string): number {
    return this.members.filter(m => m.tier === tier).length;
  }

  countActive(): number {
    return this.members.filter(m => m.status === 'active').length;
  }

  totalPoints(): number {
    return this.members.reduce((s, m) => s + m.points, 0);
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

  private mockMembers(): MemberRow[] {
    const tiers: MemberRow['tier'][] = ['bronze', 'silver', 'gold', 'platinum'];
    const names = [
      'Nguyen Van An', 'Tran Thi Bich', 'Le Van Cuong', 'Pham Thi Dung', 'Hoang Van Em',
      'Vo Thi Phuong', 'Dang Van Giang', 'Bui Thi Hoa', 'Do Van Hung', 'Ngo Thi Kim',
      'Nguyen Thi Lan', 'Tran Van Minh', 'Le Thi Ngoc', 'Pham Van Oanh', 'Hoang Thi Phuong',
      'Vo Van Quang', 'Dang Thi Rung', 'Bui Van Son', 'Do Thi Tam', 'Ngo Van Uyen',
    ];
    return names.map((n, i) => ({
      id: `M${String(i + 1).padStart(4, '0')}`,
      fullName: n,
      customerId: `CUS${String(1000 + i)}`,
      tier: tiers[i % 4],
      points: Math.floor(Math.random() * 15000) + 500,
      joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000 * 2),
      status: i % 5 === 0 ? 'inactive' : 'active',
      email: `${n.toLowerCase().replace(/\s/g, '.')}@example.com`,
      phone: `09${String(Math.floor(10000000 + Math.random() * 89999999))}`,
    }));
  }
}
