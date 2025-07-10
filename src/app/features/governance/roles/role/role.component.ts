import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';

@Component({
  selector: 'app-role',
  imports: [
    Button,
    Dialog,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule
  ],
  templateUrl: './role.component.html',
})
export class RoleComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  role: any = {};
  title = 'Create Role';
  visible = false;

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    const saveObservable = this.role._id ?
      this.governanceServices.updateRole(this.role._id, this.role) :
      this.governanceServices.createRole(this.role);

    saveObservable.subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess(this.role._id ? 'Updated successfully' : 'Created successfully');
      this.visible = false;
      this.role = {};
      this.onSave.emit();
    });
  }

  show(id?) {
    this.visible = true;
    this.role = {};

    if (id) {
      this.title = 'Edit Role';
      this.governanceServices.getRole(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.role = res.data;
      });
    } else {
      this.title = 'Create Role';
    }
  }
}
