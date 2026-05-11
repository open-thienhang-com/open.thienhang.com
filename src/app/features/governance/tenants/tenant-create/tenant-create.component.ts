import { Component } from '@angular/core';
import { TenantComponent } from '../tenant/tenant.component';

@Component({
  selector: 'app-tenant-create',
  standalone: true,
  imports: [TenantComponent],
  template: '<app-tenant [inline]="true"></app-tenant>'
})
export class TenantCreateComponent {
}
