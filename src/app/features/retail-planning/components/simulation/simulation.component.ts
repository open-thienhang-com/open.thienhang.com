import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulation',
  imports: [CommonModule],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.css',
})
export class SimulationComponent implements OnInit {
  planId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = params['id'];
      if (this.planId) {
        this.loadSimulationData(this.planId);
      }
    });
  }

  private async loadSimulationData(planId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // TODO: Load simulation data for the plan
      console.log('Loading simulation for plan:', planId);
      // Mock loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      this.error = 'Failed to load simulation data';
      console.error('Error loading simulation:', err);
    } finally {
      this.loading = false;
    }
  }
}
