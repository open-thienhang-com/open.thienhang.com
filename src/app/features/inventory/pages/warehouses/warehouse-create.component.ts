import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { WarehouseService } from '../../services/inventory.service';

@Component({
  selector: 'app-warehouse-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, InputTextModule, CardModule, CheckboxModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="warehouse-create-page">
      <p-toast></p-toast>

      <div class="breadcrumb">
        <button pButton label="← Warehouses" class="p-button-text p-button-sm"
                (click)="router.navigate(['/inventory/warehouses'])"></button>
      </div>

      <div class="form-card">
        <h1 class="page-title"><i class="pi pi-plus-circle"></i> Add Warehouse</h1>

        <div class="form-grid">
          <div class="field">
            <label>Name <span class="required">*</span></label>
            <input pInputText [(ngModel)]="form.name" placeholder="Warehouse name" [class.ng-invalid]="submitted && !form.name" />
            @if (submitted && !form.name) { <small class="error">Name is required</small> }
          </div>

          <div class="field">
            <label>Type</label>
            <input pInputText [(ngModel)]="form.warehouse_type" placeholder="e.g. Central, Distribution" />
          </div>

          <div class="field full">
            <label>Address</label>
            <input pInputText [(ngModel)]="form.warehouse_address" placeholder="Street address" />
          </div>

          <div class="field">
            <label>Province / City</label>
            <input pInputText [(ngModel)]="form.province_name" placeholder="Province or city" />
          </div>

          <div class="field">
            <label>Region</label>
            <input pInputText [(ngModel)]="form.region_shortname" placeholder="e.g. North, South" />
          </div>
        </div>

        <div class="field checkbox-field">
          <p-checkbox [(ngModel)]="form.is_enabled" [binary]="true" inputId="isEnabled" label="Active"></p-checkbox>
        </div>

        <div class="form-actions">
          <button pButton label="Cancel" class="p-button-outlined p-button-secondary"
                  (click)="router.navigate(['/inventory/warehouses'])"></button>
          <button pButton label="Save Warehouse" icon="pi pi-check" [loading]="saving" (click)="save()"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warehouse-create-page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .breadcrumb { margin-bottom: 16px; }
    .form-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 12px rgba(0,0,0,.07); }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 28px; display: flex; align-items: center; gap: 10px; }
    .page-title i { color: #6366f1; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full { grid-column: 1 / -1; }
    label { font-size: 0.875rem; font-weight: 600; color: #374151; }
    .required { color: #ef4444; }
    .error { color: #ef4444; font-size: 0.75rem; }
    input { width: 100%; }
    .checkbox-field { margin-bottom: 28px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
  `]
})
export class WarehouseCreateComponent {
  form: any = {
    name: '', warehouse_type: '', warehouse_address: '',
    province_name: '', region_shortname: '', is_enabled: true
  };
  submitted = false;
  saving = false;

  constructor(
    private warehouseService: WarehouseService,
    public router: Router,
    private messageService: MessageService
  ) {}

  save() {
    this.submitted = true;
    if (!this.form.name) return;
    this.saving = true;
    this.warehouseService.createWarehouse({
      name: this.form.name,
      location: this.form.region_shortname || '',
      address: this.form.warehouse_address || '',
      city: this.form.province_name || '',
      country: '',
      total_capacity: 0,
      is_active: this.form.is_enabled
    }).subscribe({
      next: (res: any) => {
        this.saving = false;
        const id = res.data?._id || res.data?.warehouse_id;
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Warehouse created successfully' });
        setTimeout(() => {
          if (id) this.router.navigate(['/inventory/warehouses', id]);
          else this.router.navigate(['/inventory/warehouses']);
        }, 800);
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create warehouse' });
      }
    });
  }
}
