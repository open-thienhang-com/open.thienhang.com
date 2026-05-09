import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TelegramConversation, TelegramMessage } from '../../../models/chat.model';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [CommonModule, DatePipe],
  host: { style: 'display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;' },
  styles: [`
    .msg-scroll {
      flex: 1; min-height: 0; overflow-y: auto;
      display: flex; flex-direction: column; gap: 0.5rem;
      padding: 1rem 1.25rem;
      scroll-behavior: smooth;
    }
    .load-older {
      display: flex; justify-content: center; padding-bottom: 0.5rem; flex-shrink: 0;
    }
    .load-older-btn {
      font: inherit; cursor: pointer; font-size: 0.75rem; font-weight: 600;
      color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0;
      border-radius: 999px; padding: 0.3rem 0.9rem;
      display: inline-flex; align-items: center; gap: 0.4rem;
    }
    .load-older-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .msg-row {
      display: flex; align-items: flex-end; gap: 0.5rem;
    }
    .msg-row.out { flex-direction: row-reverse; }
    .msg-av {
      width: 1.8rem; height: 1.8rem; border-radius: 50%;
      background: #e2e8f0; color: #64748b;
      font-size: 0.68rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-bottom: 2px;
    }
    .msg-av.agent-av { background: #dbeafe; color: #1d4ed8; }
    .msg-bub {
      max-width: 68%;
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 16px 16px 16px 4px;
      padding: 0.55rem 0.8rem;
    }
    .msg-row.out .msg-bub {
      background: #2563eb; border-color: #2563eb;
      border-radius: 16px 16px 4px 16px;
    }
    .msg-who {
      font-size: 0.68rem; font-weight: 700; color: #64748b;
      margin-bottom: 0.15rem; display: block;
    }
    .msg-text {
      margin: 0; font-size: 0.875rem; line-height: 1.5;
      color: #0f172a; overflow-wrap: anywhere; white-space: pre-wrap;
    }
    .msg-row.out .msg-text { color: #fff; }
    .msg-time { display: block; font-size: 0.68rem; color: #94a3b8; margin-top: 0.25rem; }
    .msg-row.out .msg-time { color: rgba(255,255,255,0.55); }
    .msg-img {
      display: block; width: 100%; max-height: 220px; object-fit: cover;
      border-radius: 10px; margin-bottom: 0.35rem;
    }
    .msg-doc {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.82rem; color: #2563eb; text-decoration: none; font-weight: 600;
      padding: 0.3rem 0; margin-bottom: 0.2rem;
    }
    .msg-row.out .msg-doc { color: rgba(255,255,255,0.9); }
    .msg-date-sep {
      display: flex; align-items: center; gap: 0.75rem;
      margin: 0.5rem 0; flex-shrink: 0;
    }
    .msg-date-sep span {
      font-size: 0.72rem; font-weight: 600; color: #94a3b8;
      white-space: nowrap;
    }
    .msg-date-sep::before, .msg-date-sep::after {
      content: ''; flex: 1; height: 1px; background: #e2e8f0;
    }
    .empty-thread {
      flex: 1; display: flex; align-items: center; justify-content: center;
      color: #94a3b8; font-size: 0.875rem;
    }
  `],
  template: `
    <div #messageThread class="msg-scroll">
      <!-- Load older -->
      <div *ngIf="hasMore || loadingMore" class="load-older">
        <button type="button" class="load-older-btn"
                (click)="emitLoadOlder()" [disabled]="loadingMore">
          <i [class]="loadingMore ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-up'"></i>
          {{ loadingMore ? 'Loading...' : 'Older messages' }}
        </button>
      </div>

      <!-- Empty -->
      <div *ngIf="!conversation?.messages?.length" class="empty-thread">
        <span>No messages yet</span>
      </div>

      <!-- Messages -->
      <ng-container *ngFor="let msg of conversation?.messages; let i = index">
        <!-- Date separator when day changes -->
        <div *ngIf="shouldShowDate(msg, i)" class="msg-date-sep">
          <span>{{ msg.timestamp | date:'dd/MM/yyyy' }}</span>
        </div>

        <div class="msg-row" [class.out]="msg.sender !== 'user'">
          <div class="msg-av" [class.agent-av]="msg.sender !== 'user'">
            {{ getInitial(msg, conversation) }}
          </div>
          <div class="msg-bub">
            <span *ngIf="msg.sender !== 'user'" class="msg-who">{{ msg.sender_name }}</span>
            <img *ngIf="getImageUrl(msg)" [src]="getImageUrl(msg)!" alt="" class="msg-img" />
            <a *ngIf="getDocumentUrl(msg) as docUrl" [href]="docUrl"
               target="_blank" rel="noreferrer" class="msg-doc">
              <i class="pi pi-file"></i> Open document
            </a>
            <p *ngIf="getMessageBody(msg)" class="msg-text">{{ getMessageBody(msg) }}</p>
            <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class MessageThreadComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() conversation: TelegramConversation | null = null;
  @Input() loadingMore = false;
  @Input() hasMore = false;
  @Output() loadOlderMessages = new EventEmitter<void>();

  @ViewChild('messageThread') private messageThread?: ElementRef<HTMLDivElement>;

  private scrollListener?: () => void;
  private prevScrollHeight = 0;
  private pendingScrollRestore = false;

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.scrollToBottom());
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
      } else if (this.pendingScrollRestore) {
        this.pendingScrollRestore = false;
        requestAnimationFrame(() => {
          const el = this.messageThread?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight - this.prevScrollHeight;
        });
      }
    }
    if (changes['hasMore']) {
      this.hasMore ? this.attachScrollListener() : this.detachScrollListener();
    }
  }

  ngOnDestroy(): void {
    this.detachScrollListener();
  }

  scrollToBottom(): void {
    const el = this.messageThread?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  emitLoadOlder(): void {
    const el = this.messageThread?.nativeElement;
    this.prevScrollHeight = el?.scrollHeight ?? 0;
    this.pendingScrollRestore = true;
    this.loadOlderMessages.emit();
  }

  private attachScrollListener(): void {
    this.detachScrollListener();
    const el = this.messageThread?.nativeElement;
    if (!el) return;
    this.scrollListener = () => {
      if (el.scrollTop === 0 && !this.loadingMore && this.hasMore) this.emitLoadOlder();
    };
    el.addEventListener('scroll', this.scrollListener);
  }

  private detachScrollListener(): void {
    const el = this.messageThread?.nativeElement;
    if (el && this.scrollListener) el.removeEventListener('scroll', this.scrollListener);
    this.scrollListener = undefined;
  }

  shouldShowDate(msg: TelegramMessage, index: number): boolean {
    if (index === 0) return true;
    const prev = this.conversation?.messages?.[index - 1];
    if (!prev) return false;
    const d1 = new Date(msg.timestamp).toDateString();
    const d2 = new Date(prev.timestamp).toDateString();
    return d1 !== d2;
  }

  getInitial(msg: TelegramMessage, conv: TelegramConversation | null): string {
    if (msg.sender !== 'user') return (msg.sender_name || 'A').charAt(0).toUpperCase();
    return (conv?.user_name || '?').charAt(0).toUpperCase();
  }

  getImageUrl(msg: TelegramMessage): string | null {
    const url = (msg.media_url || this.extractUrl(msg.content) || '').trim();
    if (!url) return null;
    if (msg.message_type === 'photo') return url;
    if (/\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(url)) return url;
    return null;
  }

  getDocumentUrl(msg: TelegramMessage): string | null {
    if (msg.message_type !== 'document') return null;
    return (msg.media_url || this.extractUrl(msg.content) || '').trim() || null;
  }

  getMessageBody(msg: TelegramMessage): string {
    if (msg.caption?.trim()) return msg.caption.trim();
    if (msg.message_type === 'photo' || msg.message_type === 'document') {
      const url = msg.media_url || this.extractUrl(msg.content);
      if (url && msg.content?.trim() === url.trim()) return '';
    }
    return msg.content || '';
  }

  private extractUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    const m = value.match(/https?:\/\/[^\s]+/i);
    return m ? m[0] : null;
  }
}
