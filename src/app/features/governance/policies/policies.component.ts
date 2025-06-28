import {Component, Injector} from '@angular/core';
import {PolicyComponent} from '../policies/policy/policy.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';

@Component({
  selector: 'app-policies',
  imports: [
    PolicyComponent,
    Button,
    TableModule,
    TitleComponent
  ],
  templateUrl: './policies.component.html'
})
export class PoliciesComponent extends AppBaseComponent {
  policies = [];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getPolicies();
  }

  getPolicies = (page = 0) => {
    this.governanceServices.getPolicies({offset: page}).subscribe(res => {
      this.policies = res.data
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

  onDeletePolicy(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deletePolicy(id), this.getPolicies);
  }
}

