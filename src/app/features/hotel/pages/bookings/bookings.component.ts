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

  openDialog(): void {
    this.isEditMode = false;
    this.formData = this.getEmptyBookingForm();
    this.showDialog = true;
  }

  editBooking(booking: Booking): void {
    this.isEditMode = true;
    this.selectedBooking = booking;
    this.formData = { ...booking };
    this.showDialog = true;
  }

  saveBooking(): void {
    if (!this.formData.apartment_id || !this.formData.account_id || !this.formData.check_in) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in required fields'
      });
      return;
    }

    this.loading = true;
    const operation = this.isEditMode
      ? this.hotelService.updateBooking(this.selectedBooking!.id, this.formData as Booking)
      : this.hotelService.createBooking(this.formData as Booking);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Booking updated' : 'Booking created'
        });
        this.loadBookings();
        this.showDialog = false;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save booking'
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
    return {
      id: '',
      apartment_id: '',
      account_id: '',
      check_in: new Date().toISOString(),
      check_out: new Date(Date.now() + 86400000).toISOString(),
      day_price: 0,
      month_price: 0,
      total_price: 0,
      count_of_days: 1,
      payment_status: PaymentStatus.UNPAID,
      booking_status: BookingStatus.PENDING,
      is_active: true,
      guest_count: 1,
      special_requests: ''
    };
  }
}
