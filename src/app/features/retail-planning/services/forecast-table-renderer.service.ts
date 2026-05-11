import { Injectable } from '@angular/core';
import { PlanItem } from './simulation-converter.service';

interface TripRow {
  date: string;
  shift: string;
  vehicle: string;
  demands: Demand[];
  truckCapacity: number;
  ontimeRate: number | null;
  dropRate: number | null;
  fillRate: number | null;
  route?: string;
}

interface Demand {
  stt?: number;
  stop_name?: string;
  stop_type?: string;
  distance_km?: number;
  average_speed?: number;
  expected_checkin_time?: number;
  checkin_time?: number;
  expected_checkout_time?: number;
  checkout_time?: number;
  pickup_weight_kg?: number;
  delivery_weight_kg?: number;
  loaded_weight_kg?: number;
  load_on_truck?: number;
  drop_rate_percent?: number;
  drop_rate?: number;
  fill_rate?: number;
  fill_rate_percent?: number;
  ontime_rate?: number;
  transit_time?: number;
  planned_processing_time?: number;
  serve_time?: number;
  throughput_rate?: number;
  vehicle_payload_capacity_kg?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ForecastTableRendererService {

  /**
   * Render forecast table to tbody element (same as renderForecast2Table)
   */
  renderTable(planDataOrArray: PlanItem[] | PlanItem | null, tbodyElementId: string = 'simulation-table-body-2'): void {
    console.log('[ForecastTableRenderer] ===== ENTRY =====');
    console.log('[ForecastTableRenderer] Called with data:', planDataOrArray);
    console.log('[ForecastTableRenderer] Looking for tbody:', tbodyElementId);
    
    // Try to find tbody element
    let tbodyElement: HTMLElement | null = document.getElementById(tbodyElementId);
    if (!tbodyElement) {
      // Also try querySelector as fallback
      tbodyElement = document.querySelector(`#${tbodyElementId}`) as HTMLElement;
    }
    
    // If still not found, try querySelectorAll for any tbody with matching ID pattern
    if (!tbodyElement) {
      const allTbodies = document.querySelectorAll('tbody');
      Array.from(allTbodies).forEach((tbody) => {
        if (!tbodyElement && (tbody.id === tbodyElementId || tbody.id.includes('simulation'))) {
          tbodyElement = tbody as HTMLElement;
          console.log('[ForecastTableRenderer] Found tbody via querySelectorAll with ID:', tbody.id);
        }
      });
    }
    
    if (!tbodyElement || tbodyElement.tagName !== 'TBODY') {
      console.error('[ForecastTableRenderer] ERROR: tbody element not found:', tbodyElementId);
      console.log('[ForecastTableRenderer] Available elements with "simulation" in ID:', 
        Array.from(document.querySelectorAll('[id*="simulation"]')).map(el => ({ id: el.id, tagName: el.tagName })));
      console.log('[ForecastTableRenderer] All tbody elements:', 
        Array.from(document.querySelectorAll('tbody')).map(el => ({ id: el.id, className: el.className })));
      // Retry once after a short delay using setTimeout
      setTimeout(() => {
        const retryElement = document.getElementById(tbodyElementId);
        if (retryElement && retryElement.tagName === 'TBODY') {
          console.log('[ForecastTableRenderer] Found tbody on retry after delay');
          this.renderTableInternal(planDataOrArray, retryElement as HTMLTableSectionElement);
        } else {
          console.error('[ForecastTableRenderer] Still not found after retry');
        }
      }, 200);
      return;
    }
    
    console.log('[ForecastTableRenderer] Found tbody element');
    this.renderTableInternal(planDataOrArray, tbodyElement as HTMLTableSectionElement);
  }

  /**
   * Internal method to render table HTML to tbody element
   */
  private renderTableInternal(planDataOrArray: PlanItem[] | PlanItem | null, tbody: HTMLTableSectionElement): void {

    // Store route data in a global cache for click handling
    if (!(window as any)._routeDataCache) {
      (window as any)._routeDataCache = {};
    }

    // Normalize input to array of {date, plan}
    const items: Array<{ date: string | null; plan: any }> = [];
    if (!planDataOrArray) {
      tbody.innerHTML = `<tr><td colspan="11" class="px-6 py-8 text-left text-sm text-gray-500">Không có dữ liệu dự báo</td></tr>`;
      return;
    }

    if (Array.isArray(planDataOrArray)) {
      planDataOrArray.forEach(it => {
        if (it && it.date && it.plan) {
          items.push(it);
        } else if (it && (it as any).shifts) {
          items.push({ date: (it as any).meta?.date || null, plan: it });
        }
      });
    } else if (planDataOrArray && (planDataOrArray as any).shifts) {
      items.push({ date: (planDataOrArray as any).meta?.date || null, plan: planDataOrArray });
    } else if ((planDataOrArray as any).date && (planDataOrArray as any).plan) {
      items.push(planDataOrArray as any);
    }

    console.log('[ForecastTableRenderer] Normalized items:', items.length);

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="px-6 py-8 text-left text-sm text-gray-500">Không có dữ liệu dự báo</td></tr>`;
      return;
    }

    // Build trips from plan items
    const allTrips = this.buildTripsFromPlanItems(items);
    console.log('[ForecastTableRenderer] Built', allTrips.length, 'trips total');

    if (allTrips.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="px-6 py-8 text-left text-sm text-gray-500">Dữ liệu dự báo rỗng</td></tr>`;
      return;
    }

    // Build hierarchy and render HTML
    const html = this.renderTableHTML(allTrips);
    tbody.innerHTML = html;
    // After setting innerHTML, the rows collection is available
    // Use querySelectorAll as fallback for row count (more reliable than rows.length)
    const rowCount = tbody.querySelectorAll('tr').length;
    console.log('[ForecastTableRenderer] Table rendered with', rowCount, 'rows');

    // Attach event listeners for visualization buttons
    this.attachVisualizationListeners();
  }

  /**
   * Build trips array from plan items
   */
  private buildTripsFromPlanItems(items: Array<{ date: string | null; plan: any }>): TripRow[] {
    const allTrips: TripRow[] = [];

    items.forEach(item => {
      const dateObj = item.date ? new Date(item.date) : new Date();
      const dateStr = this.formatDate(dateObj);

      if (!item.plan || !Array.isArray(item.plan.shifts)) {
        return;
      }

      item.plan.shifts.forEach((shift: any) => {
        const shiftName = shift.shift_name || '';
        const vehicles = Array.isArray(shift.vehicles) ? shift.vehicles : [];

        vehicles.forEach((vehicle: any) => {
          const vid = vehicle.vehicle_id || 'N/A';
          const demands = Array.isArray(vehicle.demands) ? vehicle.demands.map((d: any, idx: number) => ({
            ...d,
            stt: d.stt || d.original_stt || (idx + 1),
            stop_name: d.stop_name || d.original_stop_name || `Stop ${idx + 1}`,
            stop_type: d.stop_type || (d.pickup_weight_kg > 0 ? 'Điểm lấy' : 'Điểm giao'),
          })) : [];

          const first = demands[0] || {};
          const payloadCap = first.vehicle_payload_capacity_kg || vehicle.vehicle_payload_capacity_kg || 0;
          const totalDelivery = vehicle.total_delivery_weight_kg != null ? vehicle.total_delivery_weight_kg : 0;
          const totalPickup = vehicle.total_pickup_weight_kg != null ? vehicle.total_pickup_weight_kg : 0;
          const loadedGoods = (Number(totalDelivery) + Number(totalPickup)) || 0;
          const fillPercent = payloadCap > 0 ? Math.min(100, Math.round((loadedGoods / payloadCap) * 100)) : 0;

          const toPercent = (v: any) => {
            if (v === null || v === undefined) return null;
            const n = Number(v);
            if (Number.isNaN(n)) return null;
            return Math.abs(n) <= 1 ? n * 100 : n;
          };

          const vehicleOntimePct = toPercent(
            vehicle.ontime_rate_percent ?? vehicle.ontime_rate ?? 
            (vehicle.ontime === true ? 100 : (vehicle.ontime === false ? 0 : null))
          );
          const vehicleDropPct = toPercent(vehicle.drop_rate_percent ?? vehicle.drop_rate ?? null);
          const vehicleFillPct = toPercent(vehicle.fill_rate_percent ?? vehicle.fill_rate ?? null) ?? fillPercent;

          allTrips.push({
            date: dateStr,
            shift: shiftName,
            vehicle: vid,
            demands: demands,
            truckCapacity: payloadCap,
            ontimeRate: vehicleOntimePct,
            dropRate: vehicleDropPct,
            fillRate: vehicleFillPct,
            route: demands.length > 1 ? `${first.stop_name} → ${demands[demands.length - 1].stop_name}` : (first.stop_name || '')
          });
        });
      });
    });

    return allTrips;
  }

  /**
   * Render table HTML from trips
   */
  private renderTableHTML(trips: TripRow[]): string {
    // Build hierarchy: date -> shift -> vehicle -> demands
    const hierarchy: { [date: string]: { [shift: string]: { [vehicle: string]: TripRow[] } } } = {};
    trips.forEach(trip => {
      const date = trip.date || 'N/A';
      const shift = trip.shift || 'Unknown';
      const vehicle = trip.vehicle || 'N/A';

      if (!hierarchy[date]) hierarchy[date] = {};
      if (!hierarchy[date][shift]) hierarchy[date][shift] = {};
      if (!hierarchy[date][shift][vehicle]) hierarchy[date][shift][vehicle] = [];
      hierarchy[date][shift][vehicle].push(trip);
    });

    let html = '';
    const sortedDates = Object.keys(hierarchy).sort();

    sortedDates.forEach(date => {
      const shifts = hierarchy[date];
      
      // Calculate date rowspan
      let dateRowCount = 0;
      Object.keys(shifts).forEach(shift => {
        const vehicles = shifts[shift];
        Object.keys(vehicles).forEach(vehicle => {
          const trip = vehicles[vehicle][0];
          dateRowCount += trip.demands.length > 0 ? trip.demands.length : 1;
        });
      });

      let dateFirstRow = true;
      const sortedShifts = Object.keys(shifts).sort();

      sortedShifts.forEach(shift => {
        const vehicles = shifts[shift];
        
        // Calculate shift rowspan
        let shiftRowCount = 0;
        Object.keys(vehicles).forEach(vehicle => {
          const trip = vehicles[vehicle][0];
          shiftRowCount += trip.demands.length > 0 ? trip.demands.length : 1;
        });

        let shiftFirstRow = true;
        const sortedVehicles = Object.keys(vehicles).sort();

        sortedVehicles.forEach(vehicle => {
          const trips = vehicles[vehicle];
          const trip = trips[0];
          const demands = trip.demands || [];

          if (demands.length === 0) {
            html += this.renderEmptyVehicleRow(date, shift, vehicle, dateFirstRow, shiftFirstRow, dateRowCount, shiftRowCount);
            if (dateFirstRow) dateFirstRow = false;
            if (shiftFirstRow) shiftFirstRow = false;
          } else {
            demands.forEach((demand, stopIdx) => {
              const isLastStop = stopIdx === demands.length - 1;
              html += this.renderDemandRow(trip, demand, stopIdx, date, shift, vehicle, dateFirstRow, shiftFirstRow, 
                dateRowCount, shiftRowCount, isLastStop, stopIdx === 0);
              if (dateFirstRow) dateFirstRow = false;
              if (shiftFirstRow) shiftFirstRow = false;
            });
          }
        });
      });
    });

    return html;
  }

  /**
   * Render empty vehicle row
   */
  private renderEmptyVehicleRow(date: string, shift: string, vehicle: string, dateFirstRow: boolean, 
    shiftFirstRow: boolean, dateRowspan: number, shiftRowspan: number): string {
    let html = '<tr class="hover:bg-blue-50 border-b border-gray-200">';
    
    if (dateFirstRow) {
      html += `<td rowspan="${dateRowspan}" class="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-50 border-r border-gray-300 align-top">${this.escapeHtml(date)}</td>`;
    }
    if (shiftFirstRow) {
      html += `<td rowspan="${shiftRowspan}" class="px-3 py-2 text-sm font-medium text-gray-800 bg-blue-50 border-r border-gray-300 align-top">${this.escapeHtml(shift)}</td>`;
    }
    // Vehicle column (no rowspan for empty vehicle)
    html += `<td class="px-2 py-2 text-sm font-mono text-blue-700 font-semibold border-r-2 border-gray-400 align-top">${this.escapeHtml(vehicle)}</td>`;
    // Remaining columns: STT, Tên điểm, Check-in, Check-out, Sản lượng, Rớt hàng, Lấp đầy, Xử lý (8 columns)
    html += `<td class="px-2 py-2 text-sm text-gray-400 text-left align-top" colspan="8">Không có dữ liệu điểm dừng</td>`;
    html += '</tr>';
    return html;
  }

  /**
   * Render demand row
   */
  private renderDemandRow(trip: TripRow, demand: Demand, stopIdx: number, date: string, shift: string, 
    vehicle: string, dateFirstRow: boolean, shiftFirstRow: boolean, dateRowspan: number, shiftRowspan: number,
    isLastStop: boolean, isFirstStop: boolean): string {
    const borderClass = isLastStop ? 'border-b-2 border-gray-400' : 'border-b border-gray-100';
    let html = `<tr class="hover:bg-blue-50 ${borderClass}">`;

    // Date column (rowspan)
    if (dateFirstRow) {
      html += `<td rowspan="${dateRowspan}" class="px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-50 border-r border-gray-300 align-top">${this.escapeHtml(date)}</td>`;
    }

    // Shift column (rowspan)
    if (shiftFirstRow) {
      html += `<td rowspan="${shiftRowspan}" class="px-3 py-2 text-sm font-medium text-gray-800 bg-blue-50 border-r border-gray-300 align-top">${this.escapeHtml(shift)}</td>`;
    }

    // Vehicle column with metrics (rowspan for all demands)
    if (isFirstStop) {
      html += this.renderVehicleColumn(trip, date, shift, vehicle);
    }

    // STT column
    html += `<td class="px-2 py-2 text-sm text-center text-gray-700 border-r border-gray-200 bg-gray-50" style="min-width: 50px; max-width: 50px;">
      <span class="font-bold text-blue-600 text-base">${demand.stt || stopIdx + 1}</span>
    </td>`;

    // Stop name column
    html += this.renderStopNameColumn(demand, trip);

    // Check-in time column
    html += this.renderCheckinColumn(demand);

    // Check-out time column
    html += this.renderCheckoutColumn(demand);

    // Volume column
    html += this.renderVolumeColumn(demand);

    // Drop rate column
    html += this.renderDropRateColumn(demand);

    // Fill rate column
    html += this.renderFillRateColumn(demand);

    // Processing time column
    html += this.renderProcessingTimeColumn(demand);

    html += '</tr>';
    return html;
  }

  /**
   * Render vehicle column with metrics
   */
  private renderVehicleColumn(trip: TripRow, date: string, shift: string, vehicle: string): string {
    const ontimeDisplay = trip.ontimeRate !== null ? (Math.round(trip.ontimeRate * 100) / 100).toFixed(2) + '%' : '—';
    const dropDisplay = trip.dropRate !== null ? (Math.round(trip.dropRate * 100) / 100).toFixed(2) + '%' : '—';
    const fillDisplay = trip.fillRate !== null ? (Math.round(trip.fillRate * 100) / 100).toFixed(2) + '%' : '—';

    const ontimeColor = trip.ontimeRate !== null ? (trip.ontimeRate >= 90 ? 'text-emerald-600' : trip.ontimeRate >= 75 ? 'text-orange-600' : 'text-red-600') : 'text-gray-500';
    const dropColor = trip.dropRate !== null ? (trip.dropRate <= 5 ? 'text-emerald-600' : trip.dropRate <= 10 ? 'text-orange-600' : 'text-red-600') : 'text-gray-500';
    const fillColor = trip.fillRate !== null ? (trip.fillRate >= 80 ? 'text-emerald-600' : trip.fillRate >= 60 ? 'text-orange-600' : 'text-red-600') : 'text-gray-500';

    const routeKey = `route_${date}_${shift}_${vehicle}`.replace(/[^a-zA-Z0-9_]/g, '_');
    const routeDataFor3D = {
      vehicle_code: vehicle,
      date: date,
      shift: shift,
      vehicle_type: trip.truckCapacity ? (trip.truckCapacity / 1000).toFixed(1) + 'T' : '-',
      stops: trip.demands.map(d => ({
        stt: d.stt,
        stop_name: d.stop_name,
        stop_type: d.stop_type,
        distance_km: d.distance_km,
        average_speed: d.average_speed,
        expected_checkin_time: d.expected_checkin_time,
        checkin_time: d.checkin_time,
        expected_checkout_time: d.expected_checkout_time,
        checkout_time: d.checkout_time,
        pickup_weight_kg: d.pickup_weight_kg,
        delivery_weight_kg: d.delivery_weight_kg,
        loaded_weight_kg: d.loaded_weight_kg,
        drop_rate: d.drop_rate_percent ?? d.drop_rate ?? null,
        ontime_rate: d.ontime_rate,
        fill_rate: d.fill_rate
      }))
    };

    (window as any)._routeDataCache[routeKey] = routeDataFor3D;

    return `<td rowspan="${trip.demands.length}" class="px-3 py-3 border-r-2 border-gray-400 align-top bg-gradient-to-br from-orange-50 to-amber-50" style="min-width: 220px;">
      <div class="space-y-2">
        <div class="flex items-center gap-2 pb-2 border-b border-orange-200">
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span class="font-bold text-base text-orange-900">${this.escapeHtml(vehicle)}</span>
        </div>
        <div class="grid grid-cols-1 gap-1.5 text-sm">
          <div class="flex items-center justify-between px-2 py-1 bg-white rounded shadow-sm border border-orange-100">
            <span class="text-gray-600 font-medium text-xs">🚛 Loại xe:</span>
            <span class="font-bold text-orange-700">${trip.truckCapacity.toLocaleString()} Kg</span>
          </div>
          <div class="flex items-center justify-between px-2 py-1 bg-white rounded shadow-sm border border-orange-100">
            <span class="text-gray-600 font-medium text-xs">⏱️ On-time:</span>
            <span class="font-bold ${ontimeColor}">${ontimeDisplay}</span>
          </div>
          <div class="flex items-center justify-between px-2 py-1 bg-white rounded shadow-sm border border-orange-100">
            <span class="text-gray-600 font-medium text-xs">📉 Rớt hàng:</span>
            <span class="font-bold ${dropColor}">${dropDisplay}</span>
          </div>
          <div class="flex items-center justify-between px-2 py-1 bg-white rounded shadow-sm border border-orange-100">
            <span class="text-gray-600 font-medium text-xs">📦 Lấp đầy:</span>
            <span class="font-bold ${fillColor}">${fillDisplay}</span>
          </div>
        </div>
        <button 
          data-route-key="${routeKey}"
          class="btn-eval-visualize w-full mt-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          title="Mô phỏng">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Mô phỏng</span>
        </button>
      </div>
    </td>`;
  }

  /**
   * Render stop name column
   */
  private renderStopNameColumn(demand: Demand, trip: TripRow): string {
    const stopType = (demand.stop_type || '').toLowerCase();
    const isPickup = stopType.includes('lấy') || stopType.includes('pickup');
    const stopIcon = isPickup ? '📥' : '📦';
    const stopBgColor = isPickup ? 'bg-emerald-50' : 'bg-blue-50';
    const stopTextColor = isPickup ? 'text-emerald-700' : 'text-blue-700';

    const distanceKm = demand.distance_km || 0;
    const avgSpeed = demand.average_speed || 0;
    const speedColor = avgSpeed >= 40 ? 'text-emerald-600' : avgSpeed >= 25 ? 'text-orange-500' : avgSpeed >= 15 ? 'text-amber-600' : 'text-red-600';
    
    const transitTimeSec = demand.transit_time;
    const transitTimeHours = transitTimeSec != null ? (transitTimeSec / 3600.0) : null;
    const transitTimeDisplay = transitTimeHours != null ? (Math.ceil(transitTimeHours * 100) / 100).toFixed(2) + ' h' : '—';

    return `<td class="px-2 py-2 text-sm ${stopBgColor} border-r border-gray-200" style="min-width: 180px; max-width: 180px;">
      <div class="space-y-1">
        <div class="flex items-center gap-1">
          <span class="text-lg">${stopIcon}</span>
          <span class="font-semibold ${stopTextColor} truncate text-sm">${this.escapeHtml(demand.stop_name || '—')}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-600">
          <span>📍 ${distanceKm > 0 ? distanceKm.toFixed(1) : '—'} km</span>
          <span>🚗 ${avgSpeed > 0 ? avgSpeed.toFixed(1) : '—'} km/h</span>
        </div>
        <div class="flex items-center justify-center text-xs text-gray-500">
          <span>⏱ ${transitTimeDisplay}</span>
        </div>
      </div>
    </td>`;
  }

  /**
   * Render check-in time column
   */
  private renderCheckinColumn(demand: Demand): string {
    const expCheckIn = demand.expected_checkin_time;
    const actCheckIn = demand.checkin_time;
    const checkinDev = (actCheckIn && expCheckIn) ? (actCheckIn - expCheckIn) : null;

    const getCheckinColor = () => {
      if (!checkinDev) return 'text-gray-600';
      const mins = checkinDev / 60;
      if (Math.abs(mins) <= 5) return 'text-emerald-600';
      return checkinDev < 0 ? 'text-emerald-600' : 'text-red-600';
    };

    const getStatusBadge = () => {
      if (!checkinDev) return '';
      const mins = Math.round(checkinDev / 60);
      if (Math.abs(mins) <= 5) return '<span class="text-emerald-600 text-sm font-semibold">✓ Đúng giờ</span>';
      if (checkinDev < 0) return `<span class="text-emerald-600 text-sm font-semibold">↑ Sớm ${Math.abs(mins)}p</span>`;
      return `<span class="text-red-600 text-sm font-semibold">↓ Trễ ${mins}p</span>`;
    };

    return `<td class="px-2 py-2 text-sm bg-purple-50 border-r border-gray-200" style="min-width: 150px;">
      <div class="space-y-0.5">
        <div class="text-orange-600 text-sm">Kế hoạch: ${this.formatTime(expCheckIn)}</div>
        <div class="font-bold ${getCheckinColor()} text-sm">Thực tế: ${this.formatTime(actCheckIn)}</div>
        <div class="mt-1">${getStatusBadge()}</div>
      </div>
    </td>`;
  }

  /**
   * Render check-out time column
   */
  private renderCheckoutColumn(demand: Demand): string {
    const expCheckOut = demand.expected_checkout_time;
    const actCheckOut = demand.checkout_time;
    const checkoutDev = (actCheckOut && expCheckOut) ? (actCheckOut - expCheckOut) : null;

    const getCheckoutColor = () => {
      if (!checkoutDev) return 'text-gray-600';
      const mins = checkoutDev / 60;
      if (Math.abs(mins) <= 5) return 'text-emerald-600';
      return checkoutDev < 0 ? 'text-emerald-600' : 'text-red-600';
    };

    const getStatusBadge = () => {
      if (!checkoutDev) return '';
      const mins = Math.round(checkoutDev / 60);
      if (Math.abs(mins) <= 5) return '<span class="text-emerald-600 text-sm font-semibold">✓ Đúng giờ</span>';
      if (checkoutDev < 0) return `<span class="text-emerald-600 text-sm font-semibold">↑ Sớm ${Math.abs(mins)}p</span>`;
      return `<span class="text-red-600 text-sm font-semibold">↓ Trễ ${mins}p</span>`;
    };

    return `<td class="px-2 py-2 text-sm bg-purple-50 border-r border-gray-200" style="min-width: 150px;">
      <div class="space-y-0.5">
        <div class="text-orange-600 text-sm">Kế hoạch: ${this.formatTime(expCheckOut)}</div>
        <div class="font-bold ${getCheckoutColor()} text-sm">Thực tế: ${this.formatTime(actCheckOut)}</div>
        <div class="mt-1">${getStatusBadge()}</div>
      </div>
    </td>`;
  }

  /**
   * Render volume column
   */
  private renderVolumeColumn(demand: Demand): string {
    const pickup = demand.pickup_weight_kg || 0;
    const delivery = demand.delivery_weight_kg || 0;
    const loadOnTruck = demand.load_on_truck || demand.loaded_weight_kg || 0;
    const totalVolume = pickup + delivery;
    const throughput_rate = demand.throughput_rate != null ? (Math.ceil(demand.throughput_rate * 100) / 100) : null;

    return `<td class="px-2 py-2 text-sm bg-blue-50 border-r border-gray-200" style="min-width: 180px;">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-gray-600 text-xs">📥 Lấy:</span>
          <span class="font-semibold text-emerald-700 text-sm">${pickup.toLocaleString()} kg</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 text-xs">📦 Giao:</span>
          <span class="font-semibold text-blue-700 text-sm">${delivery.toLocaleString()} kg</span>
        </div>
        <div class="flex items-center justify-between pt-1 border-t-2 border-blue-300">
          <span class="text-gray-800 font-bold text-xs">📊 Tổng:</span>
          <span class="font-extrabold text-blue-900 text-2xl">${totalVolume.toLocaleString()}</span>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-blue-200">
          <span class="text-gray-700 font-semibold text-xs">🚛 Load:</span>
          <span class="font-extrabold text-orange-700 text-2xl">${loadOnTruck.toLocaleString()}</span>
        </div>
        <div class="flex items-center justify-between px-2 py-1 bg-orange-100 rounded border border-orange-300 mt-1">
          <span class="text-orange-800 font-semibold text-xs">📈 Thông lượng:</span>
          <span class="font-bold text-orange-700 text-sm">${throughput_rate != null ? throughput_rate.toFixed(2) : '—'} kg/s</span>
        </div>
      </div>
    </td>`;
  }

  /**
   * Render drop rate column
   */
  private renderDropRateColumn(demand: Demand): string {
    const dropRate = demand.drop_rate_percent != null ? demand.drop_rate_percent : (demand.drop_rate || 0);
    const dropColor = dropRate <= 3 ? 'text-emerald-700' : dropRate <= 7 ? 'text-orange-600' : 'text-red-700';
    const dropBg = dropRate <= 3 ? 'bg-emerald-50' : dropRate <= 7 ? 'bg-orange-50' : 'bg-red-50';

    return `<td class="px-2 py-2 text-center ${dropBg} border-r border-gray-200" style="min-width: 100px;">
      <div class="space-y-1">
        <div class="text-xs text-gray-600">📉 Rớt hàng</div>
        <div class="font-extrabold text-2xl ${dropColor}">${dropRate.toFixed(1)}%</div>
      </div>
    </td>`;
  }

  /**
   * Render fill rate column
   */
  private renderFillRateColumn(demand: Demand): string {
    const fillRate = demand.fill_rate != null ? demand.fill_rate : (demand.fill_rate_percent || 0);
    const fillColor = fillRate >= 80 ? 'text-emerald-700' : fillRate >= 60 ? 'text-orange-600' : fillRate >= 40 ? 'text-amber-600' : 'text-red-700';
    const fillBg = fillRate >= 80 ? 'bg-emerald-50' : fillRate >= 60 ? 'bg-orange-50' : fillRate >= 40 ? 'bg-amber-50' : 'bg-red-50';

    return `<td class="px-2 py-2 text-center ${fillBg} border-r border-gray-200" style="min-width: 100px;">
      <div class="space-y-1">
        <div class="text-xs text-gray-600">📦 Lấp đầy</div>
        <div class="font-extrabold text-2xl ${fillColor}">${fillRate.toFixed(1)}%</div>
      </div>
    </td>`;
  }

  /**
   * Render processing time column
   */
  private renderProcessingTimeColumn(demand: Demand): string {
    const proc_time_sec = demand.planned_processing_time;
    const serve_time_sec = demand.serve_time;
    const proc_time_min = proc_time_sec != null ? (Math.ceil(proc_time_sec) / 60).toFixed(2) : null;
    const serve_time_min = serve_time_sec != null ? (Math.ceil(serve_time_sec) / 60).toFixed(2) : null;

    const procTimeColor = (serve_time_min && proc_time_min) ?
      (parseFloat(serve_time_min) <= parseFloat(proc_time_min) ? 'text-emerald-700' : 'text-red-600') : 'text-orange-600';

    return `<td class="px-2 py-2 text-sm bg-amber-50 border-r border-gray-200" style="min-width: 150px;">
      <div class="space-y-2">
        <div class="flex items-center justify-between px-2 py-1.5 bg-white rounded border border-amber-200">
          <span class="font-semibold text-gray-700 text-sm">⏱️ Kế hoạch:</span>
          <span class="font-bold text-gray-800 text-base">${proc_time_min != null ? proc_time_min + ' phút' : '—'}</span>
        </div>
        <div class="flex items-center justify-between px-2 py-1.5 bg-white rounded border-2" style="border-color: ${procTimeColor === 'text-emerald-700' ? '#10b981' : procTimeColor === 'text-red-600' ? '#ef4444' : '#f97316'};">
          <span class="font-semibold text-gray-700 text-sm">⚡ Thực tế:</span>
          <span class="font-bold ${procTimeColor} text-base">${serve_time_min != null ? serve_time_min + ' phút' : '—'}</span>
        </div>
      </div>
    </td>`;
  }

  /**
   * Attach event listeners for visualization buttons
   */
  private attachVisualizationListeners(): void {
    // This can be implemented later if needed for 3D visualization
    // For now, just log that buttons were rendered
    const buttons = document.querySelectorAll('.btn-eval-visualize');
    console.log('[ForecastTableRenderer] Attached listeners to', buttons.length, 'visualization buttons');
  }

  /**
   * Format time from timestamp (seconds)
   */
  private formatTime(timestamp: number | null | undefined): string {
    if (!timestamp || typeof timestamp !== 'number') return '—';
    const totalSeconds = Math.floor(timestamp);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Format date
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN');
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string | null | undefined): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

