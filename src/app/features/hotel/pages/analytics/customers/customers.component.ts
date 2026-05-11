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
import { Booking, Review, Rating } from '../../../models/hotel.models';

interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
  averageRating: number;
}

interface CustomerTrend {
  date: string;
  newCustomers: number;
  returningCustomers: number;
}

@Component({
  selector: 'app-hotel-customers',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DropdownModule, ChartModule,
    TableModule, BadgeModule, ToastModule, SkeletonModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  bookings: Booking[] = [];
  reviews: Review[] = [];
  ratings: Rating[] = [];
  loading = false;
  
  selectedPeriod: string = 'month';
  periodOptions = [
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Last 3 Months', value: 'quarter' },
    { label: 'Last Year', value: 'year' }
  ];

  customerTrendChartData: any;
  customerTrendChartOptions: any;
  segmentChartData: any;
  segmentChartOptions: any;
  
  totalCustomers = 0;
  newCustomers = 0;
  returningCustomers = 0;
  averageRating = 0;
  customerSegments: CustomerSegment[] = [];

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
      this.hotelService.getReviews().toPromise(),
      this.hotelService.getRatings().toPromise()
    ]).then(([bookingsRes, reviewsRes, ratingsRes]) => {
      this.bookings = bookingsRes?.data || [];
      this.reviews = reviewsRes?.data || [];
      this.ratings = ratingsRes?.data || [];
      this.processCustomerData();
      this.loading = false;
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load customer data'
      });
      this.loading = false;
    });
  }

  processCustomerData(): void {
    const filteredBookings = this.getFilteredBookings();
    this.calculateCustomerMetrics(filteredBookings);
    this.buildTrendChart(filteredBookings);
    this.buildSegmentData(filteredBookings);
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
      return bookingDate >= startDate && bookingDate <= now;
    });
  }

  calculateCustomerMetrics(bookings: Booking[]): void {
    const customerMap = new Map<string, { firstBooking: Date; bookings: Booking[] }>();
    
    bookings.forEach(booking => {
      const existing = customerMap.get(booking.account_id);
      if (!existing) {
        customerMap.set(booking.account_id, {
          firstBooking: new Date(booking.created),
          bookings: [booking]
        });
      } else {
        existing.bookings.push(booking);
        const bookingDate = new Date(booking.created);
        if (bookingDate < existing.firstBooking) {
          existing.firstBooking = bookingDate;
        }
      }
    });

    this.totalCustomers = customerMap.size;
    
    const periodStart = this.getPeriodStart();
    this.newCustomers = Array.from(customerMap.values())
      .filter(c => c.firstBooking >= periodStart).length;
    this.returningCustomers = this.totalCustomers - this.newCustomers;

    // Calculate average rating
    if (this.ratings.length > 0) {
      this.averageRating = this.ratings.reduce((sum, r) => sum + r.avg_rating, 0) / this.ratings.length;
    }
  }

  getPeriodStart(): Date {
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

    return startDate;
  }

  buildTrendChart(bookings: Booking[]): void {
    const periodStart = this.getPeriodStart();
    const trendMap = new Map<string, { new: number; returning: number }>();
    
    const customerFirstBooking = new Map<string, Date>();
    bookings.forEach(b => {
      if (!customerFirstBooking.has(b.account_id)) {
        customerFirstBooking.set(b.account_id, new Date(b.created));
      } else {
        const existing = customerFirstBooking.get(b.account_id)!;
        if (new Date(b.created) < existing) {
          customerFirstBooking.set(b.account_id, new Date(b.created));
        }
      }
    });

    bookings.forEach(booking => {
      const date = new Date(booking.created).toISOString().split('T')[0];
      const existing = trendMap.get(date) || { new: 0, returning: 0 };
      
      const firstBooking = customerFirstBooking.get(booking.account_id)!;
      if (firstBooking >= periodStart) {
        existing.new++;
      } else {
        existing.returning++;
      }
      
      trendMap.set(date, existing);
    });

    const sortedDates = Array.from(trendMap.keys()).sort();
    
    this.customerTrendChartData = {
      labels: sortedDates.map(date => {
        const d = new Date(date);
        return this.selectedPeriod === 'year' 
          ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'New Customers',
          data: sortedDates.map(date => trendMap.get(date)!.new),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)'
        },
        {
          label: 'Returning Customers',
          data: sortedDates.map(date => trendMap.get(date)!.returning),
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)'
        }
      ]
    };

    this.customerTrendChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Customer Acquisition Trend'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Customers'
          }
        }
      }
    };
  }

  buildSegmentData(bookings: Booking[]): void {
    const customerMap = new Map<string, { bookings: Booking[]; revenue: number }>();
    
    bookings.forEach(booking => {
      const existing = customerMap.get(booking.account_id) || { bookings: [], revenue: 0 };
      existing.bookings.push(booking);
      existing.revenue += booking.total_price || 0;
      customerMap.set(booking.account_id, existing);
    });

    const segments: CustomerSegment[] = [];
    
    customerMap.forEach((data, accountId) => {
      const bookingCount = data.bookings.length;
      let segment = '';
      
      if (bookingCount >= 5) segment = 'VIP';
      else if (bookingCount >= 3) segment = 'Regular';
      else if (bookingCount >= 2) segment = 'Occasional';
      else segment = 'One-time';

      const existingSegment = segments.find(s => s.segment === segment);
      if (existingSegment) {
        existingSegment.count++;
        existingSegment.revenue += data.revenue;
      } else {
        segments.push({
          segment,
          count: 1,
          revenue: data.revenue,
          averageRating: 0
        });
      }
    });

    // Calculate average ratings per segment
    segments.forEach(segment => {
      const segmentCustomers = Array.from(customerMap.keys()).filter(accountId => {
        const data = customerMap.get(accountId)!;
        const bookingCount = data.bookings.length;
        if (segment.segment === 'VIP' && bookingCount >= 5) return true;
        if (segment.segment === 'Regular' && bookingCount >= 3 && bookingCount < 5) return true;
        if (segment.segment === 'Occasional' && bookingCount === 2) return true;
        if (segment.segment === 'One-time' && bookingCount === 1) return true;
        return false;
      });

      const segmentRatings = this.ratings.filter(r => segmentCustomers.includes(r.account_id));
      if (segmentRatings.length > 0) {
        segment.averageRating = segmentRatings.reduce((sum, r) => sum + r.avg_rating, 0) / segmentRatings.length;
      }
    });

    this.customerSegments = segments.sort((a, b) => b.revenue - a.revenue);

    // Build segment chart
    this.segmentChartData = {
      labels: this.customerSegments.map(s => s.segment),
      datasets: [
        {
          label: 'Number of Customers',
          data: this.customerSegments.map(s => s.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.5)',
            'rgba(34, 197, 94, 0.5)',
            'rgba(251, 191, 36, 0.5)',
            'rgba(239, 68, 68, 0.5)'
          ]
        }
      ]
    };

    this.segmentChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Customer Segmentation'
        }
      }
    };
  }

  onPeriodChange(): void {
    this.processCustomerData();
  }

  getSegmentSeverity(segment: string): string {
    const severityMap: { [key: string]: string } = {
      'VIP': 'success',
      'Regular': 'info',
      'Occasional': 'warning',
      'One-time': 'secondary'
    };
    return severityMap[segment] || 'secondary';
  }

  getAverageRevenuePerCustomer(segment: CustomerSegment): number {
    return segment.count > 0 ? segment.revenue / segment.count : 0;
  }
}
