import {Component, Injector, OnInit} from '@angular/core';
import {RoleComponent} from '../roles/role/role.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {DataTableComponent} from "../../../shared/component/data-table/data-table.component";

@Component({
  selector: 'app-roles',
    imports: [
        RoleComponent,
        Button,
        TableModule,
        TitleComponent,
        DataTableComponent
    ],
  templateUrl: './roles.component.html',
})
export class RolesComponent extends AppBaseComponent implements OnInit {
  roles: any;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getRoles();
  }

  getRoles = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getRoles({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.roles = res;
      this.isTableLoading = false;
    })
  }

  onDeleteRole(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteRole(id), this.getRoles);
  }
}

