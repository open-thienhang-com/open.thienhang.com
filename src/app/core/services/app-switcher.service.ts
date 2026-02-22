import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppKey = 'retail' | 'loyalty' | 'catalog' | 'governance' | 'planning' | 'settings' | 'blogger' | 'hotel' | 'admanager' | 'travel' | 'chat' | 'files' | 'explore' | 'all';

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
