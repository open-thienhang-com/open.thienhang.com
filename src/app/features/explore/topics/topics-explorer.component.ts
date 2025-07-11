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
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { KnobModule } from 'primeng/knob';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Topic {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'warning' | 'inactive';
    messagesPerSec: number;
    retention: string;
    partitions: number;
    replicationFactor: number;
    size: string;
    consumerGroups: number;
    lastActivity: Date;
    owner: string;
}

@Component({
    selector: 'app-topics-explorer',
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
        ChartModule,
        ProgressBarModule,
        KnobModule,
        RouterModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
    <div class="p-4 md:p-6">
      <div class="mb-6">
        <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Topics Explorer</h1>
            <p class="text-gray-600 dark:text-gray-400">Monitor and manage message topics</p>
          </div>
          <button pButton label="Add New Topic" icon="pi pi-plus" class="p-button-primary"></button>
        </div>
        
        <!-- Topic Type Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="selectedTopicType === 'kafka'"
               [class.border-blue-500]="selectedTopicType === 'kafka'"
               (click)="filterByType('kafka')">
            <div class="flex items-center gap-3 mb-3">
              <i class="pi pi-telegram text-4xl text-orange-500"></i>
              <div>
                <h3 class="text-lg font-semibold">Apache Kafka</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ getCountByType('kafka') }} topics</p>
              </div>
            </div>
            <div class="w-full mt-2">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Health</span>
                <span>{{ getHealthByType('kafka') }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div [style.width.%]="getHealthByType('kafka')" 
                     [ngClass]="{
                       'bg-green-500': getHealthByType('kafka') >= 90,
                       'bg-yellow-500': getHealthByType('kafka') >= 70 && getHealthByType('kafka') < 90,
                       'bg-orange-500': getHealthByType('kafka') > 0 && getHealthByType('kafka') < 70,
                       'bg-red-500': getHealthByType('kafka') === 0
                     }"
                     class="h-2 rounded-full">
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow"
               [class.border-2]="selectedTopicType === 'pulsar'"
               [class.border-blue-500]="selectedTopicType === 'pulsar'"
               (click)="filterByType('pulsar')">
            <div class="flex items-center gap-3 mb-3">
              <i class="pi pi-telegram text-4xl text-blue-500"></i>
              <div>
                <h3 class="text-lg font-semibold">Apache Pulsar</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ getCountByType('pulsar') }} topics</p>
              </div>
            </div>
            <div class="w-full mt-2">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Health</span>
                <span>{{ getHealthByType('pulsar') }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div [style.width.%]="getHealthByType('pulsar')" 
                     [ngClass]="{
                       'bg-green-500': getHealthByType('pulsar') >= 90,
                       'bg-yellow-500': getHealthByType('pulsar') >= 70 && getHealthByType('pulsar') < 90,
                       'bg-orange-500': getHealthByType('pulsar') > 0 && getHealthByType('pulsar') < 70,
                       'bg-red-500': getHealthByType('pulsar') === 0
                     }"
                     class="h-2 rounded-full">
                </div>
              </div>
            </div>
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
                placeholder="Search topics..." 
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

      <!-- Topics Table -->
      <p-card>
        <p-table [value]="filteredTopics" [paginator]="true" [rows]="10" styleClass="p-datatable-sm p-datatable-gridlines"
                 [rowsPerPageOptions]="[5,10,25]" [showCurrentPageReport]="true" responsiveLayout="stack" 
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Throughput</th>
              <th>Retention</th>
              <th>Partitions</th>
              <th>Size</th>
              <th>Consumers</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-topic>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i [class]="getIconClass(topic.type)" class="text-lg"></i>
                  <span class="font-medium">{{ topic.name }}</span>
                </div>
              </td>
              <td>{{ topic.type | titlecase }}</td>
              <td>
                <p-tag [severity]="getStatusSeverity(topic.status)" [value]="topic.status" [rounded]="true"></p-tag>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ topic.messagesPerSec }}</span>
                  <span class="text-xs text-gray-500">msg/s</span>
                </div>
              </td>
              <td>{{ topic.retention }}</td>
              <td>
                <div class="flex flex-col">
                  <span>{{ topic.partitions }}</span>
                  <span class="text-xs text-gray-500">RF: {{ topic.replicationFactor }}</span>
                </div>
              </td>
              <td>{{ topic.size }}</td>
              <td>
                <div class="flex flex-col">
                  <span>{{ topic.consumerGroups }} groups</span>
                  <span class="text-xs text-gray-500">Last active: {{ topic.lastActivity | date:'short' }}</span>
                </div>
              </td>
              <td>
                <div class="flex gap-2">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="View details"></button>
                  <button pButton icon="pi pi-chart-line" class="p-button-rounded p-button-text p-button-sm" 
                          pTooltip="View metrics"></button>
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
                  <i class="pi pi-telegram text-5xl text-gray-300 mb-4"></i>
                  <p class="text-gray-500 mb-4">No topics found matching your criteria</p>
                  <button pButton label="Add New Topic" icon="pi pi-plus" class="p-button-outlined"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-toast></p-toast>
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
export class TopicsExplorerComponent implements OnInit {
    topics: Topic[] = [];
    filteredTopics: Topic[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedTopicType: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Active', value: 'active' },
        { label: 'Warning', value: 'warning' },
        { label: 'Inactive', value: 'inactive' }
    ];

    constructor(private messageService: MessageService) { }

    ngOnInit() {
        this.loadMockData();
        this.filteredTopics = [...this.topics];
    }

    loadMockData() {
        const topicTypes = ['kafka', 'pulsar'];
        const statusOptions = ['active', 'warning', 'inactive'];
        const retentionOptions = ['7 days', '14 days', '30 days', '90 days', 'unlimited'];
        const owners = ['Data Engineering', 'Analytics Team', 'ML Ops', 'Data Science', 'Platform Team'];

        // Generate random topics
        for (let i = 1; i <= 25; i++) {
            const type = topicTypes[Math.floor(Math.random() * topicTypes.length)];
            const partitions = Math.pow(2, Math.floor(Math.random() * 6)); // 1, 2, 4, 8, 16, 32
            const replicationFactor = Math.floor(Math.random() * 2) + 1; // 1, 2, 3
            const messagesPerSec = Math.floor(Math.random() * 10000);
            const sizeGB = (Math.random() * 100).toFixed(2);
            const consumerGroups = Math.floor(Math.random() * 10) + 1;

            const lastActivity = new Date();
            lastActivity.setMinutes(lastActivity.getMinutes() - Math.floor(Math.random() * 60));

            this.topics.push({
                id: `topic-${i}`,
                name: `${type}-topic-${i}`,
                type,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'active' | 'warning' | 'inactive',
                messagesPerSec,
                retention: retentionOptions[Math.floor(Math.random() * retentionOptions.length)],
                partitions,
                replicationFactor,
                size: `${sizeGB} GB`,
                consumerGroups,
                lastActivity,
                owner: owners[Math.floor(Math.random() * owners.length)]
            });
        }
    }

    applyFilters() {
        this.filteredTopics = this.topics.filter(topic => {
            // Apply topic type filter
            if (this.selectedTopicType && topic.type !== this.selectedTopicType) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && topic.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !topic.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    filterByType(type: string | null) {
        this.selectedTopicType = type;
        this.applyFilters();
    }

    getCountByType(type: string | null): number {
        if (!type) {
            return this.topics.length;
        }
        return this.topics.filter(topic => topic.type === type).length;
    }

    getHealthByType(type: string): number {
        const typedTopics = this.topics.filter(topic => topic.type === type);
        if (typedTopics.length === 0) return 0;

        const activeCount = typedTopics.filter(topic => topic.status === 'active').length;
        const warningCount = typedTopics.filter(topic => topic.status === 'warning').length;

        // Weight active as 100%, warning as 50%
        return Math.round((activeCount + warningCount * 0.5) / typedTopics.length * 100);
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'kafka': return 'pi pi-telegram text-orange-500';
            case 'pulsar': return 'pi pi-telegram text-blue-500';
            default: return 'pi pi-telegram text-gray-500';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'warning': return 'warning';
            case 'inactive': return 'danger';
            default: return 'info';
        }
    }
}
