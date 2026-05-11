import { Component } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-databricks',
  templateUrl: './databricks.component.html',
  styleUrls: ['./databricks.component.scss'],
  standalone: true,
  imports: [TranslatePipe]
})
export class DatabricksComponent {}
