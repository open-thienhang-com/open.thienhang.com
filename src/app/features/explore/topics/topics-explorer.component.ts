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
    templateUrl: './topics-explorer.component.html',
    styleUrl: './topics-explorer.component.scss'
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
