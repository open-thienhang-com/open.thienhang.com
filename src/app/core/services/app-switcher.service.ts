import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppKey = 'retail' | 'catalog' | 'governance' | 'settings' | 'marketplace' | 'blogger' | 'hotel' | 'admanager' | 'all';

@Injectable({ providedIn: 'root' })
export class AppSwitcherService {
    private currentAppSubject = new BehaviorSubject<AppKey>('all');
    currentApp$ = this.currentAppSubject.asObservable();

    selectApp(key: AppKey) {
        this.currentAppSubject.next(key);
    }

    getCurrent() {
        return this.currentAppSubject.getValue();
    }
}
