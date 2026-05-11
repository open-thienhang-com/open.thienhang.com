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
  selector: 'app-permission-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './permission-edit.component.html',
})
export class PermissionEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = true;
  saving = false;
  permId = '';
  private destroy$ = new Subject<void>();

  actionOptions = [
    { label: 'View', value: 'view' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Patch', value: 'patch' },
    { label: 'Delete', value: 'delete' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: [{ value: '', disabled: true }],
      action: ['view', Validators.required],
      resource: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.permId = params['id'];
      if (this.permId) this.loadPermission(this.permId);
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadPermission(id: string): void {
    this.governanceServices.getPermission(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const p = res?.data ?? res ?? {};
        this.form.patchValue({ name: p.name, code: p.code || p.identify, action: p.action, resource: p.resource, description: p.description });
        this.loading = false;
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load' }); this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { code, ...data } = this.form.getRawValue();
    this.governanceServices.updatePermission(this.permId, data).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Permission updated' });
        setTimeout(() => this.router.navigate(['/governance/permissions', this.permId]), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/permissions', this.permId]); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
