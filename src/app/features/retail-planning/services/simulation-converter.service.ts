import { Injectable } from '@angular/core';
import { SimulationResponse, VehicleTrip, Stop } from './simulation.service';

export interface PlanItem {
  date: string;
  plan: {
    id: string | null;
    shifts: Shift[];
    meta?: { date: string; source: string };
  };
}

export interface Shift {
  shift_name: string;
  vehicles: Vehicle[];
}

export interface Vehicle {
  vehicle_id: string;
  number_plate?: string | null;
  vehicle_payload_capacity_kg?: number | null;
  total_distance_km: number;
  total_delivery_weight_kg: number;
  total_pickup_weight_kg: number;
  shift_start_time?: number | null;
  ontime_rate_percent?: number | null;
  ontime_rate?: number | null;
  drop_rate_percent?: number | null;
  drop_rate?: number | null;
  fill_rate_percent?: number | null;
  fill_rate?: number | null;
  demands: Demand[];
  total_stops: number;
}

export interface Demand {
  [key: string]: any; // Allow additional properties
  stt: number;
  stop_name: string;
  stop_type: string;
  expected_checkin_time?: number | null;
  expected_checkout_time?: number | null;
  checkin_time?: number | null;
  checkout_time?: number | null;
  actual_checkin_time?: number | null;
  actual_checkout_time?: number | null;
  processing_time?: number | null;
  transit_time?: number | null;
  distance_km: number;
  pickup_weight_kg: number;
  delivery_weight_kg: number;
  loaded_weight_kg: number;
  vehicle_payload_capacity_kg?: number | null;
  average_speed?: number | null;
  drop_rate?: number | null;
  ontime_rate?: number | null;
  fill_rate?: number | null;
  extra?: {};
}

@Injectable({
  providedIn: 'root'
})
export class SimulationConverterService {
  
  /**
   * Convert API response to plan items format expected by table renderer
   */
  convertPredictResponseToPlan(data: SimulationResponse): PlanItem[] {
    const out: PlanItem[] = [];
    if (!data || !data.schedule) return out;

    Object.keys(data.schedule).forEach(dateKey => {
      const day = data.schedule[dateKey];
      if (!day) return;

      const vehicleTrips = Array.isArray(day.vehicle_trips) ? day.vehicle_trips : [];
      const shiftsMap = new Map<string, Vehicle[]>();

      vehicleTrips.forEach(vt => {
        const shiftName = vt.shift_name || 'Unknown';
        if (!shiftsMap.has(shiftName)) {
          shiftsMap.set(shiftName, []);
        }

        const demands = this.convertStopsToDemands(vt.stops, vt);
        const totalPickup = demands.reduce((sum, d) => sum + (d.pickup_weight_kg || 0), 0);
        const totalDelivery = demands.reduce((sum, d) => sum + (d.delivery_weight_kg || 0), 0);

        const vehicleObj: Vehicle = {
          vehicle_id: vt.vehicle_id || 'unknown',
          number_plate: vt.number_plate || null,
          vehicle_payload_capacity_kg: vt.vehicle_payload_capacity_kg || null,
          total_distance_km: vt.total_distance_km != null ? vt.total_distance_km : 0,
          total_delivery_weight_kg: totalDelivery,
          total_pickup_weight_kg: totalPickup,
          shift_start_time: vt.stops && vt.stops.length > 0 && vt.stops[0].planned_checkin_time 
            ? vt.stops[0].planned_checkin_time 
            : null,
          ontime_rate_percent: vt.ontime_rate_percent ?? vt.ontime_rate ?? null,
          drop_rate_percent: vt.drop_rate_percent ?? vt.drop_rate ?? null,
          fill_rate_percent: vt.fill_rate_percent ?? vt.fill_rate ?? null,
          demands: demands,
          total_stops: demands.length
        };

        shiftsMap.get(shiftName)!.push(vehicleObj);
      });

      const shifts: Shift[] = Array.from(shiftsMap.entries()).map(([shift_name, vehicles]) => ({
        shift_name,
        vehicles
      }));

      const planIdForDay = day.plan_id || data.id || null;
      out.push({
        date: dateKey,
        plan: {
          id: planIdForDay || '',
          shifts: shifts,
          meta: { date: dateKey, source: 'predict' }
        }
      });
    });

    return out;
  }

  /**
   * Convert stops array to demands array
   */
  private convertStopsToDemands(stops: Stop[], vehicleTrip: VehicleTrip): Demand[] {
    if (!Array.isArray(stops)) return [];

    return stops.map((s, idx) => {
      const stopName = s.original_stop_name || s.stop_name || s.name || (`Stop ${idx + 1}`);
      // Prioritize actual values from API, fallback to planned values
      const pickupWeight = s.pickup_weight_kg != null 
        ? s.pickup_weight_kg 
        : (s.planned_pickup_weight_kg != null ? s.planned_pickup_weight_kg : 0);
      const deliveryWeight = s.delivery_weight_kg != null 
        ? s.delivery_weight_kg 
        : (s.planned_delivery_weight_kg != null ? s.planned_delivery_weight_kg : 0);

      return {
        ...s,
        stt: s.original_stt || s.stt || s.sequence || (idx + 1),
        stop_name: stopName,
        stop_type: s.stop_type || (pickupWeight > 0 ? 'Điểm lấy' : 'Điểm giao'),
        expected_checkin_time: s.planned_checkin_time || s.expected_checkin_time || null,
        expected_checkout_time: s.planned_checkout_time || s.expected_checkout_time || null,
        checkin_time: s.check_in || s.checkin_time || null,
        checkout_time: s.check_out || s.checkout_time || null,
        actual_checkin_time: s.actual_checkin_time || null,
        actual_checkout_time: s.actual_checkout_time || null,
        processing_time: s.serve_time || s.processing_time || null,
        transit_time: s.transit_time || null,
        distance_km: s.planned_distance_km != null ? s.planned_distance_km : (s.distance_km || 0),
        pickup_weight_kg: pickupWeight,
        delivery_weight_kg: deliveryWeight,
        loaded_weight_kg: s.load_on_truck != null ? s.load_on_truck : (pickupWeight + deliveryWeight),
        vehicle_payload_capacity_kg: vehicleTrip.vehicle_payload_capacity_kg || null,
        average_speed: s.speed_kmh || s.average_speed || null,
        drop_rate: s.drop_rate_percent != null ? s.drop_rate_percent : (s.drop_rate || null),
        ontime_rate: s.ontime_rate_percent != null 
          ? s.ontime_rate_percent 
          : (s.is_ontime != null ? (s.is_ontime ? 100 : 0) : (s.ontime_rate || null)),
        fill_rate: s.fill_rate_percent != null ? s.fill_rate_percent : (s.fill_rate || null),
        extra: s.extra || {}
      };
    });
  }
}
