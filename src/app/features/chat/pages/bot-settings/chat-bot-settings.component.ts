import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../services/chat.service';
import { TelegramBotProfile, TelegramSettings } from '../../models/chat.model';
import { CHAT_WORKSPACE_LINKS } from '../shared/chat-workspace.config';

@Component({
  selector: 'app-chat-bot-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SkeletonModule, TagModule, ToastModule],
  templateUrl: './chat-bot-settings.component.html',
  styleUrl: './chat-bot-settings.component.scss',
  providers: [MessageService]
})
export class ChatBotSettingsComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = false;
  profile: TelegramBotProfile | null = null;
  settings: TelegramSettings | null = null;

  readonly workspaceLinks = CHAT_WORKSPACE_LINKS;

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    forkJoin({
      profile: this.chatService.getTelegramProfile(),
      settings: this.chatService.getTelegramSettings()
    }).subscribe({
      next: ({ profile, settings }) => {
        this.profile = profile.data;
        this.settings = settings.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Telegram bot settings', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load Telegram bot settings' });
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
        label: 'Bot name',
        value: this.settings?.bot_name || this.profile?.first_name || 'Unknown',
        caption: 'Public identity exposed to Telegram users.',
        icon: 'pi pi-telegram',
        tone: 'blue'
      },
      {
        label: 'Language',
        value: this.settings?.default_language || 'vi',
        caption: `Timezone ${this.settings?.timezone || 'Asia/Bangkok'}.`,
        icon: 'pi pi-language',
        tone: 'purple'
      },
      {
        label: 'Routing',
        value: this.settings?.enable_human_handoff ? 'Human handoff on' : 'Human handoff off',
        caption: 'Control escalation rules separately from the chat inbox.',
        icon: 'pi pi-share-alt',
        tone: 'emerald'
      },
      {
        label: 'Group chat',
        value: this.settings?.allow_group_chat ? 'Allowed' : 'Disabled',
        caption: 'Decide whether Telegram group chat is part of the channel strategy.',
        icon: 'pi pi-users',
        tone: 'orange'
      }
    ];
  }
}
