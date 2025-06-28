import {Component, Injector} from '@angular/core';
import {GovernanceServices} from '../../../../core/services/governance.services';
import {AppBaseComponent} from '../../../../core/base/app-base.component';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';

@Component({
  selector: 'app-account',
  imports: [
    Button,
    Dialog,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule
  ],
  templateUrl: './account.component.html',
})
export class AccountComponent extends AppBaseComponent {
  account: any = {};
  title = 'Create Account';
  visible = false;

  constructor(private injector: Injector,
              private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    this.governanceServices.createAccount(this.account).subscribe(res => {
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
      this.title = 'Edit Account';
      this.governanceServices.getAccount(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.account = res.data;
      })
    }
  }
}
