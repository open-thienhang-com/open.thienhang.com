import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TravelService } from '../../services/travel.service';
import { PageHeaderComponent } from '../../../retail-planning/components/page-header/page-header.component';

@Component({
  selector: 'app-travel-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ChartModule,
    PageHeaderComponent
  ],
  template: `
    <div class="analytics-page p-8">
      <app-page-header
        title="Travel Analytics"
        subtitle="Insights and trends across your travel stories"
        icon="pi pi-chart-bar">
      </app-page-header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="stat-card blur-effect">
          <div class="label">Total Stories</div>
          <div class="value">{{ stats()?.total_posts || 0 }}</div>
          <div class="trend up"><i class="pi pi-arrow-up"></i> 12% vs last month</div>
        </div>
        <div class="stat-card blur-effect">
          <div class="label">Total Reads</div>
          <div class="value">{{ stats()?.total_views || 0 | number }}</div>
          <div class="trend up"><i class="pi pi-arrow-up"></i> 24% vs last month</div>
        </div>
        <div class="stat-card blur-effect">
          <div class="label">Engagement Rate</div>
          <div class="value">{{ 8.4 }}%</div>
          <div class="trend down"><i class="pi pi-arrow-down"></i> 2% vs last month</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <p-card header="Views over Time" styleClass="glass-card">
           <p-chart type="line" [data]="chartData" [options]="chartOptions"></p-chart>
        </p-card>

        <div class="flex flex-col gap-6">
           <h3 class="text-xl font-bold">Top Destinations</h3>
           <div *ngFor="let item of stats()?.top_categories" class="dest-row blur-effect">
              <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                    {{ item.category[0] }}
                 </div>
                 <span class="font-bold capitalize">{{ item.category }}</span>
              </div>
              <span class="font-mono text-gray-500">{{ item.count }} stories</span>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page { background: #f8fafc; min-height: 100vh; }
    .blur-effect {
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 1rem;
      padding: 1.5rem;
    }
    .stat-card .label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
    .stat-card .value { font-size: 2rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; }
    .stat-card .trend { font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem; }
    .stat-card .trend.up { color: #10b981; }
    .stat-card .trend.down { color: #f43f5e; }
    
    .dest-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; }
    ::ng-deep .glass-card { 
      background: rgba(255,255,255,0.7) !important; 
      backdrop-filter: blur(10px); 
      border: 1px solid rgba(255,255,255,0.3) !important;
      border-radius: 1rem !important; 
    }
  `]
})
export class TravelAnalyticsDashboardComponent implements OnInit {
  private travelService = inject(TravelService);
  stats = this.travelService.analytics;

  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.travelService.getAnalytics().subscribe();
    this.initChart();
  }

  initChart() {
    this.chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Views',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: true,
          borderColor: '#3b82f6',
          tension: 0.4,
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, grid: { display: false } },
        x: { grid: { display: false } }
      }
    };
  }
}
