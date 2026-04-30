import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServices } from '../../../core/services/auth.services';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
})
export class LogoutPageComponent implements OnInit {
  constructor(private authServices: AuthServices, private router: Router) {}

  ngOnInit(): void {
    this.authServices.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
