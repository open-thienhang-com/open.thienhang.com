import { Routes } from '@angular/router';

export const LOYALTY_ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { 
                path: 'overview', 
                loadComponent: () => import('./pages/overview/overview.component').then(m => m.LoyaltyOverviewComponent) 
            },
            { 
                path: 'members', 
                loadComponent: () => import('./pages/members/members.component').then(m => m.MembersComponent) 
            },
            { 
                path: 'channels', 
                loadComponent: () => import('./pages/channels/channels.component').then(m => m.ChannelsComponent) 
            },
            { 
                path: 'rewards', 
                loadComponent: () => import('./pages/rewards/rewards.component').then(m => m.RewardsComponent) 
            },
            { 
                path: 'campaigns', 
                loadComponent: () => import('./pages/campaigns/campaigns.component').then(m => m.CampaignsComponent) 
            }
        ]
    }
];
