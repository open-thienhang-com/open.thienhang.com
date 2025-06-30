import {Component, Input} from '@angular/core';
import {Avatar} from 'primeng/avatar';
import {Tag} from 'primeng/tag';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-data-prod-item',
  imports: [
    Avatar,
    Tag,
    Card
  ],
  templateUrl: './data-prod-item.component.html',
  standalone: true,
  styleUrls: ['./data-prod-item.component.scss']
})
export class DataProdItemComponent {
  colors = [
    'emerald',
    'green',
    'lime',
    'orange',
    'amber',
    'yellow',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
  ]
  @Input() data: any = {};

  get getStyle() {
    return {'border-left': '3px solid ' + this.colors[Math.floor(Math.random() * this.colors.length)]}
  }
}
