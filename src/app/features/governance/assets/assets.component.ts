import {Component, Injector, OnInit} from '@angular/core';
import {GovernanceServices} from '../../../core/services/governance.services';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {Button} from 'primeng/button';
import {AssetComponent} from './asset/asset.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';

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
    ChipModule
  ],
  templateUrl: './assets.component.html',
})
export class AssetsComponent extends AppBaseComponent implements OnInit {
  assets: any;
  filteredAssets: any[] = [];
  totalRecords: number = 0;
  
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
  
  // Options for dropdowns
  typeOptions = [
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

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getAssets();
    this.updateStats();
  }

  getAssets = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getAssets({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.assets = res;
      this.filteredAssets = res?.data || [];
      this.totalRecords = res?.total || 0;
      this.isTableLoading = false;
      this.updateStats();
    })
  }

  refreshAssets() {
    this.getAssets();
  }

  exportAssets() {
    // Implementation for exporting assets
    console.log('Exporting assets...');
  }

  updateStats() {
    if (this.assets?.data) {
      const data = this.assets.data;
      this.stats.totalAssets = data.length;
      this.stats.activeAssets = data.filter((asset: any) => asset.status === 'active').length;
      this.stats.criticalAssets = data.filter((asset: any) => asset.sensitivity === 'critical').length;
      this.stats.pendingAssets = data.filter((asset: any) => asset.status === 'maintenance' || asset.status === 'pending').length;
    }
  }

  filterAssets() {
    if (!this.assets?.data) return;
    
    let filtered = [...this.assets.data];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(asset => 
        (asset.name && asset.name.toLowerCase().includes(term)) ||
        (asset.type && asset.type.toLowerCase().includes(term)) ||
        (asset.source && asset.source.toLowerCase().includes(term)) ||
        (asset.owner && asset.owner.toLowerCase().includes(term))
      );
    }
    
    // Type filter
    if (this.selectedType) {
      filtered = filtered.filter(asset => asset.type === this.selectedType);
    }
    
    // Sensitivity filter
    if (this.selectedSensitivity) {
      filtered = filtered.filter(asset => asset.sensitivity === this.selectedSensitivity);
    }
    
    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(asset => asset.status === this.selectedStatus);
    }
    
    this.filteredAssets = filtered;
  }

  applyFilters() {
    this.filterAssets();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = null;
    this.selectedSensitivity = null;
    this.selectedStatus = null;
    this.filteredAssets = this.assets?.data || [];
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  viewAsset(asset: any) {
    // Implementation for viewing asset details
    console.log('Viewing asset:', asset);
  }

  managePermissions(asset: any) {
    // Implementation for managing asset permissions
    console.log('Managing permissions for asset:', asset);
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

  onDeleteAsset(event: Event, id: string) {
    this.confirmOnDelete(event, this.governanceServices.deleteAsset(id), this.getAssets);
  }
}
