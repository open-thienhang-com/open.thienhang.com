import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  pointsRequired: number;
  stockQuantity: number;
  totalRedeemed: number;
  isActive: boolean;
  icon: string;
  gradient: string;
}

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, DialogModule, ToastModule],
  templateUrl: './rewards.component.html',
  providers: [MessageService]
})
export class RewardsComponent implements OnInit {
  rewards: Reward[] = [];
  filtered: Reward[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  showDialog = false;
  editingReward: Reward | null = null;
  dialogMode: 'create' | 'view' = 'create';

  categoryOptions = [{ label: 'All Categories', value: '' }];

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.rewards = this.mock();
    const cats = [...new Set(this.rewards.map(r => r.category))];
    this.categoryOptions = [{ label: 'All Categories', value: '' }, ...cats.map(c => ({ label: c, value: c }))];
    this.applyFilters();
    this.loading = false;
  }

  applyFilters(): void {
    const kw = this.searchTerm.trim().toLowerCase();
    this.filtered = this.rewards.filter(r => {
      const matchSearch = !kw || r.name.toLowerCase().includes(kw) || r.description.toLowerCase().includes(kw);
      const matchCat = !this.selectedCategory || r.category === this.selectedCategory;
      const matchStatus = !this.selectedStatus || (this.selectedStatus === 'active' ? r.isActive : !r.isActive);
      return matchSearch && matchCat && matchStatus;
    });
  }

  clearFilters(): void { this.searchTerm = ''; this.selectedCategory = ''; this.selectedStatus = ''; this.applyFilters(); }

  openCreate(): void {
    this.editingReward = { id: '', name: '', description: '', category: '', pointsRequired: 0, stockQuantity: 0, totalRedeemed: 0, isActive: true, icon: 'pi pi-gift', gradient: 'from-violet-500 to-indigo-600' };
    this.dialogMode = 'create';
    this.showDialog = true;
  }

  viewReward(r: Reward): void { this.editingReward = { ...r }; this.dialogMode = 'view'; this.showDialog = true; }

  countActive(): number { return this.rewards.filter(r => r.isActive).length; }
  totalRedeemed(): number { return this.rewards.reduce((s, r) => s + r.totalRedeemed, 0); }
  totalStock(): number { return this.rewards.reduce((s, r) => s + r.stockQuantity, 0); }

  private mock(): Reward[] {
    return [
      { id: 'R001', name: 'Free Coffee', description: 'Redeem for one free coffee at partner stores', category: 'Food & Beverage', pointsRequired: 500, stockQuantity: 200, totalRedeemed: 1420, isActive: true, icon: 'pi pi-star-fill', gradient: 'from-amber-500 to-orange-500' },
      { id: 'R002', name: '10% Discount Voucher', description: 'Receive 10% off your next purchase', category: 'Vouchers', pointsRequired: 1000, stockQuantity: 500, totalRedeemed: 3200, isActive: true, icon: 'pi pi-tag', gradient: 'from-blue-500 to-indigo-600' },
      { id: 'R003', name: 'Tote Bag', description: 'Branded eco-friendly tote bag', category: 'Merchandise', pointsRequired: 2000, stockQuantity: 80, totalRedeemed: 320, isActive: true, icon: 'pi pi-shopping-bag', gradient: 'from-green-500 to-teal-600' },
      { id: 'R004', name: 'Premium Membership 1 Month', description: 'Upgrade to premium tier for one month', category: 'Membership', pointsRequired: 5000, stockQuantity: 999, totalRedeemed: 145, isActive: true, icon: 'pi pi-crown', gradient: 'from-violet-500 to-purple-600' },
      { id: 'R005', name: 'Movie Ticket', description: '2 tickets to any partner cinema', category: 'Entertainment', pointsRequired: 3000, stockQuantity: 50, totalRedeemed: 89, isActive: true, icon: 'pi pi-video', gradient: 'from-pink-500 to-rose-600' },
      { id: 'R006', name: '50K Cash Voucher', description: 'Cash equivalent voucher redeemable in-store', category: 'Vouchers', pointsRequired: 4500, stockQuantity: 300, totalRedeemed: 210, isActive: false, icon: 'pi pi-wallet', gradient: 'from-slate-500 to-slate-700' },
    ];
  }
}
