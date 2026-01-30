import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthComponent } from './pages/auth/auth.component';
import { OfflineComponent } from './pages/error/offline.component';
import { MaintenanceComponent } from './pages/error/maintenance/maintenance.component';
import { ForbiddenComponent } from './pages/error/forbidden/forbidden.component';
import { NotFoundComponent } from './pages/error/not-found/not-found.component';
import { retailPlanningRoutes } from './features/retail-planning/retail-planning.routes';


export const routes: Routes = [
  // Error pages (outside of auth guard)
  {
    path: 'maintenance',
    loadComponent: () => import('./pages/error/maintenance/maintenance.component').then(m => m.MaintenanceComponent)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/error/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/error/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: 'offline',
    loadComponent: () => import('./pages/error/offline.component').then(m => m.OfflineComponent)
  },
  // Public retail planning feature (no authentication required, but still uses main layout + sidebar)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent),
      },
      {
        path: 'planning',
        children: retailPlanningRoutes
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'governance/assets',
        loadComponent: () => import('./features/governance/assets/assets.component').then(m => m.AssetsComponent),
      },
      {
        path: 'governance/policies',
        loadComponent: () => import('./features/governance/policies/policies.component').then(m => m.PoliciesComponent),
      },
      {
        path: 'governance/policies/new',
        loadComponent: () => import('./features/governance/policies/policy-create/policy-create.component').then(m => m.PolicyCreateComponent),
      },
      {
        path: 'governance/policies/:id',
        loadComponent: () => import('./features/governance/policies/policy-detail/policy-detail.component').then(m => m.PolicyDetailComponent),
      },
      {
        path: 'governance/teams',
        loadComponent: () => import('./features/governance/teams/teams.component').then(m => m.TeamsComponent),
      },
      {
        path: 'governance/teams/new',
        loadComponent: () => import('./features/governance/teams/team-create/team-create.component').then(m => m.TeamCreateComponent),
      },
      {
        path: 'governance/roles',
        loadComponent: () => import('./features/governance/roles/roles.component').then(m => m.RolesComponent),
      },
      {
        path: 'governance/roles/new',
        loadComponent: () => import('./features/governance/roles/role-create/role-create.component').then(m => m.RoleCreateComponent),
      },
      {
        path: 'governance/roles/:id',
        loadComponent: () => import('./features/governance/roles/role-detail/role-detail.component').then(m => m.RoleDetailComponent),
      },
      {
        path: 'governance/accounts',
        loadComponent: () => import('./features/governance/accounts/accounts.component').then(m => m.AccountsComponent),
      },
      {
        path: 'governance/users',
        loadComponent: () => import('./features/governance/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'governance/users/:kid',
        loadComponent: () => import('./features/governance/users/user-detail.component').then(m => m.UserDetailComponent),
      },
      {
        path: 'governance/permissions',
        loadComponent: () => import('./features/governance/permissions/permissions.component').then(m => m.PermissionsComponent),
      },
      // Dashboard removed — root now loads Marketplace
      {
        path: 'marketplace',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'blogger',
        loadComponent: () => import('./features/blogger/blogger-overview.component').then(m => m.BloggerOverviewComponent),
      },
      {
        path: 'ad-manager',
        loadComponent: () => import('./features/ad-manager/ad-manager-overview.component').then(m => m.AdManagerOverviewComponent),
      },
      {
        path: 'hotel',
        loadComponent: () => import('./features/hotel/hotel-overview.component').then(m => m.HotelOverviewComponent),
      },
      {
        path: 'profile',
        redirectTo: 'settings',
        pathMatch: 'full'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/setting.component').then(m => m.SettingsComponent),
      },
      {
        path: 'data-product',
        loadComponent: () => import('./features/data-product/data-product.component').then(m => m.DataProductComponent),
      },
      {
        path: 'data-product-detail',
        loadComponent: () => import('./features/data-product/data-prod-detail/data-prod-detail.component').then(m => m.DataProdDetailComponent),
      },

      {
        path: 'data-mesh/lineage',
        loadComponent: () => import('./features/data-mesh/data-lineage.component').then(m => m.DataLineageComponent),
      },
      {
        path: 'data-mesh/quality',
        loadComponent: () => import('./features/data-mesh/quality-metrics.component').then(m => m.QualityMetricsComponent),
      },
      {
        path: 'data-mesh/extensions',
        loadComponent: () => import('./features/data-mesh/domain-catalog/domain-catalog.component').then(m => m.DomainCatalogComponent),
      },
      {
        path: 'data-mesh/catalog',
        loadComponent: () => import('./features/data-mesh/data-catalog/data-catalog.component').then(m => m.DataCatalogComponent),
      },
      {
        path: 'discovery/catalog',
        loadComponent: () => import('./features/discovery/data-catalog.component').then(m => m.DataCatalogComponent),
      },
      {
        path: 'observability/monitoring',
        loadComponent: () => import('./features/observability/monitoring.component').then(m => m.MonitoringComponent),
      },
      {
        path: 'explore',
        loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent),
      },
      {
        path: 'explore/database',
        loadComponent: () => import('./features/explore/database/database-explorer.component').then(m => m.DatabaseExplorerComponent),
      },
      {
        path: 'explore/database/:type',
        loadComponent: () => import('./features/explore/database/database-explorer.component').then(m => m.DatabaseExplorerComponent),
      },
      {
        path: 'explore/pipelines',
        loadComponent: () => import('./features/explore/pipelines/pipelines-explorer.component').then(m => m.PipelinesExplorerComponent),
      },
      {
        path: 'explore/pipelines/:type',
        loadComponent: () => import('./features/explore/pipelines/pipelines-explorer.component').then(m => m.PipelinesExplorerComponent),
      },
      {
        path: 'explore/topics',
        loadComponent: () => import('./features/explore/topics/topics-explorer.component').then(m => m.TopicsExplorerComponent),
      },
      {
        path: 'explore/topics/:type',
        loadComponent: () => import('./features/explore/topics/topics-explorer.component').then(m => m.TopicsExplorerComponent),
      },
      {
        path: 'explore/ml-models',
        loadComponent: () => import('./features/explore/ml-models/ml-models-explorer.component').then(m => m.MLModelsExplorerComponent),
      },
      {
        path: 'explore/ml-models/:type',
        loadComponent: () => import('./features/explore/ml-models/ml-models-explorer.component').then(m => m.MLModelsExplorerComponent),
      },
      {
        path: 'explore/container',
        loadComponent: () => import('./features/explore/container/container-explorer.component').then(m => m.ContainerExplorerComponent),
      },
      {
        path: 'explore/container/:type',
        loadComponent: () => import('./features/explore/container/container-explorer.component').then(m => m.ContainerExplorerComponent),
      },
      {
        path: 'explore/search',
        loadComponent: () => import('./features/explore/search/search-explorer.component').then(m => m.SearchExplorerComponent),
      },
      {
        path: 'explore/search/:type',
        loadComponent: () => import('./features/explore/search/search-explorer.component').then(m => m.SearchExplorerComponent),
      },
      {
        path: 'retail',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/retail/retail-services/overview/overview.component').then(m => m.OverviewComponent),
          },
          {
            path: 'payment',
            loadComponent: () => import('./features/retail/retail-services/payment/payment.component').then(m => m.PaymentComponent),
          },
          {
            path: 'inventory',
            children: [
              {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
              },
              {
                path: 'overview',
                loadComponent: () => import('./features/retail/retail-services/inventory/overview/overview.component').then(m => m.OverviewComponent),
              },
              {
                path: 'product-catalog',
                loadComponent: () => import('./features/retail/retail-services/inventory/product-catalog/product-catalog.component').then(m => m.ProductCatalogComponent),
              },
              {
                path: 'products',
                loadComponent: () => import('./features/retail/retail-services/inventory/products/products.component').then(m => m.ProductsComponent),
              },
              {
                path: 'movements',
                loadComponent: () => import('./features/retail/retail-services/inventory/movements/movements.component').then(m => m.MovementsComponent),
              },
              {
                path: 'locations',
                loadComponent: () => import('./features/retail/retail-services/inventory/locations/locations.component').then(m => m.LocationsComponent),
              },
              {
                path: 'reports',
                loadComponent: () => import('./features/retail/retail-services/inventory/reports/reports.component').then(m => m.ReportsComponent),
              },
              {
                path: 'suppliers',
                loadComponent: () => import('./features/retail/retail-services/inventory/suppliers/suppliers.component').then(m => m.SuppliersComponent),
              },
              {
                path: 'support',
                loadComponent: () => import('./features/retail/retail-services/inventory/support/support.component').then(m => m.SupportComponent),
              },
              {
                path: 'settings',
                loadComponent: () => import('./features/retail/retail-services/inventory/settings/settings.component').then(m => m.SettingsComponent),
              },
            ]
          },
          {
            path: 'analytics',
            loadComponent: () => import('./features/retail/retail-services/analytics/analytics.component').then(m => m.AnalyticsComponent),
          },
          {
            path: 'loyalty',
            loadComponent: () => import('./features/retail/retail-services/loyalty/loyalty.component').then(m => m.LoyaltyComponent),
          },
          {
            path: 'pos',
            loadComponent: () => import('./features/retail/retail-services/pos/pos.component').then(m => m.PosComponent),
          },
          {
            path: 'ecommerce',
            loadComponent: () => import('./features/retail/retail-services/ecommerce/ecommerce.component').then(m => m.EcommerceComponent),
          },
        ]
      },
      {
        path: 'discovery/data-catalog',
        loadComponent: () => import('./features/discovery/data-catalog.component').then(m => m.DataCatalogComponent),
      },
      {
        path: 'observability/alert',
        loadComponent: () => import('./features/observability/alert/alert.component').then(m => m.AlertComponent),
      },
      {
        path: 'observability/metrics',
        loadComponent: () => import('./features/observability/metrics/metrics.component').then(m => m.MetricsComponent),
      },
      {
        path: 'observability/audit-log',
        loadComponent: () => import('./features/observability/audit-log/audit-log.component').then(m => m.AuditLogComponent),
      },
      // Asset detail route removed per request
    ],
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: AuthComponent
  },
  // Wildcard route for 404 - must be last
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
