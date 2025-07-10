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
import { Tag } from 'primeng/tag';
import { AppBaseComponent } from '../../../core/base/app-base.component';
import { DataProductServices } from '../../../core/services/data.product.services';
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
    Tag
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

  constructor(
    private injector: Injector,
    private dataProdServices: DataProductServices,
    private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer
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

  contactOwner() {
    console.log('Contact owner:', this.dataProduct.owner);
  }
}
