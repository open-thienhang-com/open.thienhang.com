import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatasetService } from '../../services/dataset.service';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';

// Register Chart.js components
Chart.register(...registerables);

interface HubData {
  'ID BC'?: string;
  'Tên BC'?: string;
  'Vùng'?: string;
  'Tỉnh'?: string;
  'Quận/Huyện'?: string;
  'Loại BC'?: string;
  'Lat'?: number;
  'Lng'?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-planning-productivity',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TableModule,
    ChartModule,
    CheckboxModule
  ],
  templateUrl: './planning-productivity.html',
  styleUrl: './planning-productivity.css',
})
export class PlanningProductivity implements OnInit, OnDestroy, AfterViewInit {
  // Hub data and state
  allHubs: HubData[] = [];
  filteredHubs: HubData[] = [];
  selectedHubs: HubData[] = [];
  loading = false;
  error: string | null = null;

  // Hub search and filtering
  hubSearchQuery = '';
  showHubSearchDialog = false;
  hubSearchFilters = {
    region: '',
    warehouse: '',
    id: ''
  };

  // Map and Leaflet
  map: any = null;
  hubMarkers: any[] = [];
  lastMapWidth = 0;

  // Charts
  hubRegionChart: Chart | null = null;
  hubTypeChart: Chart | null = null;

  // Canvas elements
  @ViewChild('hubRegionCanvas', { static: false }) hubRegionCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hubTypeCanvas', { static: false }) hubTypeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hubMap', { static: false }) hubMap!: ElementRef<HTMLDivElement>;

  constructor(
    private datasetService: DatasetService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadHubData();
  }

  ngAfterViewInit(): void {
    // Initialize map when component is ready
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
    }
  }

  ngAfterViewChecked(): void {
    // Ensure map resizes properly when container dimensions change
    if (isPlatformBrowser(this.platformId) && this.map && this.hubMap?.nativeElement) {
      const rect = this.hubMap.nativeElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.width !== this.lastMapWidth) {
        this.lastMapWidth = rect.width;
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 100);
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup charts
    if (this.hubRegionChart) {
      this.hubRegionChart.destroy();
    }
    if (this.hubTypeChart) {
      this.hubTypeChart.destroy();
    }

    // Cleanup map properly
    if (isPlatformBrowser(this.platformId) && this.map) {
      try {
        this.hubMarkers.forEach(marker => {
          if (this.map && this.map.hasLayer(marker)) {
            this.map.removeLayer(marker);
          }
        });
        this.hubMarkers = [];
        this.map.remove();
        this.map = null;
      } catch (error) {
        console.error('[PlanningProductivity] Error during map cleanup:', error);
        this.map = null;
      }
    }
  }

  loadHubData(): void {
    this.loading = true;
    this.error = null;

    this.datasetService.getWarehouses({
      region_shortname: 'HCM',
      size: 1000,
      offset: 0
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
            'Lat': parseFloat(warehouse.latitude) || 0,
            'Lng': parseFloat(warehouse.longitude) || 0,
            originalData: warehouse
          }));

          this.filterHubs();
          this.initializeCharts();

          // Load default HNO warehouses for map
          this.loadDefaultHubWarehouses();

          this.loading = false;
          this.cdr.markForCheck();
        } else {
          this.error = 'Không thể tải dữ liệu bưu cục';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.error = err?.message || 'Lỗi khi tải dữ liệu bưu cục';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadDefaultHubWarehouses(): void {
    // Load default warehouses for Hanoi region (HNO) on component initialization
    this.datasetService.getWarehouses({
      region_shortname: 'HCM',
      size: 1000,
      offset: 0
    }).subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          this.selectedHubs = response.data.map((warehouse: any) => ({
            'ID BC': warehouse.warehouse_id?.toString() || warehouse.id,
            'Tên BC': warehouse.warehouse_name || 'Unknown',
            'Vùng': warehouse.region_shortname || 'HNO',
            'Tỉnh': warehouse.province_name || 'Unknown',
            'Quận/Huyện': warehouse.district_name || 'Unknown',
            'Loại BC': warehouse.warehouse_type || 'Unknown',
            'Lat': parseFloat(warehouse.latitude) || 0,
            'Lng': parseFloat(warehouse.longitude) || 0,
            originalData: warehouse
          }));

          this.cdr.markForCheck();
          this.updateMapMarkers();
        } else {
          this.selectedHubs = [];
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        console.error('[PlanningProductivity] Error loading default HNO warehouses:', error);
        this.selectedHubs = [];
        this.cdr.markForCheck();
      }
    });
  }

  private initializeCharts(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Destroy existing charts
    if (this.hubRegionChart) this.hubRegionChart.destroy();
    if (this.hubTypeChart) this.hubTypeChart.destroy();

    // Hub Region Chart
    const regionCounts = this.allHubs.reduce((acc, item) => {
      const region = item['Vùng'] || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
    }

    // Hub Type Chart
    const typeCounts = this.allHubs.reduce((acc, item) => {
      const type = item['Loại BC'] || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
      }) as any;
    }
  }

  getHubStats(): any {
    const totalWarehouses = this.allHubs.length;
    const fullService = this.allHubs.filter(h => h['Loại BC'] === 'Cả Lấy & Giao').length;
    const deliveryOnly = this.allHubs.filter(h => h['Loại BC'] === 'Chỉ Giao').length;
    const totalRegions = [...new Set(this.allHubs.map(h => h['Vùng']))].length;

    return {
      totalWarehouses,
      fullService,
      fullServicePercent: totalWarehouses > 0 ? ((fullService / totalWarehouses) * 100).toFixed(1) : '0',
      deliveryOnly,
      deliveryOnlyPercent: totalWarehouses > 0 ? ((deliveryOnly / totalWarehouses) * 100).toFixed(1) : '0',
      totalRegions
    };
  }

  filterHubs(): void {
    this.filteredHubs = this.allHubs.filter(hub => {
      const regionMatch = !this.hubSearchFilters.region || hub['Vùng'] === this.hubSearchFilters.region;
      const warehouseMatch = !this.hubSearchFilters.warehouse ||
        (hub['Tên BC'] && hub['Tên BC'].toLowerCase().includes(this.hubSearchFilters.warehouse.toLowerCase()));
      const idMatch = !this.hubSearchFilters.id ||
        (hub['ID BC'] && hub['ID BC'].toLowerCase().includes(this.hubSearchFilters.id.toLowerCase()));

      const queryMatch = !this.hubSearchQuery.trim() ||
        (hub['Tên BC'] && hub['Tên BC'].toLowerCase().includes(this.hubSearchQuery.toLowerCase())) ||
        (hub['ID BC'] && hub['ID BC'].toLowerCase().includes(this.hubSearchQuery.toLowerCase())) ||
        (hub['Vùng'] && hub['Vùng'].toLowerCase().includes(this.hubSearchQuery.toLowerCase()));

      return regionMatch && warehouseMatch && idMatch && queryMatch;
    });
  }

  searchHubs(): void {
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
            'Lat': parseFloat(warehouse.latitude) || 0,
            'Lng': parseFloat(warehouse.longitude) || 0,
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
    return [...new Set(this.allHubs.map(hub => hub['Vùng']).filter(region => region !== undefined))] as string[];
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
    this.selectedHubs = [...this.allHubs];
    this.updateMapMarkers();
  }

  async confirmHubSelection(): Promise<void> {
    this.closeHubSearchDialog();
    await this.updateMapMarkers();
  }

  async removeHub(hub: any): Promise<void> {
    const index = this.selectedHubs.findIndex(selected => selected['ID BC'] === hub['ID BC']);
    if (index > -1) {
      this.selectedHubs.splice(index, 1);
      await this.updateMapMarkers();
    }
  }

  getHubTypeBadgeClass(type?: string): string {
    switch (type) {
      case 'Trung tâm': return 'bg-blue-100 text-blue-800';
      case 'Phụ trợ': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getRegionBadgeClass(region?: string): string {
    switch (region) {
      case 'NTB': return 'bg-blue-100 text-blue-800';
      case 'HCM': return 'bg-green-100 text-green-800';
      case 'HN': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Hub search dialog methods
  openHubSearchDialog(): void {
    this.showHubSearchDialog = true;
    this.filterHubs();
  }

  closeHubSearchDialog(): void {
    this.showHubSearchDialog = false;
  }

  // Map methods
  async initializeMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.hubMap || !this.hubMap.nativeElement) {
      return;
    }

    if (this.map) {
      return;
    }

    try {
      const leafletModule = await import('leaflet');
      const L = leafletModule as any;

      // Use local assets for marker icons
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

      this.map = L.map(this.hubMap.nativeElement, {
        center: [14.0583, 108.2772],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3
      }).addTo(this.map);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 300);

    } catch (error) {
      console.error('[PlanningProductivity] Error initializing map:', error);
      this.map = null;
    }
  }

  async updateMapMarkers(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.map) {
      return;
    }

    try {
      const L = await import('leaflet');

      this.hubMarkers.forEach(marker => {
        if (this.map && this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      });
      this.hubMarkers = [];

      this.selectedHubs.forEach((hub) => {
        if (hub['Lat'] && hub['Lng'] && typeof hub['Lat'] === 'number' && typeof hub['Lng'] === 'number') {
          const lat = hub['Lat'];
          const lng = hub['Lng'];

          if (lat !== 0 && lng !== 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            try {
              const marker = L.marker([lat, lng])
                .addTo(this.map)
                .bindPopup('<div class="p-2 max-w-xs"><h3 class="font-semibold text-sm mb-1">' + (hub['Tên BC'] || 'Unknown') + '</h3><p class="text-xs text-gray-600 mb-1">ID: ' + (hub['ID BC'] || 'N/A') + '</p><p class="text-xs text-gray-600 mb-1">' + (hub['Quận/Huyện'] || '') + ', ' + (hub['Tỉnh'] || '') + '</p><p class="text-xs text-gray-600">Vùng: ' + (hub['Vùng'] || 'N/A') + '</p></div>');
              this.hubMarkers.push(marker);
            } catch (markerError) {
              console.error('[PlanningProductivity] Error creating marker for', hub['Tên BC'], markerError);
            }
          }
        }
      });

      if (this.hubMarkers.length > 0) {
        try {
          const group = L.featureGroup(this.hubMarkers);
          const bounds = group.getBounds();
          if (bounds.isValid()) {
            this.map.fitBounds(bounds.pad(0.1));
          }
        } catch (boundsError) {
          console.error('[PlanningProductivity] Error fitting map bounds:', boundsError);
        }
      }

    } catch (error) {
      console.error('[PlanningProductivity] Error updating map markers:', error);
    }
  }
}
