import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

interface RetailService {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  status: 'active' | 'inactive' | 'maintenance';
  provider: string;
  lastUpdated: Date;
  tags: string[];
  rating: number;
  usageCount: number;
}

@Component({
  selector: 'app-retail-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './retail-services.component.html',
  styleUrl: './retail-services.component.scss'
})
export class RetailServicesComponent implements OnInit {
  retailServices: RetailService[] = [];
  filteredServices: RetailService[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedStatus: any = null;
  viewMode: 'grid' | 'list' = 'grid';
  loading = false;

  showServiceDialog = false;
  editingService: RetailService | null = null;

  activeTab = 'overview';
  activeSubTab = '';

  serviceCategories = [
    {
      key: 'overview',
      label: 'Overview',
      icon: 'pi pi-home',
      description: 'General overview of all retail services',
      submenus: []
    },
    {
      key: 'payment',
      label: 'Payment Processing',
      icon: 'pi pi-credit-card',
      description: 'Secure payment processing and gateway management',
      submenus: []
    },
    {
      key: 'inventory',
      label: 'Inventory Management',
      icon: 'pi pi-box',
      description: 'Real-time inventory tracking and management',
      submenus: [
        {
          key: 'overview',
          label: 'Overview',
          icon: 'pi pi-home',
          description: 'Inventory dashboard and alerts'
        },
        {
          key: 'products',
          label: 'Products',
          icon: 'pi pi-list',
          description: 'Product catalog and stock levels'
        },
        {
          key: 'movements',
          label: 'Movements',
          icon: 'pi pi-arrow-right-arrow-left',
          description: 'Stock in/out history and adjustments'
        },
        {
          key: 'suppliers',
          label: 'Suppliers',
          icon: 'pi pi-users',
          description: 'Supplier and customer management'
        },
        {
          key: 'locations',
          label: 'Locations',
          icon: 'pi pi-map-marker',
          description: 'Warehouse and location management'
        },
        {
          key: 'reports',
          label: 'Reports',
          icon: 'pi pi-chart-line',
          description: 'Inventory reports and analytics'
        },
        {
          key: 'support',
          label: 'Support',
          icon: 'pi pi-question-circle',
          description: 'Help and user support'
        },
        {
          key: 'settings',
          label: 'Settings',
          icon: 'pi pi-cog',
          description: 'Inventory system configuration'
        }
      ]
    },
    {
      key: 'analytics',
      label: 'Customer Analytics',
      icon: 'pi pi-chart-bar',
      description: 'Advanced customer behavior and analytics',
      submenus: []
    },
    {
      key: 'loyalty',
      label: 'Loyalty Programs',
      icon: 'pi pi-star',
      description: 'Customer loyalty and rewards management',
      submenus: []
    },
    {
      key: 'pos',
      label: 'POS Systems',
      icon: 'pi pi-shopping-cart',
      description: 'Point of sale and transaction management',
      submenus: []
    },
    {
      key: 'ecommerce',
      label: 'E-commerce',
      icon: 'pi pi-globe',
      description: 'Online retail and marketplace solutions',
      submenus: []
    }
  ];

  categoryOptions = [
    { label: 'All Categories', value: '' },
    { label: 'Payment Processing', value: 'payment' },
    { label: 'Inventory Management', value: 'inventory' },
    { label: 'Customer Analytics', value: 'analytics' },
    { label: 'Loyalty Programs', value: 'loyalty' },
    { label: 'POS Systems', value: 'pos' },
    { label: 'E-commerce', value: 'ecommerce' }
  ];

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadRetailServices();
    this.route.firstChild?.url.subscribe(url => {
      if (url.length > 0) {
        this.activeTab = url[0].path;
      } else {
        this.activeTab = 'overview';
      }
    });
  }

  navigateToCategory(categoryKey: string) {
    this.activeTab = categoryKey;
    this.activeSubTab = ''; // Reset submenu when changing main category
    if (categoryKey === 'overview') {
      this.router.navigate(['/retail']);
    } else {
      this.router.navigate([categoryKey], { relativeTo: this.route });
    }
  }

  navigateToSubmenu(submenuKey: string) {
    this.activeSubTab = submenuKey;
    this.router.navigate(['inventory', submenuKey], { relativeTo: this.route });
  }

  getCurrentCategory() {
    return this.serviceCategories.find(cat => cat.key === this.activeTab);
  }

  loadRetailServices() {
    this.loading = true;

    // Mock data - replace with actual API call
    setTimeout(() => {
      this.retailServices = [
        {
          id: '1',
          name: 'Advanced Payment Gateway',
          category: 'payment',
          description: 'Secure payment processing with multiple gateway support including credit cards, digital wallets, and cryptocurrencies.',
          price: 299,
          status: 'active',
          provider: 'Stripe Integration',
          lastUpdated: new Date('2024-01-15'),
          tags: ['payment', 'security', 'integration'],
          rating: 4.8,
          usageCount: 1250
        },
        {
          id: '2',
          name: 'Smart Inventory Tracker',
          category: 'inventory',
          description: 'Real-time inventory management with automated reordering, stock alerts, and predictive analytics.',
          price: 199,
          status: 'active',
          provider: 'InventoryPro',
          lastUpdated: new Date('2024-01-12'),
          tags: ['inventory', 'automation', 'analytics'],
          rating: 4.6,
          usageCount: 890
        },
        {
          id: '3',
          name: 'Customer Behavior Analytics',
          category: 'analytics',
          description: 'Advanced customer analytics platform with segmentation, churn prediction, and personalized recommendations.',
          price: 399,
          status: 'active',
          provider: 'DataInsights',
          lastUpdated: new Date('2024-01-10'),
          tags: ['analytics', 'customers', 'prediction'],
          rating: 4.9,
          usageCount: 675
        },
        {
          id: '4',
          name: 'Loyalty Program Manager',
          category: 'loyalty',
          description: 'Comprehensive loyalty program management with points system, rewards catalog, and customer engagement tools.',
          price: 249,
          status: 'maintenance',
          provider: 'LoyaltyMax',
          lastUpdated: new Date('2024-01-08'),
          tags: ['loyalty', 'rewards', 'engagement'],
          rating: 4.4,
          usageCount: 432
        },
        {
          id: '5',
          name: 'Cloud POS System',
          category: 'pos',
          description: 'Cloud-based point of sale system with inventory integration, employee management, and sales reporting.',
          price: 349,
          status: 'active',
          provider: 'CloudPOS',
          lastUpdated: new Date('2024-01-14'),
          tags: ['pos', 'cloud', 'sales'],
          rating: 4.7,
          usageCount: 1100
        }
      ];

      this.filteredServices = [...this.retailServices];
      this.loading = false;
    }, 1000);
  }

  applyFilters() {
    this.filteredServices = this.retailServices.filter(service => {
      const matchesSearch = !this.searchTerm ||
        service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.provider.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || service.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || service.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = null;
    this.filteredServices = [...this.retailServices];
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'info';
    }
  }

  getCategoryIcon(category: string): string {
    const icons = {
      'payment': 'pi pi-credit-card',
      'inventory': 'pi pi-box',
      'analytics': 'pi pi-chart-bar',
      'loyalty': 'pi pi-star',
      'pos': 'pi pi-shopping-cart',
      'ecommerce': 'pi pi-globe'
    };
    return icons[category] || 'pi pi-cog';
  }

  getCategoryLabel(category: string): string {
    const labels = {
      'payment': 'Payment Processing',
      'inventory': 'Inventory Management',
      'analytics': 'Customer Analytics',
      'loyalty': 'Loyalty Programs',
      'pos': 'POS Systems',
      'ecommerce': 'E-commerce'
    };
    return labels[category] || category;
  }

  editService(service: RetailService) {
    this.editingService = { ...service };
    this.showServiceDialog = true;
  }

  deleteService(event: Event, service: RetailService) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete service "${service.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.retailServices = this.retailServices.filter(s => s.id !== service.id);
        this.applyFilters();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Service deleted successfully'
        });
      }
    });
  }

  createService() {
    this.editingService = {
      id: '',
      name: '',
      category: '',
      description: '',
      price: 0,
      status: 'active',
      provider: '',
      lastUpdated: new Date(),
      tags: [],
      rating: 0,
      usageCount: 0
    };
    this.showServiceDialog = true;
  }

  saveService() {
    if (this.editingService) {
      if (this.editingService.id) {
        // Update existing
        const index = this.retailServices.findIndex(s => s.id === this.editingService!.id);
        if (index !== -1) {
          this.retailServices[index] = { ...this.editingService, lastUpdated: new Date() };
        }
      } else {
        // Create new
        this.editingService.id = Date.now().toString();
        this.retailServices.push({ ...this.editingService });
      }

      this.applyFilters();
      this.showServiceDialog = false;
      this.editingService = null;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Service saved successfully'
      });
    }
  }

  cancelEdit() {
    this.showServiceDialog = false;
    this.editingService = null;
  }

  refreshData() {
    this.loadRetailServices();
    this.messageService.add({
      severity: 'success',
      summary: 'Refreshed',
      detail: 'Data refreshed successfully'
    });
  }

  exportServices() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Exporting services data'
    });
  }

  getTotalServices() {
    return this.retailServices.length;
  }

  getActiveServices() {
    return this.retailServices.filter(s => s.status === 'active').length;
  }

  getTotalRevenue() {
    return this.retailServices.reduce((sum, service) => sum + service.price, 0);
  }

  get filteredCategoryOptions() {
    return this.categoryOptions.filter(opt => opt.value !== '');
  }

  get filteredStatusOptions() {
    return this.statusOptions.filter(opt => opt.value !== null);
  }
}
