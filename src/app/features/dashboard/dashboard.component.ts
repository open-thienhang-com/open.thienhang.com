import { Component } from '@angular/core';
import { StatCardComponent } from './stat-card/stat-card.component';
import { BarChartComponent } from './chart/bar-chart/bar-chart.component';
import { RadarChartComponent } from './chart/radar-chart/radar-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCardComponent,
    BarChartComponent,
    RadarChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

}
