import { Injectable } from '@angular/core';
import { Trip } from './trip-builder.service';
import { PlanItem } from './simulation-converter.service';
import { ForecastTableRendererService } from './forecast-table-renderer.service';

@Injectable({
  providedIn: 'root'
})
export class SimulationTableService {

  constructor(private forecastRenderer: ForecastTableRendererService) {}

  /**
   * Render simulation table to DOM element
   * Uses TypeScript ForecastTableRendererService instead of legacy JS
   */
  renderTable(planDataOrArray: PlanItem[] | PlanItem | null, tbodyElement: HTMLElement | null, tbodyElementId?: string): void {
    const elementId = tbodyElementId || (tbodyElement?.id) || 'simulation-table-body-2';
    
    if (!planDataOrArray) {
      const tbody = tbodyElement || document.getElementById(elementId);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="11" class="px-6 py-8 text-left text-sm text-gray-500">Không có dữ liệu dự báo</td></tr>`;
      }
      return;
    }

    // Use TypeScript ForecastTableRendererService (pure TypeScript, no JS dependency)
    console.log('[SimulationTableService] Using TypeScript ForecastTableRendererService');
    this.forecastRenderer.renderTable(planDataOrArray, elementId);
  }

  /**
   * Simple table renderer (fallback)
   */
  private renderSimpleTable(items: PlanItem[], tbodyElement: HTMLElement): void {
    let html = '';
    
    items.forEach(item => {
      const date = item.date || 'N/A';
      item.plan.shifts.forEach(shift => {
        shift.vehicles.forEach(vehicle => {
          vehicle.demands.forEach((demand, idx) => {
            html += `<tr class="hover:bg-blue-50 border-b border-gray-200">`;
            if (idx === 0) {
              html += `<td rowspan="${vehicle.demands.length}" class="px-3 py-2 text-sm font-semibold text-gray-900">${date}</td>`;
              html += `<td rowspan="${vehicle.demands.length}" class="px-3 py-2 text-sm font-medium text-gray-800">${shift.shift_name}</td>`;
              html += `<td rowspan="${vehicle.demands.length}" class="px-2 py-2 text-sm font-mono text-blue-700">${vehicle.vehicle_id}</td>`;
            }
            html += `<td class="px-2 py-2 text-sm text-center">${demand.stt || idx + 1}</td>`;
            html += `<td class="px-2 py-2 text-sm">${demand.stop_name || '—'}</td>`;
            html += `<td class="px-2 py-2 text-sm">${this.formatTime(demand.expected_checkin_time)}</td>`;
            html += `<td class="px-2 py-2 text-sm">${demand.pickup_weight_kg || 0} kg</td>`;
            html += `<td class="px-2 py-2 text-sm">${demand.delivery_weight_kg || 0} kg</td>`;
            html += `<td class="px-2 py-2 text-sm">${demand.drop_rate || 0}%</td>`;
            html += `<td class="px-2 py-2 text-sm">${demand.fill_rate || 0}%</td>`;
            html += `</tr>`;
          });
        });
      });
    });

    if (html === '') {
      tbodyElement.innerHTML = `<tr><td colspan="15" class="px-6 py-8 text-left text-sm text-gray-500">Dữ liệu dự báo rỗng</td></tr>`;
    } else {
      tbodyElement.innerHTML = html;
    }
  }

  private formatTime(timestamp: number | null | undefined): string {
    if (!timestamp || typeof timestamp !== 'number') return '—';
    const totalSeconds = Math.floor(timestamp);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
