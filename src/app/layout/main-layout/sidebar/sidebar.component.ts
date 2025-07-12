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
        icon: 'pi pi-objects-column',
        url: '/dashboard'
      },
      {
        label: 'Data Products',
        icon: 'pi pi-database',
        url: '/data-product'
      },
      {
        label: 'Data Mesh',
        icon: 'pi pi-sitemap',
        children: [
          { label: 'Data Contracts', icon: 'pi pi-file-check', url: '/data-contracts' },
          { label: 'Domain Catalog', icon: 'pi pi-book', url: '/domains' },
          { label: 'Lineage Explorer', icon: 'pi pi-share-alt', url: '/data-mesh/lineage' },
          { label: 'Quality Metrics', icon: 'pi pi-chart-bar', url: '/data-mesh/quality' },
        ],
        expanded: false
      },
      {
        label: 'Governance',
        icon: 'pi pi-shield',
        info: {
          title: 'Data Governance',
          description: 'Comprehensive data governance tools to ensure data quality, compliance, and security across your organization.',
          features: [
            'Policy Management - Create and enforce data governance policies',
            'Asset Discovery - Catalog and manage data assets',
            'Permission Control - Fine-grained access control',
            'Role Management - Define and assign governance roles'
          ],
          usage: 'Use governance tools to establish data standards, ensure compliance, and maintain data quality throughout your data lifecycle.',
          tips: [
            'Start with defining clear data policies before implementing technical controls',
            'Regularly review and update permissions to maintain security',
            'Use asset discovery to maintain an up-to-date data catalog'
          ]
        },
        children: [
          { 
            label: 'Policies', 
            icon: 'pi pi-bookmark', 
            url: '/governance/policies',
            info: {
              title: 'Data Policies',
              description: 'Create, manage, and enforce data governance policies to ensure compliance and data quality standards.',
              features: [
                'Policy Creation - Define custom data governance policies',
                'Policy Enforcement - Automatically apply policies to data assets',
                'Compliance Tracking - Monitor policy adherence and violations',
                'Policy Templates - Use pre-built templates for common scenarios'
              ],
              usage: 'Navigate to view all policies, create new ones, or modify existing policies. Use the detail view to see policy rules and assignments.',
              tips: [
                'Use policy templates to quickly implement common governance patterns',
                'Test policies in development before applying to production data',
                'Review policy effectiveness regularly through compliance reports'
              ]
            }
          },
          { 
            label: 'Assets', 
            icon: 'pi pi-box', 
            url: '/governance/assets',
            info: {
              title: 'Data Assets',
              description: 'Discover, catalog, and manage all data assets across your organization with comprehensive metadata and lineage tracking.',
              features: [
                'Asset Discovery - Automatically discover data assets',
                'Metadata Management - Rich metadata and documentation',
                'Lineage Tracking - Understand data flow and dependencies',
                'Quality Scoring - Assess and improve data quality'
              ],
              usage: 'Browse your data assets, view detailed metadata, track lineage, and manage asset lifecycle from creation to retirement.',
              tips: [
                'Keep asset metadata up-to-date for better discoverability',
                'Use tags and classifications to organize assets',
                'Regular quality assessments help maintain data integrity'
              ]
            }
          },
          { 
            label: 'Permissions', 
            icon: 'pi pi-key', 
            url: '/governance/permissions',
            info: {
              title: 'Permissions Management',
              description: 'Fine-grained access control system to manage who can access what data and perform which operations.',
              features: [
                'Granular Permissions - Define specific access rights',
                'Permission Inheritance - Hierarchical permission structure',
                'Audit Trail - Track permission changes and usage',
                'Bulk Management - Efficiently manage multiple permissions'
              ],
              usage: 'Define permissions for different data assets and operations, assign them to users or roles, and monitor access patterns.',
              tips: [
                'Follow the principle of least privilege for security',
                'Use permission groups for easier management',
                'Regular permission audits help maintain security'
              ]
            }
          },
          { 
            label: 'Roles', 
            icon: 'pi pi-users', 
            url: '/governance/roles',
            info: {
              title: 'Role Management',
              description: 'Define and manage roles with specific permissions to streamline access control and ensure consistent governance.',
              features: [
                'Role Definition - Create custom roles with specific permissions',
                'Role Assignment - Assign roles to users and teams',
                'Role Hierarchy - Establish role inheritance patterns',
                'Role Analytics - Monitor role usage and effectiveness'
              ],
              usage: 'Create roles that match your organizational structure, assign appropriate permissions, and manage role assignments.',
              tips: [
                'Design roles based on job functions rather than individuals',
                'Use role hierarchy to reduce management complexity',
                'Regular role reviews ensure permissions stay current'
              ]
            }
          },
        ],
        expanded: false
      },
      {
        label: 'RBAC Management',
        icon: 'pi pi-id-card',
        info: {
          title: 'Role-Based Access Control',
          description: 'Comprehensive user and team management with role-based access control for secure and scalable authorization.',
          features: [
            'User Management - Create and manage user accounts',
            'Team Organization - Organize users into teams and departments',
            'Account Administration - Comprehensive account lifecycle management',
            'Access Reviews - Regular access certification and reviews'
          ],
          usage: 'Manage user accounts, organize teams, and ensure proper access controls are in place across your organization.',
          tips: [
            'Regular access reviews help maintain security compliance',
            'Use teams to simplify permission management',
            'Implement account lifecycle policies for automated management'
          ]
        },
        children: [
          { 
            label: 'Accounts', 
            icon: 'pi pi-user', 
            url: '/governance/accounts',
            info: {
              title: 'Account Management',
              description: 'Comprehensive account administration including user provisioning, deprovisioning, and account lifecycle management.',
              features: [
                'Account Provisioning - Automated user account creation',
                'Account Deprovisioning - Secure account removal process',
                'Account Lifecycle - Manage account status and transitions',
                'Account Policies - Apply organization-wide account policies'
              ],
              usage: 'Manage user accounts from creation to deletion, apply account policies, and maintain account security standards.',
              tips: [
                'Automate account provisioning to reduce errors',
                'Implement account expiration policies for security',
                'Regular account audits help identify inactive accounts'
              ]
            }
          },
          { 
            label: 'Users', 
            icon: 'pi pi-user-plus', 
            url: '/governance/users',
            info: {
              title: 'User Management',
              description: 'Manage individual users, their profiles, permissions, and role assignments within your organization.',
              features: [
                'User Profiles - Comprehensive user information management',
                'Permission Assignment - Direct user permission management',
                'Role Assignment - Assign multiple roles to users',
                'User Analytics - Track user activity and access patterns'
              ],
              usage: 'View and manage individual users, assign roles and permissions, and monitor user activity across the platform.',
              tips: [
                'Use roles instead of direct permissions for easier management',
                'Keep user profiles updated for better collaboration',
                'Monitor user activity to identify security issues'
              ]
            }
          },
          { 
            label: 'Teams', 
            icon: 'pi pi-users', 
            url: '/governance/teams',
            info: {
              title: 'Team Management',
              description: 'Organize users into teams and departments for streamlined permission management and collaboration.',
              features: [
                'Team Creation - Create and organize teams by department or function',
                'Team Permissions - Assign permissions at the team level',
                'Team Hierarchy - Establish organizational structure',
                'Team Analytics - Monitor team collaboration and access patterns'
              ],
              usage: 'Create teams that reflect your organizational structure, assign team-level permissions, and manage team membership.',
              tips: [
                'Align teams with your organizational structure',
                'Use team permissions to reduce individual management overhead',
                'Regular team reviews ensure proper access controls'
              ]
            }
          },
        ],
        expanded: false
      },
      {
        label: 'Discovery',
        icon: 'pi pi-search',
        children: [
          { label: 'Data Catalog', icon: 'pi pi-list', url: '/discovery/catalog' },
          { label: 'Schema Registry', icon: 'pi pi-code', url: '/schema-registry' },
          { label: 'API Explorer', icon: 'pi pi-globe', url: '/api-explorer' },
        ],
        expanded: false
      },
      {
        label: 'Explore',
        icon: 'pi pi-compass',
        children: [
          {
            label: 'Database',
            icon: 'pi pi-database',
            url: '/explore/database',
            badge: '8',
          },
          {
            label: 'Pipelines',
            icon: 'pi pi-directions',
            url: '/explore/pipelines',
            badge: '3',
          },
          {
            label: 'Topics',
            icon: 'pi pi-telegram',
            url: '/explore/topics',
            badge: '2',
          },
          {
            label: 'ML Models',
            icon: 'pi pi-chart-line',
            url: '/explore/ml-models',
            badge: '5'
          },
          {
            label: 'Container',
            icon: 'pi pi-box',
            url: '/explore/container',
            badge: '2',
          },
          {
            label: 'Search Indexes',
            icon: 'pi pi-search',
            url: '/explore/search',
            badge: '1',
          },
          {
            label: 'APIs',
            icon: 'pi pi-globe',
            url: '/explore/apis',
            badge: '4',
          }
        ],
        expanded: false
      },
      {
        label: 'Observability',
        icon: 'pi pi-eye',
        children: [
          { label: 'Monitoring', icon: 'pi pi-chart-line', url: '/observability/monitoring' },
          { label: 'Alerting', icon: 'pi pi-bell', url: '/alerting' },
          { label: 'Audit Logs', icon: 'pi pi-history', url: '/audit-logs' },
        ],
        expanded: false
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        children: [
          { label: 'User Profile', icon: 'pi pi-user', url: '/profile' },
          { label: 'Preferences', icon: 'pi pi-sliders-h', url: '/settings' },
          { label: 'Security', icon: 'pi pi-shield', url: '/settings?tab=security' },
          { label: 'Notifications', icon: 'pi pi-bell', url: '/settings?tab=notifications' },
        ],
        expanded: false
      },
    ];
  }

  toggleItem(item: MenuItem): void {
    // Nếu item có thuộc tính expanded, chỉ cần toggle
    if ('expanded' in item) {
      item.expanded = !item.expanded;
    } else {
      // Nếu item chưa có thuộc tính expanded, thêm vào và set giá trị true
      item.expanded = true;
    }

    // Ngăn sự kiện click lan tỏa lên parent
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
}

interface MenuInfo {
  title: string;
  description: string;
  features: string[];
  usage: string;
  tips?: string[];
}
