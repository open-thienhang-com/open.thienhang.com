import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { TravelService } from '../../services/travel.service';
import { Trip, PlanningItem } from '../../models/travel.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CardModule, ButtonModule, TimelineModule, CheckboxModule, SkeletonModule],
  template: `
    <div class="p-4 md:p-6">
      <div *ngIf="!loading && trip">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-color">{{ trip.title }}</h1>
            <p class="text-color-secondary">{{ trip.destination }}</p>
          </div>
          <button pButton label="Back to Trips" icon="pi pi-arrow-left" class="p-button-secondary" (click)="navigateToList()"></button>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Itinerary -->
          <div class="lg:col-span-2">
            <p-card>
              <ng-template pTemplate="title">
                Itinerary
              </ng-template>
              <ng-template pTemplate="content">
                <p-timeline [value]="trip.itinerary" align="alternate" styleClass="customized-timeline">
                  <ng-template pTemplate="marker" let-event>
                      <span class="custom-marker shadow-2" [style.backgroundColor]="event.color">
                          <i [class]="event.icon"></i>
                      </span>
                  </ng-template>
                  <ng-template pTemplate="content" let-event>
                      <small class="p-text-secondary">{{ event.description }}</small>
                  </ng-template>
                </p-timeline>
              </ng-template>
            </p-card>
          </div>

          <!-- Right Column: Info & Planning -->
          <div class="space-y-6">
            <p-card>
              <ng-template pTemplate="title">Trip Details</ng-template>
              <ng-template pTemplate="content">
                <div class="space-y-2">
                  <div>
                    <p class="font-semibold text-color-secondary">Dates</p>
                    <p>{{ trip.startDate | date:'mediumDate' }} - {{ trip.endDate | date:'mediumDate' }}</p>
                  </div>
                  <div>
                    <p class="font-semibold text-color-secondary">Status</p>
                    <p>{{ trip.status }}</p>
                  </div>
                </div>
              </ng-template>
            </p-card>

            <p-card>
              <ng-template pTemplate="title">Planning Checklist</ng-template>
              <ng-template pTemplate="content">
                <div class="space-y-3">
                  <div *ngFor="let item of trip.planningList" class="flex items-center">
                    <p-checkbox [(ngModel)]="item.completed" [binary]="true" [inputId]="'task'+item.id"></p-checkbox>
                    <label [for]="'task'+item.id" class="ml-2" [class.line-through]="item.completed">{{ item.task }}</label>
                  </div>
                </div>
              </ng-template>
            </p-card>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading">
        <p-skeleton height="50px" styleClass="mb-6"></p-skeleton>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <p-skeleton height="400px"></p-skeleton>
          </div>
          <div class="space-y-6">
            <p-skeleton height="150px"></p-skeleton>
            <p-skeleton height="200px"></p-skeleton>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div *ngIf="!loading && !trip" class="text-center p-8">
        <h2 class="text-xl font-bold">Trip not found</h2>
        <p class="text-color-secondary mt-2">The requested trip does not exist.</p>
        <button pButton label="Go Back to Trips" class="mt-4" (click)="navigateToList()"></button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .customized-timeline .p-timeline-event:nth-child(even) {
        flex-direction: row-reverse;
    }
    :host ::ng-deep .customized-timeline .p-timeline-event-content {
        text-align: left;
    }
    :host ::ng-deep .customized-timeline .p-timeline-event:nth-child(even) .p-timeline-event-content {
        text-align: right;
    }
    .custom-marker {
        display: flex;
        width: 2rem;
        height: 2rem;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        border-radius: 50%;
        z-index: 1;
    }
  `]
})
export class TripDetailComponent implements OnInit {
  private travelService = inject(TravelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  trip: Trip | undefined;
  loading = false;

  ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      this.loadTrip(tripId);
    }
  }

  loadTrip(id: string) {
    this.loading = true;
    this.travelService.getTripById(id).subscribe(data => {
      this.trip = data;
      this.loading = false;
    });
  }

  navigateToList() {
    this.router.navigate(['/travel']);
  }
}
