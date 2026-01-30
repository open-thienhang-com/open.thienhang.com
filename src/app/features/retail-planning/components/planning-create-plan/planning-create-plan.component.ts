import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, PLATFORM_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DatasetService, Warehouse } from '../../services/dataset.service';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-planning-create-plan',
  imports: [CommonModule, FormsModule, AutoCompleteModule, DialogModule, ButtonModule, CheckboxModule, TableModule, PageHeaderComponent],
  templateUrl: './planning-create-plan.component.html',
  styleUrl: './planning-create-plan.component.css',
})
export class PlanningCreatePlanComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('createPlanMap', { static: false }) mapContainerRef!: ElementRef<HTMLDivElement>;

  // Step management
  currentStep: number = 1;

  // Step 1: Region and Delivery Points
  warehouseRegionShortname: string = 'HNO'; // Rename to match dataset component
  availableRegions = [
    { code: 'HNO', name: 'Hà Nội' },
    { code: 'HCM', name: 'Hồ Chí Minh' },
    { code: 'HPG', name: 'Hải Phòng' },
    { code: 'DAD', name: 'Đà Nẵng' },
    { code: 'CXR', name: 'Cần Thơ' },
    { code: 'HAN', name: 'Hà Nam' },
    { code: 'VPC', name: 'Vĩnh Phúc' },
    { code: 'HPH', name: 'Hải Phòng' },
    { code: 'QNH', name: 'Quảng Ninh' },
    { code: 'BNH', name: 'Bắc Ninh' }
  ];

  // Warehouse search and selection (match dataset component naming)
  warehouseSearchQuery: string = '';
  warehouseSuggestions: Warehouse[] = [];
  warehouseAutoLoading: boolean = false;
  timelineWarehouses: Warehouse[] = []; // Rename from selectedPoints to match dataset
  selectedWarehouse: Warehouse | null = null; // Currently selected warehouse
  private warehouseAutoCompleteSubject = new Subject<string>();
  
  // Warehouse list (all warehouses loaded for the region)
  warehouses: Warehouse[] = [];
  loadingWarehouses: boolean = false;
  warehousesError: string | null = null;

  // Region Selection Modal State
  showRegionSelectionModal: boolean = false;
  modalSelectedRegion: string = '';
  modalWarehouses: Warehouse[] = []; // Warehouses loaded in modal
  modalSelectedWarehouses: Set<string> = new Set(); // Selected warehouse IDs in modal
  loadingModalWarehouses: boolean = false;
  modalWarehousesError: string | null = null;

  // Map
  map: any = null;
  markerLayer: any = null;
  markersById = new Map<string, any>();
  mapLoaded: boolean = false;
  private readonly VIETNAM_BOUNDS: [number, number, number, number] = [8.5, 102.0, 23.5, 110.0]; // [south, west, north, east]

  // Step 2: Demands
  demands: any[] = [];
  loadingDemands: boolean = false;
  demandsError: string | null = null;
  selectedDemand: any | null = null;
  demandSearchQuery = '';
  demandSortField: string | null = null;
  demandSortOrder: 'asc' | 'desc' = 'desc';
  
  // Shift configuration
  shifts: Array<{ name: string; start_hour: number; end_hour: number }> = [
    { name: 'sáng', start_hour: 6, end_hour: 10 },
    { name: 'trưa', start_hour: 10, end_hour: 14 },
    { name: 'chiều', start_hour: 14, end_hour: 18 },
    { name: 'tối', start_hour: 18, end_hour: 22 }
  ];
  showShiftEditorModal: boolean = false;
  shiftErrors: string[] = [];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  hoursInclusive: number[] = Array.from({ length: 25 }, (_, i) => i);
  
  // Shift assignment for each demand (warehouse_id -> shift index)
  demandShiftAssignment: Map<string | number, number> = new Map();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private datasetService: DatasetService
  ) {}

  ngOnInit(): void {
    // Initialize date range for demands - from 30 days ago to today
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Note: We don't store date range separately anymore, it's calculated in loadDemands

      // Setup warehouse autocomplete (match dataset component exactly)
      this.warehouseAutoCompleteSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q: string) => {
          if (!q || q.length < 1) return of([]);
          this.warehouseAutoLoading = true;
          return this.datasetService.getWarehouses({ 
            region_shortname: this.warehouseRegionShortname, 
            size: 5, 
            search: q 
          }).pipe(
            map((resp: any) => {
              this.warehouseAutoLoading = false;
              const respAny: any = resp as any;
              return Array.isArray(respAny.data) ? respAny.data : (respAny.data?.data || []);
            }),
            catchError((err: any) => {
              console.error('[PlanningCreatePlan] warehouse autocomplete error', err);
              this.warehouseAutoLoading = false;
              return of([]);
            })
          );
        })
      ).subscribe((results: Warehouse[]) => {
        // Limit suggestions shown to 5 items (match dataset component)
        this.warehouseSuggestions = (results || []).slice(0, 5);
        this.cdr.detectChanges();
      });

    // Expose global function for legacy compatibility
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      (window as any).goToCreatePlanStep = (step: number) => this.goToCreatePlanStep(step);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Cleanup map
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      
      // Cleanup window functions
    if (typeof window !== 'undefined') {
      try {
        if ((window as any).goToCreatePlanStep) delete (window as any).goToCreatePlanStep;
      } catch (e) {
        // ignore
      }
    }
  }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Wait a bit to ensure ViewChild is available
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Initialize map
    await this.initMap();
    
    // Wait a bit more for map to render
    await new Promise(resolve => setTimeout(resolve, 200));
    this.cdr.detectChanges();
  }

  // Step navigation
  goToCreatePlanStep(step: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (step < 1 || step > 5) return;
    
    this.currentStep = step;
    console.log('[PlanningCreatePlan] Going to step:', step);
    
    // If moving to step 2, auto-load demands if points are selected
    if (step === 2 && this.timelineWarehouses.length > 0) {
      this.loadDemands();
    }
    
    this.cdr.detectChanges();
  }

  // Step 1: Region selection (match dataset component exactly)
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
            // this.warehouseTotal = respAny.data.length;
          } else {
            // this.warehouseTotal = respAny.data?.meta?.total || this.warehouses.length;
          }

          // Auto-add all warehouses in this region to the timeline (match dataset component exactly - append, don't clear)
          let addedCount = 0;
          for (const wh of this.warehouses) {
            if (!this.timelineWarehouses.find((w: any) => (w.warehouse_id || w.id) === (wh.warehouse_id || wh.id))) {
              this.timelineWarehouses.push(wh);
              addedCount++;
            }
          }

          if (addedCount > 0) {
            console.log(`[PlanningCreatePlan] Auto-added ${addedCount} warehouses to timeline for region ${this.warehouseRegionShortname}`);
            // Update map with all warehouses in timeline
            this.renderAllPointsOnMap();
          }

          // Clear search suggestions
          this.warehouseSuggestions = [];
          this.warehouseSearchQuery = '';
        } catch (e) {
          console.error('[PlanningCreatePlan] onWarehouseRegionChange processing error', e);
          this.warehousesError = 'Lỗi khi xử lý danh sách bưu cục';
        }
        this.loadingWarehouses = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[PlanningCreatePlan] onWarehouseRegionChange error', error);
        this.warehousesError = error.message || 'Lỗi khi tải danh sách bưu cục';
        this.loadingWarehouses = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Step 1: Warehouse search and autocomplete (match dataset component exactly)
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
      this.cdr.detectChanges();
    }
  }

  onWarehouseResultClick(item: any): void {
    // Called when user clicks an item in our custom results list (match dataset component)
    if (!item) return;
    this.warehouseSearchQuery = item.warehouse_name || '';
    this.warehouseSuggestions = []; // hide list
    this.selectWarehouse(item);
    this.addToTimeline(item);
    this.cdr.detectChanges();
  }

  selectWarehouse(warehouse: Warehouse): void {
    this.selectedWarehouse = warehouse;
    // Optionally update map to show selected warehouse
    this.updateMapForSelection(warehouse);
  }

  private async updateMapForSelection(warehouse: Warehouse): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!warehouse || !this.map) return;

    const lat = Number(warehouse.latitude);
    const lng = Number(warehouse.longitude);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('[PlanningCreatePlan] Invalid coordinates for selected warehouse:', warehouse.warehouse_name);
      return;
    }

    try {
      const L = await import('leaflet');
      const id = (warehouse.warehouse_id || warehouse.id || '').toString();
      const existing = this.markersById.get(id);

      if (existing) {
        try {
          existing.openPopup();
          this.map.setView(existing.getLatLng ? existing.getLatLng() : [lat, lng], 13);
        } catch (e) {
          console.error('[PlanningCreatePlan] Error opening popup for existing marker:', e);
        }
      }
    } catch (error) {
      console.error('[PlanningCreatePlan] Error updating map for selection:', error);
    }
  }

  // Step 1: Add to timeline (match dataset component exactly)
  addToTimeline(warehouse: Warehouse): void {
    if (!this.timelineWarehouses.find(w => (w.warehouse_id || w.id) === (warehouse.warehouse_id || warehouse.id))) {
      this.timelineWarehouses.push(warehouse);
      console.log('[PlanningCreatePlan] Added warehouse to timeline:', warehouse.warehouse_name);
      
      // Draw point on map
      this.addPointToMap(warehouse, this.timelineWarehouses.length - 1);
      
      this.cdr.detectChanges();
    } else {
      console.log('[PlanningCreatePlan] Warehouse already in timeline:', warehouse.warehouse_name);
    }
  }

  // Step 1: Remove from timeline (match dataset component exactly)
  removeFromTimeline(warehouse: Warehouse): void {
    const index = this.timelineWarehouses.findIndex(w => (w.warehouse_id || w.id) === (warehouse.warehouse_id || warehouse.id));
    if (index > -1) {
      this.timelineWarehouses.splice(index, 1);
      
      // Remove marker from map
      this.removePointFromMap(warehouse);
      
      // Re-render all points to update indices
      this.renderAllPointsOnMap();
      
      this.cdr.detectChanges();
    }
  }

  // Step 1: Check if warehouse is in timeline (match dataset component)
  isInTimeline(warehouse: Warehouse): boolean {
    return this.timelineWarehouses.some(w => (w.warehouse_id || w.id) === (warehouse.warehouse_id || warehouse.id));
  }

  // Step 1: Clear all points
  clearAllPoints(): void {
    this.timelineWarehouses = [];
    this.clearMapMarkers();
    this.cdr.detectChanges();
  }
  
  // Alias for compatibility (keeping selectedPoints name in some places)
  get selectedPoints(): Warehouse[] {
    return this.timelineWarehouses;
  }


  // Map initialization and management
  private async initMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.map) {
      console.log('[PlanningCreatePlan] Map already initialized');
      return;
    }

    try {
      // Load Leaflet CSS if not already loaded
      const cssId = 'leaflet-css-planning';
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        // Wait a bit for CSS to load
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const L = await import('leaflet');
      
      // Get container element - try ViewChild first, then fallback to ID
      let container: HTMLElement | null = this.mapContainerRef?.nativeElement || null;
      if (!container) {
        container = document.getElementById('cp_route_map');
      }
      if (!container) {
        console.error('[PlanningCreatePlan] Map container not found. ViewChild:', this.mapContainerRef);
        // Retry after a delay
        setTimeout(() => this.initMap(), 500);
        return;
      }
      
      // Cast to HTMLDivElement for Leaflet (it accepts HTMLElement, so this is safe)
      const mapContainer = container as HTMLDivElement;

      console.log('[PlanningCreatePlan] Initializing map on container:', mapContainer);

      // Initialize map centered on Vietnam with bounds restriction
      const [s, w, n, e] = this.VIETNAM_BOUNDS;
      const defaultCenter: [number, number] = [21.0278, 105.8342]; // Center of Vietnam (Hanoi area)
      const centerLat = defaultCenter[0];
      const centerLng = defaultCenter[1];
      
      // Create Vietnam bounds
      const southWest = L.latLng(s, w);
      const northEast = L.latLng(n, e);
      const bounds = L.latLngBounds(southWest, northEast);

      // Fix Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Initialize map with maxBounds to restrict panning to Vietnam only
      this.map = L.map(mapContainer, {
        center: [centerLat, centerLng],
        zoom: 6,
        zoomControl: true,
        minZoom: 5,
        maxZoom: 18,
        maxBounds: bounds,
        maxBoundsViscosity: 0.8 // Allows slight dragging outside bounds but pulls back
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Create marker layer
      this.markerLayer = L.layerGroup().addTo(this.map);

      // Fit bounds to Vietnam (ensure initial view shows Vietnam)
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });

      // Invalidate size multiple times to ensure proper rendering
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 100);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.mapLoaded = true;
          console.log('[PlanningCreatePlan] Map initialized successfully');
          this.cdr.detectChanges();
        }
      }, 300);

    } catch (error) {
      console.error('[PlanningCreatePlan] Error initializing map:', error);
      this.mapLoaded = false;
      this.cdr.detectChanges();
      // Retry after a delay if initialization failed
      setTimeout(() => {
        if (!this.map) {
          console.log('[PlanningCreatePlan] Retrying map initialization...');
          this.initMap();
        }
      }, 1000);
    }
  }

  private async addPointToMap(warehouse: Warehouse, index: number): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.map) {
      await this.initMap();
      if (!this.map) return;
    }

    const lat = Number(warehouse.latitude);
    const lng = Number(warehouse.longitude);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('[PlanningCreatePlan] Invalid coordinates for warehouse:', warehouse.warehouse_name);
      return;
    }

    try {
      const L = await import('leaflet');
      const id = (warehouse.warehouse_id || warehouse.id || '').toString();

      // Create marker with number
      const iconHtml = `
        <div style="position: relative; display: inline-block; width: 40px; height: 40px;">
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="var(--p-primary-500)" stroke="white" stroke-width="2"/>
          </svg>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      width: 24px; height: 24px; background-color: rgba(var(--p-primary-500), 0.95); 
                      border-radius: 50%; border: 2px solid white;
                      display: flex; align-items: center; justify-content: center;
                      color: white; font-weight: bold; font-size: 12px; 
                      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${index + 1}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-point-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px; font-weight: 600; color: #111827;">${warehouse.warehouse_name || 'Unknown'}</h4>
          <div style="font-size: 12px; color: #6b7280;">
            <div>📍 ${warehouse.warehouse_address || 'Chưa có địa chỉ'}</div>
            <div>🏢 ${warehouse.district_name || ''}, ${warehouse.province_name || ''}</div>
            <div>🆔 ID: ${warehouse.warehouse_id || warehouse.id || 'N/A'}</div>
          </div>
        </div>
      `);

      marker.addTo(this.markerLayer);
      this.markersById.set(id, marker);

      // Fit bounds to show all points
      this.fitMapToPoints();

      console.log('[PlanningCreatePlan] Added marker for point:', warehouse.warehouse_name);
    } catch (error) {
      console.error('[PlanningCreatePlan] Error adding point to map:', error);
    }
  }

  private removePointFromMap(warehouse: Warehouse): void {
    const id = (warehouse.warehouse_id || warehouse.id || '').toString();
    const marker = this.markersById.get(id);
    if (marker && this.markerLayer) {
      this.markerLayer.removeLayer(marker);
      this.markersById.delete(id);
    }
  }

  private clearMapMarkers(): void {
    if (this.markerLayer) {
      this.markerLayer.clearLayers();
    }
    this.markersById.clear();
  }

  private async renderAllPointsOnMap(): Promise<void> {
    this.clearMapMarkers();
    
    for (let i = 0; i < this.timelineWarehouses.length; i++) {
      await this.addPointToMap(this.timelineWarehouses[i], i);
    }
    
    this.fitMapToPoints();
  }

  private fitMapToPoints(): void {
    if (!this.map || this.timelineWarehouses.length === 0) {
      // If no points, fit to Vietnam bounds
      this.fitMapToVietnam();
      return;
    }

    try {
      const [s, w, n, e] = this.VIETNAM_BOUNDS;
      const latlngs = this.timelineWarehouses
        .map(p => {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
          // Clamp coordinates to Vietnam bounds to ensure they're within Vietnam
          const clampedLat = Math.max(s, Math.min(n, lat));
          const clampedLng = Math.max(w, Math.min(e, lng));
          return [clampedLat, clampedLng] as [number, number];
        })
        .filter((p): p is [number, number] => p !== null);

      if (latlngs.length === 0) {
        this.fitMapToVietnam();
        return;
      }

      import('leaflet').then(L => {
        if (latlngs.length === 1) {
          // Single point - zoom to it but ensure it's within Vietnam bounds
          const [lat, lng] = latlngs[0];
          const clampedLat = Math.max(s, Math.min(n, lat));
          const clampedLng = Math.max(w, Math.min(e, lng));
          this.map.setView([clampedLat, clampedLng], 13);
        } else {
          // Multiple points - fit bounds but ensure all points are within Vietnam
          const pointsBounds = L.latLngBounds(latlngs as any);
          try {
            this.map.fitBounds(pointsBounds, { padding: [40, 40], maxZoom: 12 });
          } catch (e) {
            // Fallback to Vietnam bounds if points bounds calculation fails
            console.warn('[PlanningCreatePlan] Error fitting to points bounds, using Vietnam bounds:', e);
            this.fitMapToVietnam();
          }
        }
      });
    } catch (error) {
      console.error('[PlanningCreatePlan] Error fitting map to points:', error);
      this.fitMapToVietnam();
    }
  }

  private fitMapToVietnam(): void {
    if (!this.map) return;
    
    try {
      import('leaflet').then(L => {
        const [s, w, n, e] = this.VIETNAM_BOUNDS;
        const southWest = L.latLng(s, w);
        const northEast = L.latLng(n, e);
        const bounds = L.latLngBounds(southWest, northEast);
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      });
    } catch (error) {
      console.error('[PlanningCreatePlan] Error fitting map to Vietnam:', error);
    }
  }

  // Helper: Get region name from code
  getRegionName(code: string): string {
    const region = this.availableRegions.find(r => r.code === code);
    return region ? region.name : code;
  }

  // Getter: Calculate total demand weight
  getTotalDemandWeight(): number {
    if (!this.demands || this.demands.length === 0) return 0;
    return this.demands.reduce((sum, d) => sum + (d.weight_kg || d.weight || 0), 0);
  }

  // Getter: Get formatted total demand weight
  getFormattedTotalDemandWeight(): string {
    return this.getTotalDemandWeight().toLocaleString();
  }

  // Alias getter for compatibility - selectedRegion maps to warehouseRegionShortname
  get selectedRegion(): string {
    return this.warehouseRegionShortname;
  }

  set selectedRegion(value: string) {
    this.warehouseRegionShortname = value;
  }
  
  // Alias method for compatibility
  onRegionChange(region: string): void {
    this.onWarehouseRegionChange(region);
  }
  
  // For backward compatibility - warehouseCurrentPage
  warehouseCurrentPage: number = 1;

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
  }

  closeRegionSelectionModal(): void {
    this.showRegionSelectionModal = false;
    this.modalSelectedWarehouses.clear();
    this.modalWarehouses = [];
    this.modalWarehousesError = null;
  }

  onModalRegionChange(): void {
    this.modalSelectedWarehouses.clear();
    this.modalWarehouses = [];
    this.modalWarehousesError = null;
    
    if (this.modalSelectedRegion) {
      this.loadWarehousesForModal();
    }
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
          console.error('[PlanningCreatePlan] loadWarehousesForModal error', e);
          this.modalWarehousesError = 'Lỗi khi tải danh sách bưu cục';
        }
        this.loadingModalWarehouses = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[PlanningCreatePlan] loadWarehousesForModal error', error);
        this.modalWarehousesError = error.message || 'Lỗi khi tải danh sách bưu cục';
        this.loadingModalWarehouses = false;
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  deselectAllWarehousesInModal(): void {
    this.modalSelectedWarehouses.clear();
    this.cdr.detectChanges();
  }

  confirmModalSelection(): void {
    if (!this.modalSelectedRegion || this.modalSelectedWarehouses.size === 0) {
      console.warn('[PlanningCreatePlan] No region or warehouses selected');
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

    console.log(`[PlanningCreatePlan] Updated timeline: ${addedCount} added, ${warehousesToRemove.length} removed, ${this.timelineWarehouses.length} total`);

    // Update map with all warehouses in timeline
    this.renderAllPointsOnMap();

    // Close modal
    this.closeRegionSelectionModal();
    this.cdr.detectChanges();
  }

  // Load demands from API
  loadDemands(): void {
    if (this.timelineWarehouses.length === 0) {
      console.log('[PlanningCreatePlan] loadDemands: No warehouses in timeline, skipping');
      this.loadingDemands = false;
      this.demands = [];
      this.cdr.detectChanges();
      return;
    }

    console.log('[PlanningCreatePlan] loadDemands: Starting, timelineWarehouses.length:', this.timelineWarehouses.length);
    this.loadingDemands = true;
    this.demandsError = null;
    this.cdr.detectChanges();

    // Pass numeric IDs to the API (backend expects int[])
    const warehouseIds: number[] = this.timelineWarehouses
      .map(w => (w.warehouse_id || w.id))
      .map(id => Number(id))
      .filter(id => !isNaN(id));

    // Build time_range: default to last 30 days (from 30 days ago to today)
    const today = new Date();
    const defaultEnd = today.toISOString().slice(0, 10);
    const defaultStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const start = defaultStart;
    const end = defaultEnd;

    const payload = {
      warehouse_ids: warehouseIds,
      time_range: { start, end }
    } as { warehouse_ids: number[]; time_range: { start: string; end: string } };

    console.log('[PlanningCreatePlan] loadDemands: Starting with payload:', payload);
    this.datasetService.getDemandsWithTimeRange(payload).subscribe({
      next: (response) => {
        console.log('[PlanningCreatePlan] getDemandsWithTimeRange response:', response);
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
          } else if (Array.isArray(response)) {
            demandsData = response;
          }

          console.log('[PlanningCreatePlan] Parsed demands data:', demandsData);
          this.demands = demandsData;
          this.demandsError = null;
          
          // Set default selected demand to first item if available and no selection exists
          if (!this.selectedDemand && demandsData.length > 0) {
            this.selectedDemand = demandsData[0];
          }
        } catch (e) {
          console.error('[PlanningCreatePlan] Error parsing demands response:', e);
          this.demandsError = 'Lỗi khi xử lý dữ liệu demands';
          this.demands = [];
        }

        this.loadingDemands = false;
        this.cdr.detectChanges();
        console.log('[PlanningCreatePlan] loadDemands completed. loadingDemands:', this.loadingDemands, 'demands.length:', this.demands.length);
      },
      error: (error) => {
        console.error('[PlanningCreatePlan] getDemandsWithTimeRange error:', error);
        this.demandsError = error?.message || 'Lỗi khi tải demands';
        this.demands = [];
        this.loadingDemands = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Get filtered demands for table
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

  // Select a demand (warehouse) from the table
  selectDemand(demand: any): void {
    this.selectedDemand = demand;
    this.cdr.detectChanges();
  }

  // Check if a demand is selected
  isDemandSelected(demand: any): boolean {
    if (!this.selectedDemand || !demand) return false;
    return (this.selectedDemand.warehouse_id || this.selectedDemand.id) === (demand.warehouse_id || demand.id);
  }

  // Sort demands table
  sortDemands(field: string): void {
    if (this.demandSortField === field) {
      // Toggle sort order if same field
      this.demandSortOrder = this.demandSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to descending
      this.demandSortField = field;
      this.demandSortOrder = 'desc';
    }
    this.cdr.detectChanges();
  }

  // Clear search query
  clearSearch(): void {
    this.demandSearchQuery = '';
    this.cdr.detectChanges();
  }

  // Shift editor methods
  openShiftEditorModal(): void {
    this.showShiftEditorModal = true;
    this.cdr.detectChanges();
  }

  closeShiftEditorModal(): void {
    this.showShiftEditorModal = false;
    this.shiftErrors = [];
    this.cdr.detectChanges();
  }

  addShift(): void {
    this.shifts.push({ name: '', start_hour: 0, end_hour: 0 });
    this.cdr.detectChanges();
  }

  removeShift(index: number): void {
    if (this.shifts.length > 1) {
      this.shifts.splice(index, 1);
      // Update assignments for shifted indices
      const newAssignments = new Map<string | number, number>();
      this.demandShiftAssignment.forEach((shiftIndex, warehouseId) => {
        if (shiftIndex < index) {
          newAssignments.set(warehouseId, shiftIndex);
        } else if (shiftIndex > index) {
          newAssignments.set(warehouseId, shiftIndex - 1);
        }
      });
      this.demandShiftAssignment = newAssignments;
      this.cdr.detectChanges();
    }
  }

  validateShifts(): boolean {
    this.shiftErrors = [];
    const errors: string[] = [];
    for (let i = 0; i < this.shifts.length; i++) {
      const shift = this.shifts[i];
      if (!shift.name || shift.name.trim() === '') {
        errors[i] = 'Tên ca không được để trống';
      } else if (shift.start_hour >= shift.end_hour) {
        errors[i] = 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc';
      } else {
        // Check for overlapping shifts
        for (let j = i + 1; j < this.shifts.length; j++) {
          const otherShift = this.shifts[j];
          if (
            (shift.start_hour < otherShift.end_hour && shift.end_hour > otherShift.start_hour) ||
            (otherShift.start_hour < shift.end_hour && otherShift.end_hour > shift.start_hour)
          ) {
            errors[i] = 'Ca bị trùng thời gian với ca khác';
            errors[j] = 'Ca bị trùng thời gian với ca khác';
          }
        }
      }
    }
    this.shiftErrors = errors;
    return errors.length === 0 || errors.every(e => !e);
  }

  saveShifts(): void {
    if (this.validateShifts()) {
      this.closeShiftEditorModal();
      this.cdr.detectChanges();
    }
  }

  // Get shift name for a demand
  getDemandShift(demand: any): string {
    const warehouseId = demand.warehouse_id || demand.id;
    const shiftIndex = this.demandShiftAssignment.get(warehouseId);
    if (shiftIndex !== undefined && this.shifts[shiftIndex]) {
      return this.shifts[shiftIndex].name;
    }
    return '—';
  }

  // Set shift for a demand
  setDemandShift(demand: any, shiftIndex: number): void {
    const warehouseId = demand.warehouse_id || demand.id;
    if (shiftIndex === undefined || shiftIndex === null) {
      this.demandShiftAssignment.delete(warehouseId);
    } else {
      this.demandShiftAssignment.set(warehouseId, shiftIndex);
    }
    this.cdr.detectChanges();
  }

  // Calculate ratio (Lấy/Giao) for a demand
  getDemandRatio(demand: any): number {
    if (!demand.total_deliver || demand.total_deliver === 0) {
      return demand.total_pick > 0 ? 999 : 0;
    }
    return demand.total_pick / demand.total_deliver;
  }

  // Format ratio for display
  formatRatio(ratio: number): string {
    if (ratio === 0) return '0.00';
    if (ratio >= 999) return '∞';
    return ratio.toFixed(2);
  }
}
