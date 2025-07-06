import {Component, Injector, OnInit} from '@angular/core';
import {PolicyComponent} from '../policies/policy/policy.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {DataTableComponent} from '../../../shared/component/data-table/data-table.component';
import {DataTableFilterComponent} from '../../../shared/component/data-table-filter/data-table-filter.component';

@Component({
  selector: 'app-policies',
  imports: [
    PolicyComponent,
    Button,
    TableModule,
    TitleComponent,
    DataTableComponent,
    DataTableFilterComponent
  ],
  templateUrl: './policies.component.html'
})
export class PoliciesComponent extends AppBaseComponent implements OnInit {
  policies: any;

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
    this.isTableLoading = true;
    this.governanceServices.getPolicies({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.policies = res;
      this.isTableLoading = false;
    })
  }

  onDeletePolicy(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deletePolicy(id), this.getPolicies);
  }
}

