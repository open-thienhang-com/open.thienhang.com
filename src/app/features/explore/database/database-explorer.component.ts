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
    template: `
    <div class="p-4 md:p-6">
      <div class="mb-6">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Database Explorer</h1>
            <p class="text-gray-600 dark:text-gray-400">Browse and manage database connections</p>
          </div>
          <button pButton label="Add Database Connection" icon="pi pi-plus" class="p-button-primary"></button>
        </div>
        
        <!-- Database Type Icons -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div *ngFor="let dbType of databaseTypes" 
               class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="dbType.value === selectedDatabaseType"
               [class.border-blue-500]="dbType.value === selectedDatabaseType"
               (click)="filterByType(dbType.value)">
            <i [class]="dbType.icon + ' text-4xl mb-2 ' + dbType.color"></i>
            <span class="text-sm font-medium text-center">{{ dbType.label }}</span>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1" *ngIf="getCountByType(dbType.value) > 0">
              {{ getCountByType(dbType.value) }} {{ getCountByType(dbType.value) === 1 ? 'instance' : 'instances' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-[200px]">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                pInputText 
                class="w-full" 
                placeholder="Search databases..." 
                [(ngModel)]="searchQuery"
                (input)="applyFilters()">
            </span>
          </div>
          <div class="w-full md:w-auto">
            <p-dropdown 
              [options]="statusOptions" 
              [(ngModel)]="selectedStatus" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Filter by status"
              (onChange)="applyFilters()">
            </p-dropdown>
          </div>
        </div>
      </div>

      <!-- Database Table -->
      <p-card>
        <p-table [value]="filteredDatabases" [paginator]="true" [rows]="10" styleClass="p-datatable-sm p-datatable-gridlines"
                [rowsPerPageOptions]="[5,10,25]" [showCurrentPageReport]="true" responsiveLayout="stack" 
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Connection</th>
              <th>Owner</th>
              <th>Tables</th>
              <th>Size</th>
              <th>Last Synced</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-db>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i [class]="getIconClass(db.type)" class="text-lg"></i>
                  <div>
                    <div class="font-medium">{{ db.name }}</div>
                    <div class="text-xs text-gray-500">{{ db.description | slice:0:30 }}{{ db.description.length > 30 ? '...' : '' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="flex flex-col">
                  <span class="capitalize">{{ db.type }}</span>
                  <span class="text-xs text-gray-500">v{{ db.version }}</span>
                </div>
              </td>
              <td>
                <p-tag [severity]="getStatusSeverity(db.status)" [value]="db.status" [rounded]="true"></p-tag>
              </td>
              <td>
                <div class="flex flex-col">
                  <span>{{ db.host }}</span>
                  <span class="text-xs text-gray-500">Port: {{ db.port }}</span>
                </div>
              </td>
              <td>{{ db.owner }}</td>
              <td>
                <div class="flex flex-col">
                  <span>{{ db.tables }} tables</span>
                  <span class="text-xs text-gray-500">{{ db.schemas }} schemas</span>
                </div>
              </td>
              <td>{{ db.size }}</td>
              <td>
                <span [pTooltip]="db.lastSynced | date:'medium'">
                  {{ db.lastSynced | date:'short' }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="View details"></button>
                  <button pButton icon="pi pi-sync" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Sync now"></button>
                  <button pButton icon="pi pi-cog" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Settings"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center p-6">
                <div class="flex flex-col items-center">
                  <i class="pi pi-database text-5xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 mb-4">No database connections found matching your criteria</p>
                  <button pButton label="Add New Database" icon="pi pi-plus" class="p-button-outlined"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
    styles: [`
    :host ::ng-deep .p-card {
      @apply shadow-none;
    }
    
    :host ::ng-deep .p-card .p-card-content {
      @apply p-0;
    }
  `]
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
