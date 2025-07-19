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
        type: 'item',
        children: [
          { label: 'Dashboard', url: '/dashboard', icon: 'pi pi-home' },
          { label: 'Overview', url: '/overview', icon: 'pi pi-chart-pie' },
          { label: 'Domain Catalog', url: '/data-mesh/domains', icon: 'pi pi-book' },
          { label: 'Data Product', url: '/data-mesh/data-products', icon: 'pi pi-shopping-cart' },
          { label: 'API Explorer', url: '/data-mesh/api-explorer', icon: 'pi pi-code' },
          { label: 'Data Lineage', url: '/data-mesh/lineage', icon: 'pi pi-share-alt' },
          { label: 'Quality Metrics', url: '/data-mesh/quality', icon: 'pi pi-chart-bar' },
          { label: 'Data Contracts', url: '/data-contracts', icon: 'pi pi-file-check' }
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
        type: 'item',
        children: [
          { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' },
          { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
          { label: 'Roles', url: '/governance/roles', icon: 'pi pi-users' },
          { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
          { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
          { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
          { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' }
        ],
        expanded: false,
        info: {
          title: 'Governance',
          description: 'Manage data policies, permissions, and roles.',
          features: ['Policies', 'Permissions', 'Roles', 'Teams', 'Users', 'Accounts', 'Assets'],
          usage: 'Define and enforce data governance policies.'
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
      {
        label: 'Discovery',
        icon: 'pi pi-search',
        type: 'item',
        children: [
          { label: 'Data Catalog', url: '/discovery/data-catalog', icon: 'pi pi-list' },
          { label: 'Explore Data', url: '/explore', icon: 'pi pi-compass' }
        ],
        expanded: false,
        info: {
          title: 'Discovery',
          description: 'Discover and explore data assets.',
          features: ['Data Catalog', 'Explore Data'],
          usage: 'Find and preview data assets.'
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
          },
          { 
            label: 'Alerts', 
            icon: 'pi pi-bell', 
            url: '/observability/alert',
            info: {
              title: 'Alerts',
              description: 'Configure and manage alerts for system and data pipeline events.',
              features: [
                'Custom Alert Rules',
                'Notification Channels',
                'Alert History',
                'Integration with Monitoring'
              ],
              usage: 'Set up and manage alerts to stay informed about system events.',
              tips: [
                'Configure notification channels for critical alerts',
                'Review alert history for troubleshooting',
                'Integrate alerts with monitoring for full coverage'
              ]
            }
          },
          { 
            label: 'Metrics', 
            icon: 'pi pi-chart-bar', 
            url: '/observability/metrics',
            info: {
              title: 'Metrics',
              description: 'Track and analyze system and data metrics for performance and reliability.',
              features: [
                'Metric Dashboards',
                'Trend Analysis',
                'Custom Metrics',
                'Export Options'
              ],
              usage: 'Monitor key metrics to ensure system reliability and performance.',
              tips: [
                'Set up dashboards for important metrics',
                'Analyze trends to identify issues early',
                'Export metrics for reporting and analysis'
              ]
            }
          },
          { 
            label: 'Audit Logs', 
            icon: 'pi pi-file', 
            url: '/observability/audit-log',
            info: {
              title: 'Audit Logs',
              description: 'Track system activities and changes for compliance and troubleshooting.',
              features: [
                'Activity Tracking',
                'Change History',
                'Compliance Reports',
                'Export Logs'
              ],
              usage: 'Review audit logs to ensure compliance and investigate issues.',
              tips: [
                'Regularly review logs for suspicious activity',
                'Export logs for compliance audits',
                'Use filters to find relevant events quickly'
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
        label: 'Explore',
        icon: 'pi pi-compass',
        url: '/explore',
        info: {
          title: 'Explore',
          description: 'Explore data and analytics.',
          features: ['Data Exploration'],
          usage: 'Discover new data insights.'
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
      {
        label: 'Integrations',
        icon: 'pi pi-cloud',
        type: 'item',
        children: [
          {
          label: 'Airflow',
          icon: 'pi pi-send',
          url: '/integrations/airflow',
          info: {
            title: 'Apache Airflow',
            description: 'Orchestrate, schedule, and monitor workflows with Airflow.',
            features: [
            'Workflow Orchestration',
            'Task Scheduling',
            'Monitoring & Logging',
            'Integration with Data Mesh'
            ],
            usage: 'Manage and monitor your data pipelines using Airflow.',
            tips: [
            'Use DAGs for complex workflows',
            'Monitor task status regularly',
            'Integrate Airflow with your data mesh for end-to-end orchestration'
            ]
          }
          },
          {
          label: 'Google Cloud',
          icon: 'pi pi-google',
          url: '/integrations/google-cloud',
          info: {
            title: 'Google Cloud Platform',
            description: 'Cloud infrastructure, storage, and analytics services.',
            features: [
            'BigQuery Analytics',
            'Cloud Storage',
            'IAM & Security',
            'Integration with Data Mesh'
            ],
            usage: 'Leverage Google Cloud for scalable data storage and analytics.',
            tips: [
            'Use BigQuery for fast analytics',
            'Secure your data with IAM policies',
            'Integrate GCP with your mesh for hybrid cloud'
            ]
          }
          },
          {
          label: 'Databricks',
          icon: 'pi pi-database',
          url: '/integrations/databricks',
          info: {
            title: 'Databricks',
            description: 'Unified analytics platform for big data and AI.',
            features: [
            'Spark-based Analytics',
            'Collaborative Notebooks',
            'ML & AI Integration',
            'Integration with Data Mesh'
            ],
            usage: 'Run scalable analytics and machine learning workloads.',
            tips: [
            'Use collaborative notebooks for team productivity',
            'Integrate Databricks with mesh for unified data access',
            'Monitor cluster performance for cost optimization'
            ]
          }
          }
        ],
        expanded: false,
        info: {
          title: 'Integrations',
          description: 'Connect and manage external platforms and services.',
          features: [
          'Workflow Orchestration',
          'Cloud Analytics',
          'Unified Data Access'
          ],
          usage: 'Access and manage integrations with external platforms.',
          tips: [
          'Regularly review integration health',
          'Leverage cloud services for scalability',
          'Centralize monitoring for all platforms'
          ]
        }
      },
      {
        label: 'separator',
        type: 'separator'
      },
    ];
  }

  toggleItem(item: MenuItem, event?: Event): void {
    // Toggle expanded state only for items with children
    if (item.children) {
      item.expanded = !item.expanded;
    }
    // Prevent event bubbling if event is provided
    event?.stopPropagation();
  }

  handleMenuClick(event: Event, item: MenuItem): void {
    // Prevent event bubbling to avoid conflicts
    event.preventDefault();
    event.stopPropagation();

    if (item.children && !this.collapsed) {
      // Toggle submenu for items with children
      this.toggleItem(item, event);
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
