import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  @Input() items: BreadcrumbItem[] = [];
  @Input() separator: string = '/';

  ngOnInit() {
    // Auto-generate breadcrumbs if none provided
    if (!this.items || this.items.length === 0) {
      this.generateBreadcrumbsFromRoute();
    }
  }

  private generateBreadcrumbsFromRoute(): void {
    // This would typically use ActivatedRoute to generate breadcrumbs
    // For now, we'll create a simple implementation
    this.items = [
      { label: 'Home', url: '/' },
      { label: 'Dashboard', url: '/dashboard' }
    ];
  }
}