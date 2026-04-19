import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../services/chat.service';
import { TelegramDashboard, TelegramWebhook } from '../../models/chat.model';
import { CHAT_WORKSPACE_LINKS } from '../shared/chat-workspace.config';

@Component({
  selector: 'app-chat-delivery-health',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SkeletonModule, ToastModule],
  templateUrl: './chat-delivery-health.component.html',
  styleUrl: './chat-delivery-health.component.scss',
  providers: [MessageService]
})
export class ChatDeliveryHealthComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = false;
  dashboard: TelegramDashboard | null = null;
  webhook: TelegramWebhook | null = null;

  readonly workspaceLinks = CHAT_WORKSPACE_LINKS;

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    forkJoin({
      dashboard: this.chatService.getTelegramDashboard(),
      webhook: this.chatService.getTelegramWebhookStatus()
    }).subscribe({
      next: ({ dashboard, webhook }) => {
        this.dashboard = dashboard.data;
        this.webhook = webhook.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Telegram delivery health', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load Telegram delivery health' });
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
    return [
      {
        label: 'Webhook',
        value: this.webhook?.enabled ? 'Connected' : 'Disconnected',
        caption: 'Operational delivery health for incoming Telegram updates.',
        icon: 'pi pi-shield',
        tone: this.webhook?.enabled ? 'emerald' : 'orange'
      },
      {
        label: 'Pending updates',
        value: this.webhook?.pending_update_count ?? 0,
        caption: 'Updates still waiting to be processed from Telegram.',
        icon: 'pi pi-sync',
        tone: 'blue'
      },
      {
        label: 'Unread messages',
        value: this.dashboard?.counters.unread_messages ?? 0,
        caption: 'Queue pressure in the support inbox.',
        icon: 'pi pi-inbox',
        tone: 'purple'
      },
      {
        label: 'Last sync',
        value: this.webhook?.last_sync_at ? new Date(this.webhook.last_sync_at).toLocaleString() : 'No sync yet',
        caption: 'Use this screen for diagnostics instead of the live chat area.',
        icon: 'pi pi-clock',
        tone: 'orange'
      }
    ];
  }
}
