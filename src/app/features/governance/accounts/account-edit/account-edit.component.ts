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

@Component({
  selector: 'app-account-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './account-edit.component.html',
})
export class AccountEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = true;
  saving = false;
  accountId = '';
  private destroy$ = new Subject<void>();

  typeOptions = [
    { label: 'User', value: 'user' },
    { label: 'Service', value: 'service' },
    { label: 'Admin', value: 'admin' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      username: ['', Validators.required],
      type: ['user'],
      department: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.accountId = params['id'];
      if (this.accountId) this.loadAccount(this.accountId);
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAccount(id: string): void {
    this.governanceServices.getAccount(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const a = res?.data ?? res ?? {};
        this.form.patchValue({ full_name: a.full_name, email: a.email, username: a.username, type: a.type, department: a.department });
        this.loading = false;
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load account' }); this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { email, ...data } = this.form.getRawValue();
    this.governanceServices.updateAccount(this.accountId, data).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Account updated' });
        setTimeout(() => this.router.navigate(['/governance/accounts', this.accountId]), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/accounts', this.accountId]); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
