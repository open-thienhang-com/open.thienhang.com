import { Component, Input, OnInit } from '@angular/core';
import { DataAssetsService } from './data-assets.service';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assets-tab',
  templateUrl: './assets-tab.component.html',
  styleUrls: ['./assets-tab.component.scss'],
  imports: [
    CheckboxModule,
    DropdownModule,
    PaginatorModule,
    FormsModule
  ]
})
export class AssetsTabComponent implements OnInit {
  @Input() filteredAssets: any[] = [];
  @Input() assetPageFirst: number = 0;
  @Input() searchQuery: string = '';
  @Input() ownerOptions: any[] = [];
  @Input() statusOptions: any[] = [];
  @Input() selectedOwner: string = '';
  @Input() selectedStatus: string = '';
  @Input() minHealth: number = 0;
  @Input() detailModalVisible: boolean = false;
  @Input() selectedAsset: any;

  assetTypes: string[] = [
    'database', 'mlmodel', 'container', 's3', 'table', 'file', 'report', 'pipeline', 'cloud_storage', 'lakehouse', 'cache', 'others'
  ];
  assetTypeOptions = this.assetTypes.map(type => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }));
  selectedAssetType: string = 'database';
  assets: any[] = [];
  loadingAssets: boolean = false;
  errorAssets: string = '';

  constructor(private dataAssetsService: DataAssetsService) {}

  ngOnInit() {
    this.fetchAssets();
  }

  fetchAssets(type: string = this.selectedAssetType, size: number = 10, offset: number = 0, search: string = '') {
    this.loadingAssets = true;
    this.errorAssets = '';
    this.dataAssetsService.getAssets(type, size, offset, search).subscribe({
      next: (res) => {
        this.assets = res?.data || [];
        this.loadingAssets = false;
      },
      error: (err) => {
        this.errorAssets = 'Không thể tải dữ liệu assets.';
        this.loadingAssets = false;
      }
    });
  }

  onAssetTypeChange(type: string) {
    this.selectedAssetType = type;
    this.fetchAssets(type);
  }

  onPageChange(event: any) {
    const offset = event.first || 0;
    this.fetchAssets(this.selectedAssetType, 10, offset);
  }

  onSearchChange() {
    this.fetchAssets(this.selectedAssetType, 10, 0, this.searchQuery);
  }

  bulkSync() {}
  bulkDelete() {}
  pagedAssets() { return this.filteredAssets; }
  resetFilters() {}
  formatDate(date: string) { return date; }
  getHealthClass(health: number) { return health > 80 ? 'text-green-600' : health > 50 ? 'text-yellow-600' : 'text-red-600'; }
  openDetailModal(asset: any) {}
}
