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
import { hotelRoutes } from './features/hotel/hotel.routes';
import { travelRoutes } from './features/travel/travel.routes';
import { chatRoutes } from './features/chat/chat.routes';
import { filesRoutes } from './features/files/files.routes';


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
        loadComponent: () => import('./features/data-mesh/data-products/data-products.component').then(m => m.DataProductsComponent),
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
      {
        path: 'blogger',
        children: [
          {
            path: 'login',
            loadComponent: () => import('./features/blogger/pages/login/login.component').then(m => m.BloggerLoginComponent),
          },
          {
            path: '',
            loadComponent: () => import('./features/blogger/blogger-overview.component').then(m => m.BloggerOverviewComponent),
            canActivate: [() => import('./features/blogger/guards/blogger-auth.guard').then(m => m.bloggerAuthGuard)],
          },
          {
            path: 'authors',
            loadComponent: () => import('./features/blogger/pages/authors/authors.component').then(m => m.BloggerAuthorsComponent),
            canActivate: [() => import('./features/blogger/guards/blogger-auth.guard').then(m => m.bloggerAuthGuard)],
          },
          {
            path: 'posts',
            loadComponent: () => import('./features/blogger/pages/posts/posts.component').then(m => m.BloggerPostsComponent),
            canActivate: [() => import('./features/blogger/guards/blogger-auth.guard').then(m => m.bloggerAuthGuard)],
          }
        ]
      },
      {
        path: 'ad-manager',
        loadComponent: () => import('./features/ad-manager/ad-manager-overview.component').then(m => m.AdManagerOverviewComponent),
      },
      {
        path: 'hotel',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/hotel/pages/overview/hotel-overview.component').then(m => m.HotelOverviewComponent),
          },
          ...hotelRoutes
        ]
      },
      {
        path: 'travel',
        children: travelRoutes
      },
      {
        path: 'chat',
        children: chatRoutes
      },
      {
        path: 'files',
        children: filesRoutes
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
        path: 'applications',
        loadComponent: () => import('./features/applications/applications.component').then(m => m.ApplicationsComponent),
      },

      {
        path: 'data-mesh/catalogs',
        loadComponent: () => import('./features/data-mesh/domain-catalog/domain-catalog.component').then(m => m.DomainCatalogComponent),
      },
      {
        path: 'data-mesh/catalogs/:domainKey',
        loadComponent: () => import('./features/data-mesh/domain-detail/domain-detail.component').then(m => m.DomainDetailComponent),
      },
      {
        path: 'data-mesh/data-products',
        loadComponent: () => import('./features/data-mesh/data-products/data-products.component').then(m => m.DataProductsComponent),
      },
      {
        path: 'data-mesh/data-products/:domain',
        loadComponent: () => import('./features/data-mesh/data-products/data-products.component').then(m => m.DataProductsComponent),
      },
      {
        path: 'data-mesh/data-products/:domain/:id',
        loadComponent: () => import('./features/data-mesh/data-product-detail/data-product-detail.component').then(m => m.DataProductDetailComponent),
      },
      {
        path: 'data-mesh/data-products/:id',
        loadComponent: () => import('./features/data-mesh/data-product-detail/data-product-detail.component').then(m => m.DataProductDetailComponent),
      },
      {
        path: 'discovery/catalog',
        loadComponent: () => import('./features/discovery/data-catalog.component').then(m => m.DataCatalogComponent),
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
            path: 'products',
            loadComponent: () => import('./features/retail/pages/product-catalog/product-catalog.component').then(m => m.ProductCatalogComponent),
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
