import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { HotelService } from '../../services/hotel.service';
import { Apartment, Room } from '../../models/hotel.models';

interface MaintenanceRequest {
  id: string;
  apartment_id?: string;
  room_id?: string;
  title: string;
  description: string;
  type: 'apartment' | 'room' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
  scheduled_date?: Date;
  completed_date?: Date;
}

@Component({
  selector: 'app-hotel-maintenance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, InputTextarea,
    CalendarModule, DropdownModule, TableModule, BadgeModule, ToastModule,
    SkeletonModule, TagModule
  ],
  providers: [MessageService],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  requests: MaintenanceRequest[] = [];
  filteredRequests: MaintenanceRequest[] = [];
  apartments: Apartment[] = [];
  apartmentsForDropdown: any[] = [];
  rooms: Room[] = [];
  loading = false;
  
  searchTerm = '';
  selectedStatus: string | null = null;
  selectedPriority: string | null = null;
  selectedType: string | null = null;
  
  showDialog = false;
  isEditMode = false;
  selectedRequest: MaintenanceRequest | null = null;
  
  formData: Partial<MaintenanceRequest> = {
    type: 'general',
    priority: 'medium',
    status: 'pending'
  };

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
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
    { label: 'Apartment', value: 'apartment' },
    { label: 'Room', value: 'room' }
  ];

  constructor(
    private hotelService: HotelService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.generateSampleRequests();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.hotelService.getApartments().toPromise(),
      this.hotelService.getRooms().toPromise()
    ]).then(([apartmentsRes, roomsRes]) => {
      this.apartments = apartmentsRes?.data || [];
      // Normalize apartments for dropdown
      this.apartmentsForDropdown = this.apartments.map(apt => ({
        ...apt,
        id: apt.id || (apt as any)._id
      }));
      this.rooms = roomsRes?.data || [];
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

  generateSampleRequests(): void {
    // Generate sample maintenance requests
    this.requests = [
      {
        id: 'MAINT-001',
        apartment_id: this.apartments[0]?.id || 'apt_001',
        title: 'AC Unit Repair',
        description: 'Air conditioning unit not cooling properly in bedroom',
        type: 'apartment',
        priority: 'high',
        status: 'in_progress',
        created_at: new Date(),
        updated_at: new Date(),
        scheduled_date: new Date()
      },
      {
        id: 'MAINT-002',
        room_id: this.rooms[0]?.id || 'room_001',
        title: 'Plumbing Issue',
        description: 'Leaky faucet in bathroom',
        type: 'room',
        priority: 'medium',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'MAINT-003',
        title: 'WiFi Router Replacement',
        description: 'Router needs to be replaced for better coverage',
        type: 'general',
        priority: 'low',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000),
        updated_at: new Date(),
        completed_date: new Date()
      }
    ];
    this.filterRequests();
  }

  filterRequests(): void {
    let filtered = [...this.requests];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.id.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    if (this.selectedPriority) {
      filtered = filtered.filter(r => r.priority === this.selectedPriority);
    }

    if (this.selectedType) {
      filtered = filtered.filter(r => r.type === this.selectedType);
    }

    this.filteredRequests = filtered;
  }

  onSearch(): void {
    this.filterRequests();
  }

  onStatusChange(): void {
    this.filterRequests();
  }

  onPriorityChange(): void {
    this.filterRequests();
  }

  onTypeChange(): void {
    this.filterRequests();
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = {
      type: 'general',
      priority: 'medium',
      status: 'pending'
    };
    this.showDialog = true;
  }

  editRequest(request: MaintenanceRequest): void {
    this.isEditMode = true;
    this.selectedRequest = request;
    this.formData = { ...request };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedRequest = null;
    this.formData = {
      type: 'general',
      priority: 'medium',
      status: 'pending'
    };
  }

  saveRequest(): void {
    if (!this.formData.title || !this.formData.description) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    if (this.isEditMode && this.selectedRequest) {
      const index = this.requests.findIndex(r => r.id === this.selectedRequest!.id);
      if (index !== -1) {
        this.requests[index] = {
          ...this.requests[index],
          ...this.formData,
          updated_at: new Date()
        } as MaintenanceRequest;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Maintenance request updated'
        });
      }
    } else {
      const newRequest: MaintenanceRequest = {
        id: `MAINT-${Date.now()}`,
        apartment_id: this.formData.apartment_id,
        room_id: this.formData.room_id,
        title: this.formData.title!,
        description: this.formData.description!,
        type: this.formData.type || 'general',
        priority: this.formData.priority || 'medium',
        status: this.formData.status || 'pending',
        assigned_to: this.formData.assigned_to,
        scheduled_date: this.formData.scheduled_date,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.requests.push(newRequest);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Maintenance request created'
      });
    }

    this.filterRequests();
    this.closeDialog();
  }

  updateStatus(request: MaintenanceRequest, newStatus: string): void {
    request.status = newStatus as any;
    request.updated_at = new Date();
    if (newStatus === 'completed') {
      request.completed_date = new Date();
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Status updated'
    });
    this.filterRequests();
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'cancelled': 'danger'
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

  getRoomName(roomId?: string): string {
    if (!roomId) return 'N/A';
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : roomId;
  }

  getPendingRequests(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }

  getInProgressRequests(): number {
    return this.requests.filter(r => r.status === 'in_progress').length;
  }

  getCompletedRequests(): number {
    return this.requests.filter(r => r.status === 'completed').length;
  }
}
