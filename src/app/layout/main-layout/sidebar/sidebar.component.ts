import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

// PrimeNG imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    DialogModule,
    ButtonModule,
    DividerModule,
    TooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0px', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
  ],

})
export class SidebarComponent {
  menu: MenuItem[];
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();
  
  // Info dialog properties
  infoDialogVisible = false;
  selectedInfo: MenuInfo | null = null;

  constructor(private router: Router) { }

  ngOnInit() {
    this.menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        url: '/dashboard',
        info: {
          title: 'Dashboard',
          description: 'Get an overview of your data mesh ecosystem with key metrics and insights.',
          features: [
            'Real-time Metrics - Monitor system health and performance',
            'Quick Access - Navigate to frequently used features',
            'Recent Activity - View latest changes and updates',
            'System Status - Check overall platform health'
          ],
          usage: 'Use the dashboard to get a quick overview of your data mesh and access key features.',
          tips: [
            'Check the dashboard daily for system health updates',
            'Use quick access tiles to navigate faster',
            'Monitor recent activity for awareness of changes'
          ]
        }
      },
      {
        label: 'Marketplace',
        icon: 'pi pi-shopping-cart',
        url: '/marketplace',
        highlighted: true,
        info: {
          title: 'Data Products Marketplace',
          description: 'Discover, explore, and subscribe to data products from across your organization.',
          features: [
            'Product Discovery - Browse all available data products',
            'Smart Search - Find products by domain, category, or keywords',
            'Subscription Management - Subscribe and manage your subscriptions',
            'Product Reviews - Rate and review data products',
            'Usage Analytics - Track your marketplace activity',
            'Quality Metrics - View product quality and reliability scores'
          ],
          usage: 'Your central hub for discovering and accessing data products across all domains.',
          tips: [
            'Use filters to narrow down products by domain or category',
            'Check product ratings and reviews before subscribing',
            'Monitor your usage to optimize your subscriptions',
            'Bookmark frequently used products for quick access'
          ]
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
      {
        label: 'Data Mesh',
        icon: 'pi pi-sitemap',
        children: [
          { 
            label: 'Overview', 
            icon: 'pi pi-chart-pie', 
            url: '/data-mesh/overview',
            info: {
              title: 'Data Mesh Overview',
              description: 'Get a comprehensive view of your data mesh ecosystem with real-time metrics and health indicators.',
              features: [
                'Domain Health Dashboard - Monitor all domain statuses',
                'Key Performance Indicators - Track mesh performance',
                'Resource Utilization - Monitor infrastructure usage',
                'Recent Activity - View latest domain activities'
              ],
              usage: 'Start here to get an overview of your entire data mesh ecosystem and identify areas that need attention.',
              tips: [
                'Check the overview daily to stay informed of system health',
                'Use filters to focus on specific domains or metrics',
                'Set up alerts for critical health indicators'
              ]
            }
          },
          { 
            label: 'Domain Catalog', 
            icon: 'pi pi-book', 
            url: '/data-mesh/domains',
            info: {
              title: 'Domain Catalog',
              description: 'Browse and manage all data domains in your mesh with detailed information and ownership.',
              features: [
                'Domain Discovery - Find domains by name, owner, or tags',
                'Ownership Details - Contact information and responsibilities',
                'SLA Tracking - Monitor service level agreements',
                'Domain Metrics - Performance and usage statistics'
              ],
              usage: 'Explore available domains, understand their purpose, and connect with domain owners.',
              tips: [
                'Use search filters to quickly find relevant domains',
                'Review domain SLAs before subscribing to data products',
                'Contact domain owners for specific requirements'
              ]
            }
          },
          { 
            label: 'Data Product', 
            icon: 'pi pi-shopping-cart', 
            url: '/data-mesh/data-products', 
            info: {
              title: 'Data Products',
              description: 'Discover, subscribe to, and manage data products across all domains in your organization.',
              features: [
                'Product Discovery - Browse available data products',
                'Subscription Management - Subscribe/unsubscribe to products',
                'Usage Analytics - Track your data product usage',
                'Quality Metrics - View product quality scores'
              ],
              usage: 'Browse available data products, subscribe to ones you need, and manage your subscriptions.',
              tips: [
                'Check product quality scores before subscribing',
                'Review product documentation for usage guidelines',
                'Monitor your usage to optimize subscriptions'
              ]
            }
          },
          { 
            label: 'API Explorer', 
            icon: 'pi pi-code', 
            url: '/data-mesh/api-explorer',
            info: {
              title: 'API Explorer',
              description: 'Explore, test, and integrate with APIs provided by data products across all domains.',
              features: [
                'API Discovery - Find APIs by domain or functionality',
                'Interactive Testing - Test APIs directly in the browser',
                'Documentation - Comprehensive API documentation',
                'Code Generation - Generate client code for APIs'
              ],
              usage: 'Discover APIs, test them interactively, and integrate them into your applications.',
              tips: [
                'Test APIs in the sandbox environment first',
                'Review rate limits and authentication requirements',
                'Use the code generator to speed up integration'
              ]
            }
          },
          { 
            label: 'Data Lineage', 
            icon: 'pi pi-share-alt', 
            url: '/data-mesh/lineage',
            info: {
              title: 'Data Lineage',
              description: 'Visualize data flow and dependencies across your mesh to understand impact and relationships.',
              features: [
                'Visual Lineage Graphs - Interactive dependency visualization',
                'Impact Analysis - Understand downstream effects',
                'Dependency Tracking - Track data dependencies',
                'Change Impact - Assess impact of changes'
              ],
              usage: 'Visualize how data flows through your organization and assess the impact of changes.',
              tips: [
                'Use lineage to understand data dependencies before changes',
                'Regular lineage reviews help maintain data quality',
                'Share lineage diagrams with stakeholders for clarity'
              ]
            }
          },
          { 
            label: 'Quality Metrics', 
            icon: 'pi pi-chart-bar', 
            url: '/data-mesh/quality',
            info: {
              title: 'Quality Metrics',
              description: 'Monitor and improve data quality across all domains with comprehensive metrics and alerts.',
              features: [
                'Quality Scoring - Automated quality assessment',
                'Trend Analysis - Track quality improvements over time',
                'Alerting - Get notified of quality issues',
                'Quality Rules - Define custom quality criteria'
              ],
              usage: 'Monitor data quality across your mesh and take action to improve it.',
              tips: [
                'Set up quality alerts for critical data products',
                'Regular quality reviews help maintain standards',
                'Use quality trends to identify improvement opportunities'
              ]
            }
          },
          { 
            label: 'Data Contracts', 
            icon: 'pi pi-file-check', 
            url: '/data-contracts',
            info: {
              title: 'Data Contracts',
              description: 'Manage agreements between data producers and consumers with versioned contracts.',
              features: [
                'Contract Templates - Pre-built templates for common scenarios',
                'Version Control - Track contract changes over time',
                'SLA Definitions - Define service level agreements',
                'Compliance Tracking - Monitor contract adherence'
              ],
              usage: 'Create and manage data sharing agreements between domains.',
              tips: [
                'Use templates to ensure consistent contract structure',
                'Version contracts carefully to avoid breaking changes',
                'Regular contract reviews ensure ongoing compliance'
              ]
            }
          }
        ],
        expanded: true,
        info: {
          title: 'Data Mesh Platform',
          description: 'A comprehensive platform for managing decentralized data architecture with domain-driven design.',
          features: [
            'Domain-Driven Design - Organize data by business domains',
            'Self-Serve Infrastructure - Enable domain autonomy',
            'Federated Governance - Consistent governance across domains',
            'Product Thinking - Treat data as products'
          ],
          usage: 'Access all data mesh capabilities from this section to manage your decentralized data architecture.',
          tips: [
            'Start with the overview to understand your mesh health',
            'Use the marketplace to discover and consume data products',
            'Leverage governance tools to maintain standards'
          ]
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
      {
        label: 'Governance',
        icon: 'pi pi-shield',
        children: [
          { 
            label: 'Policies', 
            icon: 'pi pi-bookmark', 
            url: '/governance/policies',
            info: {
              title: 'Data Policies',
              description: 'Create, manage, and enforce data governance policies to ensure compliance and quality.',
              features: [
                'Policy Creation - Define custom governance policies',
                'Policy Enforcement - Automatically apply policies',
                'Compliance Tracking - Monitor policy adherence',
                'Policy Templates - Use pre-built policy templates'
              ],
              usage: 'Define and enforce data governance policies across your organization.',
              tips: [
                'Use policy templates for common governance patterns',
                'Test policies in development before production',
                'Review policy effectiveness regularly'
              ]
            }
          },
          { 
            label: 'Permissions', 
            icon: 'pi pi-key', 
            url: '/governance/permissions',
            info: {
              title: 'Permissions Management',
              description: 'Fine-grained access control to manage who can access what data and perform which operations.',
              features: [
                'Granular Permissions - Define specific access rights',
                'Permission Inheritance - Hierarchical permission structure',
                'Audit Trail - Track permission changes',
                'Bulk Management - Efficiently manage permissions'
              ],
              usage: 'Define and manage access permissions for data assets and operations.',
              tips: [
                'Follow the principle of least privilege',
                'Use permission groups for easier management',
                'Regular permission audits maintain security'
              ]
            }
          },
          { 
            label: 'Roles', 
            icon: 'pi pi-users', 
            url: '/governance/roles',
            info: {
              title: 'Role Management',
              description: 'Define and manage roles with specific permissions for streamlined access control.',
              features: [
                'Role Definition - Create custom roles',
                'Role Assignment - Assign roles to users',
                'Role Hierarchy - Establish role inheritance',
                'Role Analytics - Monitor role usage'
              ],
              usage: 'Create and manage roles that match your organizational structure.',
              tips: [
                'Design roles based on job functions',
                'Use role hierarchy to reduce complexity',
                'Regular role reviews keep permissions current'
              ]
            }
          },
          { 
            label: 'Teams', 
            icon: 'pi pi-sitemap', 
            url: '/governance/teams',
            info: {
              title: 'Team Management',
              description: 'Organize users into teams and departments for streamlined collaboration and permission management.',
              features: [
                'Team Creation - Create organizational teams',
                'Team Permissions - Assign team-level permissions',
                'Team Hierarchy - Establish organizational structure',
                'Team Analytics - Monitor team collaboration'
              ],
              usage: 'Create and manage teams that reflect your organizational structure.',
              tips: [
                'Align teams with organizational structure',
                'Use team permissions to reduce management overhead',
                'Regular team reviews ensure proper access'
              ]
            }
          },
          { 
            label: 'Users', 
            icon: 'pi pi-user', 
            url: '/governance/users',
            info: {
              title: 'User Management',
              description: 'Manage individual users, their profiles, permissions, and role assignments.',
              features: [
                'User Profiles - Comprehensive user information',
                'Permission Assignment - Direct user permissions',
                'Role Assignment - Assign multiple roles',
                'User Analytics - Track user activity'
              ],
              usage: 'View and manage individual users and their access rights.',
              tips: [
                'Use roles instead of direct permissions',
                'Keep user profiles updated',
                'Monitor user activity for security'
              ]
            }
          },
          { 
            label: 'Accounts', 
            icon: 'pi pi-building', 
            url: '/governance/accounts',
            info: {
              title: 'Account Management',
              description: 'Comprehensive account administration including provisioning and lifecycle management.',
              features: [
                'Account Provisioning - Automated account creation',
                'Account Lifecycle - Manage account status',
                'Account Policies - Apply organizational policies',
                'Account Analytics - Monitor account usage'
              ],
              usage: 'Manage user accounts from creation to deletion.',
              tips: [
                'Automate account provisioning',
                'Implement account expiration policies',
                'Regular account audits identify inactive accounts'
              ]
            }
          },
          { 
            label: 'Assets', 
            icon: 'pi pi-database', 
            url: '/governance/assets',
            info: {
              title: 'Data Assets',
              description: 'Discover, catalog, and manage all data assets with comprehensive metadata.',
              features: [
                'Asset Discovery - Automatically discover assets',
                'Metadata Management - Rich metadata and documentation',
                'Lineage Tracking - Understand data flow',
                'Quality Scoring - Assess data quality'
              ],
              usage: 'Browse and manage your data assets with detailed metadata.',
              tips: [
                'Keep asset metadata up-to-date',
                'Use tags for organization',
                'Regular quality assessments maintain integrity'
              ]
            }
          }
        ],
        expanded: false,
        info: {
          title: 'Data Governance',
          description: 'Comprehensive governance framework for data management, compliance, and security.',
          features: [
            'Policy Management - Create and enforce policies',
            'Access Control - Fine-grained permissions',
            'Compliance Tracking - Monitor adherence',
            'Asset Management - Catalog and track assets'
          ],
          usage: 'Manage data governance policies, user access, and ensure compliance.',
          tips: [
            'Start with clear data policies',
            'Regular reviews maintain security',
            'Use asset discovery for up-to-date catalogs'
          ]
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
      {
        label: 'Discovery',
        icon: 'pi pi-search',
        children: [
          { 
            label: 'Data Catalog', 
            icon: 'pi pi-list', 
            url: '/discovery/data-catalog',
            info: {
              title: 'Data Catalog',
              description: 'Discover and explore available datasets with comprehensive search and filtering.',
              features: [
                'Metadata Search - Search by content and metadata',
                'Data Profiling - Understand data characteristics',
                'Usage Statistics - See how data is being used',
                'Quality Indicators - View data quality metrics'
              ],
              usage: 'Find and understand available data assets across your organization.',
              tips: [
                'Use advanced search filters for precision',
                'Review data profiles before using datasets',
                'Check usage statistics for popularity indicators'
              ]
            }
          },
          { 
            label: 'Explore Data', 
            icon: 'pi pi-compass', 
            url: '/explore',
            info: {
              title: 'Data Explorer',
              description: 'Interactive data exploration and analysis tools for various data sources.',
              features: [
                'Query Builder - Visual query construction',
                'Data Visualization - Interactive charts and graphs',
                'Sample Data - Preview data before full access',
                'Export Options - Download results in various formats'
              ],
              usage: 'Explore and analyze your data interactively with powerful tools.',
              tips: [
                'Start with sample data to understand structure',
                'Use visualizations to identify patterns',
                'Save frequently used queries for reuse'
              ]
            }
          }
        ],
        expanded: false,
        info: {
          title: 'Data Discovery',
          description: 'Discover and explore data assets across your organization.',
          features: [
            'Catalog Search - Find data assets quickly',
            'Interactive Exploration - Explore data interactively',
            'Schema Discovery - Understand data structure',
            'Usage Analytics - Track data usage patterns'
          ],
          usage: 'Use discovery tools to find and understand available data assets.',
          tips: [
            'Use advanced search for precise results',
            'Explore data samples before full access',
            'Check usage statistics for popular assets'
          ]
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
      {
        label: 'Observability',
        icon: 'pi pi-eye',
        children: [
          { 
            label: 'Monitoring', 
            icon: 'pi pi-chart-line', 
            url: '/observability/monitoring',
            info: {
              title: 'Data Monitoring',
              description: 'Monitor data pipeline health, performance, and system metrics in real-time.',
              features: [
                'Real-time Monitoring - Live system metrics',
                'Performance Dashboards - Visual performance indicators',
                'Anomaly Detection - Automatic issue detection',
                'Custom Alerts - Configure custom alert rules'
              ],
              usage: 'Keep track of your data infrastructure health and performance.',
              tips: [
                'Set up alerts for critical metrics',
                'Review performance trends regularly',
                'Use anomaly detection to catch issues early'
              ]
            }
          }
        ],
        expanded: false,
        info: {
          title: 'System Observability',
          description: 'Monitor and observe your data infrastructure health and performance.',
          features: [
            'Real-time Monitoring - Live system metrics',
            'Performance Tracking - Monitor system performance',
            'Alerting - Get notified of issues',
            'Audit Trails - Track system activities'
          ],
          usage: 'Use observability tools to monitor system health and performance.',
          tips: [
            'Set up alerts for critical metrics',
            'Regular monitoring prevents issues',
            'Use audit logs for compliance'
          ]
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        children: [
          { 
            label: 'Profile', 
            icon: 'pi pi-user', 
            url: '/profile',
            info: {
              title: 'User Profile',
              description: 'Manage your personal profile, preferences, and account settings.',
              features: [
                'Personal Information - Update your profile details',
                'Preferences - Customize your experience',
                'Security Settings - Manage account security',
                'Notification Settings - Configure alerts and notifications'
              ],
              usage: 'Customize your account and preferences for a personalized experience.',
              tips: [
                'Keep your profile information current',
                'Review security settings regularly',
                'Customize notifications to reduce noise'
              ]
            }
          },
          { 
            label: 'Preferences', 
            icon: 'pi pi-sliders-h', 
            url: '/settings',
            info: {
              title: 'System Preferences',
              description: 'Configure system-wide settings and preferences for your organization.',
              features: [
                'Theme Settings - Customize the interface theme',
                'Language Settings - Change interface language',
                'Default Settings - Set system defaults',
                'Integration Settings - Configure external integrations'
              ],
              usage: 'Configure system preferences and default settings.',
              tips: [
                'Set themes that work well for your team',
                'Configure defaults to speed up common tasks',
                'Test integration settings before deploying'
              ]
            }
          }
        ],
        expanded: false,
        info: {
          title: 'System Settings',
          description: 'Configure personal preferences and system settings.',
          features: [
            'User Profile - Manage your profile settings',
            'Preferences - Customize your experience',
            'Security - Configure security settings',
            'Notifications - Manage notification preferences'
          ],
          usage: 'Customize your account settings and system preferences.',
          tips: [
            'Keep your profile updated',
            'Review security settings regularly',
            'Customize notifications to reduce noise'
          ]
        }
      }
    ];
  }

  toggleItem(item: MenuItem): void {
    // Toggle expanded state
    if ('expanded' in item) {
      item.expanded = !item.expanded;
    } else {
      item.expanded = true;
    }

    // Prevent event bubbling
    event?.stopPropagation();
  }

  handleMenuClick(event: Event, item: MenuItem): void {
    // Prevent event bubbling to avoid conflicts
    event.preventDefault();
    event.stopPropagation();

    if (item.children && !this.collapsed) {
      // Toggle submenu for items with children
      this.toggleItem(item);
    } else if (item.url) {
      // Navigate for direct menu items
      this.navigateTo(item.url);
    }
  }

  navigateTo(url?: string): void {
    if (url) {
      // Split URL and query params
      const [basePath, queryString] = url.split('?');
      const queryParams = this.getQueryParams(url);

      this.router.navigate([basePath], { queryParams });

      // Close sidebar on mobile after navigation
      if (window.innerWidth < 1024) {
        this.toggle.emit();
      }
    }
  }

  getQueryParams(url: string): any {
    if (!url || !url.includes('?')) {
      return {};
    }

    const queryString = url.split('?')[1];
    const params: any = {};

    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = value;
    });

    return params;
  }

  showInfo(event: Event, item: MenuItem): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (item.info) {
      this.selectedInfo = item.info;
      this.infoDialogVisible = true;
    }
  }

  hideInfo(): void {
    this.infoDialogVisible = false;
    this.selectedInfo = null;
  }
}

interface MenuItem {
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  expanded?: boolean;
  badge?: string;
  info?: MenuInfo;
  highlighted?: boolean;
  type?: 'separator' | 'item';
}

interface MenuInfo {
  title: string;
  description: string;
  features: string[];
  usage: string;
  tips?: string[];
}
