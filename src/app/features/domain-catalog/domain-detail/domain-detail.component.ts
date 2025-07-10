import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface Domain {
    id: string;
    name: string;
    description: string;
    owner: string;
    ownerAvatar: string;
    dataProducts: DataProduct[];
    status: 'active' | 'inactive' | 'pending';
    lastUpdated: Date;
    tags: string[];
    maturityScore: number;
    compliance: 'compliant' | 'non-compliant' | 'pending';
    kpis: {
        quality: number;
        usage: number;
        performance: number;
    };
    team: TeamMember[];
    architecture: ArchitectureInfo;
    governance: GovernanceInfo;
    activities: Activity[];
}

interface DataProduct {
    id: string;
    name: string;
    description: string;
    status: string;
    lastUpdated: Date;
    consumers: number;
    qualityScore: number;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    email: string;
}

interface ArchitectureInfo {
    dataFlow: string;
    technologies: string[];
    integrations: string[];
    slaCompliance: number;
}

interface GovernanceInfo {
    policies: string[];
    dataClassification: string;
    retentionPeriod: string;
    accessControls: string[];
}

interface Activity {
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: Date;
    icon: string;
    color: string;
}

@Component({
    selector: 'app-domain-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        CardModule,
        TabViewModule,
        TagModule,
        ChipModule,
        BadgeModule,
        ProgressBarModule,
        TableModule,
        ChartModule,
        PanelModule,
        DividerModule,
        AvatarModule,
        AvatarGroupModule,
        TimelineModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './domain-detail.component.html',
    styleUrls: ['./domain-detail.component.scss']
})
export class DomainDetailComponent implements OnInit {
    domain: Domain | null = null;
    loading = true;
    domainId: string | null = null;

    // Chart data
    qualityTrendData: any;
    usageMetricsData: any;
    performanceData: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.domainId = params.get('id');
            if (this.domainId) {
                this.loadDomain();
            }
        });
    }

    loadDomain() {
        this.loading = true;

        // Mock data - replace with actual API call
        setTimeout(() => {
            this.domain = {
                id: this.domainId!,
                name: 'Customer Experience',
                description: 'Complete customer journey data and analytics domain focusing on experience optimization across all touchpoints.',
                owner: 'Sarah Johnson',
                ownerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
                dataProducts: [
                    {
                        id: '1',
                        name: 'Customer Journey Analytics',
                        description: 'Real-time customer journey tracking and analytics',
                        status: 'active',
                        lastUpdated: new Date('2024-01-15'),
                        consumers: 8,
                        qualityScore: 92
                    },
                    {
                        id: '2',
                        name: 'Customer Satisfaction Metrics',
                        description: 'Customer satisfaction and NPS tracking',
                        status: 'active',
                        lastUpdated: new Date('2024-01-12'),
                        consumers: 12,
                        qualityScore: 88
                    },
                    {
                        id: '3',
                        name: 'Customer Segmentation',
                        description: 'Advanced customer segmentation and profiling',
                        status: 'pending',
                        lastUpdated: new Date('2024-01-10'),
                        consumers: 5,
                        qualityScore: 85
                    }
                ],
                status: 'active',
                lastUpdated: new Date('2024-01-15'),
                tags: ['customer', 'analytics', 'experience', 'journey'],
                maturityScore: 85,
                compliance: 'compliant',
                kpis: {
                    quality: 92,
                    usage: 88,
                    performance: 95
                },
                team: [
                    {
                        id: '1',
                        name: 'Sarah Johnson',
                        role: 'Domain Owner',
                        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
                        email: 'sarah.johnson@company.com'
                    },
                    {
                        id: '2',
                        name: 'Mike Chen',
                        role: 'Data Engineer',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                        email: 'mike.chen@company.com'
                    },
                    {
                        id: '3',
                        name: 'Lisa Wang',
                        role: 'Data Analyst',
                        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                        email: 'lisa.wang@company.com'
                    }
                ],
                architecture: {
                    dataFlow: 'Event-driven architecture with real-time streaming',
                    technologies: ['Apache Kafka', 'Apache Spark', 'PostgreSQL', 'Redis'],
                    integrations: ['Salesforce', 'Google Analytics', 'Segment', 'Mixpanel'],
                    slaCompliance: 99.5
                },
                governance: {
                    policies: ['Data Privacy Policy', 'Data Quality Policy', 'Data Retention Policy'],
                    dataClassification: 'Confidential',
                    retentionPeriod: '7 years',
                    accessControls: ['Role-based Access', 'Multi-factor Authentication', 'Data Masking']
                },
                activities: [
                    {
                        id: '1',
                        type: 'Data Product',
                        description: 'Customer Journey Analytics updated with new features',
                        user: 'Mike Chen',
                        timestamp: new Date('2024-01-15T10:30:00'),
                        icon: 'pi-database',
                        color: '#2196F3'
                    },
                    {
                        id: '2',
                        type: 'Policy',
                        description: 'Data Privacy Policy updated for GDPR compliance',
                        user: 'Sarah Johnson',
                        timestamp: new Date('2024-01-14T14:15:00'),
                        icon: 'pi-shield',
                        color: '#4CAF50'
                    },
                    {
                        id: '3',
                        type: 'Team',
                        description: 'Lisa Wang joined as Data Analyst',
                        user: 'Sarah Johnson',
                        timestamp: new Date('2024-01-12T09:00:00'),
                        icon: 'pi-users',
                        color: '#FF9800'
                    }
                ]
            };

            this.initializeCharts();
            this.loading = false;
        }, 1000);
    }

    initializeCharts() {
        // Quality Trend Chart
        this.qualityTrendData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Quality Score',
                    data: [85, 87, 89, 91, 90, 92],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4
                }
            ]
        };

        // Usage Metrics Chart
        this.usageMetricsData = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Active Users',
                    data: [120, 135, 142, 158],
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'API Calls',
                    data: [2400, 2650, 2890, 3120],
                    backgroundColor: '#FF9800'
                }
            ]
        };

        // Performance Chart
        this.performanceData = {
            labels: ['Response Time', 'Throughput', 'Availability', 'Error Rate'],
            datasets: [
                {
                    label: 'Performance Metrics',
                    data: [95, 98, 99.5, 0.5],
                    backgroundColor: [
                        '#2196F3',
                        '#4CAF50',
                        '#FF9800',
                        '#F44336'
                    ]
                }
            ]
        };
    }

    goBack() {
        this.router.navigate(['/domains']);
    }

    editDomain() {
        this.messageService.add({
            severity: 'info',
            summary: 'Edit Domain',
            detail: `Editing domain: ${this.domain?.name}`
        });
    }

    addDataProduct() {
        this.messageService.add({
            severity: 'info',
            summary: 'Add Data Product',
            detail: 'Opening create data product dialog'
        });
    }

    viewDataProduct(dataProduct: DataProduct) {
        this.messageService.add({
            severity: 'info',
            summary: 'View Data Product',
            detail: `Viewing: ${dataProduct.name}`
        });
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'danger';
            case 'pending': return 'warning';
            default: return 'info';
        }
    }

    getQualityColor(score: number) {
        if (score >= 90) return 'success';
        if (score >= 75) return 'warning';
        return 'danger';
    }
}
