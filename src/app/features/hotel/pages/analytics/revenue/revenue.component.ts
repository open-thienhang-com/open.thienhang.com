import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { HotelService } from '../../../services/hotel.service';
import { Booking, Apartment } from '../../../models/hotel.models';

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface ApartmentRevenue {
  apartment_id: string;
  apartment_name: string;
  revenue: number;
  bookings: number;
  averagePrice: number;
}

@Component({
  selector: 'app-hotel-revenue',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DropdownModule, ChartModule,
    TableModule, BadgeModule, ToastModule, SkeletonModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.scss']
})
export class RevenueComponent implements OnInit {
  bookings: Booking[] = [];
  apartments: Apartment[] = [];
  loading = false;
  
  selectedPeriod: string = 'month';
  periodOptions = [
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Last 3 Months', value: 'quarter' },
    { label: 'Last Year', value: 'year' }
  ];

  revenueChartData: any;
  revenueChartOptions: any;
  apartmentRevenueData: ApartmentRevenue[] = [];

  totalRevenue = 0;
  totalBookings = 0;
  averageRevenue = 0;
  growthRate = 0;

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
      this.hotelService.getApartments().toPromise()
    ]).then(([bookingsRes, apartmentsRes]) => {
      this.bookings = bookingsRes?.data || [];
      this.apartments = apartmentsRes?.data || [];
      this.processRevenueData();
      this.loading = false;
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load revenue data'
      });
      this.loading = false;
    });
  }

  processRevenueData(): void {
    const filteredBookings = this.getFilteredBookings();
    this.calculateMetrics(filteredBookings);
    this.buildChartData(filteredBookings);
    this.buildApartmentRevenue(filteredBookings);
  }

  getFilteredBookings(): Booking[] {
    const now = new Date();
    let startDate = new Date();

    switch (this.selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return this.bookings.filter(b => {
      const bookingDate = new Date(b.created);
      return bookingDate >= startDate && bookingDate <= now && 
             b.booking_status !== 'canceled';
    });
  }

  calculateMetrics(bookings: Booking[]): void {
    this.totalBookings = bookings.length;
    this.totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    this.averageRevenue = this.totalBookings > 0 ? this.totalRevenue / this.totalBookings : 0;

    // Calculate growth rate (compare with previous period)
    const previousPeriodBookings = this.getPreviousPeriodBookings();
    const previousRevenue = previousPeriodBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    
    if (previousRevenue > 0) {
      this.growthRate = ((this.totalRevenue - previousRevenue) / previousRevenue) * 100;
    } else {
      this.growthRate = this.totalRevenue > 0 ? 100 : 0;
    }
  }

  getPreviousPeriodBookings(): Booking[] {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (this.selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 14);
        endDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 60);
        endDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 6);
        endDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 2);
        endDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return this.bookings.filter(b => {
      const bookingDate = new Date(b.created);
      return bookingDate >= startDate && bookingDate < endDate && 
             b.booking_status !== 'canceled';
    });
  }

  buildChartData(bookings: Booking[]): void {
    const revenueByDate = new Map<string, { revenue: number; count: number }>();

    bookings.forEach(booking => {
      const date = new Date(booking.created).toISOString().split('T')[0];
      const existing = revenueByDate.get(date) || { revenue: 0, count: 0 };
      revenueByDate.set(date, {
        revenue: existing.revenue + (booking.total_price || 0),
        count: existing.count + 1
      });
    });

    const sortedDates = Array.from(revenueByDate.keys()).sort();
    const revenueData = sortedDates.map(date => revenueByDate.get(date)!.revenue);
    const bookingData = sortedDates.map(date => revenueByDate.get(date)!.count);

    this.revenueChartData = {
      labels: sortedDates.map(date => {
        const d = new Date(date);
        return this.selectedPeriod === 'year' 
          ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4
        },
        {
          label: 'Bookings',
          data: bookingData,
          fill: false,
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgb(34, 197, 94)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Revenue & Bookings Trend'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Revenue ($)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Number of Bookings'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };
  }

  buildApartmentRevenue(bookings: Booking[]): void {
    const apartmentMap = new Map<string, { revenue: number; bookings: number }>();

    bookings.forEach(booking => {
      const existing = apartmentMap.get(booking.apartment_id) || { revenue: 0, bookings: 0 };
      apartmentMap.set(booking.apartment_id, {
        revenue: existing.revenue + (booking.total_price || 0),
        bookings: existing.bookings + 1
      });
    });

    this.apartmentRevenueData = Array.from(apartmentMap.entries())
      .map(([apartmentId, data]) => ({
        apartment_id: apartmentId,
        apartment_name: this.getApartmentName(apartmentId),
        revenue: data.revenue,
        bookings: data.bookings,
        averagePrice: data.bookings > 0 ? data.revenue / data.bookings : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  onPeriodChange(): void {
    this.processRevenueData();
  }

  getApartmentName(apartmentId: string): string {
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? apartment.title : apartmentId;
  }

  getGrowthColor(): string {
    return this.growthRate >= 0 ? 'success' : 'danger';
  }

  getRevenueShare(revenue: number): number {
    if (this.totalRevenue === 0) return 0;
    return (revenue / this.totalRevenue) * 100;
  }

  getOccupancyRate(): number {
    // Simple occupancy calculation based on bookings
    // In a real scenario, this would consider total available days
    const totalDays = this.selectedPeriod === 'week' ? 7 :
                     this.selectedPeriod === 'month' ? 30 :
                     this.selectedPeriod === 'quarter' ? 90 : 365;
    
    const averageDaysPerBooking = this.totalBookings > 0 
      ? this.bookings.reduce((sum, b) => sum + (b.count_of_days || 0), 0) / this.totalBookings
      : 0;
    
    const totalOccupiedDays = this.totalBookings * averageDaysPerBooking;
    const totalAvailableDays = this.apartments.length * totalDays;
    
    return totalAvailableDays > 0 ? (totalOccupiedDays / totalAvailableDays) * 100 : 0;
  }
}
