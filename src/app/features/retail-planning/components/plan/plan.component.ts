import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PlanSelectionComponent } from '../plan-selection/plan-selection.component';
import { PlanPreviewComponent } from '../plan-preview/plan-preview.component';
import { TripSimulationComponent } from '../trip-simulation/trip-simulation.component';
import { EvaluationComponent } from '../evaluation/evaluation.component';
import { CostEstimationComponent } from '../cost-estimation/cost-estimation.component';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { PlanService, Plan } from '../../services/plan.service';

@Component({
  selector: 'app-plan',
  imports: [
    CommonModule,
    PlanSelectionComponent,
    PlanPreviewComponent,
    TripSimulationComponent,
    EvaluationComponent,
    CostEstimationComponent,
    PageHeaderComponent
  ],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.css',
})
export class PlanComponent implements OnInit {
  currentTab: string = 'selection';
  currentPlan: Plan | null = null;
  selectedPlanId: string | null = null;
  plans: Plan[] = [];
  loading = false;
  uploadStatus: { message: string; type: 'success' | 'error' | 'info' } | null = null;

  constructor(private planService: PlanService, @Inject(PLATFORM_ID) private platformId: Object, private cdr: ChangeDetectorRef) { }

  get hasSelectedPlan(): boolean {
    return !!(this.selectedPlanId || this.currentPlan?.id);
  }

  ngOnInit() {
    this.loading = true;
    this.loadPlans();
  }

  switchPlanningTab(tabName: string) {
    if (tabName !== 'selection' && !this.hasSelectedPlan) {
      console.warn('[PlanComponent] Cannot switch to tab without a selected plan:', tabName);
      return;
    }
    
    this.currentTab = tabName;
    
    // When switching to simulation tab, sync planId from planningState if needed
    if (tabName === 'simulation') {
      if (!this.currentPlan?.id && !this.selectedPlanId) {
        try {
          const planningState = (window as any).planningState;
          if (planningState?.selectedPlanId) {
            this.selectedPlanId = planningState.selectedPlanId;
            if (planningState.selectedPlan) {
              this.currentPlan = planningState.selectedPlan;
            } else if (planningState.currentPlan) {
              this.currentPlan = planningState.currentPlan;
            }
            this.cdr.detectChanges();
          }
        } catch (e) {
          console.warn('Failed to read planningState:', e);
        }
      }
    }
  }

  close3DModal() {
    // This method is called from the 3D modal template
    console.log('[PlanComponent] Closing 3D modal');
  }

  loadPlans(): void {
    this.loading = true;
    this.cdr.detectChanges(); // Force change detection immediately
    this.planService.getPlans({ limit: 50, offset: 0 }).subscribe({
      next: (response) => {
        if (response.ok && response.data && Array.isArray(response.data.data)) {
          this.plans = response.data.data;
          console.log('Loaded plans from API:', this.plans);
        } else {
          console.warn('Invalid response format for plans, falling back to localStorage');
          this.loadPlansFromStorage();
        }
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection after loading
      },
      error: (error) => {
        console.error('Failed to load plans from API, falling back to localStorage:', error);
        this.loadPlansFromStorage();
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection on error
      }
    });
  }

  private loadPlansFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip localStorage access on server-side
    }
    try {
      const stored = localStorage.getItem('plans_v1');
      if (stored) {
        this.plans = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load plans from storage:', error);
    }
  }

  viewPlan(planId: string): void {
    this.selectedPlanId = planId;
    this.currentPlan = null;
    this.uploadStatus = { message: `Đang chuyển tới xem trước plan ${planId}...`, type: 'info' };
    
    // Update planningState for child components
    try {
      (window as any).planningState = (window as any).planningState || {};
      (window as any).planningState.selectedPlanId = planId;
      (window as any).planningState.selectedPlan = { id: planId };
      (window as any).planningState.currentPlan = { id: planId };
    } catch (e) {
      console.warn('Failed to update planningState:', e);
    }
    
    this.switchPlanningTab('preview');
    
    // Load the plan details
    this.planService.getPlan(planId).subscribe({
      next: (response) => {
        if (response.ok && response.data) {
          let planData: any = response.data;
          while (planData && planData.data) planData = planData.data;
          this.currentPlan = planData || { id: planId };
          
          // Update planningState with full plan data
          try {
            (window as any).planningState = (window as any).planningState || {};
            (window as any).planningState.selectedPlan = planData || { id: planId };
            (window as any).planningState.currentPlan = planData || { id: planId };
            (window as any).planningState.selectedPlanId = planId;
          } catch (e) {
            console.warn('Failed to update planningState with full plan:', e);
          }
          
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.warn('Failed to load plan details:', error);
        this.currentPlan = { id: planId };
        
        // Update planningState with minimal plan
        try {
          (window as any).planningState = (window as any).planningState || {};
          (window as any).planningState.selectedPlanId = planId;
          (window as any).planningState.selectedPlan = { id: planId };
          (window as any).planningState.currentPlan = { id: planId };
        } catch (e) {
          console.warn('Failed to update planningState:', e);
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  private loadPlanFromStorage(planId: string): void {
    try {
      const stored = localStorage.getItem('plans_v1');
      if (stored) {
        const plans = JSON.parse(stored);
        const plan = plans.find((p: any) =>
          (p.planId || p.id || p.metadata?.createdAt || String(p.createdAt)) == planId
        );
        if (plan) {
          this.currentPlan = plan;
          this.switchPlanningTab('preview');
        }
      }
    } catch (error) {
      console.error('Failed to load plan from storage:', error);
    }
  }

  deletePlan(planId: string): void {
    if (!confirm('Bạn có chắc muốn xóa plan này?')) return;

    // If deleting the currently selected plan, clear selection and switch to selection tab
    if (this.selectedPlanId === planId || this.currentPlan?.id === planId) {
      this.selectedPlanId = null;
      this.currentPlan = null;
      this.currentTab = 'selection';
    }

    this.loading = true;
    this.uploadStatus = { message: `Đang xóa plan ${planId}...`, type: 'info' };
    this.cdr.detectChanges(); // Force change detection

    this.planService.deletePlan(planId).subscribe({
      next: (response) => {
        if (response.ok) {
          this.uploadStatus = { message: 'Xóa plan thành công', type: 'success' };
          this.loadPlans(); // Reload the list
        } else {
          this.uploadStatus = { message: 'Không thể xóa plan từ API', type: 'error' };
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.uploadStatus = { message: 'Xóa plan thất bại', type: 'error' };
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadPlan(file: File): void {
    if (!file) return;

    this.loading = true;
    this.uploadStatus = { message: `Đang upload ${file.name}...`, type: 'info' };
    this.cdr.detectChanges(); // Force change detection

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.planService.uploadPlan(formData).subscribe({
      next: (response) => {
        if (response.ok) {
          this.uploadStatus = { message: 'Import thành công', type: 'success' };
          this.loadPlans(); // Reload plans from API
        } else {
          const errorMsg = response.data?.message || response.data?.detail || 'Import failed';
          this.uploadStatus = { message: 'API trả về lỗi: ' + errorMsg, type: 'error' };
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.uploadStatus = { message: 'Upload thất bại', type: 'error' };
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
