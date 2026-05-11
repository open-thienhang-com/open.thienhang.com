import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plan } from '../../services/plan.service';

@Component({
  selector: 'app-plan-selection',
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-selection.component.html',
  styleUrl: './plan-selection.component.css',
})
export class PlanSelectionComponent {
  @Input() plans: Plan[] = [];
  @Input() loading = false;
  @Input() uploadStatus: { message: string; type: 'success' | 'error' | 'info' } | null = null;

  @Output() viewPlan = new EventEmitter<string>();
  @Output() deletePlan = new EventEmitter<string>();
  @Output() uploadPlan = new EventEmitter<File>();

  selectedFile: File | null = null;

  // Search and filter properties
  searchQuery = '';
  sortBy = 'newest';
  itemsPerPage = 12;
  currentPage = 1;

  // Computed properties
  get filteredPlans(): Plan[] {
    let filtered = [...this.plans];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(plan =>
        (plan.name || '').toLowerCase().includes(query) ||
        (plan.id || '').toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }

  get paginatedPlans(): Plan[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPlans.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPlans.length / this.itemsPerPage);
  }

  get totalFilteredPlans(): number {
    return this.filteredPlans.length;
  }

  onViewPlan(planId: string): void {
    this.viewPlan.emit(planId);
  }

  onDeletePlan(planId: string): void {
    if (confirm('Bạn có chắc muốn xóa plan này?')) {
      this.deletePlan.emit(planId);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      this.uploadPlan.emit(this.selectedFile);
      this.selectedFile = null;
      // Reset file input
      const input = document.getElementById('plan-file-input') as HTMLInputElement;
      if (input) input.value = '';
    }
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when searching
  }

  onSortChange(): void {
    this.currentPage = 1; // Reset to first page when sorting
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when changing items per page
  }

  loadPlans(): void {
    // This would typically emit an event to parent component to reload plans
    // For now, we'll just reset pagination
    this.currentPage = 1;
    this.searchQuery = '';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToFirstPage(): void {
    this.currentPage = 1;
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPlanId(plan: Plan): string {
    return plan.id || String(plan.created_at) || '';
  }

  getPlanDisplayName(plan: Plan): string {
    return plan.name || 'Plan';
  }

  getPlanDescription(plan: Plan): string {
    const date = plan.created_at;

    let desc = '';
    if (date) {
      desc += new Date(date).toLocaleString();
    } else {
      desc += 'Ngày tạo: N/A';
    }

    return desc;
  }
}
