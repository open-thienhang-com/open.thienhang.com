import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getApiBase } from '../../../core/config/api-config';

// PrimeNG imports
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-api-documentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ButtonModule,
    TagModule,
    ChipModule,
    TabViewModule
  ],
  templateUrl: './api-documentation.component.html',
  styleUrls: ['./api-documentation.component.scss'],
  providers: [MessageService]
})
export class ApiDocumentationComponent implements OnInit {
  loading = false;
  activeTab = 0;

  constructor(
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Initialize component
  }

  downloadOpenAPI() {
  // Download OpenAPI specification
  window.open(`${getApiBase()}/openapi.json`, '_blank');
    this.messageService.add({
      severity: 'success',
      summary: 'Download Started',
      detail: 'OpenAPI specification download has started'
    });
  }

  openSwagger() {
  // Open Swagger UI
  window.open(`${getApiBase()}/docs`, '_blank');
    this.messageService.add({
      severity: 'info',
      summary: 'Swagger UI Opened',
      detail: 'Interactive API documentation opened in new tab'
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'API endpoint copied to clipboard'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Copy Failed',
        detail: 'Failed to copy to clipboard'
      });
    });
  }

  navigateToApiExplorer() {
    this.router.navigate(['/data-mesh/api-explorer']);
  }

  navigateToDataProducts() {
    this.router.navigate(['/data-mesh/data-products']);
  }

  navigateToDomainCatalog() {
    this.router.navigate(['/data-mesh/domain-catalog']);
  }
}
