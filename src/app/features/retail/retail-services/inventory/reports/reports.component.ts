import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';

interface ReportData {
  period: string;
  inbound: number;
  outbound: number;
  netMovement: number;
  value: number;
}

interface TopProduct {
  name: string;
  sku: string;
  totalMovement: number;
  value: number;
  percentage: number;
}

interface StockAlert {
  product: string;
  currentStock: number;
  minStock: number;
  status: 'low' | 'out' | 'over';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CardModule,
    ChartModule,
    TabViewModule,
    BadgeModule,
    MessageModule,
    FileUploadModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  activeTabIndex = 0;

  // Date filters
  dateRange: Date[] = [];
  selectedPeriod: string = 'monthly';

  // Chart data
  movementChartData: any;
  stockChartData: any;
  valueChartData: any;
  topProductsChartData: any;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  // Report data
  movementReport: ReportData[] = [];
  topProducts: TopProduct[] = [];
  stockAlerts: StockAlert[] = [];

  // Summary stats
  totalInbound = 0;
  totalOutbound = 0;
  totalValue = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  periodOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' }
  ];

  constructor() {}

  ngOnInit() {
    this.initializeDefaultDateRange();
    this.loadReports();
  }

  initializeDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
    this.dateRange = [startDate, endDate];
  }

  loadReports() {
    this.loadMovementReport();
    this.loadTopProducts();
    this.loadStockAlerts();
    this.loadChartData();
    this.calculateSummaryStats();
  }

  loadMovementReport() {
    // Mock data - replace with actual API call
    this.movementReport = [
      { period: '2024-07', inbound: 1250, outbound: 1180, netMovement: 70, value: 45250.00 },
      { period: '2024-08', inbound: 1380, outbound: 1320, netMovement: 60, value: 48900.00 },
      { period: '2024-09', inbound: 1420, outbound: 1390, netMovement: 30, value: 51200.00 },
      { period: '2024-10', inbound: 1350, outbound: 1410, netMovement: -60, value: 49800.00 }
    ];
  }

  loadTopProducts() {
    // Mock data
    this.topProducts = [
      { name: 'Product A', sku: 'SKU001', totalMovement: 450, value: 15750.00, percentage: 25.5 },
      { name: 'Product B', sku: 'SKU002', totalMovement: 380, value: 13300.00, percentage: 20.2 },
      { name: 'Product C', sku: 'SKU003', totalMovement: 320, value: 11200.00, percentage: 17.8 },
      { name: 'Product D', sku: 'SKU004', totalMovement: 280, value: 9800.00, percentage: 15.6 },
      { name: 'Product E', sku: 'SKU005', totalMovement: 220, value: 7700.00, percentage: 12.3 }
    ];
  }

  loadStockAlerts() {
    // Mock data
    this.stockAlerts = [
      { product: 'Product F', currentStock: 5, minStock: 10, status: 'low' },
      { product: 'Product G', currentStock: 0, minStock: 15, status: 'out' },
      { product: 'Product H', currentStock: 2, minStock: 5, status: 'low' },
      { product: 'Product I', currentStock: 150, minStock: 100, status: 'over' }
    ];
  }

  loadChartData() {
    // Movement chart
    this.movementChartData = {
      labels: this.movementReport.map(r => r.period),
      datasets: [
        {
          label: 'Inbound',
          data: this.movementReport.map(r => r.inbound),
          backgroundColor: '#42A5F5',
          borderColor: '#42A5F5',
          fill: false
        },
        {
          label: 'Outbound',
          data: this.movementReport.map(r => r.outbound),
          backgroundColor: '#FF7043',
          borderColor: '#FF7043',
          fill: false
        }
      ]
    };

    // Stock alerts chart
    const alertCounts = {
      low: this.stockAlerts.filter(a => a.status === 'low').length,
      out: this.stockAlerts.filter(a => a.status === 'out').length,
      over: this.stockAlerts.filter(a => a.status === 'over').length
    };

    this.stockChartData = {
      labels: ['Low Stock', 'Out of Stock', 'Over Stock'],
      datasets: [{
        data: [alertCounts.low, alertCounts.out, alertCounts.over],
        backgroundColor: ['#FFC107', '#F44336', '#4CAF50'],
        hoverBackgroundColor: ['#FFCA28', '#EF5350', '#66BB6A']
      }]
    };

    // Value chart
    this.valueChartData = {
      labels: this.movementReport.map(r => r.period),
      datasets: [{
        label: 'Movement Value',
        data: this.movementReport.map(r => r.value),
        backgroundColor: '#9C27B0',
        borderColor: '#9C27B0',
        fill: false
      }]
    };

    // Top products chart
    this.topProductsChartData = {
      labels: this.topProducts.map(p => p.name),
      datasets: [{
        label: 'Movement Quantity',
        data: this.topProducts.map(p => p.totalMovement),
        backgroundColor: '#FF9800',
        borderColor: '#FF9800',
        fill: false
      }]
    };
  }

  calculateSummaryStats() {
    this.totalInbound = this.movementReport.reduce((sum, r) => sum + r.inbound, 0);
    this.totalOutbound = this.movementReport.reduce((sum, r) => sum + r.outbound, 0);
    this.totalValue = this.movementReport.reduce((sum, r) => sum + r.value, 0);
    this.lowStockCount = this.stockAlerts.filter(a => a.status === 'low').length;
    this.outOfStockCount = this.stockAlerts.filter(a => a.status === 'out').length;
  }

  onPeriodChange() {
    // Reload data based on selected period
    this.loadReports();
  }

  onDateRangeChange() {
    // Reload data based on date range
    this.loadReports();
  }

  exportReport(format: string) {
    // Implement export functionality
    console.log(`Exporting report in ${format} format`);
  }

  generateReport() {
    // Generate custom report
    this.loadReports();
  }

  getAlertSeverity(status: string): string {
    switch (status) {
      case 'low': return 'warning';
      case 'out': return 'danger';
      case 'over': return 'success';
      default: return 'info';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }
}
