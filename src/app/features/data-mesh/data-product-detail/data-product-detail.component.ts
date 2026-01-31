import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProductServices, DataProduct } from '../../../core/services/data.product.services';
import { LoadingService } from '../../../core/services/loading.service';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-data-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    TabViewModule,
    TableModule,
    ToastModule,
    BadgeModule,
    ChipModule,
    ProgressBarModule,
    TooltipModule,
    PanelModule,
    AccordionModule,
    DividerModule,
    SkeletonModule
  ],
  templateUrl: './data-product-detail.component.html',
  styleUrls: ['./data-product-detail.component.scss'],
  providers: [MessageService]
})
export class DataProductDetailComponent implements OnInit {
  dataProduct: DataProduct | null = null;
  loading = false;
  error: string | null = null;
  activeTab = 0;

  // For Swagger/OpenAPI display
  swaggerUrl: SafeResourceUrl | null = null;
  openapiUrl: SafeResourceUrl | null = null;
  swaggerLoading = false;
  swaggerError = false;

  // Domain type configurations
  domainConfigs = {
    hotel: {
      icon: 'pi-building',
      color: '#FF6B6B'
    },
    finance: {
      icon: 'pi-dollar',
      color: '#4ECDC4'
    },
    retail: {
      icon: 'pi-shopping-cart',
      color: '#45B7D1'
    },
    healthcare: {
      icon: 'pi-heart',
      color: '#96CEB4'
    },
    logistics: {
      icon: 'pi-truck',
      color: '#FFEAA7'
    },
    default: {
      icon: 'pi-database',
      color: '#A8A8A8'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataProductServices: DataProductServices,
    private loadingService: LoadingService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const { domain, id, name } = params;
      
      if (name) {
        // Handle single name parameter (like 'hotel')
        this.loadDataProductByName(name);
      } else if (domain && id) {
        // Handle domain/id parameter combination
        this.loadDataProductDetails(domain, id);
      } else {
        this.error = 'Invalid parameters provided';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid data product parameters'
        });
      }
    });

  }

  private loadDataProductByName(name: string): void {
    this.loading = true;
    this.error = null;

    // Use the name as ID for backward compatibility
    this.dataProductServices.getDataProductDetail(name).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.success && response.data) {
          this.dataProduct = response.data;
          this.setupSwaggerUrls();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.dataProduct.name} data product details`
          });
        } else {
          this.error = response.message || 'Failed to load data product details';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.error
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'An error occurred while loading data product details';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.error
        });
      }
    });
  }

  private loadDataProductDetails(domain: string, id: string): void {
    this.loading = true;
    this.error = null;

    this.dataProductServices.getDataProductDetail(id, domain).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.success && response.data) {
          this.dataProduct = response.data;
          this.setupSwaggerUrls();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.dataProduct.name} data product details`
          });
        } else {
          this.error = response.message || 'Failed to load data product details';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.error
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'An error occurred while loading data product details';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.error
        });
      }
    });
  }

  private setupSwaggerUrls(): void {
    if (this.dataProduct) {
      if (this.dataProduct.swagger) {
        this.swaggerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dataProduct.swagger);
        this.checkSwaggerUrl(this.dataProduct.swagger);
      }
      if (this.dataProduct.openapi) {
        this.openapiUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dataProduct.openapi);
      }
    }
  }

  private checkSwaggerUrl(url: string): void {
    this.swaggerLoading = true;
    this.swaggerError = false;
    
    // Create a test request to check if Swagger documentation exists
    fetch(url)
      .then(response => {
        this.swaggerLoading = false;
        if (!response.ok) {
          this.swaggerError = true;
        }
      })
      .catch(() => {
        this.swaggerLoading = false;
        this.swaggerError = true;
      });
  }

  getDomainConfig() {
    if (this.dataProduct?.domain) {
      return this.domainConfigs[this.dataProduct.domain as keyof typeof this.domainConfigs] || this.domainConfigs.default;
    }
    return this.domainConfigs.default;
  }

  getDefaultValue(value: any, defaultText: string = 'N/A'): string {
    if (value === null || value === undefined || value === '') {
      return defaultText;
    }
    if (Array.isArray(value) && value.length === 0) {
      return defaultText;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return defaultText;
    }
    return value.toString();
  }

  hasValue(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    return true;
  }

  onTabChange(event: any): void {
    this.activeTab = event.index;
  }

  navigateBack(): void {
    this.router.navigate(['/data-mesh/data-products']);
  }

  subscribeToProduct(): void {
    if (this.dataProduct) {
      this.dataProductServices.subscribeToProduct(this.dataProduct.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Successfully subscribed to ${this.dataProduct!.name}`,
              life: 3000
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to subscribe to product',
              life: 3000
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to subscribe to product',
            life: 3000
          });
        }
      });
    }
  }

  unsubscribeFromProduct(): void {
    if (this.dataProduct) {
      this.dataProductServices.unsubscribeFromProduct(this.dataProduct.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Successfully unsubscribed from ${this.dataProduct!.name}`,
              life: 3000
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to unsubscribe from product',
              life: 3000
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to unsubscribe from product',
            life: 3000
          });
        }
      });
    }
  }

  getSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'healthy':
      case 'get':
        return 'success';
      case 'inactive':
      case 'unhealthy':
      case 'delete':
        return 'danger';
      case 'pending':
      case 'post':
        return 'warning';
      case 'put':
      case 'patch':
        return 'info';
      default:
        return 'info';
    }
  }

  getQualityColor(score: string): string {
    if (!score) return '#6B7280';
    const numScore = parseFloat(score.replace('%', ''));
    if (numScore >= 95) return '#10B981';
    if (numScore >= 90) return '#3B82F6';
    if (numScore >= 85) return '#F59E0B';
    return '#EF4444';
  }

  getQualityScore(metrics: any): string {
    if (!metrics) return 'N/A';
    return metrics.accuracy || metrics.quality_score || 'N/A';
  }

  getOwnerDisplayName(): string {
    if (this.dataProduct?.owner) {
      const owner = this.dataProduct.owner;
      if (owner.first_name && owner.last_name) {
        return `${owner.first_name} ${owner.last_name}`;
      } else if (owner.first_name) {
        return owner.first_name;
      } else if (owner.email) {
        return owner.email;
      }
    }
    return 'Not assigned';
  }

  getOwnerEmail(): string {
    return this.dataProduct?.owner?.email || 'Not provided';
  }

  getCompanyName(): string {
    return this.dataProduct?.owner?.company || 'Not provided';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'warning';
      case 'draft': return 'info';
      default: return 'success';
    }
  }
}
