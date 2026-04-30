import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-entitlement-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, InputNumberModule],
  providers: [MessageService],
  templateUrl: './entitlement-create.component.html',
})
export class EntitlementCreateComponent implements OnDestroy {
  form: FormGroup;
  saving = false;
  private destroy$ = new Subject<void>();

  tierOptions = [
    { label: 'All', value: 'all' },
    { label: 'Bronze', value: 'bronze' },
    { label: 'Silver', value: 'silver' },
    { label: 'Gold', value: 'gold' },
    { label: 'Platinum', value: 'platinum' },
  ];

  categoryOptions = [
    { label: 'Discount', value: 'discount' },
    { label: 'Promotion', value: 'promotion' },
    { label: 'Shipping', value: 'shipping' },
    { label: 'Points', value: 'points' },
    { label: 'Membership', value: 'membership' },
    { label: 'Gift', value: 'gift' },
    { label: 'Access', value: 'access' },
  ];

  constructor(private fb: FormBuilder, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      category: [''],
      tier: ['all'],
      description: [''],
      value: [null],
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.governanceServices.createEntitlement(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const code = res?.data?.code || this.form.value.code;
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Entitlement created' });
        setTimeout(() => this.router.navigate([code ? `/governance/entitlements/${encodeURIComponent(code)}` : '/governance/entitlements']), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to create' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/entitlements']); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
