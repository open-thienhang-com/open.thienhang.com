# Hướng dẫn chuẩn hóa layout các trang Governance

## Mục tiêu
Chuẩn hóa layout của các trang governance để giống với trang `/governance/roles` đã được thiết kế tốt.

## Cấu trúc HTML chuẩn

```html
<!-- [Page Name] -->
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-[COLOR]-500 to-[COLOR]-600 rounded-lg flex items-center justify-center">
            <i class="pi pi-[ICON] text-white text-xl"></i>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">[Page Title]</h1>
            <p class="text-gray-600">[Page Description]</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- Action buttons here -->
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- 4 stat cards with consistent structure -->
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Filter controls -->
      </div>
    </div>

    <!-- Content (Table/Card View) -->
    <!-- ... -->
  </div>
</div>
```

## Danh sách các trang cần cập nhật

### 1. ✅ Teams (`teams.component.html`) - HOÀN THÀNH
- **File TypeScript**: Đã thêm `ToastModule`, `ConfirmDialogModule`
- **File HTML**: Đã cập nhật cấu trúc

### 2. ⏳ Accounts (`accounts.component.html`) - CẦN HOÀN THÀNH IMPORTS
**File cần sửa**: `src/app/features/governance/accounts/accounts.component.ts`

Thêm vào imports:
```typescript
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
```

Và thêm vào mảng imports trong @Component:
```typescript
imports: [
  // ... existing imports
  ToastModule,
  ConfirmDialogModule
]
```

### 3. ⏳ Users (`users.component.html`) - CẦN CẬP NHẬT

**Thay đổi cấu trúc** từ:
```html
<div class="bg-gray-50 p-6">
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
```

Thành:
```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
```

**Stats cards**: Đổi từ `rounded-xl border border-gray-200` → `rounded-lg shadow-sm`
**Icon gradient**: `from-blue-500 to-indigo-600`

**File TypeScript cần thêm**:
```typescript
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
```

### 4. ⏳ Permissions (`permissions.component.html`) - CẦN CẬP NHẬT

**Header icon gradient**: `from-orange-500 to-red-600`
**Stats cards**: Cần đồng bộ layout với roles (4 cards, cùng style)

**Cấu trúc hiện tại**:
- Đã có `<p-toast>` nhưng thiếu `<p-confirmDialog>`
- Stats cards dùng `rounded-xl shadow-sm border` → cần đổi thành `rounded-lg shadow-sm`
- Filter section cần cải thiện layout

**File TypeScript**: Kiểm tra và thêm `ConfirmDialogModule` nếu chưa có

### 5. ⏳ Assets (`assets.component.html`) - CẦN CẬP NHẬT

**Header icon gradient**: `from-green-500 to-emerald-600`

**Thay đổi chính**:
```html
<!-- Từ -->
<div class="bg-gray-50 p-3 sm:p-6 min-h-screen">

<!-- Thành -->
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-7xl mx-auto space-y-6">
```

**Stats cards**: 
- Đổi từ `rounded-xl shadow-sm border` → `rounded-lg shadow-sm`
- Loại bỏ responsive size `text-xs sm:text-sm`, chỉ dùng `text-sm`

**File TypeScript**: Thêm `ToastModule`, `ConfirmDialogModule`

### 6. ⏳ Policies (`policies.component.html`) - ĐÃ GẦN CHUẨN

**Trang này đã gần chuẩn**, chỉ cần:
- Đảm bảo có `<p-toast></p-toast>` và `<p-confirmDialog></p-confirmDialog>` ở đầu
- Stats cards đã đúng format
- Header đã đúng format
- Filter section đã đúng format

**File TypeScript**: Kiểm tra đã có đủ imports

### 7. ⏳ Data Contracts (`data-contracts.component.html`) - CẦN CẬP NHẬT NHIỀU

**File này khác biệt nhiều nhất**, cần:

1. **Thay đổi từ Tailwind classes thuần sang PrimeNG components**:
```html
<!-- Từ -->
<button type="button" class="inline-flex items-center...">

<!-- Thành -->
<p-button label="..." icon="pi pi-..." severity="primary">
```

2. **Header section**: 
```html
<div class="bg-white rounded-lg shadow-sm p-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
        <i class="pi pi-file-check text-white text-xl"></i>
      </div>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Data Contracts</h1>
        <p class="text-gray-600">Manage data product contracts, SLAs, and quality agreements</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <p-button label="Export" icon="pi pi-download" severity="secondary" [outlined]="true" size="small"></p-button>
      <p-button label="New Contract" icon="pi pi-plus" severity="primary"></p-button>
    </div>
  </div>
</div>
```

3. **Stats cards**: Chuyển sang format chuẩn (4 cards, rounded-lg shadow-sm)

4. **Filters**: Chuyển từ `<select>` sang `<p-dropdown>`

5. **Table**: Chuyển sang `<p-table>` để đồng nhất với các trang khác

**File TypeScript**: Cần refactor để sử dụng PrimeNG components

## Checklist cho mỗi trang

- [ ] Thêm `<p-toast></p-toast>` ở đầu template
- [ ] Thêm `<p-confirmDialog></p-confirmDialog>` ở đầu template  
- [ ] Cấu trúc: `bg-gray-50 min-h-screen p-6` → `max-w-7xl mx-auto space-y-6`
- [ ] Header: `bg-white rounded-lg shadow-sm p-6`
- [ ] Icon gradient: `w-12 h-12 bg-gradient-to-br from-[COLOR] rounded-lg`
- [ ] Stats cards: 4 cards, `rounded-lg shadow-sm p-6`
- [ ] Filters: `bg-white rounded-lg shadow-sm p-6`, grid 4 cột
- [ ] TypeScript: Thêm `ToastModule`, `ConfirmDialogModule` vào imports
- [ ] Kiểm tra lỗi compile sau khi cập nhật

## Màu sắc icon gradient cho từng trang

- **Roles**: `from-green-500 to-blue-600` (pi-users)
- **Policies**: `from-purple-500 to-blue-600` (pi-shield)
- **Teams**: `from-purple-500 to-pink-600` (pi-users)
- **Accounts**: `from-purple-500 to-pink-600` (pi-id-card)
- **Users**: `from-blue-500 to-indigo-600` (pi-users)
- **Permissions**: `from-orange-500 to-red-600` (pi-key)
- **Assets**: `from-green-500 to-emerald-600` (pi-database)
- **Data Contracts**: `from-purple-500 to-blue-600` (pi-file-check)

## Ưu tiên thực hiện

1. ✅ **Teams** - Hoàn thành
2. **Accounts** - Chỉ cần thêm imports trong TS
3. **Users** - Cập nhật HTML structure
4. **Permissions** - Tinh chỉnh nhỏ
5. **Assets** - Đơn giản hóa responsive classes
6. **Policies** - Kiểm tra imports
7. **Data Contracts** - Refactor nhiều nhất

## Lưu ý quan trọng

- **KHÔNG thay đổi logic nghiệp vụ** - chỉ thay đổi layout và style
- **Giữ nguyên tên biến, function** - chỉ sửa template
- **Test từng trang sau khi sửa** để đảm bảo không có lỗi compile
- **Sử dụng PrimeNG components** thay vì HTML thuần
- **Đồng nhất spacing**: `gap-3`, `gap-4`, `gap-6`, `space-y-6`
- **Đồng nhất border radius**: `rounded-lg` cho containers, `rounded-full` cho avatars/badges

## Command để test compile errors

```bash
ng build --configuration development
```

Hoặc chỉ check một component:
```bash
ng build --watch
```
