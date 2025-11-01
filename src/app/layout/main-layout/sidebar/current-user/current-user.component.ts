import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Avatar } from 'primeng/avatar';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { AuthServices } from '../../../../core/services/auth.services';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-current-user',
  imports: [
    CommonModule,
    Avatar,
    Menu
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
      if (user) {
        this.user = user;
        console.log('User from observable:', this.user);
      } else {
        // Fallback to sessionStorage if observable doesn't have data yet
        try {
          const raw = sessionStorage.getItem('currentUser');
          if (raw) {
            this.user = JSON.parse(raw);
            console.log('User from sessionStorage:', this.user);
          }
        } catch (e) {
          console.error('Error loading user from sessionStorage:', e);
        }
      }
      if (!this.user) {
        this.user = {};
        console.log('No user data available');
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
