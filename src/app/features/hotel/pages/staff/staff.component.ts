import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
}

@Component({
  selector: 'app-hotel-staff',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, DialogModule, InputTextModule, CalendarModule,
    DropdownModule, TableModule, BadgeModule, ToastModule, SkeletonModule,
    TagModule, AvatarModule
  ],
  providers: [MessageService],
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit {
  staff: StaffMember[] = [];
  filteredStaff: StaffMember[] = [];
  loading = false;
  
  searchTerm = '';
  selectedDepartment: string | null = null;
  selectedStatus: string | null = null;
  
  showDialog = false;
  isEditMode = false;
  selectedMember: StaffMember | null = null;
  
  formData: Partial<StaffMember> = {
    role: 'staff',
    department: 'operations',
    status: 'active'
  };

  departmentOptions = [
    { label: 'All Departments', value: null },
    { label: 'Front Desk', value: 'front_desk' },
    { label: 'Housekeeping', value: 'housekeeping' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Operations', value: 'operations' },
    { label: 'Management', value: 'management' }
  ];

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'On Leave', value: 'on_leave' }
  ];

  roleOptions = [
    { label: 'Staff', value: 'staff' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Manager', value: 'manager' },
    { label: 'Director', value: 'director' }
  ];

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    setTimeout(() => {
      this.staff = [
        {
          id: 'STAFF-001',
          name: 'John Doe',
          email: 'john.doe@hotel.com',
          phone: '+1-234-567-8900',
          role: 'manager',
          department: 'front_desk',
          hireDate: new Date('2023-01-15'),
          status: 'active'
        },
        {
          id: 'STAFF-002',
          name: 'Jane Smith',
          email: 'jane.smith@hotel.com',
          phone: '+1-234-567-8901',
          role: 'supervisor',
          department: 'housekeeping',
          hireDate: new Date('2023-03-20'),
          status: 'active'
        },
        {
          id: 'STAFF-003',
          name: 'Mike Johnson',
          email: 'mike.johnson@hotel.com',
          phone: '+1-234-567-8902',
          role: 'staff',
          department: 'maintenance',
          hireDate: new Date('2023-06-10'),
          status: 'active'
        },
        {
          id: 'STAFF-004',
          name: 'Sarah Williams',
          email: 'sarah.williams@hotel.com',
          phone: '+1-234-567-8903',
          role: 'staff',
          department: 'operations',
          hireDate: new Date('2024-01-05'),
          status: 'on_leave'
        }
      ];
      this.filterStaff();
      this.loading = false;
    }, 500);
  }

  filterStaff(): void {
    let filtered = [...this.staff];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.id.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      );
    }

    if (this.selectedDepartment) {
      filtered = filtered.filter(s => s.department === this.selectedDepartment);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(s => s.status === this.selectedStatus);
    }

    this.filteredStaff = filtered;
  }

  onSearch(): void {
    this.filterStaff();
  }

  onDepartmentChange(): void {
    this.filterStaff();
  }

  onStatusChange(): void {
    this.filterStaff();
  }

  openDialog(): void {
    this.isEditMode = false;
    this.formData = {
      role: 'staff',
      department: 'operations',
      status: 'active'
    };
    this.showDialog = true;
  }

  editMember(member: StaffMember): void {
    this.isEditMode = true;
    this.selectedMember = member;
    this.formData = { ...member };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.selectedMember = null;
    this.formData = {
      role: 'staff',
      department: 'operations',
      status: 'active'
    };
  }

  saveMember(): void {
    if (!this.formData.name || !this.formData.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    if (this.isEditMode && this.selectedMember) {
      const index = this.staff.findIndex(s => s.id === this.selectedMember!.id);
      if (index !== -1) {
        this.staff[index] = {
          ...this.staff[index],
          ...this.formData
        } as StaffMember;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff member updated'
        });
      }
    } else {
      const newMember: StaffMember = {
        id: `STAFF-${Date.now()}`,
        name: this.formData.name!,
        email: this.formData.email!,
        phone: this.formData.phone || '',
        role: this.formData.role || 'staff',
        department: this.formData.department || 'operations',
        hireDate: this.formData.hireDate || new Date(),
        status: this.formData.status || 'active'
      };
      this.staff.push(newMember);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Staff member created'
      });
    }

    this.filterStaff();
    this.closeDialog();
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'active': 'success',
      'inactive': 'danger',
      'on_leave': 'warning'
    };
    return severityMap[status] || 'secondary';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getActiveStaff(): number {
    return this.staff.filter(s => s.status === 'active').length;
  }

  getOnLeaveStaff(): number {
    return this.staff.filter(s => s.status === 'on_leave').length;
  }

  getDepartmentsCount(): number {
    const departments = new Set(this.staff.map(s => s.department));
    return departments.size;
  }
}
