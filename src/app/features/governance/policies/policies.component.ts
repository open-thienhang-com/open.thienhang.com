import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GovernanceServices } from '../../../core/services/governance.services';
import { PolicyComponent } from './policy/policy.component';

interface Policy {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  rules: any[];
  domain: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface PolicyStats {
  totalPolicies: number;
  activePolicies: number;
  violations: number;
  enforcedPolicies: number;
}

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, PolicyComponent],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit {
  policies: Policy[] = [];
  filteredPolicies: Policy[] = [];
  loading = false;
  showPolicyModal = false;
  selectedPolicy: Policy | null = null;

  searchTerm = '';
  filters = {
    status: '',
    type: '',
    priority: ''
  };

  stats: PolicyStats = {
    totalPolicies: 0,
    activePolicies: 0,
    violations: 0,
    enforcedPolicies: 0
  };

  constructor(
    private governanceServices: GovernanceServices,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPolicies();
    this.loadStats();
  }

  loadPolicies() {
    this.loading = true;

    // Mock data for demonstration
    setTimeout(() => {
      this.policies = [
        {
          id: '1',
          name: 'PII Data Access Control',
          description: 'Controls access to personally identifiable information',
          type: 'ACCESS_CONTROL',
          status: 'ACTIVE',
          priority: 'HIGH',
          rules: [],
          domain: 'Customer Data',
          tags: ['PII', 'Privacy', 'GDPR'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          createdBy: 'admin'
        },
        {
          id: '2',
          name: 'Data Quality Standards',
          description: 'Ensures data meets quality thresholds',
          type: 'DATA_QUALITY',
          status: 'ACTIVE',
          priority: 'MEDIUM',
          rules: [],
          domain: 'Sales Data',
          tags: ['Quality', 'Validation'],
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          createdBy: 'data-steward'
        },
        {
          id: '3',
          name: 'Data Retention Policy',
          description: 'Defines how long data should be retained',
          type: 'RETENTION',
          status: 'ACTIVE',
          priority: 'HIGH',
          rules: [],
          domain: 'All Domains',
          tags: ['Retention', 'Compliance'],
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-15'),
          createdBy: 'compliance-officer'
        },
        {
          id: '4',
          name: 'GDPR Compliance',
          description: 'Ensures GDPR compliance across all data processing',
          type: 'COMPLIANCE',
          status: 'ACTIVE',
          priority: 'HIGH',
          rules: [],
          domain: 'Customer Data',
          tags: ['GDPR', 'Privacy', 'Legal'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10'),
          createdBy: 'legal-team'
        },
        {
          id: '5',
          name: 'Data Masking for Dev',
          description: 'Masks sensitive data in development environments',
          type: 'PRIVACY',
          status: 'DRAFT',
          priority: 'MEDIUM',
          rules: [],
          domain: 'Development',
          tags: ['Masking', 'Security', 'Development'],
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date('2024-01-22'),
          createdBy: 'dev-team'
        }
      ];

      this.filteredPolicies = [...this.policies];
      this.loading = false;
    }, 1000);
  }

  loadStats() {
    // Mock stats
    this.stats = {
      totalPolicies: 5,
      activePolicies: 4,
      violations: 2,
      enforcedPolicies: 4
    };
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredPolicies = this.policies.filter(policy => {
      const matchesSearch = !this.searchTerm ||
        policy.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        policy.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.filters.status || policy.status === this.filters.status;
      const matchesType = !this.filters.type || policy.type === this.filters.type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  openPolicyModal(policy?: Policy) {
    this.selectedPolicy = policy || null;
    this.showPolicyModal = true;
  }

  closePolicyModal() {
    this.showPolicyModal = false;
    this.selectedPolicy = null;
  }

  onPolicySave(policy: Policy) {
    if (this.selectedPolicy) {
      // Update existing policy
      const index = this.policies.findIndex(p => p.id === policy.id);
      if (index !== -1) {
        this.policies[index] = { ...policy };
      }
    } else {
      // Add new policy
      policy.id = (this.policies.length + 1).toString();
      policy.createdAt = new Date();
      policy.updatedAt = new Date();
      this.policies.push(policy);
    }

    this.applyFilters();
    this.loadStats();
    this.closePolicyModal();
  }

  viewPolicy(policy: Policy) {
    // Navigate to policy detail view
    this.router.navigate(['/governance/policies', policy._id || policy.id]);
  }

  deletePolicy(policyId: string) {
    if (confirm('Are you sure you want to delete this policy?')) {
      this.policies = this.policies.filter(p => p.id !== policyId);
      this.applyFilters();
      this.loadStats();
    }
  }

  trackByPolicyId(index: number, policy: Policy): string {
    return policy.id;
  }

  getDisplayType(type: string): string {
    switch (type) {
      case 'ACCESS_CONTROL': return 'Access Control';
      case 'DATA_QUALITY': return 'Data Quality';
      case 'PRIVACY': return 'Privacy';
      case 'RETENTION': return 'Retention';
      case 'COMPLIANCE': return 'Compliance';
      default: return type;
    }
  }
}
