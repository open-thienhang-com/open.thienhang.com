import { Routes } from '@angular/router';
import { ApartmentsComponent } from './pages/apartments/apartments.component';

export const hotelRoutes: Routes = [
  {
    path: '',
    redirectTo: 'apartments',
    pathMatch: 'full'
  },
  {
    path: 'apartments',
    component: ApartmentsComponent,
    data: { title: 'Apartments Management' }
  },
  // Additional pages will be added:
  // - apartments/:id (detail)
  // - rooms
  // - bookings
  // - reviews
  // - ratings
];
