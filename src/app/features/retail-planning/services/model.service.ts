import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Model {
    key: string;
    name: string;
    type?: string;
    status?: string;
    accuracy?: number;
    created_at?: string;
    updated_at?: string;
    metadata?: any;
}

export interface ModelListResponse {
    data: Model[];
    meta?: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface PredictionInput {
    [key: string]: any;
}

export interface PredictionResult {
    prediction: any;
    confidence?: number;
    metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ModelService {

    constructor(private api: ApiService) { }

    /**
     * Get list of models
     */
    getModels(params?: {
        skip?: number;
        limit?: number;
        q?: string;
        type?: string;
        version?: string;
    }): Observable<ApiResponse<ModelListResponse>> {
        return this.api.post<ModelListResponse>('/routing-deviation/internal/models', params);
    }

    /**
     * Get model info by key
     */
    getModel(key: string): Observable<ApiResponse<Model>> {
        return this.api.post<Model>('/routing-deviation/internal/models/get', { key });
    }

    /**
     * Test model
     */
    testModel(key: string, testData?: any): Observable<ApiResponse<any>> {
        return this.api.post(`/routing-deviation/internal/models/${key}/test`, testData);
    }

    /**
     * Predict using model
     */
    predict(key: string, inputData: PredictionInput): Observable<ApiResponse<PredictionResult>> {
        return this.api.post<PredictionResult>(`/routing-deviation/internal/models/${key}/predict`, inputData);
    }

    /**
     * Train model
     */
    trainModel(payload: any): Observable<ApiResponse<any>> {
        return this.api.post('/routing-deviation/internal/models', payload);
    }

    /**
     * Delete model
     */
    deleteModel(key: string): Observable<ApiResponse<any>> {
        return this.api.delete(`/routing-deviation/internal/models/${key}`);
    }

    /**
     * Get model examples (sample input/output)
     */
    getModelExamples(key: string): Observable<ApiResponse<{ examples: any[] }>> {
        return this.api.post<{ examples: any[] }>('/routing-deviation/internal/models/examples', { key });
    }

    /**
     * Get model metadata
     */
    getModelMeta(key: string): Observable<ApiResponse<{ meta: any }>> {
        return this.api.post<{ meta: any }>('/routing-deviation/internal/models/meta', { key });
    }
}