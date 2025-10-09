import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppBaseComponent } from '../../core/base/app-base.component';
import { ProfileServices } from '../../core/services/profile.services';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    AvatarModule,
    BadgeModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    CardModule,
    DividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends AppBaseComponent implements OnInit {
  profile: any = {};
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  currentDate = new Date();
  loading = false;
  userSearchText = '';
  
  // Table columns for users
  userColumns = [
    { field: 'full_name', header: 'profile.users.fullName' },
    { field: 'email', header: 'profile.users.email' },
    { field: 'role', header: 'profile.users.role' },
    { field: 'is_active', header: 'profile.users.status' },
    { field: 'created_at', header: 'profile.users.joinedDate' }
  ];

  constructor(
    private injector: Injector, 
    private dataProdServices: ProfileServices,
    private userService: UserService,
    public i18nService: I18nService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.loadProfileData();
  }

  loadProfileData() {
    this.loading = true;
    // Only load users here; do not call /authentication/me on this page
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.allUsers = res?.data || [];
        this.filteredUsers = [...this.allUsers];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  // Filter users based on search text
  filterUsers() {
    if (!this.userSearchText) {
      this.filteredUsers = [...this.allUsers];
      return;
    }
    
    const searchTerm = this.userSearchText.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.role?.toLowerCase().includes(searchTerm)
    );
  }

  // Get user avatar initials
  getUserInitials(user: any): string {
    if (!user?.full_name) return 'U';
    return user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Get user status for display
  getUserStatus(user: any): string {
    return user.is_active ? 'profile.users.active' : 'profile.users.inactive';
  }

  // Get user status severity for styling
  getUserStatusSeverity(user: any): string {
    return user.is_active ? 'success' : 'danger';
  }

  // Get role display text
  getRoleDisplayText(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'profile.roles.admin',
      'manager': 'profile.roles.manager',
      'analyst': 'profile.roles.analyst',
      'viewer': 'profile.roles.viewer',
      'user': 'profile.roles.user'
    };
    return roleMap[role] || 'profile.roles.user';
  }

  // Get role severity for styling
  getRoleSeverity(role: string): string {
    const severityMap: { [key: string]: string } = {
      'admin': 'danger',
      'manager': 'warning',
      'analyst': 'info',
      'viewer': 'success',
      'user': 'secondary'
    };
    return severityMap[role] || 'secondary';
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  terminateSession(sessionId: string) {
    console.log('Terminate session:', sessionId);
    // Add your session termination logic here
  }

  editProfile() {
    console.log('Edit profile clicked');
    // Add edit profile logic here
  }

  changePassword() {
    console.log('Change password clicked');
    // Add change password logic here
  }

  openSettings() {
    console.log('Open settings clicked');
    // Add open settings logic here
  }

  downloadData() {
    console.log('Download data clicked');
    // Add download data logic here
  }

  refreshData() {
    this.loadProfileData();
  }

  formatRemainingTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${Math.floor(seconds)}s`;
    }
  }

  getDeviceInfo(deviceString: string): string {
    if (deviceString.includes('Chrome')) {
      return 'Chrome Browser';
    } else if (deviceString.includes('Firefox')) {
      return 'Firefox Browser';
    } else if (deviceString.includes('Safari')) {
      return 'Safari Browser';
    }
    return 'Unknown Device';
  }

  getAccessLevel(level: string): string {
    switch (level) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'analyst': return 'Data Analyst';
      case 'viewer': return 'Viewer';
      default: return 'User';
    }
  }

  getAccessSeverity(level: string): string {
    switch (level) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'analyst': return 'info';
      case 'viewer': return 'success';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  }
}