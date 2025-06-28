import {Component, Injector} from '@angular/core';
import {GovernanceServices} from '../../../../core/services/governance.services';
import {AppBaseComponent} from '../../../../core/base/app-base.component';
import {FormsModule} from '@angular/forms';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Textarea} from 'primeng/textarea';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-permission',
  imports: [
    FormsModule,
    Dialog,
    FloatLabel,
    InputText,
    Textarea,
    Button
  ],
  templateUrl: './permission.component.html',
})
export class PermissionComponent extends AppBaseComponent {
  permission: any = {};
  title = 'Create Permission';
  visible = false;

  constructor(private injector: Injector,
              private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    this.governanceServices.createPermission(this.permission).subscribe(res => {
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
      this.title = 'Edit Permission';
      this.governanceServices.getPermission(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.permission = res.data;
      })
    }
  }
}
