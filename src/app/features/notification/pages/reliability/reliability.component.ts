import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-notification-reliability',
  standalone: true,
  imports: [
    CommonModule, TableModule, TagModule, ButtonModule, CardModule, ProgressBarModule, ChartModule
  ],
  templateUrl: './reliability.component.html',
  styleUrls: ['./reliability.component.scss']
})
export class NotificationReliabilityComponent implements OnInit {
  chartData: any;
  chartOptions: any;

  circuitBreakers = [
    { name: 'Email Dispatcher (SendGrid)', status: 'Closed', failureRate: 0.02, lastFailure: '2 hours ago', color: '#10b981' },
    { name: 'SMS Gateway (Twilio)', status: 'Closed', failureRate: 0.05, lastFailure: '1 day ago', color: '#10b981' },
    { name: 'FCM Push Service', status: 'Half-Open', failureRate: 0.45, lastFailure: '15 mins ago', color: '#f59e0b' }
  ];

  dlqItems = [
    { id: 'msg_98231', channel: 'Email', recipient: 'john.doe@example.com', lastError: 'SMTP Timeout (Retry 5/5)', retries: 5, createdAt: new Date() },
    { id: 'msg_98235', channel: 'SMS', recipient: '+84912345678', lastError: 'Invalid Phone Format', retries: 1, createdAt: new Date() }
  ];

  ngOnInit(): void {
    this.initChart();
  }

  initChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = '#4b5563';
    const surfaceBorder = '#f3f4f6';

    this.chartData = {
        labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        datasets: [
            {
                label: 'Email Success',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: true,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                tension: 0.4,
                borderWidth: 3
            },
            {
                label: 'SMS Success',
                data: [28, 48, 40, 19, 86, 27, 90],
                fill: true,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                tension: 0.4,
                borderWidth: 3
            }
        ]
    };

    this.chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColor,
                    font: { size: 10, weight: 'bold' }
                },
                grid: {
                    display: false
                }
            },
            y: {
                ticks: {
                    color: textColor,
                    font: { size: 10, weight: 'bold' }
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status.toLowerCase()) {
      case 'closed': return 'success';
      case 'open': return 'danger';
      case 'half-open': return 'warning';
      default: return 'secondary';
    }
  }
}
