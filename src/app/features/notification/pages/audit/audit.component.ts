import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { NotificationService, AuditLog } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-notification-audit',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class NotificationAuditComponent implements OnInit {
  logs: AuditLog[] = [];
  loading = false;
  totalRecords = 0;
  rows = 10;
  first = 0;

  stats = {
    total: 0,
    success: 0,
    failed: 0,
    rate: 0
  };

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Initial load will be triggered by p-table onLazyLoad
  }

  loadLogs(event?: any): void {
    this.loading = true;
    const page = event ? (event.first / event.rows) + 1 : 1;
    const size = event ? event.rows : this.rows;

    this.notificationService.getAuditLogs({ page, size }).subscribe({
      next: (resp) => {
        this.logs = resp.data?.list || [];
        this.totalRecords = resp.data?.total || 0;
        this.computeStats();
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load audit logs'
        });
        this.loading = false;
      }
    });
  }

  computeStats(): void {
    // Since we are lazy loading, we might only have stats for the current page
    // For local demo, we'll just use the current page's data
    const total = this.logs.length;
    const success = this.logs.filter(l => l.status === 'delivered' || l.status === 'sent' || l.status === 'success').length;
    const failed = this.logs.filter(l => l.status === 'failed' || l.status === 'error').length;
    
    this.stats = {
      total: this.totalRecords, // Real total
      success: success,
      failed: failed,
      rate: total > 0 ? Math.round((success / total) * 100) : 0
    };
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'sent':
      case 'success': return 'success';
      case 'pending':
      case 'queued': return 'warning';
      case 'failed':
      case 'error': return 'danger';
      default: return 'secondary';
    }
  }

  getChannelIcon(channel: string): string {
    switch (channel.toLowerCase()) {
      case 'email': return 'pi pi-envelope';
      case 'sms': return 'pi pi-phone';
      default: return 'pi pi-send';
    }
  }
}
