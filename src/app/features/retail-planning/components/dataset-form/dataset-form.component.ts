import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetService } from '../../services/dataset.service';

interface DatasetType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  sql_template: string;
  parameters: QueryParameter[];
}

interface QueryParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'select';
  label: string;
  required: boolean;
  default_value?: any;
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-dataset-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './dataset-form.component.html',
  styleUrl: './dataset-form.component.css',
})
export class DatasetFormComponent implements OnInit, OnDestroy {
  datasetId: string | null = null;
  isEditMode = false;

  // Form data
  formData = {
    type: '',
    name: '',
    description: '',
    created_by: '',
    version: 'v1',
    usage: '',
    records: 0,
    cols: 0,
    quality: 0
  };

  // UI state
  loading = false;
  saving = false;
  error: string | null = null;

  // Dataset types
  datasetTypes: DatasetType[] = [
    { id: 'truck', name: 'Truck', description: 'Dữ liệu về xe tải và phương tiện', icon: 'truck' },
    { id: 'demand', name: 'Demand', description: 'Dữ liệu về nhu cầu giao nhận', icon: 'demand' },
    { id: 'trip', name: 'Trip', description: 'Dữ liệu về các chuyến vận chuyển', icon: 'trip' }
  ];

  // Query template state
  showQuerySection = false;
  queryTemplates: QueryTemplate[] = [];
  selectedQueryTemplate: QueryTemplate | null = null;
  queryParameters: { [key: string]: any } = {};
  generatedSql = '';
  showSqlPreview = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datasetService: DatasetService
  ) { }

  ngOnInit(): void {
    this.datasetId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.datasetId;

    if (this.isEditMode && this.datasetId) {
      this.loadDatasetForEdit();
    }
  }

  ngOnDestroy(): void { }

  loadDatasetForEdit(): void {
    if (!this.datasetId) return;

    this.loading = true;
    this.datasetService.getDataset(this.datasetId).subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          const dataset = response.data;
          this.formData = {
            type: dataset.type || '',
            name: dataset.name || '',
            description: dataset.description || '',
            created_by: dataset.created_by || '',
            version: 'v1', // Default for edit
            usage: dataset.usage || '',
            records: dataset.records || 0,
            cols: dataset.cols || 0,
            quality: dataset.quality || 0
          };
        } else {
          this.error = 'Không thể tải dataset để chỉnh sửa';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Lỗi khi tải dataset';
        this.loading = false;
      }
    });
  }

  onTypeSelect(typeId: string): void {
    this.formData.type = typeId;
    this.showQuerySection = true;
    this.loadQueryTemplates(typeId);
  }

  loadQueryTemplates(typeId: string): void {
    // In a real implementation, this would call the API
    // For now, we'll simulate some templates
    this.queryTemplates = [
      {
        id: 'truck_fleet_master',
        name: 'Truck Fleet Master Data',
        description: 'Dữ liệu master về đội xe theo bưu cục',
        sql_template: 'SELECT * FROM truck_fleet WHERE warehouse_id = {{warehouse_id}}',
        parameters: [
          {
            name: 'warehouse_id',
            type: 'string',
            label: 'Mã bưu cục',
            required: true,
            default_value: ''
          }
        ]
      },
      {
        id: 'demand_summary',
        name: 'Demand Summary',
        description: 'Tóm tắt nhu cầu giao nhận theo ngày',
        sql_template: 'SELECT date, SUM(pick_orders) as pick_total, SUM(deliver_orders) as deliver_total FROM demand WHERE date BETWEEN {{start_date}} AND {{end_date}} GROUP BY date',
        parameters: [
          {
            name: 'start_date',
            type: 'date',
            label: 'Ngày bắt đầu',
            required: true
          },
          {
            name: 'end_date',
            type: 'date',
            label: 'Ngày kết thúc',
            required: true
          }
        ]
      }
    ];
  }

  onQueryTemplateSelect(templateId: string): void {
    this.selectedQueryTemplate = this.queryTemplates.find(t => t.id === templateId) || null;
    if (this.selectedQueryTemplate) {
      // Initialize parameters with default values
      this.queryParameters = {};
      this.selectedQueryTemplate.parameters.forEach(param => {
        this.queryParameters[param.name] = param.default_value || '';
      });
      this.updateSqlPreview();
    }
  }

  onParameterChange(): void {
    this.updateSqlPreview();
  }

  updateSqlPreview(): void {
    if (!this.selectedQueryTemplate) return;

    let sql = this.selectedQueryTemplate.sql_template;
    Object.keys(this.queryParameters).forEach(key => {
      const value = this.queryParameters[key];
      const placeholder = `{{${key}}}`;
      sql = sql.replace(new RegExp(placeholder, 'g'), value ? `'${value}'` : 'NULL');
    });

    this.generatedSql = sql;
    this.showSqlPreview = true;
  }

  copySqlToClipboard(): void {
    if (this.generatedSql) {
      navigator.clipboard.writeText(this.generatedSql);
      // Could show a toast notification here
    }
  }

  onSave(): void {
    if (!this.isFormValid()) return;

    this.saving = true;
    this.error = null;

    const payload = {
      ...this.formData,
      query_template: this.selectedQueryTemplate?.id,
      parameters: this.queryParameters,
      generated_sql: this.generatedSql
    };

    const saveOperation = this.isEditMode && this.datasetId
      ? this.datasetService.updateDataset(this.datasetId, payload)
      : this.datasetService.createDataset(payload);

    saveOperation.subscribe({
      next: (response: any) => {
        if (response.ok) {
          this.router.navigate(['/datasets'], {
            queryParams: { success: this.isEditMode ? 'updated' : 'created' }
          });
        } else {
          this.error = response.data?.message || 'Lỗi khi lưu dataset';
        }
        this.saving = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Lỗi khi lưu dataset';
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/datasets']);
  }

  isFormValid(): boolean {
    return !!(
      this.formData.type &&
      this.formData.name.trim() &&
      (!this.showQuerySection || this.selectedQueryTemplate) &&
      this.areParametersValid()
    );
  }

  areParametersValid(): boolean {
    if (!this.selectedQueryTemplate) return true;

    return this.selectedQueryTemplate.parameters.every(param => {
      const value = this.queryParameters[param.name];
      return !param.required || (value !== null && value !== undefined && value !== '');
    });
  }

  getTypeIcon(typeId: string): string {
    const type = this.datasetTypes.find(t => t.id === typeId);
    return type?.icon || 'default';
  }

  getTypeDescription(typeId: string): string {
    const type = this.datasetTypes.find(t => t.id === typeId);
    return type?.description || '';
  }
}
