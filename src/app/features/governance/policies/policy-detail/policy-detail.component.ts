import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices, Policy } from '../../../../core/services/governance.services';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { getApiBase } from '../../../../core/config/api-config';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    TagModule,
    BadgeModule,
    ToastModule,
    SkeletonModule,
    TabViewModule,
    TableModule,
    ChipModule,
    DividerModule,
    ProgressBarModule,
    TooltipModule,
    ConfirmDialogModule,
    InputSwitchModule
  ],
  templateUrl: './policy-detail.component.html',
  styleUrls: ['./policy-detail.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class PolicyDetailComponent implements OnInit, OnDestroy {
  policy: Policy | null = null;
  loading = false;
  policyId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
    ,
    private http: HttpClient
  ) { }

  getInitials(user: any): string {
    if (!user) return '';
    const first = (user.first_name || '').toString().trim();
    const last = (user.last_name || '').toString().trim();
    if (first || last) return ((first.charAt(0) || '') + (last.charAt(0) || '')).toUpperCase();
    if (user.name) return user.name.split(' ').map((s: string) => s.charAt(0)).slice(0, 2).join('').toUpperCase();
    if (user.kid) return user.kid.substring(0, 2).toUpperCase();
    return '';
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.policyId = params['id'];
      if (this.policyId) {
        this.loadPolicy();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPolicy(): void {
    if (!this.policyId) return;

    console.log('Loading policy with ID:', this.policyId);
    console.log('API URL will be:', `${getApiBase()}/governance/policies/${this.policyId}`);
    this.loading = true;
    this.governanceServices.getPolicy(this.policyId).subscribe({
      next: (response) => {
        console.log('Policy API response:', response);
        // governanceServices wraps responses; but sometimes the API returns the raw object
        const raw = (response && (response as any).data) ? (response as any).data : response;
        if (raw && raw.kid) {
          this.policy = this.normalizePolicy(raw as any);
          console.log('Policy loaded successfully:', this.policy);
        } else {
          // Fallback: try a relative path which may be proxied (e.g., http://localhost:4200/governance/policies/:id)
          console.warn('Policy not found in wrapped response, attempting fallback fetch for', this.policyId);
          this.http.get<any>(`/governance/policies/${encodeURIComponent(this.policyId)}`).subscribe({
            next: (fallback) => {
              const candidate = (fallback && fallback.data) ? fallback.data : fallback;
              if (candidate && candidate.kid) {
                this.policy = this.normalizePolicy(candidate as any);
                console.log('Policy loaded from fallback endpoint:', this.policy);
              } else {
                console.warn('Fallback fetch returned invalid policy:', fallback);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Policy Not Found',
                  detail: 'The policy you\'re looking for doesn\'t exist or has been deleted.'
                });
              }
            },
            error: (err) => {
              console.error('Fallback fetch error:', err);
              this.messageService.add({ severity: 'error', summary: 'Policy Not Found', detail: 'Failed to load policy details.' });
            }
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading policy:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });

        let errorMessage = 'Failed to load policy details. Please try again.';
        if (error.status === 404) {
          errorMessage = 'The policy you\'re looking for doesn\'t exist or has been deleted.';
        } else if (error.status === 403) {
          errorMessage = 'You don\'t have permission to view this policy.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Policy Not Found',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  /**
   * Normalize a raw policy object from the API into the Policy interface the UI expects.
   */
  private normalizePolicy(raw: any): Policy {
    if (!raw) return raw;
    const p: any = { ...raw };
    // Ensure arrays exist
    p.subjects = Array.isArray(raw.subjects) ? raw.subjects : (raw.subjects ? [raw.subjects] : []);
    p.roles = Array.isArray(raw.roles) ? raw.roles : (raw.roles ? [raw.roles] : []);
    p.permissions = Array.isArray(raw.permissions) ? raw.permissions : (raw.permissions ? [raw.permissions] : []);
    p.resources = Array.isArray(raw.resources) ? raw.resources : (raw.resources ? [raw.resources] : []);
    p.role_details = Array.isArray(raw.role_details) ? raw.role_details : [];
    p.permission_details = Array.isArray(raw.permission_details) ? raw.permission_details : [];
    p.user_details = Array.isArray(raw.user_details) ? raw.user_details : [];
    p.team_details = Array.isArray(raw.team_details) ? raw.team_details : [];
    p.asset_details = Array.isArray(raw.asset_details) ? raw.asset_details : [];
    p.affected_assets_total = raw.affected_assets_total ?? 0;
    p.policy_rules_total = raw.policy_rules_total ?? 0;
    p.total_subjects = raw.total_subjects ?? (p.subjects ? p.subjects.length : 0);
    p.total_roles = raw.total_roles ?? (p.role_details ? p.role_details.length : (p.roles ? p.roles.length : 0));
    p.total_permissions = raw.total_permissions ?? (p.permission_details ? p.permission_details.length : (p.permissions ? p.permissions.length : 0));
    p.total_resources = raw.total_resources ?? (p.resources ? p.resources.length : 0);
    return p as Policy;
  }

  goBack(): void {
    this.router.navigate(['/governance/policies']);
  }

  editPolicy(): void {
    if (this.policy) {
      this.router.navigate(['/governance/policies/edit', this.policy.kid]);
    }
  }

  togglePolicyStatus(): void {
    if (!this.policy) return;

    const action = this.policy.enabled ? 'disable' : 'enable';
    const serviceCall = this.policy.enabled ?
      this.governanceServices.disablePolicy(this.policy.kid) :
      this.governanceServices.enablePolicy(this.policy.kid);

    serviceCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.policy!.enabled = !this.policy!.enabled;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Policy ${action}d successfully`
          });
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing policy:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${action} policy`
        });
      }
    });
  }

  deletePolicy(): void {
    if (!this.policy) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the policy "${this.policy.name}"?`,
      header: 'Delete Policy',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deletePolicy(this.policy!.kid).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Policy deleted successfully'
              });
              this.router.navigate(['/governance/policies']);
            }
          },
          error: (error) => {
            console.error('Error deleting policy:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete policy'
            });
          }
        });
      }
    });
  }

  getPolicyTypeSeverity(type: string): string {
    switch (type) {
      case 'access_control': return 'info';
      case 'data_protection': return 'warning';
      case 'compliance': return 'danger';
      default: return 'secondary';
    }
  }

  getPolicyStatusSeverity(enabled: boolean): string {
    return enabled ? 'success' : 'secondary';
  }

  getEffectSeverity(effect: string): string {
    switch (effect) {
      case 'allow': return 'success';
      case 'deny': return 'danger';
      default: return 'secondary';
    }
  }

  getPriorityColor(priority: number): string {
    if (priority >= 80) return 'danger';
    if (priority >= 50) return 'warning';
    return 'info';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString?.toString() || '-';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString?.toString() || '-';
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Text copied to clipboard'
      });
    });
  }
}
