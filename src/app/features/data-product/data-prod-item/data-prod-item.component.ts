import {Component, Input} from '@angular/core';
import {Avatar} from 'primeng/avatar';
import {Tag} from 'primeng/tag';
import {Card} from 'primeng/card';
import {Router} from '@angular/router';

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
    '#792424',
    '#a58a0a',
    '#608209',
    '#09822b',
    '#5accbd',
    '#225fcc',
    '#6c19e0',
    '#82097e',
  ]
  @Input() data: any = {};

  constructor(private router: Router) {
  }

  get getStyle() {
    return {'border-left': '3px solid ' + this.colors[Math.floor(Math.random() * this.colors.length)]}
  }

  goToDetail() {
    const {id, domain} = this.data;
    this.router.navigate(['/data-product-detail', {id, domain}]);
  }
}
