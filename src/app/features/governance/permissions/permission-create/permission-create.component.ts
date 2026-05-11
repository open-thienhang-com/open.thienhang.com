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

@Component({
  selector: 'app-permission-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule],
  providers: [MessageService],
  templateUrl: './permission-create.component.html',
})
export class PermissionCreateComponent implements OnDestroy {
  form: FormGroup;
  saving = false;
  private destroy$ = new Subject<void>();

  actionOptions = [
    { label: 'View', value: 'view' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Patch', value: 'patch' },
    { label: 'Delete', value: 'delete' },
  ];

  constructor(private fb: FormBuilder, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      action: ['view', Validators.required],
      resource: ['', Validators.required],
      description: [''],
    });
    this.form.get('action')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateCodePreview());
    this.form.get('resource')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateCodePreview());
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  updateCodePreview(): void {
    const resource = this.form.get('resource')?.value || '';
    const action = this.form.get('action')?.value || '';
    if (resource && action) {
      this.form.get('code')?.setValue(`perm:${resource}:${action}`, { emitEvent: false });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.governanceServices.createPermission(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const id = res?.data?.identify || res?.data?.kid || res?.data?._id;
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Permission created' });
        setTimeout(() => this.router.navigate([id ? `/governance/permissions/${id}` : '/governance/permissions']), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to create' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/permissions']); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
