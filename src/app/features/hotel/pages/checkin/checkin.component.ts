import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Booking, BookingStatus, Apartment } from '../../models/hotel.models';

@Component({
  selector: 'app-hotel-checkin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputTextarea, CalendarModule,
    DropdownModule, TableModule, BadgeModule, ToastModule, ConfirmDialogModule,
    TooltipModule, SkeletonModule, TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss']
})
export class CheckinComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  apartments: Apartment[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus: string | null = null;
  selectedDate: Date | null = null;
  
  showCheckinDialog = false;
  selectedBooking: Booking | null = null;
  checkinNotes = '';

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Pending', value: BookingStatus.PENDING },
    { label: 'Confirmed', value: BookingStatus.CONFIRMED },
    { label: 'Completed', value: BookingStatus.COMPLETED }
  ];

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
        this.filterBookings();
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
      },
      error: () => {
        // Silently fail
      }
    });
  }

  filterBookings(): void {
    let filtered = [...this.bookings];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.id.toLowerCase().includes(term) ||
        b.apartment_id.toLowerCase().includes(term) ||
        b.account_id.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(b => b.booking_status === this.selectedStatus);
    }

    // Filter by date (check-in date)
    if (this.selectedDate) {
      const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(b => {
        const checkInDate = new Date(b.check_in).toISOString().split('T')[0];
        return checkInDate === selectedDateStr;
      });
    }

    // Show only pending and confirmed bookings for check-in
    filtered = filtered.filter(b => 
      b.booking_status === BookingStatus.PENDING || 
      b.booking_status === BookingStatus.CONFIRMED
    );

    this.filteredBookings = filtered;
  }

  onSearch(): void {
    this.filterBookings();
  }

  onStatusChange(): void {
    this.filterBookings();
  }

  onDateChange(): void {
    this.filterBookings();
  }

  openCheckinDialog(booking: Booking): void {
    this.selectedBooking = booking;
    this.checkinNotes = '';
    this.showCheckinDialog = true;
  }

  closeCheckinDialog(): void {
    this.showCheckinDialog = false;
    this.selectedBooking = null;
    this.checkinNotes = '';
  }

  processCheckin(): void {
    if (!this.selectedBooking) return;

    // Update booking status to completed (check-in processed)
    const updatedBooking: Booking = {
      ...this.selectedBooking,
      booking_status: BookingStatus.CONFIRMED
    };

    this.loading = true;
    this.hotelService.updateBooking(this.selectedBooking.id, updatedBooking).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Check-in processed successfully'
        });
        this.closeCheckinDialog();
        this.loadBookings();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to process check-in'
        });
        this.loading = false;
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

  getApartmentName(apartmentId: string): string {
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? apartment.title : apartmentId;
  }

  isCheckinToday(booking: Booking): boolean {
    const today = new Date();
    const checkInDate = new Date(booking.check_in);
    return checkInDate.toDateString() === today.toDateString();
  }

  isCheckinOverdue(booking: Booking): boolean {
    const today = new Date();
    const checkInDate = new Date(booking.check_in);
    return checkInDate < today && booking.booking_status === BookingStatus.CONFIRMED;
  }

  getCheckinStatus(booking: Booking): string {
    if (this.isCheckinOverdue(booking)) return 'Overdue';
    if (this.isCheckinToday(booking)) return 'Today';
    return 'Upcoming';
  }

  getCheckinStatusSeverity(booking: Booking): string {
    if (this.isCheckinOverdue(booking)) return 'danger';
    if (this.isCheckinToday(booking)) return 'warning';
    return 'info';
  }
}
