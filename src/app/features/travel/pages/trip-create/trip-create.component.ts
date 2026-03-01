import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TravelService } from '../../services/travel.service';
import { ItineraryItem, ItineraryItemCreate, Trip } from '../../models/travel.model';
import { PageHeaderComponent } from '../../../retail-planning/components/page-header/page-header.component';

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    TagModule,
    PageHeaderComponent
  ],
  template: `
    <div class="planning-page">
      <app-page-header
        [title]="isDetailMode ? 'Trip Detail' : 'Auto Trip Planning'"
        [subtitle]="isDetailMode ? 'View and update trip information using the same planning UI.' : 'Configure trip basics, schedule, and budget before creating a plan.'"
        icon="pi pi-map">
      </app-page-header>

      <div class="planning-stepper-container">
        <aside class="planning-stepper-nav">
          <div class="trip-profile-card">
            <div class="trip-profile-image-wrap">
              <img [src]="displayTripImage" alt="Trip cover" class="trip-profile-image" />
              <button pButton type="button" class="p-button-sm p-button-contrast trip-image-upload-btn" icon="pi pi-camera" (click)="triggerImageUpload()"></button>
              <input #tripImageInput type="file" accept="image/*" class="hidden-file-input" (change)="onTripImageSelected($event)" />
            </div>
            <div class="trip-profile-title">{{ preview.title || 'Untitled Trip' }}</div>
            <div class="trip-profile-subtitle">{{ preview.destination || 'No destination yet' }}</div>
            <div class="trip-profile-meta">{{ preview.start_date || '-' }} -> {{ preview.end_date || '-' }}</div>
            <div class="trip-profile-grid">
              <div><span>Budget</span><strong>{{ preview.budget }}</strong></div>
              <div><span>People</span><strong>{{ preview.people_count }}</strong></div>
              <div><span>Status</span><strong>{{ preview.status || 'draft' }}</strong></div>
              <div><span>Items</span><strong>{{ detailCounts.itinerary }}</strong></div>
            </div>
          </div>

          <div class="planning-stepper-title">Trip Setup Steps</div>
          <div class="planning-step-item" [class.active]="currentStep >= 1" [class.current]="currentStep === 1" (click)="goToStep(1)">
            <div class="planning-step-indicator">1</div>
            <div class="planning-step-label">
              <div class="planning-step-title">Trip Basics</div>
              <div class="planning-step-desc">Name, destination, and description</div>
            </div>
          </div>
          <div class="planning-step-item" [class.active]="currentStep >= 2" [class.current]="currentStep === 2" (click)="goToStep(2)">
            <div class="planning-step-indicator">2</div>
            <div class="planning-step-label">
              <div class="planning-step-title">Schedule</div>
              <div class="planning-step-desc">Start date, end date, timezone</div>
            </div>
          </div>
          <div class="planning-step-item" [class.active]="currentStep >= 3" [class.current]="currentStep === 3" (click)="goToStep(3)">
            <div class="planning-step-indicator">3</div>
            <div class="planning-step-label">
              <div class="planning-step-title">Capacity & Budget</div>
              <div class="planning-step-desc">People count, budget, status</div>
            </div>
          </div>
        </aside>

        <section class="planning-step-content">
          <div class="planning-step-panel active">
            <div class="planning-step-header">
              <div class="header-top">
                <div>
                  <h3>{{ isDetailMode ? 'Trip Information' : 'Create New Trip' }}</h3>
                  <p>
                    {{ isDetailMode ? 'Update the selected trip directly from this shared screen.' : 'Default values are prefilled. Click Create Trip to submit immediately.' }}
                  </p>
                </div>
                <p-tag [value]="(preview.status || 'draft').toString()" [severity]="getStatusSeverity(preview.status)"></p-tag>
              </div>
            </div>

            <div class="planning-step-body">
              <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
                <ng-container *ngIf="currentStep === 1">
                  <div class="field">
                    <label for="name">Trip Name *</label>
                    <input pInputText id="name" type="text" formControlName="name" placeholder="Summer Vacation 2026" />
                  </div>

                  <div class="field">
                    <label for="destination">Destination</label>
                    <input pInputText id="destination" type="text" formControlName="destination" placeholder="Da Nang" />
                  </div>

                  <div class="field field-full">
                    <label for="description">Description</label>
                    <textarea id="description" rows="4" formControlName="description" placeholder="Trip notes"></textarea>
                  </div>
                </ng-container>

                <ng-container *ngIf="currentStep === 2">
                  <div class="field">
                    <label for="start_date">Start Date</label>
                    <input pInputText id="start_date" type="date" formControlName="start_date" />
                  </div>
                  <div class="field">
                    <label for="end_date">End Date</label>
                    <input pInputText id="end_date" type="date" formControlName="end_date" />
                  </div>
                  <div class="field">
                    <label for="timezone">Timezone</label>
                    <input pInputText id="timezone" type="text" formControlName="timezone" placeholder="UTC" />
                  </div>

                  <div class="field field-full travel-plan-board" *ngIf="isDetailMode">
                    <div class="plan-toolbar">
                      <div>
                        <div class="plan-toolbar-title">Travel Plan</div>
                        <div class="plan-toolbar-subtitle">Simple itinerary list for this trip.</div>
                      </div>
                      <div class="plan-count">{{ timelineItems.length }} items</div>
                    </div>

                    <form [formGroup]="timelineForm" class="timeline-form-grid">
                      <div class="field">
                        <label for="timeline-day">Day</label>
                        <input pInputText id="timeline-day" type="date" formControlName="day" />
                      </div>
                      <div class="field">
                        <label for="timeline-title">Activity</label>
                        <input pInputText id="timeline-title" type="text" formControlName="title" placeholder="Sunrise at beach" />
                      </div>
                      <div class="field">
                        <label for="timeline-location">Location</label>
                        <input pInputText id="timeline-location" type="text" formControlName="location" placeholder="My Khe Beach" />
                      </div>
                      <div class="field">
                        <label for="timeline-start">Start Time (ISO)</label>
                        <input pInputText id="timeline-start" type="text" formControlName="start_time" />
                      </div>
                      <div class="field">
                        <label for="timeline-end">End Time (ISO)</label>
                        <input pInputText id="timeline-end" type="text" formControlName="end_time" />
                      </div>
                      <div class="field">
                        <label for="timeline-activity">Activity Type</label>
                        <input pInputText id="timeline-activity" type="text" formControlName="activity_type" placeholder="sightseeing" />
                      </div>
                      <div class="field field-full">
                        <label for="timeline-note">Note</label>
                        <textarea id="timeline-note" rows="2" formControlName="note" placeholder="Notes..."></textarea>
                      </div>
                    </form>
                    <div class="timeline-actions">
                      <button
                        pButton
                        type="button"
                        label="Add To Plan"
                        icon="pi pi-plus"
                        [loading]="creatingTimeline"
                        [disabled]="creatingTimeline || loadingDetail || timelineForm.invalid"
                        (click)="createTimelineItem()"></button>
                    </div>

                    <div class="plan-timeline" *ngIf="timelineItems.length; else noTimelineData">
                      <div class="timeline-row" *ngFor="let item of timelineItems">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                          <div class="plan-row-title">{{ item.title || '-' }}</div>
                          <div class="plan-row-meta">
                            {{ formatDateOnly(item.day || item.date) }} ·
                            {{ formatTime(item.start_time || item.time) }} - {{ formatTime(item.end_time) }} ·
                            {{ item.location || '-' }}
                          </div>
                          <div class="plan-row-note">{{ item.note || item.description || '-' }}</div>
                        </div>
                        <div class="plan-row-type">{{ item.activity_type || 'activity' }}</div>
                      </div>
                    </div>

                    <ng-template #noTimelineData>
                      <div class="timeline-empty">No activities yet. Add your first stop to start this travel plan.</div>
                    </ng-template>
                  </div>
                </ng-container>

                <ng-container *ngIf="currentStep === 3">
                  <div class="field">
                    <label for="budget">Budget</label>
                    <p-inputNumber inputId="budget" formControlName="budget" mode="decimal" [min]="0"></p-inputNumber>
                  </div>

                  <div class="field">
                    <label for="people_count">People Count</label>
                    <p-inputNumber inputId="people_count" formControlName="people_count" mode="decimal" [min]="1"></p-inputNumber>
                  </div>

                  <div class="field">
                    <label for="status">Status</label>
                    <p-dropdown
                      inputId="status"
                      [options]="statusOptions"
                      formControlName="status"
                      optionLabel="label"
                      optionValue="value"
                      [showClear]="false">
                    </p-dropdown>
                  </div>
                </ng-container>
              </form>
            </div>

            <div class="planning-step-footer">
              <button pButton type="button" label="Back to Trips" class="p-button-text" (click)="cancel()"></button>
              <button pButton type="button" label="Previous" class="p-button-text" [disabled]="currentStep === 1" (click)="previousStep()"></button>
              <button pButton type="button" label="Next" class="p-button-text" *ngIf="currentStep < 3" (click)="nextStep()"></button>
              <button
                pButton
                type="button"
                [label]="isDetailMode ? 'Update Trip' : 'Create Trip'"
                icon="pi pi-check"
                [loading]="submitting || loadingDetail"
                [disabled]="form.invalid || submitting || loadingDetail || currentStep !== 3"
                (click)="submit()"></button>
            </div>
          </div>

          <p *ngIf="errorMessage" class="text-red-500 m-0 mt-3">{{ errorMessage }}</p>
          <p *ngIf="successMessage" class="text-green-600 m-0 mt-3">{{ successMessage }}</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .planning-page {
      height: calc(100vh - 4rem);
      padding: 1rem;
      background: #f9fafb;
      overflow-y: auto;
    }
    .planning-stepper-container {
      display: flex;
      background: var(--p-surface-0);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--p-surface-200);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .planning-stepper-nav {
      width: 320px;
      background: var(--p-surface-50);
      border-right: 1px solid var(--p-surface-200);
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .trip-profile-card {
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      background: var(--p-surface-0);
      padding: 10px;
      margin-bottom: 4px;
    }
    .trip-profile-image-wrap {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      height: 130px;
      background: var(--p-surface-100);
      margin-bottom: 8px;
    }
    .trip-profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .trip-image-upload-btn {
      position: absolute;
      top: 8px;
      right: 8px;
    }
    .hidden-file-input {
      display: none;
    }
    .trip-profile-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--p-surface-900);
    }
    .trip-profile-subtitle {
      margin-top: 2px;
      font-size: 12px;
      color: var(--p-surface-700);
    }
    .trip-profile-meta {
      margin-top: 4px;
      font-size: 11px;
      color: var(--p-surface-600);
    }
    .trip-profile-grid {
      margin-top: 8px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }
    .trip-profile-grid div {
      border: 1px solid var(--p-surface-200);
      border-radius: 6px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: var(--p-surface-50);
    }
    .trip-profile-grid span {
      font-size: 10px;
      color: var(--p-surface-600);
      text-transform: uppercase;
    }
    .trip-profile-grid strong {
      font-size: 12px;
      color: var(--p-surface-900);
    }
    .planning-stepper-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--p-surface-700);
      margin-bottom: 6px;
      padding-left: 6px;
    }
    .planning-step-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px;
      border-radius: 8px;
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-200);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .planning-step-item.active {
      background: rgba(var(--p-primary-500), 0.08);
      border-color: rgba(var(--p-primary-500), 0.2);
    }
    .planning-step-item.current {
      box-shadow: inset 0 0 0 1px var(--p-primary-500);
    }
    .planning-step-indicator {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--p-primary-500);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .planning-step-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-800);
      margin-bottom: 2px;
    }
    .planning-step-desc {
      font-size: 12px;
      color: var(--p-surface-600);
    }
    .planning-step-content {
      flex: 1;
      padding: 20px;
      background: var(--p-surface-0);
      overflow-y: auto;
    }
    .planning-step-panel {
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      background: var(--p-surface-0);
      overflow: hidden;
    }
    .planning-step-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--p-surface-200);
      background: linear-gradient(135deg, rgba(var(--p-primary-500), 0.08), rgba(var(--p-primary-500), 0.02));
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .planning-step-header h3 {
      margin: 0 0 4px;
      font-size: 20px;
      font-weight: 700;
      color: var(--p-surface-900);
    }
    .planning-step-header p {
      margin: 0;
      font-size: 13px;
      color: var(--p-surface-600);
    }
    .planning-step-body {
      padding: 16px;
    }
    .trip-info-panel {
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      background: var(--p-surface-50);
      padding: 12px;
      margin-bottom: 16px;
    }
    .trip-info-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--p-surface-800);
      margin-bottom: 10px;
    }
    .trip-info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 12px;
    }
    .info-item {
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-item-full {
      grid-column: 1 / -1;
    }
    .info-label {
      font-size: 11px;
      color: var(--p-surface-600);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .info-value {
      font-size: 13px;
      color: var(--p-surface-900);
      font-weight: 600;
      word-break: break-word;
    }
    .trip-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    .stat-card {
      background: var(--p-surface-0);
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--p-primary-600);
      line-height: 1.1;
    }
    .stat-label {
      margin-top: 2px;
      font-size: 11px;
      color: var(--p-surface-600);
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .field label {
      font-size: 0.85rem;
      color: var(--text-color-secondary);
    }
    .field-full {
      grid-column: 1 / -1;
    }
    textarea,
    input[type='text'],
    input[type='date'] {
      width: 100%;
      padding: 0.65rem 0.75rem;
      border: 1px solid var(--surface-border);
      border-radius: 0.5rem;
      background: var(--surface-card);
      color: var(--text-color);
      font: inherit;
    }
    .planning-step-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 14px 16px;
      border-top: 1px solid var(--p-surface-200);
      background: var(--p-surface-50);
    }
    .travel-plan-board {
      margin-top: 0.5rem;
      border: 1px solid var(--p-surface-200);
      border-radius: 10px;
      background: var(--p-surface-0);
      padding: 10px;
    }
    .plan-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--p-surface-200);
    }
    .plan-toolbar-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--p-surface-900);
    }
    .plan-toolbar-subtitle {
      font-size: 12px;
      color: var(--p-surface-600);
      margin-top: 2px;
    }
    .plan-count {
      font-size: 12px;
      color: var(--p-surface-700);
      background: var(--p-surface-100);
      border-radius: 999px;
      padding: 4px 8px;
    }
    .timeline-form-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
    }
    .timeline-actions {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
    }
    .plan-timeline {
      margin-top: 10px;
      display: grid;
      gap: 6px;
      border-left: 2px solid var(--p-surface-200);
      padding-left: 10px;
    }
    .timeline-row {
      border: 1px solid var(--p-surface-200);
      border-radius: 8px;
      background: var(--p-surface-50);
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      position: relative;
    }
    .timeline-dot {
      position: absolute;
      left: -17px;
      top: 12px;
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--p-primary-500);
    }
    .timeline-content {
      min-width: 0;
      flex: 1;
    }
    .plan-row-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--p-surface-900);
    }
    .plan-row-meta {
      margin-top: 2px;
      font-size: 12px;
      color: var(--p-surface-600);
    }
    .plan-row-note {
      margin-top: 2px;
      font-size: 12px;
      color: var(--p-surface-700);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .plan-row-type {
      align-self: flex-start;
      font-size: 11px;
      color: var(--p-surface-700);
      background: var(--p-surface-100);
      border-radius: 999px;
      padding: 3px 8px;
      white-space: nowrap;
    }
    .timeline-empty {
      margin-top: 12px;
      border: 1px dashed var(--p-surface-300);
      border-radius: 8px;
      background: var(--p-surface-0);
      padding: 10px;
      font-size: 12px;
      color: var(--p-surface-600);
      text-align: center;
    }
    @media (max-width: 1024px) {
      .planning-stepper-container {
        flex-direction: column;
      }
      .planning-stepper-nav {
        width: 100%;
      }
    }
    @media (max-width: 900px) {
      .form-grid,
      .trip-info-grid {
        grid-template-columns: 1fr;
      }
      .timeline-form-grid {
        grid-template-columns: 1fr;
      }
      .trip-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `]
})
export class TripCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private travelService = inject(TravelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly defaultTripImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="%230ea5e9"/><stop offset="1" stop-color="%232563eb"/></linearGradient></defs><rect width="1200" height="700" fill="url(%23g)"/><circle cx="930" cy="170" r="60" fill="%23fef08a"/><path d="M0 520L190 430L360 520L560 390L760 520L960 360L1200 520V700H0Z" fill="%23dbeafe"/><path d="M0 570L180 500L370 580L600 450L780 570L970 440L1200 600V700H0Z" fill="%23bfdbfe"/><text x="80" y="130" font-family="Arial" font-size="56" font-weight="700" fill="%23ffffff">Travel Plan</text></svg>';

  @ViewChild('tripImageInput') tripImageInput?: ElementRef<HTMLInputElement>;

  submitting = false;
  creatingTimeline = false;
  loadingDetail = false;
  errorMessage = '';
  successMessage = '';
  tripId = '';
  loadedTrip: Trip | null = null;
  uploadedTripImage = '';
  timelineItems: ItineraryItem[] = [];
  detailCounts = {
    itinerary: 0,
    bookings: 0,
    budgets: 0,
    notifications: 0
  };
  currentStep = 1;

  statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' }
  ];

  form = this.fb.group({
    name: ['string', [Validators.required, Validators.maxLength(120)]],
    destination: ['string'],
    start_date: ['2026-03-01'],
    end_date: ['2026-03-01'],
    budget: [0],
    people_count: [1],
    timezone: ['UTC'],
    status: ['draft'],
    description: ['string'],
    cover_image: ['']
  });

  timelineForm = this.fb.group({
    day: ['2026-03-01', Validators.required],
    start_time: ['08:53:07.663Z', Validators.required],
    end_time: ['08:53:07.663Z', Validators.required],
    title: ['string', Validators.required],
    location: ['string'],
    note: ['string'],
    activity_type: ['string']
  });

  get isDetailMode(): boolean {
    return !!this.tripId;
  }

  get preview(): {
    id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
    people_count: number;
    timezone: string;
    status: string;
    description: string;
    cover_image: string;
  } {
    const value = this.form.getRawValue();
    return {
      id: this.loadedTrip?.trip_id || this.loadedTrip?.id || this.loadedTrip?._id || this.tripId || '',
      title: (value.name || '').toString().trim(),
      destination: (value.destination || '').toString().trim(),
      start_date: (value.start_date || '').toString().trim(),
      end_date: (value.end_date || '').toString().trim(),
      budget: typeof value.budget === 'number' ? value.budget : 0,
      people_count: typeof value.people_count === 'number' ? value.people_count : 0,
      timezone: (value.timezone || '').toString().trim(),
      status: (value.status || 'draft').toString(),
      description: (value.description || '').toString().trim(),
      cover_image: (value.cover_image || '').toString().trim()
    };
  }

  get displayTripImage(): string {
    return this.uploadedTripImage || this.preview.cover_image || this.loadedTrip?.cover_image || this.defaultTripImage;
  }

  ngOnInit(): void {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
    if (this.tripId) {
      this.loadTripDetail();
    }
  }

  private loadTripDetail(): void {
    this.loadingDetail = true;
    this.errorMessage = '';

    forkJoin({
      trip: this.travelService.getTrip(this.tripId),
      itinerary: this.travelService.listItineraryItems(this.tripId),
      bookings: this.travelService.listBookings(this.tripId),
      budgets: this.travelService.listBudgetItems(this.tripId),
      notifications: this.travelService.listNotifications(this.tripId)
    })
      .pipe(finalize(() => (this.loadingDetail = false)))
      .subscribe({
        next: (res) => {
          if (!res.trip) {
            this.errorMessage = `Trip not found: ${this.tripId}`;
            return;
          }
          this.loadedTrip = res.trip;
          this.timelineItems = this.sortTimelineItems(res.itinerary);
          this.form.patchValue({
            name: res.trip.title || res.trip.name || '',
            destination: res.trip.destination || '',
            start_date: res.trip.start_date || '',
            end_date: res.trip.end_date || '',
            budget: typeof res.trip.budget === 'number' ? res.trip.budget : 0,
            people_count: typeof res.trip.people_count === 'number' ? res.trip.people_count : 1,
            timezone: res.trip.timezone || 'UTC',
            status: (res.trip.status || 'draft') as string,
            description: res.trip.description || '',
            cover_image: res.trip.cover_image || ''
          });
          this.timelineForm.patchValue({
            day: this.toDateInputValue(res.trip.start_date) || this.toDateInputValue(this.timelineItems[0]?.day) || '2026-03-01',
            title: res.trip.title || 'string',
            location: res.trip.destination || 'string',
            note: res.trip.description || 'string'
          });
          this.detailCounts = {
            itinerary: this.timelineItems.length,
            bookings: res.bookings.length,
            budgets: res.budgets.length,
            notifications: res.notifications.length
          };
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || err?.error?.message || 'Load trip detail failed';
          this.loadedTrip = null;
          this.timelineItems = [];
          this.detailCounts = {
            itinerary: 0,
            bookings: 0,
            budgets: 0,
            notifications: 0
          };
        }
      });
  }

  submit(): void {
    if (this.form.invalid || this.submitting || this.loadingDetail) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const value = this.form.getRawValue();
    const payload = {
      title: (value.name || '').trim(),
      destination: value.destination || undefined,
      start_date: value.start_date || undefined,
      end_date: value.end_date || undefined,
      description: value.description || undefined,
      cover_image: value.cover_image || undefined,
      budget: typeof value.budget === 'number' ? value.budget : undefined,
      people_count: typeof value.people_count === 'number' ? value.people_count : undefined,
      timezone: value.timezone || undefined,
      status: value.status || 'draft'
    };

    const request$ = this.isDetailMode
      ? this.travelService.updateTrip(this.tripId, payload)
      : this.travelService.createTrip(payload);

    request$
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (trip) => {
          if (!this.isDetailMode && trip) {
            const id = trip.trip_id || trip.id || trip._id;
            if (id) {
              this.router.navigate(['/travel', id]);
              return;
            }
          }
          if (this.isDetailMode) {
            this.successMessage = 'Trip updated successfully.';
            this.loadTripDetail();
            return;
          }
          this.router.navigate(['/travel']);
        },
        error: (err) => {
          this.errorMessage = this.isDetailMode
            ? (err?.error?.detail || err?.error?.message || 'Update trip failed')
            : (err?.error?.detail || err?.error?.message || 'Create trip failed');
        }
      });
  }

  createTimelineItem(): void {
    if (!this.tripId || this.creatingTimeline || this.loadingDetail || this.timelineForm.invalid) {
      return;
    }

    this.creatingTimeline = true;
    this.errorMessage = '';
    this.successMessage = '';

    const value = this.timelineForm.getRawValue();
    const day = (value.day || '').trim() || new Date().toISOString().slice(0, 10);
    const payload: ItineraryItemCreate = {
      trip_id: this.tripId,
      day,
      start_time: (value.start_time || '').trim() || '08:53:07.663Z',
      end_time: (value.end_time || '').trim() || '08:53:07.663Z',
      title: (value.title || '').trim() || 'string',
      location: (value.location || '').trim() || 'string',
      note: (value.note || '').trim() || 'string',
      activity_type: (value.activity_type || '').trim() || 'string'
    };

    this.travelService.createItineraryItem(this.tripId, payload)
      .pipe(finalize(() => (this.creatingTimeline = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Timeline item created successfully.';
          this.loadTripDetail();
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || err?.error?.message || 'Create timeline item failed';
        }
      });
  }

  triggerImageUpload(): void {
    this.tripImageInput?.nativeElement.click();
  }

  onTripImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      if (!value) {
        return;
      }
      this.uploadedTripImage = value;
      this.form.patchValue({ cover_image: value });
    };
    reader.readAsDataURL(file);
  }

  formatDateOnly(value?: string): string {
    if (!value) {
      return '-';
    }
    const raw = value.split('T')[0];
    return raw || value;
  }

  formatTime(value?: string): string {
    if (!value) {
      return '-';
    }
    const match = value.match(/^(\d{2}:\d{2})/);
    if (match) {
      return match[1];
    }
    const timePart = value.includes('T') ? value.split('T')[1] : value;
    return timePart?.slice(0, 5) || value;
  }

  private sortTimelineItems(items: ItineraryItem[]): ItineraryItem[] {
    return [...items].sort((a, b) => {
      const aDay = a.day || a.date || '';
      const bDay = b.day || b.date || '';
      const dayCompare = bDay.localeCompare(aDay);
      if (dayCompare !== 0) {
        return dayCompare;
      }
      const aTime = a.start_time || a.time || '';
      const bTime = b.start_time || b.time || '';
      return aTime.localeCompare(bTime);
    });
  }

  private toDateInputValue(value?: string): string {
    if (!value) {
      return '';
    }
    return value.split('T')[0] || '';
  }

  cancel(): void {
    this.router.navigate(['/travel']);
  }

  goToStep(step: number): void {
    if (step < 1 || step > 3) {
      return;
    }
    this.currentStep = step;
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep += 1;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  getStatusSeverity(status?: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'in progress':
        return 'warning';
      case 'upcoming':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
