import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Booking, BookingStatus, PaymentStatus } from '../../models/hotel.models';

@Component({
  selector: 'app-hotel-bookings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, CalendarModule,
    DropdownModule, ToastModule, ConfirmDialogModule, TableModule, BadgeModule,
    TooltipModule, SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  apartments: any[] = [];
  apartmentsForDropdown: any[] = [];
  loading = false;
  showDialog = false;
  isEditMode = false;
  selectedBooking: Booking | null = null;

  bookingStatusOptions = [
    { label: 'Pending', value: BookingStatus.PENDING },
    { label: 'Confirmed', value: BookingStatus.CONFIRMED },
    { label: 'Canceled', value: BookingStatus.CANCELED },
    { label: 'Completed', value: BookingStatus.COMPLETED },
    { label: 'No Show', value: BookingStatus.NO_SHOW }
  ];

  paymentStatusOptions = [
    { label: 'Unpaid', value: PaymentStatus.UNPAID },
    { label: 'Paid', value: PaymentStatus.PAID },
    { label: 'In Process', value: PaymentStatus.IN_PROCESS },
    { label: 'Canceled', value: PaymentStatus.CANCELED }
  ];

  formData: Partial<Booking> = this.getEmptyBookingForm();
  searchQuery = '';

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
    this.loadApartments();
  }

  loadBookings(): void {
    this.loading = true;
    this.hotelService.getBookings().subscribe({
      next: (response) => {
        this.bookings = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load bookings'
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
        // Silently fail - apartments are optional
      }
    });
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = this.getEmptyBookingForm();
    // Set default apartment_id if available
    if (!this.formData.apartment_id && this.apartmentsForDropdown.length > 0) {
      this.formData.apartment_id = this.apartmentsForDropdown[0].id;
    }
    this.showDialog = true;
  }

  editBooking(booking: Booking): void {
    this.isEditMode = true;
    this.selectedBooking = booking;
    this.formData = { ...booking };
    this.showDialog = true;
  }

  saveBooking(): void {
    // Validate required fields and collect missing fields
    const missingFields: string[] = [];
    
    if (!this.formData.apartment_id || this.formData.apartment_id.trim() === '') {
      missingFields.push('Apartment ID');
    }
    
    if (!this.formData.account_id || this.formData.account_id.trim() === '') {
      missingFields.push('Guest ID (Account ID)');
    }
    
    if (!this.formData.check_in) {
      missingFields.push('Check-In Date');
    }
    
    if (!this.formData.check_out) {
      missingFields.push('Check-Out Date');
    }

    // Validate check-out is after check-in
    if (this.formData.check_in && this.formData.check_out) {
      const checkIn = new Date(this.formData.check_in);
      const checkOut = new Date(this.formData.check_out);
      if (checkOut <= checkIn) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Check-out date must be after check-in date'
        });
        return;
      }
    }

    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: `Please fill in required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    // Calculate count_of_days if not provided
    let countOfDays = this.formData.count_of_days || 1;
    if (this.formData.check_in && this.formData.check_out) {
      const checkIn = new Date(this.formData.check_in);
      const checkOut = new Date(this.formData.check_out);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      countOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate total_price if not provided
    let totalPrice = this.formData.total_price || 0;
    if (!totalPrice && this.formData.day_price && countOfDays > 0) {
      totalPrice = this.formData.day_price * countOfDays;
    }

    // Prepare booking data with defaults for API
    const bookingData: Booking = {
      ...this.formData as Booking,
      id: this.isEditMode ? this.selectedBooking!.id : this.formData.id || `booking_${Date.now()}`,
      apartment_id: this.formData.apartment_id!.trim(),
      account_id: this.formData.account_id!.trim(),
      check_in: typeof this.formData.check_in === 'string' ? this.formData.check_in : new Date(this.formData.check_in!).toISOString(),
      check_out: typeof this.formData.check_out === 'string' ? this.formData.check_out : new Date(this.formData.check_out!).toISOString(),
      day_price: this.formData.day_price || 0,
      month_price: this.formData.month_price || 0,
      total_price: totalPrice,
      count_of_days: countOfDays,
      payment_status: this.formData.payment_status || PaymentStatus.UNPAID,
      booking_status: this.formData.booking_status || BookingStatus.PENDING,
      is_active: this.formData.is_active !== undefined ? this.formData.is_active : true,
      guest_count: this.formData.guest_count || 1,
      special_requests: this.formData.special_requests || '',
      created: this.isEditMode ? this.selectedBooking!.created : new Date().toISOString(),
      updated: new Date().toISOString()
    };

    this.loading = true;
    const operation = this.isEditMode
      ? this.hotelService.updateBooking(this.selectedBooking!.id, bookingData)
      : this.hotelService.createBooking(bookingData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Booking updated successfully' : 'Booking created successfully'
        });
        this.loadBookings();
        this.showDialog = false;
        this.loading = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Failed to save booking';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  cancelBooking(booking: Booking): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this booking?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.hotelService.cancelBooking(booking.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Booking canceled successfully'
            });
            this.loadBookings();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to cancel booking'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  deleteBooking(booking: Booking): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this booking?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.hotelService.deleteBooking(booking.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Booking deleted successfully'
            });
            this.loadBookings();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete booking'
            });
            this.loading = false;
          }
        });
      }
    });
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

  get filteredBookings(): Booking[] {
    if (!this.searchQuery) return this.bookings;
    const query = this.searchQuery.toLowerCase();
    return this.bookings.filter(b =>
      b.id.toLowerCase().includes(query) ||
      b.apartment_id.toLowerCase().includes(query) ||
      b.account_id.toLowerCase().includes(query)
    );
  }

  closeDialog(): void {
    this.showDialog = false;
    this.formData = this.getEmptyBookingForm();
  }

  private getEmptyBookingForm(): Partial<Booking> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // Default check-in time: 2 PM
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(11, 0, 0, 0); // Default check-out time: 11 AM
    
    const defaultApartmentId = this.apartmentsForDropdown.length > 0 
      ? this.apartmentsForDropdown[0].id 
      : '';
    
    return {
      id: `booking_${Date.now()}`,
      apartment_id: defaultApartmentId,
      account_id: `guest_${Date.now()}`,
      check_in: tomorrow.toISOString(),
      check_out: dayAfterTomorrow.toISOString(),
      day_price: 100, // Default daily price
      month_price: 2500, // Default monthly price
      total_price: 100, // Default total (1 day * 100)
      count_of_days: 1,
      payment_status: PaymentStatus.UNPAID,
      booking_status: BookingStatus.PENDING,
      is_active: true,
      guest_count: 2,
      special_requests: '',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  }
}
