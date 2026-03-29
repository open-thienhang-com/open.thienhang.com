import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InventoryService, AnalyticsService } from '../../services/inventory.service';
import { AnalyticsData } from '../../models/inventory.models';

@Component({
  selector: 'app-inventory-analytics',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  analyticsData: AnalyticsData | null = null;
  loading = true;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getInventoryAnalytics().subscribe({
      next: (resp) => {
        this.analyticsData = resp.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
