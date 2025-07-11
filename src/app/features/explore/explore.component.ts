import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-explore',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        TableModule,
        TagModule,
        TooltipModule,
        DropdownModule,
        InputTextModule
    ],
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.scss']
})
export class ExploreComponent {
    dataSources = [
        {
            id: 1,
            name: 'MongoDB Production',
            type: 'database',
            subtype: 'mongodb',
            status: 'online',
            lastSynced: '2025-07-10T12:30:45Z',
            owner: 'Data Platform Team',
            assets: 42,
            health: 98
        },
        {
            id: 2,
            name: 'Postgres Analytics',
            type: 'database',
            subtype: 'postgres',
            status: 'online',
            lastSynced: '2025-07-10T10:15:22Z',
            owner: 'Data Analytics Team',
            assets: 124,
            health: 95
        },
        {
            id: 3,
            name: 'Trino Data Warehouse',
            type: 'database',
            subtype: 'trino',
            status: 'online',
            lastSynced: '2025-07-09T23:45:12Z',
            owner: 'Data Engineering',
            assets: 87,
            health: 100
        },
        {
            id: 4,
            name: 'Daily ETL Pipeline',
            type: 'pipeline',
            subtype: 'airflow',
            status: 'online',
            lastSynced: '2025-07-10T05:00:00Z',
            owner: 'ETL Team',
            assets: 17,
            health: 92
        },
        {
            id: 5,
            name: 'Events Streaming Platform',
            type: 'topic',
            subtype: 'kafka',
            status: 'warning',
            lastSynced: '2025-07-10T11:12:33Z',
            owner: 'Streaming Team',
            assets: 28,
            health: 86
        },
        {
            id: 6,
            name: 'Customer Prediction Model',
            type: 'mlmodel',
            subtype: 'tensorflow',
            status: 'online',
            lastSynced: '2025-07-10T09:30:45Z',
            owner: 'Data Science Team',
            assets: 3,
            health: 99
        },
        {
            id: 7,
            name: 'Media Storage',
            type: 'container',
            subtype: 's3',
            status: 'online',
            lastSynced: '2025-07-10T08:22:18Z',
            owner: 'Infrastructure Team',
            assets: 10432,
            health: 100
        },
        {
            id: 8,
            name: 'Product Catalog Search',
            type: 'search',
            subtype: 'elasticsearch',
            status: 'offline',
            lastSynced: '2025-07-08T14:55:10Z',
            owner: 'Search Team',
            assets: 1,
            health: 0
        },
        {
            id: 9,
            name: 'NLP Service',
            type: 'api',
            subtype: 'openai',
            status: 'online',
            lastSynced: '2025-07-10T13:05:27Z',
            owner: 'AI Team',
            assets: 5,
            health: 97
        }
    ];

    typeOptions = [
        { label: 'All Types', value: null },
        { label: 'Database', value: 'database' },
        { label: 'Pipeline', value: 'pipeline' },
        { label: 'Topic', value: 'topic' },
        { label: 'ML Model', value: 'mlmodel' },
        { label: 'Container', value: 'container' },
        { label: 'Search Index', value: 'search' },
        { label: 'API', value: 'api' }
    ];

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Online', value: 'online' },
        { label: 'Warning', value: 'warning' },
        { label: 'Offline', value: 'offline' }
    ];

    selectedType: string | null = null;
    selectedStatus: string | null = null;
    searchQuery: string = '';

    get filteredDataSources() {
        return this.dataSources.filter(source => {
            // Apply type filter
            if (this.selectedType && source.type !== this.selectedType) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && source.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !source.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'online': return 'success';
            case 'warning': return 'warning';
            case 'offline': return 'danger';
            default: return 'info';
        }
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    getIconClass(type: string, subtype: string): string {
        switch (type) {
            case 'database':
                return 'pi pi-database text-blue-500';
            case 'pipeline':
                return 'pi pi-directions text-green-500';
            case 'topic':
                return 'pi pi-telegram text-orange-500';
            case 'mlmodel':
                return 'pi pi-chart-line text-purple-500';
            case 'container':
                return 'pi pi-box text-yellow-500';
            case 'search':
                return 'pi pi-search text-red-500';
            case 'api':
                return 'pi pi-globe text-indigo-500';
            default:
                return 'pi pi-server text-gray-500';
        }
    }

    getHealthClass(health: number): string {
        if (health >= 90) return 'text-green-500';
        if (health >= 70) return 'text-yellow-500';
        if (health > 0) return 'text-orange-500';
        return 'text-red-500';
    }
}
