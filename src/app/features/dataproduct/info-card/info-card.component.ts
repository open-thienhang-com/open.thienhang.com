import { Component } from '@angular/core';
import {Card} from "primeng/card";
import {Avatar} from 'primeng/avatar';

@Component({
  selector: 'app-info-card',
  imports: [
    Card,
    Avatar,
  ],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.scss'
})
export class InfoCardComponent {

}
