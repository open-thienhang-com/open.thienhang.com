import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataMeshServices, Domain, DataProduct, ApiInfo } from '../../../core/services/data-mesh.services';
import { LoadingService } from '../../../core/services/loading.service';
import { LoadingComponent } from '../../../shared/component/loading/loading.component';
import { MessageService } from 'primeng/api';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-domain-detail',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    BadgeModule,
    ChipModule,
    TabViewModule,
    TableModule,
    PanelModule,
    DividerModule,
    ProgressBarModule,
    TooltipModule
  ],
  templateUrl: './domain-detail.component.html',
  styleUrls: ['./domain-detail.component.scss'],
  providers: [MessageService]
})
export class DomainDetailComponent implements OnInit {
  domain: Domain | null = null;
  dataProducts: DataProduct[] = [];
  domainApis: ApiInfo[] = [];
  loading = false;
  domainKey = '';
  activeTab = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataMeshServices: DataMeshServices,
    private loadingService: LoadingService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.domainKey = params['domainKey'];
      if (this.domainKey) {
        this.loadDomainDetails();
      }
    });
  }

  loadDomainDetails(): void {
    this.loading = true;
    this.loadingService.showPageLoading(`Loading ${this.domainKey} domain details...`, 'data-flow');

    // Load domain details
    this.dataMeshServices.getDomainDetails(this.domainKey).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.domain = response.data;
          this.loadDomainDataProducts();
          this.loadDomainApis();
        } else {
          this.handleError('Failed to load domain details');
        }
      },
      error: (error) => {
        console.error('Error loading domain details:', error);
        // If detailed endpoint fails, create basic domain info
        this.createBasicDomainInfo();
      }
    });
  }

  createBasicDomainInfo(): void {
    this.domain = {
      domain_key: this.domainKey,
      name: this.formatDomainName(this.domainKey),
      display_name: this.formatDomainName(this.domainKey),
      status: 'Active',
      team: 'Unknown Team',
      owner: 'Unknown Owner',
      description: `${this.formatDomainName(this.domainKey)} domain services`,
      metrics: { subscribers: 0, quality_score: '85%' },
      tags: [this.domainKey.replace('_', ' ')],
      sla: { availability: '99.5%', freshness: 'Real-time', version: '1.0.0' },
      data_products: [],
      contact: { 
        email: `${this.domainKey}@company.com`, 
        slack: `#${this.domainKey}`, 
        support: `${this.domainKey}-support@company.com` 
      }
    };
    
    this.loadDomainDataProducts();
    this.loadDomainApis();
  }

  loadDomainDataProducts(): void {
    this.dataMeshServices.getDomainDataProducts(this.domainKey).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataProducts = response.data;
          if (this.domain) {
            this.domain.data_products = response.data;
          }
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading domain data products:', error);
        this.checkLoadingComplete();
      }
    });
  }

  loadDomainApis(): void {
    this.dataMeshServices.getApisByDomain(this.domainKey).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.domainApis = response.data;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading domain APIs:', error);
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete(): void {
    this.loading = false;
    this.loadingService.hide();
    
    if (this.domain) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Loaded details for ${this.domain.display_name}`
      });
    }
  }

  formatDomainName(domainKey: string): string {
    return domainKey.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  handleError(message: string): void {
    this.loading = false;
    this.loadingService.hide();
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }

  goBack(): void {
    this.router.navigate(['/data-mesh/domains']);
  }

  getQualityScoreSeverity(qualityScore: string): string {
    const score = parseFloat(qualityScore.replace('%', ''));
    if (score >= 95) return 'success';
    if (score >= 85) return 'info';
    if (score >= 75) return 'warning';
    return 'danger';
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      default: return 'info';
    }
  }

  getAvailabilityColor(availability: string): string {
    const percent = parseFloat(availability.replace('%', ''));
    if (percent >= 99.5) return 'success';
    if (percent >= 99) return 'info';
    if (percent >= 95) return 'warning';
    return 'danger';
  }

  getMethodSeverity(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET': return 'success';
      case 'POST': return 'info';
      case 'PUT': return 'warning';
      case 'DELETE': return 'danger';
      default: return 'secondary';
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'API endpoint copied to clipboard'
      });
    });
  }
}
