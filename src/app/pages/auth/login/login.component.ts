import { Component, EventEmitter, Input, Injector, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { Toast } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthServices, PublicTenant } from '../../../core/services/auth.services';
import { Router } from '@angular/router';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { LoadingService } from '../../../core/services/loading.service';
import { GovernanceServices, Tenant } from '../../../core/services/governance.services';

type Step = 'login' | 'workspace';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    PasswordModule,
    CheckboxModule,
    Toast,
    ProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent extends AppBaseComponent {
  @Input() tenants: PublicTenant[] = [];

  @Output() onSignUp = new EventEmitter<void>();
  @Output() onForgotPassword = new EventEmitter<void>();
  @Output() onUnverified = new EventEmitter<{ email: string }>();

  step: Step = 'login';

  email = 'admin@thienhang.com';
  password = '12345678';
  remember = false;
  selectedTenant = '';   // kid of pre-selected tenant

  isLoading = false;
  isLoadingWorkspaces = false;
  workplaces: Tenant[] = [];

  // Dev tool — API environment override
  showAdvanced = false;
  apiOptions = [
    { label: 'Production (api.thienhang.com)', value: 'https://api.thienhang.com' },
    { label: 'Localhost :8080', value: 'http://localhost:8080' },
    { label: 'Localhost :8081', value: 'http://localhost:8081' },
  ];
  selectedApi: string | null = null;
  applyApi = true;

  constructor(
    private injector: Injector,
    private authService: AuthServices,
    private govService: GovernanceServices,
    private router: Router,
    private loadingService: LoadingService,
  ) {
    super(injector);
    try {
      this.selectedApi = localStorage.getItem('API_BASE') || null;
    } catch { /* ignore */ }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.showError('Please enter both email and password');
      return;
    }
    this.isLoading = true;
    this.loadingService.showOverlay('Signing you in…', 'pulse');

    this.authService.login({ email: this.email, password: this.password, remember_me: this.remember }).subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem('isLoggedIn', 'true');
          this.authService.getCurrentUser().subscribe({ error: () => {} });
          this.loadWorkplaces();
        } else {
          this.showError(res.message || 'Login failed');
          this.isLoading = false;
          this.loadingService.hide();
        }
      },
      error: (err) => {
        this.showError(err.error?.message || 'Login failed');
        this.isLoading = false;
        this.loadingService.hide();
      }
    });
  }

  private loadWorkplaces(): void {
    this.isLoadingWorkspaces = true;

    this.govService.getMyTenants().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.loadingService.hide();
        this.isLoadingWorkspaces = false;

        const list: Tenant[] = Array.isArray(res?.data) ? res.data : [];

        if (list.length === 0) {
          this.router.navigate(['']);
          return;
        }

        // If user pre-selected a tenant that matches their memberships, auto-route
        if (this.selectedTenant) {
          const match = list.find(w => w.kid === this.selectedTenant);
          if (match) {
            this.selectWorkplace(match);
            return;
          }
        }

        if (list.length === 1) {
          this.selectWorkplace(list[0]);
          return;
        }

        this.workplaces = list;
        this.step = 'workspace';
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingService.hide();
        this.isLoadingWorkspaces = false;
        if (err?.status === 403) {
          this.router.navigate(['/forbidden']);
        } else {
          this.router.navigate(['']);
        }
      }
    });
  }

  selectWorkplace(tenant: Tenant): void {
    try {
      localStorage.setItem('selectedWorkspace', JSON.stringify({ kid: tenant.kid, name: tenant.name }));
    } catch { /* ignore */ }
    this.router.navigate(['/governance/tenants', tenant.kid]);
  }

  backToLogin(): void {
    this.step = 'login';
    this.workplaces = [];
  }

  getStatusClass(status: string): string {
    if (status === 'active') return 'status--active';
    if (status === 'suspended') return 'status--suspended';
    return 'status--trial';
  }

  onApiChange(value: string | null): void {
    this.selectedApi = value;
    try {
      if (this.applyApi) {
        if (value) {
          localStorage.setItem('API_BASE', value);
          if (typeof window !== 'undefined') (window as any).__API_BASE__ = value;
        } else {
          localStorage.removeItem('API_BASE');
          if (typeof window !== 'undefined') delete (window as any).__API_BASE__;
        }
      }
    } catch { /* ignore */ }
  }
}
