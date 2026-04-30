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
  selector: 'app-asset-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule],
  providers: [MessageService],
  templateUrl: './asset-create.component.html',
})
export class AssetCreateComponent implements OnDestroy {
  form: FormGroup;
  saving = false;
  private destroy$ = new Subject<void>();

  typeOptions = [
    { label: 'Table', value: 'table' },
    { label: 'View', value: 'view' },
    { label: 'Report', value: 'report' },
    { label: 'API', value: 'api' },
    { label: 'File', value: 'file' },
  ];

  constructor(private fb: FormBuilder, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      identify: ['', Validators.required],
      type: ['table', Validators.required],
      domain_id: [''],
      description: [''],
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.governanceServices.createAsset(this.form.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const id = res?.data?.identify || res?.data?._id || res?.data?.id;
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Asset created successfully' });
        setTimeout(() => this.router.navigate([id ? `/governance/assets/${id}` : '/governance/assets']), 800);
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to create asset' });
        this.saving = false;
      }
    });
  }

  cancel(): void { this.router.navigate(['/governance/assets']); }
  field(name: string) { return this.form.get(name); }
  invalid(name: string) { const f = this.field(name); return f?.invalid && f?.touched; }
}
