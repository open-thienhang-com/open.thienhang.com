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
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = true;
  saving = false;
  userId = '';
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      username: [''],
      department: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.userId = params['kid'];
      if (this.userId) this.loadUser(this.userId);
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadUser(id: string): void {
    this.governanceServices.getUser(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const u = res?.data ?? res ?? {};
        this.form.patchValue({ full_name: u.full_name, email: u.email, username: u.username, department: u.department });
        this.loading = false;
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user' }); this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { email, ...data } = this.form.getRawValue();
    this.governanceServices.updateUser(this.userId, data).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'User updated' });
        setTimeout(() => this.router.navigate(['/governance/users', this.userId]), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/users', this.userId]); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
