import { Component, ElementRef, OnDestroy, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as L from 'leaflet';

import { JourneyService } from '../../services/journey.service';
import { GeocodeService } from '../../services/geocode.service';
import { BudgetItem, ItineraryItem, TripDetail } from '../../models/journey.model';
import { formatCurrency, formatDate, formatDateRange, statusLabel, tripDurationDays } from '../../../../shared/utils/format';

interface ItineraryDayGroup {
  day: string;
  items: ItineraryItem[];
}

const DEFAULT_ZOOM = 12;
const FALLBACK_CENTER: L.LatLngTuple = [16.5, 106.0];

@Component({
  selector: 'app-journey-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './journey-detail.component.html',
})
export class JourneyDetailComponent implements OnInit, OnDestroy {
  /**
   * Signal query: the #mapContainer div only enters the DOM once trip() is set
   * (it's nested inside the `@if (trip(); as t)` block), so a plain ViewChild
   * resolved in ngAfterViewInit would run before the container ever exists.
   * The effect below reacts once the ref actually appears.
   */
  private mapContainerRef = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  private route = inject(ActivatedRoute);
  private journeyService = inject(JourneyService);
  private geocodeService = inject(GeocodeService);

  private map: L.Map | null = null;
  private markers: L.LayerGroup = L.layerGroup();

  loading = signal(true);
  error = signal('');
  trip = signal<TripDetail | null>(null);

  itineraryDays = computed<ItineraryDayGroup[]>(() => {
    const items = this.trip()?.itinerary ?? [];
    const byDay = new Map<string, ItineraryItem[]>();
    for (const item of items) {
      const key = item.day || 'Khác';
      byDay.set(key, [...(byDay.get(key) ?? []), item]);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, dayItems]) => ({
        day,
        items: dayItems.sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? '')),
      }));
  });

  budgetItems = computed<BudgetItem[]>(() => this.trip()?.budget_items ?? []);
  actualSpend = computed(() => this.budgetItems().reduce((sum, b) => sum + (b.amount || 0), 0));
  budgetProgressPct = computed(() => {
    const planned = this.trip()?.budget || 0;
    if (!planned) return 0;
    return Math.min(150, Math.round((this.actualSpend() / planned) * 100));
  });

  readonly formatCurrency = formatCurrency;
  readonly formatDate = formatDate;
  readonly formatDateRange = formatDateRange;
  readonly statusLabel = statusLabel;

  constructor() {
    effect(() => {
      const container = this.mapContainerRef();
      if (!container || this.map) return;

      this.map = L.map(container.nativeElement).setView(FALLBACK_CENTER, 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map);
      this.markers.addTo(this.map);
      // The container is freshly inserted this same tick; force Leaflet to
      // re-measure it once the browser has actually laid it out.
      setTimeout(() => this.map?.invalidateSize(), 0);

      const existing = this.trip();
      if (existing) this.plotMap(existing);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.error.set('Không tìm thấy hành trình.');
      return;
    }

    this.journeyService.getTripDetail(id).subscribe({
      next: (detail) => {
        this.loading.set(false);
        if (!detail) {
          this.error.set('Không tìm thấy hành trình.');
          return;
        }
        this.trip.set(detail);
        this.plotMap(detail);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Không tải được hành trình này lúc này.');
      },
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  tripDurationDays(): number | null {
    const trip = this.trip();
    return trip ? tripDurationDays(trip.start_date, trip.end_date) : null;
  }

  budgetVarianceLabel(): string {
    const planned = this.trip()?.budget || 0;
    const diff = planned - this.actualSpend();
    if (!planned) return '';
    return diff >= 0 ? `Còn dư ${formatCurrency(diff)}` : `Vượt ${formatCurrency(Math.abs(diff))}`;
  }

  private plotMap(trip: TripDetail): void {
    if (!this.map) return;
    this.markers.clearLayers();

    const landmarks = (trip.general_information?.landmarks ?? []).filter(
      (l) => typeof l.latitude === 'number' && typeof l.longitude === 'number'
    );

    if (landmarks.length) {
      const bounds: L.LatLngTuple[] = [];
      for (const landmark of landmarks) {
        const marker = L.marker([landmark.latitude!, landmark.longitude!], {
          icon: L.divIcon({ className: 'journey-marker', html: '📍', iconSize: [28, 28] }),
        }).bindPopup(`<strong>${escapeHtml(landmark.name)}</strong>${landmark.note ? `<br>${escapeHtml(landmark.note)}` : ''}`);
        this.markers.addLayer(marker);
        bounds.push([landmark.latitude!, landmark.longitude!]);
      }
      this.map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
      return;
    }

    if (!trip.destination) return;
    this.geocodeService.search(trip.destination).subscribe((results) => {
      if (!this.map || !results.length) return;
      const { lat, lng, displayName } = results[0];
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({ className: 'journey-marker', html: '📍', iconSize: [28, 28] }),
      }).bindPopup(`<strong>${escapeHtml(trip.destination)}</strong><br>${escapeHtml(displayName)}`);
      this.markers.addLayer(marker);
      this.map.setView([lat, lng], DEFAULT_ZOOM);
    });
  }
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}
