import { Injectable } from '@angular/core';
import { PlanItem, Vehicle, Demand } from './simulation-converter.service';

export interface Trip {
  date: string;
  shift: string;
  vehicle: string;
  tripCode: string;
  route: string;
  demands: Demand[];
  stopType: string;
  truckCapacity: number;
  province: string;
  routeType: string;
  numLegs: number;
  distance: number;
  speed: string;
  startTime: number | string;
  expectedCheckin: number | string;
  expectedCheckout: number | string;
  actualCheckin: number | string;
  actualCheckout: number | string;
  processingTime: string;
  totalOrders: number;
  availableGoods: number;
  loadedGoods: number;
  ontimeRate: number;
  dropRate: number | null;
  stopFillRate: number;
  tripFillRate: number;
  fillRate: number;
  fuelConsumption: string;
  ontime_rate_percent?: number | null;
  drop_rate_percent?: number | null;
  fill_rate_percent?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class TripBuilderService {

  /**
   * Build trips from plan data
   */
  buildTripsFromPlan(planData: PlanItem['plan'], dateObj: Date | string, modelLabel: string = 'Forecast2'): Trip[] {
    const trips: Trip[] = [];
    if (!planData || !Array.isArray(planData.shifts)) return trips;

    const dateStr = this.formatDateForTable(dateObj);

    planData.shifts.forEach(shift => {
      const shiftName = shift.shift_name || '';
      const vehicles = Array.isArray(shift.vehicles) ? shift.vehicles : [];
      
      vehicles.forEach(vehicle => {
        const vid = vehicle.vehicle_id || 'N/A';
        const demands = Array.isArray(vehicle.demands) ? vehicle.demands : [];

        const first: any = demands[0] || {};
        const last: any = demands[demands.length - 1] || first || {};

        const payloadCap = (first as any).vehicle_payload_capacity_kg || vehicle.vehicle_payload_capacity_kg || 0;
        const totalDelivery = vehicle.total_delivery_weight_kg != null ? vehicle.total_delivery_weight_kg : 0;
        const totalPickup = vehicle.total_pickup_weight_kg != null ? vehicle.total_pickup_weight_kg : 0;
        const loadedGoods = (Number(totalDelivery) + Number(totalPickup)) || 0;
        const availableGoods = loadedGoods; // forecast: assume available==loaded

        const dist = vehicle.total_distance_km != null 
          ? Number(vehicle.total_distance_km) 
          : demands.reduce((s, d) => s + (d.distance_km || 0), 0);

        const fillPercent = payloadCap > 0 ? Math.min(100, Math.round((loadedGoods / payloadCap) * 100)) : 0;

        // Helper to normalize percent-like values (accepts ratio 0..1 or percent 0..100)
        const toPercent = (v: any): number | null => {
          if (v === null || v === undefined) return null;
          const n = Number(v);
          if (Number.isNaN(n)) return null;
          return Math.abs(n) <= 1 ? n * 100 : n;
        };

        const vehicleOntimeRaw = vehicle.ontime_rate_percent ?? vehicle.ontime_rate ?? null;
        const vehicleDropRaw = vehicle.drop_rate_percent ?? vehicle.drop_rate ?? null;
        const vehicleFillRaw = vehicle.fill_rate_percent ?? vehicle.fill_rate ?? null;

        const vehicleOntimePct = toPercent(vehicleOntimeRaw);
        const vehicleDropPct = toPercent(vehicleDropRaw);
        const vehicleFillPct = toPercent(vehicleFillRaw);

        trips.push({
          date: dateStr,
          shift: shiftName,
          vehicle: vid,
          tripCode: `${shiftName}_${vid}`,
          route: (demands.length > 1) ? `${first.stop_name} → ${last.stop_name}` : (first.stop_name || ''),
          demands: demands,
          stopType: first.stop_type || '',
          truckCapacity: payloadCap,
          province: '',
          routeType: modelLabel || 'Plan',
          numLegs: vehicle.total_stops || demands.length || 0,
          distance: Math.round(dist * 100) / 100,
          speed: '',
          startTime: vehicle.shift_start_time || first.expected_checkin_time || '',
          expectedCheckin: first.expected_checkin_time || '',
          expectedCheckout: last.expected_checkout_time || '',
          actualCheckin: first.checkin_time || first.expected_checkin_time || '',
          actualCheckout: last.checkout_time || last.expected_checkout_time || '',
          processingTime: '',
          totalOrders: vehicle.total_stops || demands.length || 0,
          availableGoods: availableGoods,
          loadedGoods: loadedGoods,
          ontimeRate: (vehicleOntimePct !== null) ? vehicleOntimePct : 100,
          dropRate: vehicleDropPct,
          stopFillRate: (vehicleFillPct !== null) ? vehicleFillPct : fillPercent,
          tripFillRate: (vehicleFillPct !== null) ? vehicleFillPct : fillPercent,
          fillRate: (vehicleFillPct !== null) ? vehicleFillPct : fillPercent,
          fuelConsumption: (dist * 0.25).toFixed(2),
          ontime_rate_percent: vehicleOntimePct,
          drop_rate_percent: vehicleDropPct,
          fill_rate_percent: vehicleFillPct
        });
      });
    });

    return trips;
  }

  /**
   * Format date for table display
   */
  private formatDateForTable(dateObj: Date | string): string {
    let date: Date;
    if (dateObj instanceof Date) {
      date = dateObj;
    } else if (typeof dateObj === 'string') {
      date = new Date(dateObj);
    } else {
      date = new Date();
    }

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
