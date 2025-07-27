import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetCardComponent } from './asset-card.component';
import { SidebarTreeComponent } from './sidebar-tree/sidebar-tree.component';

interface DataAsset {
  id: string;
  name: string;
  type: string;
  description: string;
  url?: string;
  owner?: string;
  tags?: string[];
  status?: 'Active' | 'Deprecated' | 'Error';
  createdAt?: string;
  updatedAt?: string;
  domain?: string;
  metadata?: { [key: string]: any };
}

type GroupMode = 'category' | 'alphabet';

@Component({
  selector: 'app-data-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetCardComponent, SidebarTreeComponent],
  templateUrl: './data-assets.component.html',
  styleUrls: ['./data-assets.component.scss']
})
export class DataAssetsComponent {
  selectedType: string = '';
  searchTerm: string = '';
  groupMode: GroupMode = 'category';
  assetTypes: string[] = ['Databricks', 'PostgreSQL', 'MongoDB', 'API', 'Dashboard', 'Redis'];
  expandedGroups: { [key: string]: boolean } = {};
  selectedAsset: DataAsset | null = null;
  showMetadata: boolean = false;

  assets: DataAsset[] = [
    { id: '1', name: 'Account API', type: 'API', description: 'Account management API', url: 'https://api.example.com/account', owner: 'Platform', tags: ['api', 'A'], status: 'Active', createdAt: '2024-01-01', updatedAt: '2025-07-01', domain: 'Account', metadata: { 'last updated': '2025-07-01' } },
    { id: '2', name: 'Analytics DB', type: 'Databricks', description: 'Analytics data in Databricks', url: 'https://databricks.example.com/analytics', owner: 'Analytics', tags: ['databricks', 'A'], status: 'Active', createdAt: '2023-10-10', updatedAt: '2025-06-20', domain: 'Analytics', metadata: { 'last updated': '2025-06-20' } },
    { id: '3', name: 'Billing Dashboard', type: 'Dashboard', description: 'Billing dashboard', url: 'https://dashboard.example.com/billing', owner: 'Finance', tags: ['dashboard', 'B'], status: 'Active', createdAt: '2023-05-05', updatedAt: '2025-07-10', domain: 'Billing', metadata: { 'last updated': '2025-07-10' } },
    { id: '4', name: 'Business Intelligence API', type: 'API', description: 'BI API', url: 'https://api.example.com/bi', owner: 'BI Team', tags: ['api', 'B'], status: 'Active', createdAt: '2022-08-15', updatedAt: '2025-01-01', domain: 'BI', metadata: { 'last updated': '2025-01-01' } },
    { id: '5', name: 'Customer Profiles', type: 'MongoDB', description: 'Customer profiles in MongoDB', url: 'https://mongo.example.com/customer', owner: 'Customer', tags: ['mongodb', 'C'], status: 'Active', createdAt: '2023-03-03', updatedAt: '2025-07-15', domain: 'Customer', metadata: { 'last updated': '2025-07-15' } },
    { id: '6', name: 'Inventory Tracker', type: 'MongoDB', description: 'Inventory tracking', url: 'https://mongo.example.com/inventory', owner: 'Ops', tags: ['mongodb', 'I'], status: 'Active', createdAt: '2024-02-02', updatedAt: '2025-07-20', domain: 'Inventory', metadata: { 'last updated': '2025-07-20' } },
    { id: '7', name: 'Marketing Performance', type: 'Dashboard', description: 'Marketing dashboard', url: 'https://dashboard.example.com/marketing', owner: 'Marketing', tags: ['dashboard', 'M'], status: 'Active', createdAt: '2024-02-02', updatedAt: '2025-07-20', domain: 'Marketing', metadata: { 'last updated': '2025-07-20' } },
    { id: '8', name: 'Executive Overview', type: 'Dashboard', description: 'Executive summary', url: 'https://dashboard.example.com/executive', owner: 'Exec', tags: ['dashboard', 'E'], status: 'Active', createdAt: '2024-02-02', updatedAt: '2025-07-20', domain: 'Executive', metadata: { 'last updated': '2025-07-20' } },
  ];

  get groupedByCategory() {
    const groups: { [key: string]: DataAsset[] } = {};
    for (const asset of this.filteredAssets) {
      if (!groups[asset.type]) {
        groups[asset.type] = [];
      }
      groups[asset.type].push(asset);
    }
    return Object.entries(groups).map(([type, assets]) => ({ type, assets }));
  }

  get groupedByAlphabet() {
    const groups: { [key: string]: DataAsset[] } = {};
    for (const asset of this.filteredAssets) {
      const letter = asset.name.charAt(0).toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(asset);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([letter, assets]) => ({ letter, assets }));
  }

  get filteredAssets() {
    return this.assets.filter(asset =>
      (!this.selectedType || asset.type === this.selectedType) &&
      (!this.searchTerm || asset.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  toggleGroup(key: string) {
    this.expandedGroups[key] = !this.expandedGroups[key];
  }

  selectAsset(asset: DataAsset) {
    this.selectedAsset = asset;
    this.showMetadata = false;
  }

  closeDetail() {
    this.selectedAsset = null;
  }

  toggleMetadata() {
    this.showMetadata = !this.showMetadata;
  }

  copyLink(url?: string) {
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }

  constructor() {
    // Expand all groups by default
    for (const type of this.assetTypes) {
      this.expandedGroups[type] = true;
    }
  }
}
