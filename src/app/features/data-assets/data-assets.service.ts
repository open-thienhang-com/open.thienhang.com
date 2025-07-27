import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataAssetsService {
  getTreeData() {
    return [
      {
        name: 'Databricks',
        children: [
          { name: 'Sales Delta Table', id: 'asset1', type: 'Databricks', description: 'Sales data in Delta format', owner: 'Data Team', tags: ['sales'], createdAt: '2024-01-01', updatedAt: '2025-07-01' },
          { name: 'Product Feature Store', id: 'asset2', type: 'Databricks', description: 'ML features for products', owner: 'ML Team', tags: ['ml'], createdAt: '2024-02-01', updatedAt: '2025-07-01' }
        ]
      },
      {
        name: 'MongoDB',
        children: [
          { name: 'Customer Profiles', id: 'asset3', type: 'MongoDB', description: 'Customer profile documents', owner: 'CRM', tags: ['customer'], createdAt: '2023-05-01', updatedAt: '2025-07-01' }
        ]
      },
      {
        name: 'Dashboard (Looker)',
        children: []
      }
    ];
  }

  getAssetById(id: string) {
    // In real app, fetch from API
    const all = this.getTreeData().flatMap(g => g.children || []);
    return all.find(a => a.id === id);
  }
}
