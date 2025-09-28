import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { KnobModule } from 'primeng/knob';
import { TimelineModule } from 'primeng/timeline';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/component/breadcrumb/breadcrumb.component';

interface DashboardMetrics {
  totalDomains: number;
  activeDataProducts: number;
  dataQualityScore: number;
  complianceRate: number;
  apiCalls: number;
  totalUsers: number;
}

interface DomainOverview {
  name: string;
  dataProducts: number;
  qualityScore: number;
  usage: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ChartModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    ProgressBarModule,
    TableModule,
    AvatarModule,
    KnobModule,
    TimelineModule,
    BreadcrumbComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics = {
    totalDomains: 0,
    activeDataProducts: 0,
    dataQualityScore: 0,
    complianceRate: 0,
    apiCalls: 0,
    totalUsers: 0
  };

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Dashboard', active: true }
  ];

  domainOverview: DomainOverview[] = [];
  recentActivities: RecentActivity[] = [];

  // Chart data
  qualityTrendData: any;
  usageDistributionData: any;
  domainHealthData: any;
  complianceData: any;

  // Chart options
  chartOptions: any;

  loading = true;

  ngOnInit() {
    this.loadDashboardData();
    this.initializeCharts();
  }

  loadDashboardData() {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      this.metrics = {
        totalDomains: 8,
        activeDataProducts: 45,
        dataQualityScore: 87,
        complianceRate: 94,
        apiCalls: 1250000,
        totalUsers: 156
      };

      this.domainOverview = [
        {
          name: 'Customer Experience',
          dataProducts: 12,
          qualityScore: 92,
          usage: 88,
          status: 'healthy'
        },
        {
          name: 'Financial Services',
          dataProducts: 8,
          qualityScore: 78,
          usage: 75,
          status: 'warning'
        },
        {
          name: 'Supply Chain',
          dataProducts: 15,
          qualityScore: 72,
          usage: 82,
          status: 'warning'
        },
        {
          name: 'Product Analytics',
          dataProducts: 6,
          qualityScore: 65,
          usage: 45,
          status: 'critical'
        },
        {
          name: 'Marketing Intelligence',
          dataProducts: 10,
          qualityScore: 85,
          usage: 92,
          status: 'healthy'
        }
      ];

      this.recentActivities = [
        {
          id: '1',
          type: 'Data Quality',
          description: 'Quality score improved for Customer Journey Analytics',
          timestamp: new Date('2024-01-15T10:30:00'),
          user: 'Sarah Johnson',
          icon: 'pi-chart-line',
          color: '#4CAF50'
        },
        {
          id: '2',
          type: 'Policy Update',
          description: 'New data retention policy applied to Financial domain',
          timestamp: new Date('2024-01-15T09:15:00'),
          user: 'Michael Chen',
          icon: 'pi-shield',
          color: '#2196F3'
        },
        {
          id: '3',
          type: 'Data Product',
          description: 'New data product "Customer Segmentation" deployed',
          timestamp: new Date('2024-01-14T16:45:00'),
          user: 'Emma Williams',
          icon: 'pi-database',
          color: '#FF9800'
        },
        {
          id: '4',
          type: 'Compliance',
          description: 'GDPR compliance check completed for all domains',
          timestamp: new Date('2024-01-14T14:20:00'),
          user: 'David Kim',
          icon: 'pi-verified',
          color: '#9C27B0'
        }
      ];

      this.loading = false;
    }, 1000);
  }

  initializeCharts() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    // Quality Trend Chart
    this.qualityTrendData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Data Quality Score',
          data: [82, 85, 83, 86, 89, 87],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Compliance Rate',
          data: [88, 90, 92, 91, 93, 94],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Usage Distribution Chart
    this.usageDistributionData = {
      labels: ['Customer Experience', 'Financial Services', 'Supply Chain', 'Product Analytics', 'Marketing'],
      datasets: [
        {
          label: 'API Calls (thousands)',
          data: [450, 320, 580, 200, 380],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ]
        }
      ]
    };

    // Domain Health Chart
    this.domainHealthData = {
      labels: ['Healthy', 'Warning', 'Critical'],
      datasets: [
        {
          data: [3, 2, 1],
          backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
        }
      ]
    };

    // Compliance Chart
    this.complianceData = {
      labels: ['GDPR', 'SOX', 'HIPAA', 'PCI DSS'],
      datasets: [
        {
          label: 'Compliance Score',
          data: [95, 88, 92, 90],
          backgroundColor: '#2196F3'
        }
      ]
    };
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'info';
    }
  }

  navigateTo(path: string) {
    // Navigation logic
  }
}
