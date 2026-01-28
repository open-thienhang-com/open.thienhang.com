import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface SyncRequest {
    collection_name: string;
    trino_query?: string;
    domain?: string;
    query_name?: string;
    query_params?: Record<string, any>;
    unique_key?: string;
    batch_size?: number;
    dry_run?: boolean;
}

export interface IncrementalSyncRequest {
    collection_name: string;
    trino_query: string;
    unique_key?: string;
    last_sync_time?: string;
    batch_size?: number;
}

export interface SyncStatus {
    collection_name: string;
    last_sync?: {
        last_sync_time: string;
        records_synced: number;
        records_failed: number;
        status: string;
    } | null;
    message?: string;
}

export interface SyncHistory {
    collection_name: string;
    sync_count: number;
    syncs: Array<{
        last_sync_time: string;
        records_synced: number;
        records_failed: number;
        status: string;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class SyncService {

    constructor(private api: ApiService) { }

    /**
     * Trigger a full data synchronization from Trino to MongoDB
     */
    triggerFullSync(request: SyncRequest): Observable<ApiResponse<any>> {
        return this.api.post<any>('/routing-deviation/internal/api/sync/full', request);
    }

    /**
     * Trigger incremental synchronization
     */
    triggerIncrementalSync(request: IncrementalSyncRequest): Observable<ApiResponse<any>> {
        return this.api.post<any>('/routing-deviation/internal/api/sync/incremental', request);
    }

    /**
     * Get sync status for a collection
     */
    getSyncStatus(collectionName: string): Observable<ApiResponse<SyncStatus>> {
        return this.api.get<SyncStatus>(`/routing-deviation/internal/api/sync/status/${collectionName}`);
    }

    /**
     * Get sync history for a collection
     */
    getSyncHistory(collectionName: string, limit: number = 10): Observable<ApiResponse<SyncHistory>> {
        return this.api.get<SyncHistory>(`/routing-deviation/internal/api/sync/history/${collectionName}`, { limit });
    }

    /**
     * Health check for sync service
     */
    getHealth(): Observable<ApiResponse<{ status: string; service: string }>> {
        return this.api.get<{ status: string; service: string }>('/routing-deviation/internal/api/sync/health');
    }
}

