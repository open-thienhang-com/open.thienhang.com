import {Component, Injector} from '@angular/core';
import {Button} from "primeng/button";
import {Dialog} from "primeng/dialog";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Textarea} from "primeng/textarea";
import {AppBaseComponent} from '../../../../core/base/app-base.component';
import {GovernanceServices} from '../../../../core/services/governance.services';

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
  user: any = {};
  title = 'Create User';
  visible = false;

  constructor(private injector: Injector,
              private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    this.governanceServices.createUser(this.user).subscribe(res => {
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
      this.title = 'Edit User';
      this.governanceServices.getUser(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.user = res.data;
      })
    }
  }
}
