import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { GovernanceServices } from '../../../core/services/governance.services';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-policy-detail',
    templateUrl: './policy-detail.component.html',
    styleUrls: ['./policy-detail.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        TagModule,
        TableModule,
        CardModule,
        ChipModule,
        DatePipe
    ]
})
export class PolicyDetailComponent implements OnInit {
    policy: any = {
        id: '',
        name: '',
        description: '',
        status: '',
        created_by: '',
        created_at: '',
        updated_at: '',
        rules: [],
        affected_data: [],
        tags: []
    };

    loading: boolean = false;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private governanceServices: GovernanceServices
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const policyId = params.get('id');
            if (policyId) {
                this.loadPolicyDetails(policyId);
            } else {
                this.error = 'Policy ID is missing';
            }
        });
    }

    loadPolicyDetails(id: string): void {
        this.loading = true;
        this.error = null;

        this.governanceServices.getPolicy(id)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (response) => {
                    if (response && response.data) {
                        this.policy = this.formatPolicy(response.data);
                    } else {
                        this.policy = this.getDefaultPolicy(); // Fallback to mock data
                    }
                },
                error: (err) => {
                    console.error('Error loading policy details:', err);
                    this.error = 'Failed to load policy details. Using sample data instead.';
                    this.policy = this.getDefaultPolicy(); // Fallback to mock data on error
                }
            });
    }

    formatPolicy(apiPolicy: any): any {
        // Transform API response to match our component's expected format if needed
        return {
            id: apiPolicy._id || apiPolicy.id,
            name: apiPolicy.name,
            description: apiPolicy.description,
            status: apiPolicy.status,
            created_by: apiPolicy.created_by,
            created_at: apiPolicy.created_at,
            updated_at: apiPolicy.updated_at,
            rules: apiPolicy.rules || [],
            affected_data: apiPolicy.affected_data || [],
            tags: apiPolicy.tags || []
        };
    }

    getDefaultPolicy(): any {
        // Mock data as fallback
        return {
            id: 'policy-001',
            name: 'Data Retention Policy',
            description: 'Defines how long data is retained and when it should be deleted or archived.',
            status: 'Active',
            created_by: 'compliance@company.com',
            created_at: '2024-01-10T09:00:00Z',
            updated_at: '2024-06-15T14:30:00Z',
            rules: [
                {
                    id: 'rule-1',
                    name: 'Retention Period',
                    description: 'All customer data must be retained for 5 years.',
                    type: 'Retention',
                    condition: '5 years for customer data',
                    effect: 'Allow',
                    value: '5 years'
                },
                {
                    id: 'rule-2',
                    name: 'Archival',
                    description: 'Data older than 5 years must be archived to cold storage.',
                    type: 'Archival',
                    condition: 'Data older than 5 years',
                    effect: 'Allow',
                    value: 'Cold Storage'
                },
                {
                    id: 'rule-3',
                    name: 'Deletion',
                    description: 'Archived data older than 7 years must be deleted.',
                    type: 'Deletion',
                    condition: 'Archived data older than 7 years',
                    effect: 'Deny',
                    value: '7 years'
                }
            ],
            affected_data: [
                {
                    type: 'Dataset',
                    name: 'Customer Records',
                    description: 'Personal information and transaction history of customers'
                },
                {
                    type: 'System',
                    name: 'Transaction Logs',
                    description: 'Records of all system transactions and user activities'
                },
                {
                    type: 'Application',
                    name: 'User Activity',
                    description: 'User interaction logs and session data'
                }
            ],
            tags: ['compliance', 'retention', 'privacy']
        };
    }
}
