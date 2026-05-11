import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'maintenance';
  transactions: number;
  successRate: number;
  lastTransaction: Date;
  fees: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'crypto';
  enabled: boolean;
  popularity: number;
  processingFee: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  customer: string;
  timestamp: Date;
  gateway: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    ProgressBarModule,
    ChartModule,
    TableModule,
    TabViewModule,
    InputTextModule,
    DropdownModule,
    ToggleButtonModule,
    FormsModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  activeTab: number = 0;
  paymentGateways: PaymentGateway[] = [];
  paymentMethods: PaymentMethod[] = [];
  recentTransactions: Transaction[] = [];
  chartData: any;
  chartOptions: any;

  securitySettings = {
    threeDSecure: true,
    fraudDetection: true,
    pciCompliance: true
  };

  notificationSettings = {
    failedPayments: true,
    highValue: true,
    gatewayIssues: true
  };

  processingLimits = {
    dailyLimit: '10000',
    singleMax: '5000',
    monthlyLimit: '200000'
  };

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' }
  ];

  methodTypeOptions = [
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Debit Card', value: 'debit_card' },
    { label: 'Digital Wallet', value: 'digital_wallet' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Cryptocurrency', value: 'crypto' }
  ];

  ngOnInit() {
    this.loadPaymentGateways();
    this.loadPaymentMethods();
    this.loadRecentTransactions();
    this.initChart();
  }

  loadPaymentGateways() {
    // Mock data - replace with actual API call
    this.paymentGateways = [
      {
        id: '1',
        name: 'Stripe Gateway',
        provider: 'Stripe',
        status: 'active',
        transactions: 15420,
        successRate: 98.5,
        lastTransaction: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        fees: '2.9% + $0.30'
      },
      {
        id: '2',
        name: 'PayPal Express',
        provider: 'PayPal',
        status: 'active',
        transactions: 8920,
        successRate: 97.2,
        lastTransaction: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        fees: '2.9% + $0.49'
      },
      {
        id: '3',
        name: 'Square Payments',
        provider: 'Square',
        status: 'maintenance',
        transactions: 5670,
        successRate: 96.8,
        lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        fees: '2.6% + $0.10'
      },
      {
        id: '4',
        name: 'Authorize.Net',
        provider: 'Authorize.Net',
        status: 'inactive',
        transactions: 0,
        successRate: 0,
        lastTransaction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        fees: '2.9% + $0.45'
      }
    ];
  }

  loadPaymentMethods() {
    // Mock data - replace with actual API call
    this.paymentMethods = [
      {
        id: '1',
        name: 'Visa',
        type: 'credit_card',
        enabled: true,
        popularity: 85,
        processingFee: 2.9
      },
      {
        id: '2',
        name: 'Mastercard',
        type: 'credit_card',
        enabled: true,
        popularity: 78,
        processingFee: 2.9
      },
      {
        id: '3',
        name: 'American Express',
        type: 'credit_card',
        enabled: true,
        popularity: 45,
        processingFee: 3.5
      },
      {
        id: '4',
        name: 'PayPal',
        type: 'digital_wallet',
        enabled: true,
        popularity: 62,
        processingFee: 2.9
      },
      {
        id: '5',
        name: 'Apple Pay',
        type: 'digital_wallet',
        enabled: true,
        popularity: 38,
        processingFee: 2.9
      },
      {
        id: '6',
        name: 'ACH Transfer',
        type: 'bank_transfer',
        enabled: false,
        popularity: 15,
        processingFee: 1.0
      }
    ];
  }

  loadRecentTransactions() {
    // Mock data - replace with actual API call
    this.recentTransactions = [
      {
        id: 'TXN-001',
        amount: 299.99,
        currency: 'USD',
        method: 'Visa',
        status: 'success',
        customer: 'John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        gateway: 'Stripe'
      },
      {
        id: 'TXN-002',
        amount: 149.50,
        currency: 'USD',
        method: 'PayPal',
        status: 'success',
        customer: 'Jane Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 12),
        gateway: 'PayPal'
      },
      {
        id: 'TXN-003',
        amount: 89.99,
        currency: 'USD',
        method: 'Mastercard',
        status: 'failed',
        customer: 'Bob Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        gateway: 'Stripe'
      },
      {
        id: 'TXN-004',
        amount: 499.00,
        currency: 'USD',
        method: 'American Express',
        status: 'pending',
        customer: 'Alice Brown',
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        gateway: 'Stripe'
      }
    ];
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
      labels: ['Visa', 'Mastercard', 'PayPal', 'Amex', 'Apple Pay', 'ACH'],
      datasets: [
        {
          label: 'Transaction Volume ($)',
          backgroundColor: [
            '#1f77b4',
            '#ff7f0e',
            '#2ca02c',
            '#d62728',
            '#9467bd',
            '#8c564b'
          ],
          borderColor: [
            '#1f77b4',
            '#ff7f0e',
            '#2ca02c',
            '#d62728',
            '#9467bd',
            '#8c564b'
          ],
          data: [45000, 38000, 28000, 15000, 12000, 3000]
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            callback: function (value: any) {
              return '$' + value.toLocaleString();
            }
          },
          grid: {
            color: surfaceBorder
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'maintenance': return 'warning';
      default: return 'info';
    }
  }

  getTransactionStatusSeverity(status: string): string {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'danger';
      case 'pending': return 'warning';
      case 'refunded': return 'info';
      default: return 'info';
    }
  }

  getMethodTypeLabel(type: string): string {
    const option = this.methodTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ago`;
    }
  }

  togglePaymentMethod(method: PaymentMethod) {
    // In a real app, this would make an API call to update the method status
    method.enabled = !method.enabled;
  }

  addNewGateway() {
    // Implementation for adding new payment gateway
    console.log('Add new gateway clicked');
  }

  configureGateway(gateway: PaymentGateway) {
    // Implementation for configuring gateway settings
    console.log('Configure gateway:', gateway.name);
  }

  getTotalVolume(): number {
    // Calculate total volume from recent transactions
    return this.recentTransactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getSuccessRate(): number {
    const total = this.recentTransactions.length;
    const success = this.recentTransactions.filter(t => t.status === 'success').length;
    return total > 0 ? Math.round((success / total) * 100) : 0;
  }

  getTotalTransactions(): number {
    return this.recentTransactions.length;
  }

  getFailedTransactions(): number {
    return this.recentTransactions.filter(t => t.status === 'failed').length;
  }

  getMethodIcon(type: string): string {
    switch (type) {
      case 'credit_card': return 'pi pi-credit-card';
      case 'debit_card': return 'pi pi-credit-card';
      case 'digital_wallet': return 'pi pi-wallet';
      case 'bank_transfer': return 'pi pi-building-columns';
      case 'crypto': return 'pi pi-bitcoin';
      default: return 'pi pi-credit-card';
    }
  }
}
