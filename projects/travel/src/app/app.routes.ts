import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'journeys',
    loadComponent: () =>
      import('./features/journeys/pages/journey-list/journey-list.component').then((m) => m.JourneyListComponent),
  },
  {
    path: 'journeys/:id',
    loadComponent: () =>
      import('./features/journeys/pages/journey-detail/journey-detail.component').then(
        (m) => m.JourneyDetailComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
