import {Component, Injector} from '@angular/core';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {AppBaseComponent} from '../../../../core/base/app-base.component';
import {GovernanceServices} from '../../../../core/services/governance.services';
import {Select} from 'primeng/select';
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
    Select,
    ListboxModule,
    CommonModule,
    MultiSelectModule
  ],
  templateUrl: './team.component.html',
})
export class TeamComponent extends AppBaseComponent {
  team: any = {};
  title = 'Create Team';
  visible = false;
  members = [];

  constructor(private injector: Injector,
              private governanceServices: GovernanceServices) {
    super(injector);
  }

  save() {
    this.governanceServices.createTeam(this.team).subscribe(res => {
      if (!res) {
        return;
      }
      this.showSuccess('Create successfully');
      this.visible = false;
    })
  }

  show(id?) {
    this.visible = true;
    this.getDataOnShown();
    if (id) {
      this.title = 'Edit Team';
      this.governanceServices.getTeam(id).subscribe(res => {
        if (!res) {
          return;
        }
        this.team = res.data;
      })
    }
  }

  getDataOnShown() {
    this.governanceServices.getUsers({}).subscribe(res => {
      this.members = res.data.map(item => {
        item.name = item.first_name + ' ' + item.last_name;
        return item;
      });
    })
  }
}
