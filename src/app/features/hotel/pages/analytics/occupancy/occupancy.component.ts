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

interface OccupancyData {
  date: string;
  occupancyRate: number;
  bookedRooms: number;
  availableRooms: number;
}

interface ApartmentOccupancy {
  apartment_id: string;
  apartment_name: string;
  totalDays: number;
  bookedDays: number;
  occupancyRate: number;
  revenue: number;
}

@Component({
  selector: 'app-hotel-occupancy',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DropdownModule, ChartModule,
    TableModule, BadgeModule, ToastModule, SkeletonModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './occupancy.component.html',
  styleUrls: ['./occupancy.component.scss']
})
export class OccupancyComponent implements OnInit {
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

  occupancyChartData: any;
  occupancyChartOptions: any;
  apartmentOccupancyData: ApartmentOccupancy[] = [];

  overallOccupancyRate = 0;
  totalBookedDays = 0;
  totalAvailableDays = 0;
  averageOccupancyRate = 0;

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
      this.processOccupancyData();
      this.loading = false;
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load occupancy data'
      });
      this.loading = false;
    });
  }

  processOccupancyData(): void {
    const filteredBookings = this.getFilteredBookings();
    this.calculateOverallOccupancy(filteredBookings);
    this.buildChartData(filteredBookings);
    this.buildApartmentOccupancy(filteredBookings);
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
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
      return (checkIn <= now && checkOut >= startDate) && 
             b.booking_status !== 'canceled';
    });
  }

  calculateOverallOccupancy(bookings: Booking[]): void {
    const daysInPeriod = this.getDaysInPeriod();
    const totalApartments = this.apartments.length;
    this.totalAvailableDays = totalApartments * daysInPeriod;

    // Calculate booked days
    const bookedDaysByDate = new Map<string, Set<string>>();
    
    bookings.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const currentDate = new Date(checkIn);
      
      while (currentDate <= checkOut) {
        const dateKey = currentDate.toISOString().split('T')[0];
        if (!bookedDaysByDate.has(dateKey)) {
          bookedDaysByDate.set(dateKey, new Set());
        }
        bookedDaysByDate.get(dateKey)!.add(booking.apartment_id);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    this.totalBookedDays = Array.from(bookedDaysByDate.values())
      .reduce((sum, apartments) => sum + apartments.size, 0);

    this.overallOccupancyRate = this.totalAvailableDays > 0 
      ? (this.totalBookedDays / this.totalAvailableDays) * 100 
      : 0;
  }

  getDaysInPeriod(): number {
    switch (this.selectedPeriod) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }

  buildChartData(bookings: Booking[]): void {
    const daysInPeriod = this.getDaysInPeriod();
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysInPeriod);

    const occupancyByDate = new Map<string, { booked: number; total: number }>();
    
    // Initialize all dates
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = currentDate.toISOString().split('T')[0];
      occupancyByDate.set(dateKey, { booked: 0, total: this.apartments.length });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate booked apartments per date
    bookings.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const currentDate = new Date(checkIn);
      
      while (currentDate <= checkOut && currentDate <= now) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const data = occupancyByDate.get(dateKey);
        if (data) {
          data.booked++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    const sortedDates = Array.from(occupancyByDate.keys()).sort();
    const occupancyRates = sortedDates.map(date => {
      const data = occupancyByDate.get(date)!;
      return data.total > 0 ? (data.booked / data.total) * 100 : 0;
    });
    const bookedCounts = sortedDates.map(date => occupancyByDate.get(date)!.booked);

    this.occupancyChartData = {
      labels: sortedDates.map(date => {
        const d = new Date(date);
        return this.selectedPeriod === 'year' 
          ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Occupancy Rate (%)',
          data: occupancyRates,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgb(34, 197, 94)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Booked Apartments',
          data: bookedCounts,
          fill: false,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    this.occupancyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Occupancy Rate Trend'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 0,
          max: 100,
          title: {
            display: true,
            text: 'Occupancy Rate (%)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Number of Booked Apartments'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };
  }

  buildApartmentOccupancy(bookings: Booking[]): void {
    const daysInPeriod = this.getDaysInPeriod();
    const apartmentMap = new Map<string, { bookedDays: number; revenue: number }>();

    bookings.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const bookedDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const existing = apartmentMap.get(booking.apartment_id) || { bookedDays: 0, revenue: 0 };
      apartmentMap.set(booking.apartment_id, {
        bookedDays: existing.bookedDays + bookedDays,
        revenue: existing.revenue + (booking.total_price || 0)
      });
    });

    this.apartmentOccupancyData = Array.from(apartmentMap.entries())
      .map(([apartmentId, data]) => ({
        apartment_id: apartmentId,
        apartment_name: this.getApartmentName(apartmentId),
        totalDays: daysInPeriod,
        bookedDays: data.bookedDays,
        occupancyRate: (data.bookedDays / daysInPeriod) * 100,
        revenue: data.revenue
      }))
      .sort((a, b) => b.occupancyRate - a.occupancyRate);

    // Calculate average occupancy rate
    if (this.apartmentOccupancyData.length > 0) {
      this.averageOccupancyRate = this.apartmentOccupancyData.reduce(
        (sum, apt) => sum + apt.occupancyRate, 0
      ) / this.apartmentOccupancyData.length;
    }
  }

  onPeriodChange(): void {
    this.processOccupancyData();
  }

  getApartmentName(apartmentId: string): string {
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? apartment.title : apartmentId;
  }

  getOccupancySeverity(rate: number): string {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'info';
    if (rate >= 40) return 'warning';
    return 'danger';
  }
}
