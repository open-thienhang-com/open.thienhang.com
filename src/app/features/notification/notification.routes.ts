import { Routes } from '@angular/router';

export const notificationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/overview/overview.component').then(m => m.NotificationOverviewComponent),
    data: { title: 'Notification Service Overview' }
  },
  {
    path: 'explorer',
    loadComponent: () => import('./pages/explorer/explorer.component').then(m => m.NotificationExplorerComponent),
    data: { title: 'Template Explorer' }
  },
  {
    path: 'composer',
    loadComponent: () => import('./pages/composer/composer.component').then(m => m.NotificationComposerComponent),
    data: { title: 'Notification Composer' }
  },
  {
    path: 'audit',
    loadComponent: () => import('./pages/audit/audit.component').then(m => m.NotificationAuditComponent),
    data: { title: 'Audit Trail' }
  },
  {
    path: 'reliability',
    loadComponent: () => import('./pages/reliability/reliability.component').then(m => m.NotificationReliabilityComponent),
    data: { title: 'Reliability & Resilience' }
  },
  {
    path: 'scheduling',
    loadComponent: () => import('./pages/scheduling/scheduling.component').then(m => m.NotificationSchedulingComponent),
    data: { title: 'Scheduling & Rate Limiting' }
  },
  {
    path: 'api',
    loadComponent: () => import('./pages/api/api.component').then(m => m.NotificationApiComponent),
    data: { title: 'API Playground' }
  },
  {
    path: 'templates/create',
    loadComponent: () => import('./pages/template-detail/template-detail.component').then(m => m.NotificationTemplateDetailComponent),
    data: { title: 'Create Template' }
  },
  {
    path: 'templates/edit/:code/:locale/:channel',
    loadComponent: () => import('./pages/template-detail/template-detail.component').then(m => m.NotificationTemplateDetailComponent),
    data: { title: 'Edit Template' }
  }
];
