import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface PredictionRequest {
    [key: string]: any;
}

export interface PredictionResponse {
    prediction: any;
    confidence?: number;
    metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class PredictionService {

    constructor(private api: ApiService) { }

    /**
     * Make prediction request
     */
    predict(endpoint: string, data?: PredictionRequest): Observable<ApiResponse<PredictionResponse>> {
        return this.api.post<PredictionResponse>(endpoint, data);
    }

    /**
     * ETA prediction
     */
    predictETA(data: PredictionRequest): Observable<ApiResponse<PredictionResponse>> {
        return this.predict('/routing-deviation/internal/plan/predict', data);
    }

    /**
     * Route deviation prediction
     */
    predictRouteDeviation(planId: string, params?: any): Observable<ApiResponse<any>> {
        const queryParams = params ? new URLSearchParams(params).toString() : '';
        const url = `/api/v1/route-deviation/plan/${planId}/predict${queryParams ? '?' + queryParams : ''}`;
        return this.api.post(url, null);
    }

    /**
     * Evaluation prediction
     */
    predictEvaluation(endpoint: string, data?: PredictionRequest): Observable<ApiResponse<PredictionResponse>> {
        return this.predict(endpoint, data);
    }
}