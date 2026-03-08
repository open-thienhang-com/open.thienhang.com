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
import { TelegramBroadcast, TelegramCommand, TelegramDashboard } from '../../models/chat.model';
import { CHAT_WORKSPACE_LINKS } from '../shared/chat-workspace.config';

@Component({
  selector: 'app-chat-automation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, SkeletonModule, TagModule, ToastModule],
  templateUrl: './chat-automation.component.html',
  styleUrl: './chat-automation.component.scss',
  providers: [MessageService]
})
export class ChatAutomationComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = false;
  creating = false;

  dashboard: TelegramDashboard | null = null;
  commands: TelegramCommand[] = [];
  broadcasts: TelegramBroadcast[] = [];

  readonly workspaceLinks = CHAT_WORKSPACE_LINKS;

  form = {
    name: '',
    message: '',
    targetStatus: 'active',
    targetTags: '',
    scheduledAt: '',
    recipientCountEstimate: 0
  };

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    forkJoin({
      dashboard: this.chatService.getTelegramDashboard(),
      commands: this.chatService.getTelegramCommands(),
      broadcasts: this.chatService.getTelegramBroadcasts()
    }).subscribe({
      next: ({ dashboard, commands, broadcasts }) => {
        this.dashboard = dashboard.data;
        this.commands = commands.data || [];
        this.broadcasts = broadcasts.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Telegram automation', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load Telegram automation data' });
      }
    });
  }

  createBroadcast(): void {
    if (!this.form.name.trim() || !this.form.message.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'Name and message are required.' });
      return;
    }

    this.creating = true;
    this.chatService.createTelegramBroadcast({
      name: this.form.name.trim(),
      message: this.form.message.trim(),
      target_status: this.form.targetStatus.trim(),
      target_tags: this.parseTags(this.form.targetTags),
      scheduled_at: this.form.scheduledAt.trim(),
      recipient_count_estimate: Number(this.form.recipientCountEstimate) || 0
    }).subscribe({
      next: (response) => {
        this.broadcasts = [response.data, ...this.broadcasts];
        this.creating = false;
        this.form = {
          name: '',
          message: '',
          targetStatus: 'active',
          targetTags: '',
          scheduledAt: '',
          recipientCountEstimate: 0
        };
        this.messageService.add({ severity: 'success', summary: 'Broadcast created', detail: response.data.name });
      },
      error: (error) => {
        console.error('Error creating Telegram broadcast', error);
        this.creating = false;
        this.messageService.add({ severity: 'error', summary: 'Create failed', detail: 'Unable to create Telegram broadcast' });
      }
    });
  }

  isWorkspaceLinkActive(route: string): boolean {
    if (route === '/chat') {
      return this.router.url === '/chat' || this.router.url === '/chat/telegram-workspace';
    }
    return this.router.url === route;
  }

  get overviewCards() {
    return [
      {
        label: 'Commands',
        value: this.commands.length,
        caption: 'Slash commands currently registered for Telegram support.',
        icon: 'pi pi-slash',
        tone: 'blue'
      },
      {
        label: 'Broadcasts',
        value: this.broadcasts.length,
        caption: 'Broadcast jobs defined for operational communication.',
        icon: 'pi pi-megaphone',
        tone: 'purple'
      },
      {
        label: 'Auto reply',
        value: this.dashboard?.bot.auto_reply ? 'Enabled' : 'Disabled',
        caption: 'Use this page to manage automation assets, not the live inbox.',
        icon: 'pi pi-bolt',
        tone: 'emerald'
      },
      {
        label: 'Pending human',
        value: this.dashboard?.counters.pending_human ?? 0,
        caption: 'Conversations currently waiting for agent handoff.',
        icon: 'pi pi-user-plus',
        tone: 'orange'
      }
    ];
  }

  private parseTags(value: string): string[] {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
}
