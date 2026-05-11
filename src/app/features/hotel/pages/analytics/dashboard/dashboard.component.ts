import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

import { HotelService } from '../../../services/hotel.service';
import { Booking, Apartment, Review, Rating } from '../../../models/hotel.models';

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, ChartModule, ToastModule, SkeletonModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  bookings: Booking[] = [];
  apartments: Apartment[] = [];
  reviews: Review[] = [];
  ratings: Rating[] = [];
  loading = false;

  revenueChartData: any;
  revenueChartOptions: any;
  occupancyChartData: any;
  occupancyChartOptions: any;

  totalRevenue = 0;
  totalBookings = 0;
  occupancyRate = 0;
  averageRating = 0;
  totalGuests = 0;
  activeApartments = 0;

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.hotelService.getBookings().toPromise(),
      this.hotelService.getApartments().toPromise(),
      this.hotelService.getReviews().toPromise(),
      this.hotelService.getRatings().toPromise()
    ]).then(([bookingsRes, apartmentsRes, reviewsRes, ratingsRes]) => {
      this.bookings = bookingsRes?.data || [];
      this.apartments = apartmentsRes?.data || [];
      this.reviews = reviewsRes?.data || [];
      this.ratings = ratingsRes?.data || [];
      this.calculateMetrics();
      this.buildCharts();
      this.loading = false;
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load dashboard data'
      });
      this.loading = false;
    });
  }

  calculateMetrics(): void {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.created);
      return bookingDate >= last30Days && b.booking_status !== 'canceled';
    });

    this.totalBookings = recentBookings.length;
    this.totalRevenue = recentBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

    // Calculate occupancy
    const totalDays = 30;
    const totalAvailableDays = this.apartments.length * totalDays;
    let bookedDays = 0;

    recentBookings.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      bookedDays += days;
    });

    this.occupancyRate = totalAvailableDays > 0 ? (bookedDays / totalAvailableDays) * 100 : 0;

    // Calculate average rating
    if (this.ratings.length > 0) {
      this.averageRating = this.ratings.reduce((sum, r) => sum + r.avg_rating, 0) / this.ratings.length;
    }

    // Calculate unique guests
    const uniqueGuests = new Set(this.bookings.map(b => b.account_id));
    this.totalGuests = uniqueGuests.size;

    // Active apartments
    this.activeApartments = this.apartments.filter(a => a.is_active && a.is_available_for_booking).length;
  }

  buildCharts(): void {
    // Revenue chart (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const revenueData = last7Days.map(date => {
      return this.bookings
        .filter(b => {
          const bookingDate = new Date(b.created).toISOString().split('T')[0];
          return bookingDate === date && b.booking_status !== 'canceled';
        })
        .reduce((sum, b) => sum + (b.total_price || 0), 0);
    });

    this.revenueChartData = {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Daily Revenue',
          data: revenueData,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4
        }
      ]
    };

    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Revenue (Last 7 Days)'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue ($)'
          }
        }
      }
    };

    // Occupancy chart
    const occupancyData = last7Days.map(date => {
      const bookedApartments = new Set();
      this.bookings.forEach(b => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        const checkDate = new Date(date);
        if (checkDate >= checkIn && checkDate <= checkOut && b.booking_status !== 'canceled') {
          bookedApartments.add(b.apartment_id);
        }
      });
      return this.apartments.length > 0 
        ? (bookedApartments.size / this.apartments.length) * 100 
        : 0;
    });

    this.occupancyChartData = {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Occupancy Rate',
          data: occupancyData,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgb(34, 197, 94)',
          tension: 0.4
        }
      ]
    };

    this.occupancyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Occupancy Rate (Last 7 Days)'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Occupancy (%)'
          }
        }
      }
    };
  }
}
