import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Apartment } from '../../models/hotel.models';

@Component({
  selector: 'app-hotel-apartments',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputNumberModule,
    DropdownModule, ToastModule, ConfirmDialogModule, SkeletonModule, TooltipModule,
    BadgeModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './apartments.component.html',
  styleUrls: ['./apartments.component.scss']
})
export class ApartmentsComponent implements OnInit {
  apartments: Apartment[] = [];
  loading = false;
  showDialog = false;
  isEditMode = false;
  selectedApartment: Apartment | null = null;

  // Form data
  formData: Partial<Apartment> = this.getEmptyApartmentForm();

  searchQuery = '';

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadApartments();
  }

  loadApartments(): void {
    this.loading = true;
    this.hotelService.getApartments().subscribe({
      next: (response) => {
        this.apartments = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load apartments'
        });
        this.loading = false;
      }
    });
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = this.getEmptyApartmentForm();
    this.showDialog = true;
  }

  editApartment(apartment: Apartment): void {
    this.isEditMode = true;
    this.selectedApartment = apartment;
    this.formData = { ...apartment };
    this.showDialog = true;
  }

  saveApartment(): void {
    if (!this.formData.title || !this.formData.address) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in required fields'
      });
      return;
    }

    this.loading = true;
    const operation = this.isEditMode
      ? this.hotelService.updateApartment(this.selectedApartment!.id, this.formData as Apartment)
      : this.hotelService.createApartment(this.formData as Apartment);

    operation.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Apartment updated successfully' : 'Apartment created successfully'
        });
        this.loadApartments();
        this.showDialog = false;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save apartment'
        });
        this.loading = false;
      }
    });
  }

  deleteApartment(apartment: Apartment): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this apartment?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.hotelService.deleteApartment(apartment.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Apartment deleted successfully'
            });
            this.loadApartments();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete apartment'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  viewDetails(apartment: Apartment): void {
    this.router.navigate(['/hotel/apartments', apartment.id]);
  }

  get filteredApartments(): Apartment[] {
    if (!this.searchQuery) return this.apartments;
    return this.apartments.filter(apt =>
      apt.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      apt.id.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  closeDialog(): void {
    this.showDialog = false;
    this.formData = this.getEmptyApartmentForm();
  }

  private getEmptyApartmentForm(): Partial<Apartment> {
    return {
      id: '',
      title: '',
      description: '',
      price_per_day: 0,
      price_per_month: 0,
      bedrooms: 1,
      bathrooms: 1,
      max_guests: 2,
      total_area: 0,
      is_active: true,
      is_available_for_booking: true,
      is_furnished: false,
      is_garage: false,
      pets_allowed: false,
      smoking_allowed: false,
      parties_allowed: false,
      minimum_stay_days: 1,
      maximum_stay_days: 365,
      currency: 'USD'
    };
  }
}
