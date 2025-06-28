import { Component } from '@angular/core';
import {StatCardComponent} from './stat-card/stat-card.component';
import {InfoCardComponent} from './info-card/info-card.component';
import {BarChartComponent} from './bar-chart/bar-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCardComponent,
    InfoCardComponent,
    BarChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
