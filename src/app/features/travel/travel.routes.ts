import { Routes } from '@angular/router';
import { TripListComponent } from './pages/trip-list/trip-list.component';
import { TripDetailComponent } from './pages/trip-detail/trip-detail.component';

export const travelRoutes: Routes = [
    {
        path: '',
        component: TripListComponent
    },
    {
        path: ':id',
        component: TripDetailComponent
    }
];
