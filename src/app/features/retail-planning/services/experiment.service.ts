import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface ExperimentModel {
    name: string;
    type?: string;
    status?: string;
    accuracy?: number;
    created_at?: string;
    updated_at?: string;
    metadata?: any;
}

export interface ExperimentResult {
    prediction: any;
    confidence?: number;
    metrics?: any;
    metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ExperimentService {

    constructor(private api: ApiService) { }

    /**
     * Get list of experiment models
     */
    getModels(params?: any): Observable<ApiResponse<ExperimentModel[]>> {
        return this.api.post<ExperimentModel[]>('/routing-deviation/internal/Virtual experiment/models', params);
    }

    /**
     * Get experiment model by name
     */
    getModel(modelName: string): Observable<ApiResponse<ExperimentModel>> {
        return this.api.post<ExperimentModel>(`/routing-deviation/internal/Virtual experiment/model/${modelName}`);
    }

    /**
     * Delete experiment model
     */
    deleteModel(modelName: string): Observable<ApiResponse<any>> {
        return this.api.delete(`/routing-deviation/internal/Virtual experiment/model/${modelName}`);
    }

    /**
     * Run demo experiment
     */
    runDemo(): Observable<ApiResponse<any>> {
        return this.api.post('/routing-deviation/internal/Virtual experiment/demo', {});
    }

    /**
     * Train experiment model
     */
    trainModel(payload: any): Observable<ApiResponse<any>> {
        return this.api.post('/routing-deviation/internal/Virtual experiment/train', payload);
    }

    /**
     * Predict using experiment model
     */
    predict(payload: any): Observable<ApiResponse<ExperimentResult>> {
        return this.api.post<ExperimentResult>('/routing-deviation/internal/Virtual experiment/predict', payload);
    }
}