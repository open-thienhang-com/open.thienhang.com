import { Component } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-airflow',
  templateUrl: './airflow.component.html',
  styleUrls: ['./airflow.component.scss'],
  standalone: true,
  imports: [TranslatePipe]
})
export class AirflowComponent {}
