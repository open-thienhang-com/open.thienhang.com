import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-evaluation',
  imports: [CommonModule],
  templateUrl: './schedule-evaluation.component.html',
  styleUrl: './schedule-evaluation.component.css',
})
export class ScheduleEvaluationComponent implements OnInit {
  planId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = params['id'];
      if (this.planId) {
        this.loadEvaluationData(this.planId);
      }
    });
  }

  private async loadEvaluationData(planId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // TODO: Load evaluation data for the plan
      console.log('Loading evaluation for plan:', planId);
      // Mock loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      this.error = 'Failed to load evaluation data';
      console.error('Error loading evaluation:', err);
    } finally {
      this.loading = false;
    }
  }
}
