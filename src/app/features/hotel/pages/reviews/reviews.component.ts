import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Review } from '../../models/hotel.models';

@Component({
  selector: 'app-hotel-reviews',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputTextarea,
    DropdownModule, ToastModule, ConfirmDialogModule, TableModule, BadgeModule,
    TooltipModule, SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  apartments: any[] = [];
  apartmentsForDropdown: any[] = [];
  bookings: any[] = [];
  loading = false;
  showDialog = false;
  isEditMode = false;
  selectedReview: Review | null = null;

  formData: Partial<Review> = this.getEmptyReviewForm();
  searchQuery = '';
  selectedApartmentFilter: string | null = null;

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadReviews();
    this.loadApartments();
    this.loadBookings();
  }

  loadReviews(): void {
    this.loading = true;
    this.hotelService.getReviews().subscribe({
      next: (response) => {
        this.reviews = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load reviews'
        });
        this.loading = false;
      }
    });
  }

  loadApartments(): void {
    this.hotelService.getApartments().subscribe({
      next: (response) => {
        this.apartments = response.data || [];
        // Normalize apartments for dropdown
        this.apartmentsForDropdown = this.apartments.map((apt: any) => ({
          ...apt,
          id: apt.id || apt._id,
          title: apt.title || apt.name || apt.id || apt._id
        }));
      },
      error: () => {
        // Silently fail - apartments filter is optional
      }
    });
  }

  loadBookings(): void {
    this.hotelService.getBookings().subscribe({
      next: (response) => {
        this.bookings = response.data || [];
      },
      error: () => {
        // Silently fail - bookings are optional
      }
    });
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = this.getEmptyReviewForm();
    // Set default apartment_id and booking_id if available
    if (!this.formData.apartment_id && this.apartmentsForDropdown.length > 0) {
      this.formData.apartment_id = this.apartmentsForDropdown[0].id;
    }
    if (!this.formData.booking_id && this.bookings.length > 0) {
      this.formData.booking_id = this.bookings[0].id;
    }
    this.showDialog = true;
  }

  editReview(review: Review): void {
    this.isEditMode = true;
    this.selectedReview = review;
    this.formData = { ...review };
    this.showDialog = true;
  }

  saveReview(): void {
    const missingFields: string[] = [];
    
    if (!this.formData.title || this.formData.title.trim() === '') {
      missingFields.push('Title');
    }
    
    if (!this.formData.review || this.formData.review.trim() === '') {
      missingFields.push('Review Content');
    }
    
    if (!this.formData.apartment_id || this.formData.apartment_id.trim() === '') {
      missingFields.push('Apartment ID');
    }
    
    if (!this.formData.account_id || this.formData.account_id.trim() === '') {
      missingFields.push('Account ID');
    }
    
    if (!this.formData.booking_id || this.formData.booking_id.trim() === '') {
      missingFields.push('Booking ID');
    }

    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: `Please fill in required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    const reviewData: Review = {
      ...this.formData as Review,
      id: this.isEditMode ? this.selectedReview!.id : undefined,
      title: this.formData.title!.trim(),
      review: this.formData.review!.trim(),
      apartment_id: this.formData.apartment_id!.trim(),
      account_id: this.formData.account_id!.trim(),
      booking_id: this.formData.booking_id!.trim(),
      date_posted: this.isEditMode ? this.selectedReview!.date_posted : new Date().toISOString(),
      date_updated: this.isEditMode ? new Date().toISOString() : null
    };

    this.loading = true;
    const operation = this.isEditMode
      ? this.hotelService.updateReview(this.selectedReview!.id!, reviewData)
      : this.hotelService.createReview(reviewData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Review updated successfully' : 'Review created successfully'
        });
        this.loadReviews();
        this.showDialog = false;
        this.loading = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Failed to save review';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  deleteReview(review: Review): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this review?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.hotelService.deleteReview(review.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Review deleted successfully'
            });
            this.loadReviews();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete review'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  get filteredReviews(): Review[] {
    let filtered = this.reviews;
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.review.toLowerCase().includes(query) ||
        (r.id && r.id.toLowerCase().includes(query)) ||
        r.apartment_id.toLowerCase().includes(query)
      );
    }
    
    if (this.selectedApartmentFilter) {
      filtered = filtered.filter(r => r.apartment_id === this.selectedApartmentFilter);
    }
    
    return filtered;
  }

  getApartmentName(apartmentId: string): string {
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? (apartment.title || apartment.name) : apartmentId;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.formData = this.getEmptyReviewForm();
  }

  private getEmptyReviewForm(): Partial<Review> {
    const defaultApartmentId = this.apartmentsForDropdown.length > 0 
      ? this.apartmentsForDropdown[0].id 
      : '';
    const defaultBookingId = this.bookings.length > 0 
      ? this.bookings[0].id 
      : '';
    
    return {
      title: 'Great stay!',
      review: 'This apartment was wonderful. Clean, comfortable, and in a great location.',
      apartment_id: defaultApartmentId,
      account_id: `guest_${Date.now()}`,
      booking_id: defaultBookingId,
      date_posted: new Date().toISOString(),
      date_updated: null
    };
  }
}
