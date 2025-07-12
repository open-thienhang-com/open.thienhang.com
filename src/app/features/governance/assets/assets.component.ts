import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { GovernanceServices } from '../../../core/services/governance.services';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { AssetComponent } from './asset/asset.component';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-assets',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    Tag,
    Button,
    AssetComponent,
    InputTextModule,
    DropdownModule,
    BadgeModule,
    PaginatorModule,
    TooltipModule,
    ChipModule,
    ToastModule,
    CardModule,
    DialogModule,
    SkeletonModule,
    InputGroupModule,
    InputGroupAddonModule,
    DataViewModule,
    DividerModule,
    PanelModule,
    ProgressSpinnerModule
  ],
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent extends AppBaseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private filterSubject = new Subject<void>();

  // Cache system
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SEARCH_DEBOUNCE = 800; // 800ms debounce
  private readonly FILTER_DEBOUNCE = 300; // 300ms debounce

  // Prevent duplicate requests
  private pendingRequests = new Set<string>();

  assets: any = { data: [], total: 0 };
  filteredAssets: any[] = [];
  totalRecords: number = 0;
  currentPage: number = 0;
  lastRequestKey: string = '';

  // Stats
  stats = {
    totalAssets: 0,
    activeAssets: 0,
    criticalAssets: 0,
    pendingAssets: 0
  };

  // Filters
  showFilters: boolean = false;
  searchTerm: string = '';
  selectedType: any = null;
  selectedSensitivity: any = null;
  selectedStatus: any = null;

  // Pagination and loading
  loading: boolean = false;
  isFromCache: boolean = false;

  // Options for dropdowns
  typeOptions = [
    { label: 'Function', value: 'func' },
    { label: 'Database', value: 'database' },
    { label: 'File System', value: 'filesystem' },
    { label: 'API', value: 'api' },
    { label: 'Service', value: 'service' },
    { label: 'Application', value: 'application' }
  ];

  sensitivityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Deprecated', value: 'deprecated' }
  ];

  // View mode toggle
  viewMode: 'list' | 'card' = 'list';

  // Pagination size options
  pageSizeOptions = [
    { label: '5 per page', value: 5 },
    { label: '10 per page', value: 10 },
    { label: '25 per page', value: 25 },
    { label: '50 per page', value: 50 },
    { label: '100 per page', value: 100 }
  ];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices,
    public messageService: MessageService
  ) {
    super(injector)
  }

  ngOnInit() {
    console.log('Assets component initialized');

    // Initialize with default values to prevent blank page
    this.assets = { data: [], total: 0 };
    this.filteredAssets = [];
    this.totalRecords = 0;
    this.stats = {
      totalAssets: 0,
      activeAssets: 0,
      criticalAssets: 0,
      pendingAssets: 0
    };

    // Setup search debouncing
    this.searchSubject
      .pipe(
        debounceTime(this.SEARCH_DEBOUNCE),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.getAssets(0);
      });

    // Setup filter debouncing
    this.filterSubject
      .pipe(
        debounceTime(this.FILTER_DEBOUNCE),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.getAssets(0);
      });

    // Load initial data
    this.getAssets();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clear any pending timeouts
    this.pendingRequests.clear();
    this.cache.clear();
  }  // Generate cache key based on current filters and pagination
  private generateCacheKey(page: number = 0): string {
    const params = {
      page,
      size: this.tableRowsPerPage,
      search: this.searchTerm?.trim() || '',
      type: this.selectedType || '',
      sensitivity: this.selectedSensitivity || '',
      status: this.selectedStatus || ''
    };
    return JSON.stringify(params);
  }

  // Check if cache is valid
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  }

  // Get data from cache
  private getCachedData(cacheKey: string): any {
    const cached = this.cache.get(cacheKey);
    return cached ? cached.data : null;
  }

  // Store data in cache
  private setCachedData(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
  }

  // Clean expired cache entries
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Test API call method
  testApiCall() {
    this.messageService.add({
      severity: 'info',
      summary: 'Testing API',
      detail: 'Testing API connection...'
    });
    // Force refresh without cache
    this.getAssets(0, true);
  }

  getAssets = (page = 0, forceRefresh = false) => {
    const cacheKey = this.generateCacheKey(page);

    // Check if this exact request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log('Request already pending, skipping...');
      return;
    }

    // Check cache first (unless forced refresh)
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      console.log('Using cached data for:', cacheKey);
      const cachedData = this.getCachedData(cacheKey);
      this.assets = cachedData;
      this.filteredAssets = cachedData?.data || [];
      this.totalRecords = cachedData?.total || 0;
      this.currentPage = page;
      this.lastRequestKey = cacheKey;
      this.isFromCache = true;
      this.updateStats();

      // Show cache notification
      this.messageService.add({
        severity: 'success',
        summary: 'Cached Data',
        detail: `Loaded ${this.filteredAssets.length} assets from cache`,
        life: 2000
      });

      return;
    }

    // Clean expired cache entries periodically
    this.cleanExpiredCache();

    this.loading = true;
    this.isTableLoading = true;
    this.currentPage = page;
    this.lastRequestKey = cacheKey;

    // Add to pending requests
    this.pendingRequests.add(cacheKey);

    const params = {
      offset: page * this.tableRowsPerPage,
      size: this.tableRowsPerPage
    };

    // Add search parameter if search term exists
    if (this.searchTerm && this.searchTerm.trim()) {
      params['search'] = this.searchTerm.trim();
    }

    // Add type filter if selected
    if (this.selectedType) {
      params['type'] = this.selectedType;
    }

    // Add sensitivity filter if selected
    if (this.selectedSensitivity) {
      params['sensitivity'] = this.selectedSensitivity;
    }

    // Add status filter if selected
    if (this.selectedStatus) {
      params['status'] = this.selectedStatus;
    }

    console.log('Making API call with params:', params);

    this.governanceServices.getAssets(params).subscribe({
      next: (res) => {
        console.log('API Response received:', res);

        // Only process if this is still the latest request
        if (this.lastRequestKey === cacheKey) {
          this.assets = res;
          this.filteredAssets = res?.data || [];
          this.totalRecords = res?.total || 0;
          this.isFromCache = false;
          this.updateStats();

          // Cache the response
          this.setCachedData(cacheKey, res);

          this.messageService.add({
            severity: 'success',
            summary: 'Fresh Data',
            detail: `Loaded ${this.filteredAssets.length} assets from API`,
            life: 2000
          });
        }

        this.loading = false;
        this.isTableLoading = false;
        this.pendingRequests.delete(cacheKey);
      },
      error: (error) => {
        console.error('Error fetching assets:', error);

        // Only process if this is still the latest request
        if (this.lastRequestKey === cacheKey) {
          // Initialize empty state
          this.assets = { data: [], total: 0 };
          this.filteredAssets = [];
          this.totalRecords = 0;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch assets. Showing empty state.'
          });
        }

        this.loading = false;
        this.isTableLoading = false;
        this.pendingRequests.delete(cacheKey);
      }
    });
  }

  refreshAssets() {
    // Clear cache and force refresh
    this.cache.clear();
    this.getAssets(this.currentPage, true);
  }

  // Export assets to Excel
  exportAssets() {
    this.loading = true;
    this.governanceServices.getAssets({ size: 1000 }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.data) {
          this.downloadAsExcel(res.data);
          this.messageService.add({
            severity: 'success',
            summary: 'Export Success',
            detail: 'Assets exported successfully'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error exporting assets:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Export Error',
          detail: 'Failed to export assets'
        });
      }
    });
  }

  // Download data as Excel file
  private downloadAsExcel(data: any[]) {
    const exportData = data.map(asset => ({
      ID: asset._id,
      Name: asset.name,
      Type: asset.type,
      Source: asset.source,
      Location: asset.location,
      Owner: asset.owner,
      Sensitivity: asset.sensitivity,
      Status: asset.status,
      Description: asset.description,
      Tags: asset.tags ? asset.tags.join(', ') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

    const fileName = `assets_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  updateStats() {
    if (this.assets?.data) {
      const data = this.assets.data;
      // Use total from API response for overall stats
      this.stats.totalAssets = this.assets.total || data.length;
      this.stats.activeAssets = data.filter((asset: any) => asset.status === 'active').length;
      this.stats.criticalAssets = data.filter((asset: any) => asset.sensitivity === 'critical').length;
      this.stats.pendingAssets = data.filter((asset: any) => asset.status === 'maintenance' || asset.status === 'pending').length;
    } else {
      this.stats = {
        totalAssets: 0,
        activeAssets: 0,
        criticalAssets: 0,
        pendingAssets: 0
      };
    }
  }

  // Use debounced filter subject
  filterAssets() {
    this.filterSubject.next();
  }

  // Use debounced filter subject
  applyFilters() {
    this.filterSubject.next();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = null;
    this.selectedSensitivity = null;
    this.selectedStatus = null;
    this.currentPage = 0;
    // Use debounced filter subject
    this.filterSubject.next();
  }

  // Use debounced search subject
  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // Asset detail modal
  selectedAsset: any = null;
  showAssetDetailModal: boolean = false;

  // View asset details
  viewAsset(asset: any) {
    this.loading = true;
    this.governanceServices.getAsset(asset._id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.data) {
          this.selectedAsset = res.data;
          this.showAssetDetailModal = true;
        } else {
          // Fallback to showing the asset data we have
          this.selectedAsset = asset;
          this.showAssetDetailModal = true;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching asset detail:', error);
        // Show modal with available data
        this.selectedAsset = asset;
        this.showAssetDetailModal = true;
        this.messageService.add({
          severity: 'warn',
          summary: 'Limited Data',
          detail: 'Showing available asset information'
        });
      }
    });
  }

  // Close asset detail modal
  closeAssetDetailModal() {
    this.showAssetDetailModal = false;
    this.selectedAsset = null;
  }

  // Truncate location text for better display
  truncateLocation(location: string, maxLength: number = 30): string {
    if (!location) return 'Not specified';
    return location.length > maxLength ? location.substring(0, maxLength) + '...' : location;
  }

  // Get full location for tooltip
  getFullLocation(location: string): string {
    return location || 'Location not specified';
  }

  // Copy text to clipboard
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Text copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy text'
      });
    });
  }

  // Delete asset with confirmation
  onDeleteAsset(event: Event, assetId: string) {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      this.loading = true;
      this.governanceServices.deleteAsset(assetId).subscribe({
        next: (res) => {
          this.loading = false;
          if (res?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Asset deleted successfully'
            });
            this.refreshAssets();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res?.message || 'Failed to delete asset'
            });
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error deleting asset:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete asset'
          });
        }
      });
    }
  }

  // Manage permissions placeholder
  managePermissions(asset: any) {
    this.messageService.add({
      severity: 'info',
      summary: 'Permissions',
      detail: `Managing permissions for ${asset.name}`
    });
    // TODO: Implement permission management
  }

  onPageChange(event: any) {
    this.getAssets(event.page);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'maintenance':
        return 'warning';
      case 'deprecated':
        return 'danger';
      default:
        return 'info';
    }
  }

  getSensitivitySeverity(sensitivity: string) {
    switch (sensitivity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'critical':
        return 'danger';
      default:
        return 'info';
    }
  }

  // Get sensitivity color for icon
  getSensitivityColor(sensitivity: string): string {
    switch (sensitivity?.toLowerCase()) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
      default:
        return 'text-green-500';
    }
  }

  // Get asset icon based on type
  getAssetIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'database':
        return 'pi pi-database';
      case 'api':
        return 'pi pi-globe';
      case 'file':
      case 'filesystem':
        return 'pi pi-file';
      case 'service':
        return 'pi pi-cog';
      case 'application':
        return 'pi pi-desktop';
      case 'func':
      case 'function':
        return 'pi pi-code';
      default:
        return 'pi pi-box';
    }
  }

  // Get asset color based on type
  getAssetColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'database':
        return 'from-blue-500 to-blue-600';
      case 'api':
        return 'from-green-500 to-green-600';
      case 'file':
      case 'filesystem':
        return 'from-yellow-500 to-yellow-600';
      case 'service':
        return 'from-purple-500 to-purple-600';
      case 'application':
        return 'from-indigo-500 to-indigo-600';
      case 'func':
      case 'function':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  }

  // Toggle view mode between list and card
  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
    this.messageService.add({
      severity: 'info',
      summary: 'View Changed',
      detail: `Switched to ${this.viewMode} view`
    });
  }

  // Change page size
  onPageSizeChange(event: any) {
    this.tableRowsPerPage = event.value;
    this.currentPage = 0; // Reset to first page

    // Clear cache since page size changed
    this.cache.clear();
    this.getAssets(0, true); // Force refresh with new page size

    this.messageService.add({
      severity: 'info',
      summary: 'Page Size Changed',
      detail: `Showing ${this.tableRowsPerPage} items per page`
    });
  }

  // Cache management methods for external use
  clearCache() {
    this.cache.clear();
    this.governanceServices.clearCache(); // Also clear service-level cache
    this.messageService.add({
      severity: 'info',
      summary: 'Cache Cleared',
      detail: 'All cached data has been cleared'
    });
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      ttl: this.CACHE_TTL / 1000 / 60 // in minutes
    };
  }
}
