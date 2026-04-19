import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../services/chat.service';
import { TelegramBotProfile, TelegramSettings, TelegramWebhook } from '../../models/chat.model';
import { CHAT_WORKSPACE_LINKS } from '../shared/chat-workspace.config';

@Component({
  selector: 'app-chat-bot-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, SkeletonModule, TagModule, ToastModule],
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
  webhook: TelegramWebhook | null = null;
  webhookUrl = '';
  secretToken = '';
  settingWebhook = false;

  readonly workspaceLinks = CHAT_WORKSPACE_LINKS;
  readonly nativeMediaEndpoints = [
    {
      title: 'Send photo',
      path: '/telegram/messages/send-photo',
      tone: 'sky',
      summary: 'Native Telegram endpoint for photo delivery with caption, spoiler flag, inline keyboard, thread routing, and native Bot API passthrough.',
      curls: [
        `curl -X POST "{{BASE_URL}}/telegram/messages/send-photo" ^
  -H "Content-Type: application/json" ^
  -d "{\\"chat_id\\":123456789,\\"photo\\":\\"https://images.unsplash.com/photo-1506744038136-46273834b3fb\\",\\"caption\\":\\"*Photo test*\\",\\"parse_mode\\":\\"Markdown\\"}"`,
        `curl -X POST "{{BASE_URL}}/telegram/messages/send-photo" ^
  -H "Content-Type: application/json" ^
  -d "{\\"chat_id\\":123456789,\\"photo\\":\\"https://images.unsplash.com/photo-1506744038136-46273834b3fb\\",\\"caption\\":\\"Open site\\",\\"reply_markup\\":{\\"inline_keyboard\\":[[{\\"text\\":\\"Visit\\",\\"url\\":\\"https://thienhang.com\\"}]]}}"`
      ],
      payloadExample: `{
  "chat_id": 123456789,
  "photo": "https://example.com/photo.jpg",
  "caption": "Hello",
  "parse_mode": "Markdown",
  "caption_entities": [],
  "reply_markup": {
    "inline_keyboard": [
      [
        {
          "text": "Open",
          "url": "https://thienhang.com"
        }
      ]
    ]
  },
  "disable_notification": false,
  "protect_content": false,
  "has_spoiler": false,
  "message_thread_id": 12,
  "reply_parameters": {
    "message_id": 100
  },
  "native_payload": {
    "allow_sending_without_reply": true
  }
}`
    },
    {
      title: 'Send document',
      path: '/telegram/messages/send-document',
      tone: 'orange',
      summary: 'Native Telegram endpoint for file delivery with caption, content-type detection control, protected content, and native Bot API passthrough.',
      curls: [
        `curl -X POST "{{BASE_URL}}/telegram/messages/send-document" ^
  -H "Content-Type: application/json" ^
  -d "{\\"chat_id\\":123456789,\\"document\\":\\"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\\",\\"caption\\":\\"Document test\\"}"`,
        `curl -X POST "{{BASE_URL}}/telegram/messages/send-document" ^
  -H "Content-Type: application/json" ^
  -d "{\\"chat_id\\":123456789,\\"document\\":\\"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\\",\\"caption\\":\\"Protected doc\\",\\"protect_content\\":true,\\"native_payload\\":{\\"allow_sending_without_reply\\":true}}"`
      ],
      payloadExample: `{
  "chat_id": 123456789,
  "document": "https://example.com/file.pdf",
  "caption": "File here",
  "parse_mode": "Markdown",
  "caption_entities": [],
  "disable_content_type_detection": false,
  "reply_markup": null,
  "disable_notification": false,
  "protect_content": false,
  "message_thread_id": 12,
  "reply_parameters": {
    "message_id": 100
  },
  "native_payload": {
    "allow_sending_without_reply": true
  }
}`
    }
  ];

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.loading = true;
    forkJoin({
      profile: this.chatService.getTelegramProfile(),
      settings: this.chatService.getTelegramSettings(),
      webhook: this.chatService.getTelegramWebhookStatus()
    }).subscribe({
      next: ({ profile, settings, webhook }) => {
        this.profile = profile.data;
        this.settings = settings.data;
        this.webhook = webhook.data;
        this.webhookUrl = webhook.data?.url || '';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Telegram bot settings', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load Telegram bot settings' });
      }
    });
  }

  setWebhook(): void {
    if (!this.webhookUrl.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid URL', detail: 'Please enter a valid webhook URL' });
      return;
    }
    this.settingWebhook = true;
    this.chatService.setTelegramWebhook(this.webhookUrl.trim(), this.secretToken.trim() || undefined).subscribe({
      next: (response) => {
        if (response.data) {
          this.webhook = response.data;
          this.messageService.add({ severity: 'success', summary: 'Webhook Set', detail: 'Telegram webhook has been updated successfully' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: response.message || 'Unable to set webhook' });
        }
        this.settingWebhook = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Server error while setting webhook' });
        this.settingWebhook = false;
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
      },
      {
        label: 'Native media APIs',
        value: this.nativeMediaEndpoints.length,
        caption: 'Photo and document delivery endpoints are available for immediate testing.',
        icon: 'pi pi-send',
        tone: 'sky'
      }
    ];
  }
}
