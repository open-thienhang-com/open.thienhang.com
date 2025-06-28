import { Component } from '@angular/core';
import {HeaderComponent} from "./header/header.component";
import {RouterOutlet} from "@angular/router";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {Toast} from 'primeng/toast';
import {ConfirmDialog} from 'primeng/confirmdialog';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    RouterOutlet,
    SidebarComponent,
    Toast,
    ConfirmDialog
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  collapsed = false;
}
