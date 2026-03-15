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
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { RouterModule } from '@angular/router';

interface Database {
    id: string;
    name: string;
    type: string;
    version: string;
    status: 'online' | 'offline' | 'warning';
    host: string;
    port: number;
    description: string;
    owner: string;
    created: Date;
    lastSynced: Date;
    schemas: number;
    tables: number;
    size: string;
    tags: string[];
}

@Component({
    selector: 'app-database-explorer',
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
        RadioButtonModule,
        TabViewModule,
        RouterModule
    ],
    templateUrl: './database-explorer.component.html',
    styleUrl: './database-explorer.component.scss'
})
export class DatabaseExplorerComponent implements OnInit {
    databases: Database[] = [];
    filteredDatabases: Database[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedDatabaseType: string | null = null;

    databaseTypes = [
        { label: 'All Databases', value: null, icon: 'pi pi-database', color: 'text-blue-500' },
        { label: 'MongoDB', value: 'mongodb', icon: 'pi pi-server', color: 'text-green-500' },
        { label: 'PostgreSQL', value: 'postgresql', icon: 'pi pi-server', color: 'text-blue-600' },
        { label: 'MySQL', value: 'mysql', icon: 'pi pi-server', color: 'text-orange-500' },
        { label: 'Trino', value: 'trino', icon: 'pi pi-server', color: 'text-purple-500' },
        { label: 'Oracle', value: 'oracle', icon: 'pi pi-server', color: 'text-red-500' }
    ];

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Online', value: 'online' },
        { label: 'Warning', value: 'warning' },
        { label: 'Offline', value: 'offline' }
    ];

    ngOnInit() {
        this.loadMockData();
        this.applyFilters();
    }

    loadMockData() {
        const dbTypes = ['mongodb', 'postgresql', 'mysql', 'trino', 'oracle'];
        const statusOptions = ['online', 'offline', 'warning'];
        const owners = ['Data Engineering', 'Analytics Team', 'ML Ops', 'Data Science', 'Platform Team'];

        // Generate random databases
        for (let i = 1; i <= 25; i++) {
            const type = dbTypes[Math.floor(Math.random() * dbTypes.length)];
            const tables = Math.floor(Math.random() * 500) + 1;
            const schemas = Math.floor(Math.random() * 20) + 1;
            const sizeGB = Math.floor(Math.random() * 1000) + 1;

            const createdDate = new Date(
                2023 + Math.floor(Math.random() * 2),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
            );

            const lastSyncedDate = new Date();
            lastSyncedDate.setHours(lastSyncedDate.getHours() - Math.floor(Math.random() * 72));

            const db: Database = {
                id: `db-${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)}-DB-${i}`,
                type,
                version: this.getRandomVersion(type),
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'online' | 'offline' | 'warning',
                host: `${type}-server-${Math.floor(Math.random() * 10)}.datamesh.internal`,
                port: this.getDefaultPort(type),
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} database for analytics and reporting.`,
                owner: owners[Math.floor(Math.random() * owners.length)],
                created: createdDate,
                lastSynced: lastSyncedDate,
                schemas,
                tables,
                size: `${sizeGB} GB`,
                tags: this.getRandomTags()
            };

            this.databases.push(db);
        }
    }

    getRandomVersion(dbType: string): string {
        switch (dbType) {
            case 'mongodb': return ['4.4', '5.0', '6.0'][Math.floor(Math.random() * 3)];
            case 'postgresql': return ['12.9', '13.7', '14.4', '15.1'][Math.floor(Math.random() * 4)];
            case 'mysql': return ['5.7', '8.0', '8.1'][Math.floor(Math.random() * 3)];
            case 'trino': return ['398', '401', '410'][Math.floor(Math.random() * 3)];
            case 'oracle': return ['19c', '21c', '23c'][Math.floor(Math.random() * 3)];
            default: return '1.0';
        }
    }

    getDefaultPort(dbType: string): number {
        switch (dbType) {
            case 'mongodb': return 27017;
            case 'postgresql': return 5432;
            case 'mysql': return 3306;
            case 'trino': return 8080;
            case 'oracle': return 1521;
            default: return 1000 + Math.floor(Math.random() * 9000);
        }
    }

    getRandomTags(): string[] {
        const allTags = ['production', 'development', 'testing', 'analytics', 'reporting', 'customer-data', 'inventory', 'finance'];
        const numTags = Math.floor(Math.random() * 4) + 1;
        const tags: string[] = [];

        for (let i = 0; i < numTags; i++) {
            const tag = allTags[Math.floor(Math.random() * allTags.length)];
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        }

        return tags;
    }

    applyFilters() {
        this.filteredDatabases = this.databases.filter(db => {
            // Apply database type filter
            if (this.selectedDatabaseType && db.type !== this.selectedDatabaseType) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && db.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !db.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
                !db.description.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
                !db.host.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    filterByType(type: string | null) {
        this.selectedDatabaseType = type;
        this.applyFilters();
    }

    getCountByType(type: string | null): number {
        if (!type) {
            return this.databases.length;
        }
        return this.databases.filter(db => db.type === type).length;
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'mongodb': return 'pi pi-server text-green-500';
            case 'postgresql': return 'pi pi-server text-blue-600';
            case 'mysql': return 'pi pi-server text-orange-500';
            case 'trino': return 'pi pi-server text-purple-500';
            case 'oracle': return 'pi pi-server text-red-500';
            default: return 'pi pi-database text-gray-500';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'online': return 'success';
            case 'warning': return 'warning';
            case 'offline': return 'danger';
            default: return 'info';
        }
    }
}
