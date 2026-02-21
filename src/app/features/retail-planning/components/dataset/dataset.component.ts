import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
// PrimeNG modules used by the DataView-based warehouses list
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import Chart from 'chart.js/auto';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { DatasetService, Dataset, DatasetListResponse, Warehouse } from '../../services/dataset.service';
import { DatasetDetailComponent } from '../dataset-detail/dataset-detail.component';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { Subject, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

interface DatasetState {
  size: number;
  offset: number;
  total: number;
  q: string;
  type: string;
  viewMode: 'grid' | 'table';
}

interface TypeConfig {
  color: string;
  bgLight: string;
  bgDark: string;
  border: string;
  text: string;
  textDark: string;
  badge: string;
  icon: string;
}

@Component({
  selector: 'app-dataset',
  imports: [CommonModule, FormsModule, DataViewModule, TagModule, ButtonModule, ChartModule, AutoCompleteModule, DialogModule, TableModule, DatasetDetailComponent, PageHeaderComponent],
  templateUrl: './dataset.component.html',
  styleUrl: './dataset.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetComponent implements OnInit, OnDestroy, AfterViewInit {
  state: DatasetState = {
    size: 12,
    offset: 0,
    total: 0,
    q: '',
    type: '',
    viewMode: 'grid'
  };

  datasets: Dataset[] = [];
  loading = false;
  error: string | null = null;
  fallbackNotice: string | null = null;

  // Warehouses state
  warehouses: Warehouse[] = [];
  loadingWarehouses = false;
  warehousesError: string | null = null;
  warehouseSearchQuery = '';
  warehousePageSize = 10;
  warehouseCurrentPage = 1;
  warehouseTotal = 0;

  // Search debounce
  private warehouseSearchSubject = new Subject<string>();
  private datasetSearchSubject = new Subject<string>();

  // Autocomplete (server-side) for warehouses
  warehouseSuggestions: any[] = [];
  warehouseAutoLoading = false;
  private warehouseAutoCompleteSubject = new Subject<string>();
  private warehouseAutoSub: any = null;

  // Region shortname for warehouse queries (default HNO). Can be edited from UI.
  warehouseRegionShortname = 'HNO';

  // Available regions for selection
  availableRegions = [
    { code: 'HNO', name: 'Ha Noi' },
    { code: 'HCM', name: 'Ho Chi Minh' },
    { code: 'HPG', name: 'Hai Phong' },
    { code: 'DAD', name: 'Da Nang' },
    { code: 'CXR', name: 'Can Tho' },
    { code: 'HAN', name: 'Ha Nam' },
    { code: 'VPC', name: 'Vinh Phuc' },
    { code: 'HPH', name: 'Hai Phong' },
    { code: 'QNH', name: 'Quang Ninh' },
    { code: 'BNH', name: 'Bac Ninh' }
  ];

  // Computed paged warehouses for display (ensures we show at most `warehousePageSize` items per page
  // even if the service returns all items). If API already paginates, this will simply return the page.
  get pagedWarehouses(): Warehouse[] {
    if (!this.warehouses) return [];
    const start = (this.warehouseCurrentPage - 1) * this.warehousePageSize;
    return this.warehouses.slice(start, start + this.warehousePageSize);
  }

  /**
   * Initialize or update Chart.js charts based on `this.demands` data.
   */
  private updateCharts(): void {
    // Destroy existing charts first to allow re-rendering
    this.destroyCharts();

    // Allow charts to render even without demands if we have shiftRatios
    // Charts will use shiftRatios data if available
    if ((!this.demands || this.demands.length === 0) && (!this.shiftRatios || this.shiftRatios.length === 0)) {
      return;
    }

    // Summary chart - DOUGHNUT chart with orange color
    // Show data for selected demand if available, otherwise show aggregated data
    try {
      if (this.demandSummaryCanvas && this.demandSummaryCanvas.nativeElement) {
        const ctx = this.demandSummaryCanvas.nativeElement.getContext('2d');
        if (ctx) {
          // Use selected demand data if available, otherwise use aggregated data
          let pickValue = 0;
          let deliverValue = 0;
          let labels: string[] = [];
          
          if (this.selectedDemand) {
            // Show data for selected warehouse
            pickValue = this.selectedDemand.total_pick || 0;
            deliverValue = this.selectedDemand.total_deliver || 0;
            labels = ['Total Pick', 'Total Deliver'];
          } else {
            // Show aggregated data for all demands
            pickValue = this.demands.reduce((sum, d) => sum + (d.total_pick || 0), 0);
            deliverValue = this.demands.reduce((sum, d) => sum + (d.total_deliver || 0), 0);
            labels = ['Total Pick', 'Total Deliver'];
          }

          // Destroy existing chart if any
          if (this.demandSummaryChart) {
            try {
              this.demandSummaryChart.destroy();
            } catch (e) {
              console.error('[Dataset] Error destroying existing summary chart', e);
            }
          }

          this.demandSummaryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [
                {
                  label: 'Pick/Deliver Ratio',
                  data: [pickValue, deliverValue],
                  backgroundColor: [
                    'rgba(249, 115, 22, 0.9)',    // orange for pick
                    'rgba(0, 0, 0, 0.8)',         // black for deliver
                  ],
                  borderColor: [
                    'rgba(255, 255, 255, 1)',     // white border
                    'rgba(255, 255, 255, 1)',     // white border
                  ],
                  borderWidth: 3
                }
              ]
            },
            options: {
              responsive: false,
              maintainAspectRatio: false,
              aspectRatio: undefined,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                  labels: {
                    font: {
                      size: 12,
                      weight: 'bold' as const
                    },
                    padding: 15,
                    usePointStyle: true
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      const total = pickValue + deliverValue;
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                      return `${label}: ${new Intl.NumberFormat('en-US').format(value)} (${percentage}%)`;
                    }
                  }
                }
              },
              // Custom plugin to display percentage on chart
              animation: {
                onComplete: () => {
                  const chart = this.demandSummaryChart;
                  if (!chart) return;
                  
                  const chartCtx = chart.ctx;
                  const chartArea = chart.chartArea;
                  const centerX = (chartArea.left + chartArea.right) / 2;
                  const centerY = (chartArea.top + chartArea.bottom) / 2;
                  
                  chart.data.datasets.forEach((dataset: any) => {
                    const meta = chart.getDatasetMeta(0);
                    meta.data.forEach((element: any, index: number) => {
                      const model = element;
                      const value = dataset.data[index];
                      const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                      
                      // Calculate position for label (center of each segment)
                      const angle = (model.startAngle + model.endAngle) / 2;
                      const radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
                      const x = centerX + Math.cos(angle) * radius;
                      const y = centerY + Math.sin(angle) * radius;
                      
                      // Draw percentage text with shadow for better visibility
                      chartCtx.save();
                      chartCtx.font = 'bold 18px Arial';
                      chartCtx.fillStyle = '#ffffff';
                      chartCtx.textAlign = 'center';
                      chartCtx.textBaseline = 'middle';
                      chartCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                      chartCtx.shadowBlur = 4;
                      chartCtx.shadowOffsetX = 1;
                      chartCtx.shadowOffsetY = 1;
                      chartCtx.fillText(`${percentage}%`, x, y);
                      chartCtx.restore();
                    });
                  });
                }
              }
            }
          });
        }
      }
    } catch (e) {
      console.error('[Dataset] Error creating demand summary chart', e);
    }

    // Pickup time distribution by shift - POLAR AREA chart (from shiftRatios)
    try {
      // Use shiftRatios data with total_pick values
      let labels: string[] = [];
      let pickupByShift: number[] = [];
      let pickupRatios: number[] = [];

      if (this.shiftRatios && this.shiftRatios.length > 0) {
        // Get data from shiftRatios API - use total_pick for polar area chart
        labels = this.shiftRatios.map((r: any) => r.shift_name || r.shift?.name || 'Ca');
        pickupByShift = this.shiftRatios.map((r: any) => {
          return r.total_pick || 0;
        });
        pickupRatios = this.shiftRatios.map((r: any) => {
          return r.pick_ratio ? r.pick_ratio * 100 : 0;
        });
      } else {
        return; // No data available
      }

      if (!this.demandPickupTimeCanvas || !this.demandPickupTimeCanvas.nativeElement) {
        console.warn('[Dataset] Pickup canvas not available');
        return;
      }
      
      const ctx2 = this.demandPickupTimeCanvas.nativeElement.getContext('2d');
      if (ctx2) {
        // Destroy existing chart if any
        if (this.demandPickupTimeChart) {
          try {
            this.demandPickupTimeChart.destroy();
          } catch (e) {
            console.error('[Dataset] Error destroying existing pickup chart', e);
          }
        }

        // Orange color palette for shifts
        const orangeColors = [
          'rgba(249, 115, 22, 0.9)',   // orange-500
          'rgba(251, 146, 60, 0.9)',   // orange-400
          'rgba(234, 88, 12, 0.9)',    // orange-600
          'rgba(194, 65, 12, 0.9)'     // orange-700
        ];

        this.demandPickupTimeChart = new Chart(ctx2, {
          type: 'polarArea',
          data: {
            labels,
            datasets: [{
              label: 'Total Pick (kg)',
              data: pickupByShift,
              backgroundColor: labels.map((_, i) => orangeColors[i % orangeColors.length]),
              borderColor: '#ffffff',
              borderWidth: 3
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            aspectRatio: undefined,
            plugins: {
              legend: {
                position: 'bottom' as const,
                labels: {
                  font: {
                    size: 12,
                    weight: 'bold' as const
                  },
                  padding: 15,
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const index = context.dataIndex;
                    const percentage = pickupRatios[index] || 0;
                    return `${label}: ${new Intl.NumberFormat('en-US').format(value)} kg (${percentage.toFixed(1)}%)`;
                  }
                }
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.15)',
                  lineWidth: 1
                },
                pointLabels: {
                  font: {
                    size: 12,
                    weight: 'bold' as const
                  },
                  color: 'rgba(0, 0, 0, 0.8)',
                  padding: 8
                },
                ticks: {
                  display: true,
                  stepSize: undefined, // Auto step size
                  font: {
                    size: 10,
                    weight: 'normal' as const
                  },
                  color: 'rgba(0, 0, 0, 0.6)',
                  backdropColor: 'rgba(255, 255, 255, 0.9)',
                  backdropPadding: 4,
                  z: 1,
                  callback: function(value: any) {
                    // Format value with compact notation for large numbers
                    if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + 'M';
                    } else if (value >= 1000) {
                      return (value / 1000).toFixed(1) + 'K';
                    }
                    return value.toString();
                  }
                },
                angleLines: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)',
                  lineWidth: 1
                }
              }
            },
            // Custom plugin to display percentage on chart
            animation: {
              onComplete: () => {
                const chart = this.demandPickupTimeChart;
                if (!chart) return;
                
                const chartCtx = chart.ctx;
                const chartArea = chart.chartArea;
                const centerX = (chartArea.left + chartArea.right) / 2;
                const centerY = (chartArea.top + chartArea.bottom) / 2;
                
                const meta = chart.getDatasetMeta(0);
                meta.data.forEach((element: any, index: number) => {
                  const model = element;
                  const percentage = pickupRatios[index] || 0;
                  
                  // Calculate position for label (center of each segment)
                  // For polar area, we use the angle and radius
                  const angle = (model.startAngle + model.endAngle) / 2;
                  const radius = model.outerRadius * 0.6; // Position at 60% of radius
                  const x = centerX + Math.cos(angle) * radius;
                  const y = centerY + Math.sin(angle) * radius;
                  
                  // Draw percentage text with shadow for better visibility
                  chartCtx.save();
                  chartCtx.font = 'bold 16px Arial';
                  chartCtx.fillStyle = '#ffffff';
                  chartCtx.textAlign = 'center';
                  chartCtx.textBaseline = 'middle';
                  chartCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                  chartCtx.shadowBlur = 4;
                  chartCtx.shadowOffsetX = 1;
                  chartCtx.shadowOffsetY = 1;
                  chartCtx.fillText(`${percentage.toFixed(1)}%`, x, y);
                  chartCtx.restore();
                });
              }
            }
          }
        });
      } else {
        console.warn('[Dataset] Cannot get 2d context from pickup canvas');
      }
    } catch (e) {
      console.error('[Dataset] Error creating pickup time chart', e);
    }

    // Delivery time distribution by shift - POLAR AREA chart (from shiftRatios)
    try {
      // Use shiftRatios data with total_deliver values
      let labels: string[] = [];
      let deliveryByShift: number[] = [];
      let deliveryRatios: number[] = [];

      if (this.shiftRatios && this.shiftRatios.length > 0) {
        // Get data from shiftRatios API - use total_deliver for polar area chart
        labels = this.shiftRatios.map((r: any) => r.shift_name || r.shift?.name || 'Ca');
        deliveryByShift = this.shiftRatios.map((r: any) => {
          return r.total_deliver || 0;
        });
        deliveryRatios = this.shiftRatios.map((r: any) => {
          return r.deliver_ratio ? r.deliver_ratio * 100 : 0;
        });
      } else {
        console.log('[Dataset] No data for delivery chart - shiftRatios:', this.shiftRatios?.length);
        return; // No data available
      }

      console.log('[Dataset] Creating delivery chart with labels:', labels, 'data:', deliveryByShift);
      if (!this.demandDeliveryTimeCanvas || !this.demandDeliveryTimeCanvas.nativeElement) {
        console.warn('[Dataset] Delivery canvas not available');
        return;
      }
      
      const ctx3 = this.demandDeliveryTimeCanvas.nativeElement.getContext('2d');
      if (ctx3) {
        // Destroy existing chart if any
        if (this.demandDeliveryTimeChart) {
          try {
            this.demandDeliveryTimeChart.destroy();
          } catch (e) {
            console.error('[Dataset] Error destroying existing delivery chart', e);
          }
        }

        // Gray color palette for shifts (lighter than black)
        const blackColors = [
          'rgba(75, 85, 99, 0.9)',     // gray-600
          'rgba(107, 114, 128, 0.9)',  // gray-500
          'rgba(55, 65, 81, 0.9)',    // gray-700
          'rgba(107, 114, 128, 0.9)'  // gray-500
        ];

        this.demandDeliveryTimeChart = new Chart(ctx3, {
          type: 'polarArea',
          data: {
            labels,
            datasets: [{
              label: 'Total Deliver (kg)',
              data: deliveryByShift,
              backgroundColor: labels.map((_, i) => blackColors[i % blackColors.length]),
              borderColor: '#ffffff',
              borderWidth: 3
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            aspectRatio: undefined,
            plugins: {
              legend: {
                position: 'bottom' as const,
                labels: {
                  font: {
                    size: 12,
                    weight: 'bold' as const
                  },
                  padding: 15,
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const index = context.dataIndex;
                    const percentage = deliveryRatios[index] || 0;
                    return `${label}: ${new Intl.NumberFormat('en-US').format(value)} kg (${percentage.toFixed(1)}%)`;
                  }
                }
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.15)',
                  lineWidth: 1
                },
                pointLabels: {
                  font: {
                    size: 12,
                    weight: 'bold' as const
                  },
                  color: 'rgba(0, 0, 0, 0.8)',
                  padding: 8
                },
                ticks: {
                  display: true,
                  stepSize: undefined, // Auto step size
                  font: {
                    size: 10,
                    weight: 'normal' as const
                  },
                  color: 'rgba(0, 0, 0, 0.6)',
                  backdropColor: 'rgba(255, 255, 255, 0.9)',
                  backdropPadding: 4,
                  z: 1,
                  callback: function(value: any) {
                    // Format value with compact notation for large numbers
                    if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + 'M';
                    } else if (value >= 1000) {
                      return (value / 1000).toFixed(1) + 'K';
                    }
                    return value.toString();
                  }
                },
                angleLines: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)',
                  lineWidth: 1
                }
              }
            },
            // Custom plugin to display percentage on chart
            animation: {
              onComplete: () => {
                const chart = this.demandDeliveryTimeChart;
                if (!chart) return;
                
                const chartCtx = chart.ctx;
                const chartArea = chart.chartArea;
                const centerX = (chartArea.left + chartArea.right) / 2;
                const centerY = (chartArea.top + chartArea.bottom) / 2;
                
                const meta = chart.getDatasetMeta(0);
                meta.data.forEach((element: any, index: number) => {
                  const model = element;
                  const percentage = deliveryRatios[index] || 0;
                  
                  // Calculate position for label (center of each segment)
                  // For polar area, we use the angle and radius
                  const angle = (model.startAngle + model.endAngle) / 2;
                  const radius = model.outerRadius * 0.6; // Position at 60% of radius
                  const x = centerX + Math.cos(angle) * radius;
                  const y = centerY + Math.sin(angle) * radius;
                  
                  // Draw percentage text with shadow for better visibility
                  chartCtx.save();
                  chartCtx.font = 'bold 16px Arial';
                  chartCtx.fillStyle = '#ffffff';
                  chartCtx.textAlign = 'center';
                  chartCtx.textBaseline = 'middle';
                  chartCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                  chartCtx.shadowBlur = 4;
                  chartCtx.shadowOffsetX = 1;
                  chartCtx.shadowOffsetY = 1;
                  chartCtx.fillText(`${percentage.toFixed(1)}%`, x, y);
                  chartCtx.restore();
                });
              }
            }
          }
        });
      } else {
        console.warn('[Dataset] Cannot get 2d context from delivery canvas');
      }
    } catch (e) {
      console.error('[Dataset] Error creating delivery time chart', e);
    }

    this.chartsInitialized = true;
  }

  private destroyCharts(): void {
    try {
      if (this.demandSummaryChart) {
        try { this.demandSummaryChart.destroy(); } catch (e) { }
        this.demandSummaryChart = null;
      }
      if (this.demandPickupTimeChart) {
        try { this.demandPickupTimeChart.destroy(); } catch (e) { }
        this.demandPickupTimeChart = null;
      }
      if (this.demandDeliveryTimeChart) {
        try { this.demandDeliveryTimeChart.destroy(); } catch (e) { }
        this.demandDeliveryTimeChart = null;
      }
      if (this.demandTimelineAreaChart) {
        try { this.demandTimelineAreaChart.destroy(); } catch (e) { }
        this.demandTimelineAreaChart = null;
      }
      this.chartsInitialized = false; // Reset flag when destroying
    } catch (e) {
      console.error('[Dataset] destroyCharts error', e);
    }
  }

  // Detail view state
  datasetDetails: Dataset | null = null;
  loadingDetails = false;
  detailsError: string | null = null;

  // Selected warehouse for detail card on the right
  selectedWarehouse: Warehouse | null = null;

  // Selected demand (warehouse) from the demands table
  selectedDemand: any | null = null;

  // Selected dataset for detail view
  selectedDatasetId: string | null = null;

  // Demands data for hub datasets
  demands: any[] = [];
  loadingDemands = false;
  demandsError: string | null = null;

  // Filter and search for demands table
  demandSearchQuery = '';
  demandSortField: string | null = null;
  demandSortOrder: 'asc' | 'desc' = 'desc';

  // Date range for demands
  demandStartDate = '';
  demandEndDate = '';

  // Settings modal state
  showSettingsModal = false;
  loadingShiftRatio = false;
  shiftRatioError: string | null = null;
  shiftRatios: any[] = [];

  // Region Selection Modal State
  showRegionSelectionModal: boolean = false;
  modalSelectedRegion: string = '';
  modalWarehouses: Warehouse[] = [];
  modalSelectedWarehouses: Set<string> = new Set();
  loadingModalWarehouses: boolean = false;
  modalWarehousesError: string | null = null;

  // Region ratios
  regionRatios: any[] = [];

  // Timeline area chart data
  loadingTimelineData = false;
  timelineDataError: string | null = null;
  demandsByDays: { [date: string]: any[] } = {};
  timelineChartType: 'column' | 'line' = 'column';
  selectedTimelineWarehouseIds: string[] = []; // Empty = all warehouses
  showTimelineAverage: boolean = true;
  
  // Pagination for timeline warehouse selection table
  timelineWarehousePageSize = 10;
  timelineWarehouseCurrentPage = 1;

  // Getter to check if timeline data exists
  get hasTimelineData(): boolean {
    return this.demandsByDays && Object.keys(this.demandsByDays).length > 0;
  }

  // Getter for available warehouses from timeline data
  get availableTimelineWarehouses(): any[] {
    const warehouses = new Map<string, any>();
    Object.values(this.demandsByDays).forEach(dayData => {
      if (Array.isArray(dayData)) {
        dayData.forEach((item: any) => {
          if (item && item.warehouse_id) {
            const id = String(item.warehouse_id);
            if (!warehouses.has(id)) {
              warehouses.set(id, {
                id: id,
                warehouse_id: item.warehouse_id,
                warehouse_name: item.warehouse_name || `Warehouse ${id}`
              });
            }
          }
        });
      }
    });
    return Array.from(warehouses.values());
  }

  // Pagination for timeline warehouse selection table
  get timelineWarehouseTotalPages(): number {
    return Math.ceil(this.availableTimelineWarehouses.length / this.timelineWarehousePageSize);
  }

  get paginatedAvailableTimelineWarehouses(): any[] {
    const start = (this.timelineWarehouseCurrentPage - 1) * this.timelineWarehousePageSize;
    const end = start + this.timelineWarehousePageSize;
    return this.availableTimelineWarehouses.slice(start, end);
  }

  getTimelineWarehousePageStart(): number {
    return (this.timelineWarehouseCurrentPage - 1) * this.timelineWarehousePageSize + 1;
  }

  getTimelineWarehousePageEnd(): number {
    const end = this.timelineWarehouseCurrentPage * this.timelineWarehousePageSize;
    return Math.min(end, this.availableTimelineWarehouses.length);
  }

  goToTimelineWarehousePreviousPage(): void {
    if (this.timelineWarehouseCurrentPage > 1) {
      this.timelineWarehouseCurrentPage--;
      this.cdr.markForCheck();
    }
  }

  goToTimelineWarehouseNextPage(): void {
    if (this.timelineWarehouseCurrentPage < this.timelineWarehouseTotalPages) {
      this.timelineWarehouseCurrentPage++;
      this.cdr.markForCheck();
    }
  }

  // Chart visibility toggles
  chartShowPick = true;
  chartShowDeliver = true;
  chartShowAvgPick = true;
  chartShowAvgDeliver = true;
  chartSize: 'small' | 'medium' | 'large' = 'large';
  chartType: 'bar' | 'line' = 'bar';

  // Timeline for selected warehouses
  timelineWarehouses: Warehouse[] = [];
  
  // Timeline pagination
  timelinePageSize = 10;
  timelineCurrentPage = 1;
  
  get timelineTotalPages(): number {
    return Math.ceil(this.timelineWarehouses.length / this.timelinePageSize);
  }
  
  get paginatedTimelineWarehouses(): Warehouse[] {
    const start = (this.timelineCurrentPage - 1) * this.timelinePageSize;
    const end = start + this.timelinePageSize;
    return this.timelineWarehouses.slice(start, end);
  }
  
  getTimelinePageStart(): number {
    return (this.timelineCurrentPage - 1) * this.timelinePageSize + 1;
  }
  
  getTimelinePageEnd(): number {
    return Math.min(this.timelineCurrentPage * this.timelinePageSize, this.timelineWarehouses.length);
  }
  
  goToTimelinePreviousPage(): void {
    if (this.timelineCurrentPage > 1) {
      this.timelineCurrentPage--;
      this.cdr.markForCheck();
    }
  }
  
  goToTimelineNextPage(): void {
    if (this.timelineCurrentPage < this.timelineTotalPages) {
      this.timelineCurrentPage++;
      this.cdr.markForCheck();
    }
  }

  // Shift editor state
  shifts: Array<{ name: string; start_hour: number; end_hour: number }> = [
    { name: 'morning', start_hour: 6, end_hour: 10 },
    { name: 'noon', start_hour: 10, end_hour: 14 },
    { name: 'afternoon', start_hour: 14, end_hour: 18 },
    { name: 'evening', start_hour: 18, end_hour: 22 }
  ];
  shiftErrors: string[] = [];

  // Utility hours arrays for select inputs
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  hoursInclusive: number[] = Array.from({ length: 25 }, (_, i) => i);

  // Chart related
  @ViewChild('demandSummaryCanvas', { static: false }) demandSummaryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandPickupTimeCanvas', { static: false }) demandPickupTimeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandDeliveryTimeCanvas', { static: false }) demandDeliveryTimeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demandTimelineAreaCanvas', { static: false }) demandTimelineAreaCanvas!: ElementRef<HTMLCanvasElement>;
  private demandSummaryChart: any = null;
  private demandPickupTimeChart: any = null;
  private demandDeliveryTimeChart: any = null;
  private demandTimelineAreaChart: any = null;
  private chartsInitialized = false; // Flag to prevent re-rendering

  // SVG icons for different warehouse types with enhanced design
  warehouseIcons: Record<string, string> = {
    hub: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="hubShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="hubShine" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#hubGradient)" filter="url(#hubShadow)"/>
      <circle cx="20" cy="20" r="18" fill="url(#hubShine)"/>
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <path d="M13 11h14v16h-14z" fill="white" opacity="0.95" rx="2"/>
      <path d="M15 18h10v8h-10z" fill="#4f46e5" opacity="0.8"/>
      <circle cx="20" cy="20" r="2.5" fill="white"/>
    </svg>`,
    sorting: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="sortingShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="sortingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="sortingShine" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#sortingGradient)" filter="url(#sortingShadow)"/>
      <circle cx="20" cy="20" r="18" fill="url(#sortingShine)"/>
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <rect x="11" y="12" width="18" height="12" rx="2" fill="white" opacity="0.95"/>
      <rect x="13" y="14" width="14" height="8" fill="#2563eb" opacity="0.8" rx="1"/>
      <circle cx="20" cy="20" r="1.5" fill="white"/>
    </svg>`,
    delivery: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="deliveryShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="deliveryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="deliveryShine" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#deliveryGradient)" filter="url(#deliveryShadow)"/>
      <circle cx="20" cy="20" r="18" fill="url(#deliveryShine)"/>
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <path d="M11 20h18l-2.5-8h-13l-2.5 8z" fill="white" opacity="0.95"/>
      <circle cx="14" cy="26" r="2.5" fill="white"/>
      <circle cx="26" cy="26" r="2.5" fill="white"/>
      <path d="M20 10v6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    transit: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="transitShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="transitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="transitShine" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#transitGradient)" filter="url(#transitShadow)"/>
      <circle cx="20" cy="20" r="18" fill="url(#transitShine)"/>
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <rect x="12" y="12" width="16" height="12" rx="2" fill="white" opacity="0.95"/>
      <rect x="14" y="15" width="12" height="8" fill="#d97706" opacity="0.8" rx="1"/>
      <circle cx="20" cy="20" r="2" fill="white"/>
    </svg>`,
    ktc: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ktcShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="ktcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c084fc;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="ktcShine" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#ktcGradient)" filter="url(#ktcShadow)"/>
      <circle cx="20" cy="20" r="18" fill="url(#ktcShine)"/>
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <rect x="11" y="13" width="18" height="12" rx="2" fill="white" opacity="0.95"/>
      <text x="20" y="23" text-anchor="middle" fill="#7c3aed" font-size="10" font-weight="bold" font-family="Arial">KTC</text>
    </svg>`,
    kct: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="kctShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="kctGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f472b6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="kctShine" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#kctGradient)" filter="url(#kctShadow)"/>
      <circle cx="20" cy="20" r="18" fill="url(#kctShine)"/>
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <rect x="11" y="13" width="18" height="12" rx="2" fill="white" opacity="0.95"/>
      <text x="20" y="23" text-anchor="middle" fill="#ec4899" font-size="10" font-weight="bold" font-family="Arial">KCT</text>
    </svg>`,
    default: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="defaultShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9ca3af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6b7280;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="defaultShine" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#defaultGradient)" filter="url(#defaultShadow)"/>
      <circle cx="20" cy="20" r="18" fill="url(#defaultShine)"/>
      <circle cx="20" cy="20" r="16" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
      <rect x="12" y="12" width="16" height="14" rx="2" fill="white" opacity="0.9"/>
      <circle cx="20" cy="20" r="3" fill="#6b7280"/>
    </svg>`
  };

  selectWarehouse(warehouse: Warehouse): void {
    this.selectedWarehouse = warehouse;
    this.cdr.markForCheck();
  }

  addToTimeline(warehouse: Warehouse): void {
    if (!this.timelineWarehouses.find(w => (w.warehouse_id || w.id) === (warehouse.warehouse_id || warehouse.id))) {
      this.timelineWarehouses.push(warehouse);
      this.cdr.markForCheck();
      // Reload datasets when timeline changes
      this.loadDatasets();
      // If currently viewing demands dataset, reload demands so names map to timeline
      if (this.selectedDatasetId === 'demand') {
        this.loadDemands();
      }

      // If shifts are configured, call the shifts API to update demands by shift
      if (this.validateShifts()) {
        this.runShiftsQuery();
      }
    }
  }

  addAllToTimeline(): void {
    let addedCount = 0;
    for (const warehouse of this.warehouses) {
      if (!this.timelineWarehouses.find(w => (w.warehouse_id || w.id) === (warehouse.warehouse_id || warehouse.id))) {
        this.timelineWarehouses.push(warehouse);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      this.cdr.markForCheck();
      // Reload datasets when timeline changes
      this.loadDatasets();
      // If currently viewing demands dataset, reload demands so names map to timeline
      if (this.selectedDatasetId === 'demand') {
        this.loadDemands();
        // Reload shift ratios when warehouses are added to timeline
        if (this.timelineWarehouses.length > 0) {
          this.loadShiftRatios();
      this.loadDemandsByDays();
        }
      }
      console.log(`[Dataset] Added ${addedCount} warehouses to timeline`);
    }
  }

  removeFromTimeline(warehouse: Warehouse): void {
    const index = this.timelineWarehouses.findIndex(w => (w.warehouse_id || w.id) === (warehouse.warehouse_id || warehouse.id));
    if (index > -1) {
      this.timelineWarehouses.splice(index, 1);
      
      // Reset pagination to first page if current page is empty
      const newTotalPages = Math.ceil(this.timelineWarehouses.length / this.timelinePageSize);
      if (this.timelineCurrentPage > newTotalPages) {
        this.timelineCurrentPage = newTotalPages || 1;
      }
      
      this.cdr.markForCheck();
      // Reload datasets when timeline changes
      this.loadDatasets();
      // If currently viewing demands dataset, reload demands so names map to timeline
      if (this.selectedDatasetId === 'demand') {
        this.loadDemands();
      }

      // Re-run shifts query if shifts are configured
      if (this.timelineWarehouses.length > 0 && this.validateShifts()) {
        this.runShiftsQuery();
      }

      // Load demands by days for timeline chart
      if (this.timelineWarehouses.length > 0) {
        this.loadDemandsByDays();
      }
    }
  }

  isInTimeline(warehouse: Warehouse): boolean {
    return this.timelineWarehouses.some(w => (w.warehouse_id || w.id) === (warehouse.warehouse_id || warehouse.id));
  }

  isWarehouseSelected(w: Warehouse): boolean {
    if (!w || !this.selectedWarehouse) return false;
    return (w.warehouse_id || w.id) === (this.selectedWarehouse.warehouse_id || this.selectedWarehouse.id);
  }

  // Type-specific styling configuration (Data Mesh visual differentiation)
  typeConfig: Record<string, TypeConfig> = {
    truck: {
      color: 'orange',
      bgLight: 'bg-orange-50',
      bgDark: 'bg-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-700',
      textDark: 'text-orange-900',
      badge: 'bg-orange-500',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>`
    },
    demand: {
      color: 'orange',
      bgLight: 'bg-orange-50',
      bgDark: 'bg-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-700',
      textDark: 'text-orange-900',
      badge: 'bg-orange-500',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`
    },
    trip: {
      color: 'orange',
      bgLight: 'bg-orange-50',
      bgDark: 'bg-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-700',
      textDark: 'text-orange-900',
      badge: 'bg-orange-500',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>`
    },
    hub: {
      color: 'orange',
      bgLight: 'bg-orange-50',
      bgDark: 'bg-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-700',
      textDark: 'text-orange-900',
      badge: 'bg-orange-500',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
    },
    default: {
      color: 'gray',
      bgLight: 'bg-gray-50',
      bgDark: 'bg-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-700',
      textDark: 'text-gray-900',
      badge: 'bg-gray-500',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>`
    }
  };

  constructor(private datasetService: DatasetService, private router: Router, private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnDestroy(): void {
    // Clean up search subscription
    this.warehouseSearchSubject.unsubscribe();

    // Clean up autocomplete subscription
    if (this.warehouseAutoSub && this.warehouseAutoSub.unsubscribe) {
      try { this.warehouseAutoSub.unsubscribe(); } catch (e) { }
    }

    // Clean up date change timeout
    if (this.dateChangeTimeout) {
      clearTimeout(this.dateChangeTimeout);
      this.dateChangeTimeout = null;
    }

  }

  ngOnInit(): void {
    // Ensure selectedDatasetId is null to show the list view
    this.selectedDatasetId = null;
    
    // Set default values for date range and region
    const { start, end } = this.getDefaultDateRange();
    this.demandStartDate = start;
    this.demandEndDate = end;
    this.warehouseRegionShortname = 'HNO';
    
    // Load datasets on init
    this.loadDatasets();
    
    // Trigger change detection after initialization
    this.cdr.markForCheck();
    
    console.log('[Dataset] ngOnInit - selectedDatasetId:', this.selectedDatasetId, 'loading:', this.loading);

    // Setup search debounce
    this.warehouseSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchQuery => {
        this.warehouseSearchQuery = searchQuery;
        this.warehouseCurrentPage = 1; // Reset to first page
        this.loadWarehouses();
      });

    this.datasetSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchQuery => {
        this.state.q = searchQuery;
        this.state.offset = 0; // Reset to first page
        this.loadDatasets();
      });

    // Autocomplete server-side search subscription
    this.warehouseAutoSub = this.warehouseAutoCompleteSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q: string) => {
        if (!q || q.length < 1) return of([]);
        this.warehouseAutoLoading = true;
        return this.datasetService.getWarehouses({ region_shortname: this.warehouseRegionShortname, size: 5, search: q }).pipe(
          map((resp: any) => {
            this.warehouseAutoLoading = false;
            const respAny: any = resp as any;
            return Array.isArray(respAny.data) ? respAny.data : (respAny.data?.data || []);
          }),
          catchError((err: any) => {
            console.error('[Dataset] warehouse autocomplete error', err);
            this.warehouseAutoLoading = false;
            return of([]);
          })
        );
      })
    ).subscribe((results: any[]) => {
      // Limit suggestions shown to 5 items
      this.warehouseSuggestions = (results || []).slice(0, 5);
      this.cdr.markForCheck();
    });

    // Load shift ratios on init - DISABLED
    // this.loadShiftRatios();
  }

  async ngAfterViewInit(): Promise<void> {
    // Wait a bit to ensure DOM is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    // Ensure selectedDatasetId is still null (don't auto-select)
    if (this.selectedDatasetId !== null) {
      console.warn('[Dataset] ngAfterViewInit - selectedDatasetId was set to:', this.selectedDatasetId, 'resetting to null');
      this.selectedDatasetId = null;
    }
    this.cdr.markForCheck();
  }

  /**
   * Load warehouses from API
   */
  loadWarehouses(): void {
    this.loadingWarehouses = true;
    this.warehousesError = null;

    const params = {
      region_shortname: this.warehouseRegionShortname,
      size: this.warehousePageSize,
      offset: (this.warehouseCurrentPage - 1) * this.warehousePageSize,
      search: this.warehouseSearchQuery || ''
    };

    this.datasetService.getWarehouses(params).subscribe({
      next: (response) => {
        console.log('[Dataset] Warehouses API Response:', response);
        if (response.ok && response.data) {
          // Support both response shapes:
          // 1) API returns raw array: response.data = [ { ... }, ... ]
          // 2) API returns envelope: response.data = { data: [ ... ], meta: { total } }
          const respAny: any = response as any;
          const warehousesData = Array.isArray(respAny.data) ? respAny.data : (respAny.data?.data || []);
          this.warehouses = warehousesData || [];
          // Determine total: prefer meta.total when available, otherwise length
          if (Array.isArray(respAny.data)) {
            this.warehouseTotal = respAny.data.length;
          } else {
            this.warehouseTotal = respAny.data?.meta?.total || this.warehouses.length;
          }
          console.log('[Dataset] Loaded warehouses:', this.warehouses.length);
          // Auto-select the first warehouse for the details card if none selected yet
          const firstVisible = this.pagedWarehouses && this.pagedWarehouses.length > 0 ? this.pagedWarehouses[0] : (this.warehouses[0] || null);
          if (!this.selectedWarehouse && firstVisible) {
            this.selectedWarehouse = firstVisible;
          }
        } else {
          this.warehousesError = 'Failed to load warehouses';
          console.error('[Dataset] Invalid warehouses response:', response);
        }
        this.loadingWarehouses = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.warehousesError = error.message || 'Failed to load warehouses';
        this.loadingWarehouses = false;
        console.error('[Dataset] Load warehouses error:', error);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Open dataset details modal (loads fresh details from API)
   */
  openDetails(dataset: Dataset): void {
    if (!dataset || !dataset.id) return;
    this.datasetDetails = null;
    this.loadingDetails = true;
    this.detailsError = null;

    this.datasetService.getDataset(dataset.id).subscribe({
      next: (resp) => {
        if (resp.ok && resp.data) {
          // Handle both direct object and envelope responses
          const datasetData = resp.data.data || resp.data;
          this.datasetDetails = datasetData as Dataset;
        } else {
          this.detailsError = 'Failed to load Data Product details';
          console.error('[Dataset] getDataset invalid response:', resp);
        }
        this.loadingDetails = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.detailsError = err?.message || 'Failed to load details';
        this.loadingDetails = false;
        this.cdr.markForCheck();
        console.error('[Dataset] getDataset error:', err);
      }
    });
  }

  closeDetails(): void {
    this.datasetDetails = null;
    this.detailsError = null;
    this.loadingDetails = false;
    this.selectedDatasetId = null;
    this.demands = [];
    this.demandsError = null;
    this.loadingDemands = false;
    this.chartsInitialized = false; // Reset flag
    // Destroy any existing charts when closing details
    this.destroyCharts();
  }

  getTypeConfig(type: string): TypeConfig {
    return this.typeConfig[type] || this.typeConfig['default'];
  }

  trackByDatasetId(index: number, dataset: Dataset): string {
    return dataset.id;
  }

  loadDatasets(): void {
    this.loading = true;
    this.error = null;
    this.fallbackNotice = null;

    const params = {
      size: this.state.size,
      offset: this.state.offset,
      q: this.state.q || undefined,
      type: this.state.type || undefined
    };

    this.datasetService.getDatasets(params).subscribe({
      next: (response) => {
        console.log('[Dataset] API Response:', response);
        console.log('[Dataset] Response data:', response.data);
        if (response.ok && response.data) {
          // API returns: { code, message, data: [...], meta: {...} }
          this.datasets = response.data.data || [];
          this.state.total = response.data.meta?.total || 0;
          this.fallbackNotice = null;
          console.log('[Dataset] Loaded datasets:', this.datasets.length);
          console.log('[Dataset] selectedDatasetId:', this.selectedDatasetId, 'should show list:', !this.selectedDatasetId);
        } else {
          console.error('[Dataset] Invalid response, using fallback datasets:', response);
          this.applyDefaultDatasets('Unable to fetch datasets from API. Showing default data.');
        }
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: (error) => {
        console.error('[Dataset] Load error, using fallback datasets:', error);
        this.applyDefaultDatasets('Dataset API unavailable. Showing default data.');
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection
      }
    });
  }

  onSearch(): void {
    this.state.offset = 0; // Reset to first page
    this.loadDatasets();
  }

  onTypeFilter(type: string): void {
    this.state.type = type;
    this.state.offset = 0;
    this.loadDatasets();
  }

  onPageChange(page: number): void {
    this.state.offset = (page - 1) * this.state.size;
    this.loadDatasets();
  }

  toggleViewMode(): void {
    this.state.viewMode = this.state.viewMode === 'grid' ? 'table' : 'grid';
  }

  getQualityColor(quality: number): string {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  createDataset(): void {
    // Navigate to dataset form for creating new dataset
    this.router.navigate(['/dataset-form']);
  }

  viewDataset(dataset: Dataset): void {
    if (dataset.type === 'demand') {
      // For demand datasets, show demands view
      this.selectedDatasetId = 'demand';
      this.loadDemands();
      // Load shift ratios with default values when selecting demand dataset
      this.loadShiftRatios();
      this.loadDemandsByDays();
    } else {
      // For other datasets, show details
      this.selectedDatasetId = dataset.id;
    }
    this.cdr.markForCheck();
  }

  viewDemandDataset(): void {
    // Helper method to view demand dataset without needing to create Dataset object in template
    this.selectedDatasetId = 'demand';
    this.loadDemands();
    this.loadShiftRatios();
    this.loadDemandsByDays();
    this.cdr.markForCheck();
  }

  getRegionName(code: string): string {
    const region = this.availableRegions.find(r => r.code === code);
    return region ? region.name : code;
  }

  getFormattedShifts(): string {
    if (!this.shifts || this.shifts.length === 0) {
      return '-';
    }
    return this.shifts.map(s => {
      const startHour = String(Math.floor(s.start_hour)).padStart(2, '0');
      const endHour = String(Math.floor(s.end_hour)).padStart(2, '0');
      return `${s.name || 'Ca'} (${startHour}:00 - ${endHour}:00)`;
    }).join(', ');
  }
  
  formatShiftTime(shift: { name?: string; start_hour: number; end_hour: number }): string {
    const startHour = String(Math.floor(shift.start_hour)).padStart(2, '0');
    const endHour = String(Math.floor(shift.end_hour)).padStart(2, '0');
    return `${startHour}:00 - ${endHour}:00`;
  }

  onInfoTableRegionChange(): void {
    // When region changes in info table, update warehouseRegionShortname
    // but don't auto-add warehouses - user needs to click "Add all" or search
    this.cdr.markForCheck();
  }

  addAllWarehousesFromRegion(): void {
    if (!this.warehouseRegionShortname) return;

    this.loadingWarehouses = true;
    this.warehousesError = null;

    const params = {
      region_shortname: this.warehouseRegionShortname,
      size: 1000,
      offset: 0,
      search: ''
    } as any;

    this.datasetService.getWarehouses(params).subscribe({
      next: (response) => {
        try {
          const respAny: any = response as any;
          const warehousesData = Array.isArray(respAny.data) ? respAny.data : (respAny.data?.data || []);
          const warehouses = warehousesData || [];

          // Add all warehouses to timeline (avoid duplicates)
          let addedCount = 0;
          for (const wh of warehouses) {
            if (!this.isInTimeline(wh)) {
              this.timelineWarehouses.push(wh);
              addedCount++;
            }
          }

          console.log(`[Dataset] Added ${addedCount} warehouses from region ${this.warehouseRegionShortname}`);

          // Reload demands if demand view is active
          if (this.selectedDatasetId === 'demand' && addedCount > 0) {
            this.loadDemands();
            this.loadShiftRatios();
            this.loadDemandsByDays();
          }
        } catch (e) {
          console.error('[Dataset] addAllWarehousesFromRegion error', e);
          this.warehousesError = 'Failed to load warehouse list';
        }
        this.loadingWarehouses = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('[Dataset] addAllWarehousesFromRegion error', error);
        this.warehousesError = error.message || 'Failed to load warehouse list';
        this.loadingWarehouses = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Region Selection Modal Methods
  openRegionSelectionModal(): void {
    this.showRegionSelectionModal = true;
    this.modalSelectedRegion = this.warehouseRegionShortname || '';
    this.modalSelectedWarehouses.clear();
    this.modalWarehouses = [];
    this.modalWarehousesError = null;
    
    // If region already selected, load warehouses immediately
    if (this.modalSelectedRegion) {
      this.loadWarehousesForModal();
    }
    this.cdr.markForCheck();
  }

  closeRegionSelectionModal(): void {
    this.showRegionSelectionModal = false;
    this.modalSelectedWarehouses.clear();
    this.modalWarehouses = [];
    this.modalWarehousesError = null;
    this.cdr.markForCheck();
  }

  onModalRegionChange(): void {
    this.modalSelectedWarehouses.clear();
    this.modalWarehouses = [];
    this.modalWarehousesError = null;
    
    if (this.modalSelectedRegion) {
      this.loadWarehousesForModal();
    }
    this.cdr.markForCheck();
  }

  loadWarehousesForModal(): void {
    if (!this.modalSelectedRegion) return;

    this.loadingModalWarehouses = true;
    this.modalWarehousesError = null;

    const params = {
      region_shortname: this.modalSelectedRegion,
      size: 1000,
      offset: 0,
      search: ''
    } as any;

    this.datasetService.getWarehouses(params).subscribe({
      next: (response) => {
        try {
          const respAny: any = response as any;
          const warehousesData = Array.isArray(respAny.data) ? respAny.data : (respAny.data?.data || []);
          this.modalWarehouses = warehousesData || [];
          
          // Pre-select warehouses that are already in timeline
          this.modalSelectedWarehouses.clear();
          for (const wh of this.modalWarehouses) {
            const whId = (wh.warehouse_id || wh.id)?.toString();
            if (whId && this.isInTimeline(wh)) {
              this.modalSelectedWarehouses.add(whId);
            }
          }
        } catch (e) {
          console.error('[Dataset] loadWarehousesForModal error', e);
          this.modalWarehousesError = 'Failed to load warehouse list';
        }
        this.loadingModalWarehouses = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('[Dataset] loadWarehousesForModal error', error);
        this.modalWarehousesError = error.message || 'Failed to load warehouse list';
        this.loadingModalWarehouses = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleWarehouseSelection(warehouse: Warehouse): void {
    const whId = (warehouse.warehouse_id || warehouse.id)?.toString();
    if (!whId) return;

    if (this.modalSelectedWarehouses.has(whId)) {
      this.modalSelectedWarehouses.delete(whId);
    } else {
      this.modalSelectedWarehouses.add(whId);
    }
    this.cdr.markForCheck();
  }

  isWarehouseSelectedInModal(warehouse: Warehouse): boolean {
    const whId = (warehouse.warehouse_id || warehouse.id)?.toString();
    return whId ? this.modalSelectedWarehouses.has(whId) : false;
  }

  selectAllWarehousesInModal(): void {
    this.modalSelectedWarehouses.clear();
    for (const wh of this.modalWarehouses) {
      const whId = (wh.warehouse_id || wh.id)?.toString();
      if (whId) {
        this.modalSelectedWarehouses.add(whId);
      }
    }
    this.cdr.markForCheck();
  }

  deselectAllWarehousesInModal(): void {
    this.modalSelectedWarehouses.clear();
    this.cdr.markForCheck();
  }

  confirmModalSelection(): void {
    if (!this.modalSelectedRegion || this.modalSelectedWarehouses.size === 0) {
      console.warn('[Dataset] No region or warehouses selected');
      return;
    }

    // Update region if changed
    const regionChanged = this.modalSelectedRegion !== this.warehouseRegionShortname;
    if (regionChanged) {
      this.warehouseRegionShortname = this.modalSelectedRegion;
    }

    // Remove warehouses that are in current region's modal list but not selected
    const warehousesToRemove: Warehouse[] = [];
    for (const wh of this.timelineWarehouses) {
      const whId = (wh.warehouse_id || wh.id)?.toString();
      if (!whId) continue;
      
      // If this warehouse is in the modal list (same region), check if it's selected
      const isInModalList = this.modalWarehouses.some(mw => 
        (mw.warehouse_id || mw.id)?.toString() === whId
      );
      
      if (isInModalList && !this.modalSelectedWarehouses.has(whId)) {
        warehousesToRemove.push(wh);
      }
    }

    // Remove unselected warehouses
    for (const wh of warehousesToRemove) {
      const index = this.timelineWarehouses.findIndex(w => 
        (w.warehouse_id || w.id)?.toString() === (wh.warehouse_id || wh.id)?.toString()
      );
      if (index > -1) {
        this.timelineWarehouses.splice(index, 1);
      }
    }

    // Add selected warehouses to timeline (check if already exists)
    let addedCount = 0;
    for (const wh of this.modalWarehouses) {
      const whId = (wh.warehouse_id || wh.id)?.toString();
      if (whId && this.modalSelectedWarehouses.has(whId)) {
        // Check if already in timeline
        if (!this.isInTimeline(wh)) {
          this.timelineWarehouses.push(wh);
          addedCount++;
        }
      }
    }

    console.log(`[Dataset] Updated timeline: ${addedCount} added, ${warehousesToRemove.length} removed, ${this.timelineWarehouses.length} total`);
    console.log(`[Dataset] confirmModalSelection - selectedDatasetId: ${this.selectedDatasetId}`);

    // Reset pagination to first page if needed
    const newTotalPages = Math.ceil(this.timelineWarehouses.length / this.timelinePageSize);
    if (this.timelineCurrentPage > newTotalPages) {
      this.timelineCurrentPage = newTotalPages || 1;
    }

    // Reload demands if demand view is active (but don't auto-select demand)
    if (this.selectedDatasetId === 'demand') {
      this.loadDemands();
      this.loadShiftRatios();
      this.loadDemandsByDays();
    }
    // Note: We don't auto-select 'demand' when warehouses are added - user must click a dataset

    this.cdr.markForCheck();
  }

  clearAllPoints(): void {
    // Clear all warehouses from timeline
    this.timelineWarehouses = [];
    this.timelineCurrentPage = 1; // Reset to first page
    // Clear related data
    this.demands = [];
    this.demandsError = null;
    this.loadingDemands = false;
    // Reset charts
    this.chartsInitialized = false;
    this.destroyCharts();
    this.cdr.markForCheck();
  }

  useDataset(dataset: Dataset): void {
    // TODO: Implement dataset usage functionality
    console.log('Using dataset:', dataset);
    // For now, just navigate to dataset detail
    this.router.navigate(['/datasets', dataset.id]);
  }

  trackByWarehouseId(index: number, warehouse: Warehouse): string {
    return warehouse.warehouse_id?.toString() || index.toString();
  }

  /**
   * Compatibility helper for template sample `products()` usage
   */
  products(): Warehouse[] {
    return this.warehouses || [];
  }

  /**
   * Getter for total pick and deliver combined
   */
  get totalPickAndDeliver(): number {
    if (!this.demands || this.demands.length === 0) return 0;
    return this.demands.reduce((sum, d) => sum + (d.total_pick || 0) + (d.total_deliver || 0), 0);
  }

  /**
   * Getter for total pick
   */
  get totalPick(): number {
    if (!this.demands || this.demands.length === 0) return 0;
    return this.demands.reduce((sum, d) => sum + (d.total_pick || 0), 0);
  }

  /**
   * Getter for total deliver
   */
  get totalDeliver(): number {
    if (!this.demands || this.demands.length === 0) return 0;
    return this.demands.reduce((sum, d) => sum + (d.total_deliver || 0), 0);
  }

  /**
   * Get filtered and sorted demands for table
   */
  get filteredDemands(): any[] {
    let result = [...(this.demands || [])];

    // Apply search filter
    if (this.demandSearchQuery && this.demandSearchQuery.trim()) {
      const query = this.demandSearchQuery.toLowerCase().trim();
      result = result.filter(d =>
        (d.warehouse_name || '').toLowerCase().includes(query) ||
        (d.warehouse_id?.toString() || '').includes(query)
      );
    }

    // Apply sorting
    if (this.demandSortField) {
      result.sort((a, b) => {
        let aVal = a[this.demandSortField!];
        let bVal = b[this.demandSortField!];

        // Handle null/undefined
        if (aVal == null) aVal = 0;
        if (bVal == null) bVal = 0;

        if (this.demandSortOrder === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    return result;
  }

  /**
   * Sort demands table
   */
  sortDemands(field: string): void {
    if (this.demandSortField === field) {
      // Toggle sort order
      this.demandSortOrder = this.demandSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.demandSortField = field;
      this.demandSortOrder = 'desc';
    }
    this.cdr.markForCheck();
  }

  /**
   * Trigger change detection (public method for template)
   */
  triggerChangeDetection(): void {
    this.cdr.markForCheck();
  }

  /**
   * Clear search query
   */
  clearSearch(): void {
    this.demandSearchQuery = '';
    this.cdr.markForCheck();
  }

  /**
   * Calculate chart width based on data length and size preference
   */
  get chartWidth(): number {
    // Chart now fits container width, no longer needed but kept for compatibility
    return 100;
  }

  /**
   * Calculate chart height based on data length and size preference
   */
  get chartHeight(): number {
    // Fixed height that fits on screen - 650px for better visibility
    return 650;
  }

  /**
   * Get chart type - use horizontal bar for many warehouses, vertical for fewer
   */
  getChartType(): 'bar' | 'line' {
    const dataLength = this.filteredDemands.length || this.demands.length || 0;
    // Use horizontal bar chart if more than 10 warehouses for better readability
    // Note: PrimeNG Chart doesn't support horizontal bar directly, so we'll optimize vertical bar
    return this.chartType;
  }

  /** Default date range (01/12/2025 - 14/12/2025) */
  private getDefaultDateRange(): { start: string; end: string } {
    const start = '2025-12-01';
    const end = '2025-12-14';
    return { start, end };
  }

  openSettingsModal(): void {
    // Pre-fill date range with existing or default
    const { start, end } = this.getDefaultDateRange();
    this.demandStartDate = this.demandStartDate || start;
    this.demandEndDate = this.demandEndDate || end;
    
    // Initialize modal region selection
    this.modalSelectedRegion = this.warehouseRegionShortname || '';
    this.modalSelectedWarehouses.clear();
    this.modalWarehouses = [];
    this.modalWarehousesError = null;
    
    // If region already selected, load warehouses immediately
    if (this.modalSelectedRegion) {
      this.loadWarehousesForModal();
    }
    
    this.showSettingsModal = true;
    this.shiftErrors = [];
    this.demandErrors = [];
    this.cdr.markForCheck();
  }

  closeSettingsModal(): void {
    this.showSettingsModal = false;
    // Clear modal state
    this.modalSelectedWarehouses.clear();
    this.modalWarehouses = [];
    this.modalWarehousesError = null;
    this.cdr.markForCheck();
  }

  async applySettings(): Promise<void> {
    // Apply warehouse selection first (if any warehouses selected)
    if (this.modalSelectedRegion && this.modalSelectedWarehouses.size > 0) {
      this.confirmModalSelection();
    } else {
      // Update region if changed
      if (this.modalSelectedRegion && this.modalSelectedRegion !== this.warehouseRegionShortname) {
        this.warehouseRegionShortname = this.modalSelectedRegion;
      }
    }

    // Validate shifts if needed
    if (!this.validateShifts()) {
      this.shiftErrors = this.shiftErrors.length ? this.shiftErrors : ['Invalid shift configuration'];
      this.cdr.markForCheck();
      return;
    }

    // Default date range if missing
    const { start, end } = this.getDefaultDateRange();
    this.demandStartDate = this.demandStartDate || start;
    this.demandEndDate = this.demandEndDate || end;

    this.closeSettingsModal();

    // Reload demands and shift ratios
    this.loadDemands();
    this.loadShiftRatios();
  }

  /** Call shift ratio API */
  loadShiftRatios(): void {
    // Build time_range: use selected demandStartDate/demandEndDate if present, otherwise default to last 7 days
    const today = new Date();
    const defaultEnd = today.toISOString();
    const defaultStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const start = this.demandStartDate ? new Date(this.demandStartDate + 'T00:00:00.000Z').toISOString() : defaultStart;
    const end = this.demandEndDate ? new Date(this.demandEndDate + 'T23:59:59.999Z').toISOString() : defaultEnd;

    // Get region from timeline warehouses if available, otherwise use default
    let regionShortname = this.warehouseRegionShortname;
    if (this.timelineWarehouses && this.timelineWarehouses.length > 0) {
      // Get region from first warehouse in timeline
      const firstWarehouse = this.timelineWarehouses[0];
      if (firstWarehouse.region_shortname) {
        regionShortname = firstWarehouse.region_shortname;
      }
    }

    this.loadingShiftRatio = true;
    this.shiftRatioError = null;

    const payload = {
      region_shortname: regionShortname,
      shifts: this.shifts.map(s => ({
        name: s.name,
        start_hour: Number(s.start_hour),
        end_hour: Number(s.end_hour)
      })),
      time_range: { start, end }
    };

    console.log('[Dataset] Calling getDemandsShiftRatio with payload:', payload);

    this.datasetService.getDemandsShiftRatio(payload).subscribe({
      next: (resp) => {
        console.log('[Dataset] Raw shift ratio response:', resp);

        // Try to extract data from various response formats
        let data: any = resp;
        if (resp && typeof resp === 'object') {
          // Handle ApiResponse format: { ok: true, data: [...] }
          if ('ok' in resp && resp.ok && 'data' in resp) {
            data = (resp as any).data;
            // If data is wrapped in another object with code/message/data, extract again
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data;
            }
          }
          // Handle format: { code: 200, message: "...", data: [...] }
          else if ('code' in resp && 'data' in resp) {
            data = (resp as any).data;
          }
          // Handle direct data property
          else if ('data' in resp) {
            data = (resp as any).data;
            // Handle nested data structure
            if (data && typeof data === 'object' && 'data' in data) {
              data = data.data;
            }
          }
          // Handle if response is directly an array
          else if (Array.isArray(resp)) {
            data = resp;
          }
        }
        
        console.log('[Dataset] Extracted data after parsing:', data);

        // Map API response to UI format
        // API returns: { shift: { name, start_hour, end_hour }, pick_ratio, deliver_ratio }
        // UI expects: { shift_name, total_pick, total_deliver, avg_pick_per_day, avg_deliver_per_day, active_days }
        const rawData = Array.isArray(data) ? data : [];
        this.shiftRatios = rawData.map((item: any) => ({
          shift_name: item.shift?.name || item.shift_name || '',
          shift: item.shift || { name: item.shift_name || '' },
          pick_ratio: item.pick_ratio || 0,
          deliver_ratio: item.deliver_ratio || 0,
          total_pick: item.total_pick || 0,
          total_deliver: item.total_deliver || 0,
          avg_pick_per_day: item.avg_pick_per_day || 0,
          avg_deliver_per_day: item.avg_deliver_per_day || 0,
          active_days: item.active_days || 0
        }));

        this.loadingShiftRatio = false;
        this.shiftRatioError = null; // Clear any previous errors
        console.log('[Dataset] Parsed shift ratios:', this.shiftRatios);
        console.log('[Dataset] shiftRatios length:', this.shiftRatios?.length);
        
        // Force change detection first
        this.cdr.markForCheck();
        
        // Update charts after shift ratios are loaded (even without demands, charts can use shiftRatios)
        // Use longer timeout to ensure canvas elements are rendered in DOM
        this.chartsInitialized = false;
        
        // Force change detection first to ensure DOM is updated
        this.cdr.markForCheck();
        
        setTimeout(() => {
          // Double check canvas elements are available before creating charts
          if (this.shiftRatios && this.shiftRatios.length > 0) {
            console.log('[Dataset] Attempting to update charts, pickup canvas:', !!this.demandPickupTimeCanvas?.nativeElement, 'delivery canvas:', !!this.demandDeliveryTimeCanvas?.nativeElement);
            
            if (this.demandPickupTimeCanvas?.nativeElement && this.demandDeliveryTimeCanvas?.nativeElement) {
              console.log('[Dataset] Both canvases available, calling updateCharts()');
              this.updateCharts();
              this.cdr.markForCheck();
            } else {
              // If canvas not ready, wait a bit more
              console.log('[Dataset] Canvas not ready, waiting 200ms more');
              setTimeout(() => {
                if (this.demandPickupTimeCanvas?.nativeElement && this.demandDeliveryTimeCanvas?.nativeElement) {
                  console.log('[Dataset] Canvas ready after wait, calling updateCharts()');
                  this.updateCharts();
                } else {
                  console.warn('[Dataset] Canvas still not available after wait');
                }
                this.cdr.markForCheck();
              }, 200);
            }
          } else {
            console.log('[Dataset] No shiftRatios data, skipping chart update');
          }
        }, 300);
      },
      error: (err) => {
        console.error('[Dataset] Error loading shift ratios, using fallback:', err);
        this.shiftRatioError = 'Unable to load shift ratios from API, using default data';
        this.applyDefaultShiftRatios();
        this.loadingShiftRatio = false;
        setTimeout(() => {
          this.updateCharts();
          this.cdr.markForCheck();
        }, 100);
        this.cdr.markForCheck();
      }
    });
  }

  /** Load demands by days data for timeline area chart */
  loadDemandsByDays(): void {
    if (!this.timelineWarehouses || this.timelineWarehouses.length === 0) {
      console.log('[Dataset] No timeline warehouses selected, skipping demands by days');
      return;
    }

    const warehouseIds: number[] = this.timelineWarehouses
      .map(w => (w.warehouse_id || w.id))
      .map(id => Number(id))
      .filter(id => !isNaN(id));

    if (warehouseIds.length === 0) {
      console.log('[Dataset] No valid warehouse IDs, skipping demands by days');
      return;
    }

    // Build time_range: use selected demandStartDate/demandEndDate if present, otherwise default to last 30 days
    const today = new Date();
    const defaultEnd = today.toISOString();
    const defaultStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString();

    const start = this.demandStartDate ? new Date(this.demandStartDate + 'T00:00:00').toISOString() : defaultStart;
    const end = this.demandEndDate ? new Date(this.demandEndDate + 'T23:59:59').toISOString() : defaultEnd;

    this.loadingTimelineData = true;
    this.timelineDataError = null;
    this.cdr.markForCheck();

    const payload = {
      warehouse_ids: warehouseIds,
      time_range: {
        start: start,
        end: end
      }
    };

    console.log('[Dataset] Loading demands by days with payload:', payload);

    this.datasetService.getDemandsByDays(payload).subscribe({
      next: (resp: any) => {
        console.log('[Dataset] Demands by days response:', resp);
        
        let data: any = resp;
        if (resp && typeof resp === 'object') {
          // Handle ApiResponse format: { ok: true, data: {...} }
          if ('ok' in resp && resp.ok && 'data' in resp) {
            data = (resp as any).data;
            // If nested data structure: { ok: true, data: { code: 200, data: {...} } }
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data;
            }
          }
          // Handle format: { code: 200, message: "...", data: {...} }
          else if ('code' in resp && 'data' in resp) {
            data = (resp as any).data;
          }
          // Handle direct data property
          else if ('data' in resp) {
            data = (resp as any).data;
            // If nested: { data: { code: 200, data: {...} } }
            if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
              data = data.data;
            }
          }
        }

        // Ensure data is an object (not array or other type)
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          console.warn('[Dataset] Invalid data format, using empty object');
          data = {};
        }

        this.demandsByDays = data;
        this.loadingTimelineData = false;
        this.timelineDataError = null;
        console.log('[Dataset] Parsed demands by days:', this.demandsByDays);
        console.log('[Dataset] Number of dates:', Object.keys(this.demandsByDays).length);
        console.log('[Dataset] Sample dates:', Object.keys(this.demandsByDays).slice(0, 5));

        // Render timeline area chart - wait for DOM to be ready
        this.cdr.markForCheck();
        
        // Use multiple attempts to ensure canvas is available
        const renderChart = (attempt = 0) => {
          if (attempt > 5) {
            console.error('[Dataset] Failed to render timeline chart after 5 attempts');
            return;
          }
          
          if (!this.demandTimelineAreaCanvas || !this.demandTimelineAreaCanvas.nativeElement) {
            console.log(`[Dataset] Canvas not ready, attempt ${attempt + 1}, retrying...`);
            setTimeout(() => renderChart(attempt + 1), 200);
            return;
          }
          
          console.log('[Dataset] Canvas ready, rendering timeline chart...');
          this.renderTimelineAreaChart();
          this.cdr.markForCheck();
        };
        
        setTimeout(() => renderChart(), 100);
      },
      error: (err) => {
        this.timelineDataError = err?.message || 'Failed to load timeline data';
        this.loadingTimelineData = false;
        console.error('[Dataset] Error loading demands by days:', err);
        this.cdr.markForCheck();
      }
    });
  }

  /** Render timeline area chart */
  private renderTimelineAreaChart(): void {
    console.log('[Dataset] renderTimelineAreaChart called');
    console.log('[Dataset] Canvas element:', !!this.demandTimelineAreaCanvas?.nativeElement);
    console.log('[Dataset] demandsByDays:', this.demandsByDays);
    
    if (!this.demandTimelineAreaCanvas || !this.demandTimelineAreaCanvas.nativeElement) {
      console.warn('[Dataset] Timeline area canvas not available');
      return;
    }

    // Process data: convert { date: [warehouse_data] } to timeline arrays
    // Use ALL dates from the response (including empty arrays) to show full timeline
    const allDates = Object.keys(this.demandsByDays).sort();
    const datesWithData = allDates.filter(date => {
      const dayData = this.demandsByDays[date];
      return Array.isArray(dayData) && dayData.length > 0;
    });
    
    // Always use all dates to show complete timeline (empty dates will show 0 values)
    const dates = allDates;
      
    console.log('[Dataset] Dates found with data:', datesWithData.length);
    console.log('[Dataset] All dates in demandsByDays:', allDates.length);
    console.log('[Dataset] Dates to render (all dates):', dates.length);
    console.log('[Dataset] Sample dates:', dates.slice(0, 5), '...', dates.slice(-5));
    
    // If no dates at all, create a default empty chart
    if (dates.length === 0) {
      console.log('[Dataset] No dates found, creating empty chart with default data');
      dates.push(new Date().toISOString().split('T')[0]); // Use today's date as default
    }

    // Filter warehouses if selected
    const filterWarehouses = (dayDataArray: any[]): any[] => {
      if (!this.selectedTimelineWarehouseIds || this.selectedTimelineWarehouseIds.length === 0) {
        return dayDataArray; // No filter, return all
      }
      return dayDataArray.filter((item: any) => {
        const id = String(item?.warehouse_id || '');
        return this.selectedTimelineWarehouseIds.includes(id);
      });
    };

    // Aggregate data by date (sum across selected warehouses for each date)
    const pickData: number[] = [];
    const deliverData: number[] = [];
    const avgPickData: number[] = [];
    const avgDeliverData: number[] = [];

    dates.forEach(date => {
      const dayData = this.demandsByDays[date];
      
      // Ensure dayData is an array
      let dayDataArray: any[] = [];
      if (Array.isArray(dayData)) {
        dayDataArray = dayData;
      } else if (dayData && typeof dayData === 'object' && dayData !== null) {
        dayDataArray = [dayData];
      } else if (dayData === null || dayData === undefined) {
        dayDataArray = [];
      } else {
        console.warn(`[Dataset] Unexpected dayData type for date ${date}:`, typeof dayData, dayData);
        dayDataArray = [];
      }
      
      // Filter by selected warehouses
      const filteredData = filterWarehouses(dayDataArray);
      
      // Calculate totals
      const totalPick = filteredData.reduce((sum: number, item: any) => {
        const pick = (item && typeof item === 'object' && item.total_pick) ? Number(item.total_pick) : 0;
        return sum + (isNaN(pick) ? 0 : pick);
      }, 0);
        
      const totalDeliver = filteredData.reduce((sum: number, item: any) => {
        const deliver = (item && typeof item === 'object' && item.total_deliver) ? Number(item.total_deliver) : 0;
        return sum + (isNaN(deliver) ? 0 : deliver);
      }, 0);

      // Calculate averages (if showTimelineAverage is true)
      const avgPick = filteredData.length > 0 
        ? filteredData.reduce((sum: number, item: any) => {
            const pick = (item && typeof item === 'object' && item.avg_pick_per_day) ? Number(item.avg_pick_per_day) : 0;
            return sum + (isNaN(pick) ? 0 : pick);
          }, 0) / filteredData.length
        : 0;

      const avgDeliver = filteredData.length > 0
        ? filteredData.reduce((sum: number, item: any) => {
            const deliver = (item && typeof item === 'object' && item.avg_deliver_per_day) ? Number(item.avg_deliver_per_day) : 0;
            return sum + (isNaN(deliver) ? 0 : deliver);
          }, 0) / filteredData.length
        : 0;
        
      pickData.push(totalPick);
      deliverData.push(totalDeliver);
      avgPickData.push(avgPick);
      avgDeliverData.push(avgDeliver);
    });

    // Format dates for labels (show full date: day/month/year)
    const labels = dates.map(date => {
      const d = new Date(date);
      // Format: DD/MM/YYYY
      return d.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    });

    const ctx = this.demandTimelineAreaCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('[Dataset] Could not get 2d context for timeline area chart');
      return;
    }

    // Destroy existing chart if any
    if (this.demandTimelineAreaChart) {
      try {
        this.demandTimelineAreaChart.destroy();
      } catch (e) {
        console.error('[Dataset] Error destroying existing timeline area chart', e);
      }
    }

    console.log('[Dataset] Creating chart with labels:', labels.length, 'pickData:', pickData.length, 'deliverData:', deliverData.length);
    console.log('[Dataset] Chart type:', this.timelineChartType);
    console.log('[Dataset] Selected warehouses:', this.selectedTimelineWarehouseIds.length);
    console.log('[Dataset] Sample pickData:', pickData.slice(0, 5));
    console.log('[Dataset] Sample deliverData:', deliverData.slice(0, 5));
    
    // If all values are 0, show a message in the chart
    const hasData = pickData.some(v => v > 0) || deliverData.some(v => v > 0);
    if (!hasData && dates.length > 0) {
      console.log('[Dataset] No data values found, rendering empty chart');
    }

    // Build datasets based on chart type
    const datasets: any[] = [];
    
    if (this.timelineChartType === 'column') {
      // Column chart for totals
      datasets.push({
        type: 'bar',
        label: 'Total Pick (kg)',
        data: pickData,
        backgroundColor: 'rgba(249, 115, 22, 0.8)', // orange-500
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1
      });
      datasets.push({
        type: 'bar',
        label: 'Total Deliver (kg)',
        data: deliverData,
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // black
        borderColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 1
      });
      
      // Add average lines if enabled
      if (this.showTimelineAverage) {
        datasets.push({
          type: 'line',
          label: 'Average Pick (kg)',
          data: avgPickData,
          borderColor: 'rgba(249, 115, 22, 0.6)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.4
        });
        datasets.push({
          type: 'line',
          label: 'Average Deliver (kg)',
          data: avgDeliverData,
          borderColor: 'rgba(0, 0, 0, 0.6)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.4
        });
      }
    } else {
      // Line chart
      datasets.push({
        type: 'line',
        label: 'Total Pick (kg)',
        data: pickData,
        borderColor: 'rgba(249, 115, 22, 1)', // orange-500
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });
      datasets.push({
        type: 'line',
        label: 'Total Deliver (kg)',
        data: deliverData,
        borderColor: 'rgba(0, 0, 0, 1)', // black
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(0, 0, 0, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });
      
      // Add average lines if enabled
      if (this.showTimelineAverage) {
        datasets.push({
          type: 'line',
          label: 'Average Pick (kg)',
          data: avgPickData,
          borderColor: 'rgba(249, 115, 22, 0.6)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.4
        });
        datasets.push({
          type: 'line',
          label: 'Average Deliver (kg)',
          data: avgDeliverData,
          borderColor: 'rgba(0, 0, 0, 0.6)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.4
        });
      }
    }

    // Create chart
    try {
      this.demandTimelineAreaChart = new Chart(ctx, {
        type: this.timelineChartType === 'column' ? 'bar' : 'line',
        data: {
          labels: labels,
          datasets: datasets
        },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return `${label}: ${value.toLocaleString('en-US')} kg`;
              }
            }
          }
        },
        scales: this.timelineChartType === 'column' ? {
          x: {
            stacked: false,
            display: true,
            title: {
              display: true,
              text: 'Date',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            }
          },
          y: {
            stacked: false,
            display: true,
            title: {
              display: true,
              text: 'Volume (kg)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: (value: any) => {
                return value.toLocaleString('en-US') + ' kg';
              }
            }
          }
        } : {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Volume (kg)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: (value: any) => {
                return value.toLocaleString('en-US') + ' kg';
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
    
    console.log('[Dataset] Timeline area chart created successfully');
    } catch (error) {
      console.error('[Dataset] Error creating timeline area chart:', error);
      console.error('[Dataset] Error details:', error);
    }
  }

  /** Update timeline chart when settings change */
  updateTimelineChart(): void {
    if (this.demandTimelineAreaCanvas?.nativeElement) {
      this.renderTimelineAreaChart();
      this.cdr.markForCheck();
    }
  }

  /** Toggle warehouse selection for timeline chart */
  toggleTimelineWarehouse(warehouseId: string): void {
    const index = this.selectedTimelineWarehouseIds.indexOf(warehouseId);
    if (index > -1) {
      this.selectedTimelineWarehouseIds.splice(index, 1);
    } else {
      this.selectedTimelineWarehouseIds.push(warehouseId);
    }
    this.updateTimelineChart();
  }

  /** Select all warehouses for timeline chart */
  selectAllTimelineWarehouses(): void {
    this.selectedTimelineWarehouseIds = this.availableTimelineWarehouses.map(w => String(w.warehouse_id || w.id));
    this.updateTimelineChart();
  }

  /** Deselect all warehouses for timeline chart */
  deselectAllTimelineWarehouses(): void {
    this.selectedTimelineWarehouseIds = [];
    this.updateTimelineChart();
  }

  /** Helper method to convert value to string (for template) */
  toString(value: any): string {
    return String(value || '');
  }

  /** Handle date range change - reload timeline chart */
  onDateRangeChange(): void {
    console.log('[Dataset] Date range changed, reloading timeline chart');
    console.log('[Dataset] demandStartDate:', this.demandStartDate, 'demandEndDate:', this.demandEndDate);
    
    // Only reload if we have warehouses selected
    if (this.timelineWarehouses && this.timelineWarehouses.length > 0) {
      // Debounce to avoid too many API calls
      if (this.dateChangeTimeout) {
        clearTimeout(this.dateChangeTimeout);
      }
      
      this.dateChangeTimeout = setTimeout(() => {
        this.loadDemandsByDays();
      }, 500); // Wait 500ms after last change
    }
  }

  private dateChangeTimeout: any = null;

  /** Calculate region ratios from demands data */
  calculateRegionRatios(): void {
    if (!this.demands || this.demands.length === 0) {
      this.regionRatios = [];
      return;
    }

    // Group demands by region
    const regionMap = new Map<string, { total_pick: number; total_deliver: number; warehouse_count: number; region_fullname: string }>();

    for (const demand of this.demands) {
      const warehouse = this.timelineWarehouses.find(w => w.warehouse_id?.toString() === demand.warehouse_id?.toString());
      const regionShortname = warehouse?.region_shortname || 'Unknown';
      const regionFullname = warehouse?.region_fullname || regionShortname;

      if (!regionMap.has(regionShortname)) {
        regionMap.set(regionShortname, {
          total_pick: 0,
          total_deliver: 0,
          warehouse_count: 0,
          region_fullname: regionFullname
        });
      }

      const regionData = regionMap.get(regionShortname)!;
      regionData.total_pick += demand.total_pick || 0;
      regionData.total_deliver += demand.total_deliver || 0;
      regionData.warehouse_count += 1;
    }

    // Convert to array and calculate percentages
    const totalPick = Array.from(regionMap.values()).reduce((sum, r) => sum + r.total_pick, 0);
    const totalDeliver = Array.from(regionMap.values()).reduce((sum, r) => sum + r.total_deliver, 0);

    this.regionRatios = Array.from(regionMap.entries()).map(([region_shortname, data]) => ({
      region_shortname,
      region_fullname: data.region_fullname,
      total_pick: data.total_pick,
      total_deliver: data.total_deliver,
      warehouse_count: data.warehouse_count,
      pick_percentage: totalPick > 0 ? (data.total_pick / totalPick) * 100 : 0,
      deliver_percentage: totalDeliver > 0 ? (data.total_deliver / totalDeliver) * 100 : 0
    })).sort((a, b) => b.total_pick - a.total_pick); // Sort by total_pick descending

    this.cdr.markForCheck();
  }

  /**
   * Calculate average value for a field
   */
  getAverage(field: string): number {
    if (!this.demands || this.demands.length === 0) return 0;
    const sum = this.demands.reduce((acc, d) => acc + (d[field] || 0), 0);
    return sum / this.demands.length;
  }

  /**
   * Check if value is above average (for highlighting)
   */
  isAboveAverage(value: number, field: string): boolean {
    const avg = this.getAverage(field);
    return value > avg;
  }

  /**
   * Check if value is below average (for highlighting)
   */
  isBelowAverage(value: number, field: string): boolean {
    const avg = this.getAverage(field);
    return value < avg;
  }

  /**
   * Select a demand (warehouse) from the table
   */
  selectDemand(demand: any): void {
    this.selectedDemand = demand;
    this.cdr.markForCheck();
    // Update charts to show data for selected warehouse
    this.updateCharts();
    // Force change detection to update the summary chart
    setTimeout(() => {
      this.updateCharts();
    }, 100);
  }

  /**
   * Check if a demand is selected
   */
  isDemandSelected(demand: any): boolean {
    if (!this.selectedDemand || !demand) return false;
    return (this.selectedDemand.warehouse_id || this.selectedDemand.id) === (demand.warehouse_id || demand.id);
  }


  getSeverity(item: Warehouse | any): string {
    const t = (item?.warehouse_type || item?.type || '').toString().toLowerCase();
    switch (t) {
      case 'hub':
        return 'info';
      case 'sorting':
        return 'success';
      case 'delivery':
        return 'warning';
      case 'transit':
        return 'danger';
      default:
        return 'info';
    }
  }

  viewWarehouse(warehouse: Warehouse | any): void {
    // Navigate to a warehouse detail route if exists, otherwise log
    const id = warehouse?.warehouse_id || warehouse?.id;
    if (id) {
      try {
        this.router.navigate(['/warehouses', id]);
      } catch (e) {
        console.log('[Dataset] viewWarehouse:', id);
      }
    }
  }

  getWarehouseTypeBadgeClass(type: string | undefined): string {
    switch (type?.toLowerCase()) {
      case 'hub':
        return 'bg-indigo-100 text-indigo-800';
      case 'sorting':
        return 'bg-blue-100 text-blue-800';
      case 'delivery':
        return 'bg-green-100 text-green-800';
      case 'transit':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onWarehouseSearch(): void {
    this.warehouseCurrentPage = 1; // Reset to first page
    this.loadWarehouses();
  }

  onWarehouseSearchInput(searchQuery: string): void {
    // legacy hook (kept for backward compatibility)
    this.warehouseSearchSubject.next(searchQuery);
    // also trigger autocomplete subject so both paths work
    this.warehouseAutoCompleteSubject.next(searchQuery);
  }

  onWarehouseAutoComplete(event: any): void {
    // PrimeNG passes an event with .query
    const q = event && event.query ? event.query : (event || '');
    this.warehouseAutoCompleteSubject.next(q);
  }

  onWarehouseAutoSelect(event: any): void {
    // event is the selected warehouse object
    const selected = event;
    if (selected) {
      // set input to name, add to timeline and select
      this.warehouseSearchQuery = selected.warehouse_name || '';
      // clear suggestions so panel (our custom list) hides
      this.warehouseSuggestions = [];
      // add/ select
      this.selectWarehouse(selected);
      this.addToTimeline(selected);
      this.cdr.markForCheck();
    }
  }

  onWarehouseResultClick(item: any): void {
    // Called when user clicks an item in our custom results list
    if (!item) return;
    this.warehouseSearchQuery = item.warehouse_name || '';
    this.warehouseSuggestions = []; // hide list
    this.selectWarehouse(item);
    this.addToTimeline(item);
    this.cdr.markForCheck();
  }

  onSearchInput(searchQuery: string): void {
    this.datasetSearchSubject.next(searchQuery);
  }

  onStrategicSuggestion(type: string): void {
    // If user selects 'demand' open the demands view and load data
    if (type === 'demand') {
      this.state.type = 'demand';
      this.selectedDatasetId = 'demand';
      // ensure we reset errors/loading
      this.demands = [];
      this.demandsError = null;
      this.loadingDemands = false;
      // attempt to load demands (requires timeline warehouses)
      this.loadDemands();
      // Load shift ratios when selecting demand type
      this.loadShiftRatios();
      this.loadDemandsByDays();
      this.cdr.markForCheck();
      return;
    }

    // Other dataset types use the standard dataset listing
    this.selectedDatasetId = null;
    this.state.type = type;
    this.state.offset = 0;
    this.loadDatasets();
  }

  onStrategicWarehouseSearch(regionName: string): void {
    const region = this.availableRegions.find(r => r.name === regionName);
    if (region) {
      this.warehouseRegionShortname = region.code;
      this.warehouseCurrentPage = 1;
      this.loadWarehouses();
    }
  }

  loadDemands(): void {
    if (this.timelineWarehouses.length === 0) {
      console.log('[Dataset] loadDemands: No warehouses in timeline, skipping');
      this.loadingDemands = false;
      this.demands = [];
      this.regionRatios = []; // Clear region ratios when no warehouses
      this.cdr.markForCheck();
      return;
    }

    console.log('[Dataset] loadDemands: Starting, timelineWarehouses.length:', this.timelineWarehouses.length);
    this.loadingDemands = true;
    this.demandsError = null;
    this.cdr.markForCheck(); // Trigger change detection immediately

    // Pass numeric IDs to the API (backend expects int[])
    const warehouseIds: number[] = this.timelineWarehouses
      .map(w => (w.warehouse_id || w.id))
      .map(id => Number(id))
      .filter(id => !isNaN(id));

    // Build time_range: use selected demandStartDate/demandEndDate if present, otherwise default to last 30 days
    const today = new Date();
    const defaultEnd = today.toISOString().slice(0, 10);
    const defaultStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const start = this.demandStartDate || defaultStart;
    const end = this.demandEndDate || defaultEnd;

    const payload = {
      warehouse_ids: warehouseIds,
      time_range: { start, end }
    } as { warehouse_ids: number[]; time_range: { start: string; end: string } };

    console.log('[Dataset] loadDemands: Starting with payload:', payload);
    this.datasetService.getDemandsWithTimeRange(payload).subscribe({
      next: (response) => {
        console.log('[Dataset] getDemandsWithTimeRange response:', response);
        try {
          // Handle different response structures
          let demandsData: any[] = [];

          if (response && typeof response === 'object') {
            // Check if response has ok property
            if ('ok' in response && response.ok && 'data' in response) {
              const respData: any = (response as any).data;
              demandsData = Array.isArray(respData) ? respData : (respData && (respData.data || respData)) || [];
            }
            // If response is directly an array
            else if (Array.isArray(response)) {
              demandsData = response;
            }
            // If response has data property directly
            else if ('data' in response) {
              const respData: any = (response as any).data;
              demandsData = Array.isArray(respData) ? respData : [];
            }
            // If response itself is the data
            else {
              demandsData = [];
            }
          } else if (Array.isArray(response)) {
            demandsData = response;
          }

          console.log('[Dataset] Parsed demands data:', demandsData);
          this.demands = demandsData;
          this.demandsError = null;
          
          // Set default selected demand to first item if available and no selection exists
          if (!this.selectedDemand && demandsData.length > 0) {
            this.selectedDemand = demandsData[0];
            // Update charts to show data for selected warehouse
            setTimeout(() => {
              this.updateCharts();
            }, 100);
          }

          // Calculate region ratios after loading demands
          this.calculateRegionRatios();

          // Update charts when new demands arrive
          if (demandsData.length > 0) {
            // Reset charts initialized flag to allow re-rendering
            this.chartsInitialized = false;
            setTimeout(() => {
              this.updateCharts();
              this.cdr.markForCheck();
            }, 100);
          }
        } catch (e) {
          console.error('[Dataset] Error parsing demands response:', e);
          this.demandsError = 'API parsing error, using default data';
          this.applyDefaultDemands();
        }

        this.loadingDemands = false;
        this.cdr.markForCheck();
        console.log('[Dataset] loadDemands completed. loadingDemands:', this.loadingDemands, 'demands.length:', this.demands.length);
      },
      error: (error) => {
        console.error('[Dataset] getDemandsWithTimeRange error, using fallback:', error);
        this.demandsError = 'Unable to load demands from API, using default data';
        this.applyDefaultDemands();
        this.loadingDemands = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyDefaultDatasets(message: string): void {
    this.datasets = [
      {
        id: 'demand',
        name: 'Demand Dataset',
        type: 'demand',
        description: 'Default demand dataset for fallback mode',
        records: 12450,
        created_at: new Date().toISOString()
      },
      {
        id: 'truck',
        name: 'Truck Dataset',
        type: 'truck',
        description: 'Default fleet dataset for fallback mode',
        records: 3200,
        created_at: new Date().toISOString()
      },
      {
        id: 'trip',
        name: 'Trip Dataset',
        type: 'trip',
        description: 'Default trip dataset for fallback mode',
        records: 5800,
        created_at: new Date().toISOString()
      },
      {
        id: 'hub',
        name: 'Hub Dataset',
        type: 'hub',
        description: 'Default hub dataset for fallback mode',
        records: 640,
        created_at: new Date().toISOString()
      }
    ];
    this.state.total = this.datasets.length;
    this.error = null;
    this.fallbackNotice = message;
  }

  private applyDefaultDemands(): void {
    this.demands = [
      {
        warehouse_id: 1001,
        warehouse_name: 'HNO Central Hub',
        province_name: 'Ha Noi',
        district_name: 'Cau Giay',
        total_pick: 12840,
        total_deliver: 11960,
        avg_pick_per_day: 428,
        avg_deliver_per_day: 398,
        active_days: 30
      },
      {
        warehouse_id: 1002,
        warehouse_name: 'HNO West Station',
        province_name: 'Ha Noi',
        district_name: 'Nam Tu Liem',
        total_pick: 9320,
        total_deliver: 8740,
        avg_pick_per_day: 311,
        avg_deliver_per_day: 291,
        active_days: 30
      },
      {
        warehouse_id: 1003,
        warehouse_name: 'HNO East Station',
        province_name: 'Ha Noi',
        district_name: 'Long Bien',
        total_pick: 7640,
        total_deliver: 7210,
        avg_pick_per_day: 255,
        avg_deliver_per_day: 240,
        active_days: 30
      }
    ];

    if (!this.selectedDemand && this.demands.length > 0) {
      this.selectedDemand = this.demands[0];
    }
    this.calculateRegionRatios();
    this.applyDefaultShiftRatios();
  }

  private applyDefaultShiftRatios(): void {
    const defaults = this.shifts.length ? this.shifts : [
      { name: 'morning', start_hour: 6, end_hour: 10 },
      { name: 'noon', start_hour: 10, end_hour: 14 },
      { name: 'afternoon', start_hour: 14, end_hour: 18 },
      { name: 'evening', start_hour: 18, end_hour: 22 }
    ];

    const pickRatios = [0.33, 0.22, 0.28, 0.17];
    const deliverRatios = [0.26, 0.31, 0.25, 0.18];
    const totalPick = this.demands.reduce((sum, d: any) => sum + (d.total_pick || 0), 0) || 29700;
    const totalDeliver = this.demands.reduce((sum, d: any) => sum + (d.total_deliver || 0), 0) || 27910;
    const activeDays = 30;

    this.shiftRatios = defaults.map((s, idx) => {
      const pickRatio = pickRatios[idx] ?? (1 / defaults.length);
      const deliverRatio = deliverRatios[idx] ?? (1 / defaults.length);
      return {
        shift_name: s.name,
        shift: { name: s.name, start_hour: s.start_hour, end_hour: s.end_hour },
        pick_ratio: pickRatio,
        deliver_ratio: deliverRatio,
        total_pick: Math.round(totalPick * pickRatio),
        total_deliver: Math.round(totalDeliver * deliverRatio),
        avg_pick_per_day: Math.round((totalPick * pickRatio) / activeDays),
        avg_deliver_per_day: Math.round((totalDeliver * deliverRatio) / activeDays),
        active_days: activeDays
      };
    });
  }

  // --- Shift editor helpers ---
  addShift(): void {
    this.shifts.push({ name: 'new shift', start_hour: 0, end_hour: 1 });
  }

  removeShift(index: number): void {
    if (index >= 0 && index < this.shifts.length) {
      this.shifts.splice(index, 1);
    }
  }

  loadDefaultShifts(): void {
    this.shifts = [
      { name: 'morning', start_hour: 6, end_hour: 10 },
      { name: 'noon', start_hour: 10, end_hour: 14 },
      { name: 'afternoon', start_hour: 14, end_hour: 18 },
      { name: 'evening', start_hour: 18, end_hour: 22 }
    ];

    // If there are stops already added, re-run shifts query to refresh data
    if (this.timelineWarehouses && this.timelineWarehouses.length > 0 && this.validateShifts()) {
      this.runShiftsQuery();
    }
  }

  validateShifts(): boolean {
    this.shiftErrors = [];

    // Validate each shift
    this.shifts.forEach((s, idx) => {
      if (s.start_hour >= s.end_hour) {
        this.shiftErrors.push(`Shift "${s.name || idx + 1}": start hour must be earlier than end hour.`);
      }
      if (s.start_hour < 0 || s.start_hour > 23 || s.end_hour < 1 || s.end_hour > 24) {
        this.shiftErrors.push(`Shift "${s.name || idx + 1}": invalid hour range (0-23/1-24).`);
      }
    });

    // Require at least one warehouse selected in Timeline
    if (!this.timelineWarehouses || this.timelineWarehouses.length === 0) {
      this.shiftErrors.push('Please select at least one warehouse in Timeline.');
    }

    return this.shiftErrors.length === 0;
  }

  private buildShiftsPayload(): { region_shortname: string; warehouse_ids: number[]; shifts: { name: string; start_hour: number; end_hour: number }[]; time_range: { start: string; end: string } } {
    const warehouseIds: number[] = this.timelineWarehouses
      .map(w => (w.warehouse_id || w.id))
      .map(id => Number(id))
      .filter(id => !isNaN(id));

    // Build time_range: use selected demandStartDate/demandEndDate if present, otherwise default to last 30 days
    const today = new Date();
    const defaultEnd = today.toISOString().slice(0, 10);
    const defaultStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const start = this.demandStartDate || defaultStart;
    const end = this.demandEndDate || defaultEnd;

    return {
      region_shortname: this.warehouseRegionShortname,
      warehouse_ids: warehouseIds,
      shifts: this.shifts.map(s => ({ name: s.name, start_hour: Math.floor(s.start_hour), end_hour: Math.floor(s.end_hour) })),
      time_range: { start, end }
    };
  }

  // Run the shifts query and update demands chart/table
  runShiftsQuery(): void {
    if (!this.validateShifts()) {
      this.cdr.markForCheck();
      return;
    }

    const payload = this.buildShiftsPayload();
    console.log('[Dataset] Calling getDemandsShiftRatio with payload:', payload);

    this.datasetService.getDemandsShiftRatio(payload).subscribe({
      next: (resp) => {
        if (resp.ok && resp.data) {
          // Normalize response: apiService.transformResponse wraps server response in { data: ... }
          const respData: any = (resp as any).data;
          const payloadData = Array.isArray(respData) ? respData : (respData && (respData.data || respData));
          this.demands = payloadData || [];
          setTimeout(() => this.updateCharts(), 50);
          console.log('[Dataset] Received shift ratio response', payloadData);
        } else {
          this.shiftErrors.push('Unable to fetch shift-based data');
          console.error('[Dataset] runShiftsQuery invalid response:', resp);
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.shiftErrors.push(err?.message || 'Error while fetching shift-based data');
        console.error('[Dataset] runShiftsQuery error:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // --- Demands: Volume Analysis (date range filter) ---
  demandErrors: string[] = [];

  validateDemandRange(): boolean {
    this.demandErrors = [];
    if (!this.timelineWarehouses || this.timelineWarehouses.length === 0) {
      this.demandErrors.push('Please select at least one warehouse in Timeline.');
    }
    if (!this.demandStartDate || !this.demandEndDate) {
      this.demandErrors.push('Please select both start and end dates.');
    }
    if (this.demandStartDate && this.demandEndDate && this.demandStartDate > this.demandEndDate) {
      this.demandErrors.push('"From date" must be earlier than or equal to "To date".');
    }
    return this.demandErrors.length === 0;
  }

  private buildDemandsPayload(): { warehouse_ids: number[]; time_range: { start: string; end: string } } {
    const warehouseIds: number[] = this.timelineWarehouses
      .map((w: any) => (w.warehouse_id || w.id))
      .map((id: any) => Number(id))
      .filter((id: number) => !isNaN(id));

    return {
      warehouse_ids: warehouseIds,
      time_range: { start: this.demandStartDate || '', end: this.demandEndDate || '' }
    };
  }

  applyDemandFilter(): void {
    this.demandErrors = [];
    if (!this.validateDemandRange()) {
      this.cdr.markForCheck();
      return;
    }

    const payload = this.buildDemandsPayload();
    console.log('[Dataset] Calling getDemandsWithTimeRange with payload:', payload);

    this.loadingDemands = true;
    this.datasetService.getDemandsWithTimeRange(payload).subscribe({
      next: (resp) => {
        if (resp.ok && resp.data) {
          const respData: any = (resp as any).data;
          const d = Array.isArray(respData) ? respData : (respData && (respData.data || respData));
          this.demands = d || [];
          this.calculateRegionRatios(); // Calculate region ratios after loading demands
          // Reload shift ratios when filter is applied
          this.loadShiftRatios();
      this.loadDemandsByDays();
          setTimeout(() => this.updateCharts(), 50);
        } else {
          this.demandErrors.push('Unable to load volume data');
          console.error('[Dataset] applyDemandFilter invalid response:', resp);
        }
        this.loadingDemands = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.demandErrors.push(err?.message || 'Failed to load volume data');
        this.loadingDemands = false;
        console.error('[Dataset] applyDemandFilter error:', err);
        this.cdr.markForCheck();
      }
    });
  }

  onWarehouseRegionChange(region: string): void {
    this.warehouseRegionShortname = region;
    this.warehouseCurrentPage = 1;

    // Fetch all warehouses for the selected region (large size) and auto-add them to timeline
    this.loadingWarehouses = true;
    this.warehousesError = null;

    const params = {
      region_shortname: this.warehouseRegionShortname,
      size: 1000,
      offset: 0,
      search: ''
    } as any;

    this.datasetService.getWarehouses(params).subscribe({
      next: (response) => {
        try {
          const respAny: any = response as any;
          const warehousesData = Array.isArray(respAny.data) ? respAny.data : (respAny.data?.data || []);
          this.warehouses = warehousesData || [];
          // determine total
          if (Array.isArray(respAny.data)) {
            this.warehouseTotal = respAny.data.length;
          } else {
            this.warehouseTotal = respAny.data?.meta?.total || this.warehouses.length;
          }

          // Auto-add all warehouses in this region to the timeline
          let addedCount = 0;
          for (const wh of this.warehouses) {
            if (!this.timelineWarehouses.find((w: any) => (w.warehouse_id || w.id) === (wh.warehouse_id || wh.id))) {
              this.timelineWarehouses.push(wh);
              addedCount++;
            }
          }

          if (addedCount > 0) {
            console.log(`[Dataset] Auto-added ${addedCount} warehouses to timeline for region ${this.warehouseRegionShortname}`);
            // reload datasets and demands if needed
            this.loadDatasets();
            if (this.selectedDatasetId === 'demand') {
              this.loadDemands();
              this.loadDemandsByDays();
              this.loadShiftRatios();
            }
          }
        } catch (e) {
          console.error('[Dataset] onWarehouseRegionChange processing error', e);
          this.warehousesError = 'Error processing warehouse list';
        }
        this.loadingWarehouses = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('[Dataset] Load warehouses by region error:', err);
        this.warehousesError = err?.message || 'Unable to load warehouses for this region';
        this.loadingWarehouses = false;
        this.cdr.markForCheck();
      }
    });
  }

  onWarehousePageChange(page: number): void {
    this.warehouseCurrentPage = page;
    this.loadWarehouses();
  }

  onWarehousePageSizeChange(size: number): void {
    this.warehousePageSize = size;
    this.warehouseCurrentPage = 1; // Reset to first page
    this.loadWarehouses();
  }

  get warehouseTotalPages(): number {
    return Math.ceil(this.warehouseTotal / this.warehousePageSize);
  }

  get warehouseStartIndex(): number {
    return (this.warehouseCurrentPage - 1) * this.warehousePageSize + 1;
  }

  get warehouseEndIndex(): number {
    return Math.min(this.warehouseCurrentPage * this.warehousePageSize, this.warehouseTotal);
  }


  // Get fixed chart container height for bar chart (936px chart + 64px padding = 1000px)
  getChartHeight(): number {
    return 1000; // Fixed height: 936px chart + 64px padding for bar chart
  }

  // Get minimum width for chart container to allow horizontal scrolling when needed
  getChartMinWidth(): number {
    const dataLength = this.filteredDemands?.length || this.demands?.length || 0;
    // For many data points, allow chart to expand horizontally for better readability
    if (dataLength > 30) {
      return 1800; // Very large dataset - allow wide chart
    } else if (dataLength > 25) {
      return 1600; // Large dataset
    } else if (dataLength > 20) {
      return 1400; // Medium-large dataset
    } else if (dataLength > 15) {
      return 1200; // Medium dataset
    } else {
      return 100; // Small dataset - use percentage (100%)
    }
  }

  // Chart options for demands data
  get chartOptions(): any {
    const dataLength = this.filteredDemands?.length || this.demands?.length || 0;
    const isBarChart = this.chartType === 'bar';
    // Increased bar thickness for better visibility - adjust based on data length
    const minBarThickness = dataLength > 25 ? 30 : (dataLength > 20 ? 35 : (dataLength > 15 ? 40 : (dataLength > 10 ? 45 : 50)));

    const baseOptions: any = {
      responsive: false, // Disable responsive to maintain fixed height
      maintainAspectRatio: false,
      aspectRatio: undefined, // Disable aspect ratio completely
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      layout: {
        padding: {
          right: 40,
          left: 40,
          top: 30,
          bottom: dataLength > 20 ? 80 : (dataLength > 15 ? 70 : 50)
        }
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 14,
              weight: '600' as const
            },
            boxWidth: 15,
            boxHeight: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: 16,
          titleFont: {
            size: 15,
            weight: 'bold' as const
          },
          bodyFont: {
            size: 14
          },
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            label: function (context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US').format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      // Custom animation to display data labels on chart
      animation: {
        onComplete: () => {
          // Find the canvas element for the main chart
          const canvas = document.querySelector('p-chart canvas') as HTMLCanvasElement;
          if (!canvas) return;
          
          // Get chart instance from Chart.js registry
          const chart = Chart.getChart(canvas);
          if (!chart) return;
          
          const ctx = chart.ctx;
          const datasets = chart.data.datasets;
          
          ctx.save();
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = '#374151'; // Dark gray color
          
          datasets.forEach((dataset: any, datasetIndex: number) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (!meta || !meta.data) return;
            
            meta.data.forEach((element: any, index: number) => {
              const value = dataset.data[index];
              if (value === null || value === undefined || value === 0) return;
              
              const model = element;
              let x, y;
              
              if (isBarChart) {
                // For bar chart, position label at top of bar
                x = model.x;
                y = model.y - 5; // 5px above the bar
              } else {
                // For line chart, position label above the point
                x = model.x;
                y = model.y - 10; // 10px above the point
              }
              
              // Format the value
              const formattedValue = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(value);
              
              // Draw text shadow for better visibility
              ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
              ctx.shadowBlur = 4;
              ctx.fillText(formattedValue, x, y);
              ctx.shadowBlur = 0;
            });
          });
          
          ctx.restore();
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: dataLength > 25 ? 10 : (dataLength > 20 ? 11 : (dataLength > 15 ? 12 : 13)),
              weight: '500' as const
            },
            maxRotation: isBarChart ? (dataLength > 20 ? 75 : (dataLength > 15 ? 60 : 45)) : 0,
            minRotation: isBarChart ? (dataLength > 20 ? 75 : (dataLength > 15 ? 60 : 45)) : 0,
            autoSkip: dataLength > 15 ? true : false,
            maxTicksLimit: dataLength > 30 ? 30 : (dataLength > 25 ? 25 : (dataLength > 20 ? 20 : undefined)),
            padding: dataLength > 20 ? 15 : 10
          },
          ...(isBarChart && {
            barThickness: dataLength > 5 ? minBarThickness : undefined,
            categoryPercentage: dataLength > 20 ? 0.7 : (dataLength > 15 ? 0.75 : (dataLength > 10 ? 0.85 : 0.9)),
            barPercentage: dataLength > 20 ? 0.9 : (dataLength > 10 ? 0.95 : 1.0)
          })
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total (kg)',
            font: {
              size: 14,
              weight: 'bold' as const
            },
            color: 'rgba(249, 115, 22, 0.9)',
            padding: { top: 10, bottom: 10 }
          },
          grid: {
            color: 'rgba(249, 115, 22, 0.15)',
            lineWidth: 1
          },
          ticks: {
            font: {
              size: 12,
              weight: '500' as const
            },
            color: 'rgba(249, 115, 22, 0.8)',
            padding: 8,
            callback: function (value: any) {
              return new Intl.NumberFormat('en-US').format(value);
            }
          }
        },
        y1: {
          beginAtZero: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Average/day (kg/day)',
            font: {
              size: 14,
              weight: 'bold' as const
            },
            color: 'rgba(251, 146, 60, 0.9)',
            padding: { top: 10, bottom: 10 }
          },
          ticks: {
            font: {
              size: 12,
              weight: '500' as const
            },
            color: 'rgba(251, 146, 60, 0.8)',
            padding: 8,
            callback: function (value: any) {
              return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              }).format(value);
            }
          }
        }
      }
    };

    return baseOptions;
  }

  // Get chart data for demands with toggle support
  getDemandsChartData(type: 'total' | 'avg' | 'combined'): any {
    if (!this.demands || this.demands.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Use filtered demands for chart
    const dataSource = this.filteredDemands.length > 0 ? this.filteredDemands : this.demands;
    const labels = dataSource.map((d: any) => d.warehouse_name || `Warehouse ${d.warehouse_id}`);

    if (type === 'combined') {
      const datasets: any[] = [];
      const isLineChart = this.chartType === 'line';

      if (this.chartShowPick) {
        if (isLineChart) {
          datasets.push({
            type: 'line',
            label: 'Total Pick',
            data: dataSource.map((d: any) => d.total_pick || 0),
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            fill: false
          });
        } else {
          datasets.push({
            type: 'bar',
            label: 'Total Pick',
            data: dataSource.map((d: any) => d.total_pick || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.95)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2.5,
            borderRadius: 8,
            yAxisID: 'y'
          });
        }
      }

      if (this.chartShowDeliver) {
        if (isLineChart) {
          datasets.push({
            type: 'line',
            label: 'Total Deliver',
            data: dataSource.map((d: any) => d.total_deliver || 0),
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            fill: false
          });
        } else {
          datasets.push({
            type: 'bar',
            label: 'Total Deliver',
            data: dataSource.map((d: any) => d.total_deliver || 0),
            backgroundColor: 'rgba(16, 185, 129, 0.95)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'y'
          });
        }
      }

      if (this.chartShowAvgPick) {
        if (isLineChart) {
          datasets.push({
            type: 'line',
            label: 'Avg Pick/Day',
            data: dataSource.map((d: any) => d.avg_pick_per_day || 0),
            borderColor: 'rgba(249, 115, 22, 1)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(249, 115, 22, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            fill: false
          });
        } else {
          datasets.push({
            type: 'line',
            label: 'Avg Pick/Day',
            data: dataSource.map((d: any) => d.avg_pick_per_day || 0),
            borderColor: 'rgba(249, 115, 22, 1)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderWidth: 4,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(249, 115, 22, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            fill: false
          });
        }
      }

      if (this.chartShowAvgDeliver) {
        if (isLineChart) {
          datasets.push({
            type: 'line',
            label: 'Avg Deliver/Day',
            data: dataSource.map((d: any) => d.avg_deliver_per_day || 0),
            borderColor: 'rgba(139, 92, 246, 1)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            fill: false
          });
        } else {
          datasets.push({
            type: 'line',
            label: 'Avg Deliver/Day',
            data: dataSource.map((d: any) => d.avg_deliver_per_day || 0),
            borderColor: 'rgba(139, 92, 246, 1)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: 4,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            fill: false
          });
        }
      }

      return {
        labels,
        datasets
      };
    }

    if (type === 'total') {
      return {
        labels,
        datasets: [
          {
            label: 'Total Pick',
            data: this.demands.map(d => d.total_pick),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          },
          {
            label: 'Total Deliver',
            data: this.demands.map(d => d.total_deliver),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }
        ]
      };
    } else {
      return {
        labels,
        datasets: [
          {
            label: 'Avg Pick/Day',
            data: this.demands.map(d => d.avg_pick_per_day),
            borderColor: 'rgba(139, 92, 246, 1)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Avg Deliver/Day',
            data: this.demands.map(d => d.avg_deliver_per_day),
            borderColor: 'rgba(245, 158, 11, 1)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
          }
        ]
      };
    }
  }

  /**
   * Find a demand entry returned by the API for the given warehouse id.
   * Returns the demand object or null if not found.
   */
  findDemandByWarehouseId(warehouseId?: string | number | null): any | null {
    if (!warehouseId) return null;
    const idStr = warehouseId.toString();
    if (!this.demands || this.demands.length === 0) return null;
    return this.demands.find(d => (d.warehouse_id || d.id || '').toString() === idStr) || null;
  }

  viewProductivity(): void {
    if (this.timelineWarehouses.length === 0) {
      alert('No warehouse in timeline');
      return;
    }

    // For now, show a simple alert with productivity info
    // In a real implementation, this would open a modal or navigate to a productivity view
    const warehouseNames = this.timelineWarehouses.map((w: any) => w.warehouse_name).join(', ');
    const totalWarehouses = this.timelineWarehouses.length;

    alert(`Volume for ${totalWarehouses} warehouses:\n${warehouseNames}\n\nDetailed volume view will be implemented in a future version.`);

    console.log('View productivity for warehouses:', this.timelineWarehouses);
  }
}
