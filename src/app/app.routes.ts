import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthComponent } from './pages/auth/auth.component';
import { OfflineComponent } from './pages/error/offline.component';
import { MaintenanceComponent } from './pages/error/maintenance/maintenance.component';
import { ForbiddenComponent } from './pages/error/forbidden/forbidden.component';
import { NotFoundComponent } from './pages/error/not-found/not-found.component';


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
        path: 'governance/policies/:id',
        loadComponent: () => import('./features/governance/policies/policy-detail/policy-detail.component').then(m => m.PolicyDetailComponent),
      },
      {
        path: 'governance/teams',
        loadComponent: () => import('./features/governance/teams/teams.component').then(m => m.TeamsComponent),
      },
      {
        path: 'governance/roles',
        loadComponent: () => import('./features/governance/roles/roles.component').then(m => m.RolesComponent),
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
        path: 'governance/permissions',
        loadComponent: () => import('./features/governance/permissions/permissions.component').then(m => m.PermissionsComponent),
      },
      {
        path: 'data-contracts',
        loadComponent: () => import('./features/data-contracts/data-contracts.component').then(m => m.DataContractsComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
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
        path: 'data-mesh/domains',
        loadComponent: () => import('./features/data-mesh/domain-catalog/domain-catalog.component').then(m => m.DomainCatalogComponent),
      },
      {
        path: 'data-mesh/domain/:domainKey',
        loadComponent: () => import('./features/data-mesh/domain-detail/domain-detail.component').then(m => m.DomainDetailComponent),
      },
      {
        path: 'data-mesh/data-products',
        loadComponent: () => import('./features/data-mesh/data-products/data-products.component').then(m => m.DataProductsComponent),
      },
      {
        path: 'data-mesh/data-products/:domain/:id',
        loadComponent: () => import('./features/data-mesh/data-product-detail/data-product-detail.component').then(m => m.DataProductDetailComponent),
      },
      {
        path: 'data-mesh/data-products/:name',
        loadComponent: () => import('./features/data-mesh/data-product-detail/data-product-detail.component').then(m => m.DataProductDetailComponent),
      },
      {
        path: 'data-mesh/api-explorer',
        loadComponent: () => import('./features/data-mesh/api-explorer/api-explorer.component').then(m => m.ApiExplorerComponent),
      },
      {
        path: 'data-mesh/api-documentation',
        loadComponent: () => import('./features/data-mesh/api-documentation/api-documentation.component').then(m => m.ApiDocumentationComponent),
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
        path: 'explore/apis',
        loadComponent: () => import('./features/explore/apis/apis-explorer.component').then(m => m.ApisExplorerComponent),
      },
      {
        path: 'explore/apis/:type',
        loadComponent: () => import('./features/explore/apis/apis-explorer.component').then(m => m.ApisExplorerComponent),
      },
      {
        path: 'loading-demo',
        loadComponent: () => import('./pages/loading-demo/loading-demo.component').then(m => m.LoadingDemoComponent),
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
      {
        path: 'explore/:id',
        loadComponent: () => import('./features/explore/asset-detail.component').then(m => m.AssetDetailComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
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
