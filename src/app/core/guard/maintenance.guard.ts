import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MaintenanceService } from '../services/maintenance.service';

export const maintenanceGuard = () => {
  const maintenanceService = inject(MaintenanceService);
  const router = inject(Router);

  if (maintenanceService.isMaintenanceMode()) {
    router.navigate(['/maintenance']);
    return false;
  }

  return true;
};
