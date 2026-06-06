import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';
import { noAuthGuard } from './core/guard/no-auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthComponent } from './pages/auth/auth.component';
import { LogoutPageComponent } from './pages/auth/logout/logout.component';
import { HelpPageComponent } from './pages/help/help.component';
import { OfflineComponent } from './pages/error/offline.component';
import { MaintenanceComponent } from './pages/error/maintenance/maintenance.component';
import { ForbiddenComponent } from './pages/error/forbidden/forbidden.component';
import { NotFoundComponent } from './pages/error/not-found/not-found.component';
import { retailPlanningRoutes } from './features/retail-planning/retail-planning.routes';
import { hotelRoutes } from './features/hotel/hotel.routes';
import { travelRoutes } from './features/travel/travel.routes';
import { chatRoutes } from './features/chat/chat.routes';
import { filesRoutes } from './features/files/files.routes';
import { notificationRoutes } from './features/notification/notification.routes';
import { FRESH_RETAIL_FEATURE_CONFIG } from './features/retail/retail-services/feature-page/fresh-retail.config';
import { INVENTORY_ROUTES } from './features/inventory/inventory.routes';
import { LOYALTY_ROUTES } from './features/loyalty/loyalty.routes';
import { MAP_ROUTES } from './features/map/map.routes';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
        pathMatch: 'full'
      },
      {
        path: 'planning',
        children: retailPlanningRoutes
      },
      {
        path: 'travel',
        children: travelRoutes
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/applications/applications.component').then(m => m.ApplicationsComponent),
      },
      {
        path: 'login',
        component: AuthComponent,
        canActivate: [noAuthGuard],
      },
      {
        path: 'register',
        component: AuthComponent,
        data: { mode: 2 },
        canActivate: [noAuthGuard],
      },
      {
        path: 'verify',
        component: AuthComponent,
        data: { mode: 4 },
        canActivate: [noAuthGuard],
      },
      {
        path: 'forgot-password',
        component: AuthComponent,
        data: { mode: 3 },
        canActivate: [noAuthGuard],
      },
      {
        path: 'reset-password',
        component: AuthComponent,
        data: { mode: 5 },
      },
      {
        path: 'logout',
        component: LogoutPageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'help',
        component: HelpPageComponent,
      },
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
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'governance/proposal',
        loadComponent: () => import('./features/governance/proposal/proposal.component').then(m => m.ProposalComponent),
      },
      {
        path: 'governance/assets',
        loadComponent: () => import('./features/governance/assets/assets.component').then(m => m.AssetsComponent),
      },
      {
        path: 'governance/assets/new',
        loadComponent: () => import('./features/governance/assets/asset-create/asset-create.component').then(m => m.AssetCreateComponent),
      },
      {
        path: 'governance/assets/:id/edit',
        loadComponent: () => import('./features/governance/assets/asset-edit/asset-edit.component').then(m => m.AssetEditComponent),
      },
      {
        path: 'governance/assets/:id',
        loadComponent: () => import('./features/governance/assets/asset-detail/asset-detail.component').then(m => m.AssetDetailComponent),
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
        path: 'governance/policies/edit/:id',
        loadComponent: () => import('./features/governance/policies/policy-edit/policy-edit.component').then(m => m.PolicyEditComponent),
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
        path: 'governance/roles/:id/edit',
        loadComponent: () => import('./features/governance/roles/role-edit/role-edit.component').then(m => m.RoleEditComponent),
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
        path: 'governance/accounts/new',
        loadComponent: () => import('./features/governance/accounts/account-create/account-create.component').then(m => m.AccountCreateComponent),
      },
      {
        path: 'governance/accounts/:id/edit',
        loadComponent: () => import('./features/governance/accounts/account-edit/account-edit.component').then(m => m.AccountEditComponent),
      },
      {
        path: 'governance/accounts/:id',
        loadComponent: () => import('./features/governance/accounts/account-detail/account-detail.component').then(m => m.AccountDetailComponent),
      },
      {
        path: 'governance/users',
        loadComponent: () => import('./features/governance/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'governance/users/:kid/edit',
        loadComponent: () => import('./features/governance/users/user-edit/user-edit.component').then(m => m.UserEditComponent),
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
        path: 'governance/permissions/new',
        loadComponent: () => import('./features/governance/permissions/permission-create/permission-create.component').then(m => m.PermissionCreateComponent),
      },
      {
        path: 'governance/permissions/:id/edit',
        loadComponent: () => import('./features/governance/permissions/permission-edit/permission-edit.component').then(m => m.PermissionEditComponent),
      },
      {
        path: 'governance/permissions/:id',
        loadComponent: () => import('./features/governance/permissions/permission-detail/permission-detail.component').then(m => m.PermissionDetailComponent),
      },
      {
        path: 'governance/tenants',
        loadComponent: () => import('./features/governance/tenants/tenants.component').then(m => m.TenantsComponent),
      },
      {
        path: 'governance/tenants/new',
        loadComponent: () => import('./features/governance/tenants/tenant-create/tenant-create.component').then(m => m.TenantCreateComponent),
      },
      {
        path: 'governance/tenants/:kid',
        loadComponent: () => import('./features/governance/tenants/tenant-detail/tenant-detail.component').then(m => m.TenantDetailComponent),
      },
      {
        path: 'governance/teams/:id',
        loadComponent: () => import('./features/governance/teams/team-detail/team-detail.component').then(m => m.TeamDetailComponent),
      },
      {
        path: 'governance/casbin',
        loadComponent: () => import('./features/governance/casbin/casbin.component').then(m => m.CasbinComponent),
      },
      {
        path: 'governance/admin',
        loadComponent: () => import('./features/governance/admin/governance-admin.component').then(m => m.GovernanceAdminComponent),
      },
      {
        path: 'governance/entitlements',
        loadComponent: () => import('./features/governance/entitlements/entitlements.component').then(m => m.EntitlementsComponent),
      },
      {
        path: 'governance/entitlements/new',
        loadComponent: () => import('./features/governance/entitlements/entitlement-create/entitlement-create.component').then(m => m.EntitlementCreateComponent),
      },
      {
        path: 'governance/entitlements/:code/edit',
        loadComponent: () => import('./features/governance/entitlements/entitlement-edit/entitlement-edit.component').then(m => m.EntitlementEditComponent),
      },
      {
        path: 'governance/entitlements/:code',
        loadComponent: () => import('./features/governance/entitlements/entitlement-detail/entitlement-detail.component').then(m => m.EntitlementDetailComponent),
      },
      {
        path: 'governance/branches',
        loadComponent: () => import('./features/governance/branches/branches.component').then(m => m.BranchesComponent),
      },
      {
        path: 'governance/branches/new',
        loadComponent: () => import('./features/governance/branches/branch-create/branch-create.component').then(m => m.BranchCreateComponent),
      },
      {
        path: 'governance/branches/:code',
        loadComponent: () => import('./features/governance/branches/branch-detail/branch-detail.component').then(m => m.BranchDetailComponent),
      },
      {
        path: 'blogger',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/blogger/blogger-overview.component').then(m => m.BloggerOverviewComponent),
          },
          {
            path: 'authors',
            loadComponent: () => import('./features/blogger/pages/authors/authors.component').then(m => m.BloggerAuthorsComponent),
          },
          {
            path: 'posts',
            loadComponent: () => import('./features/blogger/pages/posts/posts.component').then(m => m.BloggerPostsComponent),
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
        path: 'cmc',
        children: chatRoutes
      },
      {
        path: 'files',
        children: filesRoutes
      },
      {
        path: 'notification',
        children: notificationRoutes
      },
      {
        path: 'settings',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/settings/setting.component').then(m => m.SettingsComponent),
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
        path: 'explore/data-warehouse',
        loadComponent: () => import('./features/explore/data-warehouse/data-warehouse-explorer.component').then(m => m.DataWarehouseExplorerComponent),
      },
      {
        path: 'data-mesh/domains/dockerhub',
        loadComponent: () => import('./features/explore/docker-hub/docker-hub-explorer.component').then(m => m.DockerHubExplorerComponent)
      },
      {
        path: 'explore/google',
        loadComponent: () => import('./features/explore/google/google-explorer.component').then(m => m.GoogleExplorerComponent),
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
        path: 'inventory',
        children: INVENTORY_ROUTES
      },
      {
        path: 'loyalty',
        children: LOYALTY_ROUTES
      },
      {
        // Public module — no auth guard
        path: 'map',
        children: MAP_ROUTES
      },
      {
        path: 'retail',
        children: [
          {
            path: 'overview',
            loadComponent: () => import('./features/retail/retail-services/overview/overview.component').then(m => m.RetailOverviewDocComponent),
          },
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full'
          },
          {
            path: 'payment',
            loadComponent: () => import('./features/retail/retail-services/payment/payment.component').then(m => m.PaymentComponent),
          },
          {
            path: 'fresh-retail',
            loadComponent: () => import('./features/retail/retail-services/feature-page/retail-feature-page.component').then(m => m.RetailFeaturePageComponent),
            data: {
              featureConfig: FRESH_RETAIL_FEATURE_CONFIG
            }
          },
          {
            path: 'products',
            loadComponent: () => import('./features/inventory/pages/products/products.component').then(m => m.ProductsComponent),
          },
          {
            path: 'shop',
            redirectTo: 'ecommerce',
            pathMatch: 'full'
          },
          {
            path: 'inventory',
            redirectTo: '/inventory',
            pathMatch: 'prefix'
          },
          {
            path: 'loyalty',
            redirectTo: '/loyalty',
            pathMatch: 'prefix'
          },
          {
            path: 'rewards',
            redirectTo: '/loyalty/rewards',
            pathMatch: 'full'
          },
          {
            path: 'campaigns',
            redirectTo: '/loyalty/campaigns',
            pathMatch: 'full'
          },
          {
            path: 'pos',
            loadComponent: () => import('./features/retail/retail-services/pos/pos.component').then(m => m.PosComponent),
          },
          {
            path: 'ecommerce',
            loadComponent: () => import('./features/retail/retail-services/ecommerce/ecommerce.component').then(m => m.EcommerceComponent),
          },
          {
            path: 'omni-channel',
            loadComponent: () => import('./features/retail/retail-services/omnichannel/omnichannel-overview.component').then(m => m.OmnichannelOverviewComponent),
          },
          {
            path: 'transactions',
            loadComponent: () => import('./features/retail/retail-services/transactions/transactions.component').then(m => m.TransactionsComponent),
          },
          {
            path: 'cash',
            redirectTo: 'payment',
            pathMatch: 'full'
          },
          {
            path: 'orders',
            loadComponent: () => import('./features/retail/retail-services/orders/orders.component').then(m => m.OrdersComponent),
          },
          {
            path: 'orders/:id/edit',
            loadComponent: () => import('./features/retail/retail-services/orders/order-edit.component').then(m => m.OrderEditComponent),
          },
          {
            path: 'customers',
            loadComponent: () => import('./features/retail/retail-services/customers/customers.component').then(m => m.CustomersComponent),
          },
          {
            path: 'rewards',
            redirectTo: '/loyalty/rewards',
            pathMatch: 'full'
          },
          {
            path: 'campaigns',
            redirectTo: '/loyalty/campaigns',
            pathMatch: 'full'
          },
        ]
      },
      // Asset detail route removed per request
    ],
    canActivate: [authGuard],
  },
  {
    path: '**',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
