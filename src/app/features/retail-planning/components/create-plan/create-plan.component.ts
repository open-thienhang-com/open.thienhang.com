import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-plan',
  imports: [CommonModule],
  templateUrl: './create-plan.component.html',
  styleUrl: './create-plan.component.css',
})
export class CreatePlanComponent implements OnInit {
  currentStep: number = 1;

  constructor() { }

  ngOnInit() {
    // Initialize component
  }

  switchToStep(step: number) {
    if (step >= 1 && step <= 4) {
      this.currentStep = step;
    }
  }

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  isStepCompleted(step: number): boolean {
    return step < this.currentStep;
  }
}
