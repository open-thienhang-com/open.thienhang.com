import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PartnerService } from '../../../services/retail.service';

interface PartnerItem {
  id: string;
  name: string;
  partnerType: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    BadgeModule,
    ToastModule
  ],
  templateUrl: './partners.component.html',
  providers: [MessageService]
})
export class PartnersComponent implements OnInit {
  partners: PartnerItem[] = [];
  filteredPartners: PartnerItem[] = [];
  loading = false;
  saving = false;

  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  showPartnerDialog = false;
  dialogMode: 'create' | 'edit' | 'view' = 'create';
  editingPartner: PartnerItem | null = null;

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  typeOptions: Array<{ label: string; value: string }> = [
    { label: 'All Types', value: '' }
  ];

  dialogStatusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private messageService: MessageService,
    private partnerService: PartnerService
  ) { }

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners(): void {
    this.loading = true;
    this.partnerService.listPartners(0, 50).subscribe({
      next: (resp: any) => {
        const data = Array.isArray(resp?.data) ? resp.data : [];
        this.partners = data.map((it: any) => this.mapPartner(it));
        this.refreshTypeOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.partners = [];
        this.filteredPartners = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load partners'
        });
      }
    });
  }

  applyFilters(): void {
    const keyword = this.searchTerm.trim().toLowerCase();
    this.filteredPartners = this.partners.filter((item) => {
      const matchesSearch = !keyword
        || item.name.toLowerCase().includes(keyword)
        || item.partnerType.toLowerCase().includes(keyword)
        || item.contactName.toLowerCase().includes(keyword)
        || item.phone.toLowerCase().includes(keyword)
        || item.email.toLowerCase().includes(keyword)
        || item.address.toLowerCase().includes(keyword);

      const statusKey = item.isActive ? 'active' : 'inactive';
      const matchesStatus = !this.selectedStatus || statusKey === this.selectedStatus;
      const matchesType = !this.selectedType || item.partnerType === this.selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilters();
  }

  createPartner(): void {
    this.dialogMode = 'create';
    this.editingPartner = {
      id: '',
      name: '',
      partnerType: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      isActive: true,
      createdAt: null,
      updatedAt: null
    };
    this.showPartnerDialog = true;
  }

  viewPartner(item: PartnerItem): void {
    this.openPartnerByMode(item, 'view');
  }

  editPartner(item: PartnerItem): void {
    this.openPartnerByMode(item, 'edit');
  }

  savePartner(): void {
    if (!this.editingPartner || this.dialogMode === 'view') {
      this.cancelEdit();
      return;
    }

    const payload = {
      name: this.editingPartner.name.trim(),
      partner_type: this.editingPartner.partnerType.trim(),
      contact_name: this.editingPartner.contactName.trim(),
      phone: this.editingPartner.phone.trim(),
      email: this.editingPartner.email.trim(),
      address: this.editingPartner.address.trim(),
      is_active: this.editingPartner.isActive
    };

    if (!payload.name || !payload.partner_type || !payload.contact_name || !payload.phone || !payload.email || !payload.address) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Name, type, contact, phone, email and address are required.'
      });
      return;
    }

    this.saving = true;
    const req$ = this.dialogMode === 'edit' && this.editingPartner.id
      ? this.partnerService.updatePartner(this.editingPartner.id, payload)
      : this.partnerService.createPartner(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showPartnerDialog = false;
        this.editingPartner = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.dialogMode === 'edit' ? 'Partner updated' : 'Partner created'
        });
        this.loadPartners();
      },
      error: (err: any) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to save partner'
        });
      }
    });
  }

  cancelEdit(): void {
    this.showPartnerDialog = false;
    this.editingPartner = null;
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'active' : 'inactive';
  }

  getActivePartnersCount(): number {
    return this.partners.filter((it) => it.isActive).length;
  }

  private openPartnerByMode(item: PartnerItem, mode: 'edit' | 'view'): void {
    this.dialogMode = mode;
    this.saving = true;
    this.partnerService.getPartner(item.id).subscribe({
      next: (resp: any) => {
        this.editingPartner = this.mapPartner(resp?.data || item);
        this.showPartnerDialog = true;
        this.saving = false;
      },
      error: () => {
        this.editingPartner = { ...item };
        this.showPartnerDialog = true;
        this.saving = false;
      }
    });
  }

  private refreshTypeOptions(): void {
    const values: string[] = [...new Set(this.partners.map((p) => p.partnerType).filter((x) => !!x))];
    this.typeOptions = [
      { label: 'All Types', value: '' },
      ...values.map((v) => ({ label: v, value: v }))
    ];
  }

  private mapPartner(raw: any): PartnerItem {
    return {
      id: String(raw?._id || raw?.id || ''),
      name: String(raw?.name || ''),
      partnerType: String(raw?.partner_type || ''),
      contactName: String(raw?.contact_name || ''),
      phone: String(raw?.phone || ''),
      email: String(raw?.email || ''),
      address: String(raw?.address || ''),
      isActive: raw?.is_active !== false,
      createdAt: raw?.created_at ? new Date(raw.created_at) : null,
      updatedAt: raw?.updated_at ? new Date(raw.updated_at) : null
    };
  }
}
