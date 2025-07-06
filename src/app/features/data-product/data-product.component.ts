import {Component, Injector, OnInit} from '@angular/core';
import {AppBaseComponent} from '../../core/base/app-base.component';
import {DataProdItemComponent} from './data-prod-item/data-prod-item.component';
import {DataProductServices} from '../../core/services/data.product.services';

@Component({
  selector: 'app-data-product',
  imports: [
    DataProdItemComponent
  ],
  templateUrl: './data-product.component.html',
  standalone: true,
})
export class DataProductComponent extends AppBaseComponent implements OnInit {
  dataProds: any[] = [ ]

  constructor(private injector: Injector, private dataProdServices: DataProductServices) {
    super(injector);
  }
  ngOnInit() {
    this.dataProdServices.getDataProducts({}).subscribe(res => {
      this.dataProds = res.data;
    })
  }
}
