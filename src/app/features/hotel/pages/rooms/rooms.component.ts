import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextarea } from 'primeng/inputtextarea';
import { MessageService, ConfirmationService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Room, RoomType, BedType } from '../../models/hotel.models';

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputNumberModule,
    DropdownModule, ToastModule, ConfirmDialogModule, TableModule, BadgeModule,
    TooltipModule, SkeletonModule, CheckboxModule, InputTextarea
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  apartments: any[] = [];
  apartmentsForDropdown: any[] = [];
  loading = false;
  showDialog = false;
  isEditMode = false;
  selectedRoom: Room | null = null;

  roomTypeOptions = [
    { label: 'Bedroom', value: RoomType.BEDROOM },
    { label: 'Bathroom', value: RoomType.BATHROOM },
    { label: 'Kitchen', value: RoomType.KITCHEN },
    { label: 'Living Room', value: RoomType.LIVING_ROOM },
    { label: 'Dining Room', value: RoomType.DINING_ROOM },
    { label: 'Balcony', value: RoomType.BALCONY },
    { label: 'Storage', value: RoomType.STORAGE },
    { label: 'Office', value: RoomType.OFFICE }
  ];

  bedTypeOptions = [
    { label: 'Single', value: BedType.SINGLE },
    { label: 'Double', value: BedType.DOUBLE },
    { label: 'Queen', value: BedType.QUEEN },
    { label: 'King', value: BedType.KING },
    { label: 'Sofa Bed', value: BedType.SOFA_BED },
    { label: 'Bunk Bed', value: BedType.BUNK_BED }
  ];

  formData: Partial<Room> = this.getEmptyRoomForm();
  searchQuery = '';
  selectedApartmentFilter: string | null = null;

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadRooms();
    this.loadApartments();
  }

  loadRooms(): void {
    this.loading = true;
    this.hotelService.getRooms().subscribe({
      next: (response) => {
        this.rooms = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load rooms'
        });
        this.loading = false;
      }
    });
  }

  loadApartments(): void {
    this.hotelService.getApartments().subscribe({
      next: (response) => {
        this.apartments = response.data || [];
        // Normalize apartments for dropdown
        this.apartmentsForDropdown = this.apartments.map((apt: any) => ({
          ...apt,
          id: apt.id || apt._id,
          title: apt.title || apt.name || apt.id || apt._id
        }));
      },
      error: () => {
        // Silently fail - apartments filter is optional
      }
    });
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = this.getEmptyRoomForm();
    // Set default apartment_id if available
    if (!this.formData.apartment_id && this.apartmentsForDropdown.length > 0) {
      this.formData.apartment_id = this.apartmentsForDropdown[0].id;
    }
    this.showDialog = true;
  }

  editRoom(room: Room): void {
    this.isEditMode = true;
    this.selectedRoom = room;
    this.formData = { ...room };
    this.showDialog = true;
  }

  saveRoom(): void {
    const missingFields: string[] = [];
    
    if (!this.formData.apartment_id || this.formData.apartment_id.trim() === '') {
      missingFields.push('Apartment ID');
    }
    
    if (!this.formData.name || this.formData.name.trim() === '') {
      missingFields.push('Room Name');
    }
    
    if (!this.formData.room_type) {
      missingFields.push('Room Type');
    }
    
    if (!this.formData.area || this.formData.area <= 0) {
      missingFields.push('Area');
    }

    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: `Please fill in required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    // Prepare room data with all required fields
    const roomData: Room = {
      id: this.isEditMode ? this.selectedRoom!.id : (this.formData.id || `room_${Date.now()}`),
      apartment_id: this.formData.apartment_id!.trim(),
      name: this.formData.name!.trim(),
      room_type: this.formData.room_type || RoomType.BEDROOM,
      area: this.formData.area || 20,
      bed_count: this.formData.bed_count || 1,
      bed_type: this.formData.bed_type || BedType.SINGLE,
      has_window: this.formData.has_window !== undefined ? this.formData.has_window : true,
      has_balcony: this.formData.has_balcony !== undefined ? this.formData.has_balcony : false,
      has_private_bathroom: this.formData.has_private_bathroom !== undefined ? this.formData.has_private_bathroom : false,
      has_air_conditioning: this.formData.has_air_conditioning !== undefined ? this.formData.has_air_conditioning : true,
      has_heating: this.formData.has_heating !== undefined ? this.formData.has_heating : true,
      room_order: this.formData.room_order || 1,
      max_occupancy: this.formData.max_occupancy || 2,
      is_available: this.formData.is_available !== undefined ? this.formData.is_available : true,
      maintenance_required: this.formData.maintenance_required !== undefined ? this.formData.maintenance_required : false,
      has_tv: this.formData.has_tv !== undefined ? this.formData.has_tv : false,
      has_wifi: this.formData.has_wifi !== undefined ? this.formData.has_wifi : true,
      has_desk: this.formData.has_desk !== undefined ? this.formData.has_desk : false,
      has_closet: this.formData.has_closet !== undefined ? this.formData.has_closet : true,
      description: this.formData.description || 'Room description',
      created_at: this.isEditMode ? (this.selectedRoom!.created_at || new Date().toISOString()) : new Date().toISOString()
    };

    this.loading = true;
    const operation = this.isEditMode
      ? this.hotelService.updateRoom(this.selectedRoom!.id, roomData)
      : this.hotelService.createRoom(roomData);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isEditMode ? 'Room updated successfully' : 'Room created successfully'
        });
        this.loadRooms();
        this.showDialog = false;
        this.loading = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.message || error?.message || 'Failed to save room';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  deleteRoom(room: Room): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this room?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.hotelService.deleteRoom(room.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Room deleted successfully'
            });
            this.loadRooms();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete room'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  get filteredRooms(): Room[] {
    let filtered = this.rooms;
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        r.apartment_id.toLowerCase().includes(query)
      );
    }
    
    if (this.selectedApartmentFilter) {
      filtered = filtered.filter(r => r.apartment_id === this.selectedApartmentFilter);
    }
    
    return filtered;
  }

  getApartmentName(apartmentId: string): string {
    const apartment = this.apartments.find(a => {
      const aptId = a.id || (a as any)._id;
      return aptId === apartmentId;
    });
    return apartment ? (apartment.title || apartment.name) : apartmentId;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.formData = this.getEmptyRoomForm();
  }

  private getEmptyRoomForm(): Partial<Room> {
    // Set default apartment_id if available
    const defaultApartmentId = this.apartmentsForDropdown.length > 0 
      ? this.apartmentsForDropdown[0].id 
      : '';
    
    return {
      id: `room_${Date.now()}`,
      apartment_id: defaultApartmentId,
      name: 'New Room',
      room_type: RoomType.BEDROOM,
      area: 20,
      bed_count: 1,
      bed_type: BedType.SINGLE,
      has_window: true,
      has_balcony: false,
      has_private_bathroom: false,
      has_air_conditioning: true,
      has_heating: true,
      room_order: 1,
      max_occupancy: 2,
      is_available: true,
      maintenance_required: false,
      has_tv: false,
      has_wifi: true,
      has_desk: false,
      has_closet: true,
      description: 'Room description'
    };
  }
}
