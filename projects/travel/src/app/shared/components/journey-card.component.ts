import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Trip } from '../../features/journeys/models/journey.model';
import { formatCurrency, formatDateRange, statusLabel } from '../utils/format';

const STATUS_BADGE_CLASS: Record<string, string> = {
  completed: 'bg-neo-accent',
  in_progress: 'bg-neo-secondary',
  upcoming: 'bg-neo-muted',
  draft: 'bg-white',
};

const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23C4B5FD"/%3E%3C/svg%3E';

@Component({
  selector: 'app-journey-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="['/journeys', trip.id]"
      class="group block border-4 border-black bg-white shadow-neo-md transition-all duration-200 ease-out hover:-translate-y-2 hover:shadow-neo-lg"
    >
      <div class="relative border-b-4 border-black">
        <img
          [src]="trip.thumbnail_image_urls?.[0] || fallbackImage"
          [alt]="trip.name"
          class="h-48 w-full object-cover"
          loading="lazy"
        />
        <span
          class="absolute -top-3 left-3 rotate-2 border-2 border-black px-2 py-0.5 text-[11px] font-black uppercase tracking-widest shadow-neo-sm"
          [class]="statusBadgeClass"
        >{{ statusText }}</span>
      </div>

      <div class="p-5">
        <h3 class="text-xl font-black uppercase leading-tight tracking-tight">{{ trip.name }}</h3>
        <p class="mt-1 text-sm font-bold text-black/70">📍 {{ trip.destination }}</p>
        <p class="mt-2 text-xs font-bold uppercase tracking-widest text-black/50">{{ dateRange }}</p>

        <div class="mt-4 flex items-center justify-between border-t-2 border-black pt-3">
          <span class="text-xs font-bold uppercase tracking-widest">{{ trip.people_count }} người</span>
          <span class="border-2 border-black bg-neo-bg px-2 py-1 text-xs font-black">{{ budgetText }}</span>
        </div>
      </div>
    </a>
  `,
})
export class JourneyCardComponent {
  @Input({ required: true }) trip!: Trip;

  readonly fallbackImage = FALLBACK_IMAGE;

  get statusText(): string {
    return statusLabel(this.trip.status);
  }

  get statusBadgeClass(): string {
    return STATUS_BADGE_CLASS[this.trip.status] ?? 'bg-neo-muted';
  }

  get dateRange(): string {
    return formatDateRange(this.trip.start_date, this.trip.end_date);
  }

  get budgetText(): string {
    return formatCurrency(this.trip.budget || 0);
  }
}
