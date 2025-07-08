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


export const routes: Routes = [
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
        path: 'governance/teams',
        component: TeamsComponent,
      },
      {
        path: 'governance/roles',
        component: RolesComponent,
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
