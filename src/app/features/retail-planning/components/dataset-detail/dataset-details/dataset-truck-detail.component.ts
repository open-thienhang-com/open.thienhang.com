import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from '../../../services/dataset.service';
import { DatasetDetailBaseComponent } from './dataset-detail-base.component';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface TruckData {
  'Bưu cục'?: string;
  'Loại xe'?: string;
  'Nhà cung cấp'?: string;
  'Tổng xe'?: number;
  'Trung bình quảng đường'?: number;
  'Trung bình thời gian'?: number;
  'Vận tốc trung bình'?: number;
  warehouse_id?: string;
}

@Component({
  selector: 'app-dataset-truck-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-red-800 font-medium">Lỗi tải dữ liệu</h3>
            <p class="text-red-600 text-sm mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!loading && !error">
        <!-- Truck Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Tổng Nhóm Xe</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getTruckStats().totalGroups }}</div>
          <div class="text-xs opacity-75 mt-1">nhóm xe</div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Tổng Xe</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getTruckStats().totalTrucks | number }}</div>
          <div class="text-xs opacity-75 mt-1">xe</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">TB Quảng Đường</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getTruckStats().avgDistance | number:'1.1-1' }}</div>
          <div class="text-xs opacity-75 mt-1">km</div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">TB Vận Tốc</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getTruckStats().avgSpeed | number:'1.1-1' }}</div>
          <div class="text-xs opacity-75 mt-1">km/h</div>
        </div>
      </div>

      <!-- Truck Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white border border-blue-200 rounded-lg shadow-sm p-5">
          <h5 class="text-sm font-semibold text-blue-600 mb-3">Phân bổ theo Loại Xe</h5>
          <canvas #truckTypeCanvas height="250"></canvas>
        </div>
        <div class="bg-white border border-blue-200 rounded-lg shadow-sm p-5">
          <h5 class="text-sm font-semibold text-blue-600 mb-3">Phân bổ theo Nhà Cung Cấp</h5>
          <canvas #truckSupplierCanvas height="250"></canvas>
        </div>
      </div>

      <!-- Truck Data Table -->
      <div class="bg-white border border-blue-200 rounded-lg shadow-sm">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900">Dữ liệu Truck</h4>
            <span class="text-xs text-gray-600">{{ dataset?.data?.length || 0 }} nhóm xe</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th *ngFor="let key of getDataKeys(dataset?.data?.[0])" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let row of dataset?.data; let i = index" [ngClass]="i % 2 === 0 ? 'bg-white' : 'bg-orange-50/30'">
                <td *ngFor="let key of getDataKeys(row)" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCellValue(row[key], key) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  `,

  styles: []
})
export class DatasetTruckDetailComponent extends DatasetDetailBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('truckTypeCanvas') truckTypeCanvas?: ElementRef;
  @ViewChild('truckSupplierCanvas') truckSupplierCanvas?: ElementRef;

  truckTypeChart: Chart | null = null;
  truckSupplierChart: Chart | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    location: Location,
    route: ActivatedRoute,
    datasetService: DatasetService
  ) {
    super(location, route, datasetService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    if (isPlatformBrowser(this.platformId) && this.dataset?.data && this.dataset.data.length > 0) {
      setTimeout(() => this.initializeTruckCharts(), 100);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.dataset?.data && this.dataset.data.length > 0) {
      setTimeout(() => this.initializeTruckCharts(), 100);
    }
  }

  override ngOnDestroy(): void {
    this.cleanupCharts();
    super.ngOnDestroy();
  }


  private cleanupCharts(): void {
    if (this.truckTypeChart) {
      this.truckTypeChart.destroy();
      this.truckTypeChart = null;
    }
    if (this.truckSupplierChart) {
      this.truckSupplierChart.destroy();
      this.truckSupplierChart = null;
    }
  }

  private initializeTruckCharts(): void {
    if (!this.dataset?.data) return;

    this.initializeTruckTypeChart();
    this.initializeTruckSupplierChart();
  }

  private initializeTruckTypeChart(): void {
    if (!this.truckTypeCanvas?.nativeElement) return;

    const ctx = this.truckTypeCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.dataset!.data as TruckData[];
    const typeStats = this.getTruckTypeStats();

    this.truckTypeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(typeStats),
        datasets: [{
          data: Object.values(typeStats),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  private initializeTruckSupplierChart(): void {
    if (!this.truckSupplierCanvas?.nativeElement) return;

    const ctx = this.truckSupplierCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.dataset!.data as TruckData[];
    const supplierStats = this.getTruckSupplierStats();

    this.truckSupplierChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(supplierStats),
        datasets: [{
          label: 'Số xe',
          data: Object.values(supplierStats),
          backgroundColor: '#3B82F6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString('vi-VN')
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  private getTruckTypeStats(): { [key: string]: number } {
    if (!this.dataset?.data) return {};

    const data = this.dataset.data as TruckData[];
    const stats: { [key: string]: number } = {};

    data.forEach(item => {
      const type = item['Loại xe'] || 'Unknown';
      stats[type] = (stats[type] || 0) + (item['Tổng xe'] || 0);
    });

    return stats;
  }

  private getTruckSupplierStats(): { [key: string]: number } {
    if (!this.dataset?.data) return {};

    const data = this.dataset.data as TruckData[];
    const stats: { [key: string]: number } = {};

    data.forEach(item => {
      const supplier = item['Nhà cung cấp'] || 'Unknown';
      stats[supplier] = (stats[supplier] || 0) + (item['Tổng xe'] || 0);
    });

    return stats;
  }

  getTruckStats() {
    if (!this.dataset?.data) {
      return {
        totalGroups: 0,
        totalTrucks: 0,
        avgDistance: 0,
        avgSpeed: 0
      };
    }

    const data = this.dataset.data as TruckData[];
    const totalGroups = data.length;
    const totalTrucks = data.reduce((sum, item) => sum + (item['Tổng xe'] || 0), 0);
    const totalDistance = data.reduce((sum, item) => sum + ((item['Trung bình quảng đường'] || 0) * (item['Tổng xe'] || 1)), 0);
    const totalSpeed = data.reduce((sum, item) => sum + ((item['Vận tốc trung bình'] || 0) * (item['Tổng xe'] || 1)), 0);

    const avgDistance = totalTrucks > 0 ? totalDistance / totalTrucks : 0;
    const avgSpeed = totalTrucks > 0 ? totalSpeed / totalTrucks : 0;

    return {
      totalGroups,
      totalTrucks,
      avgDistance,
      avgSpeed
    };
  }
}