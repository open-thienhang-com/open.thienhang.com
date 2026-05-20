import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { ApiModuleData, HttpMethod } from './api-module.model';
import { API_MODULES } from './api-modules.data';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  selectedNodes: TreeNode[] = [];
  selectedModule: ApiModuleData | null = null;
  searchTerm: string = '';

  readonly allModules = API_MODULES;

  get totalEndpoints(): number {
    return API_MODULES.reduce((sum, m) => sum + m.endpoints.length, 0);
  }

  get platformModules(): ApiModuleData[] {
    return API_MODULES.filter(m => m.type === 'Platform');
  }

  get domainAdapters(): ApiModuleData[] {
    return API_MODULES.filter(m => m.type === 'Domain Adapter');
  }

  get filteredTreeData(): TreeNode[] {
    if (!this.searchTerm) return this.treeData;
    const search = this.searchTerm.toLowerCase();
    return this.filterTree(this.treeData, search);
  }

  private filterTree(nodes: TreeNode[], search: string): TreeNode[] {
    return nodes
      .map(node => {
        const cloned = { ...node };
        if (cloned.children) {
          cloned.children = this.filterTree(cloned.children, search);
        }
        const mod: ApiModuleData | undefined = node.data?.module;
        const matchesLabel = (node.label || '').toLowerCase().includes(search);
        const matchesDesc = mod?.description?.toLowerCase().includes(search);
        const matchesEndpoint = mod?.endpoints.some(e => e.path.toLowerCase().includes(search) || e.description.toLowerCase().includes(search));
        const hasMatchingChildren = cloned.children && cloned.children.length > 0;

        if (matchesLabel || matchesDesc || matchesEndpoint || hasMatchingChildren) {
          if (cloned.children) cloned.expanded = true;
          return cloned;
        }
        return null;
      })
      .filter((n): n is TreeNode => n !== null);
  }

  treeData: TreeNode[] = [];

  ngOnInit(): void {
    this.treeData = this.buildTree();
  }

  private buildTree(): TreeNode[] {
    return [
      {
        key: 'platform',
        label: 'Platform Modules',
        icon: 'pi pi-server',
        selectable: false,
        expanded: true,
        children: API_MODULES.filter(m => m.type === 'Platform').map(m => this.toTreeNode(m))
      },
      {
        key: 'domain-adapters',
        label: 'Domain Adapters',
        icon: 'pi pi-th-large',
        selectable: false,
        expanded: true,
        children: API_MODULES.filter(m => m.type === 'Domain Adapter').map(m => this.toTreeNode(m))
      }
    ];
  }

  private toTreeNode(m: ApiModuleData): TreeNode {
    return {
      key: m.key,
      label: m.name,
      icon: m.icon,
      data: { module: m },
      leaf: true
    };
  }

  onNodeSelect(event: any): void {
    const node = event.node as TreeNode;
    this.selectedNodes = [node];
    this.selectedModule = node.data?.module ?? null;
  }

  clearSelection(): void {
    this.selectedNodes = [];
    this.selectedModule = null;
  }

  getMethodClass(method: HttpMethod): string {
    const map: Record<HttpMethod, string> = {
      GET: 'method-get',
      POST: 'method-post',
      PUT: 'method-put',
      PATCH: 'method-patch',
      DELETE: 'method-delete'
    };
    return map[method];
  }

  getTypeBadgeClass(type: string): string {
    return type === 'Platform' ? 'badge-platform' : 'badge-adapter';
  }

  getStatusBadgeClass(status: string): string {
    return `badge-status-${status}`;
  }
}
