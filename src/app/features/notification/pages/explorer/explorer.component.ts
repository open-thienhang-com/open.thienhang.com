import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

import { NotificationService, NotificationTemplate } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-notification-explorer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, InputTextModule, DropdownModule, SkeletonModule, TagModule, TooltipModule, ToastModule,
    PaginatorModule
  ],
  providers: [MessageService],
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class NotificationExplorerComponent implements OnInit {
  templates: NotificationTemplate[] = [];
  loading = false;
  searchQuery = '';
  selectedChannel = '';
  showSettings = false;
  apiUrl = '';
  authToken = '';

  // Pagination
  totalRecords = 0;
  rows = 12;
  page = 1;

  stats = {
    total: 0,
    email: 0,
    sms: 0,
    push: 0
  };

  channels = [
    { label: 'All Channels', value: '' },
    { label: 'Email Service', value: 'email' },
    { label: 'SMS Gateway', value: 'sms' },
    { label: 'Webhook / Push', value: 'http_push' },
    { label: 'WebSocket', value: 'websocket' },
    { label: 'gRPC', value: 'grpc' }
  ];

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiUrl = this.notificationService.getBaseUrl();
    this.authToken = this.notificationService.getAuthToken();
    this.loadTemplates();
  }

  onPageChange(event: any): void {
    this.page = (event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadTemplates();
  }

  onFilter(): void {
    this.page = 1;
    this.loadTemplates();
  }

  onCreate(): void {
    this.router.navigate(['/notification/templates/create']);
  }

  onEdit(template: NotificationTemplate): void {
    this.router.navigate(['/notification/templates/create'], { queryParams: { code: template.code, locale: template.locale, channel: template.channel, view: 'detail' } });
  }

  applySettings(): void {
    this.notificationService.setBaseUrl(this.apiUrl);
    this.notificationService.setAuthToken(this.authToken);
    this.showSettings = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Settings Applied',
      detail: 'API configuration updated successfully.'
    });
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    const params = {
      page: this.page,
      size: this.rows,
      code: this.searchQuery, // The backend ListByFilter uses 'code' for filtering
      channel: this.selectedChannel
    };

    this.notificationService.getTemplates(params).subscribe({
      next: (resp) => {
        this.templates = resp.data?.list || [];
        this.totalRecords = resp.data?.total || 0;
        this.computeStats();
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load templates. Is the backend running?'
        });
        this.loading = false;
      }
    });
  }

  computeStats(): void {
    this.stats = {
      total: this.templates.length,
      email: this.templates.filter(t => t.channel === 'email').length,
      sms: this.templates.filter(t => t.channel === 'sms').length,
      push: this.templates.filter(t => t.channel === 'http_push').length
    };
  }

  get filteredTemplates(): NotificationTemplate[] {
    return this.templates.filter(t => {
      const matchesSearch = !this.searchQuery || 
        t.code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (t.subject && t.subject.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchesChannel = !this.selectedChannel || t.channel === this.selectedChannel;
      return matchesSearch && matchesChannel;
    });
  }

  getChannelIcon(channel: string): string {
    switch (channel) {
      case 'email': return 'pi pi-envelope';
      case 'sms': return 'pi pi-phone';
      case 'http_push': return 'pi pi-send';
      default: return 'pi pi-bell';
    }
  }

  getChannelSeverity(channel: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (channel) {
      case 'email': return 'info';
      case 'sms': return 'success';
      case 'http_push': return 'warning';
      default: return 'secondary';
    }
  }
}
