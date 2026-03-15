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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { RouterModule } from '@angular/router';

interface MLModel {
    id: string;
    name: string;
    type: string;
    framework: string;
    version: string;
    status: 'production' | 'staging' | 'development' | 'archived';
    accuracy: number;
    f1Score: number;
    lastTrained: Date;
    lastDeployed: Date | null;
    owner: string;
    inputs: number;
    outputs: number;
    tags: string[];
    size: string;
}

@Component({
    selector: 'app-ml-models-explorer',
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
        ToastModule,
        RadioButtonModule,
        TabViewModule,
        RouterModule
    ],
    providers: [MessageService],
    templateUrl: './ml-models-explorer.component.html',
    styleUrl: './ml-models-explorer.component.scss'
})
export class MLModelsExplorerComponent implements OnInit {
    models: MLModel[] = [];
    filteredModels: MLModel[] = [];

    searchQuery = '';
    selectedStatus: string | null = null;
    selectedModelType: string | null = null;
    selectedFramework: string | null = null;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Production', value: 'production' },
        { label: 'Staging', value: 'staging' },
        { label: 'Development', value: 'development' },
        { label: 'Archived', value: 'archived' }
    ];

    frameworkOptions = [
        { label: 'All Frameworks', value: null },
        { label: 'TensorFlow', value: 'TensorFlow' },
        { label: 'PyTorch', value: 'PyTorch' },
        { label: 'Scikit-learn', value: 'Scikit-learn' },
        { label: 'Hugging Face', value: 'Hugging Face' },
        { label: 'XGBoost', value: 'XGBoost' }
    ];

    chartData: any;
    chartOptions: any;
    pieData: any;
    pieOptions: any;

    constructor(private messageService: MessageService) { }

    ngOnInit() {
        this.loadMockData();
        this.filteredModels = [...this.models];
        this.prepareChartData();
    }

    loadMockData() {
        const modelTypes = ['classification', 'regression', 'clustering', 'nlp'];
        const frameworks = ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face', 'XGBoost'];
        const statusOptions = ['production', 'staging', 'development', 'archived'];
        const owners = ['Data Science', 'ML Ops', 'Analytics Team', 'Research'];

        // Generate random models
        for (let i = 1; i <= 30; i++) {
            const type = modelTypes[Math.floor(Math.random() * modelTypes.length)];
            const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
            const version = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'production' | 'staging' | 'development' | 'archived';

            const accuracy = Math.floor(Math.random() * 30) + 70; // 70-99%
            const f1Score = (Math.random() * 0.3 + 0.7).toFixed(2); // 0.70-0.99

            const lastTrained = new Date();
            lastTrained.setDate(lastTrained.getDate() - Math.floor(Math.random() * 90));

            let lastDeployed: Date | null = null;
            if (status === 'production' || status === 'staging') {
                lastDeployed = new Date(lastTrained);
                lastDeployed.setDate(lastDeployed.getDate() + Math.floor(Math.random() * 7) + 1);
            }

            const inputs = Math.floor(Math.random() * 100) + 1;
            const outputs = Math.floor(Math.random() * 10) + 1;

            const sizeMB = Math.floor(Math.random() * 1000) + 1;

            this.models.push({
                id: `model-${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)}-Model-${i}`,
                type,
                framework,
                version,
                status,
                accuracy,
                f1Score: parseFloat(f1Score),
                lastTrained,
                lastDeployed,
                owner: owners[Math.floor(Math.random() * owners.length)],
                inputs,
                outputs,
                tags: this.getRandomTags(),
                size: `${sizeMB} MB`
            });
        }
    }

    getRandomTags(): string[] {
        const allTags = ['classification', 'regression', 'nlp', 'production', 'experimental', 'high-accuracy', 'low-latency', 'ensemble'];
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

    prepareChartData() {
        // Framework distribution chart
        const frameworkCounts: { [key: string]: number } = {};
        this.models.forEach(model => {
            frameworkCounts[model.framework] = (frameworkCounts[model.framework] || 0) + 1;
        });

        this.chartData = {
            labels: Object.keys(frameworkCounts),
            datasets: [
                {
                    label: 'Number of Models',
                    data: Object.values(frameworkCounts),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            maintainAspectRatio: false
        };

        // Status distribution pie chart
        const statusCounts: { [key: string]: number } = {};
        this.models.forEach(model => {
            statusCounts[model.status] = (statusCounts[model.status] || 0) + 1;
        });

        this.pieData = {
            labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
            datasets: [
                {
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    hoverBackgroundColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ]
                }
            ]
        };

        this.pieOptions = {
            plugins: {
                legend: {
                    position: 'right'
                }
            },
            maintainAspectRatio: false
        };
    }

    applyFilters() {
        this.filteredModels = this.models.filter(model => {
            // Apply model type filter
            if (this.selectedModelType && model.type !== this.selectedModelType) {
                return false;
            }

            // Apply framework filter
            if (this.selectedFramework && model.framework !== this.selectedFramework) {
                return false;
            }

            // Apply status filter
            if (this.selectedStatus && model.status !== this.selectedStatus) {
                return false;
            }

            // Apply search filter
            if (this.searchQuery && !model.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    filterByType(type: string | null) {
        this.selectedModelType = type;
        this.applyFilters();
    }

    getCountByType(type: string | null): number {
        if (!type) {
            return this.models.length;
        }
        return this.models.filter(model => model.type === type).length;
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'classification': return 'pi pi-chart-line text-blue-500';
            case 'regression': return 'pi pi-chart-line text-green-500';
            case 'clustering': return 'pi pi-chart-line text-purple-500';
            case 'nlp': return 'pi pi-chart-line text-red-500';
            default: return 'pi pi-chart-line text-gray-500';
        }
    }

    getStatusSeverity(status: string): string {
        switch (status) {
            case 'production': return 'success';
            case 'staging': return 'warning';
            case 'development': return 'info';
            case 'archived': return 'danger';
            default: return 'info';
        }
    }
}
