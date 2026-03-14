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
import { FRESH_RETAIL_FEATURE_CONFIG } from './features/retail/retail-services/feature-page/fresh-retail.config';


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
      },
      {
        path: 'travel',
        children: travelRoutes
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
            redirectTo: '/planning/stochastic',
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
            loadComponent: () => import('./features/retail/pages/product-catalog/product-catalog.component').then(m => m.ProductCatalogComponent),
          },
          {
            path: 'shop',
            redirectTo: 'ecommerce',
            pathMatch: 'full'
          },
          {
            path: 'inventory',
            children: [
              {
                path: '',
                redirectTo: 'products',
                pathMatch: 'full'
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
                path: 'products/create',
                loadComponent: () => import('./features/retail/retail-services/inventory/products/product-create.component').then(m => m.ProductCreateComponent),
              },
              {
                path: 'products/:id',
                loadComponent: () => import('./features/retail/retail-services/inventory/products/product-detail.component').then(m => m.ProductDetailComponent),
              },
              {
                path: 'categories',
                loadComponent: () => import('./features/retail/retail-services/inventory/categories/categories.component').then(m => m.CategoriesComponent),
              },
              {
                path: 'locations',
                loadComponent: () => import('./features/retail/retail-services/inventory/locations/locations.component').then(m => m.LocationsComponent),
              },
              {
                path: 'partners',
                loadComponent: () => import('./features/retail/retail-services/inventory/partners/partners.component').then(m => m.PartnersComponent),
              },
              {
                path: 'suppliers',
                loadComponent: () => import('./features/retail/retail-services/inventory/suppliers/suppliers.component').then(m => m.SuppliersComponent),
              },
              {
                path: 'support',
                redirectTo: 'settings',
                pathMatch: 'full'
              },
              {
                path: 'settings',
                loadComponent: () => import('./features/retail/retail-services/inventory/settings/settings.component').then(m => m.SettingsComponent),
              },
            ]
          },
          {
            path: 'loyalty',
            loadComponent: () => import('./features/retail/retail-services/feature-page/retail-feature-page.component').then(m => m.RetailFeaturePageComponent),
            data: {
              featureConfig: {
                title: 'Loyalty Program',
                subtitle: 'Member lifecycle, tier management, and retention campaigns',
                icon: 'pi pi-star',
                accent: '#db2777',
                stats: [
                  { label: 'Active Members', value: '82,450', trend: '+5.4%' },
                  { label: 'Points Issued', value: '9.3M', trend: '+11.2%' },
                  { label: 'Redemption Rate', value: '27.1%', trend: '+3.0%' },
                  { label: 'Churn Risk', value: '6.2%', trend: '-0.8%' }
                ],
                actions: [
                  { label: 'Issue Bonus Points', icon: 'pi pi-gift', description: 'Launch limited-time point bonuses' },
                  { label: 'Adjust Tier Rules', icon: 'pi pi-sliders-h', description: 'Update thresholds and progression logic' },
                  { label: 'View Member Cohorts', icon: 'pi pi-chart-line', description: 'Compare retention by signup month' }
                ],
                checklist: ['Tier rules confirmed', 'Reward catalog published', 'Fraud controls enabled', 'Member notifications live']
              }
            }
          },
          {
            path: 'pos',
            loadComponent: () => import('./features/retail/retail-services/pos/pos.component').then(m => m.PosComponent),
          },
          {
            path: 'ecommerce',
            loadComponent: () => import('./features/retail/pages/shop/shop.component').then(m => m.RetailShopComponent),
          },
          {
            path: 'omni-channel',
            loadComponent: () => import('./features/chat/pages/facebook-workspace/facebook-workspace.component').then(m => m.FacebookWorkspaceComponent),
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
            path: 'customers',
            loadComponent: () => import('./features/retail/retail-services/customers/customers.component').then(m => m.CustomersComponent),
          },
          {
            path: 'rewards',
            loadComponent: () => import('./features/retail/retail-services/feature-page/retail-feature-page.component').then(m => m.RetailFeaturePageComponent),
            data: {
              featureConfig: {
                title: 'Rewards Catalog',
                subtitle: 'Reward design, partner offers, and redemption economics',
                icon: 'pi pi-gift',
                accent: '#c026d3',
                stats: [
                  { label: 'Active Rewards', value: '146', trend: '+18' },
                  { label: 'Redeem Cost', value: '$2.31', trend: '-0.17' },
                  { label: 'Redemption Volume', value: '78,212', trend: '+10.5%' },
                  { label: 'Partner Offers', value: '29', trend: '+4' }
                ],
                actions: [
                  { label: 'Add Reward', icon: 'pi pi-plus', description: 'Create fixed, tiered, or seasonal rewards' },
                  { label: 'Adjust Point Cost', icon: 'pi pi-sliders-h', description: 'Optimize redemption economics' },
                  { label: 'Track Utilization', icon: 'pi pi-chart-pie', description: 'Analyze reward performance by segment' }
                ],
                checklist: ['Reward SLAs validated', 'Partner contracts synced', 'Fraud checks enabled', 'Expiry policies configured']
              }
            }
          },
          {
            path: 'campaigns',
            loadComponent: () => import('./features/retail/retail-services/feature-page/retail-feature-page.component').then(m => m.RetailFeaturePageComponent),
            data: {
              featureConfig: {
                title: 'Loyalty Campaigns',
                subtitle: 'Campaign orchestration across channels and customer tiers',
                icon: 'pi pi-megaphone',
                accent: '#0f766e',
                stats: [
                  { label: 'Campaigns Live', value: '32', trend: '+5' },
                  { label: 'Open Rate', value: '42.3%', trend: '+4.4%' },
                  { label: 'Conversion', value: '9.8%', trend: '+1.6%' },
                  { label: 'ROI', value: '3.7x', trend: '+0.5x' }
                ],
                actions: [
                  { label: 'Launch Campaign', icon: 'pi pi-send', description: 'Deploy a targeted retention campaign' },
                  { label: 'A/B Test Message', icon: 'pi pi-clone', description: 'Test creative and offer variants' },
                  { label: 'Pause Low ROI', icon: 'pi pi-pause', description: 'Stop underperforming campaign streams' }
                ],
                checklist: ['Audience rules validated', 'Channel throttling configured', 'Attribution window set', 'Post-campaign report automated']
              }
            }
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
