import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface ETLHealthStatus {
    status: 'healthy' | 'degraded' | 'unavailable';
    scheduler_running: boolean;
    scheduled_jobs_count: number;
    running_jobs_count: number;
}

export interface ETLJobStatus {
    job_id?: string;
    status: string;
    message?: string;
    details?: any;
}

export interface ETLJob {
    id: string;
    name: string;
    status: 'running' | 'completed' | 'failed' | 'scheduled';
    start_time?: string;
    end_time?: string;
    duration?: number;
    error_message?: string;
    metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ETLService {

    constructor(private api: ApiService) { }

    /**
     * Get ETL service health status
     */
    getHealth(): Observable<ApiResponse<ETLHealthStatus>> {
        return this.api.post<ETLHealthStatus>('/routing-deviation/internal/api/etl/health');
    }

    /**
     * Get ETL status and job information
     */
    getStatus(jobId?: string): Observable<ApiResponse<ETLJobStatus>> {
        const params = jobId ? { job_id: jobId } : {};
        return this.api.post<ETLJobStatus>('/routing-deviation/internal/api/etl/status', params);
    }

    /**
     * Get list of ETL jobs
     */
    getJobs(params?: { limit?: number; offset?: number; status?: string }): Observable<ApiResponse<{ jobs: ETLJob[]; total: number }>> {
        return this.api.post<{ jobs: ETLJob[]; total: number }>('/routing-deviation/internal/api/etl/jobs', params || {});
    }

    /**
     * Trigger an ETL job manually
     */
    triggerJob(jobId: string): Observable<ApiResponse<{ status: string; job_id: string; message: string }>> {
        return this.api.post<{ status: string; job_id: string; message: string }>(`/routing-deviation/internal/api/etl/trigger/${jobId}`);
    }

    /**
     * Get detailed status of a specific job
     */
    getJobStatus(jobId: string): Observable<ApiResponse<ETLJobStatus>> {
        return this.api.post<ETLJobStatus>(`/routing-deviation/internal/api/etl/jobs/${jobId}/status`);
    }

    /**
     * Start an ETL job manually
     */
    startJob(jobName: string, params?: any): Observable<ApiResponse<{ job_id: string }>> {
        return this.api.post('/routing-deviation/internal/api/etl/jobs/start', { job_name: jobName, params });
    }

    /**
     * Stop a running ETL job
     */
    stopJob(jobId: string): Observable<ApiResponse<any>> {
        return this.api.post(`/routing-deviation/internal/api/etl/jobs/${jobId}/stop`);
    }

    /**
     * Get ETL job logs
     */
    getJobLogs(jobId: string, params?: { limit?: number; offset?: number }): Observable<ApiResponse<{ logs: string[]; total: number }>> {
        return this.api.get(`/routing-deviation/internal/api/etl/jobs/${jobId}/logs`, params);
    }
}