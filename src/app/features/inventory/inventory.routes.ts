import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { 
                path: 'overview', 
                loadComponent: () => import('./pages/overview/overview.component').then(m => m.InventoryOverviewComponent) 
            },
            { 
                path: 'products', 
                loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent) 
            },
            { 
                path: 'products/create', 
                loadComponent: () => import('./pages/products/product-create.component').then(m => m.ProductCreateComponent) 
            },
            { 
                path: 'products/:id', 
                loadComponent: () => import('./pages/products/product-detail.component').then(m => m.ProductDetailComponent) 
            },
            { 
                path: 'categories', 
                loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) 
            },
            { 
                path: 'warehouses', 
                redirectTo: 'delivery-points',
                pathMatch: 'full'
            },
            { 
                path: 'suppliers', 
                loadComponent: () => import('./pages/suppliers/suppliers.component').then(m => m.SuppliersComponent) 
            },
            { 
                path: 'partners', 
                loadComponent: () => import('./pages/partners/partners.component').then(m => m.PartnersComponent) 
            },
            { 
                path: 'analytics', 
                loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent) 
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
            },
            {
                path: 'fleet',
                loadComponent: () => import('../retail-planning/components/fleet/fleet.component').then(m => m.FleetComponent)
            },
            {
                path: 'delivery-points',
                loadComponent: () => import('../retail-planning/components/delivery-points/delivery-points.component').then(m => m.DeliveryPointsComponent)
            },
            {
                path: 'forecast/demand',
                loadComponent: () => import('../retail-planning/components/dataset/dataset.component').then(m => m.DatasetComponent),
                data: { datasetType: 'demand' }
            },
            {
                path: 'forecast/truck',
                loadComponent: () => import('../retail-planning/components/fleet/fleet.component').then(m => m.FleetComponent),
                data: { forecastType: 'truck' }
            },
            {
                path: 'forecast/trip',
                loadComponent: () => import('../retail-planning/components/dataset/dataset.component').then(m => m.DatasetComponent),
                data: { datasetType: 'trip' }
            },
            {
                path: 'forecast/hub',
                loadComponent: () => import('../retail-planning/components/dataset/dataset.component').then(m => m.DatasetComponent),
                data: { datasetType: 'hub' }
            }
        ]
    }
];
