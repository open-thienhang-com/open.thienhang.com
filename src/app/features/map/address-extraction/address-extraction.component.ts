import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MapService } from '../services/map.service';
import { AddressExtractData, AddressLevel } from '../models/map.models';

@Component({
  selector: 'app-address-extraction',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './address-extraction.component.html',
  styleUrls: ['./address-extraction.component.scss']
})
export class AddressExtractionComponent {
  text = '';
  loading = signal(false);
  error = signal('');
  result = signal<AddressExtractData | null>(null);

  readonly samples = [
    'Số 123 đường Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh',
    '45 Trương Đình Hội, Phường 16, Quận 8, TPHCM',
    'Tòa nhà Landmark 81, Vinhomes Central Park, Bình Thạnh, TP.HCM',
  ];

  constructor(private mapService: MapService) { }

  useSample(s: string): void {
    this.text = s;
    this.extract();
  }

  extract(): void {
    const t = this.text.trim();
    if (!t || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);
    this.mapService.extractAddress(t).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res?.success && res.data) this.result.set(res.data);
        else this.error.set(res?.message || 'Extraction failed');
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err?.error?.detail || err?.message || 'Extraction failed';
        this.error.set(err?.status === 503
          ? 'Model đang khởi động (cold start) — thử lại sau ~30 giây.'
          : detail);
      }
    });
  }

  /** Levels that have at least one extracted entity (table rows). */
  get filledLevels(): AddressLevel[] {
    return (this.result()?.levels || []);
  }

  levelIcon(key: string): string {
    const icons: Record<string, string> = {
      city: 'pi pi-map', district: 'pi pi-map-marker', ward: 'pi pi-flag',
      street: 'pi pi-directions', house_number: 'pi pi-home',
      place_name: 'pi pi-building', other: 'pi pi-tag',
    };
    return icons[key] || 'pi pi-tag';
  }

  sourceSeverity(source: string): 'success' | 'info' | 'warn' {
    if (source === 'gazetteer-exact') return 'success';
    if (source === 'bert') return 'info';
    return 'warn'; // gazetteer-fuzzy
  }
}
