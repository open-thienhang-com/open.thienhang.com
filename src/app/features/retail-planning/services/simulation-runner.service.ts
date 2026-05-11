import { Injectable, Injector } from '@angular/core';
import { SimulationService, SimulationRequest, SimulationResponse } from './simulation.service';
import { SimulationConverterService, PlanItem } from './simulation-converter.service';
import { SimulationTableService } from './simulation-table.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulationRunnerService {
  private static instance: SimulationRunnerService | null = null;

  constructor(
    private injector: Injector,
    private simulationService: SimulationService,
    private converterService: SimulationConverterService,
    private tableService: SimulationTableService
  ) {
    // Store instance for legacy code access
    SimulationRunnerService.instance = this;
  }

  /**
   * Get instance for use from legacy/non-Angular code
   */
  static getInstance(): SimulationRunnerService | null {
    return SimulationRunnerService.instance;
  }

  /**
   * Run simulation with request parameters
   */
  async runSimulation(request: SimulationRequest): Promise<PlanItem[]> {
    try {
      // Call API
      const response = await firstValueFrom(this.simulationService.runSimulation(request));
      
      // Convert response
      const planItems = this.converterService.convertPredictResponseToPlan(response);
      
      return planItems;
    } catch (error) {
      console.error('[SimulationRunnerService] Error running simulation:', error);
      throw error;
    }
  }

  /**
   * Render simulation table
   */
  renderTable(planItems: PlanItem[] | PlanItem | null, tbodyElementId: string = 'simulation-table-body-2'): void {
    // Use TypeScript renderer (no JS dependency)
    this.tableService.renderTable(planItems, null, tbodyElementId);
  }

  /**
   * Run simulation and render table in one call
   */
  async runSimulationAndRender(request: SimulationRequest, tbodyElementId: string = 'simulation-table-body-2'): Promise<void> {
    try {
      const planItems = await this.runSimulation(request);
      this.renderTable(planItems, tbodyElementId);
    } catch (error) {
      console.error('[SimulationRunnerService] Error in runSimulationAndRender:', error);
      const tbody = document.getElementById(tbodyElementId);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="15" class="px-6 py-8 text-left text-sm text-red-600">
          Lỗi khi chạy mô phỏng: ${error instanceof Error ? error.message : String(error)}
        </td></tr>`;
      }
      throw error;
    }
  }

  /**
   * Convert API response to plan items (public method for legacy code access)
   */
  convertResponseToPlan(response: SimulationResponse): PlanItem[] {
    return this.converterService.convertPredictResponseToPlan(response);
  }
}
