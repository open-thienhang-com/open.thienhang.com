import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataAssetsComponent } from './data-assets.component';
import { SidebarTreeComponent } from './sidebar-tree/sidebar-tree.component';
import { AssetDetailComponent } from './asset-detail/asset-detail.component';

@NgModule({
  declarations: [
    DataAssetsComponent,
    SidebarTreeComponent,
    AssetDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [DataAssetsComponent]
})
export class DataAssetsModule {}
