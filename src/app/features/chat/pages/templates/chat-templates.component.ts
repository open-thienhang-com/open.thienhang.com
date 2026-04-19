import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../services/chat.service';
import { TelegramSettings, TelegramTemplate } from '../../models/chat.model';
import { CHAT_WORKSPACE_LINKS } from '../shared/chat-workspace.config';

@Component({
  selector: 'app-chat-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, SkeletonModule, TagModule, ToastModule],
  templateUrl: './chat-templates.component.html',
  styleUrl: './chat-templates.component.scss',
  providers: [MessageService]
})
export class ChatTemplatesComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = false;
  creating = false;

  templates: TelegramTemplate[] = [];
  settings: TelegramSettings | null = null;

  readonly workspaceLinks = CHAT_WORKSPACE_LINKS;

  form = {
    name: '',
    category: 'support',
    content: '',
    enabled: true,
    variablesText: ''
  };

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    forkJoin({
      templates: this.chatService.getTelegramTemplates(),
      settings: this.chatService.getTelegramSettings()
    }).subscribe({
      next: ({ templates, settings }) => {
        this.templates = templates.data || [];
        this.settings = settings.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Telegram templates', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load Telegram templates' });
      }
    });
  }

  createTemplate(): void {
    if (!this.form.name.trim() || !this.form.category.trim() || !this.form.content.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'Name, category, and content are required.' });
      return;
    }

    this.creating = true;
    this.chatService.createTelegramTemplate({
      name: this.form.name.trim(),
      category: this.form.category.trim(),
      content: this.form.content.trim(),
      enabled: this.form.enabled,
      variables: this.parseVariables(this.form.variablesText)
    }).subscribe({
      next: (response) => {
        this.templates = [response.data, ...this.templates];
        this.creating = false;
        this.form = {
          name: '',
          category: 'support',
          content: '',
          enabled: true,
          variablesText: ''
        };
        this.messageService.add({ severity: 'success', summary: 'Template created', detail: response.data.name });
      },
      error: (error) => {
        console.error('Error creating Telegram template', error);
        this.creating = false;
        this.messageService.add({ severity: 'error', summary: 'Create failed', detail: 'Unable to create Telegram template' });
      }
    });
  }

  isWorkspaceLinkActive(route: string): boolean {
    if (route === '/chat') {
      return this.router.url === '/cmc' || this.router.url === '/cmc/telegram-workspace';
    }
    return this.router.url === route;
  }

  get overviewCards() {
    const enabledCount = this.templates.filter(item => item.enabled).length;
    const categories = new Set(this.templates.map(item => item.category)).size;
    const latestUpdate = this.templates[0]?.updated_at;

    return [
      {
        label: 'Templates',
        value: this.templates.length,
        caption: 'Reusable messages available to support agents and bot workflows.',
        icon: 'pi pi-file-edit',
        tone: 'blue'
      },
      {
        label: 'Enabled',
        value: enabledCount,
        caption: 'Templates currently active for Telegram operations.',
        icon: 'pi pi-check-circle',
        tone: 'emerald'
      },
      {
        label: 'Categories',
        value: categories,
        caption: 'Template categories currently maintained by the team.',
        icon: 'pi pi-tags',
        tone: 'purple'
      },
      {
        label: 'Fallback link',
        value: this.settings?.fallback_template_id || 'Not set',
        caption: latestUpdate ? `Latest update ${new Date(latestUpdate).toLocaleString()}.` : 'No templates updated yet.',
        icon: 'pi pi-link',
        tone: 'orange'
      }
    ];
  }

  private parseVariables(value: string): string[] {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
}
