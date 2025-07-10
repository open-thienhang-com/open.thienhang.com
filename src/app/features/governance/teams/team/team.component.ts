import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';

@Component({
  selector: 'app-team',
  imports: [
    Button,
    Dialog,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    Textarea,
    FormsModule,
    ListboxModule,
    CommonModule,
    MultiSelectModule
  ],
  templateUrl: './team.component.html',
})
export class TeamComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  team: any = {};
  title = 'Create Team';
  visible = false;
  members: any[] = [];

  constructor(private injector: Injector,
    private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    const saveObservable = this.team._id ?
      this.governanceServices.updateTeam(this.team._id, this.team) :
      this.governanceServices.createTeam(this.team);

    saveObservable.subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess(this.team._id ? 'Updated successfully' : 'Created successfully');
      this.visible = false;
      this.team = {};
      this.onSave.emit();
    });
  }

  show(id?) {
    this.visible = true;
    this.team = {};
    this.loadMembers();

    if (id) {
      this.title = 'Edit Team';
      this.governanceServices.getTeam(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.team = res.data;
      });
    } else {
      this.title = 'Create Team';
    }
  }

  loadMembers() {
    this.governanceServices.getUsers({}).subscribe(res => {
      this.members = res.data.map(item => ({
        ...item,
        name: `${item.first_name} ${item.last_name}`
      }));
    });
  }
}