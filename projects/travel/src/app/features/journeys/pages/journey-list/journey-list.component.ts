import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { JourneyService } from '../../services/journey.service';
import { JourneyCardComponent } from '../../../../shared/components/journey-card.component';
import { TripStatus } from '../../models/journey.model';

interface StatusFilter {
  value: TripStatus | 'all';
  label: string;
}

const FILTERS: StatusFilter[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'completed', label: 'Đã đi qua' },
  { value: 'in_progress', label: 'Đang đi' },
  { value: 'upcoming', label: 'Sắp đi' },
  { value: 'draft', label: 'Dự định' },
];

@Component({
  selector: 'app-journey-list',
  standalone: true,
  imports: [JourneyCardComponent],
  templateUrl: './journey-list.component.html',
})
export class JourneyListComponent implements OnInit {
  private journeyService = inject(JourneyService);

  readonly filters = FILTERS;

  loading = signal(true);
  error = signal('');
  activeFilter = signal<StatusFilter['value']>('all');

  trips = this.journeyService.trips;

  filteredTrips = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.trips();
    return this.trips().filter((t) => t.status === filter);
  });

  ngOnInit(): void {
    this.journeyService.listTrips().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('Không tải được danh sách hành trình lúc này.');
      },
    });
  }

  setFilter(value: StatusFilter['value']): void {
    this.activeFilter.set(value);
  }
}
