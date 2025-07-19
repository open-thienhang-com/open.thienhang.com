import { Component } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-google-cloud',
  templateUrl: './google-cloud.component.html',
  styleUrls: ['./google-cloud.component.scss'],
  standalone: true,
  imports: [TranslatePipe]
})
export class GoogleCloudComponent {}
