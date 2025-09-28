import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'component' | 'feature' | 'documentation';
  url: string;
  category: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchResults = new BehaviorSubject<SearchResult[]>([]);
  private isSearching = new BehaviorSubject<boolean>(false);

  public searchResults$: Observable<SearchResult[]> = this.searchResults.asObservable();
  public isSearching$: Observable<boolean> = this.isSearching.asObservable();

  private searchIndex: SearchResult[] = [
    // Dashboard & Overview
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Main dashboard with data mesh overview and metrics',
      type: 'page',
      url: '/dashboard',
      category: 'Overview',
      tags: ['dashboard', 'overview', 'metrics', 'analytics']
    },

    // Retail Services
    {
      id: 'retail-overview',
      title: 'Retail Services Overview',
      description: 'Manage retail operations and services',
      type: 'page',
      url: '/retail',
      category: 'Retail',
      tags: ['retail', 'services', 'overview']
    },
    {
      id: 'inventory-management',
      title: 'Inventory Management',
      description: 'Complete inventory management system',
      type: 'feature',
      url: '/retail/inventory',
      category: 'Retail',
      tags: ['inventory', 'products', 'stock', 'management']
    },
    {
      id: 'inventory-products',
      title: 'Products',
      description: 'Manage product catalog and inventory',
      type: 'page',
      url: '/retail/inventory/products',
      category: 'Retail',
      tags: ['products', 'catalog', 'inventory']
    },
    {
      id: 'inventory-movements',
      title: 'Stock Movements',
      description: 'Track inventory movements and transactions',
      type: 'page',
      url: '/retail/inventory/movements',
      category: 'Retail',
      tags: ['movements', 'stock', 'transactions']
    },

    // Data Mesh
    {
      id: 'data-mesh',
      title: 'Data Mesh',
      description: 'Data mesh architecture and management',
      type: 'feature',
      url: '/data-mesh',
      category: 'Data Mesh',
      tags: ['data', 'mesh', 'architecture']
    },
    {
      id: 'data-products',
      title: 'Data Products',
      description: 'Browse and manage data products',
      type: 'page',
      url: '/data-mesh/data-products',
      category: 'Data Mesh',
      tags: ['data', 'products', 'catalog']
    },
    {
      id: 'data-contracts',
      title: 'Data Contracts',
      description: 'Manage data contracts and agreements',
      type: 'page',
      url: '/data-contracts',
      category: 'Data Mesh',
      tags: ['contracts', 'agreements', 'data']
    },

    // Governance
    {
      id: 'governance',
      title: 'Data Governance',
      description: 'Data governance and policy management',
      type: 'feature',
      url: '/governance',
      category: 'Governance',
      tags: ['governance', 'policies', 'security']
    },
    {
      id: 'policies',
      title: 'Policies',
      description: 'Data policies and compliance rules',
      type: 'page',
      url: '/governance/policies',
      category: 'Governance',
      tags: ['policies', 'compliance', 'rules']
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      description: 'User roles and access permissions',
      type: 'page',
      url: '/governance/roles',
      category: 'Governance',
      tags: ['roles', 'permissions', 'access']
    },

    // Settings
    {
      id: 'settings',
      title: 'Settings',
      description: 'Application settings and configuration',
      type: 'page',
      url: '/settings',
      category: 'System',
      tags: ['settings', 'configuration', 'preferences']
    },

    // Marketplace
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Data marketplace and integrations',
      type: 'feature',
      url: '/marketplace',
      category: 'Marketplace',
      tags: ['marketplace', 'integrations', 'data']
    },
    {
      id: 'marketplace-domains',
      title: 'Domain Catalog',
      description: 'Browse and manage data domains',
      type: 'page',
      url: '/marketplace/domains',
      category: 'Marketplace',
      tags: ['domains', 'catalog', 'data', 'management']
    },

    // Documentation
    {
      id: 'documentation',
      title: 'Documentation',
      description: 'API documentation and guides',
      type: 'documentation',
      url: '/docs',
      category: 'Support',
      tags: ['docs', 'api', 'guides', 'help']
    }
  ];

  constructor() {}

  performGlobalSearch(query: string): void {
    if (!query || query.trim().length < 2) {
      this.searchResults.next([]);
      return;
    }

    this.isSearching.next(true);

    const searchTerm = query.toLowerCase().trim();
    const results = this.searchIndex.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = item.description.toLowerCase().includes(searchTerm);
      const categoryMatch = item.category.toLowerCase().includes(searchTerm);
      const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false;

      return titleMatch || descriptionMatch || categoryMatch || tagsMatch;
    });

    // Sort by relevance (title matches first, then description, then tags)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchTerm);
      const bTitle = b.title.toLowerCase().includes(searchTerm);

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;

      return 0;
    });

    // Simulate async search delay
    setTimeout(() => {
      this.searchResults.next(results);
      this.isSearching.next(false);
    }, 300);
  }

  clearSearch(): void {
    this.searchResults.next([]);
    this.isSearching.next(false);
  }

  getRecentSearches(): string[] {
    // In a real app, this would come from localStorage or a service
    return ['dashboard', 'inventory', 'policies', 'data products'];
  }

  getPopularSearches(): SearchResult[] {
    // Return most commonly accessed items
    return this.searchIndex.filter(item =>
      ['dashboard', 'inventory-management', 'data-products', 'policies', 'marketplace', 'marketplace-domains'].includes(item.id)
    );
  }
}