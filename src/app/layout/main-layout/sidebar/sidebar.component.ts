import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Menu} from 'primeng/menu';
import {Badge} from 'primeng/badge';
import {Avatar} from 'primeng/avatar';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Ripple} from 'primeng/ripple';
import {StyleClass} from 'primeng/styleclass';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    Avatar,
    Ripple,
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0px', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
  ],

})
export class SidebarComponent {
  menu: MenuItem[];
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    this.menu = [
      { label: 'Dashboard', icon: 'pi pi-home', url: '/dashboard' },
      {
        label: 'Governance',
        icon: 'pi pi-chart-line',
        children: [
          { label: 'Assets', url: '/governance/assets' },
          { label: 'Polices', url: '/governance/policies' },
          { label: 'Permissions', url: '/governance/permissions' },
          { label: 'Roles', url: '/governance/roles' },
          { label: 'Accounts', url: '/governance/accounts' },
          { label: 'Users', url: '/governance/users' },
          { label: 'Teams', url: '/governance/teams' },
        ],
        expanded: true
      },
    ];
  }

  too(item: MenuItem): void {
    item.expanded = !item.expanded;
  }
}

interface MenuItem {
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  expanded?: boolean
}
