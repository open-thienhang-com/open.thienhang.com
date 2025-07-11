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
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';

interface Pipeline {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'paused' | 'failed';
    owner: string;
    scheduleType: string;
    lastRun: Date;
    nextRun: Date | null;
    avgDuration: string;
    successRate: number;
    tags: string[];
}

@Component({
    selector: 'app-pipelines-explorer',
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
        RouterModule,
        ChartModule
    ],
    template: `
    <div class="p-4 md:p-6">
      <div class="mb-6">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pipeline Explorer</h1>
            <p class="text-gray-600 dark:text-gray-400">Monitor and manage your data pipelines</p>
          </div>
          <button pButton label="Add Pipeline" icon="pi pi-plus" class="p-button-primary"></button>
        </div>
        
        <!-- Pipeline Type Selection -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="selectedPipelineType === 'airflow'"
               [class.border-blue-500]="selectedPipelineType === 'airflow'"
               (click)="filterByType('airflow')">
            <i class="pi pi-directions text-4xl mb-2 text-blue-500"></i>
            <span class="text-sm font-medium text-center">Airflow</span>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">{{ getCountByType('airflow') }} pipelines</span>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="selectedPipelineType === 'nifi'"
               [class.border-blue-500]="selectedPipelineType === 'nifi'"
               (click)="filterByType('nifi')">
            <i class="pi pi-directions text-4xl mb-2 text-orange-500"></i>
            <span class="text-sm font-medium text-center">Apache NiFi</span>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">{{ getCountByType('nifi') }} pipelines</span>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="selectedPipelineType === 'prefect'"
               [class.border-blue-500]="selectedPipelineType === 'prefect'"
               (click)="filterByType('prefect')">
            <i class="pi pi-directions text-4xl mb-2 text-green-500"></i>
            <span class="text-sm font-medium text-center">Prefect</span>
            <span class="text-xs text-blue-600 dark:text-blue-400 mt-1">{{ getCountByType('prefect') }} pipelines</span>
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
                placeholder="Search pipelines..." 
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

      <!-- Pipelines Table -->
      <p-card>
        <p-table [value]="filteredPipelines" [paginator]="true" [rows]="10" styleClass="p-datatable-sm p-datatable-gridlines"
                 [rowsPerPageOptions]="[5,10,25]" [showCurrentPageReport]="true" responsiveLayout="stack" 
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Schedule</th>
              <th>Last Run</th>
              <th>Next Run</th>
              <th>Avg Duration</th>
              <th>Success Rate</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-pipeline>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i [class]="getIconClass(pipeline.type)" class="text-lg"></i>
                  <span class="font-medium">{{ pipeline.name }}</span>
                </div>
              </td>
              <td>{{ pipeline.type | titlecase }}</td>
              <td>
                <p-tag [severity]="getStatusSeverity(pipeline.status)" [value]="pipeline.status" [rounded]="true"></p-tag>
              </td>
              <td>{{ pipeline.scheduleType }}</td>
              <td>{{ pipeline.lastRun | date:'short' }}</td>
              <td>{{ pipeline.nextRun ? (pipeline.nextRun | date:'short') : 'Not scheduled' }}</td>
              <td>{{ pipeline.avgDuration }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <span [ngClass]="getSuccessRateClass(pipeline.successRate)" class="font-medium">
                    {{ pipeline.successRate }}%
                  </span>
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div [style.width.%]="pipeline.successRate" 
                         [ngClass]="{
                           'bg-green-500': pipeline.successRate >= 90,
                           'bg-yellow-500': pipeline.successRate >= 70 && pipeline.successRate < 90,
                           'bg-orange-500': pipeline.successRate > 0 && pipeline.successRate < 70,
                           'bg-red-500': pipeline.successRate === 0
                         }"
                         class="h-2 rounded-full">
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="View details"></button>
                  <button pButton icon="pi pi-play" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Run now" *ngIf="pipeline.status !== 'active'"></button>
                  <button pButton icon="pi pi-pause" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="Pause" *ngIf="pipeline.status === 'active'"></button>
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
                  <i class="pi pi-directions text-5xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 mb-4">No pipelines found matching your criteria</p>
                  <button pButton label="Add New Pipeline" icon="pi pi-plus" class="p-button-outlined"></button>
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
export class PipelinesExplorerComponent implements OnInit {
    pipelines: Pipeline[] = [];
    filteredPipelines: Pipeline[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedPipelineType: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Failed', value: 'failed' }
    ];

    ngOnInit() {
        this.loadMockData();
        this.filteredPipelines = [...this.pipelines];
    }

    loadMockData() {
        const pipelineTypes = ['airflow', 'nifi', 'prefect'];
        const statusOptions = ['active', 'paused', 'failed'];
        const scheduleTypes = ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Custom Cron', 'On-demand'];
        const owners = ['Data Engineering', 'Analytics Team', 'ML Ops', 'Data Science', 'Platform Team'];

        // Generate random pipelines
        for (let i = 1; i <= 30; i++) {
            const type = pipelineTypes[Math.floor(Math.random() * pipelineTypes.length)];
            const scheduleType = scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)];
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'active' | 'paused' | 'failed';

            const lastRun = new Date();
            lastRun.setHours(lastRun.getHours() - Math.floor(Math.random() * 72));

            let nextRun: Date | null = null;
            if (scheduleType !== 'On-demand') {
                nextRun = new Date();
                nextRun.setHours(nextRun.getHours() + Math.floor(Math.random() * 24) + 1);
            }

            const minutes = Math.floor(Math.random() * 60);
            const seconds = Math.floor(Math.random() * 60);
            const avgDuration = `${minutes}m ${seconds}s`;

            const successRate = Math.floor(Math.random() * 101);

            this.pipelines.push({
                id: `pipeline-${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)}-Pipeline-${i}`,
                type,
                status,
                owner: owners[Math.floor(Math.random() * owners.length)],
                scheduleType,
                lastRun,
                nextRun,
                avgDuration,
                successRate,
                tags: this.getRandomTags()
            });
        }
    }

    getRandomTags(): string[] {
        const allTags = ['etl', 'analytics', 'reporting', 'raw-data', 'ml-training', 'data-sync', 'monitoring'];
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
        this.filteredPipelines = this.pipelines.filter(pipeline => {
            // Apply pipeline type filter
            if (this.selectedPipelineType && pipeline.type !== this.selectedPipelineType) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && pipeline.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !pipeline.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    filterByType(type: string | null) {
        this.selectedPipelineType = type;
        this.applyFilters();
    }

    getCountByType(type: string | null): number {
        if (!type) {
            return this.pipelines.length;
        }
        return this.pipelines.filter(pipeline => pipeline.type === type).length;
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'airflow': return 'pi pi-directions text-blue-500';
            case 'nifi': return 'pi pi-directions text-orange-500';
            case 'prefect': return 'pi pi-directions text-green-500';
            default: return 'pi pi-directions text-gray-500';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'paused': return 'warning';
            case 'failed': return 'danger';
            default: return 'info';
        }
    }

    getSuccessRateClass(rate: number): string {
        if (rate >= 90) return 'text-green-500';
        if (rate >= 70) return 'text-yellow-500';
        if (rate > 0) return 'text-orange-500';
        return 'text-red-500';
    }
}
