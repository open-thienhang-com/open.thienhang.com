import { Component, Injector } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Ripple } from 'primeng/ripple';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { AuthServices } from '../../../../core/services/auth.services';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-current-user',
  imports: [
    Avatar,
    Ripple,
    Menu,
    Button,
    Tag
  ],
  templateUrl: './current-user.component.html',
})
export class CurrentUserComponent extends AppBaseComponent {
  user: any = {};
  menuItems: MenuItem[]

  constructor(private injector: Injector, private authServices: AuthServices, private router: Router) {
    super(injector)
  }

  ngOnInit() {
    this.authServices.getUser().subscribe(user => {
      if (user?.data) {
        this.user = user.data;
      }
    });
    this.menuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.profile();
        }
      },
      {
        label: 'Setting',
        icon: 'pi pi-cog',
        command: () => {
          this.setting();
        }
      },
      {
        label: 'Log out',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      },
    ]
  }

  logout() {
    this.authServices.logout().subscribe(res => {
      this.router.navigate(['/login']);
    });
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  setting() {
    this.router.navigate(['/settings']);
  }
}
