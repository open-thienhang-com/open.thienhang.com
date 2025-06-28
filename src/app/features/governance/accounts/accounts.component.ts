import {Component, Injector} from '@angular/core';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {AccountComponent} from './account/account.component';

@Component({
  selector: 'app-accounts',
  imports: [
    Button,
    TableModule,
    Tag,
    TitleComponent,
    AccountComponent
  ],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent extends AppBaseComponent {
  accounts = [];

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
    this.governanceServices.getAccounts({offset: page}).subscribe(res => {
      this.accounts = res.data
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

  onDeleteAccount(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteAccount(id), this.getAccounts);
  }
}
