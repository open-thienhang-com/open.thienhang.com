import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  Trip, 
  ItineraryItem, 
  Expense, 
  TravelMember, 
  TripPhoto,
  PointOfInterest 
} from '../models/travel.model';

@Injectable({
  providedIn: 'root'
})
export class TripStoreService {
  private platformId = inject(PLATFORM_ID);
  
  // State Signals
  activeTrip = signal<Trip | null>(null);
  members = signal<TravelMember[]>([]);
  itineraryItems = signal<ItineraryItem[]>([]);
  expenses = signal<Expense[]>([]);
  photos = signal<TripPhoto[]>([]);
  pois = signal<PointOfInterest[]>([]);
  
  // Computed Signals
  totalExpenses = computed(() => {
    return this.expenses().reduce((sum, exp) => sum + exp.amount, 0);
  });
  
  timelineItems = computed(() => {
    // Sort itinerary by date and start_time
    const items = [...this.itineraryItems()];
    return items.sort((a, b) => {
      const timeA = new Date(`${a.date || '1970-01-01'}T${a.start_time || '00:00:00'}`).getTime();
      const timeB = new Date(`${b.date || '1970-01-01'}T${b.start_time || '00:00:00'}`).getTime();
      return timeA - timeB;
    });
  });

  isOfflineMode = signal<boolean>(false);

  constructor() {
    this.hydrateFromStorage();
    this.setupOfflineSync();

    if (isPlatformBrowser(this.platformId)) {
      this.isOfflineMode.set(!navigator.onLine);
      window.addEventListener('online', () => this.isOfflineMode.set(false));
      window.addEventListener('offline', () => this.isOfflineMode.set(true));
    }
  }

  // --- Offline Sync Mechanism ---
  private setupOfflineSync() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        // Persist complex state trees locally
        const state = {
          activeTrip: this.activeTrip(),
          members: this.members(),
          itineraryItems: this.itineraryItems(),
          expenses: this.expenses(),
          photos: this.photos(),
          pois: this.pois()
        };
        localStorage.setItem('openclaw_travel_state', JSON.stringify(state));
      }
    });
  }

  private hydrateFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('openclaw_travel_state');
        if (stored) {
          const state = JSON.parse(stored);
          if (state.activeTrip) this.activeTrip.set(state.activeTrip);
          if (state.members) this.members.set(state.members);
          if (state.itineraryItems) this.itineraryItems.set(state.itineraryItems);
          if (state.expenses) this.expenses.set(state.expenses);
          if (state.photos) this.photos.set(state.photos);
          if (state.pois) this.pois.set(state.pois);
        }
      } catch (err) {
        console.warn('Failed to hydrate travel state:', err);
      }
    }
  }

  // --- Actions ---
  
  setActiveTrip(trip: Trip) {
    this.activeTrip.set(trip);
  }

  addItineraryItem(item: ItineraryItem) {
    this.itineraryItems.update(items => [...items, item]);
  }

  addExpense(expense: Expense) {
    this.expenses.update(exps => [...exps, expense]);
  }

  queuePhotoUpload(photo: TripPhoto) {
    if (this.isOfflineMode()) {
      photo.sync_status = 'pending';
    }
    this.photos.update(p => [...p, photo]);
  }
}
