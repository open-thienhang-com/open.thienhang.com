import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TripStoreService } from '../../services/trip-store.service';
import { TravelService } from '../../services/travel.service';
import { Expense, Trip, TripPhoto } from '../../models/travel.model';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ButtonModule, TagModule, 
    DialogModule, InputTextModule, InputNumberModule, DropdownModule, ReactiveFormsModule
  ],
  template: `
    <div class="trip-detail-page bg-slate-50 min-h-screen">
      
      <!-- Hero Header -->
      <div class="relative h-[300px] w-full bg-slate-800 overflow-hidden">
        <img [src]="activeTrip()?.cover_image || 'assets/placeholder-trip.jpg'" class="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div class="absolute top-6 left-6 z-10">
          <p-button icon="pi pi-arrow-left" [rounded]="true" severity="secondary" (onClick)="router.navigate(['/travel'])"></p-button>
        </div>
        
        <div class="absolute bottom-8 left-8 right-8 z-10 flex justify-between items-end">
          <div>
            <p-tag [value]="activeTrip()?.status || 'Draft'" severity="success" styleClass="uppercase text-[10px] font-bold mb-3"></p-tag>
            <h1 class="text-4xl font-extrabold text-white m-0 drop-shadow-md">{{ activeTrip()?.title || 'Loading Trip...' }}</h1>
            <p class="text-slate-300 mt-2 font-medium flex items-center gap-4">
              <span><i class="pi pi-map-marker mr-1"></i>{{ activeTrip()?.destination || 'Unknown' }}</span>
              <span *ngIf="activeTrip()?.start_date"><i class="pi pi-calendar mr-1"></i>{{ activeTrip()?.start_date }} - {{ activeTrip()?.end_date }}</span>
              <span><i class="pi pi-users mr-1"></i>{{ store.members().length || 1 }} Members</span>
            </p>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-300 uppercase font-bold tracking-widest mb-1">Total Budget</div>
            <div class="text-2xl font-bold text-amber-400 font-mono">{{ (activeTrip()?.budget || 0) | currency:'VND' }}</div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div class="flex max-w-6xl mx-auto px-8">
          <button *ngFor="let tab of tabs" 
                  (click)="activeTab.set(tab.id)"
                  class="px-6 py-4 font-bold text-sm transition-colors border-b-2"
                  [class.text-blue-600]="activeTab() === tab.id"
                  [class.border-blue-600]="activeTab() === tab.id"
                  [class.text-slate-500]="activeTab() !== tab.id"
                  [class.border-transparent]="activeTab() !== tab.id">
            <i [class]="tab.icon + ' mr-2'"></i>{{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="max-w-6xl mx-auto p-8 h-[calc(100vh-380px)] overflow-y-auto">
        
        <!-- ITINERARY TAB -->
        <div *ngIf="activeTab() === 'itinerary'" class="animate-fade-in">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800 m-0">Itinerary Timeline</h2>
            <p-button icon="pi pi-map" label="View Map" severity="secondary" [outlined]="true"></p-button>
          </div>
          
          <div class="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
             <div *ngIf="store.timelineItems().length === 0" class="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <i class="pi pi-calendar-times text-4xl text-slate-300 mb-3"></i>
                <p class="text-slate-500 font-medium">No itinerary items yet.</p>
             </div>
             <!-- Timeline Items -->
             <div *ngFor="let item of store.timelineItems(); let i = index" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <i class="pi pi-check text-sm"></i>
                </div>
                <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                   <div class="flex items-center justify-between mb-1">
                      <h4 class="font-bold text-slate-800 text-lg m-0">{{ item.title }}</h4>
                      <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{{ item.activity_type }}</span>
                   </div>
                   <p class="text-sm text-slate-500 mb-3"><i class="pi pi-clock mr-1"></i>{{ item.date || 'Day 1' }} • {{ item.start_time || 'flexible' }}</p>
                   <p class="text-sm text-slate-700 m-0">{{ item.note }}</p>
                </div>
             </div>
          </div>
        </div>

        <!-- SHARED WALLET TAB -->
        <div *ngIf="activeTab() === 'wallet'" class="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-2 space-y-6">
            <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h3 class="text-lg font-bold text-slate-800 m-0">Group Expenses</h3>
                <p class="text-sm text-slate-500 m-0">Track and split bills instantly.</p>
              </div>
              <p-button icon="pi pi-plus" label="Add Expense" (onClick)="showExpenseModal = true"></p-button>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <table class="w-full text-left border-collapse">
                  <thead>
                     <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th class="p-4 font-bold">Date</th>
                        <th class="p-4 font-bold">Description</th>
                        <th class="p-4 font-bold">Paid By</th>
                        <th class="p-4 font-bold text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr *ngIf="store.expenses().length === 0">
                        <td colspan="4" class="p-8 text-center text-slate-400 font-medium">No expenses logged yet. You are completely debt-free!</td>
                     </tr>
                     <tr *ngFor="let exp of store.expenses()" class="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                        <td class="p-4 text-sm text-slate-500">{{ exp.date | date:'MMM dd' }}</td>
                        <td class="p-4">
                           <div class="font-bold text-slate-800">{{ exp.description }}</div>
                           <div class="text-xs text-slate-500">{{ exp.category }} • {{ exp.split_method }} split</div>
                        </td>
                        <td class="p-4">
                           <span class="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-md">{{ exp.paid_by }}</span>
                        </td>
                        <td class="p-4 text-right font-bold text-slate-800 font-mono">{{ exp.amount | currency:exp.currency }}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Wallet Balances -->
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
               <i class="pi pi-wallet absolute -right-4 -bottom-4 text-8xl text-white/5"></i>
               <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400 m-0 mb-4">Total Spent</h3>
               <div class="text-4xl font-extrabold font-mono mb-6">{{ store.totalExpenses() | currency:'VND' }}</div>
               
               <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase border-b border-white/10 pb-2">Member Balances</h4>
                  <div class="flex justify-between items-center">
                     <span class="text-sm font-medium">You (Thien)</span>
                     <span class="text-sm font-bold text-emerald-400">Owning 0 VND</span>
                  </div>
                  <div class="flex justify-between items-center opacity-60">
                     <span class="text-sm font-medium">Waiting for sync...</span>
                  </div>
               </div>
               <p-button label="Settle Debts" styleClass="w-full mt-6" severity="success" [outlined]="true"></p-button>
            </div>
          </div>
        </div>

        <!-- GALLERY TAB -->
        <div *ngIf="activeTab() === 'gallery'" class="animate-fade-in">
          <div class="flex justify-between items-center mb-6">
            <div>
               <h2 class="text-2xl font-bold text-slate-800 m-0">Trip Gallery</h2>
               <p class="text-sm text-slate-500">Geotagged collaborative photo album</p>
            </div>
            
            <div class="flex gap-3 items-center">
               <span *ngIf="store.isOfflineMode()" class="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                  <i class="pi pi-wifi text-amber-500"></i> Offline (Queueing)
               </span>
               <p-button icon="pi pi-cloud-upload" label="Upload Photos"></p-button>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div *ngFor="let photo of store.photos()" class="relative aspect-square rounded-xl overflow-hidden group bg-slate-200 cursor-pointer">
                <img [src]="photo.url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                   <i class="pi pi-map-marker mr-1"></i> Geotagged
                </div>
                <div *ngIf="photo.sync_status === 'pending'" class="absolute top-2 right-2">
                   <i class="pi pi-sync pi-spin text-white drop-shadow-md"></i>
                </div>
             </div>
             <div *ngIf="store.photos().length === 0" class="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <i class="pi pi-camera text-5xl text-slate-300 mb-4 inline-block"></i>
                <h3 class="text-lg font-bold text-slate-600 m-0">No photos yet</h3>
                <p class="text-sm text-slate-400 mt-1">Capture your memories and they will appear here.</p>
             </div>
          </div>
        </div>

        <!-- MEMBERS TAB -->
        <div *ngIf="activeTab() === 'members'" class="animate-fade-in">
          <div class="flex justify-between items-center mb-6">
            <div>
               <h2 class="text-2xl font-bold text-slate-800 m-0">Group Profile & Roles</h2>
               <p class="text-sm text-slate-500">Manage permissions, health notes, and tasks.</p>
            </div>
            <div class="flex gap-2">
               <p-button icon="pi pi-qrcode" label="QR Invite" severity="secondary" [outlined]="true"></p-button>
               <p-button icon="pi pi-user-plus" label="Invite Member"></p-button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Current User (Mock) -->
             <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-blue-300 transition-colors">
                <div class="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-emerald-400 relative">
                   <img src="assets/default-avatar.png" class="w-full h-full object-cover" />
                   <div class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
                <div class="flex-1">
                   <div class="flex justify-between items-start">
                      <div>
                         <h4 class="font-bold text-slate-800 text-lg m-0 flex items-center gap-2">Thien <p-tag value="OWNER" severity="info" styleClass="text-[8px] px-1.5 py-0.5 rounded-sm"></p-tag></h4>
                         <p class="text-xs text-emerald-600 font-bold m-0 mt-0.5">Online • Real-time Location ON</p>
                      </div>
                      <p-button icon="pi pi-ellipsis-v" [rounded]="true" [text]="true" severity="secondary" size="small"></p-button>
                   </div>
                   <div class="mt-4 space-y-2">
                      <div class="flex gap-2 text-xs">
                         <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium"><i class="pi pi-wrench mr-1"></i>Driver</span>
                         <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium"><i class="pi pi-money-bill mr-1"></i>Treasurer</span>
                      </div>
                      <div class="text-xs text-rose-500 font-medium flex items-center gap-1">
                         <i class="pi pi-info-circle"></i> Allergic to Seafood
                      </div>
                   </div>
                </div>
             </div>
             
             <!-- Invite Placeholder -->
             <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                <div class="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                   <i class="pi pi-link text-2xl text-blue-500"></i>
                </div>
                <h4 class="font-bold text-slate-700 m-0">Add Travel Buddy</h4>
                <p class="text-xs text-slate-500 mt-1 max-w-[200px]">Send an invite link via Zalo or Messenger for them to join.</p>
             </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Add Expense Modal -->
    <p-dialog [(visible)]="showExpenseModal" [modal]="true" header="Add Group Expense" [style]="{width: '450px'}" styleClass="rounded-2xl">
       <form [formGroup]="expenseForm" (ngSubmit)="saveExpense()" class="space-y-4 pt-4">
          <div class="field">
             <label class="text-xs font-bold text-slate-600 uppercase mb-1 block">Amount (VND)</label>
             <p-inputNumber formControlName="amount" styleClass="w-full" inputId="currency-vn" mode="currency" currency="VND" locale="vi-VN"></p-inputNumber>
          </div>
          <div class="field">
             <label class="text-xs font-bold text-slate-600 uppercase mb-1 block">Description</label>
             <input pInputText formControlName="description" class="w-full" placeholder="e.g. Dinner at Ha Giang" />
          </div>
          <div class="field">
             <label class="text-xs font-bold text-slate-600 uppercase mb-1 block">Category</label>
             <p-dropdown [options]="['Food', 'Transport', 'Accommodation', 'Tickets', 'Other']" formControlName="category" styleClass="w-full"></p-dropdown>
          </div>
          <div class="field">
             <label class="text-xs font-bold text-slate-600 uppercase mb-1 block">Split Method</label>
             <p-dropdown [options]="['Equal Split', 'Exact Amount', 'Percentages']" formControlName="splitMethod" styleClass="w-full"></p-dropdown>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
             <p-button label="Cancel" [text]="true" severity="secondary" (onClick)="showExpenseModal = false"></p-button>
             <p-button label="Save Expense" type="submit" [disabled]="expenseForm.invalid"></p-button>
          </div>
       </form>
    </p-dialog>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    ::ng-deep .p-dialog .p-dialog-header { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }
    ::ng-deep .p-dialog .p-dialog-content { border-bottom-left-radius: 1rem; border-bottom-right-radius: 1rem; padding: 1.5rem; }
  `]
})
export class TripDetailComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  store = inject(TripStoreService);
  travelService = inject(TravelService);
  fb = inject(FormBuilder);

  @ViewChild('photoInput') photoInputRef!: ElementRef<HTMLInputElement>;

  tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: 'pi pi-calendar' },
    { id: 'wallet', label: 'Shared Wallet', icon: 'pi pi-wallet' },
    { id: 'gallery', label: 'Trip Gallery', icon: 'pi pi-images' },
    { id: 'members', label: 'Members & Roles', icon: 'pi pi-users' }
  ];
  
  activeTab = signal<string>('itinerary');
  activeTrip = this.store.activeTrip;
  uploading = signal<boolean>(false);

  showExpenseModal = false;
  expenseForm = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1000)]],
    description: ['', Validators.required],
    category: ['Food'],
    splitMethod: ['Equal Split']
  });

  ngOnInit() {
    // In a real app, we would load trip ID from URL and fetch from Store/API
    // Here we assume store.activeTrip is already set during creation or listing
    if (!this.activeTrip()) {
      // Mock loading if refreshed
      this.store.setActiveTrip({
        id: 'mock_trip_1',
        title: 'Ha Giang Loop Discovery',
        destination: 'Ha Giang, Vietnam',
        start_date: '2026-04-10',
        end_date: '2026-04-14',
        budget: 5000000,
        status: 'upcoming'
      });
    }
  }

  /** Opens the hidden file input */
  triggerUpload(): void {
    this.photoInputRef?.nativeElement?.click();
  }

  /** Called when a file is selected – uploads to Imgur via the real API */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    const localPreviewUrl = URL.createObjectURL(file);

    // Optimistically add to gallery with pending status
    const tempPhoto: TripPhoto = {
      id: 'temp_' + Date.now(),
      trip_id: this.activeTrip()?.id || '',
      url: localPreviewUrl,
      sync_status: 'pending',
      uploaded_by: 'You',
      uploaded_at: new Date().toISOString()
    };
    this.store.queuePhotoUpload(tempPhoto);

    // Upload via API
    this.travelService.uploadMedia(file, 'imgur').subscribe({
      next: (result) => {
        if (result?.url) {
          // Replace temp photo with real URL
          this.store.photos.update(photos =>
            photos.map(p => p.id === tempPhoto.id
              ? { ...p, url: result.url, sync_status: 'synced' }
              : p
            )
          );
        }
        this.uploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        // Mark as failed
        this.store.photos.update(photos =>
          photos.map(p => p.id === tempPhoto.id ? { ...p, sync_status: 'failed' } : p)
        );
        this.uploading.set(false);
      }
    });

    // Reset file input
    input.value = '';
  }

  saveExpense() {
    if (this.expenseForm.invalid) return;
    
    const val = this.expenseForm.value;
    const newExp: Expense = {
      id: 'exp_' + Date.now(),
      trip_id: this.activeTrip()?.id || '',
      paid_by: 'You', // Hardcoded for demo
      amount: val.amount || 0,
      currency: 'VND',
      category: val.category || 'Other',
      description: val.description || '',
      date: new Date().toISOString(),
      split_method: 'equal',
      splits: [],
      created_at: new Date().toISOString()
    };

    this.store.addExpense(newExp);
    this.showExpenseModal = false;
    this.expenseForm.reset({ category: 'Food', splitMethod: 'Equal Split' });
  }
}
