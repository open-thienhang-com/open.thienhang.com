import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { PageHeaderComponent } from '../../../retail-planning/components/page-header/page-header.component';
import { TripStoreService } from '../../services/trip-store.service';
import { PointOfInterest, Trip } from '../../models/travel.model';

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, DragDropModule,
    ButtonModule, InputTextModule, InputNumberModule, DropdownModule, CalendarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="planning-page">
      <app-page-header
        title="Plan New Voyage"
        subtitle="Intelligent Itinerary Builder"
        icon="pi pi-compass">
      </app-page-header>

      <div class="planning-stepper-container blur-effect">
        <!-- Sidebar Navigation -->
        <aside class="planning-stepper-nav">
          <div class="nav-steps mt-6">
            <h4 class="nav-header">Itinerary Flow</h4>
            <div class="planning-step-item" [class.active]="currentStep() >= 1" [class.current]="currentStep() === 1">
              <div class="step-dot"></div>
              <div class="step-text">
                <span class="title">1. Configuration</span>
                <span class="desc">Where & When</span>
              </div>
            </div>
            <div class="planning-step-item" [class.active]="currentStep() >= 2" [class.current]="currentStep() === 2">
              <div class="step-dot"></div>
              <div class="step-text">
                <span class="title">2. POI Selection</span>
                <span class="desc">Drag & Drop Routing</span>
              </div>
            </div>
            <div class="planning-step-item" [class.active]="currentStep() >= 3" [class.current]="currentStep() === 3">
              <div class="step-dot"></div>
              <div class="step-text">
                <span class="title">3. Refinement</span>
                <span class="desc">Review Map & Times</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <section class="planning-step-content relative flex flex-col h-full bg-white">
          <div class="step-header p-6 border-b border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 m-0">{{ stepTitle() }}</h3>
            <p class="text-sm text-gray-500 m-0 mt-1">{{ stepSubtitle() }}</p>
          </div>

          <div class="step-body flex-1 overflow-y-auto p-6 bg-slate-50/50">
            
            <!-- Step 1: Configuration -->
            <form [formGroup]="configForm" *ngIf="currentStep() === 1" class="space-y-6 animate-fade-in max-w-2xl">
              <div class="grid grid-cols-2 gap-6">
                <div class="field col-span-2">
                  <label class="premium-label">Trip Title</label>
                  <input pInputText formControlName="title" placeholder="E.g., Ha Giang Loop Adventure" class="premium-input w-full" />
                </div>
                <div class="field col-span-2 md:col-span-1">
                  <label class="premium-label">Destination</label>
                  <input pInputText formControlName="destination" placeholder="E.g., Ha Giang" class="premium-input w-full" />
                </div>
                <div class="field col-span-2 md:col-span-1">
                  <label class="premium-label">Travel Style</label>
                  <p-dropdown [options]="styles" formControlName="style" styleClass="w-full premium-dropdown"></p-dropdown>
                </div>
                <!-- Note: using simple native inputs for date to avoid PrimeNG overlay issues in complex flex layouts -->
                <div class="field col-span-2 md:col-span-1">
                  <label class="premium-label">Start Date</label>
                  <input type="date" formControlName="startDate" class="premium-input w-full" />
                </div>
                <div class="field col-span-2 md:col-span-1">
                  <label class="premium-label">End Date</label>
                  <input type="date" formControlName="endDate" class="premium-input w-full" />
                </div>
                <div class="field col-span-2 md:col-span-1">
                  <label class="premium-label">Est. Budget (VND)</label>
                  <input type="number" pInputText formControlName="budget" class="premium-input w-full" />
                </div>
              </div>
            </form>

            <!-- Step 2: POI Drag & Drop -->
            <div *ngIf="currentStep() === 2" class="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
               <div class="poi-pool">
                  <h4 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4"><i class="pi pi-sparkles text-amber-500 mr-2"></i>AI Suggestions</h4>
                  <div class="space-y-3">
                     <div *ngFor="let poi of suggestedPOIs()" class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center hover:border-blue-300 transition-colors">
                        <div>
                           <span class="font-bold text-gray-800 block">{{ poi.name }}</span>
                           <span class="text-xs text-gray-500"><i class="pi pi-clock mr-1"></i>{{ poi.estimated_duration_minutes }} min • {{ poi.category }}</span>
                        </div>
                        <button pButton icon="pi pi-plus" class="p-button-rounded p-button-text p-button-sm" (click)="addPOI(poi)"></button>
                     </div>
                  </div>
               </div>
               
               <div class="itinerary-list">
                  <h4 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4"><i class="pi pi-calendar mb-2 mr-2"></i>Day 1 Itinerary</h4>
                  <div cdkDropList class="list-container bg-gray-100/50 p-2 rounded-xl min-h-[300px]" (cdkDropListDropped)="drop($event)">
                     <div *ngIf="selectedPOIs().length === 0" class="text-center p-8 text-gray-400 text-sm font-medium">
                        Drag or Add items here to build your route
                     </div>
                     <div class="list-item bg-white p-4 rounded-lg shadow-sm mb-2 border-l-4 border-blue-500 cursor-move flex justify-between items-center group" *ngFor="let item of selectedPOIs()" cdkDrag>
                        <div class="flex items-center gap-3">
                           <i class="pi pi-bars text-gray-300"></i>
                           <div>
                              <span class="font-bold text-gray-800 block">{{ item.name }}</span>
                              <span class="text-xs text-blue-600 font-medium">{{ item.category }}</span>
                           </div>
                        </div>
                        <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm opacity-0 group-hover:opacity-100 transition-opacity" (click)="removePOI(item)"></button>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Step 3: Refinement & Map -->
            <div *ngIf="currentStep() === 3" class="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
               <div class="timeline-review bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-6">Final Timeline Review</h4>
                  <div class="relative border-l-2 border-slate-200 ml-4 space-y-8">
                     <div class="relative pl-6" *ngFor="let item of selectedPOIs(); let i = index">
                        <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                        <h5 class="font-bold text-gray-800 m-0">{{ item.name }}</h5>
                        <p class="text-sm text-gray-500 mt-1 mb-0">{{ item.estimated_duration_minutes }} minutes</p>
                        <div *ngIf="i < selectedPOIs().length - 1" class="text-xs text-amber-600 font-medium mt-2 bg-amber-50 inline-block px-2 py-1 rounded-md">
                           <i class="pi pi-car mr-1"></i>~45 mins driving
                        </div>
                     </div>
                  </div>
               </div>
               <div class="map-placeholder bg-slate-200 rounded-2xl relative overflow-hidden h-[400px] flex items-center justify-center border-2 border-slate-300 border-dashed">
                  <!-- In a real implementation, Leaflet/Google Maps component goes here -->
                  <div class="text-center">
                     <i class="pi pi-map scale-150 text-4xl text-slate-400 mb-4 block"></i>
                     <span class="font-bold text-slate-500">Interactive Map Visualization</span>
                     <p class="text-xs text-slate-400 mt-2">Route generated based on coordinates</p>
                  </div>
               </div>
            </div>

          </div>

          <div class="step-footer p-6 border-t border-gray-100 bg-white flex justify-between">
            <p-button label="Cancel" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="cancel()"></p-button>
            <div class="flex gap-3">
              <p-button label="Back" icon="pi pi-chevron-left" [text]="true" *ngIf="currentStep() > 1" (onClick)="previous()"></p-button>
              <p-button [label]="currentStep() === 3 ? 'Save Trip' : 'Continue'" 
                        [icon]="currentStep() === 3 ? 'pi pi-check' : 'pi pi-chevron-right'" 
                        iconPos="right"
                        [disabled]="formInvalid()"
                        [severity]="currentStep() === 3 ? 'success' : 'primary'"
                        (onClick)="next()"></p-button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .planning-page { height: calc(100vh - 64px); background: #f8fafc; padding: 1.5rem 2rem; display: flex; flex-direction: column; box-sizing: border-box; }
    .planning-stepper-container { 
      display: grid; grid-template-columns: 280px 1fr; 
      flex: 1; min-height: 0; max-width: 1300px; width: 100%; margin: 0 auto;
      border-radius: 1.5rem; border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); overflow: hidden;
    }
    .blur-effect { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    
    .planning-stepper-nav { background: rgba(248,250,252,0.8); padding: 2rem; border-right: 1px solid #f1f5f9; }
    .nav-header { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 1.5rem; }
    
    .planning-step-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; margin-bottom: 0.5rem; cursor: pointer; border-radius: 1rem; opacity: 0.5; transition: all 0.2s; }
    .planning-step-item.active { opacity: 1; }
    .planning-step-item.current { background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); opacity: 1;}
    .step-dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd5e1; transition: all 0.3s;}
    .planning-step-item.active .step-dot { background: #3b82f6; box-shadow: 0 0 0 4px #eff6ff; }
    .step-text .title { font-size: 0.875rem; font-weight: 700; color: #1e293b; display: block; }
    .step-text .desc { font-size: 0.75rem; color: #64748b; }

    .premium-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
    .premium-input { 
      width: 100%; border: 1px solid #e2e8f0; border-radius: 0.75rem; 
      padding: 0.75rem 1rem; font-size: 0.875rem; background: #fff; transition: all 0.2s; 
    }
    .premium-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px #eff6ff; outline: none; }
    ::ng-deep .premium-dropdown .p-dropdown { width: 100%; border-radius: 0.75rem; border-color: #e2e8f0; }

    .cdk-drag-preview { box-sizing: border-box; border-radius: 0.5rem; box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.2); background: white; padding: 1rem; }
    .cdk-drag-placeholder { opacity: 0; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
  `]
})
export class TripCreateComponent {
  private fb = inject(FormBuilder);
  private tripStore = inject(TripStoreService);
  private router = inject(Router);

  currentStep = signal<number>(1);
  styles = ['Chill & Relax', 'Trekking/Adventure', 'Family Vacation', 'Culture & History', 'Food Tour'];

  configForm = this.fb.group({
    title: ['', Validators.required],
    destination: ['', Validators.required],
    style: ['Chill & Relax'],
    startDate: [''],
    endDate: [''],
    budget: [0]
  });

  // Mock AI Suggestions
  suggestedPOIs = signal<PointOfInterest[]>([
    { id: '1', name: 'Dong Van Karst Plateau', category: 'Nature', lat: 23.2, lng: 105.3, estimated_duration_minutes: 180 },
    { id: '2', name: 'Ma Pi Leng Pass', category: 'Sightseeing', lat: 23.25, lng: 105.4, estimated_duration_minutes: 120 },
    { id: '3', name: 'Lung Cu Flag Tower', category: 'Culture', lat: 23.36, lng: 105.31, estimated_duration_minutes: 90 },
    { id: '4', name: 'Nho Que River Boat', category: 'Activity', lat: 23.27, lng: 105.42, estimated_duration_minutes: 120 },
    { id: '5', name: 'Hmong King Palace', category: 'History', lat: 23.01, lng: 104.99, estimated_duration_minutes: 60 }
  ]);

  selectedPOIs = signal<PointOfInterest[]>([]);

  stepTitle = computed(() => {
    switch(this.currentStep()) {
      case 1: return 'Trip Configuration';
      case 2: return 'Build Your Route';
      case 3: return 'Review & Refine';
      default: return '';
    }
  });

  stepSubtitle = computed(() => {
    switch(this.currentStep()) {
      case 1: return 'Define your destination, dates, and budget.';
      case 2: return 'Select AI-suggested POIs and drag to order.';
      case 3: return 'Review the map and distance estimates.';
      default: return '';
    }
  });

  formInvalid(): boolean {
    if (this.currentStep() === 1) return this.configForm.invalid;
    if (this.currentStep() === 2) return this.selectedPOIs().length === 0;
    return false;
  }

  next() {
    if (this.currentStep() === 3) {
      this.save();
    } else {
      this.currentStep.update(v => v + 1);
    }
  }

  previous() {
    this.currentStep.update(v => v - 1);
  }

  cancel() {
    this.router.navigate(['/travel']);
  }

  addPOI(poi: PointOfInterest) {
    if (!this.selectedPOIs().find(p => p.id === poi.id)) {
      this.selectedPOIs.update(list => [...list, poi]);
    }
  }

  removePOI(poi: PointOfInterest) {
    this.selectedPOIs.update(list => list.filter(p => p.id !== poi.id));
  }

  drop(event: CdkDragDrop<PointOfInterest[]>) {
    const arr = [...this.selectedPOIs()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.selectedPOIs.set(arr);
  }

  save() {
    const val = this.configForm.value;
    const newTrip: Trip = {
      id: "trip_" + Date.now(),
      title: val.title || '',
      destination: val.destination || '',
      description: val.style || '',
      start_date: val.startDate || '',
      end_date: val.endDate || '',
      budget: val.budget || 0,
      status: 'upcoming',
      created_at: new Date().toISOString()
    };
    
    // Save to offline store
    this.tripStore.setActiveTrip(newTrip);
    
    // Convert POIs to ItineraryItems
    this.selectedPOIs().forEach((poi, index) => {
      this.tripStore.addItineraryItem({
        id: "iti_" + Date.now() + index,
        trip_id: newTrip.id,
        title: poi.name,
        location: `${poi.lat},${poi.lng}`,
        activity_type: poi.category,
        note: `Est. duration: ${poi.estimated_duration_minutes}m`
      });
    });

    this.router.navigate(['/travel']);
  }
}
