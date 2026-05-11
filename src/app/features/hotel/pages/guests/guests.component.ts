import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Booking, Apartment } from '../../models/hotel.models';

interface Guest {
  account_id: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking?: Booking;
  favoriteApartment?: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-hotel-guests',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule,
    TableModule, BadgeModule, ToastModule, TooltipModule,
    SkeletonModule, TagModule, AvatarModule, DividerModule
  ],
  providers: [MessageService],
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss']
})
export class GuestsComponent implements OnInit {
  bookings: Booking[] = [];
  guests: Guest[] = [];
  filteredGuests: Guest[] = [];
  apartments: Apartment[] = [];
  loading = false;
  searchTerm = '';
  
  showGuestDialog = false;
  selectedGuest: Guest | null = null;
  guestBookings: Booking[] = [];

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.hotelService.getBookings().subscribe({
      next: (response) => {
        this.bookings = response.data || [];
        this.processGuests();
        this.loadApartments();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load guest data'
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

  processGuests(): void {
    const guestMap = new Map<string, Guest>();

    this.bookings.forEach(booking => {
      const accountId = booking.account_id;
      
      if (!guestMap.has(accountId)) {
        guestMap.set(accountId, {
          account_id: accountId,
          totalBookings: 0,
          totalSpent: 0,
          status: 'active'
        });
      }

      const guest = guestMap.get(accountId)!;
      guest.totalBookings++;
      guest.totalSpent += booking.total_price || 0;

      // Update last booking
      if (!guest.lastBooking || new Date(booking.check_in) > new Date(guest.lastBooking.check_in)) {
        guest.lastBooking = booking;
      }
    });

    // Find favorite apartment for each guest
    guestMap.forEach((guest, accountId) => {
      const apartmentCounts = new Map<string, number>();
      this.bookings
        .filter(b => b.account_id === accountId)
        .forEach(b => {
          const count = apartmentCounts.get(b.apartment_id) || 0;
          apartmentCounts.set(b.apartment_id, count + 1);
        });

      let maxCount = 0;
      let favoriteApt = '';
      apartmentCounts.forEach((count, aptId) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteApt = aptId;
        }
      });
      guest.favoriteApartment = favoriteApt;

      // Determine status based on last booking
      if (guest.lastBooking) {
        const lastBookingDate = new Date(guest.lastBooking.check_in);
        const daysSinceLastBooking = (new Date().getTime() - lastBookingDate.getTime()) / (1000 * 60 * 60 * 24);
        guest.status = daysSinceLastBooking > 90 ? 'inactive' : 'active';
      }
    });

    this.guests = Array.from(guestMap.values());
    this.filterGuests();
  }

  filterGuests(): void {
    let filtered = [...this.guests];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.account_id.toLowerCase().includes(term) ||
        (g.favoriteApartment && this.getApartmentName(g.favoriteApartment).toLowerCase().includes(term))
      );
    }

    // Sort by total spent descending
    filtered.sort((a, b) => b.totalSpent - a.totalSpent);

    this.filteredGuests = filtered;
  }

  onSearch(): void {
    this.filterGuests();
  }

  viewGuestDetails(guest: Guest): void {
    this.selectedGuest = guest;
    this.guestBookings = this.bookings
      .filter(b => b.account_id === guest.account_id)
      .sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());
    this.showGuestDialog = true;
  }

  closeGuestDialog(): void {
    this.showGuestDialog = false;
    this.selectedGuest = null;
    this.guestBookings = [];
  }

  getApartmentName(apartmentId: string): string {
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? apartment.title : apartmentId;
  }

  getStatusSeverity(status: string): string {
    return status === 'active' ? 'success' : 'secondary';
  }

  getInitials(accountId: string): string {
    return accountId.substring(0, 2).toUpperCase();
  }

  getActiveGuests(): number {
    return this.guests.filter(g => g.status === 'active').length;
  }

  getTotalRevenue(): number {
    return this.guests.reduce((sum, g) => sum + g.totalSpent, 0);
  }

  getAverageSpending(): number {
    if (this.guests.length === 0) return 0;
    return this.getTotalRevenue() / this.guests.length;
  }

  getBookingStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'confirmed': 'success',
      'pending': 'warning',
      'canceled': 'danger',
      'completed': 'info',
      'no_show': 'secondary'
    };
    return severityMap[status] || 'secondary';
  }
}
