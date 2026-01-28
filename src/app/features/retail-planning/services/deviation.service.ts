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

export interface ShortPlan {
    id: string;
    name?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Journey {
    id: string;
    plan_id: string;
    vehicle_id: string;
    start_time?: string;
    end_time?: string;
    distance?: number;
    duration?: number;
    stops?: any[];
    metadata?: any;
}

export interface PlanListResponse {
    data: ShortPlan[];
    meta?: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface ImportPlanResponse {
    data: Plan;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class DeviationService {

    constructor(private api: ApiService) { }

    /**
     * Import plan from Excel file
     */
    importPlan(file: File, name?: string): Observable<ApiResponse<Plan>> {
        const formData = new FormData();
        formData.append('file', file);
        if (name) {
            formData.append('name', name);
        }

        return this.api.upload<Plan>('/routing-deviation/import', formData);
    }

    /**
     * Get list of plans
     */
    getPlans(params?: { limit?: number; offset?: number }): Observable<ApiResponse<PlanListResponse>> {
        return this.api.post<PlanListResponse>('/routing-deviation/plans', params || {});
    }

    /**
     * Get plan details by ID
     */
    getPlan(planId: string): Observable<ApiResponse<Plan>> {
        return this.api.post<Plan>(`/routing-deviation/plans/${planId}`);
    }

    /**
     * Delete a plan
     */
    deletePlan(planId: string): Observable<ApiResponse<any>> {
        return this.api.delete(`/routing-deviation/plans/${planId}`);
    }

    /**
     * Get journeys for a plan
     */
    getJourneys(planId: string): Observable<ApiResponse<{ journeys: Journey[] }>> {
        return this.api.post(`/routing-deviation/plans/${planId}/journeys`);
    }

    /**
     * Evaluate plan performance
     */
    evaluatePlan(planId: string, criteria?: any): Observable<ApiResponse<any>> {
        return this.api.post(`/routing-deviation/plans/${planId}/evaluate`, criteria);
    }

    /**
     * Generate optimized routes for a plan
     */
    optimizePlan(planId: string, options?: any): Observable<ApiResponse<Plan>> {
        return this.api.post(`/routing-deviation/plans/${planId}/optimize`, options);
    }
}