import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { FloatLabel } from "primeng/floatlabel";
import { InputText } from "primeng/inputtext";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Textarea } from "primeng/textarea";
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { GovernanceServices } from '../../../../core/services/governance.services';

@Component({
  selector: 'app-user',
  imports: [
    Button,
    Dialog,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule
  ],
  templateUrl: './user.component.html',
})
export class UserComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  user: any = {};
  title = 'Create User';
  visible = false;

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    const saveObservable = this.user._id ?
      this.governanceServices.updateUser(this.user._id, this.user) :
      this.governanceServices.createUser(this.user);

    saveObservable.subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess(this.user._id ? 'Updated successfully' : 'Created successfully');
      this.visible = false;
      this.user = {};
      this.onSave.emit();
    });
  }

  show(id?) {
    this.visible = true;
    this.user = {};

    if (id) {
      this.title = 'Edit User';
      this.governanceServices.getUser(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.user = res.data;
      });
    } else {
      this.title = 'Create User';
    }
  }
}
