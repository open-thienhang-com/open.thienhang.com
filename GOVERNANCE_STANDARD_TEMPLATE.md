# Governance Pages Standard Template

## Mục tiêu
Đảm bảo tất cả 7 trang Governance có:
1. ✅ Layout nhất quán
2. ✅ Search functionality
3. ✅ Filter controls (Type, Status, etc.)
4. ✅ Pagination
5. ✅ View mode toggle (List/Card hoặc Table/Card)
6. ✅ Icon-based UI để gọn gàng
7. ✅ Spacing và khoảng cách đồng nhất

## Danh sách pages
1. Policies (`/governance/policies`)
2. Roles (`/governance/roles`)
3. Teams (`/governance/teams`)
4. Accounts (`/governance/accounts`)
5. Users (`/governance/users`)
6. Permissions (`/governance/permissions`)
7. Assets (`/governance/assets`)

## Standard Header Structure
```html
<!-- Header Section -->
<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
  <div class="flex items-center justify-between">
    <!-- Left: Title and Description -->
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-gradient-to-br from-[color1] to-[color2] rounded-lg flex items-center justify-center">
        <i class="pi pi-[icon] text-white text-xl"></i>
      </div>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">[Page Title]</h1>
        <p class="text-gray-600">[Description]</p>
      </div>
    </div>
    
    <!-- Right: Action Buttons -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      <!-- Refresh Button -->
      <p-button 
        icon="pi pi-refresh" 
        severity="info" 
        [outlined]="true"
        [rounded]="true"
        (click)="refresh()"
        pTooltip="Refresh Data"
        class="hidden sm:inline-flex">
      </p-button>
      
      <!-- Clear Cache Button (optional) -->
      <p-button 
        icon="pi pi-trash" 
        severity="warning" 
        [outlined]="true"
        [rounded]="true"
        (click)="clearCache()"
        pTooltip="Clear Cache"
        class="hidden sm:inline-flex">
      </p-button>
      
      <!-- Export Button -->
      <p-button 
        icon="pi pi-download" 
        severity="secondary" 
        [outlined]="true"
        [rounded]="true"
        (click)="export()"
        pTooltip="Export Data"
        class="hidden sm:inline-flex">
      </p-button>
      
      <!-- Toggle Filters Button -->
      <p-button 
        icon="pi pi-filter" 
        severity="secondary" 
        [outlined]="!showFilters"
        [rounded]="true"
        (click)="toggleFilters()"
        pTooltip="Toggle Filters"
        class="hidden sm:inline-flex">
      </p-button>
      
      <!-- View Mode Buttons -->
      <p-button 
        icon="pi pi-list" 
        severity="secondary"
        [outlined]="viewMode !== 'list'"
        [rounded]="true"
        (click)="setViewMode('list')"
        pTooltip="List View"
        class="hidden sm:inline-flex">
      </p-button>
      <p-button 
        icon="pi pi-th-large" 
        severity="secondary"
        [outlined]="viewMode !== 'card'"
        [rounded]="true"
        (click)="setViewMode('card')"
        pTooltip="Card View"
        class="hidden sm:inline-flex">
      </p-button>
      
      <!-- Add New Button -->
      <p-button 
        icon="pi pi-plus" 
        severity="primary"
        [rounded]="true"
        (click)="openCreateDialog()"
        pTooltip="Add New"
        class="hidden sm:inline-flex">
      </p-button>
    </div>
  </div>
</div>
```

## Standard Filter Section
```html
<!-- Filters Section -->
<div class="bg-white rounded-lg shadow-sm p-6 mb-6" *ngIf="showFilters">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Search Input -->
    <div class="flex flex-col gap-2">
      <label for="search" class="text-sm font-medium text-gray-700">Search</label>
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search"></i>
        <input 
          type="text" 
          pInputText 
          id="search"
          class="w-full"
          placeholder="Search..." 
          [(ngModel)]="searchTerm"
          (input)="onSearch()">
      </span>
    </div>

    <!-- Type Filter (if applicable) -->
    <div class="flex flex-col gap-2">
      <label for="type" class="text-sm font-medium text-gray-700">Type</label>
      <p-dropdown 
        id="type"
        [options]="typeOptions" 
        [(ngModel)]="selectedType" 
        optionLabel="label"
        placeholder="All Types"
        [showClear]="true"
        (onChange)="onFilterChange()"
        class="w-full">
      </p-dropdown>
    </div>

    <!-- Status Filter -->
    <div class="flex flex-col gap-2">
      <label for="status" class="text-sm font-medium text-gray-700">Status</label>
      <p-dropdown 
        id="status"
        [options]="statusOptions" 
        [(ngModel)]="selectedStatus" 
        optionLabel="label"
        placeholder="All Status"
        [showClear]="true"
        (onChange)="onFilterChange()"
        class="w-full">
      </p-dropdown>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-end gap-2">
      <p-button 
        label="Apply" 
        icon="pi pi-check"
        severity="primary"
        (click)="applyFilters()"
        class="flex-1">
      </p-button>
      <p-button 
        label="Clear" 
        icon="pi pi-times"
        severity="secondary"
        [outlined]="true"
        (click)="clearFilters()"
        class="flex-1">
      </p-button>
    </div>
  </div>
</div>
```

## Standard Pagination
```html
<!-- Pagination -->
<div class="bg-white rounded-lg shadow-sm p-4 mt-6">
  <p-paginator 
    [rows]="tableRowsPerPage"
    [totalRecords]="totalRecords"
    [rowsPerPageOptions]="[10, 25, 50, 100]"
    (onPageChange)="onPageChange($event)"
    [showCurrentPageReport]="true"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
  </p-paginator>
</div>
```

## Component Properties (TypeScript)
```typescript
// View mode
viewMode: 'list' | 'card' = 'list';

// Filters
showFilters: boolean = false;
searchTerm: string = '';
selectedType: any = null;
selectedStatus: any = null;

// Filter options
typeOptions = [
  { label: 'All Types', value: null },
  // Add specific options
];

statusOptions = [
  { label: 'All Status', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' }
];

// Pagination
totalRecords: number = 0;

// Methods
toggleFilters() {
  this.showFilters = !this.showFilters;
}

setViewMode(mode: 'list' | 'card') {
  this.viewMode = mode;
}

onSearch() {
  // Implement search logic
}

onFilterChange() {
  // Implement filter change logic
}

applyFilters() {
  // Implement apply filters logic
}

clearFilters() {
  this.searchTerm = '';
  this.selectedType = null;
  this.selectedStatus = null;
  // Call getData
}

onPageChange(event: any) {
  const page = event.page;
  this.getData(page);
}
```

## Spacing Standards
- Header section: `mb-6`
- Stats cards: `mb-6`
- Filter section: `mb-6`
- Content section: `mb-6`
- Pagination: `mt-6`

## Color Schemes per Page
1. **Policies**: purple-500 to blue-600
2. **Roles**: green-500 to blue-600
3. **Teams**: purple-500 to pink-600
4. **Accounts**: purple-500 to pink-600
5. **Users**: blue-500 to indigo-600
6. **Permissions**: orange-500 to red-600
7. **Assets**: green-500 to emerald-600
