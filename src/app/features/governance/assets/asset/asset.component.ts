import {Component, Injector} from '@angular/core';
import {Button} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {Textarea} from 'primeng/textarea';
import {GovernanceServices} from '../../../../core/services/governance.services';
import {AppBaseComponent} from '../../../../core/base/app-base.component';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-asset',
  imports: [
    Button,
    FormsModule,
    InputText,
    Dialog,
    FloatLabel,
    Textarea
  ],
  providers: [MessageService],
  templateUrl: './asset.component.html',
})
export class AssetComponent extends AppBaseComponent {
  asset: any = {};
  title = 'Create Asset';
  visible = false;

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    this.governanceServices.createAsset(this.asset).subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess('Create successfully');
      this.visible = false;
    })
  }

  show(id?) {
    this.visible = true;
    if (id) {
      this.title = 'Edit Asset';
      this.governanceServices.getAsset(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.asset = res.data;
      })
    }
  }
}
