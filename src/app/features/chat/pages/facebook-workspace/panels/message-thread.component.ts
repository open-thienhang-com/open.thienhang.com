import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { TelegramConversation, TelegramMessage } from '../../../models/chat.model';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  template: `
    <div #messageThread class="message-thread omni-message-thread">
      <div *ngIf="loadingMore" class="flex justify-center py-3">
        <p-skeleton width="12rem" height="1.5rem"></p-skeleton>
      </div>
      <div *ngIf="hasMore && !loadingMore" class="flex justify-center py-2">
        <button type="button" class="ghost-action text-xs" (click)="emitLoadOlder()">
          <i class="pi pi-arrow-up mr-1"></i>Load earlier messages
        </button>
      </div>

      <div *ngFor="let message of conversation?.messages" class="message-row" [class.is-agent]="message.sender !== 'user'">
        <div class="message-bubble">
          <div class="message-meta">
            <span>{{ message.sender_name }}</span>
            <span>|</span>
            <span>{{ message.message_type }}</span>
            <span>|</span>
            <span>{{ message.timestamp | date:'shortTime' }}</span>
          </div>
          <div *ngIf="isImageMessage(message)" class="message-media-shell">
            <img [src]="getImageUrl(message)!" alt="Shared image" class="message-image" />
          </div>
          <a *ngIf="getDocumentUrl(message) as docUrl"
             [href]="docUrl"
             target="_blank"
             rel="noreferrer"
             class="message-document-link">
            <i class="pi pi-file"></i>
            <span>Open document</span>
          </a>
          <p *ngIf="getMessageBody(message)">{{ getMessageBody(message) }}</p>
        </div>
      </div>
    </div>
  `
})
export class MessageThreadComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() conversation: TelegramConversation | null = null;
  @Input() loadingMore = false;
  @Input() hasMore = false;

  @Output() loadOlderMessages = new EventEmitter<void>();

  @ViewChild('messageThread') messageThread?: ElementRef<HTMLDivElement>;

  private scrollListener?: () => void;
  private prevScrollHeight = 0;
  private pendingScrollRestore = false;

  ngAfterViewInit(): void {
    this.scheduleScrollToBottom();
    if (this.hasMore) this.attachScrollListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const convChange = changes['conversation'];
    if (convChange) {
      const prev: TelegramConversation | null = convChange.previousValue;
      const curr: TelegramConversation | null = convChange.currentValue;

      if (!prev || prev.id !== curr?.id) {
        this.detachScrollListener();
        setTimeout(() => {
          this.scrollToBottom();
          if (this.hasMore) this.attachScrollListener();
        });
      } else if (this.pendingScrollRestore && curr && prev) {
        this.pendingScrollRestore = false;
        requestAnimationFrame(() => {
          const container = this.messageThread?.nativeElement;
          if (container) {
            container.scrollTop = container.scrollHeight - this.prevScrollHeight;
          }
        });
      }
    }

    if (changes['hasMore']) {
      if (this.hasMore) {
        this.attachScrollListener();
      } else {
        this.detachScrollListener();
      }
    }
  }

  ngOnDestroy(): void {
    this.detachScrollListener();
  }

  scrollToBottom(): void {
    const container = this.messageThread?.nativeElement;
    if (container) container.scrollTop = container.scrollHeight;
  }

  private scheduleScrollToBottom(): void {
    requestAnimationFrame(() => this.scrollToBottom());
  }

  emitLoadOlder(): void {
    const container = this.messageThread?.nativeElement;
    this.prevScrollHeight = container?.scrollHeight ?? 0;
    this.pendingScrollRestore = true;
    this.loadOlderMessages.emit();
  }

  private attachScrollListener(): void {
    this.detachScrollListener();
    const container = this.messageThread?.nativeElement;
    if (!container) return;
    this.scrollListener = () => {
      if (container.scrollTop === 0 && !this.loadingMore && this.hasMore) {
        this.emitLoadOlder();
      }
    };
    container.addEventListener('scroll', this.scrollListener);
  }

  private detachScrollListener(): void {
    const container = this.messageThread?.nativeElement;
    if (container && this.scrollListener) {
      container.removeEventListener('scroll', this.scrollListener);
    }
    this.scrollListener = undefined;
  }

  isImageMessage(message: TelegramMessage): boolean {
    return this.getImageUrl(message) !== null;
  }

  getImageUrl(message: TelegramMessage): string | null {
    const candidate = (message.media_url || this.extractUrl(message.content) || '').trim();
    if (!candidate) return null;
    const lowered = candidate.toLowerCase();
    if (message.message_type === 'photo') return candidate;
    if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(lowered)) return candidate;
    if (lowered.includes('images.unsplash.com') || lowered.includes('imgur.com')) return candidate;
    return null;
  }

  getDocumentUrl(message: TelegramMessage): string | null {
    if (message.message_type !== 'document') return null;
    return (message.media_url || this.extractUrl(message.content) || '').trim() || null;
  }

  getMessageBody(message: TelegramMessage): string {
    if (message.caption?.trim()) return message.caption.trim();
    if (message.message_type === 'photo' || message.message_type === 'document') {
      const url = message.media_url || this.extractUrl(message.content);
      if (url && message.content.trim() === url.trim()) return '';
    }
    return message.content;
  }

  private extractUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    const match = value.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
  }
}
