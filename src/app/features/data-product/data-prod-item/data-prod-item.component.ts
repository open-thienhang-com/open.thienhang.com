import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Imports
import { Tag } from 'primeng/tag';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-data-prod-item',
  imports: [
    CommonModule,
    Tag,
    Badge,
    Button,
    TooltipModule
  ],
  templateUrl: './data-prod-item.component.html',
  standalone: true,
  styleUrls: ['./data-prod-item.component.scss']
})
export class DataProdItemComponent {
  @Input() data: any = {};
  @Input() viewMode: string = 'grid';
  @Input() isSubscribed: boolean = false;

  @Output() onProductClick = new EventEmitter<any>();
  @Output() onSubscribe = new EventEmitter<any>();
  @Output() onUnsubscribe = new EventEmitter<any>();

  colors = [
    '#792424',
    '#a58a0a',
    '#608209',
    '#09822b',
    '#5accbd',
    '#225fcc',
    '#6c19e0',
    '#82097e',
  ];

  constructor(private router: Router) { }

  get getStyle() {
    return { 'border-left': '3px solid ' + this.colors[Math.floor(Math.random() * this.colors.length)] }
  }

  goToDetail() {
    // Emit event for parent component to handle
    this.onProductClick.emit(this.data);

    // Navigate to detail page
    const { id, domain } = this.data;
    this.router.navigate(['/data-product-detail', { id, domain }]);
  }

  toggleSubscription() {
    if (this.isSubscribed) {
      this.onUnsubscribe.emit(this.data);
    } else {
      this.onSubscribe.emit(this.data);
    }
    this.isSubscribed = !this.isSubscribed;
  }

  viewMetrics() {
    console.log('View metrics for:', this.data.name);
    // Implement metrics view
  }

  viewAPI() {
    console.log('View API documentation for:', this.data.name);
    // Implement API documentation view
  }

  // Domain-related helper methods
  getDomainLabel(domain: string): string {
    const domainLabels = {
      'customer': 'Customer Analytics',
      'sales': 'Sales Intelligence',
      'marketing': 'Marketing Insights',
      'finance': 'Financial Reporting',
      'operations': 'Operations Data',
      'product': 'Product Analytics'
    };
    return domainLabels[domain] || domain;
  }

  getDomainIcon(domain: string): string {
    const domainIcons = {
      'customer': 'pi pi-users',
      'sales': 'pi pi-chart-line',
      'marketing': 'pi pi-megaphone',
      'finance': 'pi pi-dollar',
      'operations': 'pi pi-cog',
      'product': 'pi pi-box'
    };
    return domainIcons[domain] || 'pi pi-database';
  }

  getDomainIconClass(domain: string): string {
    const domainClasses = {
      'customer': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'sales': 'bg-gradient-to-br from-green-500 to-green-600',
      'marketing': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'finance': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'operations': 'bg-gradient-to-br from-red-500 to-red-600',
      'product': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    };
    return domainClasses[domain] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  }

  // Status-related helper methods
  getStatusLabel(status: string): string {
    const statusLabels = {
      'active': 'Active',
      'development': 'In Development',
      'beta': 'Beta',
      'deprecated': 'Deprecated'
    };
    return statusLabels[status] || status;
  }

  getStatusSeverity(status: string): string {
    const statusSeverities = {
      'active': 'success',
      'development': 'warning',
      'beta': 'info',
      'deprecated': 'danger'
    };
    return statusSeverities[status] || 'secondary';
  }
}
