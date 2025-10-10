# Governance Pages Header Standardization

## Overview
All governance pages now have a consistent header layout matching the Asset Management page design.

## Standard Header Pattern

### Title Structure
- **Left Side**: Page title with icon and description
  - Icon: 48px x 48px gradient background with white icon
  - Title: Large bold text (text-3xl)
  - Description: Gray text below title

### Action Buttons (Right Side)
All pages include these standard action buttons (hidden on mobile, shown as icons with tooltips on desktop):

1. **Refresh Data** (Settings icon)
   - Icon: `pi pi-cog`
   - Severity: `info`
   - Tooltip: "Refresh Data" / "Test API"
   - Outlined, Rounded

2. **Clear Cache**
   - Icon: `pi pi-trash`
   - Severity: `warning`
   - Tooltip: "Clear Cache"
   - Outlined, Rounded

3. **Export**
   - Icon: `pi pi-download`
   - Severity: `secondary`
   - Tooltip: "Export [Page Name]"
   - Outlined, Rounded

4. **View Toggle** (if applicable)
   - Icons: `pi pi-table` / `pi pi-th-large` / `pi pi-list`
   - Severity: `secondary`
   - Dynamic outline based on current view
   - Rounded

5. **Add New** (Primary Action)
   - Icon: `pi pi-plus`
   - Severity: `primary`
   - Label on mobile, icon only on desktop
   - Rounded on desktop

## Page-Specific Details

### 1. Policy Management
- **Title**: Policy Management
- **Icon**: `pi pi-shield` with purple-blue gradient (from-purple-500 to-blue-600)
- **Description**: Define and manage data governance policies
- **Primary Action**: Add Policy
- **View Modes**: Table View, Card View

### 2. Role Management
- **Title**: Role Management
- **Icon**: `pi pi-users` with green-blue gradient (from-green-500 to-blue-600)
- **Description**: Define and manage user roles and permissions
- **Primary Action**: Add Role
- **View Modes**: Table View, Card View

### 3. Team Management
- **Title**: Team Management
- **Icon**: `pi pi-users` with purple-pink gradient (from-purple-500 to-pink-600)
- **Description**: Organize users into teams with shared roles and permissions
- **Primary Action**: Create Team
- **Special Button**: Team Analytics (chart-bar icon)

### 4. Account Management
- **Title**: Account Management
- **Icon**: `pi pi-id-card` with purple-pink gradient (from-purple-500 to-pink-600)
- **Description**: Manage user accounts, authentication, and profile information
- **Primary Action**: Add Account
- **View Modes**: List View, Card View

### 5. User Management
- **Title**: User Management
- **Icon**: `pi pi-users` with blue-indigo gradient (from-blue-500 to-indigo-600)
- **Description**: Manage user accounts, roles, and access permissions
- **Primary Action**: Add User

### 6. Permission Management
- **Title**: Permission Management
- **Icon**: `pi pi-key` with orange-red gradient (from-orange-500 to-red-600)
- **Description**: Define granular access rights and control system operations
- **Primary Action**: Add Permission
- **Special Buttons**: 
  - Toggle Filters (pi-filter)
  - Card View (pi-th-large)

### 7. Asset Management
- **Title**: Asset Management
- **Icon**: `pi pi-database` with green-emerald gradient (from-green-500 to-emerald-600)
- **Description**: Manage data assets, resources, and digital inventory
- **Primary Action**: Add Asset
- **View Modes**: Table View, Card View

### 8. Data Contracts
- **Title**: Data Contracts
- **Icon**: `pi pi-file-check` with purple-blue gradient (from-purple-500 to-blue-600)
- **Description**: Manage data product contracts, SLAs, and quality agreements
- **Primary Action**: New Contract

## Stats Cards Standardization

All pages now use consistent stats card styling:

```html
<div class="bg-white rounded-lg shadow-sm p-6">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-600">[Label]</p>
      <p class="text-3xl font-bold [color]">[Value]</p>
    </div>
    <div class="w-12 h-12 [bg-color] rounded-lg flex items-center justify-center">
      <i class="pi [icon] [text-color] text-xl"></i>
    </div>
  </div>
</div>
```

### Changes from old patterns:
- Changed from `rounded-xl border` to `rounded-lg shadow-sm`
- Changed from `text-2xl` to `text-3xl` for values
- Standardized icon size to `text-xl`
- Removed dark mode classes for consistency
- Text position on left, icon on right

## Layout Structure

All pages follow this consistent structure:

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <!-- Header content -->
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- 4 stats cards -->
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <!-- Filters -->
    </div>

    <!-- Content Section -->
    <!-- Tables, cards, etc. -->
    
  </div>
</div>
```

## Responsive Design

### Mobile (sm and below)
- Action buttons show labels with icons
- Button size: `small`
- Flex wrap enabled for button container

### Desktop (sm and above)
- Action buttons show icons only with tooltips
- Buttons are rounded
- Class: `hidden sm:inline-flex`

## Required Imports

All components now include:

```typescript
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
```

## Implementation Status

✅ **Completed**:
- Policies Component
- Roles Component
- Teams Component
- Accounts Component
- Users Component
- Permissions Component
- Assets Component
- Data Contracts Component

All 8 governance pages now have consistent header layouts and styling!
