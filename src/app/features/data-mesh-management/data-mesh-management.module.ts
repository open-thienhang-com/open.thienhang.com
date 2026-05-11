import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogTabComponent } from './catalog-tab/catalog-tab.component';
import { SidebarTreeComponent } from './sidebar-tree/sidebar-tree.component';
import { DiscoveryTabComponent } from './discovery-tab/discovery-tab.component';
import { AssetsTabComponent } from './assets-tab/assets-tab.component';
import { LineageTabComponent } from './lineage-tab/lineage-tab.component';
import { PoliciesTabComponent } from './policies-tab/policies-tab.component';
import { MonitoringTabComponent } from './monitoring-tab/monitoring-tab.component';
// PrimeNG modules
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    DropdownModule,
    PaginatorModule,
    ButtonModule,
    DialogModule,
    CatalogTabComponent,
    SidebarTreeComponent,
    DiscoveryTabComponent,
    AssetsTabComponent,
    LineageTabComponent,
    PoliciesTabComponent,
    MonitoringTabComponent
  ],
  exports: [CatalogTabComponent]
})
export class DataMeshManagementModule {}
