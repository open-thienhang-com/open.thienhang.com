import { Component, EventEmitter, Injector, Output, Input, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { GovernanceServices, TenantCreate } from '../../../../core/services/governance.services';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { InputTextarea } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Button,
    Dialog,
    FloatLabel,
    InputText,
    DropdownModule,
    TagModule,
    TooltipModule,
    ToastModule,
    InputTextarea,
    CardModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './tenant.component.html',
})
export class TenantComponent extends AppBaseComponent implements OnInit {
  @Input() inline: boolean = false;
  @Output() onSave = new EventEmitter<void>();

  tenant: any = {
    plan: 'free',
    status: 'active',
    settings: '{}'
  };
  
  title = 'Create Tenant';
  visible = false;
  loading = false;
  isEditMode = false;
  isViewMode = false;

  planOptions = [
    { label: 'Free', value: 'free' },
    { label: 'Starter', value: 'starter' },
    { label: 'Professional', value: 'professional' },
    { label: 'Enterprise', value: 'enterprise' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Trial', value: 'trial' }
  ];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices,
    public messageService: MessageService,
    private router: Router
  ) {
    super(injector);
  }

  ngOnInit() {
    if (this.inline) {
      this.visible = true;
    }
  }

  save() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    const tenantId = this.tenant.kid || this.tenant.id;

    // Prepare data
    const data: TenantCreate = {
      name: this.tenant.name,
      slug: this.tenant.slug,
      owner_email: this.tenant.owner_email,
      telnet: this.tenant.telnet,
      plan: this.tenant.plan,
      status: this.tenant.status,
      description: this.tenant.description
    };

    // Parse settings JSON
    try {
      data.settings = JSON.parse(this.tenant.settings || '{}');
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Settings',
        detail: 'Settings must be a valid JSON object'
      });
      this.loading = false;
      return;
    }

    const saveObservable = tenantId ?
      this.governanceServices.updateTenant(tenantId, data) :
      this.governanceServices.createTenant(data);

    saveObservable.subscribe({
      next: (res) => {
        if (!res) return;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Tenant ${tenantId ? 'updated' : 'created'} successfully`
        });

        if (this.inline) {
          this.router.navigate(['/governance/tenants']);
        } else {
          this.visible = false;
          this.onSave.emit();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving tenant:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${tenantId ? 'update' : 'create'} tenant`
        });
        this.loading = false;
      }
    });
  }

  cancel() {
    if (this.inline) {
      this.router.navigate(['/governance/tenants']);
    } else {
      this.visible = false;
    }
  }

  show(id?) {
    this.visible = true;
    this.tenant = {
      plan: 'free',
      status: 'active',
      settings: '{}'
    };
    this.isEditMode = false;
    this.isViewMode = false;

    if (id) {
      this.title = 'Edit Tenant';
      this.isEditMode = true;
      this.loadTenant(id);
    } else {
      this.title = 'Create Tenant';
    }
  }

  loadTenant(id: string) {
    this.loading = true;
    this.governanceServices.getTenant(id).subscribe({
      next: (res) => {
        if (res.data) {
          const rawTenant = res.data;
          this.tenant = {
            ...rawTenant,
            settings: JSON.stringify(rawTenant.settings || {}, null, 2)
          };
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tenant details'
        });
        this.loading = false;
        this.visible = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.tenant.name?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Tenant name is required' });
      return false;
    }
    if (!this.tenant.slug?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Tenant slug is required' });
      return false;
    }
    if (!this.tenant.owner_email?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Owner email is required' });
      return false;
    }
    return true;
  }
}
