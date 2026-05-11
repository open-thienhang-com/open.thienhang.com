import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-entitlement-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, ProgressSpinnerModule, InputNumberModule],
  providers: [MessageService],
  templateUrl: './entitlement-edit.component.html',
})
export class EntitlementEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = true;
  saving = false;
  entitlementCode = '';
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

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      code: [{ value: '', disabled: true }],
      name: ['', Validators.required],
      category: [''],
      tier: ['all'],
      description: [''],
      value: [null],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.entitlementCode = params['code'];
      if (this.entitlementCode) this.loadEntitlement(decodeURIComponent(this.entitlementCode));
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadEntitlement(code: string): void {
    this.governanceServices.getEntitlement(code).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const e = res?.data ?? res ?? {};
        this.form.patchValue({ code: e.code, name: e.name, category: e.category, tier: e.tier, description: e.description, value: e.value });
        this.loading = false;
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load entitlement' }); this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { code, ...data } = this.form.getRawValue();
    this.governanceServices.updateEntitlement(this.entitlementCode, data).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Entitlement updated' });
        setTimeout(() => this.router.navigate(['/governance/entitlements', this.entitlementCode]), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/entitlements', this.entitlementCode]); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
