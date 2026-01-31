import { Routes } from '@angular/router';

export const hotelRoutes: Routes = [
  {
    path: '',
    redirectTo: 'apartments',
    pathMatch: 'full'
  },
  {
    path: 'apartments',
    loadComponent: () => import('./pages/apartments/apartments.component').then(m => m.ApartmentsComponent),
    data: { title: 'Apartments Management' }
  },
  {
    path: 'apartments/:id',
    loadComponent: () => import('./pages/apartments/apartment-detail/apartment-detail.component').then(m => m.ApartmentDetailComponent),
    data: { title: 'Apartment Details' }
  },
  {
    path: 'bookings',
    loadComponent: () => import('./pages/bookings/bookings.component').then(m => m.BookingsComponent),
    data: { title: 'Bookings Management' }
  },
  {
    path: 'rooms',
    loadComponent: () => import('./pages/rooms/rooms.component').then(m => m.RoomsComponent),
    data: { title: 'Rooms Management' }
  },
  {
    path: 'reviews',
    loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent),
    data: { title: 'Reviews Management' }
  },
  {
    path: 'ratings',
    loadComponent: () => import('./pages/ratings/ratings.component').then(m => m.RatingsComponent),
    data: { title: 'Ratings Management' }
  },
  {
    path: 'calendar',
    loadComponent: () => import('./pages/calendar/calendar.component').then(m => m.CalendarComponent),
    data: { title: 'Booking Calendar' }
  },
  {
    path: 'checkin',
    loadComponent: () => import('./pages/checkin/checkin.component').then(m => m.CheckinComponent),
    data: { title: 'Check-in Management' }
  },
  {
    path: 'guests',
    loadComponent: () => import('./pages/guests/guests.component').then(m => m.GuestsComponent),
    data: { title: 'Guests Management' }
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent),
    data: { title: 'Support Management' }
  },
  {
    path: 'analytics',
    children: [
      {
        path: 'revenue',
        loadComponent: () => import('./pages/analytics/revenue/revenue.component').then(m => m.RevenueComponent),
        data: { title: 'Revenue Analytics' }
      },
      {
        path: 'occupancy',
        loadComponent: () => import('./pages/analytics/occupancy/occupancy.component').then(m => m.OccupancyComponent),
        data: { title: 'Occupancy Analytics' }
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/analytics/customers/customers.component').then(m => m.CustomersComponent),
        data: { title: 'Customer Analytics' }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/analytics/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { title: 'Analytics Dashboard' }
      }
    ]
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./pages/maintenance/maintenance.component').then(m => m.MaintenanceComponent),
    data: { title: 'Maintenance Management' }
  },
  {
    path: 'inventory',
    loadComponent: () => import('./pages/inventory/inventory.component').then(m => m.InventoryComponent),
    data: { title: 'Inventory Management' }
  },
  {
    path: 'staff',
    loadComponent: () => import('./pages/staff/staff.component').then(m => m.StaffComponent),
    data: { title: 'Staff Management' }
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    data: { title: 'Settings' }
  }
];
