import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';

import { HotelService } from '../../../services/hotel.service';
import { Apartment } from '../../../models/hotel.models';

@Component({
  selector: 'app-apartment-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ButtonModule, CardModule, TabViewModule, BadgeModule, TagModule,
    DividerModule, SkeletonModule, ToastModule, TooltipModule, TableModule
  ],
  providers: [MessageService],
  templateUrl: './apartment-detail.component.html',
  styleUrls: ['./apartment-detail.component.scss']
})
export class ApartmentDetailComponent implements OnInit {
  apartment: Apartment | null = null;
  loading = false;
  apartmentId: string | null = null;
  rooms: any[] = [];
  bookings: any[] = [];
  reviews: any[] = [];
  ratings: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.apartmentId = params['id'];
      if (this.apartmentId) {
        this.loadApartmentDetails();
        this.loadRelatedData();
      }
    });
  }

  loadApartmentDetails(): void {
    if (!this.apartmentId) return;
    
    this.loading = true;
    this.hotelService.getApartmentById(this.apartmentId).subscribe({
      next: (response) => {
        // Handle ApiResponse structure - response is ApiResponse<Apartment>
        if (response && typeof response === 'object') {
          if ('data' in response && response.data) {
            this.apartment = response.data;
          } else if ('id' in response) {
            // If response itself is an Apartment (shouldn't happen but handle it)
            this.apartment = response as unknown as Apartment;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load apartment details'
        });
        this.loading = false;
      }
    });
  }

  loadRelatedData(): void {
    if (!this.apartmentId) return;

    // Load rooms
    this.hotelService.getRoomsByApartment(this.apartmentId).subscribe({
      next: (response) => {
        this.rooms = response.data || [];
      },
      error: () => {
        // Silently fail
      }
    });

    // Load bookings (filter by apartment_id)
    this.hotelService.getBookings().subscribe({
      next: (response) => {
        this.bookings = (response.data || []).filter((b: any) => b.apartment_id === this.apartmentId);
      },
      error: () => {
        // Silently fail
      }
    });

    // Load reviews
    this.hotelService.getReviewsByApartment(this.apartmentId).subscribe({
      next: (response) => {
        this.reviews = response.data || [];
      },
      error: () => {
        // Silently fail
      }
    });

    // Load ratings
    this.hotelService.getRatingsByApartment(this.apartmentId).subscribe({
      next: (response) => {
        this.ratings = response.data || [];
      },
      error: () => {
        // Silently fail
      }
    });
  }

  editApartment(): void {
    if (this.apartment) {
      this.router.navigate(['/hotel/apartments'], { 
        queryParams: { edit: this.apartment.id } 
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/hotel/apartments']);
  }

  getAverageRating(): number {
    if (!this.ratings || this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, r) => acc + (r.avg_rating || 0), 0);
    return sum / this.ratings.length;
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'confirmed': 'success',
      'pending': 'warning',
      'canceled': 'danger',
      'completed': 'info',
      'no_show': 'secondary'
    };
    return severityMap[status] || 'secondary';
  }

  getPaymentSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'paid': 'success',
      'unpaid': 'warning',
      'in_process': 'info',
      'canceled': 'danger'
    };
    return severityMap[status] || 'secondary';
  }
}
