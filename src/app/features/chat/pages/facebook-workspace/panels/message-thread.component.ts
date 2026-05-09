import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges, signal, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { TelegramConversation, TelegramMessage, InternalNote, QuickReply } from '../../../models/chat.model';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [CommonModule, SkeletonModule, FormsModule],
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

      <div *ngIf="internalNotes().length > 0" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        <div style="padding: 0.75rem 1rem; background: #FEF3C7; border-left: 3px solid #F59E0B; margin-bottom: 0.5rem;">
          <span style="font-weight: 600; color: #92400e;">Ghi chú nội bộ</span>
        </div>
        @for (note of internalNotes(); track note.id) {
          <div style="padding: 0.75rem 1rem; background: #FEF3C7; border-left: 3px solid #F59E0B; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 0.25rem;">
                <strong>{{ note.author_name }}</strong> • {{ note.created_at | date:'short' }}
              </div>
              <p style="margin: 0; color: #1F2937;">{{ note.content }}</p>
            </div>
            <button type="button" style="background: none; border: none; color: #9CA3AF; cursor: pointer; font-size: 16px; padding: 0 0.5rem;"
                    (click)="deleteNote(note.id)" title="Delete note">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        }
      </div>

      <div style="position: relative;">
        <div *ngIf="showQuickReply()" style="background:white;border:1px solid #e5e7eb;border-radius:6px;max-height:200px;overflow-y:auto;z-index:100;margin-bottom: 0.5rem;">
          @for (r of filteredReplies(); track r.id) {
            <div style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f3f4f6;"
                 (click)="selectQuickReply(r)">
              <span style="color:#6B7280;font-size:12px;">/{{ r.shortcut }}</span>
              <span style="margin-left:8px;font-size:13px;">{{ r.content | slice:0:60 }}</span>
            </div>
          }
        </div>
      </div>

      <div style="padding: 1rem; border-top: 1px solid #e5e7eb; background: #f9fafb;">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
          <button type="button"
                  [style.background]="noteMode() ? '#f3f4f6' : '#3B82F6'"
                  [style.color]="noteMode() ? '#6B7280' : 'white'"
                  style="flex: 1; padding: 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;"
                  (click)="noteMode.set(false)">
            Trả lời
          </button>
          <button type="button"
                  [style.background]="noteMode() ? '#3B82F6' : '#f3f4f6'"
                  [style.color]="noteMode() ? 'white' : '#6B7280'"
                  style="flex: 1; padding: 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;"
                  (click)="noteMode.set(true)">
            Ghi chú
          </button>
        </div>
        <textarea [(ngModel)]="composerText"
                  style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 14px; resize: vertical; min-height: 80px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
                  [style.background]="noteMode() ? '#FFFBEB' : 'white'"
                  [attr.placeholder]="noteMode() ? 'Ghi chú nội bộ — không gửi cho khách...' : 'Nhập tin nhắn...'"
                  (keydown)="onTextareaKeydown($event)"></textarea>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
          <button type="button"
                  style="background: #3B82F6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;"
                  (click)="noteMode() ? addNote() : sendMessage()">
            Gửi
          </button>
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

  private chatService = inject(ChatService);

  // Feature 1: Internal Notes
  internalNotes = signal<InternalNote[]>([]);
  noteMode = signal(false);
  composerText = '';

  // Feature 3: Quick Replies
  quickReplies = signal<QuickReply[]>([]);
  showQuickReply = signal(false);
  quickReplyFilter = signal('');
  filteredReplies = computed(() => {
    const filter = this.quickReplyFilter().toLowerCase();
    return this.quickReplies().filter(r => r.shortcut.toLowerCase().includes(filter));
  });

  ngAfterViewInit(): void {
    this.scheduleScrollToBottom();
    if (this.hasMore) this.attachScrollListener();
    this.loadQuickReplies();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const convChange = changes['conversation'];
    if (convChange) {
      const prev: TelegramConversation | null = convChange.previousValue;
      const curr: TelegramConversation | null = convChange.currentValue;

      if (!prev || prev.id !== curr?.id) {
        this.detachScrollListener();
        this.loadInternalNotes();
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

  // Feature 1: Internal Notes Implementation
  private loadInternalNotes(): void {
    if (!this.conversation?.id) return;
    this.chatService.getTelegramConversationDetail(this.conversation.id).subscribe({
      next: (response) => {
        const raw = response.data?.internal_notes || [];
        // Map TelegramInternalNote → InternalNote (backend stores as {id,author_name,content,created_at})
        const notes: InternalNote[] = (raw as any[]).map((n, i) => ({
            id: n.id ?? `note-${i}`,
            author_id: n.author_id ?? '',
            author_name: n.author_name ?? 'Agent',
            content: n.content ?? n.note ?? '',
            created_at: n.created_at ?? '',
        }));
        this.internalNotes.set(notes);
      },
      error: () => {
        this.internalNotes.set([]);
      }
    });
  }

  addNote(): void {
    if (!this.composerText.trim() || !this.conversation?.id) return;
    this.chatService.addInternalNote(this.conversation.id, this.composerText.trim()).subscribe({
      next: (response) => {
        const newNote = response.data;
        this.internalNotes.update(notes => [...notes, newNote]);
        this.composerText = '';
      },
      error: () => {
        alert('Failed to add note');
      }
    });
  }

  deleteNote(noteId: string): void {
    if (!this.conversation?.id) return;
    this.chatService.deleteInternalNote(this.conversation.id, noteId).subscribe({
      next: () => {
        this.internalNotes.update(notes => notes.filter(n => n.id !== noteId));
      },
      error: () => {
        alert('Failed to delete note');
      }
    });
  }

  // Feature 3: Quick Replies Implementation
  private loadQuickReplies(): void {
    this.chatService.getQuickReplies().subscribe({
      next: (response) => {
        this.quickReplies.set(response.data || []);
      },
      error: () => {
        this.quickReplies.set([]);
      }
    });
  }

  onTextareaKeydown(event: KeyboardEvent): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;

    if (value.startsWith('/')) {
      const parts = value.split(/\s+/);
      const firstPart = parts[0];
      const filterText = firstPart.substring(1);
      this.quickReplyFilter.set(filterText);
      this.showQuickReply.set(true);
    } else {
      this.showQuickReply.set(false);
    }
  }

  selectQuickReply(reply: QuickReply): void {
    this.composerText = reply.content;
    this.showQuickReply.set(false);
    this.quickReplyFilter.set('');
  }

  sendMessage(): void {
    if (!this.composerText.trim()) return;
    console.log('Sending message:', this.composerText);
    this.composerText = '';
  }
}
