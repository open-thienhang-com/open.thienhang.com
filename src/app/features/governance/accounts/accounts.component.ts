import {Component, Injector, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {AccountComponent} from './account/account.component';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';

@Component({
  selector: 'app-accounts',
  imports: [
    Button,
    TableModule,
    Tag,
    TitleComponent,
    AccountComponent,
    DataTableComponent
  ],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent extends AppBaseComponent implements OnInit {
  accounts: any;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getAccounts();
  }

  getAccounts = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getAccounts({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.accounts = res;
      this.isTableLoading = false;
    })
  }

  getSeverity(status: boolean) {
    switch (status) {
      case true:
        return 'success';
      case false:
        return 'danger';
    }
  }

  onDeleteAccount(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteAccount(id), this.getAccounts);
  }
}
