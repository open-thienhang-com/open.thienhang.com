import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoyaltyService } from '../../services/loyalty.service';
import { Segment } from '../../models/loyalty.models';

@Component({
  selector: 'app-loyalty-segments',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, BadgeModule, ToastModule],
  templateUrl: './segments.component.html',
  providers: [MessageService],
})
export class SegmentsComponent implements OnInit {
  segments: Segment[] = [];
  loading = false;

  constructor(
    private loyaltyService: LoyaltyService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loyaltyService.listSegments({ limit: 50 }).subscribe({
      next: (res) => {
        this.segments = res.data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load segments' });
        this.loading = false;
      },
    });
  }

  deleteSegment(s: Segment): void {
    const id = s.id;
    if (!id) return;
    this.loyaltyService.deleteSegment(id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: s.name }); this.load(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete segment' }),
    });
  }

  totalCovered(): number { return this.segments.reduce((s, seg) => s + (seg.member_count || 0), 0); }
  avgSize(): number { return this.segments.length ? Math.round(this.totalCovered() / this.segments.length) : 0; }

  getTagStyle(type: string): { color: string; bg: string } {
    const map: Record<string, { color: string; bg: string }> = {
      behavioral: { color: '#15803d', bg: '#dcfce7' },
      demographic: { color: '#1d4ed8', bg: '#dbeafe' },
      purchase: { color: '#b45309', bg: '#fef3c7' },
      engagement: { color: '#6d28d9', bg: '#f5f3ff' },
      custom: { color: '#475569', bg: '#f1f5f9' },
    };
    return map[type] || { color: '#475569', bg: '#f1f5f9' };
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      behavioral: 'pi pi-chart-line', demographic: 'pi pi-users',
      purchase: 'pi pi-shopping-cart', engagement: 'pi pi-heart', custom: 'pi pi-filter',
    };
    return map[type] || 'pi pi-filter';
  }
}
