import { Component } from '@angular/core';
import {AppBaseComponent} from '../../core/base/app-base.component';
import {DataProdItemComponent} from './data-prod-item/data-prod-item.component';

@Component({
  selector: 'app-data-product',
  imports: [
    DataProdItemComponent
  ],
  templateUrl: './data-product.component.html',
  standalone: true,
})
export class DataProductComponent extends AppBaseComponent {
  dataProds = [
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: '  actionable insights into the profitability of each article.',
      tags: ['demo'],
      color: 'red'
    },
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: ' PowerBI report that combines revenue, cost, and margin to deliver PowerBI report that combines revenue, cost, and margin to deliverPowerBI report that combines revenue, cost, and margin to deliver actionable insights into the profitability of each article.',
      tags: ['demo']
    },
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: ' PowerBI report that combines revenue, cost, and margin to deliver actionable insights into the profitability of each article.',
      tags: ['demo']
    },
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: ' PowerBI report that combines revenue, cost, and margin to deliver actionable insights into the profitability of PowerBI report that combines revenue, cost, and margin to deliverPowerBI report that combines revenue, cost, and margin to deliverPowerBI report that combines revenue, cost, and margin to deliverPowerBI report that combines revenue, cost, and margin to delivereach article.',
      tags: ['demo']
    },
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: ' PowerBI report that combines revenue, cost, and margin to deliver actionable insights into the profitability of each article.',
      tags: ['demo']
    },
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: ' PowerBI report that combines revenue, cost, and margin to deliver actionable insights into the profitability of each article.',
      tags: ['demo']
    },
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: ' PowerBI report that combines revenue, cost, and margin to deliver actionable insights into the profitability of each PowerBI report that combines revenue, cost, and margin to deliver article.',
      tags: ['demo']
    },
    {
      type: 'DATA CONSUMER',
      title: 'Article Profitability Analysis',
      team: 'Controlling Team',
      description: ' PowerBI report that combines revenue, cost, and margin to deliver actionable insights into the profitability of each PowerBI report that combines revenue, cost, and margin to deliverPowerBI report that combines revenue, cost, and margin to deliver article.',
      tags: ['demo']
    },
  ]
}
