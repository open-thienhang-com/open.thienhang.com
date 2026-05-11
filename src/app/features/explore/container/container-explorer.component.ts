import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';

interface Container {
    id: string;
    name: string;
    type: string;
    region: string;
    status: 'active' | 'error' | 'inactive';
    size: string;
    usedSpace: number;
    totalSpace: number;
    files: number;
    lastAccessed: Date;
    created: Date;
    owner: string;
    permissions: string;
    public: boolean;
}

@Component({
    selector: 'app-container-explorer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        TableModule,
        TagModule,
        TooltipModule,
        DropdownModule,
        InputTextModule,
        DialogModule,
        ChipModule,
        ProgressBarModule,
        ToastModule,
        TabViewModule,
        RouterModule,
        ChartModule
    ],
    providers: [MessageService],
    templateUrl: './container-explorer.component.html',
    styleUrl: './container-explorer.component.scss'
})
export class ContainerExplorerComponent implements OnInit {
    containers: Container[] = [];
    filteredContainers: Container[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedContainerType: string | null = null;
    selectedRegion: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Active', value: 'active' },
        { label: 'Error', value: 'error' },
        { label: 'Inactive', value: 'inactive' }
    ];

    regionOptions = [
        { label: 'All Regions', value: null },
        { label: 'us-east-1', value: 'us-east-1' },
        { label: 'us-west-1', value: 'us-west-1' },
        { label: 'eu-west-1', value: 'eu-west-1' },
        { label: 'ap-southeast-1', value: 'ap-southeast-1' },
        { label: 'ap-northeast-1', value: 'ap-northeast-1' }
    ];

    chartData: any;
    chartOptions: any;

    constructor(private messageService: MessageService) { }

    ngOnInit() {
        this.loadMockData();
        this.filteredContainers = [...this.containers];
        this.prepareChartData();
    }

    loadMockData() {
        const containerTypes = ['s3', 'gcs'];
        const regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'];
        const statusOptions = ['active', 'error', 'inactive'];
        const permissionOptions = ['Read/Write', 'Read Only', 'Full Control'];
        const owners = ['Data Engineering', 'Analytics Team', 'ML Ops', 'Data Science', 'Platform Team', 'DevOps'];

        // Generate random containers
        for (let i = 1; i <= 20; i++) {
            const type = containerTypes[Math.floor(Math.random() * containerTypes.length)];
            const region = regions[Math.floor(Math.random() * regions.length)];
            const totalSpace = Math.floor(Math.random() * 1000) + 100; // 100-1100 GB
            const usedSpace = Math.floor(Math.random() * totalSpace); // 0-totalSpace GB
            const files = Math.floor(Math.random() * 1000000) + 1; // 1-1,000,000 files
            const isPublic = Math.random() > 0.7; // 30% chance of being public

            const lastAccessed = new Date();
            lastAccessed.setHours(lastAccessed.getHours() - Math.floor(Math.random() * 168)); // Within last week

            const created = new Date();
            created.setDate(created.getDate() - Math.floor(Math.random() * 365) - 30); // 1 month to 1 year ago

            this.containers.push({
                id: `container-${i}`,
                name: `${type}-bucket-${i}`,
                type,
                region,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'active' | 'error' | 'inactive',
                size: `${totalSpace} GB`,
                usedSpace,
                totalSpace,
                files,
                lastAccessed,
                created,
                owner: owners[Math.floor(Math.random() * owners.length)],
                permissions: permissionOptions[Math.floor(Math.random() * permissionOptions.length)],
                public: isPublic
            });
        }
    }

    prepareChartData() {
        // Storage usage by region chart
        const regionStorage: { [key: string]: { used: number, total: number } } = {};

        this.containers.forEach(container => {
            if (!regionStorage[container.region]) {
                regionStorage[container.region] = { used: 0, total: 0 };
            }
            regionStorage[container.region].used += container.usedSpace;
            regionStorage[container.region].total += container.totalSpace;
        });

        this.chartData = {
            labels: Object.keys(regionStorage),
            datasets: [
                {
                    label: 'Used Space (GB)',
                    data: Object.values(regionStorage).map(v => v.used),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Available Space (GB)',
                    data: Object.values(regionStorage).map(v => v.total - v.used),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            },
            maintainAspectRatio: false
        };
    }

    applyFilters() {
        this.filteredContainers = this.containers.filter(container => {
            // Apply container type filter
            if (this.selectedContainerType && container.type !== this.selectedContainerType) {
                return false;
            }

            // Apply region filter
            if (this.selectedRegion && container.region !== this.selectedRegion) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && container.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !container.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    filterByType(type: string | null) {
        this.selectedContainerType = type;
        this.applyFilters();
    }

    getCountByType(type: string | null): number {
        if (!type) {
            return this.containers.length;
        }
        return this.containers.filter(container => container.type === type).length;
    }

    getTotalStorageByType(type: string): string {
        const filteredContainers = this.containers.filter(container => container.type === type);
        const totalGB = filteredContainers.reduce((sum, container) => sum + container.totalSpace, 0);
        const usedGB = filteredContainers.reduce((sum, container) => sum + container.usedSpace, 0);

        return `${usedGB.toFixed(1)} / ${totalGB.toFixed(1)} GB`;
    }

    getCapacityPercentByType(type: string): number {
        const filteredContainers = this.containers.filter(container => container.type === type);
        if (filteredContainers.length === 0) return 0;

        const totalSpace = filteredContainers.reduce((sum, container) => sum + container.totalSpace, 0);
        const usedSpace = filteredContainers.reduce((sum, container) => sum + container.usedSpace, 0);

        return Math.round(usedSpace / totalSpace * 100);
    }

    getIconClass(type: string): string {
        switch (type) {
            case 's3': return 'pi pi-cloud text-orange-500';
            case 'gcs': return 'pi pi-cloud text-blue-500';
            default: return 'pi pi-cloud text-gray-500';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'error': return 'danger';
            case 'inactive': return 'warning';
            default: return 'info';
        }
    }

    getCapacityClass(percent: number): string {
        if (percent < 70) return 'progress-success';
        if (percent < 90) return 'progress-warning';
        return 'progress-danger';
    }
}
