import { Component } from '@angular/core';
import {StatCardComponent} from './stat-card/stat-card.component';
import {InfoCardComponent} from './info-card/info-card.component';
import {BarChartComponent} from './chart/bar-chart/bar-chart.component';
import {DatePicker} from 'primeng/datepicker';
import {RadarChartComponent} from './chart/radar-chart/radar-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCardComponent,
    InfoCardComponent,
    BarChartComponent,
    DatePicker,
    RadarChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

}
