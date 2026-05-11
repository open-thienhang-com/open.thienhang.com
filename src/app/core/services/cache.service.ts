import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

    constructor() {
        // Clean expired entries every minute
        setInterval(() => this.cleanExpiredEntries(), 60000);
    }

    // Get cached data
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if ((now - entry.timestamp) > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    // Set cached data
    set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    // Check if cache exists and is valid
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    // Delete specific cache entry
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    // Clear all cache
    clear(): void {
        this.cache.clear();
    }

    // Get cache statistics
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            ttl: this.DEFAULT_TTL / 1000 / 60 // in minutes
        };
    }

    // Clean expired entries
    private cleanExpiredEntries(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if ((now - entry.timestamp) > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    // Create cached observable
    getCachedObservable<T>(
        key: string,
        source: Observable<T>,
        ttl: number = this.DEFAULT_TTL
    ): Observable<T> {
        // Check if we have cached data
        const cachedData = this.get<T>(key);
        if (cachedData !== null) {
            return of(cachedData);
        }

        // If no cached data, fetch from source and cache the result
        return source.pipe(
            tap(data => this.set(key, data, ttl))
        );
    }
}
