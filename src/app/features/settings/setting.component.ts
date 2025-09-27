import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
import { ThemeService, ThemeSettings } from '../../core/services/theme.service';
import { SliderModule } from 'primeng/slider';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { forkJoin } from 'rxjs';

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
  // Extended appearance settings
  uiStyle: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  layoutStyle: string;
  sidebarStyle: string;
  animationEnabled: boolean;
  shadowEnabled: boolean;
  backgroundPattern: string;
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
    ToastModule,
    SliderModule,
    ColorPickerModule,
    SelectButtonModule,
    ChipModule,
    TableModule,
    TagModule,
    TooltipModule,
    BadgeModule
  ],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [MessageService]
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  activeTabIndex: number = 0;

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
    dateFormat: 'MM/dd/yyyy',
    uiStyle: 'modern',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    fontFamily: 'Inter',
    fontSize: 'medium',
    borderRadius: 'medium',
    layoutStyle: 'default',
    sidebarStyle: 'default',
    animationEnabled: true,
    shadowEnabled: true,
    backgroundPattern: 'none'
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

  // Extended appearance options
  uiStyleOptions = [
    { label: 'Modern', value: 'modern', description: 'Clean, contemporary design' },
    { label: 'Vintage', value: 'vintage', description: 'Classic, retro aesthetic' },
    { label: 'Flat', value: 'flat', description: 'Minimalist, flat design' },
    { label: 'Material', value: 'material', description: 'Google Material Design' },
    { label: 'Glass', value: 'glass', description: 'Glassmorphism effect' },
    { label: 'Minimal', value: 'minimal', description: 'Ultra-clean, minimal' }
  ];

  fontSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ];

  borderRadiusOptions = [
    { label: 'None', value: 'none' },
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Full', value: 'full' }
  ];

  layoutStyleOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Compact', value: 'compact' },
    { label: 'Comfortable', value: 'comfortable' },
    { label: 'Spacious', value: 'spacious' }
  ];

  sidebarStyleOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Overlay', value: 'overlay' },
    { label: 'Push', value: 'push' },
    { label: 'Static', value: 'static' }
  ];

  backgroundPatternOptions = [
    { label: 'None', value: 'none' },
    { label: 'Dots', value: 'dots' },
    { label: 'Grid', value: 'grid' },
    { label: 'Waves', value: 'waves' },
    { label: 'Geometric', value: 'geometric' }
  ];

  colorPresets = [
    { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
    { name: 'Green', value: '#10B981', class: 'bg-green-500' },
    { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
    { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
    { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
    { name: 'Orange', value: '#F59E0B', class: 'bg-orange-500' },
    { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
    { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' }
  ];

  fontPresets = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Nunito', value: 'Nunito' },
    { name: 'Montserrat', value: 'Montserrat' }
  ];

  sessionTimeoutOptions = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 }
  ];

  // Profile management properties (from Profile component)
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
    private profileService: ProfileServices,
    private fb: FormBuilder,
    private messageService: MessageService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private userService: UserService,
    public i18nService: I18nService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadThemeSettings();
    this.loadProfileData();

    // Set active tab based on URL parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        switch (params['tab']) {
          case 'profile':
            this.activeTabIndex = 0;
            break;
          case 'security':
            this.activeTabIndex = 1;
            break;
          case 'notifications':
            this.activeTabIndex = 2;
            break;
          case 'appearance':
            this.activeTabIndex = 3;
            break;
          case 'users':
            this.activeTabIndex = 4;
            break;
          default:
            this.activeTabIndex = 0;
        }
      }
    });
  }

  private loadThemeSettings(): void {
    const currentTheme = this.themeService.currentSettings;
    this.appearanceSettings = {
      theme: currentTheme.theme,
      sidebarCollapsed: this.appearanceSettings.sidebarCollapsed,
      compactMode: this.appearanceSettings.compactMode,
      language: this.appearanceSettings.language,
      dateFormat: this.appearanceSettings.dateFormat,
      uiStyle: currentTheme.uiStyle,
      primaryColor: currentTheme.primaryColor,
      accentColor: currentTheme.accentColor,
      fontFamily: currentTheme.fontFamily,
      fontSize: currentTheme.fontSize,
      borderRadius: currentTheme.borderRadius,
      layoutStyle: currentTheme.layoutStyle,
      sidebarStyle: currentTheme.sidebarStyle,
      animationEnabled: currentTheme.animationEnabled,
      shadowEnabled: currentTheme.shadowEnabled,
      backgroundPattern: currentTheme.backgroundPattern
    };
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
    // Update theme service with new settings
    this.themeService.updateSettings({
      theme: this.appearanceSettings.theme as any,
      uiStyle: this.appearanceSettings.uiStyle as any,
      primaryColor: this.appearanceSettings.primaryColor,
      accentColor: this.appearanceSettings.accentColor,
      fontFamily: this.appearanceSettings.fontFamily,
      fontSize: this.appearanceSettings.fontSize as any,
      borderRadius: this.appearanceSettings.borderRadius as any,
      layoutStyle: this.appearanceSettings.layoutStyle as any,
      sidebarStyle: this.appearanceSettings.sidebarStyle as any,
      animationEnabled: this.appearanceSettings.animationEnabled,
      shadowEnabled: this.appearanceSettings.shadowEnabled,
      backgroundPattern: this.appearanceSettings.backgroundPattern as any
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Appearance settings updated and applied'
    });
  }

  resetAppearanceSettings(): void {
    this.themeService.resetToDefault();
    this.loadThemeSettings();
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Appearance settings reset to default'
    });
  }

  selectColorPreset(color: string, type: 'primary' | 'accent'): void {
    if (type === 'primary') {
      this.appearanceSettings.primaryColor = color;
    } else {
      this.appearanceSettings.accentColor = color;
    }
  }

  selectFontPreset(font: string): void {
    this.appearanceSettings.fontFamily = font;
  }

  onThemeChange(): void {
    this.themeService.updateSettings({
      theme: this.appearanceSettings.theme as any
    });
  }

  onUiStyleChange(): void {
    this.themeService.updateSettings({
      uiStyle: this.appearanceSettings.uiStyle as any
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

  // Profile management methods (from Profile component)
  loadProfileData() {
    this.loading = true;

    // Load both current user profile and all users
    forkJoin({
      profile: this.profileService.getProfile(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: (responses) => {
        // Update profile with API data, keeping existing structure
        if (responses.profile.data) {
          const apiProfile = responses.profile.data as any;
          this.profile = {
            ...this.profile,
            firstName: apiProfile.firstName || apiProfile.first_name || this.profile.firstName,
            lastName: apiProfile.lastName || apiProfile.last_name || this.profile.lastName,
            email: apiProfile.email || this.profile.email,
            phone: apiProfile.phone || this.profile.phone,
            department: apiProfile.department || this.profile.department,
            role: apiProfile.role || this.profile.role,
            timezone: apiProfile.timezone || this.profile.timezone,
            language: apiProfile.language || this.profile.language,
            avatar: apiProfile.avatar || this.profile.avatar
          };
        }
        this.allUsers = responses.users.data || [];
        this.filteredUsers = [...this.allUsers];
        this.loading = false;
        console.log('Profile loaded:', this.profile);
        console.log('All users loaded:', this.allUsers);
      },
      error: (error) => {
        console.error('Error loading profile data:', error);
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

  refreshData() {
    this.loadProfileData();
  }
}
