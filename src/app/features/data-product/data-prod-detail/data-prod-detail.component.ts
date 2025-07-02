import { Component } from '@angular/core';
import {Card} from 'primeng/card';
import {Tag} from 'primeng/tag';

@Component({
  selector: 'app-data-prod-detail',
  imports: [
    Card,
    Tag
  ],
  templateUrl: './data-prod-detail.component.html',
  styleUrl: './data-prod-detail.component.scss'
})
export class DataProdDetailComponent {

}
