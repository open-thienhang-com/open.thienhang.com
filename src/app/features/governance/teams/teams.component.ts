import {Component, Injector, OnInit} from '@angular/core';
import {TeamComponent} from '../teams/team/team.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {TitleComponent} from '../../../shared/component/title/title.component';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';

@Component({
  selector: 'app-teams',
  imports: [
    TeamComponent,
    Button,
    TableModule,
    TitleComponent
  ],
  templateUrl: './teams.component.html',
})
export class TeamsComponent extends AppBaseComponent implements OnInit {
  teams = [];

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
    this.governanceServices.getTeams({offset: page}).subscribe(res => {
      this.teams = res.data
    })
  }

  onDeleteTeam(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteTeam(id), this.getTeams);
  }
}
