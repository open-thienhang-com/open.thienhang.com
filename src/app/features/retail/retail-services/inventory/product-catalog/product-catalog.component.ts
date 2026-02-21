import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';

// Sub-components
import { ProductMasterComponent } from './product-master/product-master.component';
import { ProductVariantsComponent } from './product-variants/product-variants.component';
import { SupplierIntegrationComponent } from './supplier-integration/supplier-integration.component';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    BadgeModule,
    ProductMasterComponent,
    ProductVariantsComponent,
    SupplierIntegrationComponent
  ],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.scss'
})
export class ProductCatalogComponent implements OnInit {
  activeTabIndex = 0;

  catalogStats = {
    totalProducts: 1247,
    activeProducts: 1156,
    inactiveProducts: 91,
    totalCategories: 45,
    totalSuppliers: 28,
    totalVariants: 342
  };

  ngOnInit() {
    // Load initial data if needed
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
  }
}
