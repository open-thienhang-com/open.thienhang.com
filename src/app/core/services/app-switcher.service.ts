import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppKey = 'retail' | 'inventory' | 'loyalty' | 'catalog' | 'governance' | 'planning' | 'settings' | 'blogger' | 'hotel' | 'admanager' | 'travel' | 'chat' | 'files' | 'explore' | 'notification' | 'support' | 'all' | 'auto-planning' | 'delivery-points' | 'fleet' | 'demand' | 'truck' | 'trip' | 'hub' | 'forecast' | 'orders' | 'transactions' | 'retail-sales' | 'retail-products' | 'retail-customers' | 'retail-omni' | 'retail-pos' | 'warehouse';

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
