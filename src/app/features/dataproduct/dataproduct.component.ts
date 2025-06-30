import { Component, Injector } from '@angular/core';
import { StatCardComponent } from './stat-card/stat-card.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { DataProductServices } from '../../core/services/data.product.services';
import { AppBaseComponent } from '../../core/base/app-base.component';

@Component({
  selector: 'app-data-product',
  imports: [
    StatCardComponent,
    InfoCardComponent,
  ],
  templateUrl: './dataproduct.component.html',
  styleUrl: './dataproduct.component.scss'
})
export class DataProductComponent extends AppBaseComponent {
  dataProducts = []

  constructor(
    private injector: Injector,
    private governanceServices: DataProductServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getDataProducts();
  }

  getDataProducts = (page = 0) => {
    this.governanceServices.getDataProducts({ offset: page }).subscribe(res => {
      this.dataProducts = res.data
    })
  }
}
