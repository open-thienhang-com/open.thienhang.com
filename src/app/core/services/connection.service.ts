import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    private online$ = new BehaviorSubject<boolean>(navigator.onLine);

    constructor(private router: Router) {
        // Monitor online/offline events
        merge(
            fromEvent(window, 'online'),
            fromEvent(window, 'offline')
        ).subscribe(() => {
            this.online$.next(navigator.onLine);
            if (!navigator.onLine) {
                this.router.navigate(['/offline']);
            }
        });
    }

    // Observable to track connection status
    isOnline(): Observable<boolean> {
        return this.online$.asObservable();
    }

    // Method to check if request timed out
    checkTimeout(error: any): boolean {
        if (error.name === 'TimeoutError' || error.status === 408) {
            this.router.navigate(['/offline']);
            return true;
        }
        return false;
    }
}
