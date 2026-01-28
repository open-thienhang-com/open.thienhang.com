import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DatasetService, Dataset, Warehouse } from '../../../services/dataset.service';
import { DatasetDetailBaseComponent } from './dataset-detail-base.component';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface HubData {
    warehouse_name?: string;
    region?: string;
    type?: string;
    lat?: number;
    lng?: number;
    [key: string]: any;
}

@Component({
    selector: 'app-dataset-hub-detail',
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
        <!-- Hub Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Tổng Bưu Cục</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getHubStats().totalWarehouses }}</div>
          <div class="text-xs opacity-75 mt-1">bưu cục</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Số Vùng</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getHubStats().totalRegions }}</div>
          <div class="text-xs opacity-75 mt-1">vùng</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Loại Bưu Cục</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getHubStats().totalTypes }}</div>
          <div class="text-xs opacity-75 mt-1">loại</div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold opacity-90">Có Tọa Độ</span>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ getHubStats().warehousesWithCoords }}</div>
          <div class="text-xs opacity-75 mt-1">bưu cục</div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900">Bản đồ Bưu cục</h4>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-600">{{ warehouses.length }} bưu cục</span>
              <button
                (click)="forceRefreshMap()"
                class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Làm mới
              </button>
            </div>
          </div>
        </div>
        <div class="relative">
          <div #hubMap class="w-full h-96 bg-gray-100"></div>
          <div *ngIf="mapLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="ml-2 text-gray-600">Đang tải bản đồ...</span>
          </div>
        </div>
      </div>

      <!-- Hub Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <h5 class="text-sm font-semibold text-gray-600 mb-3">Phân bổ theo Vùng</h5>
          <canvas #hubRegionCanvas height="250"></canvas>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <h5 class="text-sm font-semibold text-gray-600 mb-3">Phân bổ theo Loại</h5>
          <canvas #hubTypeCanvas height="250"></canvas>
        </div>
      </div>

      <!-- Hub Data Table -->
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900">Dữ liệu Hub</h4>
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
export class DatasetHubDetailComponent extends DatasetDetailBaseComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('hubMap') hubMap?: ElementRef;
    @ViewChild('hubRegionCanvas') hubRegionCanvas?: ElementRef;
    @ViewChild('hubTypeCanvas') hubTypeCanvas?: ElementRef;

    // Map and chart properties
    map: any = null;
    hubMarkers: any[] = [];
    lastMapWidth: number = 0;
    mapLoading = true;

    // Hub API properties
    authToken: string = 'ZCXb4Thq56HgXlQC4IKS4EcghaYt6xxmIoHdazBJgVBRAwYqbLhx9rE3QTuzIqpo';
    hubLoading: boolean = false;
    hubLoadError: string | null = null;

    // Charts
    hubRegionChart: Chart | null = null;
    hubTypeChart: Chart | null = null;

    // Warehouse data
    warehouses: Warehouse[] = [];

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
        // Chỉ khởi tạo chart khi có dữ liệu thật và đang ở browser
        if (isPlatformBrowser(this.platformId) && this.dataset?.data && this.dataset.data.length > 0) {
            setTimeout(() => this.initializeHubCharts(), 100);
        }

        // Load warehouses for map
        if (isPlatformBrowser(this.platformId)) {
            this.loadDefaultHubWarehouses();
        }
    }

    ngAfterViewInit(): void {
        // Initialize map after view is ready
        if (isPlatformBrowser(this.platformId)) {
            this.initializeMap();
        }
        // Nếu dữ liệu đến sau khi view đã init, chỉ khởi tạo chart nếu có data và ở browser
        if (isPlatformBrowser(this.platformId) && this.dataset?.data && this.dataset.data.length > 0) {
            setTimeout(() => this.initializeHubCharts(), 100);
        }
    }

    override ngOnDestroy(): void {
        this.cleanupCharts();
        this.cleanupMap();
        super.ngOnDestroy();
    }

    private cleanupCharts(): void {
        if (this.hubRegionChart) {
            this.hubRegionChart.destroy();
            this.hubRegionChart = null;
        }
        if (this.hubTypeChart) {
            this.hubTypeChart.destroy();
            this.hubTypeChart = null;
        }
    }

    private cleanupMap(): void {
        if (isPlatformBrowser(this.platformId) && this.map) {
            try {
                // Clear all markers first
                this.hubMarkers.forEach(marker => {
                    if (this.map && this.map.hasLayer(marker)) {
                        this.map.removeLayer(marker);
                    }
                });
                this.hubMarkers = [];

                // Remove map instance
                this.map.remove();
                this.map = null;
            } catch (error) {
                console.error('[DatasetHubDetail] Error during map cleanup:', error);
                this.map = null;
            }
        }
    }

    private initializeHubCharts(): void {
        if (!this.dataset?.data) return;

        this.initializeHubRegionChart();
        this.initializeHubTypeChart();
    }

    private initializeHubRegionChart(): void {
        if (!this.hubRegionCanvas?.nativeElement) return;

        const ctx = this.hubRegionCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        const data = this.dataset!.data as HubData[];
        const regionStats = this.getHubRegionStats();

        this.hubRegionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(regionStats),
                datasets: [{
                    label: 'Số bưu cục',
                    data: Object.values(regionStats),
                    backgroundColor: '#6B7280',
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

    private initializeHubTypeChart(): void {
        if (!this.hubTypeCanvas?.nativeElement) return;

        const ctx = this.hubTypeCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        const data = this.dataset!.data as HubData[];
        const typeStats = this.getHubTypeStats();

        this.hubTypeChart = new Chart(ctx, {
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

    private getHubRegionStats(): { [key: string]: number } {
        if (!this.dataset?.data) return {};

        const data = this.dataset.data as HubData[];
        const stats: { [key: string]: number } = {};

        data.forEach(item => {
            const region = item.region || 'Unknown';
            stats[region] = (stats[region] || 0) + 1;
        });

        return stats;
    }

    private getHubTypeStats(): { [key: string]: number } {
        if (!this.dataset?.data) return {};

        const data = this.dataset.data as HubData[];
        const stats: { [key: string]: number } = {};

        data.forEach(item => {
            const type = item.type || 'Unknown';
            stats[type] = (stats[type] || 0) + 1;
        });

        return stats;
    }

    getHubStats() {
        if (!this.dataset?.data) {
            return {
                totalWarehouses: 0,
                totalRegions: 0,
                totalTypes: 0,
                warehousesWithCoords: 0
            };
        }

        const data = this.dataset.data as HubData[];
        const totalWarehouses = data.length;
        const regions = new Set(data.map(item => item.region).filter(Boolean));
        const types = new Set(data.map(item => item.type).filter(Boolean));
        const warehousesWithCoords = data.filter(item => item.lat && item.lng).length;

        return {
            totalWarehouses,
            totalRegions: regions.size,
            totalTypes: types.size,
            warehousesWithCoords
        };
    }

    // Map-related methods
    private async initializeMap(): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.hubMap?.nativeElement) return;

        try {
            // Dynamically import Leaflet
            const L = await import('leaflet');

            // Initialize map
            this.map = L.map(this.hubMap.nativeElement).setView([14.0583, 108.2772], 6);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            this.mapLoading = false;

            // Load markers if warehouses are available
            if (this.warehouses.length > 0) {
                this.addWarehouseMarkers();
            }
        } catch (error) {
            console.error('[DatasetHubDetail] Error initializing map:', error);
            this.mapLoading = false;
        }
    }

    private async loadDefaultHubWarehouses(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return;

        this.hubLoading = true;
        this.hubLoadError = null;

        try {
            const params = {
                region_shortname: 'HCM',
                size: 1000,
                offset: 0
            };

            this.datasetService.getWarehouses(params).subscribe({
                next: (response) => {
                    if (response.ok && response.data) {
                        this.warehouses = Array.isArray(response.data) ? response.data : [response.data];
                        console.log('[DatasetHubDetail] Loaded warehouses:', this.warehouses);

                        // Add markers to map if map is ready
                        if (this.map && this.warehouses.length > 0) {
                            this.addWarehouseMarkers();
                        }
                    } else {
                        console.error('[DatasetHubDetail] Invalid response:', response);
                        this.hubLoadError = 'Không thể tải danh sách bưu cục';
                        this.warehouses = [];
                    }
                    this.hubLoading = false;
                },
                error: (error) => {
                    console.error('[DatasetHubDetail] Error loading warehouses:', error);
                    this.hubLoadError = 'Không thể tải danh sách bưu cục';
                    this.warehouses = [];
                    this.hubLoading = false;
                }
            });
        } catch (error) {
            console.error('[DatasetHubDetail] Unexpected error loading warehouses:', error);
            this.hubLoadError = 'Không thể tải danh sách bưu cục';
            this.warehouses = [];
            this.hubLoading = false;
        }
    }

    private async addWarehouseMarkers(): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.map) return;

        try {
            const L = await import('leaflet');

            // Clear existing markers
            this.hubMarkers.forEach(marker => {
                if (this.map.hasLayer(marker)) {
                    this.map.removeLayer(marker);
                }
            });
            this.hubMarkers = [];

            // Add new markers
            this.warehouses.forEach((warehouse, index) => {
                if (warehouse.latitude && warehouse.longitude) {
                    const marker = L.marker([warehouse.latitude, warehouse.longitude])
                        .addTo(this.map)
                        .bindPopup(`
              <div class="p-2">
                <h3 class="font-semibold">${warehouse.warehouse_name || warehouse.id}</h3>
                <p class="text-sm text-gray-600">Vùng: ${warehouse.region_shortname || 'N/A'}</p>
                <p class="text-sm text-gray-600">Loại: ${warehouse.region_fullname || 'N/A'}</p>
              </div>
            `);

                    this.hubMarkers.push(marker);
                }
            });

            // Fit map to show all markers
            if (this.hubMarkers.length > 0) {
                const L2 = await import('leaflet');
                const group = L2.featureGroup(this.hubMarkers);
                const bounds = group.getBounds();
                if (bounds.isValid()) {
                    this.map.fitBounds(bounds.pad(0.1));
                }
            }

            console.log(`[DatasetHubDetail] Added ${this.hubMarkers.length} out of ${this.warehouses.length} warehouse markers`);
        } catch (error) {
            console.error('[DatasetHubDetail] Error adding warehouse markers:', error);
        }
    }

    forceRefreshMap(): void {
        if (!isPlatformBrowser(this.platformId) || !this.map) return;

        try {
            this.map.invalidateSize();

            // Re-add markers if they exist
            if (this.warehouses.length > 0) {
                this.addWarehouseMarkers();
            }
        } catch (error) {
            console.error('[DatasetHubDetail] Error refreshing map:', error);
        }
    }
}