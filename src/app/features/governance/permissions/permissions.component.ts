import {Component, Injector, OnInit} from '@angular/core';
import {PermissionComponent} from '../permissions/permission/permission.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {DataTableComponent} from "../../../shared/component/data-table/data-table.component";
import {Tag} from "primeng/tag";

@Component({
  selector: 'app-permissions',
    imports: [
        PermissionComponent,
        Button,
        TableModule,
        TitleComponent,
        DataTableComponent,
        Tag
    ],
  templateUrl: './permissions.component.html',
})
export class PermissionsComponent extends AppBaseComponent implements OnInit {
  permissions: any;
  loading = false;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getPermissions();
  }

  getPermissions = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getPermissions({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.permissions = res;
      this.isTableLoading = false;
    })
  }

  onDeletePermission(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deletePermission(id), this.getPermissions);
  }
}
