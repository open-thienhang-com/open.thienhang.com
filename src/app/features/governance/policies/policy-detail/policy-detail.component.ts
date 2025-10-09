import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GovernanceServices, Policy } from '../../../../core/services/governance.services';
import { getApiBase } from '../../../../core/config/api-config';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
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
    ButtonModule,
    CardModule,
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
  ) {}

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
        if (response.success && response.data) {
          this.policy = response.data;
          console.log('Policy loaded successfully:', this.policy);
        } else {
          console.warn('Policy not found or invalid response:', response);
          this.messageService.add({
            severity: 'error',
            summary: 'Policy Not Found',
            detail: 'The policy you\'re looking for doesn\'t exist or has been deleted.'
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
