import { Routes } from '@angular/router';
import { TripListComponent } from './pages/trip-list/trip-list.component';
import { TripCreateComponent } from './pages/trip-create/trip-create.component';

export const travelRoutes: Routes = [
    {
        path: '',
        component: TripListComponent
    },
    {
        path: 'new',
        component: TripCreateComponent
    },
    {
        path: ':id',
        component: TripCreateComponent
    }
];
