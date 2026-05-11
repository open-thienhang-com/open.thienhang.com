import { Routes } from '@angular/router';

export const filesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/files-dashboard.component').then(m => m.FilesDashboardComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/files-dashboard.component').then(m => m.FilesDashboardComponent),
  },
  {
    path: 'list',
    loadComponent: () => import('./pages/list/files-list.component').then(m => m.FilesListComponent),
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/stats/files-stats.component').then(m => m.FilesStatsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
