import {Component, Injector, OnInit} from '@angular/core';
import {TeamComponent} from '../teams/team/team.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import {DataTableComponent} from "../../../shared/component/data-table/data-table.component";
import {DataTableFilterComponent} from '../../../shared/component/data-table-filter/data-table-filter.component';

@Component({
  selector: 'app-teams',
  imports: [
    TeamComponent,
    Button,
    TableModule,
    TitleComponent,
    DataTableComponent,
    DataTableFilterComponent
  ],
  templateUrl: './teams.component.html',
})
export class TeamsComponent extends AppBaseComponent implements OnInit {
  teams: any;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getTeams();
  }

  getTeams = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getTeams({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.teams = res;
      this.isTableLoading = false;
    })
  }

  onDeleteTeam(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteTeam(id), this.getTeams);
  }
}
