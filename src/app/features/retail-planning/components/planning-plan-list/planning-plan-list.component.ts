import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlanService, Plan } from '../../services/plan.service';

interface PlanCard {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  routes: number;
  totalDistance: number;
  totalCost: number;
  created: string;
}

@Component({
  selector: 'app-planning-plan-list',
  imports: [CommonModule],
  templateUrl: './planning-plan-list.component.html',
  styleUrl: './planning-plan-list.component.css',
})
export class PlanningPlanListComponent implements OnInit {
  plans: PlanCard[] = [];
  totalPlans = 0;
  activePlans = 0;
  draftPlans = 0;
  totalSavings = 0;

  constructor(private planService: PlanService, private router: Router) { }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    // For now, use sample data. Later integrate with PlanService
    this.plans = [
      {
        id: 'PLAN-2024-001',
        name: 'Hanoi Delivery Routes',
        status: 'active',
        routes: 12,
        totalDistance: 245.8,
        totalCost: 2450000,
        created: '2024-01-15'
      },
      {
        id: 'PLAN-2024-002',
        name: 'Ho Chi Minh City Routes',
        status: 'draft',
        routes: 8,
        totalDistance: 189.2,
        totalCost: 1890000,
        created: '2024-01-14'
      }
    ];

    this.updateStatistics();
  }

  updateStatistics(): void {
    this.totalPlans = this.plans.length;
    this.activePlans = this.plans.filter(p => p.status === 'active').length;
    this.draftPlans = this.plans.filter(p => p.status === 'draft').length;
    // Calculate average savings (placeholder)
    this.totalSavings = 15;
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      draft: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  viewPlan(planId: string): void {
    this.router.navigate(['/plan', planId]);
  }

  simulatePlan(planId: string): void {
    this.router.navigate(['/simulation', planId]);
  }

  evaluatePlan(planId: string): void {
    this.router.navigate(['/schedule-evaluation', planId]);
  }

  estimateCost(planId: string): void {
    this.router.navigate(['/cost-estimation', planId]);
  }
}
