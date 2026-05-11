import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

import { NotificationService, NotificationTemplate } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-notification-composer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, InputTextModule, InputTextarea, DropdownModule, SelectButtonModule, TooltipModule, ToastModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './composer.component.html',
  styleUrls: ['./composer.component.scss']
})
export class NotificationComposerComponent implements OnInit {
  templates: NotificationTemplate[] = [];
  selectedTemplate: NotificationTemplate | null = null;
  
  // Form State
  recipient = '';
  subject = '';
  body = '';
  channel = 'email'; // default
  
  variables: { name: string, value: string }[] = [];
  
  loading = false;
  sending = false;

  channels = [
    { label: 'Email', value: 'email', icon: 'pi pi-envelope' },
    { label: 'SMS', value: 'sms', icon: 'pi pi-phone' },
    { label: 'Push', value: 'http_push', icon: 'pi pi-send' }
  ];

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    
    // Check for query params (e.g. from Explorer)
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        const checkTemplates = () => {
          if (this.templates.length > 0) {
            const found = this.templates.find(t => 
              t.code === params['code'] && 
              t.locale === params['locale'] && 
              t.channel === params['channel']
            );
            if (found) {
              this.onTemplateSelect(found);
            }
          } else {
            setTimeout(checkTemplates, 100);
          }
        };
        checkTemplates();
      }
    });
  }

  loadTemplates(): void {
    this.loading = true;
    this.notificationService.getTemplates({ size: 100 }).subscribe({ // Load more for composer selection
      next: (resp) => {
        this.templates = resp.data?.list || [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load templates' });
        this.loading = false;
      }
    });
  }

  onTemplateSelect(template: NotificationTemplate | null): void {
    this.selectedTemplate = template;
    if (template) {
      this.subject = template.subject || '';
      this.body = template.body;
      this.channel = template.channel;
      this.extractVariables(template.body + (template.subject || ''));
    } else {
      this.variables = [];
    }
  }

  resetForm(): void {
    this.selectedTemplate = null;
    this.body = '';
    this.subject = '';
    this.recipient = '';
    this.variables = [];
  }

  extractVariables(content: string): void {
    const regex = /\{\{([^}]+)\}\}/g;
    const found: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!found.includes(match[1])) {
        found.push(match[1]);
      }
    }
    this.variables = found.map(v => ({ name: v, value: '' }));
  }

  get injectedBody(): string {
    let result = this.body;
    this.variables.forEach(v => {
      const val = v.value || `{{${v.name}}}`;
      result = result.split(`{{${v.name}}}`).join(val);
    });
    return result;
  }

  get injectedSubject(): string {
    let result = this.subject;
    this.variables.forEach(v => {
      const val = v.value || `{{${v.name}}}`;
      result = result.split(`{{${v.name}}}`).join(val);
    });
    return result;
  }

  send(): void {
    if (!this.recipient) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Recipient is required' });
      return;
    }

    // Map to backend DTO: submitNotificationRequest
    const payload = {
      recipients: [this.recipient], // Backend expects an array
      channel: this.channel,
      subject: this.injectedSubject,
      content: this.injectedBody,    // Backend expects 'content' instead of 'body'
      metadata: this.variables.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}),
      template_code: this.selectedTemplate?.code, // Optional info for tracking
      locale: this.selectedTemplate?.locale
    };

    this.sending = true;
    this.notificationService.sendNotification(payload).subscribe({
      next: (resp) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification dispatched successfully' });
        this.sending = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Dispatch failed: ' + (err.error?.message || err.message) });
        this.sending = false;
      }
    });
  }

  getSafeHtml(html: string): SafeHtml {
    if (!html) return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
