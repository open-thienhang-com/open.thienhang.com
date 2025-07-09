import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBaseComponent } from '../../core/base/app-base.component';
import { ProfileServices } from '../../core/services/profile.services';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    BadgeModule,
    ButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends AppBaseComponent implements OnInit {
  profile: any = {};
  currentDate = new Date();

  constructor(private injector: Injector, private dataProdServices: ProfileServices) {
    super(injector);
  }

  ngOnInit() {
    this.dataProdServices.getProfile().subscribe(res => {
      this.profile = res.data;
      console.log(this.profile);
    })
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

  getRoleSeverity(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'analyst': return 'info';
      case 'user': return 'success';
      default: return 'secondary';
    }
  }
}