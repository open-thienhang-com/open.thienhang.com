import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';

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
  @Output() onSave = new EventEmitter<void>();

  account: any = {};
  title = 'Create Account';
  visible = false;

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    if (!this.account._id) {
      this.showError('Account creation is not supported. Accounts can only be updated.');
      return;
    }

    const saveObservable = this.governanceServices.updateAccount(this.account._id, this.account);

    saveObservable.subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess('Updated successfully');
      this.visible = false;
      this.account = {};
      this.onSave.emit();
    });
  }

  show(id?) {
    this.visible = true;
    this.account = {};

    if (id) {
      this.title = 'Edit Account';
      this.governanceServices.getAccount(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.account = res.data;
      });
    } else {
      this.title = 'Create Account';
    }
  }
}
