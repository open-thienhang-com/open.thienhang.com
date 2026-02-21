import { Routes } from '@angular/router';

export const chatRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/chat-dashboard.component').then(m => m.ChatDashboardComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/chat-dashboard.component').then(m => m.ChatDashboardComponent),
  },
  {
    path: 'conversations',
    loadComponent: () => import('./pages/conversations/chat-conversations.component').then(m => m.ChatConversationsComponent),
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/chat-analytics.component').then(m => m.ChatAnalyticsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
