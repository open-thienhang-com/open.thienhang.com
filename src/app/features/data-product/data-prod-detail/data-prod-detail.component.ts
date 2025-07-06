import {AfterViewInit, Component, Injector} from '@angular/core';
import {Card} from 'primeng/card';
import {Tag} from 'primeng/tag';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {DataProductServices} from '../../../core/services/data.product.services';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-data-prod-detail',
  imports: [
    Card,
    Tag
  ],
  templateUrl: './data-prod-detail.component.html',
  styleUrl: './data-prod-detail.component.scss'
})
export class DataProdDetailComponent extends AppBaseComponent implements AfterViewInit {
  dataProduct: any = {};

  constructor(
    private injector: Injector,
    private dataProdServices: DataProductServices,
    private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    super(injector);
  }

  ngAfterViewInit() {
    this.activeRoute.params.subscribe(params => {
      const {id, domain} = params;
      this.dataProdServices.getDataProductDetail(id, domain).subscribe(res => {
        this.dataProduct = {
          ...res,
          swagger: this.sanitizer.bypassSecurityTrustResourceUrl(res['swagger'])
        }
      })
    })
  }
}
