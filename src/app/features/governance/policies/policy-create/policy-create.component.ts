import { Component } from '@angular/core';
import { PolicyComponent } from '../policy/policy.component';

@Component({
    selector: 'app-policy-create',
    standalone: true,
    imports: [PolicyComponent],
    template: '<app-policy [inline]="true"></app-policy>',
    styles: []
})
export class PolicyCreateComponent {
}
