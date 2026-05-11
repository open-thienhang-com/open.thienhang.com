import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatasetService, Dataset } from '../../../services/dataset.service';

@Component({
    selector: 'app-dataset-detail-base',
    standalone: true,
    imports: [CommonModule],
    template: '',
    styleUrls: []
})
export class DatasetDetailBaseComponent implements OnInit, OnDestroy {
    @Input() dataset: Dataset | null = null;
    @Input() loading = false;
    @Input() error: string | null = null;

    @Output() goBack = new EventEmitter<void>();

    private routeSub: Subscription | null = null;
    private datasetSub: Subscription | null = null;

    constructor(
        protected location: Location,
        protected route: ActivatedRoute,
        protected datasetService: DatasetService
    ) { }

    ngOnInit(): void {
        // If dataset is not provided via @Input, try to load from route
        if (!this.dataset) {
            this.routeSub = this.route.params.subscribe(params => {
                const datasetId = params['id'];
                if (datasetId) {
                    this.loadDataset(datasetId);
                } else {
                    this.error = 'Dataset ID not found';
                    this.loading = false;
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
        if (this.datasetSub) {
            this.datasetSub.unsubscribe();
        }
    }

    private loadDataset(id: string): void {
        this.loading = true;
        this.error = null;

        this.datasetSub = this.datasetService.getDataset(id).subscribe({
            next: (response) => {
                if (response.ok && response.data) {
                    this.dataset = response.data;
                } else {
                    this.error = 'Failed to load dataset';
                }
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading dataset:', err);
                this.error = 'Failed to load dataset';
                this.loading = false;
            }
        });
    }

    protected getDatasetTypeLabel(type?: string): string {
        switch (type) {
            case 'demand': return 'Demand Dataset';
            case 'truck': return 'Truck Dataset';
            case 'hub': return 'Hub Dataset';
            default: return 'Dataset';
        }
    }

    protected formatCellValue(value: any, key: string): string {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'number') {
            // Format numbers with commas and reasonable decimal places
            if (key.toLowerCase().includes('count') || key.toLowerCase().includes('total')) {
                return value.toLocaleString('vi-VN');
            }
            return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
        }
        return String(value);
    }

    protected getDataKeys(data: any): string[] {
        if (!data || typeof data !== 'object') return [];
        return Object.keys(data);
    }

    onGoBack(): void {
        this.goBack.emit();
    }
}