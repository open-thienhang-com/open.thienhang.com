import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge, timer, of } from 'rxjs';
import { map, switchMap, catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    private online$ = new BehaviorSubject<boolean>(navigator.onLine);
    private apiAvailable$ = new BehaviorSubject<boolean>(true);
    private readonly API_BASE_URL = 'https://api.thienhang.com';

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.initializeConnectionMonitoring();
        this.initializeApiHealthCheck();
    }

    private initializeConnectionMonitoring(): void {
        // Monitor online/offline events
        merge(
            fromEvent(window, 'online'),
            fromEvent(window, 'offline')
        ).subscribe(() => {
            this.online$.next(navigator.onLine);
            if (!navigator.onLine) {
                this.router.navigate(['/maintenance']);
            } else {
                // When back online, check API health
                this.checkApiHealth();
            }
        });
    }

    private initializeApiHealthCheck(): void {
        // Check API health every 30 seconds
        timer(0, 30000).pipe(
            switchMap(() => this.checkApiHealth())
        ).subscribe();
    }

    private checkApiHealth(): Observable<boolean> {
        return this.http.get(`${this.API_BASE_URL}/health`, { 
            headers: { 'Cache-Control': 'no-cache' }
        }).pipe(
            timeout(5000), // 5 second timeout
            map(() => {
                this.apiAvailable$.next(true);
                return true;
            }),
            catchError(() => {
                this.apiAvailable$.next(false);
                if (this.router.url !== '/maintenance') {
                    this.router.navigate(['/maintenance']);
                }
                return of(false);
            })
        );
    }

    // Observable to track internet connection status
    isOnline(): Observable<boolean> {
        return this.online$.asObservable();
    }

    // Observable to track API availability
    isApiAvailable(): Observable<boolean> {
        return this.apiAvailable$.asObservable();
    }

    // Method to manually check API health
    checkApiStatus(): void {
        this.checkApiHealth().subscribe();
    }

    // Method to check if request timed out
    checkTimeout(error: any): boolean {
        if (error.name === 'TimeoutError' || error.status === 408) {
            this.router.navigate(['/maintenance']);
            return true;
        }
        return false;
    }

    // Method to handle network errors
    handleNetworkError(error: any): boolean {
        if (error.status === 0 || error.status === 504 || error.status === 502) {
            this.apiAvailable$.next(false);
            this.router.navigate(['/maintenance']);
            return true;
        }
        return false;
    }
}
