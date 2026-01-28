import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService, Plan } from '../../services/plan.service';

interface Shift {
  id?: string;
  name?: string;
  shift_name?: string;
  vehicles?: Vehicle[];
  start_time?: string;
  end_time?: string;
  [key: string]: any;
}

interface Vehicle {
  id?: string;
  vehicle_id?: string;
  name?: string;
  type?: string;
  demands?: Demand[];
  route?: any[];
  vehicle_payload_capacity_kg?: number;
  [key: string]: any;
}

interface Demand {
  id?: string;
  stt?: number;
  stop_name?: string;
  stop_type?: string;
  location?: string;
  time_window?: string;
  weight?: number;
  pickup_weight_kg?: number;
  delivery_weight_kg?: number;
  pickup_quantity?: number;
  delivery_quantity?: number;
  distance_km?: number;
  expected_checkin_time?: number;
  expected_checkout_time?: number;
  processing_time?: number;
  travel_time?: number;
  [key: string]: any;
}

interface PlanStats {
  totalShifts: number;
  totalVehicles: number;
  vehiclesNCC: number;
  vehiclesGHN: number;
  totalPickupQty: number;
  totalPickupKg: number;
  totalDeliveryQty: number;
  totalDeliveryKg: number;
  totalStops: number;
  totalDistanceKm: number;
  totalPayloadUsed: number;
  totalPayloadCapacity: number;
}

interface OverviewStats {
  vehicleUtilization: number;
  nccRatio: number;
  ghnRatio: number;
  pickupRatio: number;
  deliveryRatio: number;
}

@Component({
  selector: 'app-plan-preview',
  imports: [CommonModule],
  templateUrl: './plan-preview.component.html',
  styleUrls: ['./plan-preview.component.css'],
})
export class PlanPreviewComponent implements OnChanges, OnInit {
  @Input() plan: Plan | null = null;
  @Input() planId?: string | null;

  activeShiftIndex = 0;
  shifts: Shift[] = [];
  previewView: 'timeline' | 'table' = 'timeline';
  loading = false;
  error: string | null = null;
  planStats: PlanStats | null = null;
  overviewStats: OverviewStats | null = null;
  Math = Math; // Expose Math to template

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService
  ) { }

  ngOnInit(): void {
    // Check if planId is provided in route
    this.route.params.subscribe(params => {
      this.planId = params['id'];
      if (this.planId && !this.plan) {
        this.loadPlanById(this.planId);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plan'] && this.plan) {
      this.parsePlanData();
      this.calculateStats();
      this.cdr.detectChanges();
      
      // Update window state for compatibility with other components (e.g., simulation)
      try {
        (window as any).planningState = (window as any).planningState || {};
        (window as any).planningState.currentPlan = this.plan;
        (window as any).planningState.selectedPlan = this.plan;
        (window as any).planningState.selectedPlanId = (this.plan as any).id || (this.plan as any).uuid || null;
      } catch (e) {
        console.warn('Failed to update planningState:', e);
      }
    }

    // If parent provided a planId (uuid) and we don't have the full plan, fetch it
    if (changes['planId'] && this.planId && !this.plan) {
      try {
        this.loadPlanById(this.planId);
      } catch (e) {
        console.warn('Failed to load plan by id from Input planId', e);
      }
    }
  }

  async loadPlanById(planId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      this.planService.getPlan(planId).subscribe({
        next: (resp) => {
          if (resp && resp.ok && resp.data) {
            // Unwrap API response shape
            const unwrap = (obj: any, maxDepth = 3) => {
              let cur = obj;
              let depth = 0;
              while (cur && depth < maxDepth && typeof cur === 'object' && ('data' in cur) && cur.data && typeof cur.data === 'object') {
                if (cur.data === cur) break;
                cur = cur.data;
                depth += 1;
              }
              return cur;
            };

            this.plan = unwrap(resp.data) as Plan;
            this.plan = this.normalizePlan(this.plan);
            this.parsePlanData();
            this.calculateStats();
            
            // Update window state
            try {
              (window as any).planningState = (window as any).planningState || {};
              (window as any).planningState.currentPlan = this.plan;
              (window as any).planningState.selectedPlan = this.plan;
              (window as any).planningState.selectedPlanId = (this.plan as any).id || (this.plan as any).uuid || null;
            } catch (e) {
              console.warn('Failed to update planningState:', e);
            }
          } else {
            this.error = 'Không thể tải plan từ API';
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching plan:', err);
          this.error = 'Failed to load plan details';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      this.error = 'Failed to load plan details';
      console.error('Error loading plan:', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private normalizePlan(plan: Plan): Plan {
    if (!plan) return plan;

    // If already has shifts array, ensure proper structure
    if (Array.isArray((plan as any).shifts) && (plan as any).shifts.length > 0) {
      (plan as any).shifts.forEach((s: any) => {
        s.vehicles = Array.isArray(s.vehicles) ? s.vehicles : [];
        s.shift_name = s.shift_name || s.name || s.id || 'Shift';
        s.vehicles.forEach((v: any) => {
          v.demands = Array.isArray(v.demands) ? v.demands : [];
        });
      });
      return plan;
    }

    // Normalize different plan shapes
    const normalized: any = { ...plan };

    if (Array.isArray((plan as any).data) && (plan as any).data.length > 0) {
      normalized.shifts = (plan as any).data.map((s: any, idx: number) => ({
        shift_name: s.name || s.shift_name || `Shift ${idx + 1}`,
        vehicles: Array.isArray(s.vehicles) ? s.vehicles : (s.vehicles_list || [])
      }));
    } else if (Array.isArray((plan as any).vehicles) && (plan as any).vehicles.length > 0) {
      normalized.shifts = [{ shift_name: 'Shift 1', vehicles: (plan as any).vehicles }];
    } else if ((plan as any).routes && Array.isArray((plan as any).routes)) {
      normalized.shifts = [{ 
        shift_name: 'Shift 1', 
        vehicles: (plan as any).routes.map((r: any) => ({ 
          vehicle_id: r.vehicle_id, 
          demands: r.stops || [] 
        })) 
      }];
    } else {
      normalized.shifts = [{ shift_name: 'Shift 1', vehicles: [] }];
    }

    // Ensure each vehicle has demands array and expected fields
    normalized.shifts.forEach((s: any) => {
      s.vehicles = Array.isArray(s.vehicles) ? s.vehicles : [];
      s.vehicles = s.vehicles.map((v: any, vidx: number) => {
        const vehicle = { ...v };
        vehicle.vehicle_id = vehicle.vehicle_id || vehicle.id || vehicle.vehicleId || `vehicle-${vidx + 1}`;
        vehicle.demands = Array.isArray(vehicle.demands) ? vehicle.demands : (vehicle.stops || vehicle.demands_list || []);
        vehicle.demands = vehicle.demands.map((d: any, didx: number) => ({
          stt: d.stt || didx + 1,
          stop_name: d.stop_name || d.name || d.address || `Stop ${didx + 1}`,
          stop_type: d.stop_type || (d.is_pickup ? 'pickup' : (d.is_delivery ? 'delivery' : 'delivery')),
          distance_km: d.distance_km || d.distance || 0,
          pickup_weight_kg: d.pickup_weight_kg || d.pickup_weight || d.weight_pickup || 0,
          delivery_weight_kg: d.delivery_weight_kg || d.delivery_weight || d.weight_delivery || 0,
          pickup_quantity: d.pickup_quantity || 0,
          delivery_quantity: d.delivery_quantity || 0,
          expected_checkin_time: d.expected_checkin_time,
          expected_checkout_time: d.expected_checkout_time,
          processing_time: d.processing_time,
          travel_time: d.travel_time,
          ...d
        }));
        return vehicle;
      });
    });

    return normalized as Plan;
  }

  private parsePlanData(): void {
    if (!this.plan) return;

    // Handle basic plan structure (numbers instead of arrays)
    if (typeof this.plan.shifts === 'number' && typeof this.plan.vehicles === 'number') {
      this.shifts = [{
        id: 'shift-1',
        name: 'Ca làm việc chính',
        shift_name: 'Ca làm việc chính',
        vehicles: [],
        start_time: '06:00',
        end_time: '18:00'
      }];
      (this.shifts[0] as any).totalVehicles = this.plan.vehicles;
      (this.shifts[0] as any).totalShifts = this.plan.shifts;
    } else {
      // Handle detailed plan structure
      this.shifts = (this.plan as any).shifts || [];

      // If no shifts array, try to create from plan structure
      if (!this.shifts.length && this.plan.data) {
        const data = this.plan.data;
        if (Array.isArray(data)) {
          this.shifts = data.map((shift, index) => ({
            id: `shift-${index}`,
            name: shift.name || `Shift ${index + 1}`,
            shift_name: shift.name || shift.shift_name || `Shift ${index + 1}`,
            vehicles: shift.vehicles || [],
            ...shift
          }));
        }
      }
    }
  }

  private calculateStats(): void {
    if (!this.plan || !(this.plan as any).shifts) {
      this.planStats = null;
      this.overviewStats = null;
      return;
    }

    const shifts = (this.plan as any).shifts || [];
    const stats: PlanStats = {
      totalShifts: shifts.length,
      totalVehicles: 0,
      vehiclesNCC: 0,
      vehiclesGHN: 0,
      totalPickupQty: 0,
      totalPickupKg: 0,
      totalDeliveryQty: 0,
      totalDeliveryKg: 0,
      totalStops: 0,
      totalDistanceKm: 0,
      totalPayloadUsed: 0,
      totalPayloadCapacity: 0
    };

    shifts.forEach((shift: Shift) => {
      const vehicles = shift.vehicles || [];
      stats.totalVehicles += vehicles.length;

      vehicles.forEach((v: Vehicle) => {
        const vehicleId = ((v.vehicle_id || v.id || '').toString().toUpperCase());
        if (vehicleId.includes('NCC')) stats.vehiclesNCC++;
        else if (vehicleId.includes('GHN')) stats.vehiclesGHN++;

        const capacity = v.vehicle_payload_capacity_kg || 2000;
        stats.totalPayloadCapacity += capacity;

        let maxWeight = 0;
        let currentWeight = 0;

        const demands = v.demands || [];
        stats.totalStops += demands.length;

        demands.forEach((d: Demand) => {
          stats.totalPickupQty += (d.pickup_quantity || 0);
          stats.totalPickupKg += (d.pickup_weight_kg || 0);
          stats.totalDeliveryQty += (d.delivery_quantity || 0);
          stats.totalDeliveryKg += (d.delivery_weight_kg || 0);
          stats.totalDistanceKm += (d.distance_km || 0);

          // Track max weight for utilization
          currentWeight += (d.pickup_weight_kg || 0);
          currentWeight -= (d.delivery_weight_kg || 0);
          maxWeight = Math.max(maxWeight, currentWeight);
        });

        stats.totalPayloadUsed += maxWeight;
      });
    });

    this.planStats = stats;

    // Calculate overview stats
    const vehicleUtilization = stats.totalPayloadCapacity > 0 
      ? (stats.totalPayloadUsed / stats.totalPayloadCapacity) * 100 
      : 0;
    
    const nccRatio = stats.totalVehicles > 0 
      ? (stats.vehiclesNCC / stats.totalVehicles) * 100 
      : 0;
    
    const ghnRatio = stats.totalVehicles > 0 
      ? (stats.vehiclesGHN / stats.totalVehicles) * 100 
      : 0;
    
    const totalWeight = stats.totalPickupKg + stats.totalDeliveryKg;
    const pickupRatio = totalWeight > 0 
      ? (stats.totalPickupKg / totalWeight) * 100 
      : 0;
    
    const deliveryRatio = totalWeight > 0 
      ? (stats.totalDeliveryKg / totalWeight) * 100 
      : 0;

    this.overviewStats = {
      vehicleUtilization,
      nccRatio,
      ghnRatio,
      pickupRatio,
      deliveryRatio
    };
  }

  switchToShift(index: number): void {
    if (index >= 0 && index < this.shifts.length) {
      this.activeShiftIndex = index;
    }
  }

  setPreviewView(view: 'timeline' | 'table'): void {
    this.previewView = view;
  }

  getActiveShift(): Shift | null {
    return this.shifts[this.activeShiftIndex] || null;
  }

  getShiftIcon(index: number): string {
    const icons = ['🌅', '☀️', '🌆', '🌙'];
    return icons[index % icons.length];
  }

  getVehiclePickupWeight(vehicle: Vehicle): number {
    if (!vehicle.demands) return 0;
    return vehicle.demands.reduce((total, d) => total + (d.pickup_weight_kg || 0), 0);
  }

  getVehicleDeliveryWeight(vehicle: Vehicle): number {
    if (!vehicle.demands) return 0;
    return vehicle.demands.reduce((total, d) => total + (d.delivery_weight_kg || 0), 0);
  }

  getVehicleDistance(vehicle: Vehicle): number {
    if (!vehicle.demands) return 0;
    return vehicle.demands.reduce((total, d) => total + (d.distance_km || 0), 0);
  }

  formatTimeOfDay(seconds: number | undefined | null): string {
    if (seconds == null) return '';
    const s = Number(seconds);
    if (!Number.isFinite(s)) return '';
    const sec = Math.max(0, Math.floor(s));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${this.pad2(h)}:${this.pad2(m)}`;
  }

  formatDuration(seconds: number | undefined | null): string {
    if (seconds == null) return '';
    const s = Number(seconds);
    if (!Number.isFinite(s)) return '';
    const sec = Math.max(0, Math.floor(s));
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.floor(sec / 60)} phút`;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  }

  formatKg(n: number | undefined | null): string {
    if (n === null || n === undefined) return '-';
    return n === 0 || n ? n + ' kg' : '-';
  }

  formatKm(n: number | undefined | null): string {
    if (n === null || n === undefined) return '-';
    return n === 0 || n ? n + ' km' : '-';
  }

  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }
}
