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
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-account-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, PasswordModule],
  providers: [MessageService],
  templateUrl: './account-create.component.html',
})
export class AccountCreateComponent implements OnDestroy {
  form: FormGroup;
  saving = false;
  private destroy$ = new Subject<void>();

  typeOptions = [
    { label: 'User', value: 'user' },
    { label: 'Service', value: 'service' },
    { label: 'Admin', value: 'admin' },
  ];

  constructor(private fb: FormBuilder, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      type: ['user'],
      department: [''],
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.governanceServices.createAccount(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const id = res?.data?.identify || res?.data?.kid || res?.data?._id;
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Account created' });
        setTimeout(() => this.router.navigate([id ? `/governance/accounts/${id}` : '/governance/accounts']), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to create' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/accounts']); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
