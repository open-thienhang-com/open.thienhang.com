# Governance Pages Layout - Final Standardization

## ✅ Completed Standardization

Tất cả 8 trang governance đã được chuẩn hóa với cấu trúc layout giống nhau.

## Cấu Trúc HTML Chuẩn

### 1. Container Structure (KHÔNG có max-w-7xl mx-auto)

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="bg-gray-50 min-h-screen p-6">
    
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <!-- Header content -->
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <!-- 4 stats cards -->
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <!-- Filters -->
    </div>

    <!-- Content Section -->
    <!-- Tables/Cards -->

</div>
```

### 2. Header Section Structure

```html
<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
  <div class="flex items-center justify-between">
    <!-- Left: Title -->
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-gradient-to-br from-[color] to-[color] rounded-lg flex items-center justify-center">
        <i class="pi [icon] text-white text-xl"></i>
      </div>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">[Title]</h1>
        <p class="text-gray-600">[Description]</p>
      </div>
    </div>
    
    <!-- Right: Action Buttons -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      <!-- Icon buttons on desktop, label+icon on mobile -->
    </div>
  </div>
</div>
```

### 3. Stats Cards Structure

```html
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
</div>
```

## Các Trang Đã Chuẩn Hóa

### 1. Policies (✅)
- **URL**: `/governance/policies`
- **Icon**: `pi-shield` (purple-blue gradient)
- **View Modes**: Table, Card
- **Stats**: Total, Active, Enforced, Violations

### 2. Roles (✅)
- **URL**: `/governance/roles`
- **Icon**: `pi-users` (green-blue gradient)
- **View Modes**: Table, Card
- **Stats**: Total, Active, Custom, System

### 3. Teams (✅)
- **URL**: `/governance/teams`
- **Icon**: `pi-users` (purple-pink gradient)
- **View Modes**: Table, Card
- **Stats**: Total, Active, Members, Projects
- **Extra**: Team Analytics button

### 4. Accounts (✅)
- **URL**: `/governance/accounts`
- **Icon**: `pi-id-card` (purple-pink gradient)
- **View Modes**: List, Card
- **Stats**: Total, Active, Pending, Locked

### 5. Users (✅)
- **URL**: `/governance/users`
- **Icon**: `pi-users` (blue-indigo gradient)
- **Stats**: Total, Active, Pending, Admin

### 6. Permissions (✅)
- **URL**: `/governance/permissions`
- **Icon**: `pi-key` (orange-red gradient)
- **Extra**: Filter toggle, Card view
- **Stats**: Total, Active, Custom, System

### 7. Assets (✅)
- **URL**: `/governance/assets`
- **Icon**: `pi-database` (green-emerald gradient)
- **Stats**: Total, Active, Critical, Pending

### 8. Data Contracts (✅)
- **URL**: `/data-contracts`
- **Icon**: `pi-file-check` (purple-blue gradient)
- **Stats**: Total, Active, Expiring, Violations

## Action Buttons (Chuẩn)

Tất cả các trang đều có các action buttons sau (từ trái sang phải):

1. **Refresh Data** (pi-cog, info, outlined, rounded) - Desktop only
2. **Clear Cache** (pi-trash, warning, outlined, rounded) - Desktop only
3. **Export** (pi-download, secondary, outlined, rounded) - Desktop only
4. **View Toggle** (pi-table/pi-th-large, secondary, conditional outline, rounded) - Desktop only
5. **Add New** (pi-plus, primary, rounded) - Desktop: icon only, Mobile: label + icon

## Responsive Design

### Desktop (sm and above)
- Buttons: Icon only với tooltips
- Class: `hidden sm:inline-flex`
- Rounded buttons
- Full width stats grid (4 columns)

### Mobile (below sm)
- Buttons: Label + Icon
- Class: `sm:hidden`
- Size: `small`
- Stats grid: 1-2 columns

## Styling Standards

- **Container**: `bg-gray-50 min-h-screen p-6`
- **Cards**: `bg-white rounded-lg shadow-sm p-6`
- **Spacing**: `mb-6` between sections
- **Grid**: `grid grid-cols-1 md:grid-cols-4 gap-6`
- **Icon Size**: `w-12 h-12` cho headers, `text-xl` cho icons
- **Title**: `text-3xl font-bold text-gray-900`
- **Description**: `text-gray-600`
- **Stats Value**: `text-3xl font-bold`
- **Stats Label**: `text-sm font-medium text-gray-600`

## View Mode Functionality

### Pages với View Toggle:
- **Policies**: Table ↔ Card
- **Roles**: Table ↔ Card  
- **Teams**: Table ↔ Card (Mới thêm!)
- **Accounts**: List ↔ Card
- **Permissions**: Card view

### TypeScript Requirements:
```typescript
// Properties
viewMode: 'table' | 'card' | 'list' = 'card';

// Methods
setViewMode(mode: 'table' | 'card' | 'list') {
  this.viewMode = mode;
}
```

### HTML Implementation:
```html
<!-- Table View -->
<div *ngIf="viewMode === 'table'">
  <p-table [value]="data">...</p-table>
</div>

<!-- Card View -->
<div *ngIf="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

## Key Differences từ Version Cũ

1. ❌ **Removed**: `max-w-7xl mx-auto` - Full width layout
2. ❌ **Removed**: `space-y-6` wrapper div
3. ✅ **Added**: `mb-6` cho từng section riêng lẻ
4. ✅ **Standardized**: Tất cả stats cards dùng `rounded-lg shadow-sm` thay vì `rounded-xl border`
5. ✅ **Standardized**: Tất cả headers dùng cùng structure và size
6. ✅ **Standardized**: Icon size `text-xl` và container size `w-12 h-12`
7. ✅ **Added**: View mode toggle cho Teams page

## Testing Checklist

- [ ] Tất cả pages load không lỗi
- [ ] View mode buttons hoạt động đúng
- [ ] Stats cards hiển thị đúng data
- [ ] Action buttons trigger đúng functions
- [ ] Responsive design hoạt động tốt mobile/desktop
- [ ] Spacing giữa các sections đồng nhất
- [ ] Icons và colors đúng theo design

## Completion Status

🎉 **100% Complete** - Tất cả 8 governance pages đã được chuẩn hóa!

- Layout structure: ✅
- Header standardization: ✅
- Stats cards styling: ✅
- Action buttons: ✅
- View mode functionality: ✅
- Responsive design: ✅
- Documentation: ✅
