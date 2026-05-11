import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface Domain {
    id: string;
    name: string;
    description: string;
    owner: string;
    ownerAvatar: string;
    dataProducts: number;
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
}

@Component({
    selector: 'app-domain-catalog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        TagModule,
        ChipModule,
        BadgeModule,
        ProgressBarModule,
        TableModule,
        DropdownModule,
        CalendarModule,
        MultiSelectModule,
        OverlayPanelModule,
        DividerModule,
        AvatarModule,
        MenuModule,
        ConfirmPopupModule,
        ToastModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './domain-catalog.component.html',
    styleUrls: ['./domain-catalog.component.scss']
})
export class DomainCatalogComponent implements OnInit {
    domains: Domain[] = [];
    filteredDomains: Domain[] = [];
    searchTerm = '';
    selectedStatus: any = null;
    selectedCompliance: any = null;
    selectedTags: string[] = [];

    viewMode: 'grid' | 'list' = 'grid';
    loading = false;

    statusOptions = [
        { label: 'All Status', value: null },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' }
    ];

    complianceOptions = [
        { label: 'All Compliance', value: null },
        { label: 'Compliant', value: 'compliant' },
        { label: 'Non-Compliant', value: 'non-compliant' },
        { label: 'Pending', value: 'pending' }
    ];

    tagOptions: string[] = [];

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadDomains();
        this.loadTagOptions();
    }

    loadDomains() {
        this.loading = true;

        // Mock data - replace with actual API call
        setTimeout(() => {
            this.domains = [
                {
                    id: '1',
                    name: 'Customer Experience',
                    description: 'Complete customer journey data and analytics domain focusing on experience optimization.',
                    owner: 'Sarah Johnson',
                    ownerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
                    dataProducts: 12,
                    status: 'active',
                    lastUpdated: new Date('2024-01-15'),
                    tags: ['customer', 'analytics', 'experience', 'journey'],
                    maturityScore: 85,
                    compliance: 'compliant',
                    kpis: {
                        quality: 92,
                        usage: 88,
                        performance: 95
                    }
                },
                {
                    id: '2',
                    name: 'Financial Services',
                    description: 'Financial data management including transactions, payments, and regulatory compliance.',
                    owner: 'Michael Chen',
                    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                    dataProducts: 8,
                    status: 'active',
                    lastUpdated: new Date('2024-01-10'),
                    tags: ['finance', 'transactions', 'compliance', 'payments'],
                    maturityScore: 78,
                    compliance: 'compliant',
                    kpis: {
                        quality: 89,
                        usage: 75,
                        performance: 82
                    }
                },
                {
                    id: '3',
                    name: 'Supply Chain',
                    description: 'End-to-end supply chain visibility and optimization data domain.',
                    owner: 'Emma Williams',
                    ownerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                    dataProducts: 15,
                    status: 'active',
                    lastUpdated: new Date('2024-01-12'),
                    tags: ['supply-chain', 'logistics', 'inventory', 'optimization'],
                    maturityScore: 72,
                    compliance: 'pending',
                    kpis: {
                        quality: 76,
                        usage: 82,
                        performance: 79
                    }
                },
                {
                    id: '4',
                    name: 'Product Analytics',
                    description: 'Product usage analytics and performance metrics domain.',
                    owner: 'David Kim',
                    ownerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                    dataProducts: 6,
                    status: 'inactive',
                    lastUpdated: new Date('2024-01-08'),
                    tags: ['product', 'analytics', 'metrics', 'performance'],
                    maturityScore: 65,
                    compliance: 'non-compliant',
                    kpis: {
                        quality: 68,
                        usage: 45,
                        performance: 72
                    }
                },
                {
                    id: '5',
                    name: 'Marketing Intelligence',
                    description: 'Marketing campaign performance and customer acquisition data domain.',
                    owner: 'Lisa Anderson',
                    ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                    dataProducts: 10,
                    status: 'pending',
                    lastUpdated: new Date('2024-01-14'),
                    tags: ['marketing', 'campaigns', 'acquisition', 'intelligence'],
                    maturityScore: 58,
                    compliance: 'pending',
                    kpis: {
                        quality: 71,
                        usage: 52,
                        performance: 69
                    }
                }
            ];

            this.filteredDomains = [...this.domains];
            this.loading = false;
        }, 1000);
    }

    loadTagOptions() {
        this.tagOptions = [
            'customer', 'analytics', 'experience', 'journey', 'finance', 'transactions',
            'compliance', 'payments', 'supply-chain', 'logistics', 'inventory',
            'optimization', 'product', 'metrics', 'performance', 'marketing',
            'campaigns', 'acquisition', 'intelligence'
        ];
    }

    applyFilters() {
        this.filteredDomains = this.domains.filter(domain => {
            const matchesSearch = !this.searchTerm ||
                domain.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                domain.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                domain.owner.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.selectedStatus || domain.status === this.selectedStatus;
            const matchesCompliance = !this.selectedCompliance || domain.compliance === this.selectedCompliance;
            const matchesTags = this.selectedTags.length === 0 ||
                this.selectedTags.every(tag => domain.tags.includes(tag));

            return matchesSearch && matchesStatus && matchesCompliance && matchesTags;
        });
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedStatus = null;
        this.selectedCompliance = null;
        this.selectedTags = [];
        this.filteredDomains = [...this.domains];
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'danger';
            case 'pending': return 'warning';
            default: return 'info';
        }
    }

    getComplianceSeverity(compliance: string) {
        switch (compliance) {
            case 'compliant': return 'success';
            case 'non-compliant': return 'danger';
            case 'pending': return 'warning';
            default: return 'info';
        }
    }

    getMaturityColor(score: number) {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    }

    editDomain(domain: Domain) {
        this.messageService.add({
            severity: 'info',
            summary: 'Edit Domain',
            detail: `Editing domain: ${domain.name}`
        });
    }

    deleteDomain(event: Event, domain: Domain) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Are you sure you want to delete domain "${domain.name}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.domains = this.domains.filter(d => d.id !== domain.id);
                this.applyFilters();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Domain deleted successfully'
                });
            }
        });
    }

    createDomain() {
        this.messageService.add({
            severity: 'info',
            summary: 'Create Domain',
            detail: 'Opening create domain dialog'
        });
    }

    exportDomains() {
        this.messageService.add({
            severity: 'info',
            summary: 'Export',
            detail: 'Exporting domains data'
        });
    }

    removeTag(tag: string) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
        this.applyFilters();
    }

    refreshData() {
        this.loadDomains();
        this.messageService.add({
            severity: 'success',
            summary: 'Refreshed',
            detail: 'Data refreshed successfully'
        });
    }
}
