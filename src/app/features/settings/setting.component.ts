import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBaseComponent } from '../../core/base/app-base.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProfileServices } from '../../core/services/profile.services';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  avatar: string;
  timezone: string;
  language: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

interface AppearanceSettings {
  theme: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  language: string;
  dateFormat: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    InputSwitchModule,
    DropdownModule,
    CardModule,
    DividerModule,
    AvatarModule,
    FileUploadModule,
    ToastModule
  ],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [MessageService]
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  profile: UserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Engineering',
    role: 'Senior Data Engineer',
    avatar: '/assets/images/avatar.jpg',
    timezone: 'UTC-5',
    language: 'en'
  };

  securitySettings: SecuritySettings = {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true
  };

  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true
  };

  appearanceSettings: AppearanceSettings = {
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false,
    language: 'en',
    dateFormat: 'MM/dd/yyyy'
  };

  // Dropdown options
  departmentOptions = [
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Data Science', value: 'Data Science' },
    { label: 'Product', value: 'Product' },
    { label: 'Operations', value: 'Operations' }
  ];

  timezoneOptions = [
    { label: 'UTC-8 (Pacific)', value: 'UTC-8' },
    { label: 'UTC-5 (Eastern)', value: 'UTC-5' },
    { label: 'UTC+0 (GMT)', value: 'UTC+0' },
    { label: 'UTC+1 (CET)', value: 'UTC+1' }
  ];

  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Vietnamese', value: 'vi' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' }
  ];

  themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' }
  ];

  dateFormatOptions = [
    { label: 'MM/dd/yyyy', value: 'MM/dd/yyyy' },
    { label: 'dd/MM/yyyy', value: 'dd/MM/yyyy' },
    { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' }
  ];

  sessionTimeoutOptions = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 }
  ];

  constructor(
    private injector: Injector, 
    private profileService: ProfileServices,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: [this.profile.firstName, [Validators.required]],
      lastName: [this.profile.lastName, [Validators.required]],
      email: [this.profile.email, [Validators.required, Validators.email]],
      phone: [this.profile.phone],
      department: [this.profile.department],
      role: [this.profile.role],
      timezone: [this.profile.timezone],
      language: [this.profile.language]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  private loadUserProfile(): void {
    // Mock data loading
    setTimeout(() => {
      this.profileForm.patchValue(this.profile);
    }, 500);
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;
      this.profile = { ...this.profile, ...formData };
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully'
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { newPassword, confirmPassword } = this.passwordForm.value;
      
      if (newPassword !== confirmPassword) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Passwords do not match'
        });
        return;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Password changed successfully'
      });
      
      this.passwordForm.reset();
    }
  }

  saveSecuritySettings(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Security settings updated'
    });
  }

  saveNotificationSettings(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Notification preferences updated'
    });
  }

  saveAppearanceSettings(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Appearance settings updated'
    });
  }

  onAvatarUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      // Handle avatar upload
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Avatar uploaded successfully'
      });
    }
  }

  exportData(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export Started',
      detail: 'Your data export will be ready shortly'
    });
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Account Deletion',
        detail: 'Account deletion request submitted'
      });
    }
  }
}
