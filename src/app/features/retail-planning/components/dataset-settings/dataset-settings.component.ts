import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatasetService, Warehouse } from '../../services/dataset.service';
import { HealthService, ReadinessStatus } from '../../services/health.service';
import { ETLService, ETLHealthStatus } from '../../services/etl.service';
import { SyncService } from '../../services/sync.service';
import { PageHeaderComponent } from '../page-header/page-header.component';

interface Shift {
  name: string;
  start_hour: number;
  end_hour: number;
}

@Component({
  selector: 'app-dataset-settings',
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './dataset-settings.component.html',
  styleUrl: './dataset-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetSettingsComponent implements OnInit, OnDestroy {
  // Region and Warehouse Selection
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

  modalSelectedRegion = '';
  modalWarehouses: Warehouse[] = [];
  modalSelectedWarehouses = new Set<string>();
  loadingModalWarehouses = false;
  modalWarehousesError: string | null = null;

  // Date Range
  demandStartDate = '';
  demandEndDate = '';

  // Shift Configuration
  shifts: Shift[] = [
    { name: 'Ca 1', start_hour: 6, end_hour: 14 },
    { name: 'Ca 2', start_hour: 14, end_hour: 22 }
  ];
  hours = Array.from({ length: 24 }, (_, i) => i);
  hoursInclusive = Array.from({ length: 25 }, (_, i) => i);
  shiftErrors: string[] = [];
  demandErrors: string[] = [];

  // Health Check Status
  healthStatus: {
    readiness?: ReadinessStatus;
    etl?: ETLHealthStatus;
    sync?: { status: string; service: string };
  } = {};
  loadingHealth = false;
  healthError: string | null = null;
  private healthCheckCount = 0;
  private expectedHealthChecks = 3; // readiness, etl, sync

  constructor(
    private datasetService: DatasetService,
    private healthService: HealthService,
    private etlService: ETLService,
    private syncService: SyncService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load from localStorage or use defaults
    const savedRegion = localStorage.getItem('warehouseRegionShortname');
    const savedStartDate = localStorage.getItem('demandStartDate');
    const savedEndDate = localStorage.getItem('demandEndDate');
    const savedShifts = localStorage.getItem('shifts');

    this.modalSelectedRegion = savedRegion || 'HNO';
    this.demandStartDate = savedStartDate || '2025-12-01';
    this.demandEndDate = savedEndDate || '2025-12-14';

    if (savedShifts) {
      try {
        this.shifts = JSON.parse(savedShifts);
      } catch (e) {
        // Use defaults
      }
    }

    // Load warehouses if region is set
    if (this.modalSelectedRegion) {
      this.loadWarehousesForModal();
    }

    // Load health checks
    this.loadHealthChecks();
  }

  ngOnDestroy(): void {
    // Save to localStorage
    localStorage.setItem('warehouseRegionShortname', this.modalSelectedRegion);
    localStorage.setItem('demandStartDate', this.demandStartDate);
    localStorage.setItem('demandEndDate', this.demandEndDate);
    localStorage.setItem('shifts', JSON.stringify(this.shifts));
  }

  loadHealthChecks(): void {
    this.loadingHealth = true;
    this.healthError = null;
    this.healthCheckCount = 0;
    this.cdr.markForCheck();

    // Check readiness (Redis, MongoDB)
    this.healthService.checkReadiness().subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          this.healthStatus.readiness = response.data;
        } else {
          console.warn('Readiness check returned non-ok response:', response);
        }
        this.checkHealthComplete();
      },
      error: (error) => {
        console.error('Readiness check failed:', error);
        this.healthError = 'Không thể kiểm tra trạng thái Redis/MongoDB';
        this.checkHealthComplete();
      }
    });

    // Check ETL health
    this.etlService.getHealth().subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          this.healthStatus.etl = response.data;
        } else {
          console.warn('ETL health check returned non-ok response:', response);
        }
        this.checkHealthComplete();
      },
      error: (error) => {
        console.error('ETL health check failed:', error);
        // Don't set global error, just log - ETL might not be critical
        this.checkHealthComplete();
      }
    });

    // Check Sync health
    this.syncService.getHealth().subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          this.healthStatus.sync = response.data;
        } else {
          console.warn('Sync health check returned non-ok response:', response);
        }
        this.checkHealthComplete();
      },
      error: (error) => {
        console.error('Sync health check failed:', error);
        // Don't set global error, just log - Sync might not be critical
        this.checkHealthComplete();
      }
    });
  }

  private checkHealthComplete(): void {
    this.healthCheckCount++;
    // All health checks completed
    if (this.healthCheckCount >= this.expectedHealthChecks) {
      this.loadingHealth = false;
      this.cdr.markForCheck();
    }
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
    this.cdr.markForCheck();

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
          this.loadingModalWarehouses = false;
          this.cdr.markForCheck();
        } catch (e) {
          this.modalWarehousesError = 'Lỗi khi xử lý danh sách bưu cục';
          this.loadingModalWarehouses = false;
          this.cdr.markForCheck();
        }
      },
      error: (err: any) => {
        this.modalWarehousesError = err?.message || 'Không thể tải bưu cục cho vùng này';
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
    this.modalWarehouses.forEach(wh => {
      const whId = (wh.warehouse_id || wh.id)?.toString();
      if (whId) {
        this.modalSelectedWarehouses.add(whId);
      }
    });
    this.cdr.markForCheck();
  }

  deselectAllWarehousesInModal(): void {
    this.modalSelectedWarehouses.clear();
    this.cdr.markForCheck();
  }

  addShift(): void {
    this.shifts.push({ name: `Ca ${this.shifts.length + 1}`, start_hour: 6, end_hour: 14 });
    this.cdr.markForCheck();
  }

  removeShift(index: number): void {
    if (this.shifts.length > 1) {
      this.shifts.splice(index, 1);
      this.cdr.markForCheck();
    }
  }

  validateShifts(): boolean {
    this.shiftErrors = [];
    if (this.shifts.length === 0) {
      this.shiftErrors.push('Vui lòng thêm ít nhất 1 ca làm việc.');
    }
    for (const s of this.shifts) {
      if (!s.name || s.name.trim() === '') {
        this.shiftErrors.push('Tên ca không được để trống.');
      }
      if (s.start_hour >= s.end_hour) {
        this.shiftErrors.push(`Ca "${s.name}": Giờ kết thúc phải sau giờ bắt đầu.`);
      }
    }
    return this.shiftErrors.length === 0;
  }

  onDateRangeChange(): void {
    this.demandErrors = [];
    if (this.demandStartDate && this.demandEndDate) {
      const start = new Date(this.demandStartDate);
      const end = new Date(this.demandEndDate);
      if (start > end) {
        this.demandErrors.push('Ngày bắt đầu phải trước ngày kết thúc.');
      }
    }
    this.cdr.markForCheck();
  }

  async applySettings(): Promise<void> {
    // Validate
    if (!this.validateShifts()) {
      this.cdr.markForCheck();
      return;
    }

    // Default date range if missing
    if (!this.demandStartDate || !this.demandEndDate) {
      const { start, end } = this.getDefaultDateRange();
      this.demandStartDate = this.demandStartDate || start;
      this.demandEndDate = this.demandEndDate || end;
    }

    // Save to localStorage
    localStorage.setItem('warehouseRegionShortname', this.modalSelectedRegion);
    localStorage.setItem('demandStartDate', this.demandStartDate);
    localStorage.setItem('demandEndDate', this.demandEndDate);
    localStorage.setItem('shifts', JSON.stringify(this.shifts));
    localStorage.setItem('selectedWarehouses', JSON.stringify(Array.from(this.modalSelectedWarehouses)));

    // Navigate back to stochastic page
    this.router.navigate(['/stochastic']);
  }

  cancel(): void {
    this.router.navigate(['/stochastic']);
  }

  private getDefaultDateRange(): { start: string; end: string } {
    const start = '2025-12-01';
    const end = '2025-12-14';
    return { start, end };
  }

  getHealthStatusClass(status: boolean | string | undefined): string {
    if (typeof status === 'boolean') {
      return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
    if (typeof status === 'string') {
      if (status === 'healthy' || status === 'ok') {
        return 'bg-green-100 text-green-800';
      }
      if (status === 'degraded') {
        return 'bg-yellow-100 text-yellow-800';
      }
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  getHealthStatusText(status: boolean | string | undefined): string {
    if (typeof status === 'boolean') {
      return status ? 'Healthy' : 'Unhealthy';
    }
    if (typeof status === 'string') {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    return 'Unknown';
  }
}
