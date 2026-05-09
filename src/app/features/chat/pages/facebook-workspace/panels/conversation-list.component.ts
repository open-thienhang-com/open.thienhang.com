import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TelegramConversation } from '../../../models/chat.model';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonModule, TagModule],
  template: `
    <div class="queue-list" style="overflow-y:auto; max-height:calc(100vh - 280px);">
      <div *ngIf="loading && conversations.length === 0" class="p-4">
        <p-skeleton height="4rem" styleClass="mb-2"></p-skeleton>
        <p-skeleton height="4rem" styleClass="mb-2"></p-skeleton>
        <p-skeleton height="4rem"></p-skeleton>
      </div>

      <div *ngIf="!loading && conversations.length > 0" style="padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb;">
        <button type="button"
                style="background: none; border: none; color: #3B82F6; cursor: pointer; font-size: 13px; text-decoration: underline; padding: 0;"
                (click)="markAllRead()">
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <button *ngFor="let conv of conversations"
              type="button"
              class="conversation-row omni-conversation-row"
              [class.active]="selectedId === conv.id"
              [style.fontWeight]="conv.unread_count > 0 ? '600' : 'normal'"
              (click)="selectConversation(conv)">
        <div class="conversation-row-top">
          <div class="conversation-identity">
            <span class="conversation-name" [style.fontWeight]="conv.unread_count > 0 ? '600' : 'normal'">{{ conv.user_name }}</span>
            <span class="conversation-handle">{{ '@' + conv.username }}</span>
            <span *ngIf="conv.unread_count > 0" style="background:#3B82F6;color:white;border-radius:999px;padding:1px 6px;font-size:11px;margin-left:4px;">{{ conv.unread_count }}</span>
          </div>
          <div class="conversation-time-block">
            <span>{{ conv.last_message_time | date:'shortTime' }}</span>
          </div>
        </div>
        <div class="channel-line">
          <span class="source-pill">
            <i [class]="getChannelIcon(conv)"></i>{{ getChannelLabel(conv) }}
          </span>
          <p-tag [value]="conv.status" [severity]="getStatusSeverity(conv.status)"></p-tag>
        </div>
        <p class="conversation-preview" [style.fontWeight]="conv.unread_count > 0 ? '600' : 'normal'">{{ conv.last_message }}</p>
      </button>

      <div *ngIf="!loading && conversations.length === 0" class="empty-card">
        <i class="pi pi-inbox"></i>
        <h3>No conversations</h3>
        <p>Adjust queue or channel filters to find another thread.</p>
      </div>

      <!-- Sentinel for IntersectionObserver lazy load -->
      <div #listSentinel class="py-2 flex justify-center" *ngIf="hasMore">
        <span *ngIf="loading" class="text-xs text-gray-400">Loading more...</span>
      </div>
    </div>
  `
})
export class ConversationListComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() conversations: TelegramConversation[] = [];
  @Input() selectedId: string | null = null;
  @Input() loading = false;
  @Input() hasMore = false;

  @Output() conversationSelected = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('listSentinel') private sentinel?: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;
  private chatService = inject(ChatService);

  ngAfterViewInit(): void {
    this.attachObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hasMore'] || changes['conversations']) {
      setTimeout(() => this.attachObserver());
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private attachObserver(): void {
    this.observer?.disconnect();
    if (!this.sentinel?.nativeElement || !this.hasMore) return;

    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMore && !this.loading) {
        this.loadMore.emit();
      }
    }, { threshold: 0.1 });

    this.observer.observe(this.sentinel.nativeElement);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'secondary' {
    switch (status) {
      case 'active': return 'success';
      case 'pending_human': return 'warning';
      case 'resolved': return 'info';
      default: return 'secondary';
    }
  }

  getChannelIcon(conv: TelegramConversation): string {
    switch ((conv.platform || '').toLowerCase()) {
      case 'facebook': return 'pi pi-facebook mr-1';
      case 'web': return 'pi pi-globe mr-1';
      case 'app': return 'pi pi-mobile mr-1';
      default: return 'pi pi-send mr-1';
    }
  }

  getChannelLabel(conv: TelegramConversation): string {
    switch ((conv.platform || '').toLowerCase()) {
      case 'facebook': return 'Facebook Messenger';
      case 'web': return 'Web Chat';
      case 'app': return 'Mobile App';
      default: return 'Telegram Bot';
    }
  }

  // Feature 2: Read Status Badges Implementation
  selectConversation(conversation: TelegramConversation): void {
    this.conversationSelected.emit(conversation.id);
    this.markConversationRead(conversation);
  }

  private markConversationRead(conversation: TelegramConversation): void {
    if (conversation.unread_count > 0) {
      this.chatService.markConversationRead(conversation.id).subscribe({
        next: () => {
          const index = this.conversations.findIndex(c => c.id === conversation.id);
          if (index !== -1) {
            this.conversations[index].unread_count = 0;
          }
        },
        error: () => {
          // Silently fail, don't block conversation selection
        }
      });
    }
  }

  markAllRead(): void {
    this.chatService.markAllRead().subscribe({
      next: () => {
        this.conversations.forEach(conv => {
          conv.unread_count = 0;
        });
      },
      error: () => {
        alert('Failed to mark all conversations as read');
      }
    });
  }
}
