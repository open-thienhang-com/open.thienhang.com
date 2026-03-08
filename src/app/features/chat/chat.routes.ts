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
    path: 'telegram-workspace',
    loadComponent: () => import('./pages/dashboard/chat-dashboard.component').then(m => m.ChatDashboardComponent),
  },
  {
    path: 'facebook-workspace',
    loadComponent: () => import('./pages/facebook-workspace/facebook-workspace.component').then(m => m.FacebookWorkspaceComponent),
  },
  {
    path: 'templates',
    loadComponent: () => import('./pages/templates/chat-templates.component').then(m => m.ChatTemplatesComponent),
  },
  {
    path: 'automation',
    loadComponent: () => import('./pages/automation/chat-automation.component').then(m => m.ChatAutomationComponent),
  },
  {
    path: 'bot-settings',
    loadComponent: () => import('./pages/bot-settings/chat-bot-settings.component').then(m => m.ChatBotSettingsComponent),
  },
  {
    path: 'delivery-health',
    loadComponent: () => import('./pages/delivery-health/chat-delivery-health.component').then(m => m.ChatDeliveryHealthComponent),
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
