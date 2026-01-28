import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanService, Plan } from '../../services/plan.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulationRunnerService } from '../../services/simulation-runner.service';
import { SimulationRequest } from '../../services/simulation.service';
import { PlanItem } from '../../services/simulation-converter.service';

@Component({
  selector: 'app-trip-simulation',
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-simulation.component.html',
  styleUrls: ['./trip-simulation.component.css'],
})
export class TripSimulationComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() planId: string | null | undefined = null;
  @ViewChild('tableBody', { static: false }) tableBodyRef!: ElementRef<HTMLTableSectionElement>;

  // Form controls
  simPlanId: string = '';
  fromDate: string = '';
  toDate: string = '';
  persist: boolean = true;
  modelId: string = '';
  weather: boolean = false;
  traffic: boolean = false;
  events: boolean = false;
  showSettings: boolean = false;

  // State
  loading = false;
  error: string | null = null;
  planName: string = '';
  simulationResults: PlanItem[] = [];
  selectedTrip: any = null;
  canRunSimulation: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private planService: PlanService,
    private simulationRunner: SimulationRunnerService
  ) {}

  ngOnInit() {
    // Initialize default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.fromDate = today.toISOString().slice(0, 10);
    this.toDate = tomorrow.toISOString().slice(0, 10);

    // Check route params
    this.route.params.subscribe(params => {
      const routePlanId = params['id'];
      if (routePlanId) {
        this.planId = routePlanId;
        this.simPlanId = routePlanId;
        this.loadPlanInfo(routePlanId);
      }
    });

    // Check if planId is provided via input
    if (this.planId) {
      this.simPlanId = this.planId;
      this.loadPlanInfo(this.planId);
    }

    // Check window.planningState for plan info
    this.checkPlanningState();

    // Initial button state update
    this.updateButtonState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['planId'] && this.planId) {
      this.simPlanId = this.planId;
      this.loadPlanInfo(this.planId);
      this.updateButtonState();
    }
  }

  private checkPlanningState() {
    try {
      const planningState = (window as any).planningState;
      if (planningState) {
        if (planningState.selectedPlanId && !this.simPlanId) {
          this.simPlanId = planningState.selectedPlanId;
        }
        if (planningState.selectedPlan) {
          this.planName = (planningState.selectedPlan as any).name || 
                         (planningState.selectedPlan as any).plan_name || '';
        }
        if (planningState.currentPlan) {
          this.planName = this.planName || 
                         (planningState.currentPlan as any).name || 
                         (planningState.currentPlan as any).plan_name || '';
        }
      }

      // Also check legacy top-level variables
      if (!this.simPlanId && (window as any).selectedPlanId) {
        this.simPlanId = (window as any).selectedPlanId;
      }
      
      // Update button state after checking planning state
      if (this.simPlanId) {
        this.updateButtonState();
      }
    } catch (e) {
      console.warn('Error checking planningState:', e);
    }
  }

  private loadPlanInfo(planId: string) {
    this.planService.getPlan(planId).subscribe({
      next: (resp) => {
        if (resp && resp.ok && resp.data) {
          let planObj: any = resp.data;
          while (planObj && planObj.data) planObj = planObj.data;
          
          this.planName = planObj?.name || planObj?.plan_name || planObj?.title || '';
          
          // Update window state for compatibility
          try {
            (window as any).planningState = (window as any).planningState || {};
            (window as any).planningState.selectedPlan = planObj;
            (window as any).planningState.currentPlan = planObj;
            (window as any).planningState.selectedPlanId = planId;
          } catch (e) {
            console.warn('Error updating planningState:', e);
          }
        }
        this.updateButtonState();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Error loading plan info:', err);
        this.updateButtonState();
        this.cdr.detectChanges();
      }
    });
  }

  updateButtonState() {
    const hasDates = !!(this.fromDate && this.toDate);
    const hasPlan = !!(this.simPlanId && this.simPlanId.trim());
    
    this.canRunSimulation = hasDates && hasPlan;
    console.log('[TripSimulation] updateButtonState:', {
      hasDates,
      hasPlan,
      canRunSimulation: this.canRunSimulation,
      fromDate: this.fromDate,
      toDate: this.toDate,
      simPlanId: this.simPlanId
    });
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    // No need to load JS files anymore - using pure TypeScript renderer
    console.log('[TripSimulation] Component initialized - using TypeScript renderer');
  }

  async runSimulation() {
    console.log('[TripSimulation] runSimulation called', {
      canRunSimulation: this.canRunSimulation,
      loading: this.loading,
      simPlanId: this.simPlanId,
      fromDate: this.fromDate,
      toDate: this.toDate
    });

    if (!this.canRunSimulation) {
      console.warn('[TripSimulation] Cannot run simulation - canRunSimulation is false');
      console.warn('[TripSimulation] hasDates:', !!(this.fromDate && this.toDate));
      console.warn('[TripSimulation] hasPlan:', !!(this.simPlanId && this.simPlanId.trim()));
      return;
    }

    if (this.loading) {
      console.warn('[TripSimulation] Simulation already running');
      return;
    }

    this.loading = true;
    this.error = null;
    this.simulationResults = [];
    this.cdr.detectChanges();

    try {
      // Build request
      const request: SimulationRequest = {
        plan_id: this.simPlanId,
        from_date: this.fromDate,
        to_date: this.toDate,
        persist: this.persist
      };

      if (this.modelId && this.modelId.trim()) {
        request.model_id = this.modelId.trim();
      }

      if (this.weather || this.traffic || this.events) {
        request.simulation = {
          weather: this.weather,
          traffic: this.traffic,
          events: this.events
        };
      }

      // Run simulation
      console.log('[TripSimulation] Calling simulationRunner.runSimulation with request:', request);
      const planItems = await this.simulationRunner.runSimulation(request);
      console.log('[TripSimulation] Simulation completed, received planItems:', planItems);
      
      // Store results
      this.simulationResults = Array.isArray(planItems) ? planItems : [planItems];
      console.log('[TripSimulation] Stored simulationResults:', this.simulationResults.length, 'items');
      
      // Also update window state for compatibility
      try {
        (window as any).planningState = (window as any).planningState || {};
        (window as any).planningState.simulationData = planItems;
      } catch (e) {
        console.warn('Error updating simulation data in planningState:', e);
      }
      
      // Render table using TypeScript ForecastTableRendererService (no JS dependency)
      // Ensure view is updated and table is visible in DOM
      this.loading = false; // Set loading to false so table is visible
      this.cdr.detectChanges();
      
      // Wait for view to update and DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force another change detection cycle
      this.cdr.detectChanges();
      
      // Wait a bit more for DOM to fully render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify table body exists before rendering
      const tbody = this.tableBodyRef?.nativeElement || document.getElementById('simulation-table-body-2');
      if (!tbody) {
        console.warn('[TripSimulation] Table body not found yet, waiting more...');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Use TypeScript renderer (ForecastTableRendererService via SimulationRunnerService)
      // The service will retry finding the element internally
      console.log('[TripSimulation] Rendering table using TypeScript ForecastTableRendererService');
      console.log('[TripSimulation] PlanItems to render:', planItems);
      this.simulationRunner.renderTable(planItems, 'simulation-table-body-2');
      console.log('[TripSimulation] Table rendering initiated');

    } catch (error: any) {
      console.error('Error running simulation:', error);
      this.error = error?.message || 'Lỗi khi chạy mô phỏng. Vui lòng thử lại.';
      
      // Clear results on error
      this.simulationResults = [];
      this.cdr.detectChanges();
      
      // Wait a bit for DOM update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const tbody = this.tableBodyRef?.nativeElement || document.getElementById('simulation-table-body-2');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="11" class="px-6 py-8 text-left text-sm text-red-600">Lỗi: ${this.error}</td></tr>`;
      }
    } finally {
      // Loading is already set to false before rendering
      if (this.loading) {
        this.loading = false;
      }
      this.cdr.detectChanges();
    }
  }

  showTripDetail(trip: any) {
    this.selectedTrip = trip;
    this.cdr.detectChanges();
  }

  closeTripDetail() {
    this.selectedTrip = null;
    this.cdr.detectChanges();
  }

  loadTripSimulationData() {
    // This method is kept for compatibility but doesn't do anything
    // as we're now using Angular-native approach
    if (this.planId) {
      this.loadPlanInfo(this.planId);
    }
  }
}
