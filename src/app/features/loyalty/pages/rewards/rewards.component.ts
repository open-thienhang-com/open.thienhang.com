import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoyaltyService } from '../../services/loyalty.service';
import { Reward, RewardCreate } from '../../models/loyalty.models';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, DropdownModule, DialogModule, ToastModule],
  templateUrl: './rewards.component.html',
  providers: [MessageService]
})
export class RewardsComponent implements OnInit {
  rewards: Reward[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';

  showDialog = false;
  editingReward: Partial<Reward & RewardCreate> | null = null;
  dialogMode: 'create' | 'view' = 'create';

  categoryOptions = [{ label: 'All Categories', value: '' }];

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  constructor(
    private loyaltyService: LoyaltyService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loyaltyService.listRewards({
      search: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe({
      next: (res) => {
        this.rewards = res.data;
        const cats = [...new Set(this.rewards.map(r => r.category).filter(Boolean))];
        this.categoryOptions = [{ label: 'All Categories', value: '' }, ...cats.map(c => ({ label: c, value: c }))];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load rewards' });
        this.loading = false;
      },
    });
  }

  applyFilters(): void { this.load(); }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.load();
  }

  openCreate(): void {
    this.editingReward = { name: '', description: '', category: 'general', points_required: 0, reward_type: 'discount' };
    this.dialogMode = 'create';
    this.showDialog = true;
  }

  viewReward(r: Reward): void {
    this.editingReward = { ...r };
    this.dialogMode = 'view';
    this.showDialog = true;
  }

  saveReward(): void {
    if (!this.editingReward) return;
    const id = (this.editingReward as Reward).id || (this.editingReward as Reward)._id;
    if (this.dialogMode === 'create' || !id) {
      this.loyaltyService.createReward(this.editingReward as RewardCreate).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Reward created' });
          this.showDialog = false;
          this.load();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create reward' }),
      });
    } else {
      this.loyaltyService.updateReward(id, this.editingReward).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Reward updated' });
          this.showDialog = false;
          this.load();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update reward' }),
      });
    }
  }

  deleteReward(r: Reward): void {
    const id = r.id || r._id;
    if (!id) return;
    this.loyaltyService.deleteReward(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${r.name} removed` });
        this.load();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete reward' }),
    });
  }

  countActive(): number { return this.rewards.filter(r => r.status === 'active').length; }
  totalRedeemed(): number { return this.rewards.reduce((s, r) => s + (r.redemptions_count || 0), 0); }
  totalStock(): number { return this.rewards.reduce((s, r) => s + (r.remaining_quantity || 0), 0); }

  getIcon(rewardType: string): string {
    const m: Record<string, string> = {
      discount: 'pi pi-tag', coupon: 'pi pi-ticket', free_product: 'pi pi-shopping-bag',
      free_shipping: 'pi pi-truck', points: 'pi pi-star', gift_card: 'pi pi-wallet', experience: 'pi pi-video',
    };
    return m[rewardType] || 'pi pi-gift';
  }
}
