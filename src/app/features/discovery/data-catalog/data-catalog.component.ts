import { Component } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-data-catalog',
  templateUrl: './data-catalog.component.html',
  styleUrls: ['./data-catalog.component.scss'],
  standalone: true,
  imports: [TranslatePipe]
})
export class DataCatalogComponent {}
