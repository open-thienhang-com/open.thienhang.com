import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

interface DataContract {
    id: string;
    name: string;
    description: string;
    version: string;
    status: string;
    dataProductId: string;
    dataProductName: string;
    provider: string;
    consumer: string[];
    schema: any;
    sla: {
        availability: number;
        responseTime: number;
        throughput: number;
    };
    quality: {
        completeness: number;
        accuracy: number;
        freshness: number;
    };
    governance: {
        classification: string;
        retention: string;
        privacy: string;
    };
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

interface ContractStats {
    totalContracts: number;
    activeContracts: number;
    expiringSoon: number;
    violations: number;
}

@Component({
    selector: 'app-data-contracts',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule
    ],
    templateUrl: './data-contracts.component.html',
    styleUrls: ['./data-contracts.component.scss']
})
export class DataContractsComponent implements OnInit {
    contracts: DataContract[] = [];
    filteredContracts: DataContract[] = [];
    loading = false;
    showContractModal = false;
    selectedContract: DataContract | null = null;

    searchTerm = '';
    filters = {
        status: '',
        provider: '',
        classification: ''
    };

    // View mode
    viewMode: 'list' | 'card' = 'list';

    stats: ContractStats = {
        totalContracts: 0,
        activeContracts: 0,
        expiringSoon: 0,
        violations: 0
    };

    ngOnInit() {
        this.loadContracts();
        this.loadStats();
    }

    loadContracts() {
        this.loading = true;

        // Mock data for demonstration
        setTimeout(() => {
            this.contracts = [
                {
                    id: '1',
                    name: 'Customer Profile Data Contract',
                    description: 'Customer profile data including demographics and preferences',
                    version: 'v2.1.0',
                    status: 'ACTIVE',
                    dataProductId: 'dp-customer-001',
                    dataProductName: 'Customer Analytics',
                    provider: 'Customer Domain Team',
                    consumer: ['Marketing Analytics', 'Sales Operations', 'Customer Support'],
                    schema: {
                        type: 'object',
                        properties: {
                            customerId: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            email: { type: 'string' },
                            preferences: { type: 'object' }
                        }
                    },
                    sla: {
                        availability: 99.9,
                        responseTime: 100,
                        throughput: 1000
                    },
                    quality: {
                        completeness: 98.5,
                        accuracy: 99.2,
                        freshness: 95.8
                    },
                    governance: {
                        classification: 'CONFIDENTIAL',
                        retention: '7 years',
                        privacy: 'PII'
                    },
                    createdAt: new Date('2024-01-15'),
                    updatedAt: new Date('2024-01-20'),
                    expiresAt: new Date('2025-01-15')
                },
                {
                    id: '2',
                    name: 'Order Processing Data Contract',
                    description: 'Real-time order data for downstream processing',
                    version: 'v1.5.2',
                    status: 'ACTIVE',
                    dataProductId: 'dp-orders-001',
                    dataProductName: 'Order Management',
                    provider: 'Order Domain Team',
                    consumer: ['Inventory Management', 'Financial Reporting', 'Customer Analytics'],
                    schema: {
                        type: 'object',
                        properties: {
                            orderId: { type: 'string' },
                            customerId: { type: 'string' },
                            items: { type: 'array' },
                            totalAmount: { type: 'number' },
                            status: { type: 'string' }
                        }
                    },
                    sla: {
                        availability: 99.95,
                        responseTime: 50,
                        throughput: 5000
                    },
                    quality: {
                        completeness: 99.8,
                        accuracy: 99.9,
                        freshness: 99.5
                    },
                    governance: {
                        classification: 'INTERNAL',
                        retention: '5 years',
                        privacy: 'NON_PII'
                    },
                    createdAt: new Date('2024-01-10'),
                    updatedAt: new Date('2024-01-18'),
                    expiresAt: new Date('2024-12-31')
                },
                {
                    id: '3',
                    name: 'Product Catalog Data Contract',
                    description: 'Product information and metadata for catalog services',
                    version: 'v3.0.0',
                    status: 'DRAFT',
                    dataProductId: 'dp-products-001',
                    dataProductName: 'Product Catalog',
                    provider: 'Product Domain Team',
                    consumer: ['E-commerce Platform', 'Recommendation Engine', 'Inventory System'],
                    schema: {
                        type: 'object',
                        properties: {
                            productId: { type: 'string' },
                            name: { type: 'string' },
                            category: { type: 'string' },
                            price: { type: 'number' },
                            attributes: { type: 'object' }
                        }
                    },
                    sla: {
                        availability: 99.5,
                        responseTime: 200,
                        throughput: 2000
                    },
                    quality: {
                        completeness: 97.2,
                        accuracy: 98.8,
                        freshness: 92.3
                    },
                    governance: {
                        classification: 'PUBLIC',
                        retention: '3 years',
                        privacy: 'NON_PII'
                    },
                    createdAt: new Date('2024-01-22'),
                    updatedAt: new Date('2024-01-22'),
                    expiresAt: new Date('2025-06-30')
                }
            ];

            this.filteredContracts = [...this.contracts];
            this.loading = false;
        }, 1000);
    }

    loadStats() {
        // Mock stats
        this.stats = {
            totalContracts: 3,
            activeContracts: 2,
            expiringSoon: 1,
            violations: 0
        };
    }

    onSearch() {
        this.applyFilters();
    }

    applyFilters() {
        this.filteredContracts = this.contracts.filter(contract => {
            const matchesSearch = !this.searchTerm ||
                contract.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                contract.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                contract.provider.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.filters.status || contract.status === this.filters.status;
            const matchesProvider = !this.filters.provider || contract.provider === this.filters.provider;
            const matchesClassification = !this.filters.classification || contract.governance.classification === this.filters.classification;

            return matchesSearch && matchesStatus && matchesProvider && matchesClassification;
        });
    }

    openContractModal(contract?: DataContract) {
        this.selectedContract = contract || null;
        this.showContractModal = true;
    }

    closeContractModal() {
        this.showContractModal = false;
        this.selectedContract = null;
    }

    viewContract(contract: DataContract) {
        console.log('Viewing contract:', contract);
    }

    deleteContract(contractId: string) {
        if (confirm('Are you sure you want to delete this data contract?')) {
            this.contracts = this.contracts.filter(c => c.id !== contractId);
            this.applyFilters();
            this.loadStats();
        }
    }

    toggleViewMode() {
        this.viewMode = this.viewMode === 'list' ? 'card' : 'list';
    }

    trackByContractId(index: number, contract: DataContract): string {
        return contract.id;
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'DEPRECATED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    }

    getClassificationColor(classification: string): string {
        switch (classification) {
            case 'PUBLIC': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'INTERNAL': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'CONFIDENTIAL': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'RESTRICTED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    }

    isExpiringSoon(expiresAt: Date): boolean {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        return new Date(expiresAt) <= thirtyDaysFromNow;
    }
}
