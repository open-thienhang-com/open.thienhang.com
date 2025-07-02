import {Component, Injector, OnInit} from '@angular/core';
import {GovernanceServices} from '../../../core/services/governance.services';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {Button} from 'primeng/button';
import {Router} from '@angular/router';
import {AssetComponent} from './asset/asset.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';

@Component({
  selector: 'app-assets',
  imports: [
    TableModule,
    Tag,
    TitleComponent,
    Button,
    AssetComponent,
    DataTableComponent
  ],
  templateUrl: './assets.component.html',
})
export class AssetsComponent extends AppBaseComponent implements OnInit {
  assets: any;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getAssets();
  }

  getAssets = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getAssets({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.assets = res;
      this.isTableLoading = false;
    })
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
    }
  }

  onDeleteAsset(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteAsset(id), this.getAssets);
  }
}
