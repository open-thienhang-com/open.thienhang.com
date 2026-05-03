import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppSwitcherService, AppKey } from '../../core/services/app-switcher.service';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, TreeModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  selectedNode: TreeNode | null = null;

  treeData: TreeNode[] = [
    {
      key: 'retail-root',
      label: 'Retail & Supply Chain',
      icon: 'pi pi-folder',
      selectable: false,
      expanded: true,
      children: [
        {
          key: 'planning',
          label: 'Planning & Forecasting',
          icon: 'pi pi-chart-line',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'planning-home',
              label: 'Planning Home',
              icon: 'pi pi-home',
              data: {
                route: '/planning',
                description: 'Open planning home and forecasting workbench'
              }
            },
            {
              key: 'planning-forecast-demand',
              label: 'Forecast Demand',
              icon: 'pi pi-line-chart',
              data: {
                route: '/planning/forecast/demand',
                description: 'Forecast demand scenarios'
              }
            },
            {
              key: 'planning-forecast-truck',
              label: 'Forecast Truck',
              icon: 'pi pi-truck',
              data: {
                route: '/planning/forecast/truck',
                description: 'Plan truck capacity and routes'
              }
            },
            {
              key: 'planning-forecast-trip',
              label: 'Forecast Trip',
              icon: 'pi pi-map',
              data: {
                route: '/planning/forecast/trip',
                description: 'Analyze trip forecasting'
              }
            },
            {
              key: 'planning-forecast-hub',
              label: 'Forecast Hub',
              icon: 'pi pi-sitemap',
              data: {
                route: '/planning/forecast/hub',
                description: 'Review hub-level forecasts'
              }
            },
            {
              key: 'planning-auto',
              label: 'Auto Planning',
              icon: 'pi pi-cog',
              data: {
                route: '/planning/auto-planning',
                description: 'Automated planning workflows'
              }
            },
            {
              key: 'planning-delivery-points',
              label: 'Delivery Points',
              icon: 'pi pi-map-marker',
              data: {
                route: '/planning/delivery-points',
                description: 'Manage delivery points and logistics'
              }
            },
            {
              key: 'planning-fleet',
              label: 'Fleet Management',
              icon: 'pi pi-truck',
              data: {
                route: '/planning/fleet',
                description: 'Manage planning fleet assets'
              }
            }
          ]
        },
        {
          key: 'inventory',
          label: 'Inventory Management',
          icon: 'pi pi-box',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'inventory-overview',
              label: 'Overview',
              icon: 'pi pi-fw pi-book',
              data: {
                route: '/inventory/overview',
                description: 'Inventory dashboard and stock overview'
              }
            },
            {
              key: 'inventory-products',
              label: 'Products',
              icon: 'pi pi-fw pi-tags',
              data: {
                route: '/inventory/products',
                description: 'Product catalog and details'
              }
            },
            {
              key: 'inventory-product-create',
              label: 'Create Product',
              icon: 'pi pi-fw pi-plus',
              data: {
                route: '/inventory/products/create',
                description: 'Create a new inventory product'
              }
            },
            {
              key: 'inventory-product-detail',
              label: 'Product Detail',
              icon: 'pi pi-fw pi-eye',
              data: {
                route: '/inventory/products/:id',
                description: 'View product details by ID'
              }
            },
            {
              key: 'inventory-product-edit',
              label: 'Edit Product',
              icon: 'pi pi-fw pi-pencil',
              data: {
                route: '/inventory/products/:id/edit',
                description: 'Edit an existing inventory product'
              }
            },
            {
              key: 'inventory-categories',
              label: 'Categories',
              icon: 'pi pi-fw pi-list',
              data: {
                route: '/inventory/categories',
                description: 'Manage item categories'
              }
            },
            {
              key: 'inventory-suppliers',
              label: 'Suppliers',
              icon: 'pi pi-fw pi-user-plus',
              data: {
                route: '/inventory/suppliers',
                description: 'Manage suppliers and vendors'
              }
            },
            {
              key: 'inventory-partners',
              label: 'Partners',
              icon: 'pi pi-fw pi-briefcase',
              data: {
                route: '/inventory/partners',
                description: 'Partner and collaborator management'
              }
            },
            {
              key: 'inventory-analytics',
              label: 'Analytics',
              icon: 'pi pi-fw pi-chart-bar',
              data: {
                route: '/inventory/analytics',
                description: 'Inventory analytics and reporting'
              }
            },
            {
              key: 'inventory-settings',
              label: 'Inventory Settings',
              icon: 'pi pi-fw pi-cog',
              data: {
                route: '/inventory/settings',
                description: 'Inventory configuration and settings'
              }
            },
            {
              key: 'inventory-delivery-points',
              label: 'Delivery Points',
              icon: 'pi pi-fw pi-map-marker',
              data: {
                route: '/inventory/delivery-points',
                description: 'Delivery points and warehouse locations'
              }
            },
            {
              key: 'inventory-forecast-demand',
              label: 'Forecast Demand',
              icon: 'pi pi-fw pi-chart-line',
              data: {
                route: '/inventory/forecast/demand',
                description: 'Demand forecasting for inventory'
              }
            },
            {
              key: 'inventory-forecast-truck',
              label: 'Forecast Truck',
              icon: 'pi pi-fw pi-truck',
              data: {
                route: '/inventory/forecast/truck',
                description: 'Truck planning and forecast'
              }
            },
            {
              key: 'inventory-forecast-trip',
              label: 'Forecast Trip',
              icon: 'pi pi-fw pi-map',
              data: {
                route: '/inventory/forecast/trip',
                description: 'Trip planning and forecast'
              }
            },
            {
              key: 'inventory-forecast-hub',
              label: 'Forecast Hub',
              icon: 'pi pi-fw pi-sitemap',
              data: {
                route: '/inventory/forecast/hub',
                description: 'Hub-level inventory forecasts'
              }
            }
          ]
        },
        {
          key: 'retail-sales',
          label: 'Sales & Commerce',
          icon: 'pi pi-shopping-bag',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'retail-orders',
              label: 'Orders',
              icon: 'pi pi-shopping-cart',
              data: {
                route: '/retail/orders',
                description: 'Sales order management'
              }
            },
            {
              key: 'retail-transactions',
              label: 'Transactions',
              icon: 'pi pi-money-bill',
              data: {
                route: '/retail/transactions',
                description: 'Transaction and payment records'
              }
            },
            {
              key: 'retail-products',
              label: 'Products',
              icon: 'pi pi-tags',
              data: {
                route: '/retail/products',
                description: 'Retail product catalog'
              }
            },
            {
              key: 'retail-customers',
              label: 'Customers',
              icon: 'pi pi-users',
              data: {
                route: '/retail/customers',
                description: 'Customer management and CRM'
              }
            },
            {
              key: 'retail-pos',
              label: 'POS',
              icon: 'pi pi-dollar',
              data: {
                route: '/retail/pos',
                description: 'Point-of-sale operations'
              }
            },
            {
              key: 'retail-ecommerce',
              label: 'Ecommerce',
              icon: 'pi pi-shopping-bag',
              data: {
                route: '/retail/ecommerce',
                description: 'Ecommerce storefront and catalog'
              }
            },
            {
              key: 'retail-omni',
              label: 'Omni-channel',
              icon: 'pi pi-share-alt',
              data: {
                route: '/retail/omni-channel',
                description: 'Omni-channel commerce overview'
              }
            },
            {
              key: 'retail-payment',
              label: 'Payment',
              icon: 'pi pi-credit-card',
              data: {
                route: '/retail/payment',
                description: 'Payment and checkout configuration'
              }
            },
            {
              key: 'retail-fresh-retail',
              label: 'Fresh Retail',
              icon: 'pi pi-apple',
              data: {
                route: '/retail/fresh-retail',
                description: 'Fresh retail feature overview'
              }
            }
          ]
        },
        {
          key: 'loyalty',
          label: 'CRM & Customers',
          icon: 'pi pi-users',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'loyalty-overview',
              label: 'Overview',
              icon: 'pi pi-fw pi-home',
              data: {
                route: '/loyalty/overview',
                description: 'Loyalty program overview'
              }
            },
            {
              key: 'loyalty-members',
              label: 'Members',
              icon: 'pi pi-fw pi-user',
              data: {
                route: '/loyalty/members',
                description: 'Member management'
              }
            },
            {
              key: 'loyalty-channels',
              label: 'Channels',
              icon: 'pi pi-fw pi-sitemap',
              data: {
                route: '/loyalty/channels',
                description: 'Engagement channels'
              }
            },
            {
              key: 'loyalty-rewards',
              label: 'Rewards',
              icon: 'pi pi-fw pi-gift',
              data: {
                route: '/loyalty/rewards',
                description: 'Reward program management'
              }
            },
            {
              key: 'loyalty-campaigns',
              label: 'Campaigns',
              icon: 'pi pi-fw pi-bullhorn',
              data: {
                route: '/loyalty/campaigns',
                description: 'Campaign and promotion control'
              }
            },
            {
              key: 'loyalty-strategy',
              label: 'Strategy',
              icon: 'pi pi-fw pi-lightbulb',
              data: {
                route: '/loyalty/strategy',
                description: 'Loyalty strategy planning'
              }
            },
            {
              key: 'loyalty-segments',
              label: 'Segments',
              icon: 'pi pi-fw pi-chart-bar',
              data: {
                route: '/loyalty/segments',
                description: 'Audience segment management'
              }
            },
            {
              key: 'loyalty-automation',
              label: 'Automation',
              icon: 'pi pi-fw pi-cog',
              data: {
                route: '/loyalty/automation',
                description: 'Automation rules and workflows'
              }
            },
            {
              key: 'loyalty-analytics',
              label: 'Analytics',
              icon: 'pi pi-fw pi-chart-line',
              data: {
                route: '/loyalty/analytics',
                description: 'Loyalty analytics and reporting'
              }
            }
          ]
        }
      ]
    },
    {
      key: 'governance-root',
      label: 'Governance & Data',
      icon: 'pi pi-folder',
      selectable: false,
      expanded: true,
      children: [
        {
          key: 'governance',
          label: 'Governance',
          icon: 'pi pi-shield',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'governance-policies',
              label: 'Policies',
              icon: 'pi pi-fw pi-book',
              data: {
                route: '/governance/policies',
                description: 'Manage governance policies'
              }
            },
            {
              key: 'governance-policy-new',
              label: 'Create Policy',
              icon: 'pi pi-fw pi-plus',
              data: {
                route: '/governance/policies/new',
                description: 'Create a new policy'
              }
            },
            {
              key: 'governance-policy-edit',
              label: 'Edit Policy',
              icon: 'pi pi-fw pi-pencil',
              data: {
                route: '/governance/policies/edit/:id',
                description: 'Edit an existing policy'
              }
            },
            {
              key: 'governance-assets',
              label: 'Assets',
              icon: 'pi pi-fw pi-briefcase',
              data: {
                route: '/governance/assets',
                description: 'Governance asset management'
              }
            },
            {
              key: 'governance-asset-new',
              label: 'Create Asset',
              icon: 'pi pi-fw pi-plus',
              data: {
                route: '/governance/assets/new',
                description: 'Create a new asset'
              }
            },
            {
              key: 'governance-teams',
              label: 'Teams',
              icon: 'pi pi-fw pi-users',
              data: {
                route: '/governance/teams',
                description: 'Team and membership governance'
              }
            },
            {
              key: 'governance-roles',
              label: 'Roles',
              icon: 'pi pi-fw pi-user-plus',
              data: {
                route: '/governance/roles',
                description: 'Role-based access control'
              }
            },
            {
              key: 'governance-accounts',
              label: 'Accounts',
              icon: 'pi pi-fw pi-user',
              data: {
                route: '/governance/accounts',
                description: 'Account and identity management'
              }
            },
            {
              key: 'governance-users',
              label: 'Users',
              icon: 'pi pi-fw pi-users',
              data: {
                route: '/governance/users',
                description: 'User management and details'
              }
            },
            {
              key: 'governance-permissions',
              label: 'Permissions',
              icon: 'pi pi-fw pi-lock',
              data: {
                route: '/governance/permissions',
                description: 'Permission management'
              }
            },
            {
              key: 'governance-tenants',
              label: 'Tenants',
              icon: 'pi pi-fw pi-building',
              data: {
                route: '/governance/tenants',
                description: 'Tenant and workspace management'
              }
            },
            {
              key: 'governance-entitlements',
              label: 'Entitlements',
              icon: 'pi pi-fw pi-key',
              data: {
                route: '/governance/entitlements',
                description: 'Access entitlement management'
              }
            },
            {
              key: 'governance-branches',
              label: 'Branches',
              icon: 'pi pi-fw pi-sitemap',
              data: {
                route: '/governance/branches',
                description: 'Branch and location governance'
              }
            },
            {
              key: 'governance-casbin',
              label: 'Casbin',
              icon: 'pi pi-fw pi-shield',
              data: {
                route: '/governance/casbin',
                description: 'Casbin policy management'
              }
            },
            {
              key: 'governance-admin',
              label: 'Governance Admin',
              icon: 'pi pi-fw pi-cog',
              data: {
                route: '/governance/admin',
                description: 'Governance administration console'
              }
            }
          ]
        },
        {
          key: 'explore',
          label: 'Explore',
          icon: 'pi pi-compass',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'explore-home',
              label: 'Explore Home',
              icon: 'pi pi-fw pi-compass',
              data: {
                route: '/explore',
                description: 'Data discovery home'
              }
            },
            {
              key: 'explore-data-warehouse',
              label: 'Data Warehouse',
              icon: 'pi pi-fw pi-database',
              data: {
                route: '/explore/data-warehouse',
                description: 'Explore warehouse data sources'
              }
            },
            {
              key: 'explore-google',
              label: 'Google Explorer',
              icon: 'pi pi-fw pi-google',
              data: {
                route: '/explore/google',
                description: 'Google data exploration'
              }
            },
            {
              key: 'explore-database',
              label: 'Database Explorer',
              icon: 'pi pi-fw pi-database',
              data: {
                route: '/explore/database',
                description: 'Explore databases'
              }
            },
            {
              key: 'explore-pipelines',
              label: 'Pipelines Explorer',
              icon: 'pi pi-fw pi-cogs',
              data: {
                route: '/explore/pipelines',
                description: 'Explore pipeline metadata'
              }
            },
            {
              key: 'explore-topics',
              label: 'Topics Explorer',
              icon: 'pi pi-fw pi-tags',
              data: {
                route: '/explore/topics',
                description: 'Explore topic metadata'
              }
            },
            {
              key: 'explore-ml-models',
              label: 'ML Models',
              icon: 'pi pi-fw pi-brush',
              data: {
                route: '/explore/ml-models',
                description: 'Explore machine learning models'
              }
            },
            {
              key: 'explore-container',
              label: 'Container Explorer',
              icon: 'pi pi-fw pi-cloud',
              data: {
                route: '/explore/container',
                description: 'Explore container registries'
              }
            },
            {
              key: 'explore-search',
              label: 'Search Explorer',
              icon: 'pi pi-fw pi-search',
              data: {
                route: '/explore/search',
                description: 'Search across data platforms'
              }
            },
            {
              key: 'data-mesh-catalogs',
              label: 'Data Mesh Catalogs',
              icon: 'pi pi-fw pi-book',
              data: {
                route: '/data-mesh/catalogs',
                description: 'Domain catalog listing'
              }
            },
            {
              key: 'data-mesh-products',
              label: 'Data Products',
              icon: 'pi pi-fw pi-box',
              data: {
                route: '/data-mesh/data-products',
                description: 'Data product listing'
              }
            }
          ]
        },
        {
          key: 'settings',
          label: 'Settings',
          icon: 'pi pi-cog',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'settings-profile',
              label: 'Profile',
              icon: 'pi pi-fw pi-user',
              data: {
                route: '/profile',
                description: 'User profile settings'
              }
            }
          ]
        }
      ]
    },
    {
      key: 'platform-root',
      label: 'Platform Services',
      icon: 'pi pi-folder',
      selectable: false,
      expanded: true,
      children: [
        {
          key: 'files',
          label: 'Files',
          icon: 'pi pi-folder',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'files-dashboard',
              label: 'Dashboard',
              icon: 'pi pi-fw pi-th-large',
              data: {
                route: '/files/dashboard',
                description: 'Files dashboard'
              }
            },
            {
              key: 'files-list',
              label: 'File List',
              icon: 'pi pi-fw pi-list',
              data: {
                route: '/files/list',
                description: 'List all files'
              }
            },
            {
              key: 'files-stats',
              label: 'Stats',
              icon: 'pi pi-fw pi-chart-bar',
              data: {
                route: '/files/stats',
                description: 'Files analytics'
              }
            }
          ]
        },
        {
          key: 'support',
          label: 'Support',
          icon: 'pi pi-headphones',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'support-workspace',
              label: 'Workspace',
              icon: 'pi pi-fw pi-briefcase',
              data: {
                route: '/cmc/workspace',
                description: 'Customer messaging workspace'
              }
            },
            {
              key: 'support-templates',
              label: 'Templates',
              icon: 'pi pi-fw pi-file',
              data: {
                route: '/cmc/templates',
                description: 'Support message templates'
              }
            },
            {
              key: 'support-automation',
              label: 'Automation',
              icon: 'pi pi-fw pi-cog',
              data: {
                route: '/cmc/automation',
                description: 'Automated messaging workflows'
              }
            },
            {
              key: 'support-bot-settings',
              label: 'Bot Settings',
              icon: 'pi pi-fw pi-robot',
              data: {
                route: '/cmc/bot-settings',
                description: 'Chat bot configuration'
              }
            },
            {
              key: 'support-delivery-health',
              label: 'Delivery Health',
              icon: 'pi pi-fw pi-heart',
              data: {
                route: '/cmc/delivery-health',
                description: 'Delivery status and health'
              }
            },
            {
              key: 'support-explore',
              label: 'Chat Explore',
              icon: 'pi pi-fw pi-search',
              data: {
                route: '/cmc/explore',
                description: 'Chat conversation exploration'
              }
            },
            {
              key: 'support-dashboard',
              label: 'Dashboard',
              icon: 'pi pi-fw pi-chart-line',
              data: {
                route: '/cmc/dashboard',
                description: 'Chat platform dashboard'
              }
            },
            {
              key: 'support-overview',
              label: 'Overview',
              icon: 'pi pi-fw pi-eye',
              data: {
                route: '/cmc/overview',
                description: 'Messaging overview'
              }
            }
          ]
        },
        {
          key: 'admanager',
          label: 'Ad Manager',
          icon: 'pi pi-chart-bar',
          data: {
            route: '/ad-manager',
            description: 'Campaign analytics and ad operations'
          }
        },
        {
          key: 'travel',
          label: 'Travel',
          icon: 'pi pi-globe',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'travel-list',
              label: 'Trips List',
              icon: 'pi pi-fw pi-list',
              data: {
                route: '/travel',
                description: 'Travel trip list overview'
              }
            },
            {
              key: 'travel-analytics',
              label: 'Analytics',
              icon: 'pi pi-fw pi-chart-bar',
              data: {
                route: '/travel/analytics',
                description: 'Travel analytics dashboard'
              }
            },
            {
              key: 'travel-new',
              label: 'New Trip',
              icon: 'pi pi-fw pi-plus',
              data: {
                route: '/travel/new',
                description: 'Create a new trip'
              }
            },
            {
              key: 'travel-detail',
              label: 'Trip Detail',
              icon: 'pi pi-fw pi-eye',
              data: {
                route: '/travel/:id',
                description: 'View a trip detail by ID'
              }
            }
          ]
        },
        {
          key: 'blogger',
          label: 'Content',
          icon: 'pi pi-pencil',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'blogger-home',
              label: 'Blogger Home',
              icon: 'pi pi-fw pi-paperclip',
              data: {
                route: '/blogger',
                description: 'Blog publishing overview'
              }
            },
            {
              key: 'blogger-authors',
              label: 'Authors',
              icon: 'pi pi-fw pi-users',
              data: {
                route: '/blogger/authors',
                description: 'Manage authors'
              }
            },
            {
              key: 'blogger-posts',
              label: 'Posts',
              icon: 'pi pi-fw pi-file',
              data: {
                route: '/blogger/posts',
                description: 'Manage blog posts'
              }
            }
          ]
        },
        {
          key: 'hotel',
          label: 'Hotel',
          icon: 'pi pi-building',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'hotel-apartments',
              label: 'Apartments',
              icon: 'pi pi-fw pi-building',
              data: {
                route: '/hotel/apartments',
                description: 'Manage hotel apartments'
              }
            },
            {
              key: 'hotel-apartment-detail',
              label: 'Apartment Detail',
              icon: 'pi pi-fw pi-eye',
              data: {
                route: '/hotel/apartments/:id',
                description: 'View apartment details'
              }
            },
            {
              key: 'hotel-bookings',
              label: 'Bookings',
              icon: 'pi pi-fw pi-calendar',
              data: {
                route: '/hotel/bookings',
                description: 'Booking management'
              }
            },
            {
              key: 'hotel-rooms',
              label: 'Rooms',
              icon: 'pi pi-fw pi-home',
              data: {
                route: '/hotel/rooms',
                description: 'Hotel rooms management'
              }
            },
            {
              key: 'hotel-reviews',
              label: 'Reviews',
              icon: 'pi pi-fw pi-comments',
              data: {
                route: '/hotel/reviews',
                description: 'Guest reviews and ratings'
              }
            },
            {
              key: 'hotel-ratings',
              label: 'Ratings',
              icon: 'pi pi-fw pi-star',
              data: {
                route: '/hotel/ratings',
                description: 'Rating management'
              }
            },
            {
              key: 'hotel-calendar',
              label: 'Calendar',
              icon: 'pi pi-fw pi-calendar',
              data: {
                route: '/hotel/calendar',
                description: 'Booking calendar'
              }
            },
            {
              key: 'hotel-checkin',
              label: 'Check-in',
              icon: 'pi pi-fw pi-sign-in',
              data: {
                route: '/hotel/checkin',
                description: 'Guest check-in management'
              }
            },
            {
              key: 'hotel-guests',
              label: 'Guests',
              icon: 'pi pi-fw pi-users',
              data: {
                route: '/hotel/guests',
                description: 'Guest management'
              }
            },
            {
              key: 'hotel-support',
              label: 'Support',
              icon: 'pi pi-fw pi-headphones',
              data: {
                route: '/hotel/support',
                description: 'Hotel support center'
              }
            },
            {
              key: 'hotel-analytics',
              label: 'Analytics',
              icon: 'pi pi-fw pi-chart-bar',
              selectable: false,
              expanded: true,
              children: [
                {
                  key: 'hotel-analytics-revenue',
                  label: 'Revenue',
                  icon: 'pi pi-fw pi-dollar',
                  data: {
                    route: '/hotel/analytics/revenue',
                    description: 'Hotel revenue analytics'
                  }
                },
                {
                  key: 'hotel-analytics-occupancy',
                  label: 'Occupancy',
                  icon: 'pi pi-fw pi-home',
                  data: {
                    route: '/hotel/analytics/occupancy',
                    description: 'Occupancy analytics'
                  }
                },
                {
                  key: 'hotel-analytics-customers',
                  label: 'Customers',
                  icon: 'pi pi-fw pi-users',
                  data: {
                    route: '/hotel/analytics/customers',
                    description: 'Customer analytics'
                  }
                },
                {
                  key: 'hotel-analytics-dashboard',
                  label: 'Dashboard',
                  icon: 'pi pi-fw pi-dashboard',
                  data: {
                    route: '/hotel/analytics/dashboard',
                    description: 'Analytics dashboard overview'
                  }
                }
              ]
            }
          ]
        },
        {
          key: 'notification',
          label: 'Notification',
          icon: 'pi pi-bell',
          selectable: false,
          expanded: true,
          children: [
            {
              key: 'notification-overview',
              label: 'Overview',
              icon: 'pi pi-fw pi-eye',
              data: {
                route: '/notification',
                description: 'Notification service overview'
              }
            },
            {
              key: 'notification-explorer',
              label: 'Explorer',
              icon: 'pi pi-fw pi-search',
              data: {
                route: '/notification/explorer',
                description: 'Template explorer'
              }
            },
            {
              key: 'notification-composer',
              label: 'Composer',
              icon: 'pi pi-fw pi-pencil',
              data: {
                route: '/notification/composer',
                description: 'Create notification messages'
              }
            },
            {
              key: 'notification-audit',
              label: 'Audit Trail',
              icon: 'pi pi-fw pi-briefcase',
              data: {
                route: '/notification/audit',
                description: 'View notification audit history'
              }
            },
            {
              key: 'notification-reliability',
              label: 'Reliability',
              icon: 'pi pi-fw pi-check-circle',
              data: {
                route: '/notification/reliability',
                description: 'Notification reliability metrics'
              }
            },
            {
              key: 'notification-scheduling',
              label: 'Scheduling',
              icon: 'pi pi-fw pi-clock',
              data: {
                route: '/notification/scheduling',
                description: 'Schedule notifications and rate limiting'
              }
            },
            {
              key: 'notification-api',
              label: 'API Playground',
              icon: 'pi pi-fw pi-code',
              data: {
                route: '/notification/api',
                description: 'API sandbox for notifications'
              }
            },
            {
              key: 'notification-template-create',
              label: 'Create Template',
              icon: 'pi pi-fw pi-plus',
              data: {
                route: '/notification/templates/create',
                description: 'Create a new notification template'
              }
            },
            {
              key: 'notification-template-edit',
              label: 'Edit Template',
              icon: 'pi pi-fw pi-pencil',
              data: {
                route: '/notification/templates/edit/:code/:locale/:channel',
                description: 'Edit a notification template'
              }
            }
          ]
        }
      ]
    }
  ];

  constructor(
    private router: Router,
    private appSwitcher: AppSwitcherService
  ) {}

  ngOnInit(): void {
    this.selectedNode = null;
  }

  onNodeSelect(event: any): void {
    const node = event.node as TreeNode;
    this.selectedNode = node;

    const route = node?.data?.route as string | undefined;
    if (route) {
      this.navigateToRoute(route, node?.data?.app as AppKey | undefined);
    } else if (node?.data?.app) {
      this.selectApp(node.key as AppKey);
    }
  }

  navigateToRoute(route: string, appKey?: AppKey): void {
    if (appKey) {
      this.appSwitcher.selectApp(appKey);
    }

    this.router.navigateByUrl(route);
  }

  selectApp(key: AppKey): void {
    this.appSwitcher.selectApp(key);

    const routeForApp: Record<AppKey, string> = {
      all: '/',
      explore: '/explore',
      retail: '/retail/fresh-retail',
      inventory: '/inventory/overview',
      loyalty: '/loyalty/overview',
      catalog: '/',
      governance: '/governance/policies',
      planning: '/planning',
      blogger: '/blogger',
      hotel: '/hotel/apartments',
      admanager: '/ad-manager',
      support: '/cmc/workspace',
      chat: '/chat',
      files: '/files/dashboard',
      travel: '/travel',
      settings: '/profile',
      notification: '/notification',
      'auto-planning': '/planning/auto-planning',
      warehouse: '/planning/delivery-points',
      'delivery-points': '/planning/delivery-points',
      fleet: '/planning/fleet',
      demand: '/planning/forecast/demand',
      truck: '/planning/forecast/truck',
      trip: '/planning/forecast/trip',
      hub: '/planning/forecast/hub',
      forecast: '/planning/forecast/demand',
      orders: '/retail/orders',
      transactions: '/retail/transactions',
      'retail-sales': '/retail/orders',
      'retail-products': '/retail/products',
      'retail-customers': '/retail/customers',
      'retail-omni': '/retail/omni-channel',
      'retail-pos': '/retail/pos'
    };

    const target = routeForApp[key] || '/';
    this.router.navigate([target]);
  }
}
