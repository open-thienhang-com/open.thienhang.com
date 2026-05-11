import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-discovery-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    PaginatorModule,
    ButtonModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './discovery-tab.component.html',
  styleUrls: ['./discovery-tab.component.scss']
})
export class DiscoveryTabComponent {
  @Input() filteredAssets: any[] = [];
  @Input() assetPageFirst: number = 0;
  @Input() searchQuery: string = '';
  @Input() domainOptions: any[] = [];
  @Input() groupOptions: any[] = [];
  @Input() typeOptions: any[] = [];
  @Input() statusOptions: any[] = [];
  @Input() selectedDomain: string = '';
  @Input() selectedGroup: string = '';
  @Input() selectedType: string = '';
  @Input() selectedStatus: string = '';
  @Input() minHealth: number = 0;
  @Input() tableView: boolean = false;
  @Input() detailModalVisible: boolean = false;
  @Input() selectedAsset: any;

  searchAssets() {}
  toggleTableView() {}
  bulkDelete() {}
  pagedAssets() { return this.filteredAssets; }
  resetFilters() {}
  formatDate(date: string) { return date; }
  getHealthClass(health: number) { return health > 80 ? 'text-green-600' : health > 50 ? 'text-yellow-600' : 'text-red-600'; }
  openDetailModal(asset: any) {}
}
