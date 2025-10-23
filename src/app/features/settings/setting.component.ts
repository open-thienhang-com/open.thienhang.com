import { Router } from '@angular/router';
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
    BadgeModule,
    AccordionModule
    , ConfirmDialogModule
  ],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SettingsComponent implements OnInit {
  // Non-collapsing sidebar sections for stable two-column layout
  settingSections = [
    { key: 'profile', label: 'Profile', icon: 'pi pi-user' },
    { key: 'security', label: 'Security & Password', icon: 'pi pi-lock' },
    { key: 'users', label: 'User Management', icon: 'pi pi-users' },
    { key: 'data', label: 'Data & Privacy', icon: 'pi pi-database' },
    { key: 'notifications', label: 'Notifications', icon: 'pi pi-bell' },
    { key: 'appearance', label: 'Appearance', icon: 'pi pi-palette' }
  ];
  activeSection: string = 'profile';

  // Switch the right-hand panel to the named section
  switchSection(sectionKey: string) {
    if (!sectionKey) return;
    this.activeSection = sectionKey;
    // Keep tab index in sync for any existing deep-links
    switch (sectionKey) {
      case 'profile':
      case 'security':
      case 'users':
      case 'data':
        this.activeTabIndex = 0;
        break;
      case 'notifications':
        this.activeTabIndex = 1;
        break;
      case 'appearance':
        this.activeTabIndex = 2;
        break;
      default:
        this.activeTabIndex = 0;
    }
    // If user opened the User Management section, fetch users from API
    if (sectionKey === 'users') {
      this.fetchUsersForManagement();
    }
  }
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

  // Management-specific loading state
  managementLoading = false;
  managementUsersLoaded = false;

  // Local profile & session management
  sessions: any[] = [];
  localProfileSource = 'http://localhost:8080';
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

  constructor(
    private injector: Injector,
    private profileService: ProfileServices,
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
    this.loadUserProfile();
    this.loadThemeSettings();
    this.loadProfileData();

    // Set active tab based on URL parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        // After merging Security, Users and Data & Privacy into Profile tab, keep older links working
        switch (params['tab']) {
          case 'profile':
          case 'security':
          case 'users':
          case 'data-privacy':
          case 'data&privacy':
            this.activeTabIndex = 0;
            break;
          case 'notifications':
            this.activeTabIndex = 1;
            break;
          case 'appearance':
            this.activeTabIndex = 2;
            break;
          default:
            this.activeTabIndex = 0;
        }
      }
    });

    // Only fetch /authentication/me when this Settings component is active
    this.fetchLocalProfile();

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

  private uploadAvatar(file: File): void {
    const uploadUrl = `${this.localProfileSource}/data-mesh/data-mesh/domains/files/upload/supabase`;
    const form = new FormData();
    form.append('file', file, file.name);

    this.messageService.add({ severity: 'info', summary: 'Uploading', detail: file.name });

    this.http.post<any>(uploadUrl, form).subscribe({
      next: (res) => {
        // API returns a top-level object with url property
        const publicUrl = res?.url || res?.data?.url || null;
        if (publicUrl) {
          // update avatar in-memory and notify user
          this.profile.avatar = publicUrl;
          // If profileForm had an avatar control, patch it; otherwise UI binds to profile.avatar
          try {
            if (this.profileForm.contains && this.profileForm.contains('avatar')) {
              this.profileForm.patchValue({ avatar: publicUrl });
            }
          } catch (e) {
            // ignore if no avatar control
          }

          this.messageService.add({ severity: 'success', summary: 'Uploaded', detail: 'Avatar updated' });
        } else {
          console.warn('Upload response missing url:', res);
          this.messageService.add({ severity: 'warn', summary: 'Upload finished', detail: 'Upload completed but no URL returned' });
        }
      },
      error: (err) => {
        console.error('Avatar upload failed:', err);
        this.messageService.add({ severity: 'error', summary: 'Upload failed', detail: 'Failed to upload avatar' });
      }
    });
  }

  exportData(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export Started',
      detail: 'Your data export will be ready shortly'
    });
  }

  deleteAccount(): void {
    this.confirmationService.confirm({
      header: 'Confirm Account Deletion',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // accepted -> perform deletion request (currently a placeholder)
        this.messageService.add({
          severity: 'warn',
          summary: 'Account Deletion',
          detail: 'Account deletion request submitted'
        });
      },
      reject: () => {
        // user rejected -> optional feedback
        this.messageService.add({ severity: 'info', summary: 'Cancelled', detail: 'Account deletion cancelled' });
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
    const url = `${this.localProfileSource}/authentication/me`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.localLoading = false;
        const apiProfile = res?.data || null;
        if (!apiProfile) {
          this.messageService.add({ severity: 'warn', summary: 'No profile', detail: 'Local API returned no profile data' });
          return;
        }

        // helper that converts null/empty/undefined to 'No Information'
        const normalize = (v: any) => {
          if (v === null || v === undefined) return 'No Information';
          if (typeof v === 'string' && v.trim() === '') return 'No Information';
          return v;
        };

        // Update the in-memory profile so header and cards reflect API values
        // Determine avatar: prefer API value when non-empty, otherwise use default
        const defaultAvatar = '/assets/images/avatar.jpg';
        const avatarUrl = (apiProfile.image && typeof apiProfile.image === 'string' && apiProfile.image.trim() !== '') ? apiProfile.image : defaultAvatar;

        this.profile = {
          firstName: normalize(apiProfile.first_name) === 'No Information' && apiProfile.full_name ? apiProfile.full_name : normalize(apiProfile.first_name),
          lastName: normalize(apiProfile.last_name) === 'No Information' && apiProfile.full_name ? '' : normalize(apiProfile.last_name),
          email: normalize(apiProfile.email),
          phone: normalize(apiProfile.phone),
          department: normalize(apiProfile.department),
          role: normalize(apiProfile.job_title || apiProfile.role),
          avatar: avatarUrl,
          timezone: normalize(apiProfile.timezone),
          language: normalize(apiProfile.language || this.profile.language)
        } as any;

        // Patch form controls with normalized values (use No Information for missing)
        this.profileForm.patchValue({
          firstName: this.profile.firstName || 'No Information',
          lastName: this.profile.lastName || 'No Information',
          email: this.profile.email || 'No Information',
          phone: this.profile.phone || 'No Information',
          department: this.profile.department || 'No Information',
          role: this.profile.role || 'No Information',
          timezone: this.profile.timezone || 'No Information',
          language: this.profile.language || 'No Information'
        });

        this.sessions = Array.isArray(apiProfile.sessions) ? apiProfile.sessions.map((s: any, i: number) => ({
          kid: s.kid || `No Information-${i}`,
          session: s.session || 'No Information',
          device: s.device || 'No Information',
          remaining_seconds: (s.remaining_seconds === null || s.remaining_seconds === undefined) ? 0 : s.remaining_seconds
        })) : [];

        this.messageService.add({ severity: 'success', summary: 'Local profile loaded', detail: `Loaded ${this.sessions.length} sessions` });
      },
      error: (err) => {
        this.localLoading = false;
        console.error('Error fetching local profile:', err);
        this.messageService.add({ severity: 'error', summary: 'Local API error', detail: 'Failed to call http://localhost:8080/authentication/me' });
      }
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
    if (!confirm('Are you sure you want to revoke this session?')) return;
    const url = `${this.localProfileSource}/authentication/sessions/${sessionId}`;
    this.http.delete<any>(url).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Session revoked', detail: this.maskSession(sessionId) });
        this.sessions = this.sessions.filter(s => s.session !== sessionId);
      },
      error: (err) => {
        console.error('Error revoking session:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to revoke session' });
      }
    });
  }

  revokeOtherSessions(keepSessionId?: string) {
    if (!confirm('Revoke all other sessions?')) return;
    const url = `${this.localProfileSource}/authentication/sessions/revoke-others`;
    this.http.post<any>(url, { keep: keepSessionId || null }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Other sessions revoked', detail: 'All other sessions removed' });
        if (keepSessionId) this.sessions = this.sessions.filter(s => s.session === keepSessionId);
        else this.sessions = [];
      },
      error: (err) => {
        console.error('Error revoking other sessions:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to revoke other sessions' });
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
