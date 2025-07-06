import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Button} from 'primeng/button';
import {TitleComponent} from '../title/title.component';

@Component({
  selector: 'app-data-table-filter',
  imports: [
    Button,
    TitleComponent
  ],
  templateUrl: './data-table-filter.component.html',
})
export class DataTableFilterComponent {
  @Input() title = '';
  @Output() onAddNew = new EventEmitter();
  @Output() onRefresh = new EventEmitter();
}
