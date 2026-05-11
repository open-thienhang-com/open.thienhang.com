import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';

import { NotificationService } from '../../../../core/services/notification.service';

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
  circuitBreakers: any[] = [];
  dlqItems: any[] = [];
  loading = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.initChart();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.notificationService.getCircuitBreakers().subscribe({
      next: (resp) => {
        this.circuitBreakers = resp.data || [];
      }
    });

    this.notificationService.getDeadLetterQueue().subscribe({
      next: (resp) => {
        this.dlqItems = resp.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
