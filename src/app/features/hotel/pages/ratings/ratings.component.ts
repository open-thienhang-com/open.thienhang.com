import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { RatingModule } from 'primeng/rating';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Rating } from '../../models/hotel.models';

@Component({
  selector: 'app-hotel-ratings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputTextarea,
    InputNumberModule, DropdownModule, ToastModule, ConfirmDialogModule, TableModule, 
    BadgeModule, TooltipModule, SkeletonModule, RatingModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss']
})
export class RatingsComponent implements OnInit {
  ratings: Rating[] = [];
  apartments: any[] = [];
  apartmentsForDropdown: any[] = [];
  bookings: any[] = [];
  loading = false;
  showDialog = false;
  isEditMode = false;
  selectedRating: Rating | null = null;

  formData: Partial<Rating> = this.getEmptyRatingForm();
  searchQuery = '';
  selectedApartmentFilter: string | null = null;

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadRatings();
    this.loadApartments();
    this.loadBookings();
  }

  loadRatings(): void {
    this.loading = true;
    this.hotelService.getRatings().subscribe({
      next: (response) => {
        this.ratings = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ratings'
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
    this.formData = this.getEmptyRatingForm();
    // Set default apartment_id and booking_id if available
    if (!this.formData.apartment_id && this.apartmentsForDropdown.length > 0) {
      this.formData.apartment_id = this.apartmentsForDropdown[0].id;
    }
    if (!this.formData.booking_id && this.bookings.length > 0) {
      this.formData.booking_id = this.bookings[0].id;
    }
    this.showDialog = true;
  }

  editRating(rating: Rating): void {
    this.isEditMode = true;
    this.selectedRating = rating;
    this.formData = { ...rating };
    this.showDialog = true;
  }

  saveRating(): void {
    const missingFields: string[] = [];
    
    if (!this.formData.apartment_id || this.formData.apartment_id.trim() === '') {
      missingFields.push('Apartment ID');
    }
    
    if (!this.formData.account_id || this.formData.account_id.trim() === '') {
      missingFields.push('Account ID');
    }
    
    if (!this.formData.booking_id || this.formData.booking_id.trim() === '') {
      missingFields.push('Booking ID');
    }
    
    if (!this.formData.cleanliness || this.formData.cleanliness < 1 || this.formData.cleanliness > 5) {
      missingFields.push('Cleanliness Rating');
    }
    
    if (!this.formData.location || this.formData.location < 1 || this.formData.location > 5) {
      missingFields.push('Location Rating');
    }
    
    if (!this.formData.value || this.formData.value < 1 || this.formData.value > 5) {
      missingFields.push('Value Rating');
    }
    
    if (!this.formData.facilities || this.formData.facilities < 1 || this.formData.facilities > 5) {
      missingFields.push('Facilities Rating');
    }

    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: `Please fill in required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    // Calculate average rating
    const avgRating = (
      (this.formData.cleanliness! + 
       this.formData.location! + 
       this.formData.value! + 
       this.formData.facilities!) / 4
    );

    const ratingData: Rating = {
      ...this.formData as Rating,
      id: this.isEditMode ? this.selectedRating!.id : undefined,
      apartment_id: this.formData.apartment_id!.trim(),
      account_id: this.formData.account_id!.trim(),
      booking_id: this.formData.booking_id!.trim(),
      cleanliness: this.formData.cleanliness!,
      location: this.formData.location!,
      value: this.formData.value!,
      facilities: this.formData.facilities!,
      avg_rating: avgRating,
      comment: this.formData.comment || '',
      created_at: this.isEditMode ? this.selectedRating!.created_at : new Date().toISOString()
    };

    this.loading = true;
    const operation = this.isEditMode
      ? this.hotelService.updateRating(this.selectedRating!.id!, ratingData)
      : this.hotelService.createRating(ratingData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Rating updated successfully' : 'Rating created successfully'
        });
        this.loadRatings();
        this.showDialog = false;
        this.loading = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Failed to save rating';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  deleteRating(rating: Rating): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this rating?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.hotelService.deleteRating(rating.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Rating deleted successfully'
            });
            this.loadRatings();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete rating'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  get filteredRatings(): Rating[] {
    let filtered = this.ratings;
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.id && r.id.toLowerCase().includes(query)) ||
        r.apartment_id.toLowerCase().includes(query) ||
        r.account_id.toLowerCase().includes(query) ||
        (r.comment && r.comment.toLowerCase().includes(query))
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
    this.formData = this.getEmptyRatingForm();
  }

  private getEmptyRatingForm(): Partial<Rating> {
    const defaultApartmentId = this.apartmentsForDropdown.length > 0 
      ? this.apartmentsForDropdown[0].id 
      : '';
    const defaultBookingId = this.bookings.length > 0 
      ? this.bookings[0].id 
      : '';
    
    return {
      apartment_id: defaultApartmentId,
      account_id: `guest_${Date.now()}`,
      booking_id: defaultBookingId,
      cleanliness: 5,
      location: 5,
      value: 5,
      facilities: 5,
      avg_rating: 5,
      comment: 'Excellent experience!',
      created_at: new Date().toISOString()
    };
  }
}
