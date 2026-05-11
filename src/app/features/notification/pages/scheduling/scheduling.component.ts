import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-notification-scheduling',
  standalone: true,
  imports: [
    CommonModule, CardModule, ProgressBarModule, ButtonModule, TagModule, ChartModule
  ],
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss']
})
export class NotificationSchedulingComponent implements OnInit, OnDestroy {
  refreshInterval: any;
  lastUpdate = new Date();
  
  chartData: any;
  chartOptions: any;

  metrics = [
    { name: 'Email Throughput', value: 45, max: 100, unit: 'req/min', color: '#3b82f6' },
    { name: 'SMS Throughput', value: 12, max: 50, unit: 'req/min', color: '#10b981' },
    { name: 'FCM Push Queue', value: 85, max: 1000, unit: 'msgs', color: '#f59e0b' },
    { name: 'Worker Utilization', value: 28, max: 100, unit: '%', color: '#8b5cf6' }
  ];

  rawMetrics = `
# HELP notification_sent_total Total notifications sent
# TYPE notification_sent_total counter
notification_sent_total{channel="email",status="success"} 1245
notification_sent_total{channel="email",status="failed"} 23
notification_sent_total{channel="sms",status="success"} 856
notification_sent_total{channel="sms",status="failed"} 12

# HELP notification_queue_depth Current depth of message queues
# TYPE notification_queue_depth gauge
notification_queue_depth{priority="high"} 0
notification_queue_depth{priority="normal"} 14
notification_queue_depth{priority="low"} 120
  `;

  ngOnInit(): void {
    this.initChart();
    this.refreshInterval = setInterval(() => {
      this.simulateMetricsUpdate();
    }, 3000);
  }

  initChart(): void {
    const textColor = '#4b5563';
    const surfaceBorder = '#f3f4f6';

    this.chartData = {
        labels: ['1min', '2min', '3min', '4min', '5min', '6min', '7min', '8min', '9min', '10min'],
        datasets: [
            {
                label: 'System Load',
                data: [30, 45, 62, 55, 78, 92, 85, 70, 65, 80],
                fill: true,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                pointRadius: 0
            }
        ]
    };

    this.chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                display: false
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

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  simulateMetricsUpdate(): void {
    this.metrics = this.metrics.map(m => ({
      ...m,
      value: Math.max(0, m.value + (Math.random() * 10 - 5))
    }));
    this.lastUpdate = new Date();
  }

  refreshNow(): void {
    this.simulateMetricsUpdate();
  }
}
