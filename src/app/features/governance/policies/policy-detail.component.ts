import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

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
export class PolicyDetailComponent {
    policy = {
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
