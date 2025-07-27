import { Component } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

interface AssetNode {
  name: string;
  id?: string;
  children?: AssetNode[];
}

@Component({
  selector: 'app-sidebar-tree',
  standalone: true,
  imports: [MatTreeModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar-tree.component.html',
  styleUrls: ['./sidebar-tree.component.scss']
})
export class SidebarTreeComponent {
  treeControl = new NestedTreeControl<AssetNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<AssetNode>();

  treeData: AssetNode[] = [
    {
      name: 'Databricks',
      children: [
        { name: 'Sales Delta Table', id: 'asset1' },
        { name: 'Product Feature Store', id: 'asset2' }
      ]
    },
    {
      name: 'MongoDB',
      children: [
        { name: 'Customer Profiles', id: 'asset3' }
      ]
    },
    {
      name: 'Dashboard (Looker)',
      children: []
    }
  ];

  constructor() {
    this.dataSource.data = this.treeData;
  }

  hasChild = (_: number, node: AssetNode) => !!node.children && node.children.length > 0;

  onSelectAsset(node: AssetNode) {
    if (node.id) {
      // TODO: emit event or navigate to asset detail
      console.log('Selected asset:', node);
    }
  }
}
