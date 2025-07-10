import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { TimelineModule } from 'primeng/timeline';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';

interface LineageNode {
    id: string;
    name: string;
    type: 'source' | 'transformation' | 'destination';
    status: 'active' | 'inactive' | 'error';
    description: string;
    connections: string[];
    metadata: {
        owner: string;
        lastUpdated: Date;
        schema: string;
        records: number;
    };
}

@Component({
    selector: 'app-data-lineage',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        ChartModule,
        TimelineModule,
        BadgeModule,
        DividerModule,
        FormsModule
    ],
    template: `
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Data Lineage Explorer</h1>
              <p class="text-surface-600 dark:text-surface-400 mt-1">Trace data flow and dependencies across your mesh</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Export Lineage" icon="pi pi-download" class="p-button-outlined"></button>
              <button pButton label="Auto Layout" icon="pi pi-refresh" class="p-button-primary"></button>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-4 mb-6">
            <div class="flex-1 min-w-64">
              <input 
                pInputText 
                placeholder="Search data assets..." 
                [(ngModel)]="searchTerm"
                class="w-full">
            </div>
            <p-dropdown 
              [options]="domainOptions" 
              [(ngModel)]="selectedDomain"
              placeholder="Select Domain"
              class="w-48">
            </p-dropdown>
            <p-dropdown 
              [options]="statusOptions" 
              [(ngModel)]="selectedStatus"
              placeholder="Filter by Status"
              class="w-48">
            </p-dropdown>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <!-- Lineage Visualization -->
          <div class="xl:col-span-3">
            <p-card>
              <ng-template pTemplate="header">
                <div class="flex items-center gap-2 p-4">
                  <i class="pi pi-share-alt text-primary-500"></i>
                  <h3 class="text-lg font-semibold">Lineage Graph</h3>
                </div>
              </ng-template>
              
              <div class="lineage-container" style="height: 600px;">
                <!-- SVG Lineage Graph -->
                <svg class="w-full h-full border border-surface-200 dark:border-surface-700 rounded-lg">
                  <!-- Sample lineage visualization -->
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                            refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                  </defs>
                  
                  <!-- Nodes -->
                  <g *ngFor="let node of lineageNodes; let i = index">
                    <circle 
                      [attr.cx]="node.x" 
                      [attr.cy]="node.y" 
                      [attr.r]="30"
                      [attr.fill]="getNodeColor(node.type)"
                      [attr.stroke]="getNodeBorderColor(node.status)"
                      stroke-width="3"
                      class="cursor-pointer hover:opacity-80 transition-opacity"
                      (click)="selectNode(node)">
                    </circle>
                    <text 
                      [attr.x]="node.x" 
                      [attr.y]="node.y + 5" 
                      text-anchor="middle" 
                      class="text-xs fill-white font-medium">
                      {{node.name.substring(0, 8)}}
                    </text>
                  </g>
                  
                  <!-- Connections -->
                  <g *ngFor="let connection of connections">
                    <line 
                      [attr.x1]="connection.x1" 
                      [attr.y1]="connection.y1"
                      [attr.x2]="connection.x2" 
                      [attr.y2]="connection.y2"
                      stroke="#3b82f6" 
                      stroke-width="2"
                      marker-end="url(#arrowhead)">
                    </line>
                  </g>
                </svg>
              </div>
            </p-card>
          </div>

          <!-- Node Details -->
          <div class="xl:col-span-1">
            <p-card *ngIf="selectedNode">
              <ng-template pTemplate="header">
                <div class="flex items-center gap-2 p-4">
                  <i class="pi pi-info-circle text-primary-500"></i>
                  <h3 class="text-lg font-semibold">Node Details</h3>
                </div>
              </ng-template>
              
              <div class="space-y-4">
                <div>
                  <h4 class="font-semibold text-surface-900 dark:text-surface-50">{{selectedNode.name}}</h4>
                  <p class="text-sm text-surface-600 dark:text-surface-400">{{selectedNode.description}}</p>
                </div>

                <div class="flex items-center gap-2">
                  <p-badge 
                    [value]="selectedNode.type" 
                    [severity]="getTypeSeverity(selectedNode.type)">
                  </p-badge>
                  <p-badge 
                    [value]="selectedNode.status" 
                    [severity]="getStatusSeverity(selectedNode.status)">
                  </p-badge>
                </div>

                <p-divider></p-divider>

                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium mb-1">Owner</label>
                    <p class="text-sm text-surface-600 dark:text-surface-400">{{selectedNode.metadata.owner}}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">Schema</label>
                    <p class="text-sm text-surface-600 dark:text-surface-400">{{selectedNode.metadata.schema}}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">Records</label>
                    <p class="text-sm text-surface-600 dark:text-surface-400">{{selectedNode.metadata.records | number}}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">Last Updated</label>
                    <p class="text-sm text-surface-600 dark:text-surface-400">{{selectedNode.metadata.lastUpdated | date:'medium'}}</p>
                  </div>
                </div>

                <p-divider></p-divider>

                <div class="flex flex-col gap-2">
                  <button pButton label="View Details" icon="pi pi-eye" class="p-button-sm p-button-outlined"></button>
                  <button pButton label="Edit Metadata" icon="pi pi-pencil" class="p-button-sm p-button-text"></button>
                  <button pButton label="View Lineage" icon="pi pi-share-alt" class="p-button-sm p-button-text"></button>
                </div>
              </div>
            </p-card>

            <!-- Lineage Timeline -->
            <p-card class="mt-6">
              <ng-template pTemplate="header">
                <div class="flex items-center gap-2 p-4">
                  <i class="pi pi-clock text-primary-500"></i>
                  <h3 class="text-lg font-semibold">Change Timeline</h3>
                </div>
              </ng-template>
              
              <p-timeline [value]="timelineEvents" layout="vertical">
                <ng-template pTemplate="marker" let-event>
                  <span class="flex w-8 h-8 items-center justify-center text-white rounded-full z-10 shadow-sm"
                        [style.background-color]="event.color">
                    <i [class]="event.icon"></i>
                  </span>
                </ng-template>
                
                <ng-template pTemplate="content" let-event>
                  <div class="pl-4">
                    <h5 class="font-medium">{{event.title}}</h5>
                    <p class="text-sm text-surface-600 dark:text-surface-400 mt-1">{{event.description}}</p>
                    <small class="text-surface-500 dark:text-surface-500">{{event.date | date:'short'}}</small>
                  </div>
                </ng-template>
              </p-timeline>
            </p-card>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .lineage-container {
      position: relative;
      overflow: hidden;
    }
    
    .lineage-container svg {
      background: var(--surface-0);
    }
    
    :host ::ng-deep {
      .p-timeline-event-content {
        padding: 0.5rem 0;
      }
      
      .p-timeline-event-marker {
        border: 2px solid var(--surface-0);
      }
    }
  `]
})
export class DataLineageComponent implements OnInit {
    searchTerm = '';
    selectedDomain: any;
    selectedStatus: any;
    selectedNode: LineageNode | null = null;

    domainOptions = [
        { label: 'All Domains', value: null },
        { label: 'Customer Data', value: 'customer' },
        { label: 'Product Data', value: 'product' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'Compliance', value: 'compliance' }
    ];

    statusOptions = [
        { label: 'All Status', value: null },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Error', value: 'error' }
    ];

    lineageNodes: (LineageNode & { x: number; y: number })[] = [
        {
            id: '1',
            name: 'Customer DB',
            type: 'source',
            status: 'active',
            description: 'Primary customer database',
            connections: ['2', '3'],
            metadata: {
                owner: 'Data Team',
                lastUpdated: new Date('2024-01-15'),
                schema: 'customer_v2',
                records: 1250000
            },
            x: 100,
            y: 150
        },
        {
            id: '2',
            name: 'ETL Process',
            type: 'transformation',
            status: 'active',
            description: 'Data transformation pipeline',
            connections: ['4'],
            metadata: {
                owner: 'Engineering',
                lastUpdated: new Date('2024-01-14'),
                schema: 'transform_v1',
                records: 1200000
            },
            x: 300,
            y: 150
        },
        {
            id: '3',
            name: 'Analytics DB',
            type: 'destination',
            status: 'active',
            description: 'Analytics data warehouse',
            connections: [],
            metadata: {
                owner: 'Analytics Team',
                lastUpdated: new Date('2024-01-15'),
                schema: 'analytics_v3',
                records: 1180000
            },
            x: 500,
            y: 100
        },
        {
            id: '4',
            name: 'Reporting',
            type: 'destination',
            status: 'active',
            description: 'Business reporting system',
            connections: [],
            metadata: {
                owner: 'Business Team',
                lastUpdated: new Date('2024-01-15'),
                schema: 'reports_v1',
                records: 850000
            },
            x: 500,
            y: 200
        }
    ];

    connections = [
        { x1: 130, y1: 150, x2: 270, y2: 150 },
        { x1: 330, y1: 150, x2: 470, y2: 200 },
        { x1: 120, y1: 135, x2: 480, y2: 115 }
    ];

    timelineEvents = [
        {
            title: 'Schema Updated',
            description: 'Customer schema updated to v2.1',
            date: new Date('2024-01-15'),
            icon: 'pi pi-database',
            color: '#3b82f6'
        },
        {
            title: 'Pipeline Modified',
            description: 'ETL pipeline optimization deployed',
            date: new Date('2024-01-14'),
            icon: 'pi pi-cog',
            color: '#10b981'
        },
        {
            title: 'Data Quality Check',
            description: 'Automated quality validation passed',
            date: new Date('2024-01-13'),
            icon: 'pi pi-check-circle',
            color: '#8b5cf6'
        }
    ];

    ngOnInit() {
        this.selectedNode = this.lineageNodes[0];
    }

    selectNode(node: LineageNode & { x: number; y: number }) {
        this.selectedNode = node;
    }

    getNodeColor(type: string): string {
        switch (type) {
            case 'source': return '#3b82f6';
            case 'transformation': return '#10b981';
            case 'destination': return '#8b5cf6';
            default: return '#6b7280';
        }
    }

    getNodeBorderColor(status: string): string {
        switch (status) {
            case 'active': return '#10b981';
            case 'inactive': return '#6b7280';
            case 'error': return '#ef4444';
            default: return '#6b7280';
        }
    }

    getTypeSeverity(type: string): string {
        switch (type) {
            case 'source': return 'info';
            case 'transformation': return 'success';
            case 'destination': return 'warning';
            default: return 'secondary';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'secondary';
            case 'error': return 'danger';
            default: return 'secondary';
        }
    }
}
