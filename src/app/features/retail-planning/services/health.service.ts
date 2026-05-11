import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface ReadinessStatus {
    redis: boolean;
    mongodb: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class HealthService {

    constructor(private api: ApiService) { }

    /**
     * Check system readiness (Redis and MongoDB)
     */
    checkReadiness(): Observable<ApiResponse<ReadinessStatus>> {
        return this.api.post<ReadinessStatus>('/routing-deviation/internal/_/readiness');
    }
}



