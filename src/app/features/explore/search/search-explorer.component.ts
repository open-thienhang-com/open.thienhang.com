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

interface SearchIndex {
    id: string;
    name: string;
    type: string;
    version: string;
    status: 'healthy' | 'degraded' | 'offline';
    documents: number;
    size: string;
    queryPerSecond: number;
    avgResponseTime: number;
    lastUpdated: Date;
    created: Date;
    owner: string;
    cluster: string;
    shards: number;
    replicas: number;
}

@Component({
    selector: 'app-search-explorer',
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
    templateUrl: './search-explorer.component.html',
    styleUrl: './search-explorer.component.scss'
})
export class SearchExplorerComponent implements OnInit {
    indexes: SearchIndex[] = [];
    filteredIndexes: SearchIndex[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedCluster: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Healthy', value: 'healthy' },
        { label: 'Degraded', value: 'degraded' },
        { label: 'Offline', value: 'offline' }
    ];

    clusterOptions: { label: string, value: string }[] = [];

    performanceChartData: any;
    performanceChartOptions: any;

    constructor(private messageService: MessageService) { }

    ngOnInit() {
        this.loadMockData();
        this.filteredIndexes = [...this.indexes];
        this.updateClusterOptions();
        this.prepareChartData();
    }

    loadMockData() {
        const clusters = ['prod-es-cluster', 'staging-es-cluster', 'dev-es-cluster'];
        const statusOptions = ['healthy', 'degraded', 'offline'];
        const owners = ['Search Team', 'Data Engineering', 'Platform Team'];

        // Generate random indexes
        for (let i = 1; i <= 15; i++) {
            const cluster = clusters[Math.floor(Math.random() * clusters.length)];
            const documents = Math.floor(Math.random() * 10000000) + 1000; // 1K-10M documents
            const sizeGB = (documents * 0.0001).toFixed(2); // Rough estimation
            const queryPerSecond = Math.floor(Math.random() * 1000) + 1; // 1-1000 QPS
            const avgResponseTime = Math.floor(Math.random() * 500) + 10; // 10-500ms
            const shards = Math.pow(2, Math.floor(Math.random() * 4)); // 1, 2, 4, 8
            const replicas = Math.floor(Math.random() * 3); // 0, 1, 2

            const lastUpdated = new Date();
            lastUpdated.setHours(lastUpdated.getHours() - Math.floor(Math.random() * 72));

            const created = new Date();
            created.setDate(created.getDate() - Math.floor(Math.random() * 365));

            this.indexes.push({
                id: `index-${i}`,
                name: `elasticsearch-index-${i}`,
                type: 'elasticsearch',
                version: `7.${Math.floor(Math.random() * 10) + 10}.0`,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'healthy' | 'degraded' | 'offline',
                documents,
                size: `${sizeGB} GB`,
                queryPerSecond,
                avgResponseTime,
                lastUpdated,
                created,
                owner: owners[Math.floor(Math.random() * owners.length)],
                cluster,
                shards,
                replicas
            });
        }
    }

    updateClusterOptions() {
        const clusters = this.getClusters();
        this.clusterOptions = [
            { label: 'All Clusters', value: null },
            ...clusters.map(cluster => ({ label: cluster, value: cluster }))
        ];
    }

    prepareChartData() {
        // Mock performance data for the last 24 hours
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const qpsData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 500) + 200);
        const responseTimeData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 200) + 50);

        this.performanceChartData = {
            labels: hours,
            datasets: [
                {
                    label: 'Queries Per Second',
                    data: qpsData,
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Response Time (ms)',
                    data: responseTimeData,
                    fill: false,
                    borderColor: '#FFA726',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };

        this.performanceChartOptions = {
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 12
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    title: {
                        display: true,
                        text: 'QPS'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    title: {
                        display: true,
                        text: 'Response Time (ms)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            maintainAspectRatio: false
        };
    }

    applyFilters() {
        this.filteredIndexes = this.indexes.filter(index => {
            // Apply cluster filter
            if (this.selectedCluster && index.cluster !== this.selectedCluster) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && index.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !index.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    getClusters(): string[] {
        return Array.from(new Set(this.indexes.map(index => index.cluster))).sort();
    }

    getIndexesInCluster(cluster: string): SearchIndex[] {
        return this.indexes.filter(index => index.cluster === cluster);
    }

    getDocumentsInCluster(cluster: string): number {
        return this.getIndexesInCluster(cluster).reduce((sum, index) => sum + index.documents, 0);
    }

    getTotalShardsInCluster(cluster: string): number {
        return this.getIndexesInCluster(cluster).reduce((sum, index) => sum + index.shards, 0);
    }

    getAvgReplicasInCluster(cluster: string): number {
        const indexes = this.getIndexesInCluster(cluster);
        if (indexes.length === 0) return 0;

        const totalReplicas = indexes.reduce((sum, index) => sum + index.replicas, 0);
        return parseFloat((totalReplicas / indexes.length).toFixed(1));
    }

    getClusterHealth(cluster: string): string {
        const indexes = this.getIndexesInCluster(cluster);
        if (indexes.length === 0) return 'unknown';

        const healthyCount = indexes.filter(index => index.status === 'healthy').length;
        const degradedCount = indexes.filter(index => index.status === 'degraded').length;

        if (healthyCount === indexes.length) return 'healthy';
        if (degradedCount > 0 || healthyCount > 0) return 'degraded';
        return 'offline';
    }

    getClusterHealthSeverity(cluster: string): string {
        const health = this.getClusterHealth(cluster);
        return this.getStatusSeverity(health as any);
    }

    getClusterLoad(cluster: string): number {
        return Math.floor(Math.random() * 100);
    }

    getTotalDocuments(): number {
        return this.indexes.reduce((sum, index) => sum + index.documents, 0);
    }

    getTotalSize(): string {
        const totalSizeGB = this.indexes.reduce((sum, index) => {
            const sizeMatch = index.size.match(/(\d+\.?\d*)/);
            return sum + (sizeMatch ? parseFloat(sizeMatch[0]) : 0);
        }, 0);

        return `${totalSizeGB.toFixed(2)} GB`;
    }

    getTotalQPS(): number {
        return this.indexes.reduce((sum, index) => sum + index.queryPerSecond, 0);
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'healthy': return 'success';
            case 'degraded': return 'warning';
            case 'offline': return 'danger';
            default: return 'info';
        }
    }
}
