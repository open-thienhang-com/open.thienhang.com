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
    templateUrl: './pipelines-explorer.component.html',
    styleUrl: './pipelines-explorer.component.scss'
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
