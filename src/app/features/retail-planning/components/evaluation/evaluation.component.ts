import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService, Plan } from '../../services/plan.service';

interface KPIConfig {
  name: string;
  unit: string;
  key: string;
  target: number | null;
  formula?: string;
  inverse?: boolean;
}

interface KPIGroup {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
  kpis: KPIConfig[];
}

interface EvaluationResult {
  group: string;
  groupId: number;
  groupColor: string;
  kpiIndex: string;
  kpiKey: string;
  kpiName: string;
  formula?: string;
  unit: string;
  history?: string;
  plan: string | number;
  actual: string | number;
  diff: string;
  diffPercent?: number;
  achieved: string;
  note: string;
  inverse?: boolean;
}

@Component({
  selector: 'app-evaluation',
  imports: [CommonModule],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css'],
})
export class EvaluationComponent implements OnInit {
  canEvaluate = false;
  showDashboard = false;
  loading = false;
  overallScore = 0;
  efficiency = '--';
  ontime = '--';
  cost = '--';
  quality = '--';
  evaluationResults: EvaluationResult[] = [];
  hasActualData = false; // Flag to distinguish skeleton from actual data
  expandedGroups: Set<number> = new Set([1, 2, 3, 4, 5, 6, 7]); // All groups expanded by default

  // KPI Groups Configuration (7 nhóm tiêu chí)
  kpiGroups: KPIGroup[] = [
    {
      id: 1,
      name: '1️⃣ Hiệu quả khai thác',
      icon: '📊',
      description: 'Utilization & Efficiency',
      color: 'green',
      kpis: [
        { name: 'Tổng số xe', unit: 'xe', key: 'total_vehicles', target: null },
        { name: 'Tỷ lệ sử dụng xe', unit: '%', key: 'truck_utilization', target: 80, formula: 'Thời gian xe chạy có hàng / Tổng thời gian sẵn sàng' },
        { name: 'Tỷ lệ sử dụng tải trọng', unit: '%', key: 'capacity_utilization', target: 75, formula: 'Sản lượng thực tế / Sức chứa thiết kế' },
        { name: 'Năng suất', unit: 'đơn/ngày', key: 'throughput', target: null, formula: 'Tổng đơn giao + lấy / Thời gian thực hiện' },
        { name: 'Thời gian chờ', unit: '%', key: 'idle_time', target: 15, formula: 'Thời gian xe chờ / Tổng thời gian ca', inverse: true },
        { name: 'Số chuyến / xe', unit: 'chuyến/xe', key: 'trips_per_truck', target: 5 }
      ]
    },
    {
      id: 2,
      name: '2️⃣ Đúng giờ & độ tin cậy',
      icon: '⏰',
      description: 'On-time & Reliability',
      color: 'blue',
      kpis: [
        { name: 'Tỷ lệ lấy hàng đúng giờ', unit: '%', key: 'ontime_pickup_rate', target: 90 },
        { name: 'Tỷ lệ giao hàng đúng giờ', unit: '%', key: 'ontime_delivery_rate', target: 95 },
        { name: 'Tuân thủ lịch trình', unit: '%', key: 'schedule_adherence', target: 85, formula: 'Số điểm check-in đúng lịch / Tổng điểm' },
        { name: 'Độ trễ P90', unit: 'phút', key: 'p90_delay', target: 30, inverse: true },
        { name: 'Độ trễ P95', unit: 'phút', key: 'p95_delay', target: 45, inverse: true },
        { name: 'Phương sai thời gian đến', unit: 'phút', key: 'variance_arrival', target: 20, inverse: true }
      ]
    },
    {
      id: 3,
      name: '3️⃣ Chất lượng lịch tải',
      icon: '🎯',
      description: 'Schedule Quality',
      color: 'purple',
      kpis: [
        { name: 'Tỷ lệ xung đột', unit: '%', key: 'conflict_rate', target: 5, formula: 'Trùng giờ – trùng xe – trùng tài xế', inverse: true },
        { name: 'Tỷ lệ khả thi', unit: '%', key: 'feasibility_rate', target: 95, formula: 'Lịch chạy được / Lịch tạo ra' },
        { name: 'Tần suất sắp xếp lại', unit: 'lần/ngày', key: 'reschedule_freq', target: 2, inverse: true },
        { name: 'Thời gian đệm', unit: '%', key: 'buffer_time', target: 80, formula: 'Thời gian đệm / Thời gian chuẩn' }
      ]
    },
    {
      id: 4,
      name: '4️⃣ Chi phí & hiệu quả kinh tế',
      icon: '💰',
      description: 'Cost & Economic Efficiency',
      color: 'yellow',
      kpis: [
        { name: 'Chi phí / đơn hàng', unit: 'đ/đơn', key: 'cost_per_order', target: 50000, inverse: true },
        { name: 'Chi phí / chuyến', unit: 'đ/chuyến', key: 'cost_per_trip', target: 500000, inverse: true },
        { name: 'Chi phí nhiên liệu / km', unit: 'đ/km', key: 'fuel_cost_per_km', target: 8000, inverse: true },
        { name: 'Chi phí tăng ca', unit: '%', key: 'overtime_cost', target: 10, inverse: true },
        { name: 'Chênh lệch chi phí', unit: '%', key: 'cost_variance', target: 5, inverse: true },
        { name: 'Tỷ lệ chạy rỗng', unit: '%', key: 'empty_run_ratio', target: 20, formula: 'Km chạy rỗng / Tổng km', inverse: true }
      ]
    },
    {
      id: 5,
      name: '5️⃣ Trải nghiệm vận hành',
      icon: '👷',
      description: 'Operational Experience',
      color: 'indigo',
      kpis: [
        { name: 'Cân bằng khối lượng công việc', unit: 'phút', key: 'driver_workload_stddev', target: 60, formula: 'Độ lệch chuẩn', inverse: true },
        { name: 'Tỷ lệ tăng ca', unit: '%', key: 'overtime_rate', target: 15, inverse: true },
        { name: 'Tỷ lệ can thiệp thủ công', unit: '%', key: 'manual_intervention', target: 10, inverse: true },
        { name: 'Tỷ lệ ngoại lệ', unit: '%', key: 'exception_rate', target: 8, formula: 'Kẹt xe, delay, sai điểm, sai tuyến', inverse: true }
      ]
    },
    {
      id: 6,
      name: '6️⃣ Khả năng thích ứng',
      icon: '🔄',
      description: 'Resilience & Scalability',
      color: 'pink',
      kpis: [
        { name: 'Thời gian phục hồi', unit: 'phút', key: 'recovery_time', target: 30, inverse: true },
        { name: 'Độ ổn định lịch', unit: '%', key: 'plan_stability', target: 80, formula: '% chuyến giữ nguyên khi tối ưu lại' },
        { name: 'Xử lý tăng đột biến nhu cầu', unit: '%', key: 'surge_handling', target: 85 },
        { name: 'Tỷ lệ thành công kịch bản giả định', unit: '%', key: 'whatif_success', target: 90 }
      ]
    },
    {
      id: 7,
      name: '7️⃣ Chỉ số tổng hợp',
      icon: '⭐',
      description: 'Executive KPI',
      color: 'orange',
      kpis: [
        { name: 'Chỉ số hiệu quả lịch trình', unit: 'điểm', key: 'efficiency_index', target: 80, formula: 'α·Hiệu quả + β·Đúng giờ − γ·Chi phí' },
        { name: 'Mức độ đạt dịch vụ', unit: '%', key: 'service_level', target: 90 },
        { name: 'Cân bằng chi phí - dịch vụ', unit: 'điểm', key: 'cost_service_balance', target: 75 },
        { name: 'Điểm tổng thể lịch trình', unit: '/100', key: 'overall_score', target: 85 }
      ]
    }
  ];

  constructor(private planService: PlanService) {}

  ngOnInit() {
    this.checkPlanAvailability();
    // Always render skeleton table with 7 KPI groups on init
    this.renderSkeletonTable();
  }

  private renderSkeletonTable() {
    // Generate skeleton evaluation results for all 7 KPI groups
    // This ensures the table is always displayed with all 7 groups
    this.evaluationResults = [];
    
    this.kpiGroups.forEach((group, groupIndex) => {
      group.kpis.forEach((kpi, kpiIndex) => {
        this.evaluationResults.push({
          group: group.name,
          groupId: group.id,
          groupColor: group.color,
          kpiIndex: `${groupIndex + 1}.${kpiIndex + 1}`,
          kpiKey: kpi.key,
          kpiName: kpi.name,
          unit: kpi.unit || '',
          formula: kpi.formula || undefined,
          history: '--',
          plan: '--',
          actual: '--',
          diff: '--',
          diffPercent: undefined,
          achieved: '○',
          note: kpi.inverse ? 'Càng thấp càng tốt' : 'Càng cao càng tốt',
          inverse: kpi.inverse || false
        });
      });
    });
    
    // Always show the table structure (but dashboard only shows after evaluation)
    // We'll use a flag to distinguish between skeleton and actual data
    console.log('[EvaluationComponent] Rendered skeleton table with', this.evaluationResults.length, 'KPIs across', this.kpiGroups.length, 'groups');
  }

  private checkPlanAvailability() {
    try {
      const planningState = (window as any).planningState;
      const hasPlan = !!(planningState?.currentPlan || planningState?.selectedPlan);
      this.canEvaluate = hasPlan;
    } catch (e) {
      console.warn('Error checking plan availability:', e);
      this.canEvaluate = false;
    }
  }

  async evaluateSchedule() {
    if (!this.canEvaluate) {
      alert('Vui lòng chọn plan trước khi đánh giá');
      return;
    }

    this.loading = true;
    this.showDashboard = false;

    try {
      // Get current plan from window state
      const planningState = (window as any).planningState;
      const plan = planningState?.currentPlan || planningState?.selectedPlan;

      if (!plan) {
        throw new Error('Không tìm thấy plan để đánh giá');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate evaluation metrics
      const metrics = this.calculateMetrics(plan);

      // Set dashboard values
      this.overallScore = metrics.overallScore;
      this.efficiency = metrics.efficiency + '%';
      this.ontime = metrics.ontime + '%';
      this.cost = metrics.cost + '%';
      this.quality = metrics.quality + '%';

      // Generate evaluation results (this will replace skeleton with actual data)
      this.evaluationResults = this.generateEvaluationResults(plan, metrics);
      this.hasActualData = true;

      this.showDashboard = true;

    } catch (error: any) {
      console.error('Error evaluating schedule:', error);
      alert('Lỗi khi đánh giá: ' + (error?.message || 'Unknown error'));
    } finally {
      this.loading = false;
    }
  }

  private calculateMetrics(plan: any): any {
    if (!plan || !plan.shifts) {
      return {
        overallScore: 0,
        efficiency: 0,
        ontime: 0,
        cost: 0,
        quality: 0
      };
    }

    const shifts = Array.isArray(plan.shifts) ? plan.shifts : [];
    let totalVehicles = 0;
    let totalStops = 0;
    let totalDistance = 0;
    let totalCapacityUsed = 0;
    let totalCapacity = 0;
    let feasibleVehicles = 0;
    let vehiclesWithOnTime = 0;

    shifts.forEach((shift: any) => {
      const vehicles = Array.isArray(shift.vehicles) ? shift.vehicles : [];
      totalVehicles += vehicles.length;

      vehicles.forEach((vehicle: any) => {
        const capacity = vehicle.vehicle_payload_capacity_kg || 2000;
        totalCapacity += capacity;

        const demands = Array.isArray(vehicle.demands) ? vehicle.demands : [];
        totalStops += demands.length;

        let maxWeight = 0;
        let currentWeight = 0;
        let hasViolations = false;
        let hasAllTimes = true;

        demands.forEach((d: any) => {
          currentWeight += (d.pickup_weight_kg || 0);
          currentWeight -= (d.delivery_weight_kg || 0);
          maxWeight = Math.max(maxWeight, currentWeight);
          
          if (currentWeight > capacity) {
            hasViolations = true;
          }
          
          totalDistance += (d.distance_km || 0);
          
          if (!d.expected_checkin_time || !d.expected_checkout_time) {
            hasAllTimes = false;
          }
        });

        totalCapacityUsed += maxWeight;
        if (!hasViolations && hasAllTimes) {
          feasibleVehicles++;
        }
        if (hasAllTimes) {
          vehiclesWithOnTime++;
        }
      });
    });

    // Calculate metrics
    const efficiency = totalCapacity > 0 ? Math.round((totalCapacityUsed / totalCapacity) * 100) : 0;
    const feasibility = totalVehicles > 0 ? Math.round((feasibleVehicles / totalVehicles) * 100) : 0;
    const ontime = totalVehicles > 0 ? Math.round((vehiclesWithOnTime / totalVehicles) * 100) : 0;
    
    // Cost efficiency (simplified - lower distance per stop is better)
    const avgDistancePerStop = totalStops > 0 ? totalDistance / totalStops : 0;
    const cost = avgDistancePerStop > 0 ? Math.max(0, Math.round(100 - (avgDistancePerStop / 10))) : 80;
    
    // Quality = average of feasibility and ontime
    const quality = Math.round((feasibility + ontime) / 2);

    // Overall score = weighted average
    const overallScore = Math.round(
      (efficiency * 0.25) + 
      (ontime * 0.30) + 
      (cost * 0.20) + 
      (quality * 0.25)
    );

    return {
      overallScore,
      efficiency,
      ontime,
      cost,
      quality,
      totalVehicles,
      totalStops,
      totalDistance,
      feasibility
    };
  }

  private generateEvaluationResults(plan: any, metrics: any): EvaluationResult[] {
    const results: EvaluationResult[] = [];
    
    // Calculate all KPIs from plan data (matching legacy planning-evaluation.js)
    const totalTrips = metrics.totalVehicles || 1;
    const avgDistancePerTrip = metrics.totalVehicles > 0 ? metrics.totalDistance / metrics.totalVehicles : 0;
    const baseCost = 1500000 + (metrics.totalDistance * 3500);
    
    const kpiValues: any = {
      // Group 1: Hiệu quả khai thác
      total_vehicles: metrics.totalVehicles,
      truck_utilization: metrics.efficiency,
      capacity_utilization: metrics.efficiency,
      throughput: metrics.totalStops > 0 ? Math.round((metrics.totalStops / totalTrips) * 10) / 10 : 0,
      idle_time: Math.max(0, 100 - metrics.efficiency),
      trips_per_truck: metrics.totalVehicles > 0 ? Math.round((metrics.totalStops / metrics.totalVehicles / 8) * 10) / 10 : 0,
      
      // Group 2: Đúng giờ & độ tin cậy
      ontime_pickup_rate: metrics.ontime,
      ontime_delivery_rate: metrics.ontime,
      schedule_adherence: metrics.ontime,
      p90_delay: metrics.ontime > 90 ? 10 : 30,
      p95_delay: metrics.ontime > 95 ? 15 : 45,
      variance_arrival: metrics.ontime > 90 ? 15 : 25,
      
      // Group 3: Chất lượng lịch tải
      conflict_rate: metrics.feasibility >= 95 ? 2 : 8,
      feasibility_rate: metrics.feasibility,
      reschedule_freq: metrics.feasibility >= 95 ? 1 : 3,
      buffer_time: metrics.efficiency > 80 ? 85 : 70,
      
      // Group 4: Chi phí & hiệu quả kinh tế
      cost_per_order: metrics.totalStops > 0 ? Math.round(baseCost / metrics.totalStops) : 0,
      cost_per_trip: metrics.totalVehicles > 0 ? Math.round(baseCost / metrics.totalVehicles) : 0,
      fuel_cost_per_km: 8000,
      overtime_cost: metrics.ontime < 90 ? 15 : 8,
      cost_variance: metrics.efficiency > 75 ? 3 : 8,
      empty_run_ratio: metrics.efficiency > 80 ? 15 : 25,
      
      // Group 5: Trải nghiệm vận hành
      driver_workload_stddev: metrics.efficiency > 80 ? 45 : 70,
      overtime_rate: metrics.ontime < 90 ? 20 : 12,
      manual_intervention: metrics.feasibility >= 95 ? 5 : 15,
      exception_rate: metrics.ontime > 90 ? 5 : 12,
      
      // Group 6: Khả năng thích ứng
      recovery_time: metrics.feasibility >= 95 ? 20 : 40,
      plan_stability: metrics.feasibility >= 95 ? 85 : 70,
      surge_handling: metrics.efficiency > 75 ? 88 : 75,
      whatif_success: 90,
      
      // Group 7: Chỉ số tổng hợp
      efficiency_index: metrics.overallScore,
      service_level: metrics.ontime,
      cost_service_balance: Math.round((metrics.cost + metrics.ontime) / 2),
      overall_score: metrics.overallScore
    };

    // Generate results for each KPI group
    this.kpiGroups.forEach((group, groupIndex) => {
      group.kpis.forEach((kpi, kpiIndex) => {
        const planValue = kpi.target !== null ? kpi.target : (kpiValues[kpi.key] || 0);
        const actualValue = kpiValues[kpi.key] || 0;
        const diff = actualValue - planValue;
        const diffPercent = planValue !== 0 ? ((diff / planValue) * 100) : 0;
        
        // Determine if achieved (considering inverse KPIs)
        const isAchieved = kpi.inverse 
          ? actualValue <= (kpi.target || planValue)
          : actualValue >= (kpi.target || planValue);
        
        const diffDisplay = diff > 0 
          ? `+${this.formatValue(diff, kpi.unit)}` 
          : diff < 0 
          ? String(this.formatValue(diff, kpi.unit))
          : '0';
        
        results.push({
          group: group.name,
          groupId: group.id,
          groupColor: group.color,
          kpiIndex: `${groupIndex + 1}.${kpiIndex + 1}`,
          kpiKey: kpi.key,
          kpiName: kpi.name,
          formula: kpi.formula,
          unit: kpi.unit,
          history: '--',
          plan: kpi.target !== null ? this.formatValue(planValue, kpi.unit) : '--',
          actual: this.formatValue(actualValue, kpi.unit),
          diff: diffDisplay,
          diffPercent: diffPercent,
          achieved: isAchieved ? '✓' : '✗',
          note: kpi.inverse ? 'Càng thấp càng tốt' : 'Càng cao càng tốt',
          inverse: kpi.inverse
        });
      });
    });

    return results;
  }

  private formatValue(value: number | string, unit: string): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return 'N/A';
    
    if (unit === '%' || unit === '/100') {
      return value.toFixed(1);
    }
    if (unit === 'điểm' || unit === '/100') {
      return value.toFixed(0);
    }
    if (typeof value === 'number') {
      if (value >= 1000) {
        return value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
      }
      return value.toFixed(1);
    }
    return String(value);
  }

  // Get KPIs for a specific group
  getKPIsForGroup(groupId: number): EvaluationResult[] {
    return this.evaluationResults.filter(r => r.groupId === groupId);
  }

  // Get group color classes
  getGroupBgClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'green': 'bg-green-50',
      'blue': 'bg-blue-50',
      'purple': 'bg-purple-50',
      'yellow': 'bg-yellow-50',
      'indigo': 'bg-indigo-50',
      'pink': 'bg-pink-50',
      'orange': 'bg-orange-50'
    };
    return colorMap[color] || 'bg-gray-50';
  }

  getGroupBorderClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'green': 'border-green-300',
      'blue': 'border-blue-300',
      'purple': 'border-purple-300',
      'yellow': 'border-yellow-300',
      'indigo': 'border-indigo-300',
      'pink': 'border-pink-300',
      'orange': 'border-orange-300'
    };
    return colorMap[color] || 'border-gray-300';
  }

  getGroupTextClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'green': 'text-green-900',
      'blue': 'text-blue-900',
      'purple': 'text-purple-900',
      'yellow': 'text-yellow-900',
      'indigo': 'text-indigo-900',
      'pink': 'text-pink-900',
      'orange': 'text-orange-900'
    };
    return colorMap[color] || 'text-gray-900';
  }

  getGroupTextSecondaryClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'green': 'text-green-600',
      'blue': 'text-blue-600',
      'purple': 'text-purple-600',
      'yellow': 'text-yellow-600',
      'indigo': 'text-indigo-600',
      'pink': 'text-pink-600',
      'orange': 'text-orange-600'
    };
    return colorMap[color] || 'text-gray-600';
  }

  // Expose parseFloat to template
  parseFloat(value: string): number {
    return parseFloat(value);
  }

  // Group expansion management
  toggleGroup(groupId: number): void {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
  }

  isGroupExpanded(groupId: number): boolean {
    return this.expandedGroups.has(groupId);
  }

  // Get score grade
  getScoreGrade(score: number): string {
    if (score >= 90) return 'Xuất Sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 70) return 'Khá';
    if (score >= 60) return 'Trung Bình';
    return 'Cần Cải Thiện';
  }

  getScoreGradeClass(score: number): string {
    if (score >= 90) return 'grade-excellent';
    if (score >= 80) return 'grade-good';
    if (score >= 70) return 'grade-fair';
    if (score >= 60) return 'grade-average';
    return 'grade-poor';
  }

  // Get achieved count
  getAchievedCount(): number {
    if (!this.hasActualData) return 0;
    return this.evaluationResults.filter(r => r.achieved === '✓').length;
  }

  getGroupAchievedCount(groupId: number): number {
    if (!this.hasActualData) return 0;
    return this.getKPIsForGroup(groupId).filter(r => r.achieved === '✓').length;
  }
}
