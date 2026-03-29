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
        title="Create Travel Story"
        subtitle="Share your journey with the world."
        icon="pi pi-pencil">
      </app-page-header>

      <div class="planning-stepper-container blur-effect">
        <aside class="planning-stepper-nav">
          <div class="trip-profile-card">
            <div class="trip-profile-image-wrap">
              <img [src]="displayTripImage" alt="Trip cover" class="trip-profile-image" />
              <div class="image-overlay">
                <button pButton type="button" class="p-button-sm p-button-rounded p-button-glass" icon="pi pi-camera" (click)="tripImageInput.click()"></button>
              </div>
              <input #tripImageInput type="file" accept="image/*" class="hidden-file-input" (change)="onTripImageSelected($event)" />
            </div>
            <div class="px-2 pt-1">
              <div class="trip-profile-title">{{ form.value.title || 'Untitled Story' }}</div>
              <div class="trip-profile-subtitle flex items-center gap-1">
                <i class="pi pi-tag text-[10px]"></i>
                {{ form.value.category || 'No category' }}
              </div>
            </div>
            
            <div class="upload-status mt-4" *ngIf="isUploading">
               <div class="text-[10px] font-bold text-blue-600 mb-1 uppercase">Uploading Media...</div>
               <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 animate-pulse w-full"></div>
               </div>
            </div>
          </div>

          <div class="nav-steps mt-6">
            <h4 class="nav-header">Draft Progress</h4>
            <div class="planning-step-item" [class.active]="currentStep >= 1" [class.current]="currentStep === 1" (click)="goToStep(1)">
              <div class="step-dot"></div>
              <div class="step-text">
                <span class="title">The Story</span>
                <span class="desc">Title & Category</span>
              </div>
            </div>
            <div class="planning-step-item" [class.active]="currentStep >= 2" [class.current]="currentStep === 2" (click)="goToStep(2)">
              <div class="step-dot"></div>
              <div class="step-text">
                <span class="title">Media</span>
                <span class="desc">Upload Cover Photo</span>
              </div>
            </div>
            <div class="planning-step-item" [class.active]="currentStep >= 3" [class.current]="currentStep === 3" (click)="goToStep(3)">
              <div class="step-dot"></div>
              <div class="step-text">
                <span class="title">Narrative</span>
                <span class="desc">Summary & Status</span>
              </div>
            </div>
          </div>
        </aside>

        <section class="planning-step-content">
          <div class="step-card">
            <div class="step-header">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-gray-900 m-0">{{ getStepTitle() }}</h3>
                  <p class="text-sm text-gray-500 m-0 mt-1">{{ getStepSubtitle() }}</p>
                </div>
                <p-tag [value]="form.value.status" [severity]="getStatusSeverity(form.value.status)" styleClass="text-[10px] uppercase font-bold px-2 py-1"></p-tag>
              </div>
            </div>

            <div class="step-body p-6">
              <form [formGroup]="form" class="space-y-6">
                <!-- Step 1: Basics -->
                <div *ngIf="currentStep === 1" class="grid grid-cols-2 gap-6 animate-fade-in">
                  <div class="field col-span-2">
                    <label class="premium-label">Story Title</label>
                    <input pInputText formControlName="title" placeholder="E.g., Wandering through the streets of Paris" class="premium-input" />
                  </div>
                  <div class="field col-span-2">
                    <label class="premium-label">Category</label>
                    <p-dropdown [options]="['travel', 'adventure', 'nature', 'city', 'culture']" formControlName="category" styleClass="w-full premium-dropdown"></p-dropdown>
                  </div>
                </div>

                <!-- Step 2: Media -->
                <div *ngIf="currentStep === 2" class="animate-fade-in text-center py-10">
                   <div *ngIf="!form.value.thumbnail" class="upload-placeholder border-2 border-dashed border-gray-200 rounded-2xl p-12 hover:border-blue-400 transition-colors cursor-pointer" (click)="tripImageInput.click()">
                      <i class="pi pi-cloud-upload text-5xl text-gray-300 mb-4 block"></i>
                      <p class="text-gray-500 font-bold">Click to upload cover photo</p>
                      <p class="text-[10px] text-gray-400 mt-2 uppercase">Imgur / Supabase integration</p>
                   </div>
                   <div *ngIf="form.value.thumbnail" class="relative rounded-2xl overflow-hidden group shadow-xl max-w-sm mx-auto">
                      <img [src]="form.value.thumbnail" class="w-full h-auto" />
                      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <p-button label="Change Photo" icon="pi pi-refresh" (onClick)="tripImageInput.click()" severity="secondary" size="small"></p-button>
                      </div>
                   </div>
                </div>

                <!-- Step 3: Narrative -->
                <div *ngIf="currentStep === 3" class="grid grid-cols-2 gap-6 animate-fade-in">
                  <div class="field col-span-2">
                    <label class="premium-label">Summary</label>
                    <textarea pInputTextarea rows="4" formControlName="summary" placeholder="A brief hook for your readers..." class="premium-input resize-none"></textarea>
                  </div>
                  <div class="field col-span-2">
                    <label class="premium-label">Status</label>
                    <p-dropdown [options]="[{label: 'Draft', value: 'draft'}, {label: 'Published', value: 'published'}]" formControlName="status" optionLabel="label" optionValue="value" styleClass="w-full premium-dropdown"></p-dropdown>
                  </div>
                </div>
              </form>
            </div>

            <div class="step-footer">
              <p-button label="Cancel" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="cancel()"></p-button>
              <div class="flex gap-2">
                <p-button label="Back" icon="pi pi-chevron-left" [text]="true" *ngIf="currentStep > 1" (onClick)="previousStep()"></p-button>
                <p-button [label]="currentStep === 3 ? 'Post Story' : 'Continue'" 
                          [icon]="currentStep === 3 ? 'pi pi-send' : 'pi pi-chevron-right'" 
                          iconPos="right"
                          [loading]="submitting"
                          [disabled]="form.invalid || isUploading"
                          [severity]="currentStep === 3 ? 'success' : 'primary'"
                          (onClick)="currentStep === 3 ? submit() : nextStep()"></p-button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <p *ngIf="errorMessage" class="text-red-500 m-0 mt-4 px-6">{{ errorMessage }}</p>
      <p *ngIf="successMessage" class="text-green-600 m-0 mt-4 px-6">{{ successMessage }}</p>
    </div>
  `,
  styles: [`
    .planning-page { height: calc(100vh - 64px); background: #f1f5f9; padding: 2rem; }
    .planning-stepper-container { 
      display: grid; grid-template-columns: 320px 1fr; 
      height: 100%; max-width: 1200px; margin: 0 auto;
      border-radius: 1.5rem; border: 1px solid rgba(255,255,255,0.4);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); overflow: hidden;
    }
    .blur-effect { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    
    .planning-stepper-nav { background: rgba(255,255,255,0.5); padding: 2rem; border-right: 1px solid #e2e8f0; }
    .trip-profile-card { background: #fff; padding: 1rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .trip-profile-image-wrap { position: relative; height: 160px; border-radius: 0.75rem; overflow: hidden; background: #f8fafc; }
    .trip-profile-image { width: 100%; height: 100%; object-fit: cover; }
    .image-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
    .trip-profile-image-wrap:hover .image-overlay { opacity: 1; }
    
    .trip-profile-title { font-size: 1.125rem; font-weight: 800; color: #1e293b; margin-top: 0.75rem; }
    .trip-profile-subtitle { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; font-weight: 500; }
    
    .trip-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .stat-box { background: #f8fafc; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #f1f5f9; }
    .stat-box .label { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; display: block; }
    .stat-box .value { font-size: 0.875rem; font-weight: 700; color: #334155; }

    .nav-header { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 1rem; }
    .planning-step-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; cursor: pointer; border-radius: 0.75rem; opacity: 0.5; transition: all 0.2s; }
    .planning-step-item.active { opacity: 1; }
    .planning-step-item.current { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
    .planning-step-item.active .step-dot { background: #3b82f6; box-shadow: 0 0 0 4px #eff6ff; }
    .step-text .title { font-size: 0.875rem; font-weight: 700; color: #1e293b; display: block; }
    .step-text .desc { font-size: 0.75rem; color: #64748b; }

    .planning-step-content { background: #fff; padding: 0; display: flex; flex-direction: column; }
    .step-card { display: flex; flex-direction: column; height: 100%; }
    .step-header { padding: 2rem; border-bottom: 1px solid #f1f5f9; }
    .step-body { flex: 1; overflow-y: auto; }
    .step-footer { padding: 1.5rem 2rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; }

    .premium-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
    .premium-input { width: 100%; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.875rem; transition: all 0.2s; }
    .premium-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px #eff6ff; outline: none; }
    
    ::ng-deep .premium-dropdown .p-dropdown { width: 100%; border-radius: 0.75rem; border-color: #e2e8f0; }
    
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
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
  private readonly defaultTripImage = 'assets/placeholder-trip.jpg';

  @ViewChild('tripImageInput') tripImageInput?: ElementRef<HTMLInputElement>;

  submitting = false;
  isUploading = false;
  errorMessage = '';
  successMessage = '';
  currentStep = 1;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['travel', Validators.required],
    summary: ['', [Validators.required]],
    thumbnail: [''],
    status: ['draft']
  });

  get displayTripImage(): string {
    return this.form.value.thumbnail || this.defaultTripImage;
  }

  ngOnInit(): void {}

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'The Genesis';
      case 2: return 'Visual Hook';
      case 3: return 'The Narrative';
      default: return 'Draft Story';
    }
  }

  getStepSubtitle(): string {
    switch (this.currentStep) {
      case 1: return 'Identity and classification.';
      case 2: return 'Attach a compelling cover photo.';
      case 3: return 'Write a brief overview.';
      default: return 'Configure your post.';
    }
  }

  onTripImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploading = true;
    this.travelService.uploadMedia(file).pipe(
      finalize(() => this.isUploading = false)
    ).subscribe({
      next: (res: any) => {
        if (res?.url) {
           this.form.patchValue({ thumbnail: res.url });
           this.successMessage = 'Photo uploaded successfully to ' + res.provider;
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Upload failed: ' + (err?.message || 'Unknown error');
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting) return;

    this.submitting = true;
    this.errorMessage = '';
    
    this.travelService.createTrip(this.form.getRawValue()).pipe(
      finalize(() => this.submitting = false)
    ).subscribe({
      next: () => {
        this.successMessage = 'Story created/saved successfully.';
        setTimeout(() => this.router.navigate(['/travel']), 1500);
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to save story: ' + (err?.message || 'API error');
      }
    });
  }

  cancel(): void { this.router.navigate(['/travel']); }
  goToStep(step: number): void { this.currentStep = step; }
  nextStep(): void { if (this.currentStep < 3) this.currentStep++; }
  previousStep(): void { if (this.currentStep > 1) this.currentStep--; }

  getStatusSeverity(status?: string): 'success' | 'secondary' | 'info' {
    return status === 'published' ? 'success' : 'secondary';
  }
}
