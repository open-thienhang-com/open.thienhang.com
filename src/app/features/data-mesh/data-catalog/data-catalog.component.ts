import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ChipsModule } from 'primeng/chips';
import { DividerModule } from 'primeng/divider';
import { DataMeshServices, Domain } from '../../../core/services/data-mesh.services';

@Component({
  selector: 'app-data-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SkeletonModule,
    TooltipModule,
    BadgeModule,
    TagModule,
    ChipsModule,
    DividerModule
  ],
  templateUrl: './data-catalog.component.html',
  styleUrls: ['./data-catalog.component.scss']
})
export class DataCatalogComponent implements OnInit {
  domains: Domain[] = [];
  filteredDomains: Domain[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';

  constructor(private dataMeshService: DataMeshServices) {}

  ngOnInit() {
    this.loadCatalog();
  }

  loadCatalog() {
    this.loading = true;
    this.dataMeshService.getDomainCatalog().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.domains = response.data;
          this.filteredDomains = [...this.domains];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load catalog:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredDomains = this.domains.filter(domain => {
      const matchesSearch = !this.searchTerm || 
        domain.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        domain.display_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        domain.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || domain.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.filteredDomains = [...this.domains];
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'danger';
      default:
        return 'info';
    }
  }

  getQualityScore(score: string): string {
    const numScore = parseInt(score);
    if (numScore >= 90) return 'success';
    if (numScore >= 70) return 'warning';
    return 'danger';
  }
}
