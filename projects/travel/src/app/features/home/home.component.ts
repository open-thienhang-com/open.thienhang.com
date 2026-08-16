import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { JourneyService } from '../journeys/services/journey.service';
import { JourneyCardComponent } from '../../shared/components/journey-card.component';
import { formatCurrency, tripDurationDays } from '../../shared/utils/format';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, JourneyCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private journeyService = inject(JourneyService);

  loading = signal(true);
  error = signal('');

  trips = this.journeyService.trips;

  completedTrips = computed(() => this.trips().filter((t) => t.status === 'completed'));
  upcomingTrips = computed(() => this.trips().filter((t) => t.status === 'upcoming' || t.status === 'in_progress'));
  featuredTrips = computed(() => [...this.completedTrips()].slice(0, 6));

  destinationCount = computed(() => new Set(this.completedTrips().map((t) => t.destination)).size);

  totalDays = computed(() =>
    this.completedTrips().reduce((sum, t) => sum + (tripDurationDays(t.start_date, t.end_date) ?? 0), 0)
  );

  totalBudgetText = computed(() => formatCurrency(this.completedTrips().reduce((sum, t) => sum + (t.budget || 0), 0)));

  ngOnInit(): void {
    this.journeyService.listTrips().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('Không tải được dữ liệu hành trình lúc này.');
      },
    });
  }
}
