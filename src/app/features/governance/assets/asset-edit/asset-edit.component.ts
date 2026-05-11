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
  selector: 'app-asset-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './asset-edit.component.html',
})
export class AssetEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = true;
  saving = false;
  assetId = '';
  private destroy$ = new Subject<void>();

  typeOptions = [
    { label: 'Table', value: 'table' },
    { label: 'View', value: 'view' },
    { label: 'Report', value: 'report' },
    { label: 'API', value: 'api' },
    { label: 'File', value: 'file' },
  ];

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router,
    private governanceServices: GovernanceServices, private messageService: MessageService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      identify: [{ value: '', disabled: true }],
      type: ['table', Validators.required],
      domain_id: [''],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.assetId = params['id'];
      if (this.assetId) this.loadAsset(this.assetId);
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAsset(id: string): void {
    this.governanceServices.getAsset(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const asset = res?.data ?? res ?? {};
        this.form.patchValue({ name: asset.name, identify: asset.identify || asset._id, type: asset.type, domain_id: asset.domain_id, description: asset.description });
        this.loading = false;
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load asset' }); this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const { identify, ...data } = this.form.getRawValue();
    this.governanceServices.updateAsset(this.assetId, data).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Asset updated' });
        setTimeout(() => this.router.navigate(['/governance/assets', this.assetId]), 800);
      },
      error: (err: any) => { this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update' }); this.saving = false; }
    });
  }

  cancel(): void { this.router.navigate(['/governance/assets', this.assetId]); }
  invalid(name: string) { const f = this.form.get(name); return f?.invalid && f?.touched; }
}
