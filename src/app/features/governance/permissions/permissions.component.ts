import {Component, Injector} from '@angular/core';
import {PermissionComponent} from '../permissions/permission/permission.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {AppBaseComponent} from '../../../core/base/app-base.component';

@Component({
  selector: 'app-permissions',
  imports: [
    PermissionComponent,
    Button,
    TableModule,
    TitleComponent
  ],
  templateUrl: './permissions.component.html',
})
export class PermissionsComponent extends AppBaseComponent {
  permissions = [];

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
    this.governanceServices.getPermissions({offset: page}).subscribe(res => {
      this.permissions = res.data
    })
  }

  getSeverity(status: string) {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
    }
  }

  onDeletePermission(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deletePermission(id), this.getPermissions);
  }
}
