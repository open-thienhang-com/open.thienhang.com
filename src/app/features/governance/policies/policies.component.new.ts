import {Component, Injector, OnInit} from '@angular/core';
import {PolicyComponent} from '../policies/policy/policy.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextarea } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-policies',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    TableModule,
    DropdownModule,
    InputTextModule,
    CardModule,
    BadgeModule,
    TagModule,
    ChipModule,
    MenuModule,
    TooltipModule,
    DialogModule,
    InputSwitchModule,
    MultiSelectModule,
    OverlayPanelModule,
    InputTextarea
  ],
  templateUrl: './policies.component.html'
})
export class PoliciesComponent extends AppBaseComponent implements OnInit {
  policies: any;
  
  // Stats
  stats = {
    totalPolicies: 0,
    activePolicies: 0,
    securityPolicies: 0,
    compliancePolicies: 0,
    domainPolicies: 0,
    globalPolicies: 0
  };
  
  // Filters
  showFilters: boolean = false;
  searchTerm: string = '';
  selectedType: any = null;
  selectedDomain: any = null;
  selectedStatus: any = null;
  
  // Dialog
  showCreateDialog: boolean = false;
  
  // Options for dropdowns
  typeOptions = [
    { label: 'Data Quality', value: 'data-quality' },
    { label: 'Security', value: 'security' },
    { label: 'Compliance', value: 'compliance' },
    { label: 'Governance', value: 'governance' },
    { label: 'Domain', value: 'domain' }
  ];
  
  domainOptions = [
    { label: 'Customer Domain', value: 'customer' },
    { label: 'Product Domain', value: 'product' },
    { label: 'Order Domain', value: 'order' },
    { label: 'Analytics Domain', value: 'analytics' },
    { label: 'Global', value: 'global' }
  ];
  
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Deprecated', value: 'deprecated' }
  ];
  
  enforcementOptions = [
    { label: 'Mandatory', value: 'mandatory' },
    { label: 'Recommended', value: 'recommended' },
    { label: 'Optional', value: 'optional' }
  ];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getPolicies();
    this.loadStats();
  }

  getPolicies = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getPolicies({offset: page, size: this.tableRowsPerPage}).subscribe(res => {
      this.policies = res;
      this.isTableLoading = false;
    })
  }

  loadStats() {
    // Mock stats - replace with actual API call
    this.stats = {
      totalPolicies: 28,
      activePolicies: 24,
      securityPolicies: 15,
      compliancePolicies: 13,
      domainPolicies: 18,
      globalPolicies: 10
    };
  }

  showPolicyMatrix() {
    // Implementation for showing policy matrix
    console.log('Showing policy matrix...');
  }

  filterPolicies() {
    // Implementation for filtering policies
    console.log('Filtering policies...');
  }

  applyFilters() {
    this.filterPolicies();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = null;
    this.selectedDomain = null;
    this.selectedStatus = null;
    this.filterPolicies();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleCreateDialog() {
    this.showCreateDialog = !this.showCreateDialog;
  }

  onDeletePolicy(event: Event, id: string) {
    this.confirmOnDelete(event, this.governanceServices.deletePolicy(id), this.getPolicies);
  }

  getPolicyTypeSeverity(type: string): string {
    switch (type) {
      case 'security':
        return 'danger';
      case 'compliance':
        return 'warning';
      case 'performance':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getPolicyStatusSeverity(status: string): string {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'disabled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
