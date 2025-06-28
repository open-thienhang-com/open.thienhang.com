import {Component, Injector, OnInit} from '@angular/core';
import {UserComponent} from './user/user.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';

@Component({
  selector: 'app-users',
  imports: [
    UserComponent,
    Button,
    TableModule,
    TitleComponent
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent extends AppBaseComponent implements OnInit {
  users = [];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers = (page = 0) => {
    this.governanceServices.getUsers({offset: page}).subscribe(res => {
      this.users = res.data
    })
  }

  onDeleteUser(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteUser(id), this.getUsers);
  }
}

