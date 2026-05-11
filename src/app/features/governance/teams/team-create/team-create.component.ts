import { Component } from '@angular/core';
import { TeamComponent } from '../team/team.component';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [TeamComponent],
  template: '<app-team [inline]="true"></app-team>'
})
export class TeamCreateComponent {
}
