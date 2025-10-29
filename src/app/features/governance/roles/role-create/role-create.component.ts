import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleComponent } from '../role/role.component';

@Component({
  selector: 'app-role-create',
  standalone: true,
  imports: [CommonModule, RoleComponent],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-semibold mb-4">Create Role</h2>
      <app-role #roleComp (saveRole)="onSaved()" (cancelRole)="onCancel()"></app-role>
    </div>
  `
})
export class RoleCreateComponent implements AfterViewInit {
  @ViewChild('roleComp') roleComp!: RoleComponent;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    // show the role form when the page loads
    setTimeout(() => this.roleComp.show(), 0);
  }

  onSaved() {
    // After save, navigate back to roles list
    this.router.navigate(['/governance/roles']);
  }

  onCancel() {
    this.router.navigate(['/governance/roles']);
  }
}
