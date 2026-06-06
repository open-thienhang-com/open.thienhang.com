import { Routes } from '@angular/router';

// Public module — no auth guard.
export const MAP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'address-extraction',
    pathMatch: 'full',
  },
  {
    path: 'address-extraction',
    loadComponent: () => import('./address-extraction/address-extraction.component').then(m => m.AddressExtractionComponent),
  },
];
