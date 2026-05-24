import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServices } from '../../../core/services/auth.services';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutPageComponent implements OnInit {
  workspaceName = '';
  done = false;

  constructor(private authServices: AuthServices, private router: Router) {}

  ngOnInit(): void {
    try {
      const ws = JSON.parse(localStorage.getItem('selectedWorkspace') || '{}');
      this.workspaceName = ws?.name ?? '';
    } catch { /* ignore */ }

    this.authServices.logout().subscribe({
      complete: () => { this.done = true; },
      error:    () => { this.done = true; },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
