import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Dataset {
    id: string;
    name: string;
    type: 'truck' | 'demand' | 'trip' | string;
    description?: string;
    size?: number;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    usage?: string;
    quality?: number;
    records?: number;
    cols?: number;
    metadata?: any;
    data?: any[]; // Dataset actual data rows
}

export interface DatasetListResponse {
    data: Dataset[];
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface DatasetQueryParams {
    size?: number;
    offset?: number;
    q?: string;
    type?: string;
}

export interface WarehouseQueryParams {
    region_shortname: string;
    size?: number;
    offset?: number;
    search?: string;
}

export interface Warehouse {
    id: string;
    warehouse_id?: number;
    district_id?: number;
    district_name?: string;
    is_enabled?: boolean;
    last_updated_time?: string;
    latitude?: number;
    longitude?: number;
    province_id?: number;
    province_name?: string;
    region_fullname?: string;
    region_shortname?: string;
    ward_code?: string;
    warehouse_address?: string;
    warehouse_name?: string;
    warehouse_type?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DatasetService {

    constructor(private api: ApiService) { }

    /**
     * Get list of datasets with pagination and filtering
     */
    getDatasets(params: DatasetQueryParams = {}): Observable<ApiResponse<DatasetListResponse>> {
        return this.api.post<DatasetListResponse>('/routing-deviation/internal/dataset/list', params);
    }

    /**
     * Get dataset by ID
     */
    getDataset(id: string): Observable<ApiResponse<Dataset>> {
        return this.api.post<Dataset>('/routing-deviation/internal/dataset/get', { dataset_id: id });
    }

    /**
     * Get dataset types
     */
    getDatasetTypes(): Observable<ApiResponse<any>> {
        return this.api.post('/routing-deviation/internal/dataset/get-type');
    }

    /**
     * Get dataset query options
     */
    getDatasetQuery(): Observable<ApiResponse<any>> {
        return this.api.post('/routing-deviation/internal/dataset/get-query');
    }

    /**
     * Get dataset metadata
     */
    getDatasetMetadata(): Observable<ApiResponse<any>> {
        return this.api.post('/routing-deviation/internal/dataset/get-metadata');
    }

    /**
     * Create new dataset
     */
    createDataset(payload: any): Observable<ApiResponse<Dataset>> {
        return this.api.post<Dataset>('/routing-deviation/internal/dataset', payload);
    }

    /**
     * Update existing dataset
     */
    updateDataset(id: string, payload: any): Observable<ApiResponse<Dataset>> {
        return this.api.post<Dataset>(`/routing-deviation/internal/dataset/${id}`, payload);
    }

    /**
     * Get warehouses by region with optional search and pagination
     */
    getWarehouses(params: WarehouseQueryParams): Observable<ApiResponse<Warehouse[]>> {
        return this.api.post<Warehouse[]>('/routing-deviation/internal/dataset/get-warehouses', params);
    }

    /**
     * Get demands data for warehouses
     */
    getDemands(params: { warehouse_ids: number[], from_date: string, to_date: string }): Observable<ApiResponse<{ data: any[] }>> {
        return this.api.post<{ data: any[] }>('/routing-deviation/internal/dataset/get-demands', params);
    }

    /**
     * Get demands using a time_range (DatetimeRange)
     */
    getDemandsWithTimeRange(params: { warehouse_ids: number[], time_range: { start: string, end: string } }): Observable<ApiResponse<any[]>> {
        return this.api.post<any[]>('/routing-deviation/internal/dataset/get-demands', params);
    }

    /**
     * Get demands shift ratio for given warehouses and shifts
     */
    getDemandsShiftRatio(params: { region_shortname: string, warehouse_ids?: number[], shifts: { name: string, start_hour: number, end_hour: number }[], time_range: { start: string, end: string } }): Observable<ApiResponse<any[]>> {
        return this.api.post<any[]>('/routing-deviation/internal/dataset/get-demands-shift-ratio', params);
    }

    /**
     * Get demands by days for timeline chart
     */
    getDemandsByDays(params: { warehouse_ids: number[], time_range: { start: string, end: string } }): Observable<ApiResponse<{ [date: string]: any[] }>> {
        return this.api.post<{ [date: string]: any[] }>('/routing-deviation/internal/dataset/get-demands-by-days', params);
    }
}