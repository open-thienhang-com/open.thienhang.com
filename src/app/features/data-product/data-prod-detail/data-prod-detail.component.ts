import { AfterViewInit, Component, Injector, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { DataProductServices } from '../../../core/services/data.product.services';
import { I18nService } from '../../../core/services/i18n.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-data-prod-detail',
  imports: [
    CommonModule,
    TabViewModule,
    TableModule,
    ProgressBarModule,
    ChartModule,
    CardModule,
    TooltipModule,
    Button,
    Badge,
    AccordionModule,
    DividerModule,
    PanelModule
  ],
  templateUrl: './data-prod-detail.component.html',
  styleUrl: './data-prod-detail.component.scss'
})
export class DataProdDetailComponent extends AppBaseComponent implements AfterViewInit, OnInit {
  @Input() product: any = {};
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubscribe = new EventEmitter<any>();
  @Output() onUnsubscribe = new EventEmitter<any>();

  dataProduct: any = {};
  isSubscribed: boolean = false;
  usageChart: any;
  qualityChart: any;
  
  // Hotel-specific API endpoints
  hotelApiEndpoints = {
    metadata: [
      { method: 'GET', path: '/version', description: 'Get Version', icon: 'pi pi-info-circle' },
      { method: 'GET', path: '/overview', description: 'Get Overview', icon: 'pi pi-chart-bar' },
      { method: 'GET', path: '/quality', description: 'Get Quality Metrics', icon: 'pi pi-star' },
      { method: 'GET', path: '/cost', description: 'Get Cost Information', icon: 'pi pi-dollar' },
      { method: 'GET', path: '/features', description: 'Get Features', icon: 'pi pi-list' },
      { method: 'GET', path: '/summary', description: 'Get Summary', icon: 'pi pi-file-text' },
      { method: 'GET', path: '/health-check', description: 'Health check', icon: 'pi pi-heart' }
    ],
    apartments: [
      { method: 'POST', path: '/apartment', description: 'Create apartment', icon: 'pi pi-plus' },
      { method: 'GET', path: '/apartment/{apartment_id}', description: 'Get apartment by ID', icon: 'pi pi-eye' },
      { method: 'PUT', path: '/apartment/{apartment_id}', description: 'Update apartment', icon: 'pi pi-pencil' },
      { method: 'DELETE', path: '/apartment/{apartment_id}', description: 'Delete apartment', icon: 'pi pi-trash' },
      { method: 'GET', path: '/apartments', description: 'List all apartments', icon: 'pi pi-list' }
    ],
    rooms: [
      { method: 'POST', path: '/room', description: 'Create room', icon: 'pi pi-plus' },
      { method: 'GET', path: '/room/{room_id}', description: 'Get room by ID', icon: 'pi pi-eye' },
      { method: 'PUT', path: '/room/{room_id}', description: 'Update room', icon: 'pi pi-pencil' },
      { method: 'DELETE', path: '/room/{room_id}', description: 'Delete room', icon: 'pi pi-trash' },
      { method: 'GET', path: '/rooms', description: 'List all rooms', icon: 'pi pi-list' }
    ],
    bookings: [
      { method: 'POST', path: '/booking', description: 'Create booking', icon: 'pi pi-plus' },
      { method: 'GET', path: '/booking/{booking_id}', description: 'Get booking by ID', icon: 'pi pi-eye' },
      { method: 'PUT', path: '/booking/{booking_id}', description: 'Update booking', icon: 'pi pi-pencil' },
      { method: 'DELETE', path: '/booking/{booking_id}', description: 'Delete booking', icon: 'pi pi-trash' },
      { method: 'GET', path: '/bookings', description: 'List all bookings', icon: 'pi pi-list' },
      { method: 'PATCH', path: '/booking/{booking_id}/cancel', description: 'Cancel booking', icon: 'pi pi-times' }
    ],
    ratings: [
      { method: 'POST', path: '/rating', description: 'Create rating', icon: 'pi pi-plus' },
      { method: 'GET', path: '/rating/{rating_id}', description: 'Get rating by ID', icon: 'pi pi-eye' },
      { method: 'PUT', path: '/rating/{rating_id}', description: 'Update rating', icon: 'pi pi-pencil' },
      { method: 'DELETE', path: '/rating/{rating_id}', description: 'Delete rating', icon: 'pi pi-trash' },
      { method: 'GET', path: '/ratings', description: 'List all ratings', icon: 'pi pi-list' }
    ],
    reviews: [
      { method: 'POST', path: '/review', description: 'Create review', icon: 'pi pi-plus' },
      { method: 'GET', path: '/review/{review_id}', description: 'Get review by ID', icon: 'pi pi-eye' },
      { method: 'PUT', path: '/review/{review_id}', description: 'Update review', icon: 'pi pi-pencil' },
      { method: 'DELETE', path: '/review/{review_id}', description: 'Delete review', icon: 'pi pi-trash' },
      { method: 'GET', path: '/reviews', description: 'List all reviews', icon: 'pi pi-list' }
    ]
  };

  constructor(
    private injector: Injector,
    private dataProdServices: DataProductServices,
    private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private i18nService: I18nService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.setupCharts();
    // Use input product if provided, otherwise load from route
    if (this.product && this.product.id) {
      this.dataProduct = this.product;
    }
  }

  ngAfterViewInit() {
    // Only load from route if no product input provided
    if (!this.product || !this.product.id) {
      this.activeRoute.params.subscribe(params => {
        const { id, domain } = params;
        this.dataProdServices.getDataProductDetail(id, domain).subscribe(res => {
          this.dataProduct = {
            ...res,
            swagger: this.sanitizer.bypassSecurityTrustResourceUrl(res['swagger'])
          }
        })
      })
    }
  }

  setupCharts() {
    // Usage Chart
    this.usageChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Monthly Queries',
          data: [8500, 9200, 10100, 11500, 12800, 12500],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    };

    // Quality Chart
    this.qualityChart = {
      labels: ['Data Completeness', 'Data Accuracy', 'Data Consistency', 'Data Timeliness', 'Data Validity'],
      datasets: [
        {
          data: [98, 96, 99, 97, 95],
          backgroundColor: [
            '#10B981',
            '#3B82F6',
            '#8B5CF6',
            '#F59E0B',
            '#EF4444'
          ]
        }
      ]
    };
  }

  closeModal() {
    // Emit close event to parent component
    this.onClose.emit();
  }

  toggleSubscription() {
    if (this.isSubscribed) {
      this.onUnsubscribe.emit(this.dataProduct);
    } else {
      this.onSubscribe.emit(this.dataProduct);
    }
    this.isSubscribed = !this.isSubscribed;
  }

  // Prevent event bubbling on modal content clicks
  onModalContentClick(event: Event) {
    event.stopPropagation();
  }

  getDomainIcon(domain: string): string {
    const domainIcons = {
      'hotel': 'pi pi-building',
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
      'hotel': 'bg-gradient-to-br from-amber-500 to-orange-600',
      'customer': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'sales': 'bg-gradient-to-br from-green-500 to-green-600',
      'marketing': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'finance': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'operations': 'bg-gradient-to-br from-red-500 to-red-600',
      'product': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    };
    return domainClasses[domain] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  }

  getDomainLabel(domain: string): string {
    const domainLabels = {
      'hotel': 'Hotel Management',
      'customer': 'Customer Analytics',
      'sales': 'Sales Intelligence',
      'marketing': 'Marketing Insights',
      'finance': 'Financial Reporting',
      'operations': 'Operations Data',
      'product': 'Product Analytics'
    };
    return domainLabels[domain] || domain;
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  downloadSchema() {
    console.log('Download schema for:', this.dataProduct.name);
  }

  accessAPI() {
    console.log('Access API for:', this.dataProduct.name);
  }

  viewAssets() {
    // Navigate to Swagger documentation
    window.open('https://app.swaggerhub.com/apis/your-api/hotel-management/1.0.0', '_blank');
  }

  contactOwner() {
    console.log('Contact owner:', this.dataProduct.owner);
  }

  // Translation method
  t(key: string): string {
    return this.i18nService.translate(key);
  }

  // Hotel-specific methods
  getMethodSeverity(method: string): string {
    const severities = {
      'GET': 'success',
      'POST': 'info',
      'PUT': 'warning',
      'DELETE': 'danger',
      'PATCH': 'secondary'
    };
    return severities[method] || 'secondary';
  }

  getApiCategoryIcon(category: string): string {
    const icons = {
      'metadata': 'pi pi-info-circle',
      'apartments': 'pi pi-building',
      'rooms': 'pi pi-home',
      'bookings': 'pi pi-calendar',
      'ratings': 'pi pi-star',
      'reviews': 'pi pi-comments'
    };
    return icons[category] || 'pi pi-cog';
  }

  getApiCategoryColor(category: string): string {
    const colors = {
      'metadata': 'text-blue-600',
      'apartments': 'text-amber-600',
      'rooms': 'text-green-600',
      'bookings': 'text-purple-600',
      'ratings': 'text-orange-600',
      'reviews': 'text-indigo-600'
    };
    return colors[category] || 'text-gray-600';
  }

  testEndpoint(endpoint: any) {
    console.log('Testing endpoint:', endpoint.method, endpoint.path);
    // Here you would typically make an API call to test the endpoint
  }

  copyEndpointUrl(endpoint: any) {
    const baseUrl = '/data-mesh/domains/hotel';
    const fullUrl = `${baseUrl}${endpoint.path}`;
    navigator.clipboard.writeText(fullUrl);
    console.log('Copied to clipboard:', fullUrl);
  }

  getHotelFeatures() {
    return [
      { name: 'Apartment Management', description: 'Comprehensive apartment booking and management system', icon: 'pi pi-building' },
      { name: 'Room Operations', description: 'Real-time room availability and booking management', icon: 'pi pi-home' },
      { name: 'Booking System', description: 'Complete booking lifecycle management with cancellation support', icon: 'pi pi-calendar' },
      { name: 'Rating & Reviews', description: 'Customer feedback and rating management system', icon: 'pi pi-star' },
      { name: 'Quality Metrics', description: 'Data quality monitoring and performance tracking', icon: 'pi pi-chart-bar' },
      { name: 'Cost Analytics', description: 'Financial reporting and cost analysis tools', icon: 'pi pi-dollar' }
    ];
  }

  openSwagger() {
    if (this.dataProduct.swagger) {
      window.open(this.dataProduct.swagger, '_blank');
    } else {
      console.error('Swagger URL is not available');
    }
  }

  // Add startDemo method
  startDemo() {
    console.log('Demo started for:', this.dataProduct.name || this.product.name);
  }
}
