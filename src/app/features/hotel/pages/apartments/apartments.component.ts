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
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
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
    BadgeModule, TabViewModule, TagModule, DividerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './apartments.component.html',
  styleUrls: ['./apartments.component.scss']
})
export class ApartmentsComponent implements OnInit {
  apartments: Apartment[] = [];
  loading = false;
  showDialog = false;
  showDetailDialog = false;
  isEditMode = false;
  selectedApartment: Apartment | null = null;
  detailApartment: Apartment | null = null;
  detailLoading = false;

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
        const apartments = response.data || [];
        // Normalize _id to id for consistency
        this.apartments = apartments.map((apt: any) => ({
          ...apt,
          id: apt.id || apt._id
        }));
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
    // Ensure address object is initialized
    if (!this.formData.address) {
      this.formData.address = {
        country: '',
        city: '',
        street: '',
        house_number: '',
        latitude: 0,
        longitude: 0
      };
    }
    this.showDialog = true;
  }

  editApartment(apartment: Apartment): void {
    this.isEditMode = true;
    this.selectedApartment = apartment;
    // Normalize _id to id
    const normalizedApartment = {
      ...apartment,
      id: apartment.id || (apartment as any)._id || apartment.id
    };
    this.formData = { ...normalizedApartment };
    // Ensure address object is initialized
    if (!this.formData.address) {
      this.formData.address = {
        country: '',
        city: '',
        street: '',
        house_number: '',
        latitude: 0,
        longitude: 0
      };
    }
    this.showDialog = true;
  }

  saveApartment(): void {
    // Validate required fields and collect missing fields
    const missingFields: string[] = [];
    
    if (!this.formData.title || this.formData.title.trim() === '') {
      missingFields.push('Title');
    }
    
    if (!this.formData.price_per_day || this.formData.price_per_day <= 0) {
      missingFields.push('Price Per Day');
    }
    
    // Validate address fields if address object exists
    if (this.formData.address) {
      if (!this.formData.address.country || this.formData.address.country.trim() === '') {
        missingFields.push('Country');
      }
      if (!this.formData.address.city || this.formData.address.city.trim() === '') {
        missingFields.push('City');
      }
      if (!this.formData.address.street || this.formData.address.street.trim() === '') {
        missingFields.push('Street');
      }
    } else {
      missingFields.push('Address');
    }

    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: `Please fill in required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    // Prepare form data with defaults for API
    const selectedId = this.isEditMode ? (this.selectedApartment!.id || (this.selectedApartment as any)._id) : null;
    
    // Convert to API format with _id
    const apartmentPayload: any = {
      ...this.formData as Apartment,
      _id: this.isEditMode ? selectedId! : (this.formData.id || (this.formData as any)._id || `apt_${Date.now()}`),
      title: this.formData.title!.trim(),
      description: this.formData.description || '',
      price_per_day: this.formData.price_per_day || 0,
      price_per_month: this.formData.price_per_month || 0,
      bedrooms: this.formData.bedrooms || 1,
      bathrooms: this.formData.bathrooms || 1,
      max_guests: this.formData.max_guests || 2,
      total_area: this.formData.total_area || 0,
      is_active: this.formData.is_active !== undefined ? this.formData.is_active : true,
      is_available_for_booking: this.formData.is_available_for_booking !== undefined ? this.formData.is_available_for_booking : true,
      is_furnished: this.formData.is_furnished || false,
      is_garage: this.formData.is_garage || false,
      pets_allowed: this.formData.pets_allowed || false,
      smoking_allowed: this.formData.smoking_allowed || false,
      parties_allowed: this.formData.parties_allowed || false,
      minimum_stay_days: this.formData.minimum_stay_days || 1,
      maximum_stay_days: this.formData.maximum_stay_days || 365,
      currency: this.formData.currency || 'USD',
      // Default values for nested objects
      property: this.formData.property || {
        id: `prop_${Date.now()}`,
        name: this.formData.title || 'Property',
        description: '',
        has_pool: false,
        has_elevator: false,
        total_apartments: 1,
        address: this.formData.address || {
          country: '',
          city: '',
          street: '',
          house_number: '',
          latitude: 0,
          longitude: 0
        }
      },
      address: this.formData.address || {
        country: '',
        city: '',
        street: '',
        house_number: '',
        latitude: 0,
        longitude: 0
      },
      amenities: this.formData.amenities || [],
      images: this.formData.images || [],
      room_ids: this.formData.room_ids || [],
      hotline: this.formData.hotline || '',
      email: this.formData.email || '',
      is_booked: this.formData.is_booked !== undefined ? this.formData.is_booked : false,
      maintenance_mode: this.formData.maintenance_mode !== undefined ? this.formData.maintenance_mode : false,
      available_from: this.formData.available_from || new Date().toISOString(),
      available_until: this.formData.available_until || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      check_in_time: this.formData.check_in_time || '14:00',
      check_out_time: this.formData.check_out_time || '11:00',
      cancellation_policy: this.formData.cancellation_policy || 'flexible',
      free_cancellation_hours: this.formData.free_cancellation_hours || 24
    };
    
    // Remove 'id' field if it exists, API expects only '_id'
    if ('id' in apartmentPayload) {
      delete apartmentPayload.id;
    }

    this.loading = true;
    const operation = this.isEditMode && selectedId
      ? this.hotelService.updateApartment(selectedId, apartmentPayload)
      : this.hotelService.createApartment(apartmentPayload);

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
        const errorMessage = error?.error?.message || error?.message || 'Failed to save apartment';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
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
        const apartmentId = apartment.id || (apartment as any)._id;
        if (!apartmentId) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Apartment ID is missing'
          });
          return;
        }
        this.loading = true;
        this.hotelService.deleteApartment(apartmentId).subscribe({
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
    // Get apartment ID - handle both id and _id
    const apartmentId = apartment.id || (apartment as any)._id;
    
    if (!apartmentId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Apartment ID is missing'
      });
      return;
    }

    this.detailLoading = true;
    this.showDetailDialog = true;
    this.detailApartment = null;
    
    // Load full apartment details from API
    this.hotelService.getApartmentById(apartmentId).subscribe({
      next: (response) => {
        // Handle ApiResponse structure
        let apartmentData: any = null;
        if (response && typeof response === 'object' && 'data' in response) {
          apartmentData = (response as any).data;
        } else {
          apartmentData = response as unknown as Apartment;
        }
        
        // Normalize _id to id
        if (apartmentData) {
          this.detailApartment = {
            ...apartmentData,
            id: apartmentData.id || apartmentData._id || apartmentId
          } as Apartment;
        }
        
        this.detailLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load apartment details'
        });
        this.detailLoading = false;
        this.showDetailDialog = false;
      }
    });
  }

  closeDetailDialog(): void {
    this.showDetailDialog = false;
    this.detailApartment = null;
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
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    return {
      id: '',
      title: '',
      description: '',
      price_per_day: 50, // Default price
      price_per_month: 1000, // Default monthly price
      bedrooms: 1,
      bathrooms: 1,
      max_guests: 2,
      total_area: 50, // Default area in m²
      is_active: true,
      is_available_for_booking: true,
      is_furnished: false,
      is_garage: false,
      pets_allowed: false,
      smoking_allowed: false,
      parties_allowed: false,
      minimum_stay_days: 1,
      maximum_stay_days: 365,
      currency: 'USD',
      // Default address structure
      address: {
        country: '',
        city: '',
        street: '',
        house_number: '',
        latitude: 0,
        longitude: 0
      },
      // Default property structure
      property: {
        id: '',
        name: '',
        description: '',
        has_pool: false,
        has_elevator: false,
        total_apartments: 1,
        address: {
          country: '',
          city: '',
          street: '',
          house_number: '',
          latitude: 0,
          longitude: 0
        }
      },
      amenities: [],
      images: [],
      room_ids: [],
      hotline: '',
      email: '',
      is_booked: false,
      maintenance_mode: false,
      available_from: now.toISOString(),
      available_until: oneYearLater.toISOString(),
      check_in_time: '14:00',
      check_out_time: '11:00',
      cancellation_policy: 'flexible',
      free_cancellation_hours: 24
    };
  }
}
