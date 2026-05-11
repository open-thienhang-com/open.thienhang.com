import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DataProdDetailComponent } from '../data-product/data-prod-detail/data-prod-detail.component';
import { I18nService } from '../../core/services/i18n.service';
import { getApiBase } from '../../core/config/api-config';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DataProduct {
  id: string;
  name: string;
  domain: string;
  description: string;
  owner: string | null;
}

interface ApiResponse {
  data: DataProduct[];
  message: string;
  total: number;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    DialogModule,
    DataProdDetailComponent,
    FormsModule
  ],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss'
})
export class MarketplaceComponent implements OnInit {
  dataProducts: DataProduct[] = [];
  filteredProducts: DataProduct[] = [];
  loading = false;
  searchQuery = '';
  selectedDomain = '';
  selectedProduct: DataProduct | null = null;
  showProductDetail = false;

  domainOptions: { label: string; value: string }[] = [];

  constructor(
    private i18nService: I18nService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDataProducts();
    this.updateDomainOptions();
  }

  updateDomainOptions() {
    this.domainOptions = [
      { label: this.t('common.all') || 'All Domains', value: '' },
      { label: this.t('marketplace.domains.hotel.name'), value: 'hotel' },
      { label: this.t('marketplace.domains.device_detector.name'), value: 'device_detector' },
      { label: this.t('marketplace.domains.inventory.name'), value: 'inventory' },
      { label: this.t('marketplace.domains.files.name'), value: 'files' },
      { label: this.t('marketplace.domains.chat.name'), value: 'chat' },
      { label: this.t('marketplace.domains.blogger.name'), value: 'blogger' },
      { label: this.t('marketplace.domains.base.name'), value: 'base' },
      { label: this.t('marketplace.domains.application.name'), value: 'application' },
      { label: this.t('marketplace.domains.data_warehouse.name'), value: 'data_warehouse' },
      { label: this.t('marketplace.domains.storage.name'), value: 'storage' }
    ];
  }

  async loadDataProducts() {
    this.loading = true;
    try {
      const response = await this.http.get<ApiResponse>(
        `${getApiBase()}/data-mesh/data-products?size=10&offset=0`
      ).toPromise();

      if (response && response.data) {
        this.dataProducts = response.data;
        // Initially show all products
        this.filteredProducts = this.dataProducts;
      }
    } catch (error) {
      console.error('Error loading data products:', error);
    } finally {
      this.loading = false;
    }
  }

  getDomainIcon(domain: string): string {
    const domainIcons = {
      'hotel': 'pi pi-building',
      'device_detector': 'pi pi-mobile',
      'inventory': 'pi pi-box',
      'files': 'pi pi-folder',
      'chat': 'pi pi-comments',
      'blogger': 'pi pi-pencil',
      'base': 'pi pi-database',
      'application': 'pi pi-desktop',
      'data_warehouse': 'pi pi-server',
      'storage': 'pi pi-cloud'
    };
    return domainIcons[domain] || 'pi pi-circle';
  }

  getDomainColor(domain: string): string {
    const domainColors = {
      'hotel': 'bg-orange-500',
      'device_detector': 'bg-blue-500',
      'inventory': 'bg-green-500',
      'files': 'bg-purple-500',
      'chat': 'bg-pink-500',
      'blogger': 'bg-yellow-500',
      'base': 'bg-gray-500',
      'application': 'bg-indigo-500',
      'data_warehouse': 'bg-teal-500',
      'storage': 'bg-cyan-500'
    };
    return domainColors[domain] || 'bg-gray-500';
  }

  getDomainLabel(domain: string): string {
    return this.t(`marketplace.domains.${domain}.name`) || domain;
  }

  getDomainFeatures(domain: string): string[] {
    // Try to get domain-specific features from translations
    const featuresKey = `marketplace.domains.${domain}.features`;
    const domainTranslations = this.i18nService.getTranslations('marketplace');

    if (domainTranslations &&
      domainTranslations['domains'] &&
      domainTranslations['domains'][domain] &&
      domainTranslations['domains'][domain]['features']) {
      const features = domainTranslations['domains'][domain]['features'];
      if (typeof features === 'object') {
        return Object.values(features) as string[];
      }
    }

    // Default features for unknown domains
    return [
      this.t('marketplace.dataAccess'),
      this.t('marketplace.apiIntegration'),
      this.t('marketplace.documentation'),
      this.t('marketplace.monitoring'),
      this.t('marketplace.security')
    ];
  }

  openProductDetail(product: DataProduct) {
    // Preserve existing detail routing behavior: navigate to data-product detail route
    if (product?.domain && product?.id) {
      try { this.router.navigate(['/data-mesh/data-products', product.domain, product.id]); return; } catch (e) { /* ignore */ }
    }
    if (product?.id) {
      try { this.router.navigate(['/data-mesh/data-products', product.id]); return; } catch (e) { /* ignore */ }
    }
    // Fallback to dialog if navigation isn't possible
    this.selectedProduct = product;
    this.showProductDetail = true;
  }

  closeProductDetail() {
    this.showProductDetail = false;
    this.selectedProduct = null;
  }

  onSubscribe(product: DataProduct) {
    console.log('Subscribe to product:', product.name);
    // Implement subscription logic
  }

  onUnsubscribe(product: DataProduct) {
    console.log('Unsubscribe from product:', product.name);
    // Implement unsubscription logic
  }

  t(key: string): string {
    return this.i18nService.translate(key);
  }

  getFilteredProducts() {
    let filtered = this.dataProducts;

    // Filter by domain
    if (this.selectedDomain) {
      filtered = filtered.filter(product => product.domain === this.selectedDomain);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.domain.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    return filtered;
  }

  onDomainChange() {
    // Update filtered products when domain selection changes
    this.filteredProducts = this.getFilteredProducts();
  }

  getDomainStats() {
    const stats = this.dataProducts.reduce((acc, product) => {
      acc[product.domain] = (acc[product.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([domain, count]) => ({
      domain,
      count,
      label: this.getDomainLabel(domain)
    }));
  }

  getTotalProducts() {
    return this.dataProducts.length;
  }

  getActiveDomains() {
    return new Set(this.dataProducts.map(p => p.domain)).size;
  }
}
