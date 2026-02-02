# Settings Page - Quick Reference Guide

## File Locations

```
src/app/features/settings/
├── setting.component.ts        # Component logic
├── setting.component.html      # Template (redesigned)
└── setting.component.scss      # Styles (redesigned)
```

## Key Features

### ✓ Implemented Features
- [x] Hero section with gradient background
- [x] Sticky navigation tabs
- [x] Scrollable content area
- [x] Profile management
- [x] Active sessions display
- [x] User management table
- [x] Notification preferences
- [x] Security settings
- [x] Password change
- [x] Data export & account deletion
- [x] Theme customization
- [x] Dark mode support
- [x] Responsive design
- [x] Form validation
- [x] Loading states
- [x] Error handling

## Component Sections

### Profile Tab (`activeSection === 'profile'`)
- User profile information form
- Avatar upload
- Active sessions management

### Security Tab (`activeSection === 'security'`)
- Two-factor authentication toggle
- Login notifications
- Session timeout configuration
- Password change form

### Users Tab (`activeSection === 'users'`)
- User list with search
- Paginated user table
- User status indicators
- View user details

### Notifications Tab (`activeSection === 'notifications'`)
- Communication preferences
- Content preferences
- Toggle switches for each option

### Data Tab (`activeSection === 'data'`)
- Export data functionality
- Account deletion

### Appearance Tab (`activeSection === 'appearance'`)
- Theme selector (Light/Dark/Auto)
- UI style picker
- Color customization
- Typography settings
- Layout options

## CSS Classes Used

### Tailwind Utilities
```
Layout:
- flex, grid, gap-*, px-*, py-*, p-*
- w-*, h-*, min-h-*, max-w-*
- overflow-*, scroll-*

Colors:
- bg-*, text-*, border-*
- dark:bg-*, dark:text-*
- opacity-*, from-*, to-*, via-*

Styling:
- rounded-*, shadow-*, border-*
- transition-*, duration-*
- hover:*, dark:hover:*
- [class.active-class]="condition"
```

### Component-Specific Classes
```
.settings-content-wrapper    # Main scrollable container
.settings-content-inner      # Content flex container
.appearance-preview          # Theme preview box
.swatch                      # Color picker swatch
.p-button, .p-inputtext      # PrimeNG components
```

## PrimeNG Components Used

```typescript
- p-avatar              // User avatars
- p-button              // Buttons
- p-input               // Text inputs
- p-dropdown            // Select dropdowns
- p-fileUpload          // File upload
- p-table               // Data tables
- p-tag                 // Status tags
- p-chip                // Font selector chips
- p-inputSwitch         // Toggle switches
- p-colorPicker         // Color selector
- p-selectButton        // Theme selector
- p-progressSpinner     // Loading indicator
- p-toast               // Notifications
- p-confirmDialog       // Confirmation modal
- p-tooltip             // Help tooltips
```

## Component Properties

### Settings Sections
```typescript
settingSections = [
  { key: 'profile', label: 'Profile', icon: 'pi pi-user' },
  { key: 'security', label: 'Security & Password', icon: 'pi pi-lock' },
  { key: 'users', label: 'User Management', icon: 'pi pi-users' },
  { key: 'data', label: 'Data & Privacy', icon: 'pi pi-database' },
  { key: 'notifications', label: 'Notifications', icon: 'pi pi-bell' },
  { key: 'appearance', label: 'Appearance', icon: 'pi pi-palette' }
]

activeSection: string = 'profile'
```

### Forms
```typescript
profileForm: FormGroup        // User profile form
passwordForm: FormGroup       // Password change form
```

### Data Models
```typescript
profile: UserProfile
securitySettings: SecuritySettings
notificationSettings: NotificationSettings
appearanceSettings: AppearanceSettings
```

## Key Methods

```typescript
// Navigation
switchSection(sectionKey: string): void

// Profile
saveProfile(): void
changePassword(): void
onAvatarUpload(event): void

// Sessions
refreshData(): void
revokeSession(sessionId): void
revokeOtherSessions(): void

// Users
filterUsers(): void
viewUser(user): void
fetchUsersForManagement(): void

// Notifications
saveNotificationSettings(): void

// Security
saveSecuritySettings(): void

// Appearance
saveAppearanceSettings(): void
resetAppearanceSettings(): void
selectColorPreset(color, type): void
selectFontPreset(font): void

// Utilities
formatRemaining(seconds): string
maskSession(sessionId): string
getUserInitials(user): string
getRoleDisplayText(role): string
formatDate(date): string
```

## Styling Customization

### Color Scheme
Edit these color tokens in your theme:
```scss
--primary-600: #2563eb
--primary-700: #1d4ed8
--primary-800: #1e40af
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-800: #1f2937
--gray-900: #111827
```

### Typography
Override in tailwind.config.js:
```javascript
theme: {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
  }
}
```

### Spacing
Adjust gap and padding values:
```scss
gap-6      // 24px (1.5rem)
p-6, p-8   // 24px, 32px padding
```

## Responsive Breakpoints

```
Mobile:  < 640px   (sm)
Tablet:  640px+    (md), 1024px+ (lg)
Desktop: 1280px+   (xl)

Affected elements:
- grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- text-lg md:text-xl
- px-4 md:px-6 lg:px-8
- hidden sm:inline
```

## Testing Checklist

- [ ] All tabs switch correctly
- [ ] Content scrolls properly on small screens
- [ ] Forms submit and validate
- [ ] Dark mode toggles work
- [ ] Responsive layout adapts to screen size
- [ ] File upload accepts images
- [ ] Color picker works
- [ ] Tables paginate correctly
- [ ] Search filters users
- [ ] Confirmation dialogs appear for destructive actions
- [ ] Toast notifications display
- [ ] Loading spinners appear during async operations

## Common Issues & Solutions

### Issue: Tabs not switching
**Solution**: Check `switchSection()` method binding and `activeSection` state

### Issue: Content not scrolling
**Solution**: Verify `.settings-content-wrapper` has `overflow-y-auto` and `flex: 1`

### Issue: Dark mode not working
**Solution**: Check dark mode is enabled and `dark:` prefixed classes are applied

### Issue: Forms not submitting
**Solution**: Verify form validation and button click handlers

### Issue: Colors not matching
**Solution**: Check color token definitions and CSS variable usage

## Performance Tips

1. Use OnPush change detection if needed
2. Unsubscribe from observables in ngOnDestroy
3. Lazy load sections with `*ngIf`
4. Use trackBy for *ngFor loops
5. Minimize API calls with proper caching
6. Use CSS transitions instead of JS animations

## Browser DevTools Tips

### Check Responsive Design
```
DevTools → Device Toolbar (Ctrl+Shift+M)
Test: Mobile, Tablet, Desktop sizes
```

### Debug Dark Mode
```
DevTools → Console
document.documentElement.classList.add('dark')
```

### Check Performance
```
DevTools → Performance Tab
Record user interactions
Analyze frame rate and CPU usage
```

## Deployment Checklist

- [ ] All components compile without errors
- [ ] No console warnings or errors
- [ ] Responsive design tested on real devices
- [ ] Dark mode tested
- [ ] Form validation working
- [ ] API calls functional
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] Cross-browser compatibility verified

## Links & Resources

- [Settings Component File](./src/app/features/settings/setting.component.ts)
- [Design Documentation](./SETTINGS_PAGE_REDESIGN.md)
- [Design System Overview](./DESIGN_SYSTEM_OVERVIEW.md)
- [PrimeNG Documentation](https://primeng.org)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Angular Guide](https://angular.io)

---

**Last Updated**: February 2, 2026  
**Status**: Production Ready ✓
