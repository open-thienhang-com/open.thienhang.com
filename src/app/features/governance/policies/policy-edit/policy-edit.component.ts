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
  selector: 'app-policy-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './policy-edit.component.html',
})
export class PolicyEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = true;
  saving = false;
  policyId = '';
  private destroy$ = new Subject<void>();

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Draft', value: 'draft' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['active'],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.policyId = params['id'];
      if (this.policyId) this.loadPolicy(this.policyId);
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadPolicy(id: string): void {
    this.governanceServices.getPolicy(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const p = res?.data ?? res ?? {};
        this.form.patchValue({ name: p.name, description: p.description, status: p.status });
        this.loading = false;
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load policy' }); this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.governanceServices.updatePolicy(this.policyId, this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Policy updated' });
        setTimeout(() => this.router.navigate(['/governance/policies', this.policyId]), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/policies', this.policyId]); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
