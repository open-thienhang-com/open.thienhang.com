import { Routes } from '@angular/router';
import { TripListComponent } from './pages/trip-list/trip-list.component';
import { TripCreateComponent } from './pages/trip-create/trip-create.component';
import { TripDetailComponent } from './pages/trip-detail/trip-detail.component';
import { TravelAnalyticsDashboardComponent } from './pages/travel-analytics-dashboard/travel-analytics-dashboard.component';

export const travelRoutes: Routes = [
    {
        path: '',
        component: TripListComponent
    },
    {
        path: 'analytics',
        component: TravelAnalyticsDashboardComponent
    },
    {
        path: 'new',
        component: TripCreateComponent
    },
    {
        path: ':id',
        component: TripDetailComponent
    }
];
