import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService } from '../../services/plan.service';

interface CostBreakdown {
  costType: string;
  routeType: string;
  capacity: number;
  vehicleCount: number;
  tripCount: number;
  distance: number;
  avgFill: number;
  fuel: number;
  salary: number;
  vendor: number;
  other?: number;
  totalCost: number;
}

interface CostTotals {
  totalCost: number;
  fuelCost: number;
  salaryCost: number;
  vendorCost: number;
  otherCost: number;
  totalDistance: number;
}

@Component({
  selector: 'app-cost-estimation',
  imports: [CommonModule],
  templateUrl: './cost-estimation.component.html',
  styleUrls: ['./cost-estimation.component.css'],
})
export class CostEstimationComponent implements OnInit {
  loading = false;
  canCalculate = false;
  showResults = false;
  costBreakdown: CostBreakdown[] = [];
  totals: CostTotals = {
    totalCost: 0,
    fuelCost: 0,
    salaryCost: 0,
    vendorCost: 0,
    otherCost: 0,
    totalDistance: 0
  };

  // Cost rates (VND per km)
  private readonly FUEL_RATE_GHN = 3500;    // 3,500 VND/km for GHN vehicles
  private readonly FUEL_RATE_NCC = 4500;    // 4,500 VND/km for NCC vehicles
  private readonly SALARY_RATE_GHN = 2000;  // 2,000 VND/km for GHN drivers
  private readonly VENDOR_RATE_NCC = 5000;  // 5,000 VND/km for NCC vendor cost

  constructor(
    private cdr: ChangeDetectorRef,
    private planService: PlanService
  ) {}

  ngOnInit() {
    this.checkPlanAvailability();
  }

  private checkPlanAvailability() {
    try {
      const planningState = (window as any).planningState;
      const hasPlan = !!(planningState?.currentPlan || planningState?.selectedPlan);
      this.canCalculate = hasPlan;
    } catch (e) {
      console.warn('Error checking plan availability:', e);
      this.canCalculate = false;
    }
  }

  async calculateCost() {
    if (!this.canCalculate) {
      alert('Vui lòng chọn plan trước');
      return;
    }

    this.loading = true;
    this.showResults = false;

    try {
      // Get current plan from window state
      const planningState = (window as any).planningState;
      const plan = planningState?.currentPlan || planningState?.selectedPlan;

      if (!plan) {
        throw new Error('Không tìm thấy plan để tính chi phí');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Calculate cost breakdown
      const results = this.calculateCostBreakdown(plan);
      
      this.costBreakdown = results.breakdown;
      this.totals = results.totals;
      this.showResults = true;

    } catch (error: any) {
      console.error('Error calculating cost:', error);
      alert('Lỗi khi tính chi phí: ' + (error?.message || 'Unknown error'));
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private calculateCostBreakdown(plan: any): { breakdown: CostBreakdown[], totals: CostTotals } {
    if (!plan || !plan.shifts) {
      return {
        breakdown: [],
        totals: {
          totalCost: 0,
          fuelCost: 0,
          salaryCost: 0,
          vendorCost: 0,
          otherCost: 0,
          totalDistance: 0
        }
      };
    }

    const costBreakdown: CostBreakdown[] = [];
    let totalFuel = 0;
    let totalSalary = 0;
    let totalVendor = 0;
    let totalDistance = 0;

    // Group by cost type (NCC vs GHN)
    const costGroups: { [key: string]: CostBreakdown } = {};

    const shifts = Array.isArray(plan.shifts) ? plan.shifts : [];

    shifts.forEach((shift: any) => {
      const vehicles = Array.isArray(shift.vehicles) ? shift.vehicles : [];

      vehicles.forEach((vehicle: any) => {
        const vehicleId = ((vehicle.vehicle_id || vehicle.id || '').toString().toUpperCase());
        const isNCC = vehicleId.includes('NCC');
        const isGHN = vehicleId.includes('GHN') || !isNCC; // Default to GHN if not NCC

        const costType = isNCC ? 'NCC' : 'GHN';
        const routeType = shift.shift_name || shift.name || 'Unknown';
        const capacity = vehicle.vehicle_payload_capacity_kg || 2000;

        // Calculate vehicle total distance and weight
        let vehicleDistance = 0;
        let totalWeight = 0;
        let stopCount = 0;

        const demands = Array.isArray(vehicle.demands) ? vehicle.demands : [];
        demands.forEach((d: any) => {
          vehicleDistance += (d.distance_km || 0);
          totalWeight += (d.pickup_weight_kg || 0) + (d.delivery_weight_kg || 0);
          stopCount++;
        });

        if (vehicleDistance === 0) return; // Skip if no distance

        // Create group key
        const groupKey = `${costType}-${routeType}-${capacity}`;

        if (!costGroups[groupKey]) {
          costGroups[groupKey] = {
            costType,
            routeType,
            capacity,
            vehicleCount: 0,
            tripCount: 0,
            distance: 0,
            avgFill: 0,
            fuel: 0,
            salary: 0,
            vendor: 0,
            other: 0,
            totalCost: 0
          };
        }

        const group = costGroups[groupKey];
        group.vehicleCount++;
        group.tripCount++;
        group.distance += vehicleDistance;

        // Calculate costs
        let fuelCost = 0;
        let salaryCost = 0;
        let vendorCost = 0;

        if (isNCC) {
          fuelCost = vehicleDistance * this.FUEL_RATE_NCC;
          vendorCost = vehicleDistance * this.VENDOR_RATE_NCC;
        } else {
          fuelCost = vehicleDistance * this.FUEL_RATE_GHN;
          salaryCost = vehicleDistance * this.SALARY_RATE_GHN;
        }

        group.fuel += fuelCost;
        group.salary += salaryCost;
        group.vendor += vendorCost;
        group.totalCost += fuelCost + salaryCost + vendorCost;

        // Calculate fill rate for this vehicle
        const avgFill = capacity > 0 && stopCount > 0 
          ? ((totalWeight / stopCount / capacity) * 100) 
          : 0;
        
        // Update average fill rate (weighted by distance)
        const totalDistanceSoFar = group.distance;
        group.avgFill = totalDistanceSoFar > 0 
          ? ((group.avgFill * (totalDistanceSoFar - vehicleDistance)) + (avgFill * vehicleDistance)) / totalDistanceSoFar
          : avgFill;

        totalFuel += fuelCost;
        totalSalary += salaryCost;
        totalVendor += vendorCost;
        totalDistance += vehicleDistance;
      });
    });

    // Convert groups to array
    const breakdown = Object.values(costGroups);

    const grandTotal = totalFuel + totalSalary + totalVendor;

    return {
      breakdown,
      totals: {
        totalCost: grandTotal,
        fuelCost: totalFuel,
        salaryCost: totalSalary,
        vendorCost: totalVendor,
        otherCost: 0,
        totalDistance
      }
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
