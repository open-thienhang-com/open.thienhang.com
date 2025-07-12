import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './features/governance/assets/assets.component';
import { AuthComponent } from './pages/auth/auth.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PoliciesComponent } from './features/governance/policies/policies.component';
import { TeamsComponent } from './features/governance/teams/teams.component';
import { RolesComponent } from './features/governance/roles/roles.component';
import { AccountsComponent } from './features/governance/accounts/accounts.component';
import { UsersComponent } from './features/governance/users/users.component';
import { PermissionsComponent } from './features/governance/permissions/permissions.component';
import { authGuard } from './core/guard/auth.guard';
import { DataProductComponent } from './features/data-product/data-product.component';
import { DataProdDetailComponent } from './features/data-product/data-prod-detail/data-prod-detail.component';
import { ProfileComponent } from './features/profile/profile.component';
import { SettingsComponent } from './features/settings/setting.component';
import { DataContractsComponent } from './features/data-contracts/data-contracts.component';
import { PolicyDetailComponent } from './features/governance/policies/policy-detail/policy-detail.component';
import { RoleDetailComponent } from './features/governance/roles/role-detail/role-detail.component';
import { OfflineComponent } from './pages/error/offline.component';
import { DomainCatalogComponent } from './features/domain-catalog/domain-catalog.component';
import { DomainDetailComponent } from './features/domain-catalog/domain-detail/domain-detail.component';
import { DataLineageComponent } from './features/data-mesh/data-lineage.component';
import { QualityMetricsComponent } from './features/data-mesh/quality-metrics.component';
import { DataCatalogComponent } from './features/discovery/data-catalog.component';
import { MonitoringComponent } from './features/observability/monitoring.component';
import { ExploreComponent } from './features/explore/explore.component';
import { DatabaseExplorerComponent } from './features/explore/database/database-explorer.component';
import { PipelinesExplorerComponent } from './features/explore/pipelines/pipelines-explorer.component';
import { TopicsExplorerComponent } from './features/explore/topics/topics-explorer.component';
import { MLModelsExplorerComponent } from './features/explore/ml-models/ml-models-explorer.component';
import { ContainerExplorerComponent } from './features/explore/container/container-explorer.component';
import { SearchExplorerComponent } from './features/explore/search/search-explorer.component';
import { ApisExplorerComponent } from './features/explore/apis/apis-explorer.component';
import { MaintenanceComponent } from './pages/error/maintenance/maintenance.component';
import { ForbiddenComponent } from './pages/error/forbidden/forbidden.component';
import { NotFoundComponent } from './pages/error/not-found/not-found.component';

// Data Mesh Components
import { DomainCatalogComponent as DataMeshDomainCatalogComponent } from './features/data-mesh/domain-catalog/domain-catalog.component';
import { DomainDetailComponent as DataMeshDomainDetailComponent } from './features/data-mesh/domain-detail/domain-detail.component';
import { DataProductsComponent } from './features/data-mesh/data-products/data-products.component';
import { ApiExplorerComponent } from './features/data-mesh/api-explorer/api-explorer.component';
import { ApiDocumentationComponent } from './features/data-mesh/api-documentation/api-documentation.component';
import { LoadingDemoComponent } from './pages/loading-demo/loading-demo.component';
import { DataProductDetailComponent } from './features/data-mesh/data-product-detail/data-product-detail.component';


export const routes: Routes = [
  // Error pages (outside of auth guard)
  {
    path: 'maintenance',
    component: MaintenanceComponent
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },
  {
    path: 'offline',
    component: OfflineComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'governance/assets',
        component: AssetsComponent,
      },
      {
        path: 'governance/policies',
        component: PoliciesComponent,
      },
      {
        path: 'governance/policies/:id',
        component: PolicyDetailComponent,
      },
      {
        path: 'governance/teams',
        component: TeamsComponent,
      },
      {
        path: 'governance/roles',
        component: RolesComponent,
      },
      {
        path: 'governance/roles/:id',
        component: RoleDetailComponent,
      },
      {
        path: 'governance/accounts',
        component: AccountsComponent,
      },
      {
        path: 'governance/users',
        component: UsersComponent,
      },
      {
        path: 'governance/permissions',
        component: PermissionsComponent,
      },
      {
        path: 'data-contracts',
        component: DataContractsComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'data-product',
        component: DataProductComponent,
      },
      {
        path: 'data-product-detail',
        component: DataProdDetailComponent,
      },
      {
        path: 'domains',
        component: DomainCatalogComponent,
      },
      {
        path: 'domains/:id',
        component: DomainDetailComponent,
      },
      {
        path: 'data-mesh/lineage',
        component: DataLineageComponent,
      },
      {
        path: 'data-mesh/quality',
        component: QualityMetricsComponent,
      },
      {
        path: 'data-mesh/domains',
        component: DataMeshDomainCatalogComponent,
      },
      {
        path: 'data-mesh/domain/:domainKey',
        component: DataMeshDomainDetailComponent,
      },
      {
        path: 'data-mesh/data-products',
        component: DataProductsComponent,
      },
      {
        path: 'data-mesh/data-products/:domain/:id',
        component: DataProductDetailComponent,
      },
      {
        path: 'data-mesh/data-products/:name',
        component: DataProductDetailComponent,
      },
      {
        path: 'data-mesh/api-explorer',
        component: ApiExplorerComponent,
      },
      {
        path: 'data-mesh/api-documentation',
        component: ApiDocumentationComponent,
      },
      {
        path: 'discovery/catalog',
        component: DataCatalogComponent,
      },
      {
        path: 'observability/monitoring',
        component: MonitoringComponent,
      },
      {
        path: 'explore',
        component: ExploreComponent,
      },
      {
        path: 'explore/database',
        component: DatabaseExplorerComponent,
      },
      {
        path: 'explore/database/:type',
        component: DatabaseExplorerComponent,
      },
      {
        path: 'explore/pipelines',
        component: PipelinesExplorerComponent,
      },
      {
        path: 'explore/pipelines/:type',
        component: PipelinesExplorerComponent,
      },
      {
        path: 'explore/topics',
        component: TopicsExplorerComponent,
      },
      {
        path: 'explore/topics/:type',
        component: TopicsExplorerComponent,
      },
      {
        path: 'explore/ml-models',
        component: MLModelsExplorerComponent,
      },
      {
        path: 'explore/ml-models/:type',
        component: MLModelsExplorerComponent,
      },
      {
        path: 'explore/container',
        component: ContainerExplorerComponent,
      },
      {
        path: 'explore/container/:type',
        component: ContainerExplorerComponent,
      },
      {
        path: 'explore/search',
        component: SearchExplorerComponent,
      },
      {
        path: 'explore/search/:type',
        component: SearchExplorerComponent,
      },
      {
        path: 'explore/apis',
        component: ApisExplorerComponent,
      },
      {
        path: 'explore/apis/:type',
        component: ApisExplorerComponent,
      },
      {
        path: 'loading-demo',
        component: LoadingDemoComponent,
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
