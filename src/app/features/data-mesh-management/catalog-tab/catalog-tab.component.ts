import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-catalog-tab',
  templateUrl: './catalog-tab.component.html',
  styleUrls: ['./catalog-tab.component.scss']
})
export class CatalogTabComponent {
  @Input() dataSources: any[] = [];
  @Input() onlineCount: number = 0;
  @Input() warningCount: number = 0;
  @Input() offlineCount: number = 0;
  @Input() ownerOptions: any[] = [];
  @Input() statusOptions: any[] = [];
  @Input() filteredDataSources: any[] = [];
  @Input() assetPageFirst: number = 0;
  @Input() searchQuery: string = '';
  @Input() selectedOwner: string = '';
  @Input() selectedStatus: string = '';
  @Input() minHealth: number = 0;
  @Input() lastSyncedAfter: string = '';
  @Input() detailModalVisible: boolean = false;
  @Input() selectedSource: any;

  selectAllChecked: boolean = false;
  selectedAssetIds: string[] = [];

  exportAssets() {}
  bulkDelete() {}
  pagedAssets() { return this.filteredDataSources; }
  resetFilters() {}
  getIconClass(type: string, subtype?: string) { return 'pi pi-database'; }
  formatDate(date: string) { return date; }
  getHealthClass(health: number) { return health > 80 ? 'text-green-600' : health > 50 ? 'text-yellow-600' : 'text-red-600'; }
  openDetailModal(source: any) {}

  toggleSelectAll() {
    if (this.selectAllChecked) {
      this.selectedAssetIds = this.pagedAssets().map(asset => asset.id);
    } else {
      this.selectedAssetIds = [];
    }
  }

  bulkDeleteSelected() {
    // Implement bulk delete logic here (API call, confirmation, etc.)
    // For now, just filter out selected assets from filteredDataSources
    this.filteredDataSources = this.filteredDataSources.filter(asset => !this.selectedAssetIds.includes(asset.id));
    this.selectedAssetIds = [];
    this.selectAllChecked = false;
  }

  onAssetCheckboxChange() {
    const visibleIds = this.pagedAssets().map(asset => asset.id);
    this.selectAllChecked = visibleIds.every(id => this.selectedAssetIds.includes(id)) && visibleIds.length > 0;
  }
}
