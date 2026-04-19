import { Router } from '@angular/router';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProfileServices } from '../../core/services/profile.services';
import { HttpClient } from '@angular/common/http';
import { ThemeService, ThemeSettings } from '../../core/services/theme.service';
import { SliderModule } from 'primeng/slider';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { getApiBase } from '../../core/config/api-config';
import { UploadService } from '../../features/inventory/services/upload.service';
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
    BadgeModule,
    AccordionModule,
    MultiSelectModule,
    PasswordModule,
    DialogModule,
    ConfirmDialogModule
  ],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SettingsComponent implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  // Non-collapsing sidebar sections for stable two-column layout
  settingSections = [
    { key: 'profile',       label: 'Profile',            icon: 'pi pi-user',     description: 'Identity, avatar, and active sessions' },
    { key: 'security',      label: 'Security',           icon: 'pi pi-lock',     description: 'Password, 2FA, and session management' },
    { key: 'notifications', label: 'Notifications',      icon: 'pi pi-bell',     description: 'Channels, alerts, and preferences' },
    { key: 'access',        label: 'Access & Roles',     icon: 'pi pi-shield',   description: 'Your governance roles, permissions and policies' },
    { key: 'users',         label: 'User Management',    icon: 'pi pi-users',    description: 'Workspace members, roles, and status' },
    { key: 'appearance',    label: 'Appearance',         icon: 'pi pi-palette',  description: 'Theme, layout, and visual behavior' },
    { key: 'data',          label: 'Data & Privacy',     icon: 'pi pi-database', description: 'Export, retention, and destructive actions' },
  ];
  activeSection: string = 'profile';

  // Switch the right-hand panel to the named section
  switchSection(sectionKey: string) {
    if (!sectionKey) return;
    this.activeSection = sectionKey;
    if (sectionKey === 'users') this.fetchUsersForManagement();
    if (sectionKey === 'access' && !this.myPermissions) this.loadMyPermissions();
    if (sectionKey === 'notifications' && !this.notifLoaded) this.loadNotificationSettings();
  }

  // Access & Permissions state
  myPermissions: any = null;
  permissionsLoading = false;

  loadMyPermissions(): void {
    this.permissionsLoading = true;
    this.profileService.getMyPermissions().subscribe({
      next: (res) => {
        this.myPermissions = res?.data ?? res;
        this.permissionsLoading = false;
      },
      error: () => {
        this.permissionsLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load permissions' });
      }
    });
  }

  // Notification settings loaded from API
  notifLoaded = false;
  notifLoading = false;

  loadNotificationSettings(): void {
    this.notifLoading = true;
    this.profileService.getNotificationSettings().subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        if (data) {
          this.notificationSettings = {
            emailNotifications: data.email_notifications ?? data.emailNotifications ?? this.notificationSettings.emailNotifications,
            pushNotifications:  data.push_notifications  ?? data.pushNotifications  ?? this.notificationSettings.pushNotifications,
            smsNotifications:   data.sms_notifications   ?? data.smsNotifications   ?? this.notificationSettings.smsNotifications,
            marketingEmails:    data.marketing_emails    ?? data.marketingEmails    ?? this.notificationSettings.marketingEmails,
            securityAlerts:     data.security_alerts     ?? data.securityAlerts     ?? this.notificationSettings.securityAlerts,
          };
        }
        this.notifLoaded = true;
        this.notifLoading = false;
      },
      error: () => {
        this.notifLoading = false;
        this.notifLoaded = true; // don't retry on error
      }
    });
  }
  profileForm: FormGroup;
  passwordForm: FormGroup;
  activeTabIndex: number = 0;

  get activeSectionMeta() {
    return this.settingSections.find(section => section.key === this.activeSection) || this.settingSections[0];
  }

  get profileCompleteness(): number {
    const values = [
      this.profile.firstName,
      this.profile.lastName,
      this.profile.email,
      this.profile.phone,
      this.profile.department,
      this.profile.timezone
    ];
    const completed = values.filter(value => {
      if (value === null || value === undefined) return false;
      if (typeof value !== 'string') return true;
      const normalized = value.trim().toLowerCase();
      return normalized !== '' && normalized !== 'no information' && normalized !== 'n/a';
    }).length;
    return Math.round((completed / values.length) * 100);
  }

  get enabledNotificationCount(): number {
    return Object.values(this.notificationSettings).filter(Boolean).length;
  }

  get settingsSummaryCards() {
    return [
      {
        label: 'Profile completeness',
        value: `${this.profileCompleteness}%`,
        caption: 'Core identity fields populated',
        icon: 'pi pi-id-card',
        tone: 'blue'
      },
      {
        label: 'Active sessions',
        value: `${this.sessions?.length || 0}`,
        caption: 'Signed-in devices tracked',
        icon: 'pi pi-desktop',
        tone: 'orange'
      },
      {
        label: 'Notification channels',
        value: `${this.enabledNotificationCount}/5`,
        caption: 'Preferences currently enabled',
        icon: 'pi pi-bell',
        tone: 'purple'
      },
      {
        label: 'Theme mode',
        value: this.appearanceSettings.theme.charAt(0).toUpperCase() + this.appearanceSettings.theme.slice(1),
        caption: 'Workspace visual mode',
        icon: 'pi pi-palette',
        tone: 'emerald'
      }
    ];
  }

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

  // Management-specific loading state
  managementLoading = false;
  managementUsersLoaded = false;

  // Local profile & session management
  sessions: any[] = [];
  localProfileSource = getApiBase();
  localLoading = false;

  // NOTE: navigation-based user detail view (navigates to dedicated page)

  // Table columns for users
  userColumns = [
    { field: 'full_name', header: 'profile.users.fullName' },
    { field: 'email', header: 'profile.users.email' },
    { field: 'role', header: 'profile.users.role' },
    { field: 'is_active', header: 'profile.users.status' },
    { field: 'created_at', header: 'profile.users.joinedDate' }
  ];

  uploadingAvatar = false;
  avatarPreview: string = '';

  constructor(
    private injector: Injector,
    private profileService: ProfileServices,
    private uploadService: UploadService,
    private http: HttpClient,
    private fb: FormBuilder,
    private messageService: MessageService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private router: Router,
    public i18nService: I18nService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadThemeSettings();
    this.fetchLocalProfile();
    this.loadProfileData();
    this.loadNotificationSettings();

    // Handle ?tab= deep-links
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const valid = this.settingSections.map(s => s.key);
        this.activeSection = valid.includes(params['tab']) ? params['tab'] : 'profile';
        this.switchSection(this.activeSection);
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

  profileSaving = false;

  saveProfile(): void {
    if (!this.profileForm.valid) return;
    this.profileSaving = true;
    const { firstName, lastName, department } = this.profileForm.value;

    // PATCH /authentication/me/profile — first_name, last_name, company(=department)
    this.profileService.updateProfileDetails({
      first_name: firstName,
      last_name: lastName,
      company: department
    }).subscribe({
      next: () => {
        this.profile = { ...this.profile, firstName, lastName, department };
        this.profileSaving = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Profile updated successfully' });
      },
      error: (err) => {
        this.profileSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to update profile' });
      }
    });
  }

  passwordSaving = false;

  changePassword(): void {
    if (!this.passwordForm.valid) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
      return;
    }
    this.passwordSaving = true;
    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.messageService.add({ severity: 'success', summary: 'Password Changed', detail: 'Your password has been updated' });
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to change password' });
      }
    });
  }

  saveSecuritySettings(): void {
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Security settings updated' });
  }

  notifSaving = false;

  saveNotificationSettings(): void {
    this.notifSaving = true;
    const payload = {
      email_notifications: this.notificationSettings.emailNotifications,
      push_notifications:  this.notificationSettings.pushNotifications,
      sms_notifications:   this.notificationSettings.smsNotifications,
      marketing_emails:    this.notificationSettings.marketingEmails,
      security_alerts:     this.notificationSettings.securityAlerts,
    };
    this.profileService.updateNotificationSettings(payload).subscribe({
      next: () => {
        this.notifSaving = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Notification preferences updated' });
      },
      error: (err) => {
        this.notifSaving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to save notifications' });
      }
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

  openPhotoUpload(): void {
    this.avatarInput?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadAvatar(file);
  }

  triggerPreviewUpdate(): void {
    // forces template re-render when color/style changes
  }

  onAvatarUpload(event: any): void {
    const file: File | undefined = (event && event.files && event.files.length) ? event.files[0] : (event instanceof File ? event : undefined);
    if (!file) {
      this.messageService.add({ severity: 'error', summary: 'Upload error', detail: 'No file selected' });
      return;
    }

    this.uploadAvatar(file);
  }

  onAvatarError(event: Event) {
    // Fallback avatar if image fails to load
    try {
      this.profile.avatar = '/assets/images/avatar.jpg';
      const imgEl = event && event.target as HTMLImageElement;
      if (imgEl) imgEl.src = this.profile.avatar;
    } catch (e) {
      // ignore
    }
  }

  signAvatar(key: string): void {
    if (!key) return;
    if (key.startsWith('http')) {
      this.avatarPreview = key;
      return;
    }
    this.uploadService.getSignedUrl(key).subscribe(res => {
      if (res.success) this.avatarPreview = res.signed_url;
    });
  }

  private uploadAvatar(file: File): void {
    this.uploadingAvatar = true;
    this.messageService.add({ severity: 'info', summary: 'Uploading', detail: file.name });
    this.uploadService.uploadImage(file).subscribe({
      next: (resp) => {
        const key = resp.metadata.key;
        this.profileService.updateAccount({ image: key }).subscribe({
          next: () => {
            this.uploadingAvatar = false;
            this.profile.avatar = key;
            this.signAvatar(key);
            this.messageService.add({ severity: 'success', summary: 'Avatar Updated', detail: 'Profile picture saved' });
          },
          error: (err) => {
            this.uploadingAvatar = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to update profile' });
          }
        });
      },
      error: (err) => {
        this.uploadingAvatar = false;
        this.messageService.add({ severity: 'error', summary: 'Upload failed', detail: err?.error?.detail || 'Failed to upload avatar' });
      }
    });
  }

  exportData(): void {
    // Fetch current profile data and export as JSON
    this.profileService.getProfile().subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-profile-data.json';
        a.click();
        URL.revokeObjectURL(url);
        this.messageService.add({ severity: 'success', summary: 'Exported', detail: 'Profile data downloaded' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to export data' })
    });
  }

  deleteAccount(): void {
    this.confirmationService.confirm({
      header: 'Delete Account',
      message: 'This will permanently delete your account and all associated data. This cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.profileService.deleteAccount().subscribe({
          next: () => {
            this.messageService.add({ severity: 'warn', summary: 'Account Deleted', detail: 'Your account has been deleted' });
            setTimeout(() => this.router.navigate(['/login']), 2000);
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to delete account' });
          }
        });
      }
    });
  }

  // Profile management methods (from Profile component)
  loadProfileData() {
    this.loading = true;

    // Load all users only (do not call /authentication/me here; Settings page calls fetchLocalProfile())
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.allUsers = res?.data || [];
        this.filteredUsers = [...this.allUsers];
        this.loading = false;
        // If users were loaded as part of the page init, mark management as loaded
        // so the Users panel will render the table immediately (no extra spinner)
        this.managementUsersLoaded = true;
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

  refreshData() {
    this.loadProfileData();
  }

  /**
   * Fetch users for the 'User Management' panel. Uses UserService.getAllUsers()
   */
  fetchUsersForManagement(forceRefresh: boolean = false) {
    if (this.managementUsersLoaded && !forceRefresh) return;
    this.managementLoading = true;

    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.managementLoading = false;
        this.managementUsersLoaded = true;
        this.allUsers = res?.data || [];
        this.filteredUsers = [...this.allUsers];
      },
      error: (err) => {
        this.managementLoading = false;
        console.error('Failed to load users for management:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
      }
    });
  }

  // --- Local profile & session helpers ---
  fetchLocalProfile() {
    this.localLoading = true;
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        this.localLoading = false;
        const apiProfile: any = res?.data ?? res;
        if (!apiProfile) return;

        const norm = (v: any) => (v === null || v === undefined || v === '') ? '' : v;
        const defaultAvatar = '/assets/images/avatar.jpg';
        const avatarUrl = apiProfile.image?.trim() || defaultAvatar;

        const firstName = norm(apiProfile.first_name) || norm(apiProfile.full_name)?.split(' ')[0] || '';
        const lastName  = norm(apiProfile.last_name)  || norm(apiProfile.full_name)?.split(' ').slice(1).join(' ') || '';

        this.profile = {
          ...this.profile,
          firstName,
          lastName,
          email:      norm(apiProfile.email),
          phone:      norm(apiProfile.phone),
          department: norm(apiProfile.department),
          role:       norm(apiProfile.job_title || apiProfile.role),
          avatar:     avatarUrl,
          timezone:   norm(apiProfile.timezone),
          language:   norm(apiProfile.language) || this.profile.language,
        } as any;

        if (avatarUrl && avatarUrl !== defaultAvatar) {
          this.signAvatar(avatarUrl);
        }

        this.profileForm.patchValue({
          firstName:  firstName,
          lastName:   lastName,
          email:      this.profile.email,
          phone:      this.profile.phone,
          department: this.profile.department,
          role:       this.profile.role,
          timezone:   this.profile.timezone,
          language:   this.profile.language,
        });

        // Sessions come from AccountInfo.sessions array
        if (Array.isArray(apiProfile.sessions)) {
          this.sessions = apiProfile.sessions.map((s: any, i: number) => ({
            kid:               s.kid || `session-${i}`,
            session:           s.session || '',
            device:            s.device || 'Unknown device',
            remaining_seconds: s.remaining_seconds ?? 0,
          }));
        }
      },
      error: (err) => {
        this.localLoading = false;
        console.error('Error fetching profile:', err);
      }
    });
  }

  refreshSessions(): void {
    this.localLoading = true;
    this.profileService.getSessions().subscribe({
      next: (res) => {
        const data = res?.data ?? res;
        if (Array.isArray(data?.sessions)) {
          this.sessions = data.sessions.map((s: any, i: number) => ({
            kid: s.kid || `s-${i}`, session: s.session || '', device: s.device || 'Unknown', remaining_seconds: s.remaining_seconds ?? 0
          }));
        }
        this.localLoading = false;
      },
      error: () => { this.localLoading = false; }
    });
  }

  formatRemaining(seconds: number): string {
    if (!seconds || seconds <= 0) return 'Expired';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  }

  maskSession(sessionId: string): string {
    if (!sessionId || sessionId === 'N/A') return 'N/A';
    const len = sessionId.length;
    if (len <= 8) return sessionId;
    return `••••••${sessionId.slice(-8)}`;
  }

  revokeSession(sessionId: string) {
    this.profileService.revokeSession(sessionId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Session revoked', detail: this.maskSession(sessionId) });
        this.sessions = this.sessions.filter(s => s.session !== sessionId && s.kid !== sessionId);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to revoke session' });
      }
    });
  }

  revokeOtherSessions() {
    this.confirmationService.confirm({
      header: 'Revoke All Other Sessions',
      message: 'This will sign out all other devices. Continue?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.profileService.revokeAllSessions().subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Done', detail: 'All other sessions revoked' });
            this.sessions = this.sessions.slice(0, 1); // keep current
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Failed to revoke sessions' });
          }
        });
      }
    });
  }

  // --- Helpers used by the Users table template ---
  getUserInitials(user: any): string {
    if (!user) return '';
    const first = (user.first_name || '').toString().trim();
    const last = (user.last_name || '').toString().trim();
    if (first || last) return ((first.charAt(0) || '') + (last.charAt(0) || '')).toUpperCase();
    if (user.full_name) return user.full_name.split(' ').map((s: string) => s.charAt(0)).slice(0, 2).join('').toUpperCase();
    return '';
  }

  getRoleDisplayText(role: string): string {
    if (!role) return 'User';
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'Administrator';
    if (r.includes('owner')) return 'Owner';
    if (r.includes('editor')) return 'Editor';
    if (r.includes('viewer') || r.includes('read')) return 'Viewer';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getRoleSeverity(role: string): string {
    if (!role) return 'info';
    const r = role.toLowerCase();
    if (r.includes('admin') || r.includes('owner')) return 'danger';
    if (r.includes('editor')) return 'warning';
    return 'info';
  }

  getUserStatus(user: any): string {
    if (!user) return 'Unknown';
    // common field names for active/enabled
    const active = user.is_active ?? user.active ?? user.enabled ?? user.isEnabled;
    if (active === true || active === 'true' || active === 1) return 'Active';
    if (active === false || active === 'false' || active === 0) return 'Inactive';
    return 'Unknown';
  }

  getUserStatusSeverity(user: any): string {
    const status = this.getUserStatus(user).toLowerCase();
    if (status === 'active') return 'success';
    if (status === 'inactive') return 'danger';
    return 'info';
  }

  formatDate(date: any): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date.toString();
      return d.toLocaleDateString();
    } catch (e) {
      return date.toString();
    }
  }

  // Navigate to the dedicated user detail page
  viewUser(user: any): void {
    if (!user) return;
    const userId = user.kid || user._id || user.id;
    if (!userId) {
      this.messageService.add({ severity: 'warn', summary: 'View User', detail: 'Unable to determine user id' });
      return;
    }

    // Navigate to the new route which will load the user detail component
    this.router.navigate(['/governance/users', userId]).catch(err => {
      console.error('Navigation to user detail failed', err);
      this.messageService.add({ severity: 'error', summary: 'Navigation failed', detail: 'Unable to open user detail page' });
    });
  }
}
