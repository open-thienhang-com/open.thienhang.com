import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Plan {
    id: string;
    name?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    data?: any;
    shifts?: any[];
    vehicles?: any[];
    demands?: any[];
}

export interface PlanListResponse {
    data: Plan[];
    meta?: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface CreatePlanParams {
    plan_id?: string;
    size?: number;
    offset?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PlanService {

    constructor(private api: ApiService) { }

    /**
     * Get plan by ID
     */
    getPlan(planId: string): Observable<ApiResponse<Plan>> {
        return this.api.post<Plan>('/routing-deviation/internal/get', { plan_id: planId });
    }

    /**
     * Get list of plans
     */
    getPlans(params?: { limit?: number; offset?: number }): Observable<ApiResponse<PlanListResponse>> {
        return this.api.post<PlanListResponse>('/routing-deviation/internal/plans', params || {});
    }

    /**
     * Create new plan
     */
    createPlan(planData: any): Observable<ApiResponse<Plan>> {
        return this.api.post<Plan>('/routing-deviation/internal/plans', planData);
    }

    /**
     * Upload plan file
     */
    uploadPlan(formData: FormData): Observable<ApiResponse<any>> {
        return this.api.upload('/routing-deviation/internal/import', formData);
    }

    /**
     * Delete plan
     */
    deletePlan(planId: string): Observable<ApiResponse<any>> {
        return this.api.post('/routing-deviation/internal/delete', { plan_id: planId });
    }

    /**
     * Predict plan performance
     */
    predictPlan(planId: string, params?: any): Observable<ApiResponse<any>> {
        const queryParams = params ? new URLSearchParams(params).toString() : '';
        const url = `/api/v1/route-deviation/plan/${planId}/predict${queryParams ? '?' + queryParams : ''}`;
        return this.api.post(url, null);
    }
}