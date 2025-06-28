import {Component, Injector} from '@angular/core';
import {GovernanceServices} from '../../../core/services/governance.services';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {Button} from 'primeng/button';
import {Router} from '@angular/router';
import {AssetComponent} from './asset/asset.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';

@Component({
  selector: 'app-assets',
  imports: [
    TableModule,
    Tag,
    TitleComponent,
    Button,
    AssetComponent
  ],
  templateUrl: './assets.component.html',
})
export class AssetsComponent extends AppBaseComponent {
  assets = [];

  constructor(
    private injector: Injector,
    private router: Router, private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getAssets();
  }

  getAssets = (page = 0) => {
    this.governanceServices.getAssets({offset: page}).subscribe(res => {
      this.assets = res.data
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
