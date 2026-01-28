import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from '../../../services/dataset.service';
import { DatasetDetailBaseComponent } from './dataset-detail-base.component';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface DemandData {
  warehouse_name?: string;
  _id?: string;
  pick_order_count?: number;
  deliver_order_count?: number;
  'Tổng Lấy'?: number;
  'Tổng Giao'?: number;
  'Lấy Sáng'?: number;
  'Lấy Trưa'?: number;
  'Lấy Chiều'?: number;
  'Lấy Tối'?: number;
  'Giao Sáng'?: number;
  'Giao Trưa'?: number;
  'Giao Chiều'?: number;
  [key: string]: any;

}

@Component({
  selector: 'app-dataset-demand-detail',
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
        <!-- Demand Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Tổng Bưu Cục</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getDemandStats().totalWarehouses }}</div>
          <div class="text-xs opacity-75 mt-1">bưu cục</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Tổng Đơn Lấy</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getDemandStats().totalPickOrders | number }}</div>
          <div class="text-xs opacity-75 mt-1">đơn</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Tổng Đơn Giao</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getDemandStats().totalDeliverOrders | number }}</div>
          <div class="text-xs opacity-75 mt-1">đơn</div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">TB Đơn/Bưu Cục</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getDemandStats().avgPickOrders }}</div>
          <div class="text-xs opacity-75 mt-1">đơn lấy</div>
        </div>
      </div>

      <!-- Demand Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-white border border-green-200 rounded-lg shadow-sm p-5">
          <h5 class="text-sm font-semibold text-green-600 mb-3">Tổng Lấy/Giao</h5>
          <canvas #demandSummaryCanvas height="200"></canvas>
        </div>
        <div class="bg-white border border-green-200 rounded-lg shadow-sm p-5">
          <h5 class="text-sm font-semibold text-green-600 mb-3">Phân bổ Lấy theo khung giờ</h5>
          <canvas #demandPickupTimeCanvas height="200"></canvas>
        </div>
        <div class="bg-white border border-green-200 rounded-lg shadow-sm p-5">
          <h5 class="text-sm font-semibold text-green-600 mb-3">Phân bổ Giao theo khung giờ</h5>
          <div style="height:200px;">
            <canvas #demandDeliveryTimeCanvas style="height:100%; width:100%; display:block;"></canvas>
          </div>
        </div>
      </div>

      <!-- Main Bar Chart -->
      <div class="bg-white border border-green-200 rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
          <h4 class="font-semibold text-gray-900">Thống kê Lấy/Giao theo Bưu cục</h4>
        </div>
        <div class="p-5">
          <canvas #demandOrderCanvas height="100"></canvas>
        </div>
      </div>

      <!-- Demand Compact Table -->
      <div class="bg-white border border-green-200 rounded-lg shadow-sm">
        <div class="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900">Dữ liệu Demand</h4>
            <span class="text-xs text-gray-600">{{ dataset?.data?.length || 0 }} bưu cục</span>
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
              <tr *ngFor="let row of dataset?.data; let i = index" [ngClass]="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
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
export class DatasetDemandDetailComponent extends DatasetDetailBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('demandSummaryCanvas') demandSummaryCanvas?: ElementRef;
  @ViewChild('demandPickupTimeCanvas') demandPickupTimeCanvas?: ElementRef;
  @ViewChild('demandDeliveryTimeCanvas') demandDeliveryTimeCanvas?: ElementRef;
  @ViewChild('demandOrderCanvas') demandOrderCanvas?: ElementRef;

  demandOrderChart: Chart | null = null;
  demandSummaryChart: Chart | null = null;
  demandPickupTimeChart: Chart | null = null;
  demandDeliveryTimeChart: Chart | null = null;


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
    // SSR-safe: only initialize charts in browser and when data is available
    if (isPlatformBrowser(this.platformId) && this.dataset?.data && this.dataset.data.length > 0) {
      setTimeout(() => this.initializeDemandCharts(), 100);
    }
  }

  ngAfterViewInit(): void {
    // SSR-safe: only initialize charts in browser and when data is available
    if (isPlatformBrowser(this.platformId) && this.dataset?.data && this.dataset.data.length > 0) {
      setTimeout(() => this.initializeDemandCharts(), 100);
    }
  }

  override ngOnDestroy(): void {
    this.cleanupCharts();
    super.ngOnDestroy();
  }

  private cleanupCharts(): void {
    if (this.demandOrderChart) {
      this.demandOrderChart.destroy();
      this.demandOrderChart = null;
    }
    if (this.demandSummaryChart) {
      this.demandSummaryChart.destroy();
      this.demandSummaryChart = null;
    }
    if (this.demandPickupTimeChart) {
      this.demandPickupTimeChart.destroy();
      this.demandPickupTimeChart = null;
    }
    if (this.demandDeliveryTimeChart) {
      this.demandDeliveryTimeChart.destroy();
      this.demandDeliveryTimeChart = null;
    }
  }

  private initializeDemandCharts(): void {
    if (!this.dataset?.data) return;

    this.initializeDemandSummaryChart();
    this.initializeDemandPickupTimeChart();
    this.initializeDemandDeliveryTimeChart();
    this.initializeDemandOrderChart();
  }

  private initializeDemandSummaryChart(): void {
    if (!this.demandSummaryCanvas?.nativeElement) return;

    const ctx = this.demandSummaryCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.dataset!.data as DemandData[];
    const totalPick = data.reduce((sum, item) => sum + (item['Tổng Lấy'] || 0), 0);
    const totalDeliver = data.reduce((sum, item) => sum + (item['Tổng Giao'] || 0), 0);

    this.demandSummaryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Đơn Lấy', 'Đơn Giao'],
        datasets: [{
          data: [totalPick, totalDeliver],
          backgroundColor: ['#10B981', '#3B82F6'],
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

  private initializeDemandPickupTimeChart(): void {
    if (!this.demandPickupTimeCanvas?.nativeElement) return;

    const ctx = this.demandPickupTimeCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.dataset!.data as DemandData[];
    const pickupTimes = {
      'Sáng': data.reduce((sum, item) => sum + (item['Lấy Sáng'] || 0), 0),
      'Trưa': data.reduce((sum, item) => sum + (item['Lấy Trưa'] || 0), 0),
      'Chiều': data.reduce((sum, item) => sum + (item['Lấy Chiều'] || 0), 0),
      'Tối': data.reduce((sum, item) => sum + (item['Lấy Tối'] || 0), 0)
    };

    this.demandPickupTimeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(pickupTimes),
        datasets: [{
          label: 'Số đơn lấy',
          data: Object.values(pickupTimes),
          backgroundColor: '#10B981',
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

  private initializeDemandDeliveryTimeChart(): void {
    if (!this.demandDeliveryTimeCanvas?.nativeElement) return;

    const ctx = this.demandDeliveryTimeCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.dataset!.data as DemandData[];
    const deliveryTimes = {
      'Sáng': data.reduce((sum, item) => sum + (item['Giao Sáng'] || 0), 0),
      'Trưa': data.reduce((sum, item) => sum + (item['Giao Trưa'] || 0), 0),
      'Chiều': data.reduce((sum, item) => sum + (item['Giao Chiều'] || 0), 0)
    };

    this.demandDeliveryTimeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(deliveryTimes),
        datasets: [{
          label: 'Số đơn giao',
          data: Object.values(deliveryTimes),
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

  private initializeDemandOrderChart(): void {
    if (!this.demandOrderCanvas?.nativeElement) return;

    const ctx = this.demandOrderCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.dataset!.data as DemandData[];
    const labels = data.map(item => item.warehouse_name || item._id || 'Unknown');
    const pickData = data.map(item => item['Tổng Lấy'] || 0);
    const deliverData = data.map(item => item['Tổng Giao'] || 0);

    this.demandOrderChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Đơn Lấy',
            data: pickData,
            backgroundColor: '#10B981',
            borderRadius: 4
          },
          {
            label: 'Đơn Giao',
            data: deliverData,
            backgroundColor: '#3B82F6',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: false
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString('vi-VN')
            }
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  getDemandStats() {
    if (!this.dataset?.data) {
      return {
        totalWarehouses: 0,
        totalPickOrders: 0,
        totalDeliverOrders: 0,
        avgPickOrders: 0
      };
    }

    const data = this.dataset.data as DemandData[];
    const totalWarehouses = data.length;
    const totalPickOrders = data.reduce((sum, item) => sum + (item['Tổng Lấy'] || 0), 0);
    const totalDeliverOrders = data.reduce((sum, item) => sum + (item['Tổng Giao'] || 0), 0);
    const avgPickOrders = totalWarehouses > 0 ? Math.round(totalPickOrders / totalWarehouses) : 0;

    return {
      totalWarehouses,
      totalPickOrders,
      totalDeliverOrders,
      avgPickOrders
    };
  }
}
