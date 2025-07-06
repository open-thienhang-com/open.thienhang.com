import {Component, Injector, OnInit} from '@angular/core';
import {UserComponent} from './user/user.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {DataTableComponent} from "../../../shared/component/data-table/data-table.component";
import {DataTableFilterComponent} from '../../../shared/component/data-table-filter/data-table-filter.component';

@Component({
  selector: 'app-users',
  imports: [
    UserComponent,
    Button,
    TableModule,
    TitleComponent,
    DataTableComponent,
    DataTableFilterComponent
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent extends AppBaseComponent implements OnInit {
  users: any;

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
    this.isTableLoading = true;
    this.governanceServices.getUsers({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.users = res;
      this.isTableLoading = false;
    })
  }

  onDeleteUser(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteUser(id), this.getUsers);
  }
}

