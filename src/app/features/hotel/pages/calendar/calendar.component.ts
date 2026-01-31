import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Booking, BookingStatus, PaymentStatus, Apartment } from '../../models/hotel.models';

interface CalendarEvent {
  date: Date;
  bookings: Booking[];
  apartmentId?: string;
}

@Component({
  selector: 'app-hotel-calendar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, CalendarModule, DropdownModule,
    DialogModule, BadgeModule, TooltipModule, ToastModule, SkeletonModule, DividerModule
  ],
  providers: [MessageService],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  bookings: Booking[] = [];
  apartments: Apartment[] = [];
  apartmentsForFilter: any[] = [];
  loading = false;
  selectedDate: Date = new Date();
  selectedApartment: string | null = null;
  showBookingDialog = false;
  selectedBookings: Booking[] = [];
  viewMode: 'month' | 'week' | 'day' = 'month';

  calendarEvents: Map<string, Booking[]> = new Map();

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService
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
        this.buildCalendarEvents();
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
        // Normalize for dropdown filter
        this.apartmentsForFilter = this.apartments.map(apt => ({
          ...apt,
          id: apt.id || (apt as any)._id
        }));
      },
      error: () => {
        // Silently fail
      }
    });
  }

  buildCalendarEvents(): void {
    this.calendarEvents.clear();
    
    let filteredBookings = this.bookings;
    if (this.selectedApartment) {
      filteredBookings = filteredBookings.filter(b => b.apartment_id === this.selectedApartment);
    }

    filteredBookings.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      
      // Add events for each day in the booking range
      const currentDate = new Date(checkIn);
      while (currentDate <= checkOut) {
        const dateKey = this.getDateKey(currentDate);
        if (!this.calendarEvents.has(dateKey)) {
          this.calendarEvents.set(dateKey, []);
        }
        this.calendarEvents.get(dateKey)!.push(booking);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  getBookingsForDate(date: Date): Booking[] {
    const dateKey = this.getDateKey(date);
    return this.calendarEvents.get(dateKey) || [];
  }

  onDateSelect(event: any): void {
    const selectedDate = event as Date;
    const bookings = this.getBookingsForDate(selectedDate);
    
    if (bookings.length > 0) {
      this.selectedBookings = bookings;
      this.showBookingDialog = true;
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'No Bookings',
        detail: 'No bookings found for this date'
      });
    }
  }

  onMonthChange(event: any): void {
    // Reload bookings if needed or just rebuild events
    this.buildCalendarEvents();
  }

  onApartmentFilterChange(): void {
    this.buildCalendarEvents();
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

  getApartmentId(apartment: Apartment): string {
    return apartment.id || (apartment as any)._id || '';
  }

  getApartmentName(apartmentId: string): string {
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? apartment.title : apartmentId;
  }


  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'confirmed': '#22c55e',
      'pending': '#f59e0b',
      'canceled': '#ef4444',
      'completed': '#3b82f6',
      'no_show': '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  }

  getBookingTooltip(booking: Booking): string {
    return `${this.getApartmentName(booking.apartment_id)} - ${booking.booking_status} - ${booking.total_price}`;
  }


  getConfirmedBookings(): number {
    return this.bookings.filter(b => b.booking_status === BookingStatus.CONFIRMED).length;
  }

  getPendingBookings(): number {
    return this.bookings.filter(b => b.booking_status === BookingStatus.PENDING).length;
  }

  getCanceledBookings(): number {
    return this.bookings.filter(b => b.booking_status === BookingStatus.CANCELED).length;
  }

  getUpcomingBookings(): Booking[] {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return this.bookings
      .filter(b => {
        const checkIn = new Date(b.check_in);
        return checkIn >= today && checkIn <= nextWeek && b.booking_status !== BookingStatus.CANCELED;
      })
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
      .slice(0, 10);
  }

  closeBookingDialog(): void {
    this.showBookingDialog = false;
    this.selectedBookings = [];
  }
}
