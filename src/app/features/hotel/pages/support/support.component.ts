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
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Booking, Review, Apartment } from '../../models/hotel.models';

interface SupportTicket {
  id: string;
  type: 'booking' | 'review' | 'general';
  subject: string;
  description: string;
  account_id?: string;
  booking_id?: string;
  apartment_id?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: Date;
  updated_at: Date;
}

@Component({
  selector: 'app-hotel-support',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputTextarea,
    DropdownModule, TableModule, BadgeModule, ToastModule, TooltipModule,
    SkeletonModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  tickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  bookings: Booking[] = [];
  reviews: Review[] = [];
  apartments: Apartment[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus: string | null = null;
  selectedPriority: string | null = null;
  
  showTicketDialog = false;
  isEditMode = false;
  selectedTicket: SupportTicket | null = null;
  
  formData: Partial<SupportTicket> = {
    type: 'general',
    status: 'open',
    priority: 'medium'
  };

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' }
  ];

  priorityOptions = [
    { label: 'All Priorities', value: null },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' }
  ];

  typeOptions = [
    { label: 'General', value: 'general' },
    { label: 'Booking', value: 'booking' },
    { label: 'Review', value: 'review' }
  ];

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.generateSampleTickets();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.hotelService.getBookings().toPromise(),
      this.hotelService.getReviews().toPromise(),
      this.hotelService.getApartments().toPromise()
    ]).then(([bookingsRes, reviewsRes, apartmentsRes]) => {
      this.bookings = bookingsRes?.data || [];
      this.reviews = reviewsRes?.data || [];
      this.apartments = apartmentsRes?.data || [];
      this.loading = false;
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data'
      });
      this.loading = false;
    });
  }

  generateSampleTickets(): void {
    // Generate sample support tickets from bookings and reviews
    const sampleTickets: SupportTicket[] = [];

    // Tickets from bookings with issues
    this.bookings
      .filter(b => b.booking_status === 'canceled' || b.payment_status === 'unpaid')
      .slice(0, 5)
      .forEach((booking, index) => {
        sampleTickets.push({
          id: `TICKET-${Date.now()}-${index}`,
          type: 'booking',
          subject: `Booking Issue: ${booking.id}`,
          description: `Guest ${booking.account_id} has an issue with booking ${booking.id}`,
          account_id: booking.account_id,
          booking_id: booking.id,
          apartment_id: booking.apartment_id,
          status: index % 2 === 0 ? 'open' : 'in_progress',
          priority: index === 0 ? 'urgent' : index === 1 ? 'high' : 'medium',
          created_at: new Date(booking.created),
          updated_at: new Date(booking.updated || booking.created)
        });
      });

    // Tickets from reviews
    this.reviews.slice(0, 3).forEach((review, index) => {
      sampleTickets.push({
        id: `TICKET-REVIEW-${Date.now()}-${index}`,
        type: 'review',
        subject: `Review Concern: ${review.title}`,
        description: review.review,
        account_id: review.account_id,
        apartment_id: review.apartment_id,
        status: 'open',
        priority: 'medium',
        created_at: new Date(review.date_posted),
        updated_at: new Date(review.date_updated || review.date_posted)
      });
    });

    this.tickets = sampleTickets;
    this.filterTickets();
  }

  filterTickets(): void {
    let filtered = [...this.tickets];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term) ||
        (t.account_id && t.account_id.toLowerCase().includes(term))
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }

    if (this.selectedPriority) {
      filtered = filtered.filter(t => t.priority === this.selectedPriority);
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.created_at.getTime() - a.created_at.getTime();
    });

    this.filteredTickets = filtered;
  }

  onSearch(): void {
    this.filterTickets();
  }

  onStatusChange(): void {
    this.filterTickets();
  }

  onPriorityChange(): void {
    this.filterTickets();
  }

  openTicketDialog(): void {
    this.isEditMode = false;
    this.formData = {
      type: 'general',
      status: 'open',
      priority: 'medium'
    };
    this.showTicketDialog = true;
  }

  editTicket(ticket: SupportTicket): void {
    this.isEditMode = true;
    this.selectedTicket = ticket;
    this.formData = { ...ticket };
    this.showTicketDialog = true;
  }

  closeTicketDialog(): void {
    this.showTicketDialog = false;
    this.selectedTicket = null;
    this.formData = {
      type: 'general',
      status: 'open',
      priority: 'medium'
    };
  }

  saveTicket(): void {
    if (!this.formData.subject || !this.formData.description) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    if (this.isEditMode && this.selectedTicket) {
      // Update ticket
      const index = this.tickets.findIndex(t => t.id === this.selectedTicket!.id);
      if (index !== -1) {
        this.tickets[index] = {
          ...this.tickets[index],
          ...this.formData,
          updated_at: new Date()
        } as SupportTicket;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ticket updated successfully'
        });
      }
    } else {
      // Create new ticket
      const newTicket: SupportTicket = {
        id: `TICKET-${Date.now()}`,
        type: this.formData.type || 'general',
        subject: this.formData.subject!,
        description: this.formData.description!,
        account_id: this.formData.account_id,
        booking_id: this.formData.booking_id,
        apartment_id: this.formData.apartment_id,
        status: this.formData.status || 'open',
        priority: this.formData.priority || 'medium',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.tickets.push(newTicket);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Ticket created successfully'
      });
    }

    this.filterTickets();
    this.closeTicketDialog();
  }

  updateTicketStatus(ticket: SupportTicket, newStatus: string): void {
    ticket.status = newStatus as any;
    ticket.updated_at = new Date();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Ticket status updated'
    });
    this.filterTickets();
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'open': 'warning',
      'in_progress': 'info',
      'resolved': 'success',
      'closed': 'secondary'
    };
    return severityMap[status] || 'secondary';
  }

  getPrioritySeverity(priority: string): string {
    const severityMap: { [key: string]: string } = {
      'urgent': 'danger',
      'high': 'warning',
      'medium': 'info',
      'low': 'success'
    };
    return severityMap[priority] || 'secondary';
  }

  getApartmentName(apartmentId?: string): string {
    if (!apartmentId) return 'N/A';
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? apartment.title : apartmentId;
  }

  getOpenTickets(): number {
    return this.tickets.filter(t => t.status === 'open').length;
  }

  getInProgressTickets(): number {
    return this.tickets.filter(t => t.status === 'in_progress').length;
  }

  getResolvedTickets(): number {
    return this.tickets.filter(t => t.status === 'resolved').length;
  }
}
