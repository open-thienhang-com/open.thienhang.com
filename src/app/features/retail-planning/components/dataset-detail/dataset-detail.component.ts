import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, Inject, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService, Dataset } from '../../services/dataset.service';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';

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
  [key: string]: any; // Allow additional properties
}

@Component({
  selector: 'app-dataset-detail',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DataViewModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TableModule,
    ChartModule
  ],
  templateUrl: './dataset-detail.component.html',
  styleUrl: './dataset-detail.component.css',
})
export class DatasetDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() datasetIdInput: string | null = null;
  @Input() embedded = false;
  datasetId: string | null = null;
  dataset: Dataset | null = null;
  loading = true;
  error: string | null = null;

  // Charts
  truckTypeChart: Chart | null = null;
  truckSupplierChart: Chart | null = null;
  hubRegionChart: Chart | null = null;
  hubTypeChart: Chart | null = null;
  demandOrderChart: Chart | null = null;
  demandSummaryChart: Chart | null = null;
  demandPickupTimeChart: Chart | null = null;
  demandDeliveryTimeChart: Chart | null = null;

  // Hub search dialog properties
  showHubSearchDialog = false;
  selectedHubs: any[] = [];
  hubSearchFilters = {
    region: '',
    warehouse: '',
    id: ''
  };
  filteredHubs: any[] = [];
  allHubs: any[] = [];

  // Map properties
  map: any = null;
  hubMarkers: any[] = [];
  lastMapWidth: number = 0;

  // Metadata toggle
  showMetadata = false;

  // Hub search and filtering
  hubSearchQuery = '';
  selectedHubDetail: any = null;

  // Alias for template compatibility
  get hubs(): any[] {
    return this.allHubs;
  }

  // Canvas elements
  @ViewChild('truckTypeCanvas', { static: false }) truckTypeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('truckSupplierCanvas', { static: false }) truckSupplierCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hubRegionCanvas', { static: false }) hubRegionCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hubTypeCanvas', { static: false }) hubTypeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandOrderCanvas', { static: false }) demandOrderCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandSummaryCanvas', { static: false }) demandSummaryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandPickupTimeCanvas', { static: false }) demandPickupTimeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandDeliveryTimeCanvas', { static: false }) demandDeliveryTimeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hubMap', { static: false }) hubMap!: ElementRef<HTMLDivElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datasetService: DatasetService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.datasetId = this.datasetIdInput || this.route.snapshot.paramMap.get('id');
    if (this.datasetId) {
      this.loadDataset();
    } else {
      this.error = 'Không có ID dataset để hiển thị';
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after dataset is loaded
    // Map will be initialized when hub section is shown
  }

  ngAfterViewChecked(): void {
    // Ensure map resizes properly when container dimensions change
    if (isPlatformBrowser(this.platformId) && this.map && this.hubMap?.nativeElement) {
      // Only invalidate size if the element is visible and has dimensions
      const rect = this.hubMap.nativeElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.width !== this.lastMapWidth) {
        this.lastMapWidth = rect.width;
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            console.log('[DatasetDetail] Map size invalidated due to container resize');
          }
        }, 100);
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup charts
    if (this.truckTypeChart) {
      this.truckTypeChart.destroy();
    }
    if (this.truckSupplierChart) {
      this.truckSupplierChart.destroy();
    }
    if (this.hubRegionChart) {
      this.hubRegionChart.destroy();
    }
    if (this.hubTypeChart) {
      this.hubTypeChart.destroy();
    }
    if (this.demandOrderChart) {
      this.demandOrderChart.destroy();
    }
    if (this.demandSummaryChart) {
      this.demandSummaryChart.destroy();
    }
    if (this.demandPickupTimeChart) {
      this.demandPickupTimeChart.destroy();
    }
    if (this.demandDeliveryTimeChart) {
      this.demandDeliveryTimeChart.destroy();
    }

    // Cleanup map properly
    if (isPlatformBrowser(this.platformId) && this.map) {
      console.log('[DatasetDetail] Cleaning up map instance');
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
        console.log('[DatasetDetail] Map cleanup completed');
      } catch (error) {
        console.error('[DatasetDetail] Error during map cleanup:', error);
        this.map = null;
      }
    }
  }

  loadDataset(): void {
    if (!this.datasetId) return;

    this.loading = true;
    this.error = null;

    this.datasetService.getDataset(this.datasetId).subscribe({
      next: (response) => {
        if (response.ok && response.data && response.data.data) {
          // Handle both single object and array responses
          const datasetData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
          this.dataset = datasetData;
          // Delay chart initialization to ensure DOM is ready
          setTimeout(() => {
            this.initializeVisualizations();
          }, 100);
        } else {
          this.error = 'Không thể tải chi tiết dataset';
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.message || 'Lỗi khi tải dataset';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private initializeVisualizations(): void {
    if (!this.dataset || !this.dataset.data) return;

    // Initialize type-specific visualizations
    if (this.dataset.type === 'truck') {
      this.initializeTruckCharts();
    } else if (this.dataset.type === 'hub') {
      this.initializeHubCharts();
      // Only load default warehouses on browser, not during SSR
      if (isPlatformBrowser(this.platformId)) {
        // Wait for ViewChild to be ready, then initialize map and load warehouses
        this.ensureMapReady().then(() => {
          this.initializeMap().then(() => {
            this.loadDefaultHubWarehouses();
          });
        });
        // Also load hub data for dictionary view
        this.initializeHubData();
      }
    } else if (this.dataset.type === 'demand') {
      this.initializeDemandCharts();
    }
  }

  private async ensureMapReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkMap = () => {
        if (this.map) {
          console.log('[DatasetDetail] Map is ready');
          resolve();
        } else {
          console.log('[DatasetDetail] Waiting for map to be ready...');
          setTimeout(checkMap, 100);
        }
      };

      // Wait up to 5 seconds for map to be ready
      setTimeout(() => {
        console.warn('[DatasetDetail] Map readiness check timed out');
        resolve(); // Resolve anyway to not block the flow
      }, 5000);

      checkMap();
    });
  }

  private initializeHubCharts(): void {
    if (!this.dataset?.data) {
      console.log('[DatasetDetail] No dataset data available for hub charts');
      return;
    }

    // Check if we're in browser environment (not SSR)
    if (typeof window === 'undefined' || !window.document) {
      console.log('[DatasetDetail] Skipping hub chart initialization in SSR environment');
      return;
    }

    const hubData = this.dataset.data as any[];
    console.log('[DatasetDetail] Initializing hub charts with data:', hubData);

    // Destroy existing charts
    if (this.hubRegionChart) this.hubRegionChart.destroy();
    if (this.hubTypeChart) this.hubTypeChart.destroy();

    // Hub Region Chart
    const regionCounts = hubData.reduce((acc, item) => {
      const region = item['Vùng'] || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('[DatasetDetail] Region counts:', regionCounts);

    if (this.hubRegionCanvas?.nativeElement) {
      this.hubRegionChart = new Chart(this.hubRegionCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(regionCounts),
          datasets: [{
            data: Object.values(regionCounts),
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
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
      }) as any;
      console.log('[DatasetDetail] Hub region chart created successfully');
    } else {
      console.error('[DatasetDetail] Could not find hub region canvas element');
    }

    // Hub Type Chart
    const typeCounts = hubData.reduce((acc, item) => {
      const type = item['Loại BC'] || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('[DatasetDetail] Hub type counts:', typeCounts);

    if (this.hubTypeCanvas?.nativeElement) {
      this.hubTypeChart = new Chart(this.hubTypeCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(typeCounts),
          datasets: [{
            label: 'Số lượng bưu cục',
            data: Object.values(typeCounts),
            backgroundColor: '#F59E0B',
            borderColor: '#D97706',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
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
      console.log('[DatasetDetail] Hub type chart created successfully');
    } else {
      console.error('[DatasetDetail] Could not find hub type canvas element');
    }

    // Map will be initialized separately after warehouse data is loaded
  }

  private loadDefaultHubWarehouses(): void {
    console.log('[DatasetDetail] Loading default HNO warehouses for dataset type:', this.dataset?.type);

    // Load default warehouses for Hanoi region (HNO) on component initialization
    this.datasetService.getWarehouses({
      region_shortname: 'HCM',
      size: 1000,
      offset: 0
    }).subscribe({
      next: (response) => {
        console.log('[DatasetDetail] API response for HNO warehouses:', response);

        if (response.ok && response.data) {
          console.log('[DatasetDetail] Raw response.data:', response.data);
          console.log('[DatasetDetail] Type of response.data:', typeof response.data);
          console.log('[DatasetDetail] Is array?', Array.isArray(response.data));

          // Handle different response structures
          let warehouses: any[] = [];
          const data = response.data as any;

          if (Array.isArray(data)) {
            // Direct array response: { data: [...] }
            warehouses = data;
          } else if (data && Array.isArray(data.data)) {
            // Nested array response: { data: { data: [...] } }
            warehouses = data.data;
          } else if (data && typeof data === 'object') {
            // Try to find array in the response object
            const possibleArrays = Object.values(data).filter((val: any) => Array.isArray(val));
            if (possibleArrays.length > 0) {
              warehouses = possibleArrays[0] as any[];
            }
          }

          console.log('[DatasetDetail] Extracted warehouses:', warehouses);

          // Transform API response to match component's expected format and add to selectedHubs
          this.selectedHubs = warehouses.map((warehouse: any) => {
            console.log('[DatasetDetail] Transforming warehouse:', warehouse);
            console.log('[DatasetDetail] Warehouse coordinates - lat:', warehouse.latitude, 'lng:', warehouse.longitude);

            const transformed = {
              'ID BC': warehouse.warehouse_id?.toString() || warehouse.id,
              'Tên BC': warehouse.warehouse_name || 'Unknown',
              'Vùng': warehouse.region_shortname || 'HNO',
              'Tỉnh': warehouse.province_name || 'Unknown',
              'Quận/Huyện': warehouse.district_name || 'Unknown',
              'Loại BC': warehouse.warehouse_type || 'Unknown',
              'Lat': parseFloat(warehouse.latitude) || 0,
              'Lng': parseFloat(warehouse.longitude) || 0,
              // Keep original data for reference
              originalData: warehouse
            };

            console.log('[DatasetDetail] Transformed hub:', transformed);
            return transformed;
          });

          console.log('[DatasetDetail] Transformed selectedHubs:', this.selectedHubs);

          // Trigger change detection
          this.cdr.markForCheck();

          // Update map markers after ensuring map is ready
          this.ensureMapReady().then(() => {
            if (this.map) {
              this.updateMapMarkers();
            } else {
              console.warn('[DatasetDetail] Map still not ready after waiting, markers will be updated when map initializes');
            }
          });

          console.log('[DatasetDetail] Loaded default HNO warehouses:', this.selectedHubs.length);
        } else {
          console.warn('[DatasetDetail] Failed to load default HNO warehouses, using empty selection');
          this.selectedHubs = [];
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('[DatasetDetail] Error loading default HNO warehouses:', error);
        this.selectedHubs = [];
        this.cdr.markForCheck();
      }
    });
  }

  private initializeTruckCharts(): void {
    if (!this.dataset?.data) {
      console.log('[DatasetDetail] No dataset data available for charts, using mock data');
      // Use mock data for testing
      this.dataset = {
        ...this.dataset,
        data: [
          { 'Bưu cục': 'HCM001', 'Loại xe': 'GHN', 'Nhà cung cấp': 'Toyota', 'Tổng xe': 5, 'Trung bình quảng đường': 150.5, 'Trung bình thời gian': 8.2, 'Vận tốc trung bình': 18.4 },
          { 'Bưu cục': 'HCM002', 'Loại xe': 'NCC', 'Nhà cung cấp': 'Honda', 'Tổng xe': 3, 'Trung bình quảng đường': 120.3, 'Trung bình thời gian': 6.8, 'Vận tốc trung bình': 17.7 },
          { 'Bưu cục': 'HN001', 'Loại xe': 'GHN', 'Nhà cung cấp': 'Toyota', 'Tổng xe': 4, 'Trung bình quảng đường': 180.2, 'Trung bình thời gian': 9.5, 'Vận tốc trung bình': 18.9 },
          { 'Bưu cục': 'HN002', 'Loại xe': 'NCC', 'Nhà cung cấp': 'Honda', 'Tổng xe': 2, 'Trung bình quảng đường': 95.1, 'Trung bình thời gian': 5.2, 'Vận tốc trung bình': 18.3 }
        ]
      } as Dataset;
    }

    // Check if we're in browser environment (not SSR)
    if (typeof window === 'undefined' || !window.document) {
      console.log('[DatasetDetail] Skipping truck chart initialization in SSR environment');
      return;
    }

    const truckData = this.dataset.data as TruckData[];
    console.log('[DatasetDetail] Initializing truck charts with data:', truckData);

    // Destroy existing charts
    if (this.truckTypeChart) this.truckTypeChart.destroy();
    if (this.truckSupplierChart) this.truckSupplierChart.destroy();

    // Truck Type Chart
    const typeCounts = truckData.reduce((acc, item) => {
      const type = item['Loại xe'] || 'Unknown';
      acc[type] = (acc[type] || 0) + (item['Tổng xe'] || 0);
      return acc;
    }, {} as Record<string, number>);

    console.log('[DatasetDetail] Type counts:', typeCounts);

    if (this.truckTypeCanvas?.nativeElement) {
      this.truckTypeChart = new Chart(this.truckTypeCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(typeCounts),
          datasets: [{
            data: Object.values(typeCounts),
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
            borderWidth: 2,
            borderColor: '#ffffff'
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
      }) as any;
      console.log('[DatasetDetail] Truck type chart created successfully');
    } else {
      console.error('[DatasetDetail] Could not find truck type canvas element');
    }

    // Truck Supplier Chart
    const supplierCounts = truckData.reduce((acc, item) => {
      const supplier = item['Nhà cung cấp'] || 'Unknown';
      acc[supplier] = (acc[supplier] || 0) + (item['Tổng xe'] || 0);
      return acc;
    }, {} as Record<string, number>);

    // Take top 5 suppliers
    const sortedSuppliers = Object.entries(supplierCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    console.log('[DatasetDetail] Supplier counts:', supplierCounts);
    console.log('[DatasetDetail] Top 5 suppliers:', sortedSuppliers);

    if (this.truckSupplierCanvas?.nativeElement) {
      this.truckSupplierChart = new Chart(this.truckSupplierCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: sortedSuppliers.map(([supplier]) => supplier),
          datasets: [{
            label: 'Số lượng xe',
            data: sortedSuppliers.map(([, count]) => count),
            backgroundColor: '#F59E0B',
            borderColor: '#D97706',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
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
      console.log('[DatasetDetail] Truck supplier chart created successfully');
    } else {
      console.error('[DatasetDetail] Could not find truck supplier canvas element');
    }
  }

  private initializeDemandCharts(): void {
    console.log('[DatasetDetail] initializeDemandCharts called');
    if (!this.dataset?.data) {
      console.log('[DatasetDetail] No dataset data available for demand charts');
      return;
    }

    // Check if we're in browser environment (not SSR)
    if (typeof window === 'undefined' || !window.document) {
      console.log('[DatasetDetail] Skipping chart initialization in SSR environment');
      return;
    }

    const demandData = this.dataset.data as DemandData[];
    console.log('[DatasetDetail] Initializing demand charts with data:', demandData);
    console.log('[DatasetDetail] Dataset type:', this.dataset.type);
    console.log('[DatasetDetail] Data length:', demandData.length);

    // Destroy existing charts
    if (this.demandOrderChart) this.demandOrderChart.destroy();
    if (this.demandSummaryChart) this.demandSummaryChart.destroy();
    if (this.demandPickupTimeChart) this.demandPickupTimeChart.destroy();
    if (this.demandDeliveryTimeChart) this.demandDeliveryTimeChart.destroy();

    // Summary - Total Pickup vs Delivery Doughnut Chart
    if (this.demandSummaryCanvas?.nativeElement) {
      const totalPickup = demandData.reduce((sum, item) => sum + (item['Tổng Lấy'] || item.pick_order_count || 0), 0);
      const totalDelivery = demandData.reduce((sum, item) => sum + (item['Tổng Giao'] || item.deliver_order_count || 0), 0);

      this.demandSummaryChart = new Chart(this.demandSummaryCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Tổng Lấy', 'Tổng Giao'],
          datasets: [{
            data: [totalPickup, totalDelivery],
            backgroundColor: ['rgba(249, 115, 22, 0.8)', 'rgba(251, 146, 60, 0.8)'],
            borderColor: ['rgba(249, 115, 22, 1)', 'rgba(251, 146, 60, 1)'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return context.label + ': ' + context.parsed.toLocaleString('vi-VN') + ' (' + percentage + '%)';
                }
              }
            }
          }
        }
      }) as any;
      console.log('[DatasetDetail] Demand summary chart created successfully');
    }

    // Pickup Time Distribution Polar Area Chart
    if (this.demandPickupTimeCanvas?.nativeElement) {
      const pickupMorning = demandData.reduce((sum, item) => sum + (item['Lấy Sáng'] || 0), 0);
      const pickupNoon = demandData.reduce((sum, item) => sum + (item['Lấy Trưa'] || 0), 0);
      const pickupAfternoon = demandData.reduce((sum, item) => sum + (item['Lấy Chiều'] || 0), 0);
      const pickupEvening = demandData.reduce((sum, item) => sum + (item['Lấy Tối'] || 0), 0);

      this.demandPickupTimeChart = new Chart(this.demandPickupTimeCanvas.nativeElement, {
        type: 'polarArea',
        data: {
          labels: ['Sáng', 'Trưa', 'Chiều', 'Tối'],
          datasets: [{
            data: [pickupMorning, pickupNoon, pickupAfternoon, pickupEvening],
            backgroundColor: [
              'rgba(254, 215, 170, 0.7)',
              'rgba(253, 186, 116, 0.7)',
              'rgba(251, 146, 60, 0.7)',
              'rgba(249, 115, 22, 0.7)'
            ],
            borderColor: [
              'rgba(254, 215, 170, 1)',
              'rgba(253, 186, 116, 1)',
              'rgba(251, 146, 60, 1)',
              'rgba(249, 115, 22, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      }) as any;
      console.log('[DatasetDetail] Demand pickup time chart created successfully');
    }

    // Delivery Time Distribution Polar Area Chart
    if (this.demandDeliveryTimeCanvas?.nativeElement) {
      const deliveryMorning = demandData.reduce((sum, item) => sum + (item['Giao Sáng'] || 0), 0);
      const deliveryNoon = demandData.reduce((sum, item) => sum + (item['Giao Trưa'] || 0), 0);
      const deliveryAfternoon = demandData.reduce((sum, item) => sum + (item['Giao Chiều'] || 0), 0);

      this.demandDeliveryTimeChart = new Chart(this.demandDeliveryTimeCanvas.nativeElement, {
        type: 'polarArea',
        data: {
          labels: ['Sáng', 'Trưa', 'Chiều'],
          datasets: [{
            data: [deliveryMorning, deliveryNoon, deliveryAfternoon],
            backgroundColor: [
              'rgba(254, 215, 170, 0.7)',
              'rgba(253, 186, 116, 0.7)',
              'rgba(251, 146, 60, 0.7)'
            ],
            borderColor: [
              'rgba(254, 215, 170, 1)',
              'rgba(253, 186, 116, 1)',
              'rgba(251, 146, 60, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      }) as any;
      console.log('[DatasetDetail] Demand delivery time chart created successfully');
    }

    // Main Bar Chart - All warehouses pickup/delivery stats (matching public version)
    if (this.demandOrderCanvas?.nativeElement) {
      const labels = demandData.map(item => {
        const name = item.warehouse_name || item._id || item['Bưu cục'] || 'N/A';
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
      });
      const pickupData = demandData.map(item => item['Tổng Lấy'] || item.pick_order_count || 0);
      const deliveryData = demandData.map(item => item['Tổng Giao'] || item.deliver_order_count || 0);

      console.log('[DatasetDetail] Creating demand order chart with labels:', labels);
      console.log('[DatasetDetail] Pickup data:', pickupData);
      console.log('[DatasetDetail] Delivery data:', deliveryData);

      this.demandOrderChart = new Chart(this.demandOrderCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Tổng Lấy',
              data: pickupData,
              backgroundColor: 'rgba(249, 115, 22, 0.6)',
              borderColor: 'rgba(249, 115, 22, 1)',
              borderWidth: 2
            },
            {
              label: 'Tổng Giao',
              data: deliveryData,
              backgroundColor: 'rgba(251, 146, 60, 0.6)',
              borderColor: 'rgba(251, 146, 60, 1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  if (typeof value === 'number') {
                    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                    return value.toString();
                  }
                  return value;
                }
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toLocaleString('vi-VN');
                  }
                  return label;
                }
              }
            }
          }
        }
      });
      console.log('[DatasetDetail] Demand order chart created successfully');
    }
  }

  getHubStats(): any {
    if (!this.dataset?.data || this.dataset.type !== 'hub') return {};

    const hubData = this.dataset.data as any[];
    const totalWarehouses = hubData.length;
    const fullService = hubData.filter(h => h['Loại BC'] === 'Cả Lấy & Giao').length;
    const deliveryOnly = hubData.filter(h => h['Loại BC'] === 'Chỉ Giao').length;
    const totalRegions = [...new Set(hubData.map(h => h['Vùng']))].length;

    return {
      totalWarehouses,
      fullService,
      fullServicePercent: totalWarehouses > 0 ? ((fullService / totalWarehouses) * 100).toFixed(1) : '0',
      deliveryOnly,
      deliveryOnlyPercent: totalWarehouses > 0 ? ((deliveryOnly / totalWarehouses) * 100).toFixed(1) : '0',
      totalRegions
    };
  }

  getTruckStats(): any {
    if (!this.dataset?.data || this.dataset.type !== 'truck') return {};

    const truckData = this.dataset.data as TruckData[];
    const totalWarehouses = truckData.length;
    const totalTrucks = truckData.reduce((sum, item) => sum + (item['Tổng xe'] || 0), 0);
    const avgDistance = truckData.reduce((sum, item) => sum + (item['Trung bình quảng đường'] || 0), 0) / totalWarehouses;
    const avgSpeed = truckData.reduce((sum, item) => sum + (item['Vận tốc trung bình'] || 0), 0) / totalWarehouses;

    return {
      totalWarehouses,
      totalTrucks,
      avgDistance: isNaN(avgDistance) ? 0 : avgDistance.toFixed(1),
      avgSpeed: isNaN(avgSpeed) ? 0 : avgSpeed.toFixed(1)
    };
  }

  getDemandStats(): any {
    if (!this.dataset?.data || this.dataset.type !== 'demand') return {};

    const demandData = this.dataset.data as DemandData[];
    const totalWarehouses = demandData.length;
    const totalPickOrders = demandData.reduce((sum, item) => sum + (item.pick_order_count || 0), 0);
    const totalDeliverOrders = demandData.reduce((sum, item) => sum + (item.deliver_order_count || 0), 0);
    const totalOrders = totalPickOrders + totalDeliverOrders;
    const avgPickOrders = totalPickOrders / totalWarehouses;
    const avgDeliverOrders = totalDeliverOrders / totalWarehouses;

    return {
      totalWarehouses,
      totalPickOrders,
      totalDeliverOrders,
      totalOrders,
      avgPickOrders: isNaN(avgPickOrders) ? 0 : avgPickOrders.toFixed(0),
      avgDeliverOrders: isNaN(avgDeliverOrders) ? 0 : avgDeliverOrders.toFixed(0)
    };
  }

  goBack(): void {
    this.router.navigate(['/dataset']);
  }

  getQualityColorClass(quality: number): string {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getRegionBadgeClass(region: string): string {
    switch (region) {
      case 'NTB': return 'bg-blue-100 text-blue-800';
      case 'HCM': return 'bg-green-100 text-green-800';
      case 'HN': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTruckTypeBadgeClass(type: string): string {
    switch (type) {
      case 'GHN': return 'bg-blue-100 text-blue-800';
      case 'NCC': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getDataKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatCellValue(value: any, key: string): string {
    if (value === null || value === undefined) return '';

    if (typeof value === 'number') {
      if (value > 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value > 1000) {
        return (value / 1000).toFixed(1) + 'K';
      } else {
        return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
      }
    }

    return String(value);
  }

  // Hub search dialog methods
  openHubSearchDialog(): void {
    this.showHubSearchDialog = true;
    this.initializeHubData();
    this.filterHubs();
  }

  closeHubSearchDialog(): void {
    this.showHubSearchDialog = false;
  }

  initializeHubData(): void {
    // Load warehouse data from API
    this.datasetService.getWarehouses({
      region_shortname: 'HCM', // Default region, can be made configurable
      size: 1000, // Load more warehouses for search
      offset: 0
    }).subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          // Transform API response to match component's expected format
          this.allHubs = response.data.map((warehouse: any) => ({
            'ID BC': warehouse.warehouse_id?.toString() || warehouse.id,
            'Tên BC': warehouse.warehouse_name || 'Unknown',
            'Vùng': warehouse.region_shortname || 'Unknown',
            'Tỉnh': warehouse.province_name || 'Unknown',
            'Quận/Huyện': warehouse.district_name || 'Unknown',
            'Loại BC': warehouse.warehouse_type || 'Unknown',
            'Kinh độ': warehouse.longitude || 0,
            'Vĩ độ': warehouse.latitude || 0,
            // Keep original data for reference
            originalData: warehouse
          }));
          this.filterHubs();
        } else {
          console.error('Failed to load warehouse data:', response);
          // Fallback to mock data if API fails
          this.loadMockHubData();
        }
      },
      error: (error) => {
        console.error('Error loading warehouse data:', error);
        // Fallback to mock data if API fails
        this.loadMockHubData();
      }
    });
  }

  private loadMockHubData(): void {
    // Mock hub data as fallback
    this.allHubs = [
      {
        'ID BC': 'BC001',
        'Tên BC': 'Bưu cục Hà Nội 1',
        'Vùng': 'Miền Bắc',
        'Tỉnh': 'Hà Nội',
        'Quận/Huyện': 'Hoàn Kiếm',
        'Loại BC': 'Trung tâm',
        'Kinh độ': 105.8342,
        'Vĩ độ': 21.0278
      },
      {
        'ID BC': 'BC002',
        'Tên BC': 'Bưu cục Hà Nội 2',
        'Vùng': 'Miền Bắc',
        'Tỉnh': 'Hà Nội',
        'Quận/Huyện': 'Đống Đa',
        'Loại BC': 'Phụ trợ',
        'Kinh độ': 105.8242,
        'Vĩ độ': 21.0178
      },
      {
        'ID BC': 'BC003',
        'Tên BC': 'Bưu cục TP.HCM 1',
        'Vùng': 'Miền Nam',
        'Tỉnh': 'TP.HCM',
        'Quận/Huyện': 'Quận 1',
        'Loại BC': 'Trung tâm',
        'Kinh độ': 106.6992,
        'Vĩ độ': 10.7769
      },
      {
        'ID BC': 'BC004',
        'Tên BC': 'Bưu cục Đà Nẵng',
        'Vùng': 'Miền Trung',
        'Tỉnh': 'Đà Nẵng',
        'Quận/Huyện': 'Hải Châu',
        'Loại BC': 'Phụ trợ',
        'Kinh độ': 108.2208,
        'Vĩ độ': 16.0544
      },
      {
        'ID BC': 'BC005',
        'Tên BC': 'Bưu cục Cần Thơ',
        'Vùng': 'Miền Nam',
        'Tỉnh': 'Cần Thơ',
        'Quận/Huyện': 'Ninh Kiều',
        'Loại BC': 'Trung tâm',
        'Kinh độ': 105.7852,
        'Vĩ độ': 10.0458
      }
    ];
    this.filterHubs();
  }

  filterHubs(): void {
    // For now, filter locally. In the future, this could be moved to API-side filtering
    this.filteredHubs = this.allHubs.filter(hub => {
      const regionMatch = !this.hubSearchFilters.region || hub['Vùng'] === this.hubSearchFilters.region;
      const warehouseMatch = !this.hubSearchFilters.warehouse ||
        hub['Tên BC'].toLowerCase().includes(this.hubSearchFilters.warehouse.toLowerCase());
      const idMatch = !this.hubSearchFilters.id ||
        hub['ID BC'].toLowerCase().includes(this.hubSearchFilters.id.toLowerCase());

      // Additional search query filter
      const queryMatch = !this.hubSearchQuery.trim() ||
        (hub['Tên BC'] && hub['Tên BC'].toLowerCase().includes(this.hubSearchQuery.toLowerCase())) ||
        (hub['ID BC'] && hub['ID BC'].toLowerCase().includes(this.hubSearchQuery.toLowerCase())) ||
        (hub['Vùng'] && hub['Vùng'].toLowerCase().includes(this.hubSearchQuery.toLowerCase()));

      return regionMatch && warehouseMatch && idMatch && queryMatch;
    });
  }

  searchHubs(): void {
    // Call API with search parameters
    const searchTerm = this.hubSearchFilters.warehouse || this.hubSearchFilters.id || '';
    this.datasetService.getWarehouses({
      region_shortname: this.hubSearchFilters.region || 'HCM',
      size: 1000,
      offset: 0,
      search: searchTerm
    }).subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          this.allHubs = response.data.map((warehouse: any) => ({
            'ID BC': warehouse.warehouse_id?.toString() || warehouse.id,
            'Tên BC': warehouse.warehouse_name || 'Unknown',
            'Vùng': warehouse.region_shortname || 'Unknown',
            'Tỉnh': warehouse.province_name || 'Unknown',
            'Quận/Huyện': warehouse.district_name || 'Unknown',
            'Loại BC': warehouse.warehouse_type || 'Unknown',
            'Kinh độ': warehouse.longitude || 0,
            'Vĩ độ': warehouse.latitude || 0,
            originalData: warehouse
          }));
          this.filterHubs();
        }
      },
      error: (error) => {
        console.error('Error searching warehouses:', error);
      }
    });
  }

  getUniqueRegions(): string[] {
    return [...new Set(this.allHubs.map(hub => hub['Vùng']))];
  }

  isHubSelected(hub: any): boolean {
    return this.selectedHubs.some(selected => selected['ID BC'] === hub['ID BC']);
  }

  toggleHubSelection(hub: any): void {
    const index = this.selectedHubs.findIndex(selected => selected['ID BC'] === hub['ID BC']);
    if (index > -1) {
      this.selectedHubs.splice(index, 1);
    } else {
      this.selectedHubs.push(hub);
    }
  }

  clearHubSelection(): void {
    this.selectedHubs = [];
  }

  selectAllHubs(): void {
    // Select all available hubs from allHubs array
    this.selectedHubs = [...this.allHubs];
    // Update map markers
    this.updateMapMarkers();
    console.log('Selected all hubs:', this.selectedHubs.length);
  }

  async confirmHubSelection(): Promise<void> {
    this.closeHubSearchDialog();
    await this.updateMapMarkers();
    console.log('Selected hubs:', this.selectedHubs);
  }

  async removeHub(hub: any): Promise<void> {
    const index = this.selectedHubs.findIndex(selected => selected['ID BC'] === hub['ID BC']);
    if (index > -1) {
      this.selectedHubs.splice(index, 1);
      await this.updateMapMarkers();
    }
  }

  getHubTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Trung tâm': return 'bg-blue-100 text-blue-800';
      case 'Phụ trợ': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Map methods
  async initializeMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[DatasetDetail] Skipping map initialization - not in browser');
      return;
    }

    if (!this.hubMap || !this.hubMap.nativeElement) {
      console.log('[DatasetDetail] Skipping map initialization - hubMap element not found or not ready');
      return;
    }

    // Check if map is already initialized
    if (this.map) {
      console.log('[DatasetDetail] Map already initialized, skipping re-initialization');
      return;
    }

    console.log('[DatasetDetail] Starting map initialization...');

    try {
      // Dynamic import of Leaflet
      const leafletModule = await import('leaflet');
      const L = leafletModule as any;
      console.log('[DatasetDetail] Leaflet imported successfully');

      // Fix for default markers in Leaflet - use local assets
      const iconBasePath = '/images/leaflet/';
      const iconRetinaUrl = iconBasePath + 'marker-icon-2x.png';
      const iconUrl = iconBasePath + 'marker-icon.png';
      const shadowUrl = iconBasePath + 'marker-shadow.png';

      if (L.Icon && L.Icon.Default) {
        L.Icon.Default.mergeOptions({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
      } else if (L.icon) {
        const iconDefault = L.icon({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        if (L.Marker) {
          L.Marker.prototype.options.icon = iconDefault;
        }
      }

      // Create map instance
      this.map = L.map(this.hubMap.nativeElement, {
        center: [14.0583, 108.2772], // Center of Vietnam
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      console.log('[DatasetDetail] Map instance created and centered on Vietnam');

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3
      }).addTo(this.map);

      console.log('[DatasetDetail] OpenStreetMap tile layer added successfully');

      // Force map to resize and redraw after a longer delay
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('[DatasetDetail] Map size invalidated after initialization');

          // Ensure tiles are loaded properly
          if (this.map._loaded) {
            this.map.eachLayer((layer: any) => {
              if (layer.redraw) {
                layer.redraw();
              }
            });
          }
        }
      }, 300);

      // Update markers if we already have data
      if (this.selectedHubs && this.selectedHubs.length > 0) {
        console.log('[DatasetDetail] Updating markers for existing hubs after map init');
        setTimeout(() => {
          if (this.map) {
            this.updateMapMarkers();
          }
        }, 300);
      } else {
        console.log('[DatasetDetail] No hubs to display yet');
      }

    } catch (error) {
      console.error('[DatasetDetail] Error initializing map:', error);
      // Reset map on error
      this.map = null;
    }
  }

  async updateMapMarkers(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[DatasetDetail] Skipping map marker update - not in browser');
      return;
    }

    if (!this.map) {
      console.log('[DatasetDetail] Skipping map marker update - map not initialized yet');
      return;
    }

    console.log('[DatasetDetail] Starting map marker update process for', this.selectedHubs.length, 'hubs');

    try {
      const L = await import('leaflet');
      console.log('[DatasetDetail] Leaflet imported for marker update');

      // Clear existing markers
      console.log('[DatasetDetail] Clearing', this.hubMarkers.length, 'existing markers');
      this.hubMarkers.forEach(marker => {
        if (this.map && this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      });
      this.hubMarkers = [];

      // Add markers for selected hubs
      let validHubsCount = 0;
      this.selectedHubs.forEach((hub, index) => {
        console.log('[DatasetDetail] Processing hub', index, hub['Tên BC']);

        if (hub['Lng'] && hub['Lat'] && typeof hub['Lat'] === 'number' && typeof hub['Lng'] === 'number') {
          const lat = hub['Lat'];
          const lng = hub['Lng'];

          if (lat !== 0 && lng !== 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            try {
              const marker = L.marker([lat, lng])
                .addTo(this.map)
                .bindPopup('<div class="p-2 max-w-xs"><h3 class="font-semibold text-sm mb-1">' + (hub['Tên BC'] || 'Unknown') + '</h3><p class="text-xs text-gray-600 mb-1">ID: ' + (hub['ID BC'] || 'N/A') + '</p><p class="text-xs text-gray-600 mb-1">' + (hub['Quận/Huyện'] || '') + ', ' + (hub['Tỉnh'] || '') + '</p><p class="text-xs text-gray-600">Vùng: ' + (hub['Vùng'] || 'N/A') + '</p></div>');
              this.hubMarkers.push(marker);
              validHubsCount++;
              console.log('[DatasetDetail] Added marker for', hub['Tên BC']);
            } catch (markerError) {
              console.error('[DatasetDetail] Error creating marker for', hub['Tên BC'], markerError);
            }
          } else {
            console.warn('[DatasetDetail] Skipping hub', hub['Tên BC'], '- invalid coordinates:', { lat, lng });
          }
        } else {
          console.warn('[DatasetDetail] Skipping hub', hub['Tên BC'], '- missing coordinates:', { lat: hub['Lat'], lng: hub['Lng'] });
        }
      });

      console.log('[DatasetDetail] Successfully added', validHubsCount, 'markers out of', this.selectedHubs.length, 'hubs');

      // Fit map to show all markers if we have any
      if (this.hubMarkers.length > 0) {
        try {
          const group = L.featureGroup(this.hubMarkers);
          const bounds = group.getBounds();
          if (bounds.isValid()) {
            this.map.fitBounds(bounds.pad(0.1));
            console.log('[DatasetDetail] Fitted map bounds to show all markers');
          } else {
            console.warn('[DatasetDetail] Invalid bounds for markers, skipping fitBounds');
          }
        } catch (boundsError) {
          console.error('[DatasetDetail] Error fitting map bounds:', boundsError);
        }
      } else {
        console.log('[DatasetDetail] No valid markers to fit bounds');
      }

    } catch (error) {
      console.error('[DatasetDetail] Error updating map markers:', error);
    }
  }

  // Force refresh map markers (useful for debugging)
  forceRefreshMarkers(): void {
    if (this.map && this.selectedHubs.length > 0) {
      console.log('[DatasetDetail] Force refreshing markers...');
      this.updateMapMarkers();
    } else {
      console.warn('[DatasetDetail] Cannot refresh markers - map not ready or no hubs selected');
    }
  }

  // Force refresh map display
  forceRefreshMap(): void {
    if (this.map) {
      console.log('[DatasetDetail] Force refreshing map display...');
      this.map.invalidateSize();

      // Force redraw tiles
      setTimeout(() => {
        if (this.map) {
          this.map.eachLayer((layer: any) => {
            if (layer.redraw) {
              layer.redraw();
            }
          });
          console.log('[DatasetDetail] Map layers redrawn');
        }
      }, 100);
    } else {
      console.warn('[DatasetDetail] Cannot refresh map - map not initialized');
    }
  }
  editDataset(): void {
    if (this.datasetId) {
      this.router.navigate(['/datasets', this.datasetId, 'edit']);
    }
  }

  toggleMetadata(): void {
    this.showMetadata = !this.showMetadata;
  }

  selectHubForDetail(hub: any): void {
    this.selectedHubDetail = hub;
  }

  closeHubDetail(): void {
    this.selectedHubDetail = null;
  }

  getHubInitials(hub: any): string {
    const name = hub['Tên BC'] || hub.name || '';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return 'BC';
  }
}