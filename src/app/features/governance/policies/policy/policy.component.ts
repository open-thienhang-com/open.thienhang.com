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
  selector: 'app-policy',
  imports: [
    Button,
    Dialog,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule
  ],
  templateUrl: './policy.component.html',
})
export class PolicyComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  policy: any = {};
  title = 'Create Policy';
  visible = false;

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    const saveObservable = this.policy._id ?
      this.governanceServices.updatePolicy(this.policy._id, this.policy) :
      this.governanceServices.createPolicy(this.policy);

    saveObservable.subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess(this.policy._id ? 'Updated successfully' : 'Created successfully');
      this.visible = false;
      this.policy = {};
      this.onSave.emit();
    });
  }

  show(id?) {
    this.visible = true;
    this.policy = {};

    if (id) {
      this.title = 'Edit Policy';
      this.governanceServices.getPolicy(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.policy = res.data;
      });
    } else {
      this.title = 'Create Policy';
    }
  }
}
