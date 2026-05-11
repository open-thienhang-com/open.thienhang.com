import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private maintenanceModeSubject = new BehaviorSubject<boolean>(false);
  private readonly MAINTENANCE_KEY = 'maintenanceMode';

  constructor() {
    // Check maintenance mode from localStorage
    // Default: OFF (false) - app runs normally
    const maintenanceModeSetting = localStorage.getItem(this.MAINTENANCE_KEY);
    const isMaintenanceMode = maintenanceModeSetting === 'true';
    this.maintenanceModeSubject.next(isMaintenanceMode);
  }

  /**
   * Enable maintenance mode
   */
  enableMaintenanceMode(): void {
    localStorage.setItem(this.MAINTENANCE_KEY, 'true');
    this.maintenanceModeSubject.next(true);
  }

  /**
   * Disable maintenance mode
   */
  disableMaintenanceMode(): void {
    localStorage.removeItem(this.MAINTENANCE_KEY);
    this.maintenanceModeSubject.next(false);
  }

  /**
   * Check if maintenance mode is currently enabled
   */
  isMaintenanceMode(): boolean {
    return this.maintenanceModeSubject.value;
  }

  /**
   * Observable to watch maintenance mode changes
   */
  maintenanceMode$(): Observable<boolean> {
    return this.maintenanceModeSubject.asObservable();
  }

  /**
   * Toggle maintenance mode
   */
  toggleMaintenanceMode(): void {
    if (this.isMaintenanceMode()) {
      this.disableMaintenanceMode();
    } else {
      this.enableMaintenanceMode();
    }
  }
}
