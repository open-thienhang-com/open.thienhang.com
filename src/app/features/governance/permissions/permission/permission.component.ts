import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';

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
  @Output() onSave = new EventEmitter<void>();

  permission: any = {};
  title = 'Create Permission';
  visible = false;

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    const saveObservable = this.permission._id ?
      this.governanceServices.updatePermission(this.permission._id, this.permission) :
      this.governanceServices.createPermission(this.permission);

    saveObservable.subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess(this.permission._id ? 'Updated successfully' : 'Created successfully');
      this.visible = false;
      this.permission = {};
      this.onSave.emit();
    });
  }

  show(id?) {
    this.visible = true;
    this.permission = {};

    if (id) {
      this.title = 'Edit Permission';
      this.governanceServices.getPermission(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.permission = res.data;
      });
    } else {
      this.title = 'Create Permission';
    }
  }
}
